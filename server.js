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
          "id": 1,
          "type": "sauna",
          "name": "Sauna Sessions",
          "description": "Experience authentic sauna culture in our traditional wood-fired sauna. Relax, rejuvenate, and connect with nature in this timeless wellness practice.",
          "basePrice": 70,
          "duration": "1-2 Hours",
          "maxParticipants": 6,
          "isActive": true
        },
        {
          "id": 2,
          "type": "yoga",
          "name": "Monthly Yoga Mini-Retreats",
          "description": "Immerse yourself in tranquil yoga sessions surrounded by the natural beauty of Lough Hyne. Combined with hyper-local, veggie-filled meals inspired by California meets West Cork cuisine.",
          "basePrice": 80,
          "duration": "Full Day",
          "maxParticipants": 8,
          "isActive": true
        },
        {
          "id": 3,
          "type": "bread",
          "name": "Wood-Fired Bread Making Workshop",
          "description": "Join us monthly as we fire up our traditional wood stove to create artisanal bread and pastries. Learn the ancient art of sourdough baking while connecting with our local community.",
          "basePrice": 135,
          "duration": "11 am - 5pm",
          "maxParticipants": 6,
          "isActive": true
        },
        {
          "id": 4,
          "type": "cabin",
          "name": "Cabin Accommodation",
          "description": "Come stay in our cosy cabin and unplug from the everyday. At Lough Hyne Cottage, we invite you to immerse yourself in the rhythm of nature's embrace.",
          "basePrice": 250,
          "duration": "Per night",
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
          "guestName": "Joseph",
          "experience": "cabin",
          "rating": 5,
          "feedback": "We had a really relaxing stay at Lough Hyne Cottage. The accommodation is set is a wonderful location overlooking the lake and is decorated very tastefully. Steven is a top class host and a lovely fella. We will be back!",
          "isPublic": true,
          "visitDate": "2024-06-15",
          "createdAt": "2024-06-16T10:30:00.000Z",
          "photo": "https://loughhynecottage.com/wp-content/uploads/2024/09/4d18acd7-7cd2-449a-9f11-a608b5e8ea7e.avif"
        },
        {
          "id": 2,
          "guestName": "Anna",
          "experience": "cabin",
          "rating": 5,
          "feedback": "We had such a wonderful stay at the Lough Hyne Cottage! It was the most beautiful, tranquil oasis. I don't think it matters what the weather's like, but we were blessed with sun, each window delivers luscious green views. Absolutely perfect getaway. Great recommendations from Steven & Claire, super friendly and helpful!",
          "isPublic": true,
          "visitDate": "2024-06-22",
          "createdAt": "2024-06-23T14:15:00.000Z",
          "photo": "https://loughhynecottage.com/wp-content/uploads/2024/09/4a24c08e-de08-4ba1-bc41-9ba7c651f6ce-150x150.avif"
        },
        {
          "id": 3,
          "guestName": "Kerstin",
          "experience": "cabin",
          "rating": 5,
          "feedback": "Steven and Claire are great hosts, very friendly and helpful. They gave us great tips for exploring the area. And we had the best brownies we've ever had! So delicious. Not to mention the eggs right out of the cage! Very nice and peaceful place. And I loved the view into the trees waking up. Highly recommended!",
          "isPublic": true,
          "visitDate": "2024-05-18",
          "createdAt": "2024-05-19T16:45:00.000Z",
          "photo": "https://loughhynecottage.com/wp-content/uploads/2024/09/62d1d0db-4a6d-40da-951f-59749000cb2d-150x150.avif"
        },
        {
          "id": 4,
          "guestName": "Thia",
          "experience": "cabin",
          "rating": 5,
          "feedback": "We stayed three nights in the Lough Hyne Cottage and only wish we could have stayed longer! The space was beautiful and all details thoughtful — the eco-friendly design and amenities only adding to the peaceful, relaxing experience. We also did a seaweed bath on-site that exceeded all expectations.",
          "isPublic": true,
          "visitDate": "2024-07-12",
          "createdAt": "2024-07-13T12:20:00.000Z",
          "photo": "https://loughhynecottage.com/wp-content/uploads/2024/09/409c9978-7053-40b6-b960-60b61717f4a7-150x150.avif"
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