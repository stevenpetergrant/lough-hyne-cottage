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
  '.svg': 'image/svg+xml'
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
    
    // No cache for HTML files to ensure updates are seen immediately
    if (ext === '.html') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
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

    // Serve static assets
    if (pathname.startsWith('/assets/')) {
      const filePath = join(__dirname, 'assets', pathname.replace('/assets/', ''));
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
    } else if (pathname === '/our-story') {
      filePath = join(__dirname, 'dist', 'our-story.html');
    } else if (pathname === '/vouchers') {
      filePath = join(__dirname, 'dist', 'vouchers.html');
    } else if (pathname === '/wonderful-west-cork') {
      filePath = join(__dirname, 'dist', 'wonderful-west-cork.html');
    } else if (pathname === '/admin') {
      filePath = join(__dirname, 'dist', 'admin.html');
    } else if (pathname === '/guest-stories') {
      filePath = join(__dirname, 'dist', 'guest-stories.html');
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