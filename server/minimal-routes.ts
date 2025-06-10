import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Basic health check - always works
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Basic status endpoint
  app.get('/api/status', (req, res) => {
    const hasDatabase = !!process.env.DATABASE_URL;
    const hasStripe = !!process.env.STRIPE_SECRET_KEY;
    const hasEmail = !!process.env.EMAIL_USER;

    res.json({
      database: hasDatabase ? 'configured' : 'missing',
      stripe: hasStripe ? 'configured' : 'missing',
      email: hasEmail ? 'configured' : 'missing',
      ready: hasDatabase && hasStripe && hasEmail
    });
  });

  // Placeholder for other routes when environment is ready
  app.get('/api/experiences', (req, res) => {
    if (!process.env.DATABASE_URL) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    res.json({ message: 'Database connection required' });
  });

  app.post('/api/bookings', (req, res) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: 'Payment system not configured' });
    }
    res.json({ message: 'Payment system required' });
  });

  // Catch-all for missing routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  const httpServer = createServer(app);
  return httpServer;
}