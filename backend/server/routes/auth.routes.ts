import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { storage } from "../storage.js";
import { otpService } from "../services/otp.service.js";
import type { User } from "../../shared/schema.js";
import { getJwtSecret } from "../utils/secrets.js";
import { CANONICAL_SUPERADMIN_EMAIL, getRequiredSuperAdminConfig } from "../services/superadmin.service.js";

const router = Router();

/** Signs a JWT token safely — returns undefined if SESSION_SECRET not set */
function safeSignJwt(payload: object): string | undefined {
  try {
    return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
  } catch (err: any) {
    console.warn("[JWT] Signing failed (session-only mode):", err.message);
    return undefined;
  }
}

function sanitizeUser(user: User | null | undefined): Partial<User> | null {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

const emailLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const mobileLoginSchema = z.object({
  mobile: z.string().min(10),
  password: z.string().min(6)
});

const mobileRegisterSchema = z.object({
  mobile: z.string().min(10),
  password: z.string().min(6),
  name: z.string().min(2),
  email: z.string().email().optional()
});

const emailRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  mobile: z.string().min(10)
});

const forgotPasswordSchema = z.object({
  mobile: z.string().min(10)
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6)
});

const firebaseVerifySchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
  mobile: z.string().min(10, "Mobile number is required"),
});

const registerSchema = z.object({
  mobile: z.string().min(10),
  name: z.string(),
  email: z.string().email().optional(),
  password: z.string().min(6),
  aadhar: z.string().optional(),
  planType: z.enum(["individual", "family", "startup", "gig_worker", "corporate"]).optional().default("individual"),
  familyMembers: z.array(z.object({
    name: z.string(),
    relation: z.string(),
    dob: z.string().optional()
  })).optional()
});

function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

let membershipCounter = 0;
function generateMembershipNumber(): string {
  membershipCounter = (membershipCounter + 1) % 1000;
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  const inc = membershipCounter.toString().padStart(3, "0");
  return `RA-${timestamp}${randomSuffix}${inc}`;
}

router.post("/mobile-register", async (req: Request, res: Response) => {
  try {
    const parsed = mobileRegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const { mobile, password, name, email } = parsed.data;
    const existingUser = await storage.getUserByMobile(mobile);
    
    if (existingUser) {
      if (existingUser.isBlocked) {
        return res.status(403).json({ 
          error: "This account has been blocked. Please contact support for assistance.",
          code: "ACCOUNT_BLOCKED"
        });
      }
      if (existingUser.isSuspended) {
        const suspendedUntil = existingUser.suspendedUntil 
          ? new Date(existingUser.suspendedUntil).toLocaleDateString() 
          : "indefinitely";
        return res.status(403).json({ 
          error: `This account is suspended until ${suspendedUntil}. Reason: ${existingUser.suspendedReason || "Policy violation"}`,
          code: "ACCOUNT_SUSPENDED"
        });
      }
      return res.status(400).json({ 
        error: "This mobile number is already registered. Please login instead.",
        code: "ALREADY_REGISTERED"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await storage.createUser({
      mobile,
      passwordHash,
      name,
      email: email || null,
      role: "user",
    });

    req.session.userId = user.id;
    req.session.userRole = user.role;

    try {
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => { if (err) reject(err); else resolve(); });
      });
    } catch (sessionErr) {
      console.warn("Session save failed (using JWT fallback):", sessionErr);
    }

    const token = safeSignJwt({ userId: user.id, role: user.role, mobile: user.mobile });
    
    res.status(201).json({ 
      success: true, 
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
});

router.post("/mobile-login", async (req: Request, res: Response) => {
  try {
    const parsed = mobileLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const { mobile, password } = parsed.data;
    const user = await storage.getUserByMobile(mobile);
    
    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid mobile number or password" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: "Your account has been blocked. Please contact support." });
    }

    req.session.userId = user.id;
    req.session.userRole = user.role;

    try {
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => { if (err) reject(err); else resolve(); });
      });
    } catch (sessionErr) {
      console.warn("Session save failed (using JWT fallback):", sessionErr);
    }

    const token = safeSignJwt({ userId: user.id, role: user.role, mobile: user.mobile });

    res.json({ 
      success: true, 
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

router.post("/email-login", async (req: Request, res: Response) => {
  try {
    const parsed = emailLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const { email, password } = parsed.data;
    const user = await storage.getUserByEmail(email.toLowerCase().trim());
    
    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: "Your account has been blocked. Please contact support." });
    }

    req.session.userId = user.id;
    req.session.userRole = user.role;

    try {
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => { if (err) reject(err); else resolve(); });
      });
    } catch (sessionErr) {
      console.warn("Session save failed (using JWT fallback):", sessionErr);
    }

    const token = safeSignJwt({ userId: user.id, role: user.role, email: user.email });

    res.json({ 
      success: true, 
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    console.error("Email login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

router.post("/email-register", async (req: Request, res: Response) => {
  try {
    const parsed = emailRegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const { email, password, name, mobile } = parsed.data;
    
    const existingEmail = await storage.getUserByEmail(email.toLowerCase().trim());
    if (existingEmail) {
      return res.status(400).json({ error: "Email already registered" });
    }
    
    const existingMobile = await storage.getUserByMobile(mobile);
    if (existingMobile) {
      return res.status(400).json({ error: "Mobile number already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await storage.createUser({
      email: email.toLowerCase().trim(),
      mobile,
      passwordHash,
      name,
      role: "user",
    });

    req.session.userId = user.id;
    req.session.userRole = user.role;

    try {
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => { if (err) reject(err); else resolve(); });
      });
    } catch (sessionErr) {
      console.warn("Session save failed (using JWT fallback):", sessionErr);
    }

    const token = safeSignJwt({ userId: user.id, role: user.role, email: user.email });

    res.status(201).json({ 
      success: true, 
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    console.error("Email registration error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
});

router.post("/send-otp", async (req: Request, res: Response) => {
  try {
    const schema = z.object({ 
      mobile: z.string()
        .min(10, "Phone number must be at least 10 digits")
        .max(20, "Phone number is too long")
        .transform(m => m.replace(/[\s\-()]/g, ''))
        .refine(m => /^[+]?[0-9]{10,15}$/.test(m), "Invalid phone number format")
    });
    
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: parseResult.error.errors[0]?.message || "Invalid phone number" 
      });
    }
    
    const { mobile } = parseResult.data;
    const normalizedMobile = mobile.replace(/\D/g, '').slice(-10);
    
    const isBlocked = await storage.isBlocked(normalizedMobile, "otp");
    if (isBlocked) {
      const attempt = await storage.getLoginAttempts(normalizedMobile, "otp");
      const remainingMins = attempt?.blockedUntil 
        ? Math.ceil((attempt.blockedUntil.getTime() - Date.now()) / 60000) 
        : 30;
      return res.status(429).json({ 
        error: `Too many attempts. Please try again in ${remainingMins} minutes.` 
      });
    }
    
    const existingUser = await storage.getUserByMobile(normalizedMobile);
    
    const otpCode = otpService.generateOTP();
    const expiresAt = new Date(Date.now() + 600 * 1000);
    
    await storage.createOtp({
      mobile: normalizedMobile,
      otpCode,
      expiresAt,
      verified: false
    });
    
    const sendResult = await otpService.sendOTP(normalizedMobile, otpCode);
    
    if (!sendResult.success) {
      return res.status(500).json({ error: "Failed to send OTP. Please try again." });
    }
    
    res.json({ 
      success: true, 
      message: "OTP sent successfully",
      isNewUser: !existingUser,
      phoneStored: true
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(400).json({ error: "Failed to send OTP. Please check your phone number." });
  }
});

router.post("/verify-otp", async (req: Request, res: Response) => {
  try {
    const schema = z.object({ 
      mobile: z.string()
        .min(10, "Phone number must be at least 10 digits")
        .regex(/^[+]?[0-9]{10,15}$/, "Invalid phone number format"),
      otp: z.string()
        .length(6, "OTP must be 6 digits")
        .regex(/^[0-9]{6}$/, "OTP must contain only digits")
    });
    
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: parseResult.error.errors[0]?.message || "Invalid input" 
      });
    }
    
    const { mobile, otp } = parseResult.data;
    const normalizedMobile = mobile.replace(/\D/g, '').slice(-10);
    
    const isBlocked = await storage.isBlocked(normalizedMobile, "otp");
    if (isBlocked) {
      const attempt = await storage.getLoginAttempts(normalizedMobile, "otp");
      const remainingMins = attempt?.blockedUntil 
        ? Math.ceil((attempt.blockedUntil.getTime() - Date.now()) / 60000) 
        : 30;
      return res.status(429).json({ 
        error: `Too many failed attempts. Please try again in ${remainingMins} minutes.` 
      });
    }
    
    const verified = await storage.verifyOtp(normalizedMobile, otp);
    
    if (!verified) {
      await storage.recordFailedLogin(normalizedMobile, "otp");
      const attempts = await storage.getLoginAttempts(normalizedMobile, "otp");
      const remaining = 5 - (attempts?.attemptCount || 0);
      
      if (remaining > 0) {
        return res.status(400).json({ 
          error: `Invalid or expired OTP. ${remaining} attempts remaining.` 
        });
      } else {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }
    }
    
    await storage.resetLoginAttempts(normalizedMobile, "otp");
    
    let user = await storage.getUserByMobile(normalizedMobile);
    
    if (user && user.isBlocked) {
      return res.status(403).json({ 
        error: "Your account has been blocked. Please contact support for assistance." 
      });
    }
    
    const isNewUser = !user;
    
    if (!user) {
      user = await storage.createUser({
        mobile: normalizedMobile,
        role: "user"
      });
    }
    
    req.session.userId = user.id.toString();
    req.session.userRole = user.role;

    try {
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => { if (err) reject(err); else resolve(); });
      });
    } catch (sessionErr) {
      console.warn("Session save failed (using JWT fallback):", sessionErr);
    }

    const token = safeSignJwt({ userId: user.id, role: user.role, mobile: user.mobile });
    
    res.json({ 
      success: true, 
      user: sanitizeUser(user),
      isNewUser,
      token,
      message: isNewUser ? "Account created successfully" : "Login successful"
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(400).json({ error: "Failed to verify OTP. Please try again." });
  }
});

router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid mobile number" });
    }

    const { mobile } = parsed.data;
    const normalizedMobile = mobile.replace(/\D/g, '').slice(-10);
    const user = await storage.getUserByMobile(normalizedMobile);

    res.json({
      success: true,
      message: "If an account exists with this mobile number, a password reset link has been sent to the registered email."
    });

    if (user && user.email) {
      const token = generateResetToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await storage.createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt
      });

      try {
        const { emailService } = await import('../services/email.service');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
        await emailService.sendEmail({
          to: user.email,
          subject: 'Password Reset - Raksha Assist',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a365d;">Password Reset Request</h2>
              <p>Hello ${user.name || 'Member'},</p>
              <p>We received a request to reset your password. Click the button below to set a new password:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #e53e3e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
              </p>
              <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
              <p>For support, call <strong>+91 81437 52025</strong> (24/7)</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="color: #888; font-size: 12px;">Raksha Assist - Mindwhile IT Solutions Pvt Ltd</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('[Auth] Failed to send password reset email:', emailError);
      }
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
});

router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const { token, password } = parsed.data;
    
    const resetToken = await storage.getPasswordResetToken(token);
    
    if (!resetToken || resetToken.usedAt || new Date(resetToken.expiresAt) < new Date()) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await storage.updateUser(resetToken.userId, { passwordHash });
    await storage.usePasswordResetToken(token);
    
    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

router.post("/firebase-verify", async (req: Request, res: Response) => {
  try {
    const { idToken, mobile } = firebaseVerifySchema.parse(req.body);
    const normalizedMobile = mobile.replace(/\D/g, "").slice(-10);
    const admin = await import("firebase-admin");

    if (!admin.apps.length) {
      const firebaseConfig = await storage.getSystemSetting("config_firebase");
      if (!firebaseConfig?.value) {
        return res.status(500).json({ error: "Firebase not configured. Please contact support." });
      }

      const config = JSON.parse(firebaseConfig.value);
      if (!config.serviceAccountKey) {
        admin.initializeApp({ projectId: config.projectId });
      } else {
        admin.initializeApp({
          credential: admin.credential.cert(JSON.parse(config.serviceAccountKey)),
        });
      }
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebasePhone = decodedToken.phone_number?.replace(/\D/g, "").slice(-10);
    if (firebasePhone !== normalizedMobile) {
      return res.status(401).json({ error: "Phone number mismatch" });
    }

    let user = await storage.getUserByMobile(normalizedMobile);
    if (!user) {
      user = await storage.createUser({
        mobile: normalizedMobile,
        role: "user",
        isBlocked: false,
        emailVerified: false,
      });
    } else if (user.isBlocked) {
      return res.status(403).json({ error: "Account is blocked. Contact support." });
    }

    req.session.userId = user.id;
    req.session.userRole = user.role;

    try {
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => { if (err) reject(err); else resolve(); });
      });
    } catch (sessionErr) {
      console.warn("Session save failed (using JWT fallback):", sessionErr);
    }

    const token = safeSignJwt({ userId: user.id, role: user.role, mobile: user.mobile });
    res.json({ success: true, user: sanitizeUser(user), token });
  } catch (error: any) {
    console.error("[Firebase Auth] Verification error:", error);
    res.status(400).json({ error: error.message || "Verification failed" });
  }
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { mobile, name, email, password, aadhar, planType, familyMembers } = registerSchema.parse(req.body);
    const normalizedMobile = mobile.replace(/\D/g, "").slice(-10);
    const existingUser = await storage.getUserByMobile(normalizedMobile);

    if (existingUser && existingUser.name && existingUser.name.trim() !== "") {
      const existingMembership = await storage.getMembershipByUserId(existingUser.id);
      if (existingMembership) {
        return res.status(409).json({ error: "Account already exists with this mobile number. Please login instead." });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = existingUser
      ? await storage.updateUser(existingUser.id, {
          name,
          email: email || null,
          aadhar: aadhar || null,
          passwordHash,
        })
      : await storage.createUser({
          mobile: normalizedMobile,
          name,
          email: email || null,
          passwordHash,
          role: "user",
        });

    const membership = await storage.createMembership({
      userId: user.id,
      membershipNumber: generateMembershipNumber(),
      planType,
      status: "active",
      expiryDate: null,
    });

    if (planType === "family" && familyMembers && familyMembers.length > 0) {
      for (const member of familyMembers) {
        await storage.createFamilyMember({
          membershipId: membership.id,
          ...member,
        });
      }
    }

    req.session.userId = user.id;
    req.session.userRole = user.role;

    try {
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => { if (err) reject(err); else resolve(); });
      });
    } catch (sessionErr) {
      console.warn("Session save failed (using JWT fallback):", sessionErr);
    }

    const token = safeSignJwt({ userId: user.id, role: user.role, mobile: user.mobile });
    res.json({ success: true, user: sanitizeUser(user), membership, token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ error: "Failed to complete registration" });
  }
});

router.get("/me", async (req: Request, res: Response) => {
  let userId = req.session?.userId;
  
  if (!userId) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const secret = getJwtSecret();
        const decoded = jwt.verify(authHeader.slice(7), secret) as any;
        if (decoded.userId) {
          userId = decoded.userId;
          if (req.session) {
            req.session.userId = decoded.userId;
            req.session.userRole = decoded.role;
          }
        }
      } catch (err) {}
    }
  }
  
  if (!userId) {
    return res.json({ user: null, membership: null });
  }
  
  const user = await storage.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  
  const membership = await storage.getMembershipByUserId(user.id);
  let familyMembers: any[] = [];
  
  if (membership) {
    familyMembers = await storage.getFamilyMembers(membership.id);
  }
  
  res.json({ user: sanitizeUser(user), membership, familyMembers });
});

router.post("/logout", async (req: Request, res: Response) => {
  res.clearCookie('connect.sid', { path: '/' });
  res.clearCookie('csrf_token', { path: '/' });
  res.clearCookie('csrf_token_js', { path: '/' });
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
  
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  } else {
    res.json({ success: true });
  }
});

router.get("/session-debug", (req: Request, res: Response) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ error: "Not found" });
  }
  res.json({
    sessionID: req.sessionID,
    hasSession: !!req.session,
    userId: req.session?.userId || null,
    userRole: req.session?.userRole || null,
    cookie: req.session?.cookie ? {
      maxAge: req.session.cookie.maxAge,
      secure: req.session.cookie.secure,
      httpOnly: req.session.cookie.httpOnly,
      sameSite: req.session.cookie.sameSite,
    } : null,
  });
});

router.post("/superadmin/direct-login", async (req: Request, res: Response) => {
  try {
    const superAdminConfig = getRequiredSuperAdminConfig();
    const parsed = emailLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid email or password format" });
    }
    
    const { email: rawEmail, password } = parsed.data;
    const email = rawEmail.toLowerCase().trim();
    if (email !== CANONICAL_SUPERADMIN_EMAIL || email !== superAdminConfig.email) {
      try { await storage.recordFailedLogin(email, "email"); } catch {}
      return res.status(401).json({ error: "Invalid credentials or unauthorized access" });
    }

    const user = await storage.getUserByEmail(CANONICAL_SUPERADMIN_EMAIL);

    if (!user || !user.passwordHash || user.role !== "super_admin") {
      try { await storage.recordFailedLogin(email, "email"); } catch {}
      return res.status(401).json({ error: "Invalid credentials or unauthorized access" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: "Account is blocked. Contact support." });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      try { await storage.recordFailedLogin(email, "email"); } catch {}
      return res.status(401).json({ error: "Invalid credentials or unauthorized access" });
    }

    try { await storage.resetLoginAttempts(email, "email"); } catch {}

    // Non-fatal audit log — don't let it break login
    try {
      await storage.createAuditLog({
        userId: user.id,
        action: "super_admin_login",
        details: `Login via direct email/password from IP: ${req.ip || 'unknown'}`,
      });
    } catch (auditErr) {
      console.warn("[SuperAdmin Login] Audit log failed (non-fatal):", auditErr);
    }

    req.session.userId = user.id;
    req.session.userRole = user.role;
    
    try {
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (sessionErr) {
      console.warn("Session save failed (using JWT fallback):", sessionErr);
    }
    
    const token = safeSignJwt({ userId: user.id, role: user.role, email: user.email });

    res.json({ success: true, user: sanitizeUser(user), token });
  } catch (error: any) {
    console.error("Super admin direct login error:", error);
    res.status(400).json({ error: "Login failed", details: error?.message || "Unknown error" });
  }
});

export default router;
