import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { readFileSync, existsSync } from 'fs';
import { parse } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 5000;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml'
};

// Parse request body for POST requests
function parseRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

// Serve static files
function serveStaticFile(filePath, res) {
  try {
    if (!existsSync(filePath)) {
      return false;
    }
    
    const ext = extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    const content = readFileSync(filePath);
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.writeHead(200);
    res.end(content);
    return true;
  } catch {
    return false;
  }
}

// Main server handler
const server = createServer(async (req, res) => {
  const parsedUrl = parse(req.url, true);
  const { pathname } = parsedUrl;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // Health check endpoint
    if (pathname === '/health') {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Lough Hyne Cottage'
      }));
      return;
    }

    // API endpoints
    if (pathname === '/api/experiences') {
      const experiences = [
        {
          "id": 3,
          "type": "yoga",
          "name": "Day-Long Yoga Retreat",
          "description": "Reconnect with nature through mindful movement and meditation in our serene lakeside setting.",
          "basePrice": 85,
          "duration": "Full day (10am-4pm)",
          "maxParticipants": 8,
          "isActive": true
        },
        {
          "id": 4,
          "type": "sauna",
          "name": "Wood-Fired Sauna Session",
          "description": "Authentic Finnish sauna experience with stunning Lough Hyne views and optional cold water plunge.",
          "basePrice": 35,
          "duration": "90 minutes",
          "maxParticipants": 6,
          "isActive": true
        },
        {
          "id": 5,
          "type": "bread",
          "name": "Artisan Bread Making Workshop",
          "description": "Learn traditional bread making techniques using locally sourced organic ingredients.",
          "basePrice": 65,
          "duration": "4 hours",
          "maxParticipants": 6,
          "isActive": true
        },
        {
          "id": 1,
          "type": "cabin",
          "name": "Eco Cabin Stay",
          "description": "Luxury eco cabin overlooking Lough Hyne with private deck and wood-fired bathtub.",
          "basePrice": 195,
          "duration": "Per night (minimum 2 nights)",
          "maxParticipants": 2,
          "isActive": true
        }
      ];
      
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(experiences));
      return;
    }

    if (pathname === '/api/airbnb-bookings') {
      const bookings = [
        {"start":"2025-06-09","end":"2025-06-11"},
        {"start":"2025-06-13","end":"2025-06-15"},
        {"start":"2025-06-20","end":"2025-06-22"},
        {"start":"2025-06-27","end":"2025-06-29"},
        {"start":"2025-07-04","end":"2025-07-06"},
        {"start":"2025-07-11","end":"2025-07-13"},
        {"start":"2025-07-18","end":"2025-07-20"},
        {"start":"2025-07-25","end":"2025-07-27"},
        {"start":"2025-08-01","end":"2025-08-03"},
        {"start":"2025-08-08","end":"2025-08-10"},
        {"start":"2025-08-15","end":"2025-08-17"},
        {"start":"2025-08-22","end":"2025-08-24"},
        {"start":"2025-08-29","end":"2025-08-31"}
      ];
      
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(bookings));
      return;
    }

    if (pathname === '/api/guest-experiences/public') {
      const guestExperiences = [
        {
          "id": 1,
          "guestName": "Sarah & Tom",
          "experience": "cabin",
          "rating": 5,
          "feedback": "Absolutely magical stay! The cabin is beautifully designed and the location is breathtaking. Waking up to the sunrise over Lough Hyne was unforgettable.",
          "isPublic": true,
          "visitDate": "2024-09-15",
          "createdAt": "2024-09-16T10:30:00.000Z"
        },
        {
          "id": 2,
          "guestName": "Marie",
          "experience": "yoga",
          "rating": 5,
          "feedback": "The yoga retreat was exactly what I needed. Claire's guidance and the peaceful setting created the perfect environment for inner reflection and renewal.",
          "isPublic": true,
          "visitDate": "2024-09-22",
          "createdAt": "2024-09-23T14:15:00.000Z"
        },
        {
          "id": 3,
          "guestName": "James & Lisa",
          "experience": "sauna",
          "rating": 5,
          "feedback": "The wood-fired sauna experience was incredible! Steven's attention to detail and the stunning lake views made it truly special. Can't wait to return.",
          "isPublic": true,
          "visitDate": "2024-10-01",
          "createdAt": "2024-10-02T16:45:00.000Z"
        }
      ];
      
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(guestExperiences));
      return;
    }

    if (pathname === '/api/bookings' && req.method === 'POST') {
      const bookingData = await parseRequestBody(req);
      console.log('Booking request received:', bookingData);
      
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'Booking submitted successfully',
        bookingId: Math.floor(Math.random() * 10000)
      }));
      return;
    }

    if (pathname === '/api/contact' && req.method === 'POST') {
      const contactData = await parseRequestBody(req);
      console.log('Contact form submitted:', contactData);
      
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'Message sent successfully'
      }));
      return;
    }

    // Serve static assets
    if (pathname.startsWith('/assets/')) {
      const filePath = join(__dirname, pathname);
      if (serveStaticFile(filePath, res)) {
        return;
      }
    }

    // Serve static files from dist directory
    let filePath;
    if (pathname === '/' || pathname === '/index.html') {
      filePath = join(__dirname, 'dist', 'index.html');
    } else if (pathname === '/booking' || pathname === '/booking.html') {
      filePath = join(__dirname, 'dist', 'booking.html');
    } else {
      filePath = join(__dirname, 'dist', pathname);
    }

    if (serveStaticFile(filePath, res)) {
      return;
    }

    // Catch-all for SPA routing
    if (!pathname.startsWith('/api/')) {
      const indexPath = join(__dirname, 'dist', 'index.html');
      if (serveStaticFile(indexPath, res)) {
        return;
      }
    }

    // 404 for API endpoints
    if (pathname.startsWith('/api/')) {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'API endpoint not found' }));
      return;
    }

    // 404 for other requests
    res.writeHead(404);
    res.end('Not found');

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end('Internal server error');
  }
});

// Error handling
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Lough Hyne Cottage server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});