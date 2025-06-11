import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoints
  app.get('/', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      service: 'Lough Hyne Cottage Booking System',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
  });

  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
  });

  // Check if environment variables are configured
  const hasDatabase = !!process.env.DATABASE_URL;
  const hasStripe = !!(process.env.STRIPE_SECRET_KEY && process.env.VITE_STRIPE_PUBLIC_KEY);
  const hasEmail = !!process.env.SENDGRID_API_KEY;
  const hasSession = !!process.env.SESSION_SECRET;

  // Environment status endpoint
  app.get('/api/status', (req, res) => {
    res.json({
      environment: process.env.NODE_ENV || 'development',
      database: hasDatabase ? 'configured' : 'missing DATABASE_URL',
      stripe: hasStripe ? 'configured' : 'missing STRIPE keys',
      email: hasEmail ? 'configured' : 'missing SENDGRID_API_KEY',
      session: hasSession ? 'configured' : 'missing SESSION_SECRET',
      ready: hasDatabase && hasStripe && hasEmail && hasSession
    });
  });

  // If all environment variables are present, load full routes
  if (hasDatabase && hasStripe && hasEmail && hasSession) {
    try {
      const { registerRoutes: fullRoutes } = await import("./routes");
      console.log("Loading full booking system routes...");
      return await fullRoutes(app);
    } catch (error) {
      console.error("Failed to load full routes:", error);
      // Fall back to basic server
    }
  }

  // Basic configuration instructions if environment missing
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      res.status(503).json({ 
        error: 'Service not fully configured',
        message: 'Please add required environment variables',
        missing: {
          database: !hasDatabase,
          stripe: !hasStripe, 
          email: !hasEmail,
          session: !hasSession
        }
      });
    } else {
      // Serve a basic HTML page for non-API routes
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Lough Hyne Cottage - Configuration Required</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            .status { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .missing { color: #d73027; }
            .configured { color: #1a9641; }
          </style>
        </head>
        <body>
          <h1>Lough Hyne Cottage Booking System</h1>
          <p>Server is running but requires environment configuration.</p>
          
          <div class="status">
            <h3>Configuration Status:</h3>
            <p>Database: <span class="${hasDatabase ? 'configured' : 'missing'}">${hasDatabase ? '✓ Configured' : '✗ Missing DATABASE_URL'}</span></p>
            <p>Payments: <span class="${hasStripe ? 'configured' : 'missing'}">${hasStripe ? '✓ Configured' : '✗ Missing Stripe keys'}</span></p>
            <p>Email: <span class="${hasEmail ? 'configured' : 'missing'}">${hasEmail ? '✓ Configured' : '✗ Missing SENDGRID_API_KEY'}</span></p>
            <p>Security: <span class="${hasSession ? 'configured' : 'missing'}">${hasSession ? '✓ Configured' : '✗ Missing SESSION_SECRET'}</span></p>
          </div>
          
          <p>Add the required environment variables in Railway dashboard, then redeploy to activate the full booking system.</p>
        </body>
        </html>
      `);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}