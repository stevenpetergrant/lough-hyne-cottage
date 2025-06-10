# Lough Hyne Cottage - Railway Deployment Guide

## Quick Deployment Steps

### 1. Upload to GitHub
1. Create a new repository on GitHub
2. Upload all files from this `railway-deployment` folder
3. Push to GitHub

### 2. Deploy on Railway
1. Go to [railway.app](https://railway.app)
2. Click "Deploy from GitHub repo"
3. Select your repository
4. Railway will automatically detect Node.js and deploy

### 3. Add Database
1. In Railway dashboard, click "Add service"
2. Select "MySQL"
3. Copy the connection string

### 4. Set Environment Variables
In Railway dashboard, go to Variables tab and add:

```
DATABASE_URL=mysql://your_user:your_password@your_host:3306/your_database
EMAIL_USER=info@loughhynecottage.ie
EMAIL_PASS=your_email_password
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY_HERE
VITE_STRIPE_PUBLIC_KEY=pk_live_YOUR_STRIPE_PUBLIC_KEY_HERE
AIRBNB_CALENDAR_URL=https://www.airbnb.ie/calendar/ical/your_calendar_id.ics
SESSION_SECRET=your-session-secret-key-here
ADMIN_PASSWORD=your_admin_password
NODE_ENV=production
PORT=3000
```

### 5. Connect Custom Domain
1. In Railway dashboard, go to Settings
2. Add your domain: `loughhynecottage.ie`
3. Update DNS records as shown

## Features Included
- Complete booking system for cabin stays
- Sauna, yoga, and bread course bookings
- Payment processing with Stripe
- Email confirmations and notifications
- Admin dashboard
- Airbnb calendar integration
- Gift voucher system
- Guest experience sharing

## Support
Your booking system is ready for production use with all live credentials configured.