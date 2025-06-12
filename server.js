import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { readFileSync, existsSync } from 'fs';
import { parse } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 5000;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function serveStaticFile(filePath, res) {
  try {
    if (!existsSync(filePath)) {
      return false;
    }
    
    const ext = extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    const content = readFileSync(filePath);
    
    res.setHeader('Content-Type', contentType);
    
    // Cache control based on file type
    if (ext === '.html') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Last-Modified', new Date().toUTCString());
      res.setHeader('ETag', `"${Date.now()}"`);
    } else if (ext.match(/\.(jpg|jpeg|png|avif|webp|gif|svg|ico)$/)) {
      // Long cache for images
      res.setHeader('Cache-Control', 'public, max-age=86400');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
    
    res.writeHead(200);
    res.end(content);
    return true;
  } catch {
    return false;
  }
}

const server = createServer(async (req, res) => {
  const parsedUrl = parse(req.url, true);
  const { pathname } = parsedUrl;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
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

    // Serve static assets - MUST be before HTML routing
    if (pathname.startsWith('/assets/')) {
      const filePath = join(__dirname, 'assets', pathname.replace('/assets/', ''));
      console.log('Attempting to serve asset:', filePath);
      if (serveStaticFile(filePath, res)) {
        console.log('Asset served successfully:', filePath);
        return;
      } else {
        console.log('Asset not found:', filePath);
        res.writeHead(404);
        res.end('Asset not found');
        return;
      }
    }

    // Define SPA routes that should serve the React app
    const spaRoutes = [
      '/', '/index.html',
      '/cabin-booking', '/sauna-addon',
      '/events-experiences', '/book',
      '/payment', '/guest-experience', '/guest-experience-demo',
      '/terms-conditions', '/privacy-policy', '/voucher-success'
    ];

    // Check if this is a static HTML page route
    const staticPages = {
      '/booking': 'booking.html',
      '/sauna-booking': 'sauna-booking.html',
      '/yoga-booking': 'yoga-booking.html', 
      '/bread-booking': 'bread-booking.html',
      '/our-story': 'our-story.html', 
      '/vouchers': 'vouchers.html',
      '/wonderful-west-cork': 'wonderful-west-cork.html',
      '/admin': 'admin.html',
      '/guest-stories': 'guest-stories.html'
    };

    // Serve static pages
    if (staticPages[pathname]) {
      const filePath = join(__dirname, 'dist', staticPages[pathname]);
      if (serveStaticFile(filePath, res)) {
        return;
      }
    }

    // Serve SPA routes or unknown routes with React app
    if (spaRoutes.some(route => pathname.startsWith(route)) || !pathname.startsWith('/api/')) {
      const indexPath = join(__dirname, 'dist', 'index.html');
      if (serveStaticFile(indexPath, res)) {
        return;
      }
    }

    res.writeHead(404);
    res.end('Not found');

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end('Internal server error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Lough Hyne Cottage server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});