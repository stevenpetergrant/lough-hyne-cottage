import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoints
  app.get('/', (req, res) => {
    res.status(200).json({ 
      status: 'Lough Hyne Cottage Booking System Ready',
      timestamp: new Date().toISOString(),
      features: ['Cabin booking', 'Payment processing', 'Email confirmations', 'Admin dashboard']
    });
  });

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
  });

  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
  });

  // Check environment configuration
  const hasDatabase = !!process.env.DATABASE_URL;
  const hasStripe = !!(process.env.STRIPE_SECRET_KEY && process.env.VITE_STRIPE_PUBLIC_KEY);
  const hasEmail = !!process.env.SENDGRID_API_KEY;
  const hasSession = !!process.env.SESSION_SECRET;
  const isReady = hasDatabase && hasStripe && hasEmail && hasSession;

  // Status endpoint
  app.get('/api/status', (req, res) => {
    res.json({
      environment: process.env.NODE_ENV || 'development',
      configured: {
        database: hasDatabase,
        stripe: hasStripe,
        email: hasEmail,
        session: hasSession
      },
      ready: isReady
    });
  });

  // Load full booking system if ready
  if (isReady) {
    console.log("All environment variables configured - loading full booking system...");
    try {
      const { registerRoutes: fullRoutes } = await import("./routes");
      return await fullRoutes(app);
    } catch (error) {
      console.error("Failed to load full booking system:", error);
      
      // Fallback message
      app.get('*', (req, res) => {
        if (req.path.startsWith('/api/')) {
          res.status(503).json({ 
            error: 'Booking system initialization failed',
            message: 'Please check server logs'
          });
        } else {
          res.send(`
            <h1>Lough Hyne Cottage</h1>
            <p>Booking system is initializing. Please try again in a moment.</p>
            <p>If this persists, please contact support.</p>
          `);
        }
      });
    }
  } else {
    // Show configuration status if not ready
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        res.status(503).json({ 
          error: 'Configuration incomplete',
          missing: {
            database: !hasDatabase,
            stripe: !hasStripe,
            email: !hasEmail,
            session: !hasSession
          }
        });
      } else {
        res.send(`
          <!DOCTYPE html>
          <html>
          <head><title>Lough Hyne Cottage - Setup</title></head>
          <body style="font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px;">
            <h1>Lough Hyne Cottage Booking System</h1>
            <p>Configuration Status:</p>
            <ul>
              <li>Database: ${hasDatabase ? '✓' : '✗'}</li>
              <li>Payments: ${hasStripe ? '✓' : '✗'}</li>
              <li>Email: ${hasEmail ? '✓' : '✗'}</li>
              <li>Security: ${hasSession ? '✓' : '✗'}</li>
            </ul>
            <p>Add missing environment variables to activate booking system.</p>
          </body>
          </html>
        `);
      }
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}