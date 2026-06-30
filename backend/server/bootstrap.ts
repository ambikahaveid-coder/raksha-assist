import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { existsSync, readFileSync, createReadStream, statSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";

const port = parseInt(process.env.PORT || "5000", 10);
const startTime = Date.now();

// Always set BOOTSTRAPPED so dist/index.js doesn't try to start its own server
process.env.BOOTSTRAPPED = "true";

let appHandler: ((req: IncomingMessage, res: ServerResponse) => void) | null = null;

// Pre-load index.html and static dir from disk
const scriptDir = dirname(fileURLToPath(import.meta.url));
let indexHtml = "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Raksha Assist</title><meta name='viewport' content='width=device-width,initial-scale=1'></head><body><div id='root'></div></body></html>";
let staticDir = "";

const htmlCandidates = [
  join(scriptDir, "public", "index.html"),
  join(process.cwd(), "dist", "public", "index.html"),
  join(process.cwd(), "frontend", "dist", "index.html"),
];
for (const p of htmlCandidates) {
  try {
    if (existsSync(p)) {
      indexHtml = readFileSync(p, "utf-8");
      staticDir = dirname(p);
      console.log(`[bootstrap] index.html loaded from: ${p}`);
      break;
    }
  } catch {}
}

const MIME_TYPES: Record<string, string> = {
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".webmanifest": "application/manifest+json",
};

function tryServeStatic(url: string, res: ServerResponse): boolean {
  if (!staticDir) return false;
  try {
    const filePath = join(staticDir, url);
    if (!filePath.startsWith(staticDir)) return false;
    if (!existsSync(filePath)) return false;
    const stat = statSync(filePath);
    if (!stat.isFile()) return false;
    const ext = extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || "application/octet-stream";
    const maxAge = ext === ".html" ? 0 : [".js", ".css", ".woff2"].includes(ext) ? 31536000 : 86400;
    (res as any).writeHead(200, {
      "Content-Type": mime,
      "Content-Length": stat.size,
      "Cache-Control": maxAge ? `public, max-age=${maxAge}, immutable` : "no-cache, no-store, must-revalidate",
    });
    createReadStream(filePath).pipe(res);
    return true;
  } catch {
    return false;
  }
}

function isNavigation(url: string): boolean {
  if (url.startsWith("/api")) return false;
  const ext = extname(url.split("?")[0]);
  return !ext || ext === ".html";
}

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const url = (req.url || "").split("?")[0];

  // Health check — always instant
  if (url === "/_health" || url === "/health" || url === "/api/health") {
    (res as any).writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-cache" });
    res.end(JSON.stringify({ status: "ok", uptime: Math.floor((Date.now() - startTime) / 1000) }));
    return;
  }

  // Express is ready — handle everything
  if (appHandler) {
    appHandler(req, res);
    return;
  }

  // Express not ready yet — serve from disk so app doesn't appear offline

  // HTML navigation: serve index.html
  if (isNavigation(url)) {
    (res as any).writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store, must-revalidate" });
    res.end(indexHtml);
    return;
  }

  // Static assets (JS, CSS, fonts, images): stream directly from dist folder
  if (!url.startsWith("/api") && tryServeStatic(url, res)) return;

  // API or missing assets: 503 with retry hint
  (res as any).writeHead(503, { "Content-Type": "application/json", "Retry-After": "3" });
  res.end(JSON.stringify({ status: "starting", message: "Application is initializing, please retry in a few seconds." }));
});

server.listen(port, "0.0.0.0", () => {
  console.log(`[bootstrap] Listening on port ${port} — static files ready in ${Date.now() - startTime}ms`);
  setImmediate(() => loadApp());
});

async function loadApp() {
  try {
    console.log("[bootstrap] Loading main application...");

    const appModule = await import("./index.js");
    const { app, setupServer, asyncInit } = appModule as any;

    // Register all routes and static serving before accepting traffic
    if (setupServer) {
      await setupServer();
      console.log(`[bootstrap] Routes registered in ${Date.now() - startTime}ms`);
    }

    appHandler = app;
    console.log(`[bootstrap] Express app live in ${Date.now() - startTime}ms`);

    // DB seeding runs in background — never blocks startup
    // If DB is down, it fails silently and retries on next deploy
    if (asyncInit) {
      asyncInit().catch((err: Error) =>
        console.error("[bootstrap] asyncInit background error (non-fatal):", err.message)
      );
    }
  } catch (error: any) {
    console.error("[bootstrap] FATAL: Failed to load application:", error.message);
    console.error(error.stack);
    // appHandler stays null — static files still served above
  }
}

process.on("uncaughtException", (err) => {
  console.error("[bootstrap] Uncaught exception (keeping server alive):", err.message);
});

process.on("unhandledRejection", (reason: any) => {
  console.error("[bootstrap] Unhandled rejection (keeping server alive):", reason?.message || reason);
});

process.on("SIGTERM", () => {
  console.log("[bootstrap] SIGTERM received");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 30000);
});

process.on("SIGINT", () => {
  console.log("[bootstrap] SIGINT received");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 30000);
});
