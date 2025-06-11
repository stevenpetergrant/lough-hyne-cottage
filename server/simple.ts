import express from "express";
import { createServer } from "http";

const app = express();

// Check if all environment variables are present
const hasDatabase = !!process.env.DATABASE_URL;
const hasStripe = !!(process.env.STRIPE_SECRET_KEY && process.env.VITE_STRIPE_PUBLIC_KEY);
const hasEmail = !!process.env.SENDGRID_API_KEY;
const hasSession = !!process.env.SESSION_SECRET;
const isFullyConfigured = hasDatabase && hasStripe && hasEmail && hasSession;

console.log("Environment check:");
console.log(`Database: ${hasDatabase ? '✓' : '✗'}`);
console.log(`Stripe: ${hasStripe ? '✓' : '✗'}`);
console.log(`Email: ${hasEmail ? '✓' : '✗'}`);
console.log(`Session: ${hasSession ? '✓' : '✗'}`);
console.log(`Fully configured: ${isFullyConfigured ? '✓' : '✗'}`);

// If fully configured, load the complete booking system
if (isFullyConfigured) {
  console.log("Loading full booking system...");
  
  // Import and setup the full routes
  import("./routes").then(({ registerRoutes }) => {
    registerRoutes(app).then(() => {
      console.log("Full booking system loaded successfully");
    }).catch((error) => {
      console.error("Error loading full routes:", error);
      setupBasicServer();
    });
  }).catch((error) => {
    console.error("Error importing routes:", error);
    setupBasicServer();
  });
} else {
  console.log("Environment incomplete - running basic server");
  setupBasicServer();
}

function setupBasicServer() {
  // Root path for Railway healthcheck
  app.get('/', (req, res) => {
    if (isFullyConfigured) {
      res.status(200).json({ 
        message: 'Lough Hyne Cottage Booking System Ready',
        status: 'loading',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(200).json({ 
        message: 'Lough Hyne Cottage Booking System',
        status: 'configuration needed',
        timestamp: new Date().toISOString()
      });
    }
  });

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
  });

  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
  });

  // Environment status endpoint
  app.get('/api/status', (req, res) => {
    res.json({
      environment: process.env.NODE_ENV || 'development',
      configured: {
        database: hasDatabase,
        stripe: hasStripe,
        email: hasEmail,
        session: hasSession
      },
      ready: isFullyConfigured
    });
  });

  // Basic info endpoint
  app.get('/api/info', (req, res) => {
    res.json({
      name: "Lough Hyne Cottage",
      location: "Cork, Ireland",
      description: "Eco retreat in Ireland's first marine nature reserve",
      services: ["Cabin rental", "Sauna sessions", "Yoga retreats", "Bread baking courses"],
      contact: "bookings@loughhynecottage.ie"
    });
  });

  // Configuration page for missing environment variables
  app.get('*', (req, res) => {
    if (!isFullyConfigured) {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Lough Hyne Cottage - Configuration</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            .status { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .ready { color: #1a9641; }
            .missing { color: #d73027; }
          </style>
        </head>
        <body>
          <h1>Lough Hyne Cottage Booking System</h1>
          <p>Configuration Status:</p>
          <div class="status">
            <p>Database: <span class="${hasDatabase ? 'ready' : 'missing'}">${hasDatabase ? '✓ Ready' : '✗ Missing DATABASE_URL'}</span></p>
            <p>Payments: <span class="${hasStripe ? 'ready' : 'missing'}">${hasStripe ? '✓ Ready' : '✗ Missing Stripe keys'}</span></p>
            <p>Email: <span class="${hasEmail ? 'ready' : 'missing'}">${hasEmail ? '✓ Ready' : '✗ Missing SENDGRID_API_KEY'}</span></p>
            <p>Security: <span class="${hasSession ? 'ready' : 'missing'}">${hasSession ? '✓ Ready' : '✗ Missing SESSION_SECRET'}</span></p>
          </div>
          <p>Add missing environment variables in Railway dashboard to activate the full booking system.</p>
        </body>
        </html>
      `);
    } else {
      res.send('<h1>Lough Hyne Cottage</h1><p>Booking system is loading...</p>');
    }
  });

  const port = parseInt(process.env.PORT || "3000");
  const server = createServer(app);

  server.listen(port, "0.0.0.0", () => {
    console.log(`Lough Hyne Cottage server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}