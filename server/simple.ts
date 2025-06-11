import express from "express";
import { createServer } from "http";

const app = express();

// Root path for Railway healthcheck
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

// Environment status endpoint
app.get('/api/status', (req, res) => {
  const hasDatabase = !!process.env.DATABASE_URL;
  const hasStripe = !!(process.env.STRIPE_SECRET_KEY && process.env.VITE_STRIPE_PUBLIC_KEY);
  const hasEmail = !!process.env.SENDGRID_API_KEY;
  const hasSession = !!process.env.SESSION_SECRET;
  
  res.json({
    environment: process.env.NODE_ENV || 'development',
    configured: {
      database: hasDatabase,
      stripe: hasStripe,
      email: hasEmail,
      session: hasSession
    },
    ready: hasDatabase && hasStripe && hasEmail && hasSession
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

const port = parseInt(process.env.PORT || "3000");
const server = createServer(app);

server.listen(port, "0.0.0.0", () => {
  console.log(`Lough Hyne Cottage server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});