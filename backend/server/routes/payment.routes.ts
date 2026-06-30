import { Router, Request, Response } from "express";
import { z } from "zod";
import crypto from "crypto";
import { storage } from "../storage.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  calculatePaymentPricing,
  paymentRequestSchema,
} from "../services/payment-pricing.service.js";

const router = Router();

type RazorpayCredentialCandidate = {
  keyId: string;
  keySecret: string;
  source: "env" | "db_system_setting" | "db_integration";
};

async function getRazorpayCredentialCandidates(): Promise<RazorpayCredentialCandidate[]> {
  const candidates: RazorpayCredentialCandidate[] = [];
  const seen = new Set<string>();

  const addCandidate = (
    source: RazorpayCredentialCandidate["source"],
    keyId?: string | null,
    keySecret?: string | null,
  ) => {
    if (!keyId || !keySecret) return;
    const candidateKey = `${keyId}::${keySecret}`;
    if (seen.has(candidateKey)) return;
    seen.add(candidateKey);
    candidates.push({ source, keyId, keySecret });
  };

  addCandidate("env", process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);

  const configRazorpay = await storage.getSystemSetting("config_razorpay");
  if (configRazorpay?.value) {
    try {
      const config = JSON.parse(configRazorpay.value);
      if (config.enabled) {
        addCandidate("db_system_setting", config.keyId, config.keySecret);
      }
    } catch (parseErr) {
      console.error("[Razorpay] Failed to parse config_razorpay JSON:", parseErr);
    }
  }

  const razorpayIntegration = await storage.getIntegrationSettingByProvider("razorpay");
  if (razorpayIntegration?.isActive && razorpayIntegration.config) {
    try {
      const config = JSON.parse(razorpayIntegration.config);
      addCandidate("db_integration", config.keyId, config.keySecret);
    } catch (parseErr) {
      console.error("[Razorpay] Failed to parse integration config JSON:", parseErr);
    }
  }

  return candidates;
}

async function getRazorpaySecretCandidates(): Promise<string[]> {
  const secrets = new Set<string>();

  if (process.env.RAZORPAY_KEY_SECRET) {
    secrets.add(process.env.RAZORPAY_KEY_SECRET);
  }

  const configRazorpay = await storage.getSystemSetting("config_razorpay");
  if (configRazorpay?.value) {
    try {
      const config = JSON.parse(configRazorpay.value);
      if (config.enabled && config.keySecret) {
        secrets.add(config.keySecret);
      }
    } catch (parseErr) {
      console.error("[Razorpay] Failed to parse verify config_razorpay JSON:", parseErr);
    }
  }

  const razorpayIntegration = await storage.getIntegrationSettingByProvider("razorpay");
  if (razorpayIntegration?.isActive && razorpayIntegration.config) {
    try {
      const config = JSON.parse(razorpayIntegration.config);
      if (config.keySecret) {
        secrets.add(config.keySecret);
      }
    } catch (parseErr) {
      console.error("[Razorpay] Failed to parse verify integration config JSON:", parseErr);
    }
  }

  const sysConfig = await storage.getSystemSetting("RAZORPAY_KEY_SECRET");
  if (sysConfig?.value) {
    secrets.add(sysConfig.value);
  }

  return Array.from(secrets);
}

function isRazorpayAuthFailure(error: any): boolean {
  return error?.statusCode === 401 || error?.error?.description === "Authentication failed";
}

function generateMembershipNumber(): string {
  const num = Math.floor(Math.random() * 100000);
  return `RA-${num.toString().padStart(5, '0')}`;
}

function getPaymentStatusMessage(paymentStatus: string, membershipStatus?: string): string {
  if (membershipStatus === "active") {
    return "Your membership is active!";
  }
  if (membershipStatus === "pending_cash") {
    return "Your membership is being processed. Cash payment is pending verification by the super admin.";
  }
  switch (paymentStatus) {
    case "created": return "Payment pending. Please complete your payment.";
    case "processing": return "Payment is being verified. Please wait...";
    case "pending_cash": return "Cash payment submitted. Processing - awaiting super admin confirmation.";
    case "succeeded": return "Payment successful! Your membership is now active.";
    case "failed": return "Payment failed. Please try again or contact support.";
    default: return "Payment status unknown. Please contact support.";
  }
}

// Returns a booleans-only snapshot of where Razorpay credentials are (or aren't) configured.
// Exposes zero secret material — only presence flags — so it is safe to hit without auth
// while debugging a misconfigured production deployment.
router.get("/diag/razorpay", async (_req: Request, res: Response) => {
  const envKeyId = process.env.RAZORPAY_KEY_ID || "";
  const envKeySecret = process.env.RAZORPAY_KEY_SECRET || "";

  const result: any = {
    env: {
      hasKeyId: Boolean(envKeyId),
      hasKeySecret: Boolean(envKeySecret),
      keyIdPrefix: envKeyId ? envKeyId.slice(0, 8) + "..." : null,
      keyIdLooksLive: envKeyId.startsWith("rzp_live_"),
      keyIdLooksTest: envKeyId.startsWith("rzp_test_")
    },
    dbSystemSetting: { exists: false, enabled: false, hasKeyId: false, hasKeySecret: false },
    dbIntegration: { exists: false, active: false, hasKeyId: false, hasKeySecret: false },
    effective: { resolved: false, source: null as string | null }
  };

  try {
    const configRazorpay = await storage.getSystemSetting("config_razorpay");
    if (configRazorpay?.value) {
      result.dbSystemSetting.exists = true;
      try {
        const parsed = JSON.parse(configRazorpay.value);
        result.dbSystemSetting.enabled = Boolean(parsed.enabled);
        result.dbSystemSetting.hasKeyId = Boolean(parsed.keyId);
        result.dbSystemSetting.hasKeySecret = Boolean(parsed.keySecret);
      } catch {
        result.dbSystemSetting.parseError = true;
      }
    }
  } catch {}

  try {
    const integration = await storage.getIntegrationSettingByProvider("razorpay");
    if (integration) {
      result.dbIntegration.exists = true;
      result.dbIntegration.active = Boolean(integration.isActive);
      if (integration.config) {
        try {
          const parsed = JSON.parse(integration.config);
          result.dbIntegration.hasKeyId = Boolean(parsed.keyId);
          result.dbIntegration.hasKeySecret = Boolean(parsed.keySecret);
        } catch {
          result.dbIntegration.parseError = true;
        }
      }
    }
  } catch {}

  if (result.env.hasKeyId && result.env.hasKeySecret) {
    result.effective = { resolved: true, source: "env" };
  } else if (result.dbSystemSetting.enabled && result.dbSystemSetting.hasKeyId && result.dbSystemSetting.hasKeySecret) {
    result.effective = { resolved: true, source: "db_system_setting" };
  } else if (result.dbIntegration.active && result.dbIntegration.hasKeyId && result.dbIntegration.hasKeySecret) {
    result.effective = { resolved: true, source: "db_integration" };
  }

  res.json(result);
});

router.post("/create-order", requireAuth, async (req: Request, res: Response) => {
  try {
    const payload = paymentRequestSchema.parse(req.body);
    const pricing = await calculatePaymentPricing(payload);
    const membershipNumber = generateMembershipNumber();

    const credentialCandidates = await getRazorpayCredentialCandidates();
    if (credentialCandidates.length === 0) {
      console.error("[Razorpay] No credentials found. env.keyId=%s env.keySecret=%s",
        Boolean(process.env.RAZORPAY_KEY_ID), Boolean(process.env.RAZORPAY_KEY_SECRET));
      return res.status(500).json({
        error: "Payment gateway not configured. Please contact support.",
        diagnostic: "Call GET /api/payments/diag/razorpay for a detailed source breakdown."
      });
    }

    const userId = req.session!.userId as string;
    const Razorpay = (await import("razorpay")).default;
    let order: { id: string } | null = null;
    let successfulCandidate: RazorpayCredentialCandidate | null = null;
    let lastRazorpayError: any = null;

    for (const candidate of credentialCandidates) {
      try {
        console.log("[Razorpay] Trying credentials from source=%s keyIdPrefix=%s",
          candidate.source, candidate.keyId.slice(0, 8));

        const razorpay = new Razorpay({
          key_id: candidate.keyId,
          key_secret: candidate.keySecret
        });

        order = await razorpay.orders.create({
          amount: pricing.totalWithGst * 100,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          notes: {
            planType: pricing.plan.planCode,
            paymentFrequency: pricing.paymentFrequency,
            userId
          }
        }) as { id: string };

        successfulCandidate = candidate;
        break;
      } catch (candidateError: any) {
        lastRazorpayError = candidateError;
        if (isRazorpayAuthFailure(candidateError)) {
          console.warn("[Razorpay] Authentication failed for source=%s keyIdPrefix=%s",
            candidate.source, candidate.keyId.slice(0, 8));
          continue;
        }
        throw candidateError;
      }
    }

    if (!order || !successfulCandidate) {
      console.error("[Razorpay] All configured credentials failed authentication");
      return res.status(502).json({
        error: "Payment gateway authentication failed. Please contact support.",
        diagnostic: "Configured Razorpay keys were rejected by Razorpay."
      });
    }

    let membership = await storage.getMembershipByUserId(userId);
    
    if (membership) {
      membership = await storage.updateMembership(membership.id, {
        planType: pricing.plan.planCode,
        planAmount: pricing.subtotal,
        coverageAmount: pricing.plan.coverageAmount || 300000,
        status: "pending_payment",
        paymentStatus: "pending",
        razorpayOrderId: order.id
      });
    } else {
      membership = await storage.createMembership({
        userId,
        membershipNumber,
        planType: pricing.plan.planCode,
        planAmount: pricing.subtotal,
        coverageAmount: pricing.plan.coverageAmount || 300000,
        status: "pending_payment",
        paymentStatus: "pending",
        razorpayOrderId: order.id
      });
    }

    await storage.createPayment({
      userId,
      membershipId: membership!.id,
      amount: pricing.totalWithGst,
      razorpayOrderId: order.id,
      status: "created",
      planType: pricing.plan.planCode,
      planAmount: pricing.subtotal,
      metadata: JSON.stringify({
        ...pricing.metadata,
        termsAgreedAt: payload.termsAgreedAt || new Date().toISOString(),
        termsVersion: "v1.0",
      })
    });

    const user = await storage.getUserById(userId);
    const needsKyc = !user?.aadhar || !user?.aadharFrontUrl || !user?.aadharBackUrl;

    res.json({ 
      success: true,
      orderId: order.id,
      amount: pricing.totalWithGst * 100,
      currency: "INR",
      keyId: successfulCandidate.keyId,
      membershipId: membership!.id,
      needsKyc,
      pricing: {
        paymentFrequency: pricing.paymentFrequency,
        subtotal: pricing.subtotal,
        gstAmount: pricing.gstAmount,
        totalWithGst: pricing.totalWithGst,
      },
      prefill: {
        name: user?.name || "",
        contact: user?.mobile || "",
        email: user?.email || ""
      }
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    res.status(400).json({ error: error?.error?.description || error?.message || "Failed to create payment order" });
  }
});

router.post("/cash-request", requireAuth, async (req: Request, res: Response) => {
  try {
    const requestingUser = await storage.getUserById(req.session!.userId as string);
    if (!requestingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const cashEligibleRoles = ["employee", "agent", "zone_franchise", "state_franchise", "district_franchise", "city_franchise"];
    if (!cashEligibleRoles.includes(requestingUser.role)) {
      return res.status(403).json({ error: "Cash payment is not available for your account. Please use online payment." });
    }

    const payload = paymentRequestSchema.parse(req.body);
    const pricing = await calculatePaymentPricing(payload);
    const membershipNumber = generateMembershipNumber();

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + pricing.validityDays);

    const membership = await storage.createMembership({
      userId: requestingUser.id,
      membershipNumber,
      planType: pricing.plan.planCode,
      planAmount: pricing.subtotal,
      coverageAmount: pricing.plan.coverageAmount,
      status: "pending_cash",
      paymentStatus: "pending_cash",
      paymentMethod: "cash",
      expiryDate,
    });

    await storage.createPayment({
      membershipId: membership.id,
      userId: requestingUser.id,
      amount: pricing.totalWithGst,
      paymentMethod: "cash",
      status: "pending_cash",
      razorpayOrderId: `cash_order_${Date.now()}`,
      planType: pricing.plan.planCode,
      planAmount: pricing.subtotal,
      metadata: JSON.stringify({
        ...pricing.metadata,
        termsAgreedAt: payload.termsAgreedAt || new Date().toISOString(),
        termsVersion: "v1.0",
        cashRequest: {
          createdBy: requestingUser.id,
          createdAt: new Date().toISOString(),
        },
      }),
    });

    res.json({
      success: true,
      message: "Cash payment request created. Your membership will be activated once payment is confirmed.",
      membershipNumber,
      amount: pricing.totalWithGst,
      paymentFrequency: pricing.paymentFrequency,
    });
  } catch (error) {
    console.error("Cash payment request error:", error);
    res.status(400).json({ error: "Failed to create cash payment request" });
  }
});

router.post("/verify", requireAuth, async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = z.object({
      razorpay_order_id: z.string(),
      razorpay_payment_id: z.string(),
      razorpay_signature: z.string()
    }).parse(req.body);

    const razorpaySecrets = await getRazorpaySecretCandidates();
    if (razorpaySecrets.length === 0) {
      return res.status(500).json({ error: "Payment gateway not configured" });
    }

    const signatureMatched = razorpaySecrets.some((secret) => {
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
      return generatedSignature === razorpay_signature;
    });

    if (!signatureMatched) {
      const payment = await storage.getPaymentByOrderId(razorpay_order_id);
      if (payment) {
        await storage.updatePayment(payment.id, {
          status: "failed",
          statusReason: "Invalid signature - verification failed"
        });
      }
      
      await storage.createAuditLog({
        action: "payment_verification_failed",
        userId: req.session!.userId,
        details: `Signature mismatch for order ${razorpay_order_id}`,
        ipAddress: req.ip || "unknown"
      });
      
      return res.status(400).json({ 
        error: "Payment verification failed", 
        status: "failed",
        message: "Payment signature verification failed. Please contact support if amount was deducted."
      });
    }

    const payment = await storage.getPaymentByOrderId(razorpay_order_id);
    if (!payment) {
      return res.status(404).json({ error: "Payment record not found" });
    }

    // Signature is valid - payment is successful. Activate membership immediately.
    const result = await storage.processPaymentTransaction({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      method: "razorpay"
    });

    if (!result.success) {
      console.error(`Payment transaction failed: ${result.error}`);
      return res.status(500).json({ error: result.error || "Payment processing failed" });
    }

    // Update payment with signature
    await storage.updatePayment(payment.id, {
      razorpaySignature: razorpay_signature
    });

    const membership = await storage.getMembershipByOrderId(razorpay_order_id);

    await storage.createAuditLog({
      action: "payment_verified",
      userId: req.session!.userId,
      details: `Payment verified and membership activated for order ${razorpay_order_id}, payment ${razorpay_payment_id}`,
      ipAddress: req.ip || "unknown"
    });

    // Send email notifications
    try {
      const { emailService } = await import('../services/email.service');
      const user = await storage.getUserById(req.session!.userId as string);
      
      if (user?.email && membership) {
        const plan = await storage.getPlanByCode(membership.planType.toUpperCase());
        const totalAmount = payment.amount;
        
        await emailService.sendPaymentReceiptEmail(user.email, user.name || "Member", {
          amount: totalAmount,
          planName: plan?.name || membership.planType,
          membershipNumber: membership.membershipNumber,
          transactionId: razorpay_payment_id,
          paymentDate: new Date(),
          validityStart: new Date(membership.startDate || new Date()),
          validityEnd: new Date(membership.expiryDate || new Date()),
          coverage: membership.coverageAmount || 0
        });

        await emailService.sendWelcomeEmail(user.email, user.name || "Member");
      }
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
    }

    res.json({ 
      success: true, 
      status: "active",
      membershipNumber: membership?.membershipNumber,
      message: "Payment successful! Your membership is now active."
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(400).json({ error: "Payment verification failed" });
  }
});

router.get("/status/:orderId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const payment = await storage.getPaymentByOrderId(orderId);
    
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    if (payment.userId !== req.session!.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const membership = await storage.getMembershipByOrderId(orderId);

    res.json({
      paymentStatus: payment.status,
      membershipStatus: membership?.status,
      transactionId: payment.transactionId,
      message: getPaymentStatusMessage(payment.status, membership?.status)
    });
  } catch (error) {
    res.status(400).json({ error: "Failed to get payment status" });
  }
});

export default router;
