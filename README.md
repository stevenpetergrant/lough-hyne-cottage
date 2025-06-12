# Lough Hyne Cottage - Railway Deployment

Complete React application for Lough Hyne Cottage booking system.

## Deployment to Railway

1. Extract this package to your Railway project
2. Set environment variables:
   - `DATABASE_URL` (optional - uses in-memory data)
   - `STRIPE_SECRET_KEY` (optional)
   - `VITE_STRIPE_PUBLIC_KEY` (optional)

## Features

- Interactive cabin booking with calendar functionality
- Sauna, yoga, and bread workshop booking pages
- Responsive design matching Replit version
- Express.js server with health checks
- Production-ready build configuration

## Build Process

Railway will automatically:
1. Run `npm install`
2. Run `npm run build` (Vite build)
3. Start with `npm run start`

The application serves the React frontend and API endpoints from the same Express server on the port specified by Railway's PORT environment variable.