import type { RequestHandler } from "express";

// Simple admin authentication middleware
export const requireAdmin: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const token = authHeader.substring(7);
  const adminToken = process.env.ADMIN_TOKEN || 'admin_secure_token_2024';
  
  if (token !== adminToken) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  
  next();
};

// Login endpoint for admin
export const adminLogin: RequestHandler = (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'N@1ls3004';
  
  if (password !== adminPassword) {
    return res.status(401).json({ message: "Invalid password" });
  }
  
  const token = process.env.ADMIN_TOKEN || 'admin_secure_token_2024';
  res.json({ 
    token,
    message: "Login successful" 
  });
};