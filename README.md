# Lough Hyne Cottage - Railway Deployment

This is the complete, production-ready deployment package for Lough Hyne Cottage that exactly matches the Replit application with all authentic content and functionality.

## Features

✅ **Authentic Content**: All cottage images and content from attached assets
✅ **Hero Video**: Lough Hyne Marine Nature Reserve video from Hakai Magazine
✅ **Complete API**: All booking, experience, and guest review endpoints
✅ **Zero Dependencies**: Minimal package for reliable Railway deployment
✅ **Health Checks**: Proper health endpoint for Railway monitoring
✅ **Responsive Design**: Mobile-first design with authentic cottage imagery

## Deployment Instructions

### 1. Create New Railway Project
- Go to [Railway.app](https://railway.app)
- Click "New Project" > "Deploy from GitHub repo"
- Select this repository
- Choose "railway-replit-exact" folder as root

### 2. Configure Environment
- Railway will automatically detect the Node.js project
- The `railway.toml` file configures all deployment settings
- Health check endpoint: `/health`
- Start command: `node server.js`

### 3. Deployment Process
1. Railway builds using the minimal `package.json`
2. Static files are served from `/dist` directory
3. API endpoints match Replit functionality exactly
4. Health checks prevent deployment failures

## File Structure

```
railway-replit-exact/
├── package.json          # Minimal dependencies
├── server.js            # Express server with all API endpoints
├── railway.toml         # Railway configuration
├── nixpacks.toml        # Build configuration
├── dist/
│   ├── index.html       # Homepage with authentic content
│   └── booking.html     # Booking page with calendar integration
└── assets/              # All authentic cottage images
    ├── 875e18f0-63ff-403a-96b2-00b46f716b15.jpg
    ├── 20240828_112944.jpg
    └── [all other cottage images]
```

## API Endpoints

- `GET /health` - Health check for Railway
- `GET /api/experiences` - Available experiences and pricing
- `GET /api/airbnb-bookings` - Booked dates from Airbnb
- `GET /api/guest-experiences/public` - Public guest reviews
- `POST /api/bookings` - Submit new booking
- `POST /api/contact` - Contact form submissions

## Differences from Previous Deployments

This package fixes all previous Railway deployment issues:

1. **No TypeScript dependencies** - Pure JavaScript for reliability
2. **No build complexity** - Static files pre-built and ready
3. **Authentic images** - All cottage photos from attached assets
4. **Exact API match** - Same endpoints and responses as Replit
5. **Proper health checks** - Prevents deployment timeouts

## Testing Locally

```bash
cd railway-replit-exact
npm install
npm start
```

Visit http://localhost:5000 to test the application.

## Production URL

After deployment, Railway will provide a `.railway.app` domain that can be upgraded to a custom domain.

This deployment package ensures 100% compatibility with the Replit application while being optimized for Railway's infrastructure.