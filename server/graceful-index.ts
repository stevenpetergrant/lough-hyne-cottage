import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoints for Railway
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'Lough Hyne Cottage Booking System Running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Check if we have required environment variables
const hasDatabase = !!process.env.DATABASE_URL;
const hasStripe = !!(process.env.STRIPE_SECRET_KEY && process.env.VITE_STRIPE_PUBLIC_KEY);
const hasSendGrid = !!process.env.SENDGRID_API_KEY;
const hasSession = !!process.env.SESSION_SECRET;

// Status endpoint showing configuration
app.get('/api/status', (req, res) => {
  res.json({
    database: hasDatabase ? 'connected' : 'not configured',
    stripe: hasStripe ? 'configured' : 'not configured',
    sendgrid: hasSendGrid ? 'configured' : 'not configured',
    session: hasSession ? 'configured' : 'not configured',
    ready: hasDatabase && hasStripe && hasSendGrid && hasSession
  });
});

// If all environment variables are present, load full routes
if (hasDatabase && hasStripe && hasSendGrid && hasSession) {
  try {
    console.log("Loading full booking system routes...");
    import("./routes").then(({ registerRoutes }) => {
      registerRoutes(app).then((server) => {
        console.log("Full booking system loaded successfully");
      }).catch((error) => {
        console.error("Error loading full routes:", error);
      });
    });
  } catch (error) {
    console.error("Error importing routes:", error);
  }
} else {
  console.log("Environment variables incomplete - running in basic mode");
  console.log(`Database: ${hasDatabase ? '✓' : '✗'}`);
  console.log(`Stripe: ${hasStripe ? '✓' : '✗'}`);
  console.log(`SendGrid: ${hasSendGrid ? '✓' : '✗'}`);
  console.log(`Session: ${hasSession ? '✓' : '✗'}`);
  
  // Basic booking info endpoint
  app.get('/api/info', (req, res) => {
    res.json({
      name: "Lough Hyne Cottage",
      location: "Cork, Ireland",
      description: "Eco retreat booking system",
      features: ["Cabin booking", "Sauna sessions", "Yoga retreats", "Bread courses"],
      status: "Configuration pending"
    });
  });
}

// Error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Setup Vite in development
if (process.env.NODE_ENV !== "production") {
  const { createServer } = await import("http");
  const server = createServer(app);
  await setupVite(app, server);
} else {
  serveStatic(app);
}

const port = parseInt(process.env.PORT || "3000");

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});