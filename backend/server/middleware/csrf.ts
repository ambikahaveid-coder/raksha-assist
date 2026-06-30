import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_TOKEN_LENGTH = 32;

const CSRF_EXEMPT_PATHS = [
  "/api/razorpay/webhook",
  "/api/webhooks/webhook",
  "/api/sos/chat",
  "/api/chat",
  "/api/chatbot",
  "/api/auth/email-login",
  "/api/auth/mobile-login",
  "/api/auth/mobile-register",
  "/api/auth/email-register",
  "/api/auth/send-otp",
  "/api/auth/verify-otp",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/superadmin/direct-login",
  "/api/auth/firebase-verify",
  "/api/auth/logout",
  "/api/auth/register",
  "/api/csrf-token",
  "/api/mobile/",
  "/api/showroom/login",
  "/api/showroom/register",
  "/api/payment/webhook",
  "/api/payments/webhook",
  "/api/staff/login",
  "/api/super-admin/login"
];

function generateToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

function setCsrfCookie(res: Response, token: string) {
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    maxAge: 1000 * 60 * 60 * 24,
    path: "/"
  });
  res.cookie("csrf_token_js", token, {
    httpOnly: false,
    secure: true,
    sameSite: "none" as const,
    maxAge: 1000 * 60 * 60 * 24,
    path: "/"
  });
}

let _jwtSecret: string | null = null;
async function loadJwtSecret(): Promise<string> {
  if (!_jwtSecret) {
    const { getJwtSecret } = await import("../utils/secrets.js");
    _jwtSecret = getJwtSecret();
  }
  return _jwtSecret;
}

function hasValidJwt(req: Request): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return false;
  try {
    if (!_jwtSecret) return false;
    const decoded = jwt.verify(authHeader.slice(7), _jwtSecret) as any;
    return !!decoded.userId;
  } catch {
    return false;
  }
}

// Eagerly load the JWT secret so hasValidJwt can use it synchronously
loadJwtSecret().catch(() => {});

export function csrfMiddleware(req: Request, res: Response, next: NextFunction) {
  if (CSRF_EXEMPT_PATHS.some(path => req.path.startsWith(path))) {
    return next();
  }
  
  const safeMethod = ["GET", "HEAD", "OPTIONS"].includes(req.method);
  
  if (safeMethod) {
    if (!req.cookies?.[CSRF_COOKIE_NAME]) {
      const token = generateToken();
      setCsrfCookie(res, token);
    }
    return next();
  }
  
  if (hasValidJwt(req)) {
    return next();
  }
  
  if (req.session?.userId) {
    return next();
  }
  
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] as string;
  
  if (!cookieToken || !headerToken) {
    return res.status(403).json({ error: "CSRF token missing" });
  }
  
  if (cookieToken !== headerToken) {
    return res.status(403).json({ error: "CSRF token mismatch" });
  }
  
  next();
}

export function csrfTokenEndpoint(req: Request, res: Response) {
  let token = req.cookies?.[CSRF_COOKIE_NAME];
  
  if (!token) {
    token = generateToken();
    setCsrfCookie(res, token);
  }
  
  res.json({ csrfToken: token });
}
