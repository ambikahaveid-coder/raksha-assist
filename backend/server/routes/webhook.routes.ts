import { Router, Request, Response } from "express";
import crypto from "crypto";
import { storage } from "../storage.js";

const router = Router();

router.post("/webhook", async (req: Request, res: Response) => {
  try {
    let razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeySecret) {
      const configRazorpay = await storage.getSystemSetting("config_razorpay");
      if (configRazorpay?.value) {
        try {
          const config = JSON.parse(configRazorpay.value);
          if (config.enabled && config.keySecret) {
            razorpayKeySecret = config.keySecret;
          }
        } catch (parseErr) {
          console.error("Failed to parse webhook config_razorpay:", parseErr);
        }
      }
    }

    if (!razorpayKeySecret) {
      const razorpayIntegration = await storage.getIntegrationSettingByProvider("razorpay");
      if (razorpayIntegration?.isActive && razorpayIntegration.config) {
        try {
          const config = JSON.parse(razorpayIntegration.config);
          if (config.keySecret) razorpayKeySecret = config.keySecret;
        } catch (parseErr) {
          console.error("Failed to parse webhook Razorpay integration config:", parseErr);
        }
      }
    }

    if (!razorpayKeySecret) {
      const sysKeySecret = await storage.getSystemSetting("RAZORPAY_KEY_SECRET");
      razorpayKeySecret = sysKeySecret?.value || undefined;
    }

    if (!razorpayKeySecret) {
      return res.status(500).json({ error: "Webhook not configured" });
    }

    const webhookSignature = req.headers["x-razorpay-signature"] as string;
    const webhookBody = (req as any).rawBody ? (req as any).rawBody : JSON.stringify(req.body);
    
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(webhookBody)
      .digest("hex");

    if (webhookSignature !== expectedSignature) {
      console.error("Webhook signature mismatch");
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === "payment.captured") {
      const paymentEntity = payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const method = paymentEntity.method;

      const payment = await storage.getPaymentByOrderId(orderId);
      if (payment) {
        if (payment.status === "succeeded" && payment.razorpayPaymentId === paymentId) {
          console.log(`[Webhook] Payment ${paymentId} already processed, skipping`);
          return res.json({ status: "already_processed" });
        }
        
        if (payment.razorpayPaymentId && payment.razorpayPaymentId !== paymentId) {
          console.error(`[Webhook] Order ${orderId} has different payment ID`);
          return res.status(400).json({ error: "Payment ID mismatch" });
        }

        const result = await storage.processPaymentTransaction({
          orderId,
          paymentId,
          method
        });

        if (!result.success) {
          console.error(`[Webhook] Transaction failed: ${result.error}`);
          return res.status(500).json({ error: result.error });
        }

        const membership = await storage.getMembershipByOrderId(orderId);
        if (membership) {
          await storage.createAuditLog({
            action: "membership_activated",
            userId: membership.userId,
            details: `Membership ${membership.membershipNumber} activated via payment ${paymentId}`,
            ipAddress: "webhook"
          });

          if (membership.agentId) {
            const saleAmount = membership.planAmount || payment.amount;
            const commissionAmount = Math.round(saleAmount * 0.15);
            await storage.createAuditLog({
              action: "agent_commission_earned",
              userId: membership.agentId,
              details: `Commission ₹${commissionAmount} earned for membership ${membership.membershipNumber}`,
              ipAddress: "webhook"
            });
          }

          if (payment.metadata) {
            try {
              const metadata = JSON.parse(payment.metadata);
              if (metadata.addOnDetails && Array.isArray(metadata.addOnDetails)) {
                for (const addOn of metadata.addOnDetails) {
                  const expiresAt = new Date();
                  expiresAt.setDate(expiresAt.getDate() + (addOn.validityDays || 365));
                  
                  await storage.createMembershipAddOn({
                    membershipId: membership.id,
                    addOnId: addOn.id,
                    purchasePrice: addOn.price,
                    usageLimit: addOn.usageLimit || 1,
                    expiresAt
                  });
                }

                await storage.createAuditLog({
                  action: "add_ons_activated",
                  userId: membership.userId,
                  details: `${metadata.addOnDetails.length} add-on benefit(s) activated`,
                  ipAddress: "webhook"
                });
              }
            } catch (metadataError) {
              console.error("Failed to process add-on metadata:", metadataError);
            }
          }

          try {
            const { emailService } = await import('../services/email.service');
            const plan = await storage.getPlanByCode(membership.planType.toUpperCase());
            const user = await storage.getUserById(membership.userId);
            
            if (user?.email) {
              const totalAmount = payment.amount;
              const baseAmount = Math.round(totalAmount / 1.18);
              const gstAmount = totalAmount - baseAmount;
              await emailService.sendPaymentReceiptEmail(user.email, user.name || "Member", {
                amount: totalAmount,
                planName: plan?.name || membership.planType,
                membershipNumber: membership.membershipNumber,
                transactionId: paymentId,
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
        }
      }
    } else if (event === "payment.failed") {
      const paymentEntity = payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const errorDescription = paymentEntity.error_description || "Payment failed";

      const payment = await storage.getPaymentByOrderId(orderId);
      if (payment) {
        await storage.updatePayment(payment.id, {
          status: "failed",
          statusReason: errorDescription,
          processedAt: new Date()
        });

        const membership = await storage.getMembershipByOrderId(orderId);
        if (membership) {
          await storage.updateMembership(membership.id, {
            paymentStatus: "failed"
          });

          await storage.createAuditLog({
            action: "payment_failed",
            userId: membership.userId,
            details: `Payment failed for order ${orderId}: ${errorDescription}`,
            ipAddress: "webhook"
          });
        }
      }
    }

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
