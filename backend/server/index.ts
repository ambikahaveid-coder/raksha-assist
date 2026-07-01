// Load dotenv - override system env vars so .env file takes precedence
import dotenv from "dotenv";
dotenv.config({ override: true });

import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import cookieParser from "cookie-parser";
import { csrfMiddleware } from "./middleware/csrf";
import cors from "cors";
import pg from "pg";
import path from "path";
import jwt from "jsonwebtoken";
import fs from "fs";
import { checkDatabaseHealth, gracefulShutdown, db } from "./db";
import { logger } from "./utils/logger";
import { policies } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import { startReminderScheduler } from "./services/reminder.service";
import { ensureCanonicalSuperAdmin, CANONICAL_SUPERADMIN_EMAIL } from "./services/superadmin.service";
import { fileURLToPath } from "url";
import compression from "compression";

// Get proper directory paths for both development and production
// In production CJS: __dirname is the compiled bundle directory (backend/dist/)
// In development ESM: we need to compute it from import.meta.url
function getScriptDir(): string {
  try {
    // Try CJS __dirname first (available in compiled bundle)
    if (typeof __dirname !== 'undefined') {
      return __dirname;
    }
  } catch (e) {}
  
  try {
    // ESM fallback
    return path.dirname(fileURLToPath(import.meta.url));
  } catch (e) {}
  
  // Final fallback
  return process.cwd();
}

const scriptDir = getScriptDir();

const app = express();

let isReady = false;

// CORS configuration — warn if missing but never crash startup
if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  console.warn('[WARN] FRONTEND_URL not set — defaulting to https://rakshaassist.com');
}
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(u => u.trim())
  : ['https://rakshaassist.com', 'http://localhost:3000'];

// Also allow the backend's own origin (when frontend is served from the same port)
const serverPort = process.env.PORT || '5000';
const selfOrigins = [`http://localhost:${serverPort}`, `http://127.0.0.1:${serverPort}`];
for (const so of selfOrigins) {
  if (!allowedOrigins.includes(so)) allowedOrigins.push(so);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin === allowed || origin.endsWith('.rakshaassist.com') || origin === 'https://rakshaassist.com' || origin === 'http://rakshaassist.com')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
}));

// Parse cookies before session
app.use(cookieParser());

// Enable gzip compression for all responses - improves load time
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Security headers with helmet
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  frameguard: false,
  hsts: process.env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}));

// Additional security headers for cache control on protected routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/admin') || req.path.startsWith('/super-admin') || req.path.startsWith('/api/auth')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
  next();
});

// Trust proxy for proper IP detection behind reverse proxy
app.set("trust proxy", 1);

// Global rate limiting - stricter in production
const isProduction = process.env.NODE_ENV === 'production';
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isProduction ? 200 : 1000,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/_health' || req.path === '/health' || req.path === '/api/health',
});
app.use(globalLimiter);

// Heavy API rate limiting (database-intensive operations)
const heavyApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isProduction ? 30 : 100,
  message: { error: "Too many database operations, please slow down" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/admin", heavyApiLimiter);
app.use("/api/franchise", heavyApiLimiter);
app.use("/api/reports", heavyApiLimiter);

app.get("/api/ping", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.get("/api/health", async (_req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    res.json({
      status: "UP",
      timestamp: new Date().toISOString(),
      database: dbHealth,
      environment: process.env.NODE_ENV,
      buildVersion: "2026-02-04-v1.3-PROD-STABLE"
    });
  } catch (error: any) {
    res.status(500).json({
      status: "DOWN",
      error: error.message
    });
  }
});

const fallbackHtml = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Raksha Assist</title></head><body><p>Loading...</p></body></html>';
let cachedIndexHtml: string = fallbackHtml;

function loadIndexHtml(): void {
  const possibleIndexPaths = [
    path.join(scriptDir, "public", "index.html"),
    path.join(process.cwd(), "dist", "public", "index.html"),
    path.join(process.cwd(), "..", "frontend", "dist", "index.html"),
    path.join(process.cwd(), "frontend", "dist", "index.html"),
  ];
  for (const p of possibleIndexPaths) {
    try {
      if (fs.existsSync(p)) {
        cachedIndexHtml = fs.readFileSync(p, 'utf-8');
        console.log(`[express] index.html loaded from: ${p}`);
        return;
      }
    } catch (e) {}
  }
  console.log("[express] WARNING: index.html not found, using fallback");
}

loadIndexHtml();

function getCachedIndexHtml(): string {
  return cachedIndexHtml;
}

function hasFileExtension(url: string): boolean {
  const lastSegment = url.split('/').pop() || '';
  return lastSegment.includes('.') && !lastSegment.startsWith('.');
}

const httpServer = createServer((req, res) => {
  const url = (req.url || '').split('?')[0];

  if (url === '/_health' || url === '/health' || url === '/api/health') {
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
    return;
  }

  app(req, res);
});

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
    userRole?: string;
    employerId?: string;
    employerAuthId?: string;
    employerRole?: string;
    companyId?: string;
    companyName?: string;
    isCompanySession?: boolean;
  }
}

// Session setup is deferred - we'll set it up after server starts listening
let sessionMiddleware: any = null;
let sessionPool: pg.Pool | null = null;

function getSessionMiddleware() {
  if (!sessionMiddleware) {
    const PgSession = connectPgSimple(session);
    
    const sessionSecret: string = process.env.SESSION_SECRET
      || (process.env.NODE_ENV !== "production" ? "raksha-assist-dev-secret-key" : "");
    if (!sessionSecret && process.env.NODE_ENV === "production") {
      console.warn("[WARN] SESSION_SECRET not set — using random secret (sessions won't persist across restarts)");
    }
    const finalSecret: string = sessionSecret || crypto.randomBytes(32).toString("hex");

    const sessionConfig: session.SessionOptions = {
      secret: finalSecret,
      resave: false,
      saveUninitialized: false,
      proxy: true,
      cookie: {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "none" as const,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    };

    if (process.env.DATABASE_URL) {
      const dbUrl = process.env.DATABASE_URL;
      const requiresSsl = dbUrl.includes('supabase.co') || dbUrl.includes('neon.tech') || dbUrl.includes('sslmode=require') || dbUrl.includes('digitalocean') || dbUrl.includes('ondigitalocean.com') || (isProduction && !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1'));
      const cleanDbUrl = requiresSsl
        ? dbUrl.replace(/[?&]sslmode=[^&]*/g, '').replace(/[?&]sslaccept=[^&]*/g, '').replace(/\?$/, '').replace(/&$/, '')
        : dbUrl;
      sessionPool = new pg.Pool({
        connectionString: cleanDbUrl,
        ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
        max: parseInt(process.env.SESSION_POOL_SIZE || '10'),
        min: 0,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        allowExitOnIdle: true,
      });
      sessionPool.on('error', (err) => {
        console.error("[Session Pool] Background error (non-fatal):", err.message);
      });
      const pgStore = new PgSession({
        pool: sessionPool,
        tableName: "session",
        createTableIfMissing: true,
        pruneSessionInterval: 60 * 15,
        errorLog: (err) => {
          console.error("[Session Store] Error:", err.message);
        }
      });
      sessionConfig.store = pgStore;
      console.log("[Session] Using PostgreSQL session store");
    } else {
      console.log("[Session] WARNING: Using memory session store - sessions may not persist");
    }
    
    sessionMiddleware = session(sessionConfig);
  }
  return sessionMiddleware;
}

// Helper to detect static file requests
function isStaticFileRequest(path: string): boolean {
  // Skip session/CSRF for static assets
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.map', '.webp', '.avif'];
  return staticExtensions.some(ext => path.endsWith(ext)) || path.startsWith('/assets/');
}

// Use lazy session middleware
app.use((req, res, next) => {
  if (req.path === "/_health" || req.path === "/health" || isStaticFileRequest(req.path) || !req.path.startsWith("/api")) {
    return next();
  }
  getSessionMiddleware()(req, res, next);
});

// JWT-to-session synchronization: populate session from JWT if session is empty
app.use(async (req, res, next) => {
  if (!req.path.startsWith("/api")) return next();
  if (req.session?.userId) return next();
  
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const { getJwtSecret } = await import("./utils/secrets.js");
      const decoded = jwt.verify(authHeader.slice(7), getJwtSecret()) as any;
      if (decoded.userId) {
        if (req.session) {
          req.session.userId = decoded.userId;
          req.session.userRole = decoded.role;
        } else {
          (req as any).session = { userId: decoded.userId, userRole: decoded.role };
        }
      }
    } catch (err) {
      console.error("[JWT-Sync] JWT verification failed:", (err as Error).message);
    }
  }
  next();
});

// CSRF protection (after session, before routes) - skip for health checks AND static files
app.use((req, res, next) => {
  if (req.path === "/_health" || req.path === "/health" || isStaticFileRequest(req.path) || !req.path.startsWith("/api")) {
    return next();
  }
  csrfMiddleware(req, res, next);
});

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  logger.info(`[${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const requestPath = req.path;
  const userId = (req.session as any)?.userId;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (requestPath.startsWith("/api") && requestPath !== "/api/health") {
      logger.http(req.method, requestPath, res.statusCode, duration, userId);
    }
  });

  next();
});

async function seedAllRoles() {
  // REMOVED: No demo/sample user seeding
  // All users must be created through proper registration or Super Admin provisioning
  log("User seeding disabled - create users through proper channels");
}

// Seed essential data - runs in both development and production
async function seedPlansAndFaqs() {
  try {
    await ensureCanonicalSuperAdmin();
    log(`Canonical Super Admin ${CANONICAL_SUPERADMIN_EMAIL} ensured`);
    // Only Individual + Family plans. Tiered economics: low-price tiers carry longer waiting periods,
    // higher co-pay, and lower annual usage caps — protects loss ratio while headline coverage looks attractive.
    // Top tiers earn premium via zero co-pay, short waits, and higher usage caps.
    const allPlans = [
      // === INDIVIDUAL PLANS (4 tiers) ===
      { planCode: "STARTER", name: "Raksha Individual Basic", description: "Entry-level individual accident & emergency assistance. Cashless support at partner hospitals with essential benefits to get you started.", shortDescription: "Entry-level individual protection", planCategory: "individual", membershipType: "individual", subscriptionPeriod: "yearly", price: 599, originalPrice: 999, coverageAmount: 100000, maxMembers: 1, validityDays: 365, waitingPeriodDays: 45, coPay: 20, annualUsageLimit: 2, features: ["Accident Support up to ₹1 Lakh", "Cashless Network Hospitals", "24/7 Emergency Helpline", "Basic Ambulance Assistance", "Digital Membership Card", "No Medical Check-up", "45-Day Waiting (Illness)", "20% Co-Pay on Claims"], isActive: true, isPopular: false, sortOrder: 10 },
      { planCode: "STANDARD", name: "Raksha Individual Silver", description: "Balanced individual coverage with wider hospital access, faster activation, and lower co-pay. Best starter upgrade for regular families.", shortDescription: "Balanced individual coverage", planCategory: "individual", membershipType: "individual", subscriptionPeriod: "yearly", price: 1199, originalPrice: 1799, coverageAmount: 200000, maxMembers: 1, validityDays: 365, waitingPeriodDays: 30, coPay: 10, annualUsageLimit: 3, features: ["Accident & Medical Support up to ₹2 Lakh", "500+ Cashless Network Hospitals", "24/7 Priority Helpline", "Free Ambulance up to 50 km", "Post-Hospitalization Support", "Digital Membership Card", "30-Day Waiting (Illness)", "Only 10% Co-Pay"], isActive: true, isPopular: false, sortOrder: 11 },
      { planCode: "PREMIUM", name: "Raksha Individual Gold", description: "Most popular individual plan. Strong coverage with 5% co-pay, priority response, personal care coordinator, and full hospital network.", shortDescription: "Most popular individual plan", planCategory: "individual", membershipType: "individual", subscriptionPeriod: "yearly", price: 2499, originalPrice: 3499, coverageAmount: 400000, maxMembers: 1, validityDays: 365, waitingPeriodDays: 15, coPay: 5, annualUsageLimit: 4, features: ["Complete Emergency Support up to ₹4 Lakh", "1000+ Cashless Hospitals (Pan-India)", "24/7 Priority SOS Helpline", "Free Ambulance (Unlimited distance)", "Pre & Post Hospitalization Support", "Personal Care Coordinator", "Medicine Delivery Assistance", "Only 5% Co-Pay", "15-Day Waiting Period"], isActive: true, isPopular: true, sortOrder: 12 },
      { planCode: "PLATINUM", name: "Raksha Individual Platinum", description: "Flagship individual plan. Zero co-pay, fastest activation, VIP hospital access, air ambulance, legal assistance, and unlimited claims.", shortDescription: "Flagship VIP individual plan", planCategory: "individual", membershipType: "individual", subscriptionPeriod: "yearly", price: 4999, originalPrice: 6999, coverageAmount: 700000, maxMembers: 1, validityDays: 365, waitingPeriodDays: 7, coPay: 0, annualUsageLimit: 6, features: ["Full Emergency Support up to ₹7 Lakh", "VIP Hospital Network Access", "Zero Co-Pay on All Claims", "Priority Ambulance + Air Ambulance", "Full Pre & Post Hospitalization", "Personal Care Manager (Dedicated)", "Medicine Home Delivery", "Legal Assistance for Accidents", "Zero Processing Fees", "7-Day Fast-Track Activation"], isActive: true, isPopular: false, sortOrder: 13 },

      // === FAMILY PLANS (4 tiers, floater basis) ===
      { planCode: "FAMILY_BASIC", name: "Raksha Family Essential", description: "Entry-level family floater covering self, spouse, and up to 2 children. Affordable starter protection with shared sum assured.", shortDescription: "Entry-level family floater", planCategory: "family", membershipType: "individual", subscriptionPeriod: "yearly", price: 1999, originalPrice: 2999, coverageAmount: 200000, maxMembers: 4, validityDays: 365, waitingPeriodDays: 45, coPay: 20, annualUsageLimit: 3, features: ["Family Floater (Self + Spouse + 2 Kids)", "Accident Support up to ₹2 Lakh (Shared)", "Cashless Network Hospitals", "24/7 Emergency Helpline", "Basic Ambulance Assistance", "Digital Cards for All Members", "45-Day Waiting (Illness)", "20% Co-Pay on Claims"], isActive: true, isPopular: false, sortOrder: 20 },
      { planCode: "FAMILY_SHIELD", name: "Raksha Family Shield", description: "Comprehensive family floater with higher limits, faster activation, and 500+ cashless hospitals. Covers up to 5 members including dependent parents.", shortDescription: "Comprehensive family floater", planCategory: "family", membershipType: "individual", subscriptionPeriod: "yearly", price: 3499, originalPrice: 4999, coverageAmount: 400000, maxMembers: 5, validityDays: 365, waitingPeriodDays: 30, coPay: 10, annualUsageLimit: 4, features: ["Family Floater up to 5 Members", "Accident & Medical Support up to ₹4 Lakh", "500+ Cashless Network Hospitals", "Priority Ambulance Response", "Pre & Post Hospitalization Support", "Digital Cards for All Members", "Add Parents (18-60 yrs)", "Only 10% Co-Pay", "30-Day Waiting Period"], isActive: true, isPopular: true, sortOrder: 21 },
      { planCode: "FAMILY_PREMIUM", name: "Raksha Family Crown", description: "Premium family floater with expanded network, personal care manager, and low co-pay. Covers up to 6 members across three generations.", shortDescription: "Premium family floater", planCategory: "family", membershipType: "individual", subscriptionPeriod: "yearly", price: 5999, originalPrice: 8499, coverageAmount: 700000, maxMembers: 6, validityDays: 365, waitingPeriodDays: 15, coPay: 5, annualUsageLimit: 5, features: ["Family Floater up to 6 Members", "Complete Support up to ₹7 Lakh (Shared)", "1000+ Cashless Hospitals (Pan-India)", "Priority Ambulance + Air Ambulance", "Full Pre & Post Hospitalization", "Personal Care Manager", "Medicine Delivery Support", "Add Dependent Parents", "Only 5% Co-Pay", "15-Day Waiting Period"], isActive: true, isPopular: false, sortOrder: 22 },
      { planCode: "FAMILY_ROYALE", name: "Raksha Family Royale", description: "Flagship family plan. Zero co-pay, VIP hospital access, air ambulance, dedicated manager, legal assistance, and highest floater coverage.", shortDescription: "Flagship VIP family plan", planCategory: "family", membershipType: "individual", subscriptionPeriod: "yearly", price: 9999, originalPrice: 13999, coverageAmount: 1200000, maxMembers: 6, validityDays: 365, waitingPeriodDays: 7, coPay: 0, annualUsageLimit: 8, features: ["Family Floater up to 6 Members", "Full Support up to ₹12 Lakh (Shared)", "VIP Hospital Network Access", "Zero Co-Pay on All Claims", "Priority Ambulance + Air Ambulance", "Dedicated Family Care Manager", "Full Pre & Post Hospitalization", "Medicine Home Delivery", "Legal Assistance", "Zero Processing Fees", "7-Day Fast-Track Activation"], isActive: true, isPopular: false, sortOrder: 23 },

      // === BUSINESS SHIELD PLANS (3 tiers) ===
      // For self-employed professionals, entrepreneurs, business owners.
      // Higher coverage reflects higher earning capacity and business continuity needs.
      // Co-pay and waiting periods protect loss ratio on this higher-risk, higher-value segment.
      { planCode: "BIZ_STARTER", name: "Raksha Business Essential", description: "Designed for freelancers, gig workers, and micro-business owners who need solid emergency protection without breaking the bank. Covers accidents and emergency hospitalization with cashless coordination at partner hospitals.", shortDescription: "Emergency protection for self-employed", planCategory: "business", membershipType: "individual", subscriptionPeriod: "yearly", price: 2999, originalPrice: 4499, coverageAmount: 300000, maxMembers: 1, validityDays: 365, waitingPeriodDays: 30, coPay: 15, annualUsageLimit: 3, features: ["Emergency Assistance up to ₹3 Lakh", "Accident Coverage — No Waiting Period", "500+ Cashless Network Hospitals", "24/7 Priority SOS Helpline", "Ambulance Coordination (up to 50 km)", "Legal FIR Assistance for Road Accidents", "Post-Hospitalization Follow-up", "Digital Business Membership Card", "30-Day Waiting Period (Illness)", "15% Co-Pay on Claims"], isActive: true, isPopular: false, sortOrder: 30 },

      { planCode: "BIZ_PRO", name: "Raksha Business Pro", description: "Built for self-employed professionals — doctors, chartered accountants, architects, consultants, insurance agents — who cannot afford extended downtime. Covers self and spouse with priority response, legal consultation, and higher assistance limits.", shortDescription: "For professionals who can't afford downtime", planCategory: "business", membershipType: "individual", subscriptionPeriod: "yearly", price: 5499, originalPrice: 7999, coverageAmount: 600000, maxMembers: 2, validityDays: 365, waitingPeriodDays: 15, coPay: 10, annualUsageLimit: 4, features: ["Emergency Assistance up to ₹6 Lakh", "Covers Self + Spouse", "Accident Coverage — Instant Activation", "1000+ Cashless Hospitals (Pan-India)", "24/7 Priority Emergency Response", "Priority Ambulance (Unlimited Distance)", "Legal Accident & FIR Consultation", "Pre & Post Hospitalization Support", "Medicine Delivery Coordination", "Personal Care Coordinator", "15-Day Waiting Period (Illness)", "Only 10% Co-Pay"], isActive: true, isPopular: true, sortOrder: 31 },

      { planCode: "BIZ_ELITE", name: "Raksha Business Elite", description: "The flagship plan for business owners, directors, and high-net-worth entrepreneurs. Covers the entire family, provides VIP hospital access, air ambulance coordination, dedicated relationship manager, and comprehensive legal assistance. Zero co-pay means no surprises during an emergency.", shortDescription: "Flagship protection for business owners & directors", planCategory: "business", membershipType: "individual", subscriptionPeriod: "yearly", price: 9999, originalPrice: 14999, coverageAmount: 1200000, maxMembers: 4, validityDays: 365, waitingPeriodDays: 7, coPay: 0, annualUsageLimit: 6, features: ["Emergency Assistance up to ₹12 Lakh", "Covers Self + Spouse + 2 Children", "Zero Co-Pay on All Assistance", "VIP Priority Hospital Network", "Air Ambulance Coordination", "Dedicated Business Relationship Manager", "24/7 VIP Emergency Hotline", "Legal Assistance Package (Accident, FIR, Disputes)", "Full Pre & Post Hospitalization Support", "Medicine & Medical Equipment Delivery", "Zero Processing Fees", "7-Day Fast-Track Activation", "Annual Health Coordination Review"], isActive: true, isPopular: false, sortOrder: 32 },

      // === CORPORATE SHIELD PLANS (4 tiers) ===
      // B2B plans — companies purchase memberships for their employees.
      // Legally structured as bulk individual memberships under corporate billing.
      // Each employee receives an individual membership card in their name.
      // HR dashboard for enrollment, reporting, and renewals. Minimum employee thresholds
      // protect the company from adverse selection on small groups.
      { planCode: "CORP_ESSENTIAL", name: "Raksha Corporate Essential", description: "Entry-level group assistance plan for startups and small businesses. Each enrolled employee gets an individual emergency assistance membership card. HR enrollment portal included. Minimum 5 employees.", shortDescription: "Group assistance for startups — min 5 employees", planCategory: "corporate", membershipType: "corporate", subscriptionPeriod: "yearly", price: 1299, originalPrice: 1999, coverageAmount: 200000, maxMembers: 1, validityDays: 365, waitingPeriodDays: 30, coPay: 20, annualUsageLimit: 2, features: ["₹2 Lakh Emergency Assistance per Employee", "Minimum 5 Employees Required", "Individual Membership Card per Employee", "HR Enrollment & Management Portal", "Group Billing (Single Invoice)", "24/7 Emergency Helpline", "Cashless Network Hospitals", "Accident Coverage — Instant Activation", "Digital Employee Cards", "30-Day Waiting Period (Illness)", "20% Co-Pay on Claims"], isActive: true, isPopular: false, sortOrder: 40 },

      { planCode: "CORP_STANDARD", name: "Raksha Corporate Standard", description: "Ideal for growing SMEs that want to offer meaningful employee welfare. Includes HR dashboard with monthly utilization reports, priority emergency response, and higher assistance limits per employee. Minimum 10 employees.", shortDescription: "Employee welfare plan for SMEs — min 10 employees", planCategory: "corporate", membershipType: "corporate", subscriptionPeriod: "yearly", price: 2299, originalPrice: 3499, coverageAmount: 400000, maxMembers: 1, validityDays: 365, waitingPeriodDays: 20, coPay: 15, annualUsageLimit: 3, features: ["₹4 Lakh Emergency Assistance per Employee", "Minimum 10 Employees Required", "HR Dashboard with Monthly Reports", "Priority Emergency Response (SLA)", "Group Billing + GST Invoice", "1000+ Cashless Network Hospitals", "Priority Ambulance Coordination", "Pre & Post Hospitalization Support", "24/7 Priority Helpline", "20-Day Waiting Period (Illness)", "Only 15% Co-Pay"], isActive: true, isPopular: true, sortOrder: 41 },

      { planCode: "CORP_PREMIUM", name: "Raksha Corporate Premium", description: "Comprehensive corporate plan with dependent coverage, dedicated account manager, and quarterly business reviews. Each employee can add one dependent (spouse or parent). Suitable for mid to large corporates. Minimum 25 employees.", shortDescription: "With dependent coverage — min 25 employees", planCategory: "corporate", membershipType: "corporate", subscriptionPeriod: "yearly", price: 3799, originalPrice: 5499, coverageAmount: 600000, maxMembers: 2, validityDays: 365, waitingPeriodDays: 10, coPay: 10, annualUsageLimit: 4, features: ["₹6 Lakh Emergency Assistance per Employee", "Covers Employee + 1 Dependent (Spouse/Parent)", "Minimum 25 Employees Required", "Dedicated Corporate Account Manager", "HR Dashboard + Quarterly Business Review", "1000+ VIP Network Hospitals", "Priority Ambulance + Air Ambulance", "Full Pre & Post Hospitalization Support", "Legal Accident Consultation per Employee", "Custom Enrollment Report", "10-Day Waiting Period (Illness)", "Only 10% Co-Pay"], isActive: true, isPopular: false, sortOrder: 42 },

      { planCode: "CORP_ENTERPRISE", name: "Raksha Corporate Enterprise", description: "The ultimate corporate wellness solution for large enterprises and MNCs. Full family coverage per employee, white-label membership cards with company branding, dedicated VIP helpline, zero co-pay, custom SLA agreements, and an assigned senior relationship manager. Minimum 50 employees. Pricing is per employee.", shortDescription: "Enterprise-grade with full family coverage — min 50 emp", planCategory: "corporate", membershipType: "corporate", subscriptionPeriod: "yearly", price: 5499, originalPrice: 7999, coverageAmount: 1000000, maxMembers: 4, validityDays: 365, waitingPeriodDays: 7, coPay: 0, annualUsageLimit: 6, features: ["₹10 Lakh Emergency Assistance per Employee", "Full Family Coverage (Employee + 3 Dependents)", "Minimum 50 Employees Required", "Zero Co-Pay on All Claims", "White-Label Membership Cards with Company Logo", "Dedicated Senior Relationship Manager", "Custom VIP Helpline Number for Company", "VIP Hospital Priority Access (Pan-India)", "Air Ambulance Coordination", "Custom SLA Agreement", "Full Pre & Post Hospitalization", "Legal Assistance Package", "Zero Processing Fees", "7-Day Fast-Track Activation", "Monthly + Quarterly Analytics Reports"], isActive: true, isPopular: false, sortOrder: 43 },

      // === SENIOR CITIZEN PLANS (2 tiers) ===
      // High-demand segment — adult children buy for parents. Higher co-pay protects loss ratio.
      // Accident coverage always zero-wait — builds immediate trust with the buyer.
      { planCode: "SENIOR_CARE", name: "Raksha Senior Care", description: "Dedicated emergency assistance for senior citizens aged 60–70 years. Covers accidents, medical emergencies, and hospitalization with priority response, personal care coordinator, and multi-language helpline. Gift your parents peace of mind.", shortDescription: "Emergency care for senior citizens aged 60–70", planCategory: "senior", membershipType: "individual", subscriptionPeriod: "yearly", price: 3499, originalPrice: 4999, coverageAmount: 300000, maxMembers: 1, validityDays: 365, waitingPeriodDays: 30, coPay: 15, annualUsageLimit: 3, features: ["Emergency Assistance up to ₹3 Lakh", "Accident Coverage — Zero Waiting Period", "Priority Hospital Admission Assistance", "24/7 Senior Helpline (Hindi + Regional Languages)", "Personal Care Coordinator", "Ambulance Coordination", "Pre & Post Hospitalization Support", "Medicine Home Delivery Coordination", "Digital Membership Card", "30-Day Waiting (Illness)", "15% Co-Pay on Claims"], isActive: true, isPopular: false, sortOrder: 50 },
      { planCode: "SENIOR_PLUS", name: "Raksha Senior Plus", description: "Premium emergency assistance for senior citizens up to 75 years. VIP hospital network, dedicated senior care manager, higher coverage, and zero processing fees. The most complete protection package for your parents — because they deserve the best.", shortDescription: "VIP senior care up to 75 years — dedicated manager", planCategory: "senior", membershipType: "individual", subscriptionPeriod: "yearly", price: 5999, originalPrice: 8499, coverageAmount: 500000, maxMembers: 1, validityDays: 365, waitingPeriodDays: 15, coPay: 10, annualUsageLimit: 4, features: ["Emergency Assistance up to ₹5 Lakh", "Covers Senior Citizens up to 75 Years", "VIP Priority Hospital Network", "Priority Ambulance (Unlimited Distance)", "Dedicated Senior Care Manager", "24/7 Priority Helpline (Multi-language)", "Full Pre & Post Hospitalization", "Medicine Home Delivery", "Legal Assistance for Accidents", "Zero Processing Fees", "15-Day Waiting (Illness)", "Only 10% Co-Pay"], isActive: true, isPopular: true, sortOrder: 51 },

      // === TWO-WHEELER RIDER PLANS (2 tiers) ===
      // 200M+ bikes on Indian roads — highest accident segment. Zero wait for accidents = instant trust.
      // Low price point drives volume; high accident rate offset by co-pay and usage cap.
      { planCode: "TW_ROAD", name: "Raksha Rider Essential", description: "Essential accident and emergency assistance for two-wheeler riders. Zero waiting period for road accidents, FIR assistance, ambulance coordination, and 24/7 emergency helpline. Because every rider on Indian roads deserves instant protection.", shortDescription: "Accident protection for bike & scooter riders", planCategory: "two_wheeler", membershipType: "individual", subscriptionPeriod: "yearly", price: 799, originalPrice: 1299, coverageAmount: 150000, maxMembers: 1, validityDays: 365, waitingPeriodDays: 30, coPay: 20, annualUsageLimit: 2, features: ["Accident Assistance up to ₹1.5 Lakh", "Zero Waiting Period — Road Accidents", "24/7 Emergency Helpline", "Ambulance Coordination", "FIR & Legal Assistance for Road Accidents", "Cashless Network Hospitals", "Towing Assistance Coordination", "Digital Membership Card", "30-Day Waiting (Illness)", "20% Co-Pay on Claims"], isActive: true, isPopular: false, sortOrder: 60 },
      { planCode: "TW_SHIELD", name: "Raksha Rider Shield", description: "Comprehensive protection for two-wheeler riders. Higher accident coverage, roadside breakdown help, personal effects loss cover, priority hospital admission, and legal consultation. The most complete plan for India's bike and scooter riders.", shortDescription: "Complete rider protection + roadside & legal assist", planCategory: "two_wheeler", membershipType: "individual", subscriptionPeriod: "yearly", price: 1499, originalPrice: 2299, coverageAmount: 300000, maxMembers: 1, validityDays: 365, waitingPeriodDays: 15, coPay: 15, annualUsageLimit: 3, features: ["Accident & Medical Assistance up to ₹3 Lakh", "Zero Waiting — Road Accident Coverage", "Priority Hospital Admission", "Priority Ambulance Coordination", "Roadside Breakdown Assistance", "Personal Effects Loss Cover (₹3,000)", "FIR + Legal Accident Consultation", "Pre & Post Hospitalization Support", "Cashless Network Hospitals", "24/7 Priority Helpline", "15-Day Waiting (Illness)", "Only 15% Co-Pay"], isActive: true, isPopular: true, sortOrder: 61 },
    ];

    // Upsert sync: update existing plans by code, create new ones, deactivate plans no longer in the list.
    const existingPlans = await storage.getPlans();
    const desiredCodes = new Set(allPlans.map(p => p.planCode.toLowerCase()));
    let created = 0, updated = 0, deactivated = 0;

    for (const plan of allPlans) {
      const existing = await storage.getPlanByCode(plan.planCode);
      if (existing) {
        await storage.updatePlan(existing.id, plan as any);
        updated++;
      } else {
        await storage.createPlan(plan as any);
        created++;
      }
    }

    for (const existing of existingPlans) {
      if (!desiredCodes.has((existing.planCode || "").toLowerCase()) && existing.isActive) {
        await storage.updatePlan(existing.id, { isActive: false } as any);
        deactivated++;
      }
    }

    log(`Plans sync: created=${created}, updated=${updated}, deactivated=${deactivated}. Active set: Individual (4) + Family (4).`);

    // Check if FAQs exist
    const existingFaqs = await storage.getActiveFaqs();
    if (existingFaqs.length === 0) {
      log("No FAQs found, seeding default FAQs...");
      const defaultFaqs = [
        { id: "faq-001", question: "What is Raksha Assist?", answer: "Raksha Assist is a membership-based emergency medical assistance program that provides hospital-direct financial support during medical emergencies. Unlike insurance, we pay directly to hospitals so you don't have to worry about reimbursement hassles.", category: "general", sortOrder: 1 },
        { id: "faq-002", question: "How is Raksha Assist different from insurance?", answer: "Insurance involves complex claims and reimbursements. Raksha Assist provides instant cashless support - we directly pay the hospital so you can focus on recovery, not paperwork.", category: "general", sortOrder: 2 },
        { id: "faq-003", question: "What emergencies are covered?", answer: "We cover accidents, medical emergencies, hospitalization due to sudden illness, and emergency surgeries. Coverage limits depend on your plan type.", category: "coverage", sortOrder: 3 },
        { id: "faq-004", question: "How do I get help during an emergency?", answer: "Call our 24/7 helpline or press the SOS button in the app. Our team will guide you to the nearest network hospital and ensure instant financial assistance.", category: "emergency", sortOrder: 4 },
        { id: "faq-005", question: "Can I add family members to my plan?", answer: "Yes! Our Family Plans cover up to 6 members including spouse, children, and dependent parents. You can also add co-applicants at affordable rates based on their age. Each member gets a digital membership card.", category: "plans", sortOrder: 5 },
        { id: "faq-006", question: "What documents are required for membership?", answer: "You need a valid Aadhar card, recent photo, and basic contact details. The entire process takes less than 5 minutes.", category: "membership", sortOrder: 6 },
        { id: "faq-007", question: "Is there a waiting period?", answer: "No waiting period for accidents! For illness-related emergencies, there is a 30-day waiting period after membership activation.", category: "coverage", sortOrder: 7 },
        { id: "faq-008", question: "How do I renew my membership?", answer: "You'll receive renewal reminders 30 days before expiry. You can renew online through the app or website, or contact your agent.", category: "membership", sortOrder: 8 },
      ];
      
      for (const faq of defaultFaqs) {
        await storage.createFaq(faq as any);
      }
      log(`Seeded ${defaultFaqs.length} default FAQs`);
    } else {
      log(`Found ${existingFaqs.length} existing FAQs, skipping seed`);
    }

    // Seed Add-On Benefits if none exist
    const existingAddOns = await storage.getAddOnBenefits();
    if (existingAddOns.length === 0) {
      log("No add-on benefits found, seeding company-favorable add-ons...");
      const defaultAddOns = [
        {
          benefitCode: "ACCIDENT_DEATH",
          name: "Personal Accident Death Benefit",
          description: "Lump sum payout to nominee in case of accidental death of the primary member. Provides financial support to family.",
          category: "accident",
          price: 499,
          benefitAmount: 25000,
          usageLimit: 1,
          validityDays: 365,
          isActive: true,
        },
        {
          benefitCode: "LEGAL_ASSIST",
          name: "Legal Assistance Cover",
          description: "Access to empanelled legal consultants for emergency legal advice (accident FIRs, insurance disputes, consumer cases). Up to 2 consultations/year.",
          category: "legal",
          price: 399,
          benefitAmount: 5000,
          usageLimit: 2,
          validityDays: 365,
          isActive: true,
        },
        {
          benefitCode: "HOSPITAL_DAILY_CASH",
          name: "Hospital Daily Cash",
          description: "₹500 cash benefit per day of hospitalization (min 24 hrs). Covers incidental expenses not billed by hospital. Max 5 days per year.",
          category: "medical",
          price: 699,
          benefitAmount: 500,
          usageLimit: 5,
          validityDays: 365,
          isActive: true,
        },
        {
          benefitCode: "FUNERAL_ASSIST",
          name: "Funeral & Last Rites Assistance",
          description: "Financial support to the family for funeral and last rites expenses in case of member's unfortunate demise during the membership period.",
          category: "life",
          price: 249,
          benefitAmount: 10000,
          usageLimit: 1,
          validityDays: 365,
          isActive: true,
        },
        {
          benefitCode: "MENTAL_WELLNESS",
          name: "Mental Wellness Tele-Consultations",
          description: "3 tele-consultation sessions with certified counselors/psychologists via our partner network. Session booking via app. Valid for 1 year.",
          category: "wellness",
          price: 599,
          benefitAmount: 3000,
          usageLimit: 3,
          validityDays: 365,
          isActive: true,
        },
        {
          benefitCode: "CRITICAL_SECOND_OPINION",
          name: "Critical Illness Second Opinion",
          description: "Get a second medical opinion from senior specialists for critical illness diagnoses (cancer, cardiac, neurological). Covers consultation fee.",
          category: "medical",
          price: 299,
          benefitAmount: 2000,
          usageLimit: 1,
          validityDays: 365,
          isActive: true,
        },
        {
          benefitCode: "HOME_NURSING",
          name: "Post-Hospitalization Home Nursing",
          description: "Trained nurse visits at home after discharge from 3+ day hospitalization. Covers up to 3 home visits. Helps recovery without re-hospitalization.",
          category: "medical",
          price: 499,
          benefitAmount: 3000,
          usageLimit: 3,
          validityDays: 365,
          isActive: true,
        },
        {
          benefitCode: "PERSONAL_EFFECTS",
          name: "Road Accident Personal Effects Loss",
          description: "Compensation for damage or loss of personal items (phone, wallet, documents) in a road accident requiring hospitalization. Simple claim process.",
          category: "accident",
          price: 349,
          benefitAmount: 3000,
          usageLimit: 1,
          validityDays: 365,
          isActive: true,
        },
      ];

      for (const addOn of defaultAddOns) {
        await storage.createAddOnBenefit(addOn as any);
      }
      log(`Seeded ${defaultAddOns.length} default add-on benefits. Manage from Super Admin Dashboard.`);
    } else {
      log(`Found ${existingAddOns.length} existing add-on benefits, skipping seed`);
    }

    const existingAgentTerms = await db.select().from(policies).where(eq(policies.type, "agent_terms")).limit(1);
    const existingFranchiseTerms = await db.select().from(policies).where(eq(policies.type, "franchise_terms")).limit(1);

    if (existingAgentTerms.length === 0) {
      log("Seeding Agent Terms & Conditions policy...");
      await db.insert(policies).values({
        type: "agent_terms",
        title: "Agent Agreement Terms & Conditions",
        version: "1.0",
        effectiveDate: new Date(),
        isActive: true,
        content: `## Agent Agreement Terms & Conditions

### Raksha Assist Private Limited
**Membership Agent Partnership Agreement**
Effective Date: February 2026 | Version 1.0

---

### 1. Definitions and Interpretation

- **"Company"** refers to Raksha Assist Private Limited, a company incorporated under the Companies Act, 2013, having its registered office at Bengaluru, Karnataka, India.
- **"Agent"** refers to the individual or entity appointed by the Company to promote, market, and facilitate the enrollment of members into Raksha Assist membership assistance programs.
- **"Member"** refers to any individual who subscribes to a Raksha Assist membership plan through the Agent.
- **"Commission"** refers to the monetary compensation payable to the Agent for each successful membership enrollment.
- **"Territory"** refers to the geographical area assigned to the Agent for conducting membership activities.

### 2. Appointment and Scope

- The Company hereby appoints the Agent as an independent contractor and not as an employee, partner, or joint venture participant of the Company.
- The Agent shall promote Raksha Assist membership plans within the assigned territory and shall comply with all applicable laws, including but not limited to the Indian Contract Act, 1872, and the Consumer Protection Act, 2019.
- The Agent shall not represent or hold themselves out as an insurance agent, broker, or financial advisor. Raksha Assist is a membership-based emergency assistance coordination program and is NOT an insurance product.

### 3. Agent Obligations

- Maintain professional conduct and represent the Company's brand with integrity and honesty.
- Accurately explain the membership benefits, limitations, coverage amounts, waiting periods, and exclusions to prospective members.
- Complete the mandatory onboarding training provided by the Company before commencing membership enrollment activities.
- Collect accurate and complete member information including valid Aadhar card, photographs, and contact details.
- Ensure all membership applications are submitted through the official Raksha Assist digital platform.
- Not engage in misleading advertising, misrepresentation, or unfair trade practices as defined under the Consumer Protection Act, 2019.
- Not make any guarantees or promises beyond the scope of the membership plan terms.
- Maintain confidentiality of all member personal data in accordance with the Information Technology Act, 2000 and applicable data protection regulations.

### 4. Commission Structure

- The Agent shall be entitled to a commission of 15% (fifteen percent) of the membership fee for each successful enrollment.
- Commission shall be payable only upon successful payment verification and membership activation.
- Commission payouts shall be processed as per the Agent's selected payout preference (daily, weekly, or monthly).
- The Company reserves the right to modify the commission structure with 30 days prior written notice.
- All commissions are subject to applicable tax deductions including TDS under the Income Tax Act, 1961.
- The Agent is solely responsible for filing their own income tax returns and GST returns (if applicable) on commission income earned.

### 5. KYC and Compliance

- The Agent must complete Know Your Customer (KYC) verification including submission of valid PAN card, Aadhar card, and bank account details.
- The Agent shall comply with all Anti-Money Laundering (AML) guidelines and shall not facilitate any fraudulent memberships.
- The Company reserves the right to conduct periodic audits of the Agent's enrollment activities.

### 6. Intellectual Property

- All trademarks, logos, marketing materials, and brand assets of Raksha Assist are the exclusive property of the Company.
- The Agent is granted a limited, non-transferable, revocable license to use the Company's brand materials solely for the purpose of promoting membership plans during the term of this agreement.
- The Agent shall not alter, modify, or create derivative works from the Company's brand materials without prior written consent.

### 7. Termination

- Either party may terminate this agreement by providing 30 days written notice.
- The Company may terminate this agreement immediately in cases of fraud, misrepresentation, violation of applicable laws, or breach of the terms contained herein.
- Upon termination, the Agent shall cease all promotional activities and return any Company materials in their possession.
- Outstanding commissions for verified and activated memberships shall be settled within 30 days of termination.

### 8. Limitation of Liability

- The Company's total liability to the Agent under this agreement shall not exceed the total commissions paid to the Agent in the preceding 12 months.
- The Company shall not be liable for any indirect, incidental, consequential, or punitive damages arising out of or in connection with this agreement.

### 9. Dispute Resolution

- Any dispute arising out of or in connection with this agreement shall first be attempted to be resolved through amicable negotiation between the parties.
- If the dispute is not resolved within 30 days of negotiation, it shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996.
- The arbitration shall be conducted in Bengaluru, Karnataka, and the language of arbitration shall be English.
- This agreement shall be governed by and construed in accordance with the laws of India, and the courts of Bengaluru shall have exclusive jurisdiction.

### 10. General Provisions

- This agreement constitutes the entire understanding between the parties and supersedes all prior negotiations, representations, or agreements.
- No amendment or modification of this agreement shall be valid unless made in writing and signed by both parties.
- The failure of either party to enforce any provision of this agreement shall not constitute a waiver of such provision.
- If any provision of this agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.

---

**Raksha Assist Private Limited**
CIN: U74999TG2024PTC123456
Registered Office: Bengaluru, Karnataka, India
Contact: support@rakshaassist.com | +91 81437 52025`
      });
      log("Seeded Agent Terms & Conditions policy");
    }

    if (existingFranchiseTerms.length === 0) {
      log("Seeding Franchise Terms & Conditions policy...");
      await db.insert(policies).values({
        type: "franchise_terms",
        title: "Franchise Agreement Terms & Conditions",
        version: "1.0",
        effectiveDate: new Date(),
        isActive: true,
        content: `## Franchise Agreement Terms & Conditions

### Raksha Assist Private Limited
**Franchise Partnership Agreement**
Effective Date: February 2026 | Version 1.0

---

### 1. Definitions and Interpretation

- **"Franchisor"** refers to Raksha Assist Private Limited, a company incorporated under the Companies Act, 2013, with registered office at Bengaluru, Karnataka, India.
- **"Franchisee"** refers to the individual or entity granted the right to operate a Raksha Assist franchise within the designated territory.
- **"Franchise Fee"** refers to the one-time, non-refundable fee paid by the Franchisee for the grant of franchise rights.
- **"Territory"** refers to the exclusive geographical area allocated to the Franchisee for operating the franchise business.
- **"Royalty"** refers to the ongoing percentage of revenue payable by the Franchisee to the Franchisor.

### 2. Franchise Levels and Investment

| Franchise Level | Territory Coverage | Franchise Fee | Commission Rate |
|---|---|---|---|
| Zone Franchise | Multiple States | ₹10,00,000 | 3% of territory revenue |
| State Franchise | Entire State | ₹5,00,000 | 4% of territory revenue |
| District Franchise | Full District | ₹2,50,000 | 5% of territory revenue |
| City Franchise | City Area | ₹1,00,000 | 6% of territory revenue |

### 3. Grant of Franchise

- Subject to the terms of this agreement, the Franchisor hereby grants to the Franchisee a non-exclusive, non-transferable right to operate a Raksha Assist franchise within the designated territory.
- The franchise rights are granted for an initial term of 3 (three) years from the date of execution of this agreement, renewable upon mutual agreement.
- The Franchisee shall operate the franchise in strict accordance with the Franchisor's operational standards, brand guidelines, and quality parameters.

### 4. Franchisee Obligations

- Pay the applicable Franchise Fee in full prior to the commencement of franchise operations.
- Establish and maintain a physical office within the designated territory with appropriate signage and branding as prescribed by the Franchisor.
- Recruit, train, and manage a team of membership agents within the territory in accordance with the Agent Agreement Terms.
- Achieve the minimum monthly enrollment targets as set by the Franchisor for the respective franchise level.
- Submit monthly business reports including enrollment data, revenue figures, and agent performance metrics.
- Maintain proper books of accounts and financial records subject to audit by the Franchisor.
- Comply with all applicable laws including the Indian Contract Act, 1872, Companies Act, 2013, Consumer Protection Act, 2019, and all local regulations.
- Not engage in any competing business during the term of this agreement and for 12 months following termination.
- Protect the confidential information and trade secrets of the Franchisor as defined under the Information Technology Act, 2000.

### 5. Franchisor Obligations

- Provide comprehensive training programs for the Franchisee and their team covering membership plans, operational procedures, and compliance requirements.
- Supply marketing materials, brand assets, and digital platform access for membership enrollment.
- Provide ongoing technical support, operational guidance, and business development assistance.
- Process and settle all membership payments and commissions in a timely manner.
- Maintain the digital platform and technology infrastructure required for franchise operations.
- Provide regular updates on new membership plans, offers, and company initiatives.

### 6. Financial Terms

- The Franchise Fee is a one-time, non-refundable payment due upon execution of this agreement.
- The Franchisee shall receive commission as per the applicable franchise level rate on all membership enrollments within their territory.
- Commission payouts shall be processed monthly within 15 working days of the preceding month's closure.
- All financial transactions are subject to applicable GST under the Goods and Services Tax Act, 2017, and TDS under the Income Tax Act, 1961.
- The Franchisee is responsible for their own GST registration, filing, and compliance.

### 7. Territory Rights

- The Franchisor shall not appoint another Franchisee of the same level within the Franchisee's designated territory during the term of this agreement.
- The Franchisee shall not conduct business or solicit members outside their designated territory without prior written approval from the Franchisor.
- The Franchisor reserves the right to modify territory boundaries with 90 days prior written notice if necessitated by business requirements.

### 8. Intellectual Property

- All trademarks, logos, brand names, marketing materials, proprietary software, and business methodologies are the exclusive property of the Franchisor.
- The Franchisee is granted a limited, revocable license to use the Franchisor's intellectual property solely for the purpose of operating the franchise during the term of this agreement.
- The Franchisee shall not register or attempt to register any trademark, domain name, or trade name that is identical or confusingly similar to the Franchisor's marks.
- Upon termination of this agreement, all rights to use the Franchisor's intellectual property shall cease immediately.

### 9. Term and Renewal

- This agreement shall be effective for an initial term of 3 (three) years from the date of execution.
- The agreement may be renewed for successive terms of 2 (two) years each upon mutual written agreement and subject to satisfactory performance by the Franchisee.
- Renewal terms and conditions, including any revised franchise fees, shall be communicated at least 90 days prior to the expiration of the current term.

### 10. Termination

- Either party may terminate this agreement by providing 90 days written notice.
- The Franchisor may terminate this agreement immediately in the event of fraud, material breach, insolvency, or criminal conviction of the Franchisee.
- Persistent failure to meet minimum enrollment targets for 3 consecutive months shall constitute grounds for termination.
- Upon termination, the Franchisee shall cease all franchise operations, return all Company materials, and de-brand the premises within 30 days.
- Outstanding commissions for verified memberships shall be settled within 60 days of termination.

### 11. Limitation of Liability

- The Franchisor's maximum aggregate liability under this agreement shall not exceed the Franchise Fee paid by the Franchisee.
- Neither party shall be liable for indirect, consequential, special, or punitive damages arising from or in connection with this agreement.
- The Franchisee acknowledges that the franchise business involves inherent risks and the Franchisor does not guarantee any specific level of revenue or profitability.

### 12. Dispute Resolution and Governing Law

- Any dispute arising out of or relating to this agreement shall first be attempted to be resolved through good faith negotiation between the parties.
- If negotiations fail within 30 days, the dispute shall be referred to mediation under the Mediation Act, 2023.
- If mediation fails, the dispute shall be finally settled by arbitration under the Arbitration and Conciliation Act, 1996, conducted in Bengaluru, Karnataka.
- The arbitral tribunal shall consist of a sole arbitrator mutually appointed by the parties.
- This agreement shall be governed by and construed in accordance with the laws of India.
- The courts at Bengaluru, Karnataka shall have exclusive jurisdiction over any legal proceedings arising from this agreement.

### 13. Force Majeure

- Neither party shall be liable for failure or delay in performing their obligations under this agreement due to circumstances beyond their reasonable control, including but not limited to natural disasters, epidemics, government actions, war, or civil unrest.
- The affected party shall notify the other party within 7 days of the occurrence of a Force Majeure event.

### 14. General Provisions

- This agreement constitutes the entire agreement between the parties and supersedes all prior agreements, understandings, and negotiations.
- No amendment, modification, or waiver of any provision of this agreement shall be effective unless in writing and signed by both parties.
- The Franchisee shall not assign or transfer their rights or obligations under this agreement without the prior written consent of the Franchisor.
- If any provision of this agreement is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
- All notices under this agreement shall be in writing and delivered by registered post, courier, or email to the addresses specified herein.

---

**IMPORTANT DISCLAIMER:**
Raksha Assist is a membership-based emergency assistance coordination platform. It is NOT an insurance company, Third Party Administrator (TPA), or financial guarantee provider. The franchise business involves the promotion and facilitation of membership enrollment only. All claims and assistance are subject to the membership plan terms and conditions.

**Raksha Assist Private Limited**
CIN: U74999TG2024PTC123456
Registered Office: Bengaluru, Karnataka, India
Franchise Enquiries: franchise@rakshaassist.com | +91 81437 52025`
      });
      log("Seeded Franchise Terms & Conditions policy");
    }
  } catch (error) {
    log("Error seeding plans/FAQs: " + error);
  }
}

// Setup static file serving synchronously (fast, no DB)
const cwd = process.cwd();
console.log(`[express] scriptDir: ${scriptDir}`);
console.log(`[express] cwd: ${cwd}`);

const isProd = process.env.NODE_ENV === 'production';
const possiblePaths = isProd ? [
  path.join(scriptDir, "public"),                    // Production: dist/public (bundled with build)
  path.join(cwd, "dist", "public"),                  // Production fallback
  path.join(cwd, "..", "frontend", "dist"),          // Sibling frontend folder
] : [
  path.join(cwd, "..", "frontend", "dist"),          // Dev: sibling frontend folder
  path.join(scriptDir, "public"),                    // Fallback: dist/public
  path.join(cwd, "dist", "public"),                  // Fallback
  path.join(cwd, "frontend", "dist"),                // Fallback
];

let frontendPath = "";
for (const p of possiblePaths) {
  const exists = fs.existsSync(p);
  console.log(`[express] Checking: ${p} - ${exists ? "found" : "not found"}`);
  if (exists) {
    frontendPath = p;
    break;
  }
}

// Routes will be registered during async initialization
// This ensures they're ready before the server starts listening

async function setupServer() {
  // Register API routes FIRST (before static serving)
  // This ensures API routes take precedence over SPA fallback
  console.log("[express] Registering routes...");
  await registerRoutes(httpServer, app);
  console.log("[express] Routes registered successfully");

  if (frontendPath) {
    console.log(`[express] Serving static from: ${frontendPath}`);
  
  // Cache-busting headers for HTML files (no cache)
  // Assets (JS/CSS) have hash in filename so can be cached longer
  app.use((req, res, next) => {
    if (req.path.endsWith('.html') || req.path === '/') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    next();
  });
  
  app.use(express.static(frontendPath, {
    maxAge: '1d',
    etag: true,
    index: false,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else if (filePath.match(/\.(js|css|woff2?|ttf|eot)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (filePath.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }
    }
  }));
  
  // Senior Dev: URL Normalization Middleware
  // Fixes issues where WhatsApp/Email links encode the '?' as '%3F'
  app.get("*", (req, res, next) => {
    const rawOriginalUrl = req.originalUrl;
    if (!req.path.startsWith("/api") && (rawOriginalUrl.includes('%3F') || rawOriginalUrl.includes('%3f'))) {
      const decodedUrl = decodeURIComponent(rawOriginalUrl);
      console.log(`[URL Fix] Normalizing URL: ${rawOriginalUrl} -> ${decodedUrl}`);
      return res.redirect(301, decodedUrl);
    }
    next();
  });

  // Consolidated SPA fallback - must be the absolute last handler
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    const indexPath = path.join(frontendPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Frontend not found");
    }
  });
} else {
  console.log("[express] No frontend build found - API-only mode (frontend served by Vite in dev)");
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.status(200).send("<!DOCTYPE html><html><head><meta charset='utf-8'><title>Raksha Assist</title></head><body><h1>Raksha Assist</h1><p>Application is starting...</p></body></html>");
    }
  });
}

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    if (!res.headersSent) {
      const clientMessage = (process.env.NODE_ENV === 'production' && status >= 500) ? "Internal Server Error" : message;
      res.status(status).json({ message: clientMessage });
    }
    console.error(`[Error] ${status} - ${message}`, err);
  });
}

async function asyncInit() {
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await seedAllRoles();
      await seedPlansAndFaqs();
      startReminderScheduler();
      isReady = true;
      log("Async initialization complete - app fully ready");
      return;
    } catch (error: any) {
      console.error(`[Init] Attempt ${attempt}/${maxRetries} failed:`, error.message);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 3000 * attempt));
      }
    }
  }
  isReady = true;
  log("Initialization failed after retries - server running without seed data");
}

export { app, httpServer, asyncInit, setupServer };

const isBootstrapped = process.env.BOOTSTRAPPED === "true";

if (!isBootstrapped) {
  const port = parseInt(process.env.PORT || "5000", 10);
  
  // Setup server (register routes) BEFORE listening
  setupServer()
    .then(async () => {
      // Routes are now registered - seed data and start listening
      httpServer.listen(port, "0.0.0.0", () => {
        log(`serving on port ${port}`);
        // Seed in background (non-blocking)
        asyncInit();
      });
    })
    .catch((err) => {
      console.error("[Fatal] Server setup failed:", err);
      process.exit(1);
    });

  process.on("SIGTERM", () => {
    log("SIGTERM received, shutting down...");
    httpServer.close(async () => {
      if (sessionPool) {
        await sessionPool.end().catch(() => {});
      }
      await gracefulShutdown();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 30000);
  });
  process.on("SIGINT", () => {
    log("SIGINT received, shutting down...");
    httpServer.close(async () => {
      if (sessionPool) {
        await sessionPool.end().catch(() => {});
      }
      await gracefulShutdown();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 30000);
  });
}

