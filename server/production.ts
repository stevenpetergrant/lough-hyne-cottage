import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health endpoints for Railway
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Lough Hyne Cottage Booking System',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Environment status
app.get('/api/status', (req, res) => {
  const hasDatabase = !!process.env.DATABASE_URL;
  const hasStripe = !!(process.env.STRIPE_SECRET_KEY && process.env.VITE_STRIPE_PUBLIC_KEY);
  const hasEmail = !!process.env.SENDGRID_API_KEY;
  const hasSession = !!process.env.SESSION_SECRET;
  
  res.json({
    environment: process.env.NODE_ENV || 'production',
    configured: {
      database: hasDatabase,
      stripe: hasStripe,
      email: hasEmail,
      session: hasSession
    },
    ready: hasDatabase && hasStripe && hasEmail && hasSession
  });
});

// Basic cottage info
app.get('/api/info', (req, res) => {
  res.json({
    name: "Lough Hyne Cottage",
    location: "Cork, Ireland",
    description: "Eco retreat in Ireland's first marine nature reserve",
    services: ["Cabin rental", "Sauna sessions", "Yoga retreats", "Bread baking courses"],
    contact: "info@loughhynecottage.ie",
    booking: "Available for authentic cottage stays"
  });
});

// Serve static files if they exist
const distPath = path.join(__dirname, '..', 'dist');
try {
  app.use(express.static(distPath));
  console.log(`Serving static files from: ${distPath}`);
} catch (error) {
  console.log("No static files found, serving API only");
}

// Fallback for SPA routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    // Try to serve index.html for SPA routing
    const indexPath = path.join(distPath, 'index.html');
    try {
      res.sendFile(indexPath);
    } catch (error) {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Lough Hyne Cottage</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 40px; }
            .services { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
            .service { background: #f9f9f9; padding: 20px; border-radius: 8px; }
            .contact { background: #e8f4f8; padding: 20px; border-radius: 8px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lough Hyne Cottage</h1>
            <p>Eco Retreat in Ireland's First Marine Nature Reserve</p>
            <p>Cork, Ireland</p>
          </div>
          
          <h2>Our Services</h2>
          <div class="services">
            <div class="service">
              <h3>Cabin Rental</h3>
              <p>Authentic cottage accommodation with stunning views of Lough Hyne</p>
            </div>
            <div class="service">
              <h3>Sauna Sessions</h3>
              <p>Relaxing sauna experiences by the water's edge</p>
            </div>
            <div class="service">
              <h3>Yoga Retreats</h3>
              <p>Peaceful yoga sessions in nature's embrace</p>
            </div>
            <div class="service">
              <h3>Bread Courses</h3>
              <p>Learn traditional bread making techniques</p>
            </div>
          </div>
          
          <div class="contact">
            <h3>Book Your Stay</h3>
            <p>Email: info@loughhynecottage.ie</p>
            <p>Experience sustainable tourism in Ireland's unique marine nature reserve</p>
          </div>
          
          <p><small>Booking system: Configuration in progress</small></p>
        </body>
        </html>
      `);
    }
  }
});

const port = parseInt(process.env.PORT || "3000");
const server = createServer(app);

server.listen(port, "0.0.0.0", () => {
  console.log(`Lough Hyne Cottage production server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  
  const hasDatabase = !!process.env.DATABASE_URL;
  const hasStripe = !!(process.env.STRIPE_SECRET_KEY && process.env.VITE_STRIPE_PUBLIC_KEY);
  const hasEmail = !!process.env.SENDGRID_API_KEY;
  const hasSession = !!process.env.SESSION_SECRET;
  
  console.log(`Configuration status:`);
  console.log(`- Database: ${hasDatabase ? '✓' : '✗'}`);
  console.log(`- Stripe: ${hasStripe ? '✓' : '✗'}`);
  console.log(`- Email: ${hasEmail ? '✓' : '✗'}`);
  console.log(`- Session: ${hasSession ? '✓' : '✗'}`);
});