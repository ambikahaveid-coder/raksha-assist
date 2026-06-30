import { createServer } from 'http';
import { readFileSync, existsSync, createReadStream, statSync } from 'fs';
import { resolve, dirname, extname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = parseInt(process.env.PORT || '5000', 10);

// Tell dist/index.js NOT to start its own HTTP server (we own the port)
process.env.BOOTSTRAPPED = 'true';

let expressApp = null;
let appReady = false;

// Pre-load index.html from disk so we can serve it instantly before Express starts
let indexHtml = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Raksha Assist</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div></body></html>';
const htmlPaths = [
  resolve(__dirname, '../frontend/dist/index.html'),
  resolve(__dirname, 'dist/public/index.html'),
  resolve(__dirname, 'frontend/dist/index.html'),
];
let staticDir = '';
for (const p of htmlPaths) {
  try {
    if (existsSync(p)) {
      indexHtml = readFileSync(p, 'utf-8');
      staticDir = dirname(p);
      console.log('[startup] Found index.html at:', p);
      break;
    }
  } catch (e) {}
}

const MIME_TYPES = {
  '.js':    'application/javascript',
  '.mjs':   'application/javascript',
  '.css':   'text/css',
  '.html':  'text/html; charset=utf-8',
  '.json':  'application/json',
  '.png':   'image/png',
  '.jpg':   'image/jpeg',
  '.jpeg':  'image/jpeg',
  '.svg':   'image/svg+xml',
  '.ico':   'image/x-icon',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':   'font/ttf',
  '.webp':  'image/webp',
  '.webmanifest': 'application/manifest+json',
};

function tryServeStatic(url, res) {
  if (!staticDir) return false;
  try {
    const filePath = join(staticDir, url);
    // Security: must stay inside staticDir
    if (!filePath.startsWith(staticDir)) return false;
    if (!existsSync(filePath)) return false;
    const stat = statSync(filePath);
    if (!stat.isFile()) return false;
    const ext = extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    const maxAge = ext === '.html' ? 0 : (ext === '.js' || ext === '.css' || ext === '.woff2') ? 31536000 : 86400;
    res.writeHead(200, {
      'Content-Type': mime,
      'Content-Length': stat.size,
      'Cache-Control': maxAge ? `public, max-age=${maxAge}, immutable` : 'no-cache, no-store, must-revalidate',
    });
    createReadStream(filePath).pipe(res);
    return true;
  } catch (e) {
    return false;
  }
}

function isStaticOrAPI(url) {
  if (url.startsWith('/api')) return true;
  const ext = extname(url);
  if (ext && ext !== '.html') return true;
  if (url.startsWith('/assets/')) return true;
  return false;
}

const server = createServer((req, res) => {
  const url = (req.url || '').split('?')[0];

  // Express is ready — hand off everything
  if (appReady && expressApp) {
    expressApp(req, res);
    return;
  }

  // Express not yet ready — serve what we can from disk directly

  // HTML navigation requests: serve pre-loaded index.html
  if (!isStaticOrAPI(url)) {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(indexHtml);
    return;
  }

  // Static assets (JS, CSS, fonts, images): serve directly from dist folder
  if (!url.startsWith('/api') && tryServeStatic(url, res)) {
    return;
  }

  // API calls (or missing static files): tell client to retry
  res.writeHead(503, {
    'Content-Type': 'application/json',
    'Retry-After': '3',
  });
  res.end(JSON.stringify({ message: 'Server starting, please wait...' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[startup] Listening on port ${PORT} — health checks and static files ready`);

  setImmediate(async () => {
    try {
      const mod = await import('./dist/index.js');
      expressApp = mod.app;

      // Register routes and set up static serving — must complete before marking ready
      if (mod.setupServer) {
        await mod.setupServer();
      }

      appReady = true;
      console.log('[startup] Express app fully loaded and serving');

      // DB seeding runs in background — never blocks app startup
      if (mod.asyncInit) {
        mod.asyncInit().catch(err =>
          console.error('[startup] asyncInit background error (non-fatal):', err.message)
        );
      }
    } catch (err) {
      console.error('[startup] Failed to load Express app:', err.message);
      // Even if Express fails, static files are still served above
      appReady = true;
    }
  });
});

function shutdown(signal) {
  console.log(`[startup] ${signal} received, shutting down...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 15000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => console.error('[startup] Uncaught:', err.message));
process.on('unhandledRejection', (r) => console.error('[startup] Unhandled rejection:', r?.message || r));
