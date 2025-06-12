# Lough Hyne Cottage - Railway Deployment

Complete React application for Lough Hyne Cottage booking system with Express.js backend.

## Deployment to Railway

1. Create new Railway project
2. Connect to GitHub repository
3. Set environment variables:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `STRIPE_SECRET_KEY` 
   - `VITE_STRIPE_PUBLIC_KEY`
   - `SESSION_SECRET`

## Features

- Interactive cabin booking with calendar availability
- Sauna, yoga, and bread workshop bookings
- Admin dashboard for managing bookings
- Stripe payment integration
- Guest experience platform
- Voucher system
- Email notifications

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm start
```

The application serves the React frontend and API endpoints from the same Express server.