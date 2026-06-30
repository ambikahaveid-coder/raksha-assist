import { Router, Request, Response, NextFunction } from "express";
import { db } from "../db.js";
import { 
  businessTargets, 
  incentiveSlabs, 
  commissionRequests, 
  commissionLedger,
  targetTemplates,
  users
} from "../../shared/schema.js";
import { eq, and, desc, sql, gte, lte, or } from "drizzle-orm";

const router = Router();

interface SessionUser {
  id: string;
  role: string;
  name?: string;
  mobile?: string;
}

const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as any;
  if (!session?.userId || session.userRole !== "super_admin") {
    return res.status(403).json({ error: "Super Admin access required" });
  }
  next();
};

const requireAdminAccess = (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as any;
  if (!session?.userId || !["super_admin", "admin"].includes(session.userRole)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// ==================== BUSINESS TARGETS ====================

router.get("/targets", requireAdminAccess, async (req, res) => {
  try {
    const { targetType, year, period, status } = req.query;
    
    let query = db.select().from(businessTargets).orderBy(desc(businessTargets.createdAt));
    
    const targets = await db.select({
      target: businessTargets,
      user: {
        id: users.id,
        name: users.name,
        mobile: users.mobile,
        role: users.role
      }
    })
    .from(businessTargets)
    .leftJoin(users, eq(businessTargets.userId, users.id))
    .orderBy(desc(businessTargets.createdAt));
    
    res.json(targets.map(t => ({
      ...t.target,
      user: t.user
    })));
  } catch (error) {
    console.error("Error fetching targets:", error);
    res.status(500).json({ error: "Failed to fetch targets" });
  }
});

router.get("/targets/:id", requireAdminAccess, async (req, res) => {
  try {
    const [target] = await db.select({
      target: businessTargets,
      user: {
        id: users.id,
        name: users.name,
        mobile: users.mobile,
        role: users.role
      }
    })
    .from(businessTargets)
    .leftJoin(users, eq(businessTargets.userId, users.id))
    .where(eq(businessTargets.id, req.params.id));
    
    if (!target) {
      return res.status(404).json({ error: "Target not found" });
    }
    
    res.json({ ...target.target, user: target.user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch target" });
  }
});

router.post("/targets", requireSuperAdmin, async (req, res) => {
  try {
    const {
      targetType,
      userId,
      franchiseType,
      franchiseId,
      targetPeriod,
      targetMonth,
      targetQuarter,
      targetYear,
      revenueTarget,
      membershipTarget,
      renewalTarget,
      agentRecruitmentTarget,
      notes
    } = req.body;
    
    const [target] = await db.insert(businessTargets).values({
      targetType,
      userId,
      franchiseType,
      franchiseId,
      targetPeriod,
      targetMonth,
      targetQuarter,
      targetYear,
      revenueTarget: revenueTarget || 0,
      membershipTarget: membershipTarget || 0,
      renewalTarget: renewalTarget || 0,
      agentRecruitmentTarget: agentRecruitmentTarget || 0,
      notes,
      setBy: (req.session as any)?.userId
    }).returning();
    
    res.status(201).json(target);
  } catch (error) {
    console.error("Error creating target:", error);
    res.status(500).json({ error: "Failed to create target" });
  }
});

router.put("/targets/:id", requireSuperAdmin, async (req, res) => {
  try {
    const {
      revenueTarget,
      membershipTarget,
      renewalTarget,
      agentRecruitmentTarget,
      revenueAchieved,
      membershipsAchieved,
      renewalsAchieved,
      agentsRecruited,
      status,
      notes
    } = req.body;
    
    const revenueT = revenueTarget || 1;
    const membershipT = membershipTarget || 1;
    const achievementPercent = Math.round(
      ((revenueAchieved || 0) / revenueT * 50) + 
      ((membershipsAchieved || 0) / membershipT * 50)
    );
    
    const [target] = await db.update(businessTargets)
      .set({
        revenueTarget,
        membershipTarget,
        renewalTarget,
        agentRecruitmentTarget,
        revenueAchieved,
        membershipsAchieved,
        renewalsAchieved,
        agentsRecruited,
        achievementPercent,
        status,
        notes,
        updatedAt: new Date()
      })
      .where(eq(businessTargets.id, req.params.id))
      .returning();
    
    res.json(target);
  } catch (error) {
    res.status(500).json({ error: "Failed to update target" });
  }
});

router.delete("/targets/:id", requireSuperAdmin, async (req, res) => {
  try {
    await db.delete(businessTargets).where(eq(businessTargets.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete target" });
  }
});

// ==================== INCENTIVE SLABS ====================

router.get("/incentive-slabs", requireAdminAccess, async (req, res) => {
  try {
    const slabs = await db.select().from(incentiveSlabs)
      .where(eq(incentiveSlabs.isActive, true))
      .orderBy(incentiveSlabs.targetType, incentiveSlabs.minAchievementPercent);
    res.json(slabs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch incentive slabs" });
  }
});

router.post("/incentive-slabs", requireSuperAdmin, async (req, res) => {
  try {
    const {
      slabName,
      targetType,
      minAchievementPercent,
      maxAchievementPercent,
      incentivePercent,
      bonusAmount,
      effectiveFrom,
      effectiveTo
    } = req.body;
    
    const [slab] = await db.insert(incentiveSlabs).values({
      slabName,
      targetType,
      minAchievementPercent,
      maxAchievementPercent,
      incentivePercent,
      bonusAmount: bonusAmount || 0,
      effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
      effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
      createdBy: (req.session as any)?.userId
    }).returning();
    
    res.status(201).json(slab);
  } catch (error) {
    console.error("Error creating slab:", error);
    res.status(500).json({ error: "Failed to create incentive slab" });
  }
});

router.put("/incentive-slabs/:id", requireSuperAdmin, async (req, res) => {
  try {
    const { slabName, minAchievementPercent, maxAchievementPercent, incentivePercent, bonusAmount, isActive } = req.body;
    
    const [slab] = await db.update(incentiveSlabs)
      .set({
        slabName,
        minAchievementPercent,
        maxAchievementPercent,
        incentivePercent,
        bonusAmount,
        isActive
      })
      .where(eq(incentiveSlabs.id, req.params.id))
      .returning();
    
    res.json(slab);
  } catch (error) {
    res.status(500).json({ error: "Failed to update incentive slab" });
  }
});

router.delete("/incentive-slabs/:id", requireSuperAdmin, async (req, res) => {
  try {
    await db.update(incentiveSlabs)
      .set({ isActive: false })
      .where(eq(incentiveSlabs.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete incentive slab" });
  }
});

// ==================== COMMISSION REQUESTS ====================

router.get("/commission-requests", requireAdminAccess, async (req, res) => {
  try {
    const { status } = req.query;
    
    let whereClause = status ? eq(commissionRequests.status, status as string) : undefined;
    
    const requests = await db.select({
      request: commissionRequests,
      user: {
        id: users.id,
        name: users.name,
        mobile: users.mobile,
        role: users.role
      }
    })
    .from(commissionRequests)
    .leftJoin(users, eq(commissionRequests.userId, users.id))
    .where(whereClause)
    .orderBy(desc(commissionRequests.createdAt));
    
    res.json(requests.map(r => ({
      ...r.request,
      user: r.user
    })));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch commission requests" });
  }
});

router.get("/commission-requests/pending", requireAdminAccess, async (req, res) => {
  try {
    const requests = await db.select({
      request: commissionRequests,
      user: {
        id: users.id,
        name: users.name,
        mobile: users.mobile,
        role: users.role
      }
    })
    .from(commissionRequests)
    .leftJoin(users, eq(commissionRequests.userId, users.id))
    .where(eq(commissionRequests.status, "pending"))
    .orderBy(desc(commissionRequests.createdAt));
    
    res.json(requests.map(r => ({
      ...r.request,
      user: r.user
    })));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending requests" });
  }
});

router.post("/commission-requests", requireAdminAccess, async (req, res) => {
  try {
    const {
      requestType,
      userId,
      franchiseType,
      franchiseId,
      targetId,
      requestPeriod,
      revenueGenerated,
      membershipsGenerated,
      achievementPercent
    } = req.body;
    
    const applicableSlabs = await db.select().from(incentiveSlabs)
      .where(and(
        eq(incentiveSlabs.targetType, requestType),
        eq(incentiveSlabs.isActive, true),
        lte(incentiveSlabs.minAchievementPercent, achievementPercent),
        gte(incentiveSlabs.maxAchievementPercent, achievementPercent)
      ))
      .limit(1);
    
    const slab = applicableSlabs[0];
    const calculatedIncentive = slab 
      ? Math.round((revenueGenerated * slab.incentivePercent / 100) + (slab.bonusAmount || 0))
      : 0;
    
    const [request] = await db.insert(commissionRequests).values({
      requestType,
      userId,
      franchiseType,
      franchiseId,
      amount: calculatedIncentive,
      requestPeriod,
      status: "pending",
      notes: `Revenue: ₹${revenueGenerated}, Memberships: ${membershipsGenerated}, Achievement: ${achievementPercent}%`
    }).returning();
    
    res.status(201).json(request);
  } catch (error) {
    console.error("Error creating commission request:", error);
    res.status(500).json({ error: "Failed to create commission request" });
  }
});

router.post("/commission-requests/:id/approve", requireSuperAdmin, async (req, res) => {
  try {
    const { reviewNotes } = req.body;
    
    const [request] = await db.update(commissionRequests)
      .set({
        status: "approved",
        processedBy: (req.session as any)?.userId,
        processedAt: new Date(),
        notes: reviewNotes
      })
      .where(eq(commissionRequests.id, req.params.id))
      .returning();
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: "Failed to approve request" });
  }
});

router.post("/commission-requests/:id/reject", requireSuperAdmin, async (req, res) => {
  try {
    const { reviewNotes } = req.body;
    
    const [request] = await db.update(commissionRequests)
      .set({
        status: "rejected",
        processedBy: (req.session as any)?.userId,
        processedAt: new Date(),
        rejectionReason: reviewNotes
      })
      .where(eq(commissionRequests.id, req.params.id))
      .returning();
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: "Failed to reject request" });
  }
});

router.post("/commission-requests/:id/pay", requireSuperAdmin, async (req, res) => {
  try {
    const { paidAmount, paymentReference } = req.body;
    
    const [existingRequest] = await db.select().from(commissionRequests)
      .where(eq(commissionRequests.id, req.params.id));
    
    if (!existingRequest || existingRequest.status !== "approved") {
      return res.status(400).json({ error: "Request must be approved before payment" });
    }
    
    const [request] = await db.update(commissionRequests)
      .set({
        status: "paid",
        transactionId: paymentReference,
        processedBy: (req.session as any)?.userId,
        processedAt: new Date()
      })
      .where(eq(commissionRequests.id, req.params.id))
      .returning();
    
    await db.insert(commissionLedger).values({
      entryType: "payout",
      userId: request.userId,
      franchiseType: request.franchiseType,
      franchiseId: request.franchiseId,
      amount: paidAmount || request.amount,
      transactionType: "debit",
      description: `Commission payout - ${request.requestPeriod}`,
      referenceType: "commission_request",
      referenceId: request.id
    });
    
    res.json(request);
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ error: "Failed to process payment" });
  }
});

// ==================== TARGET TEMPLATES ====================

router.get("/target-templates", requireAdminAccess, async (req, res) => {
  try {
    const templates = await db.select().from(targetTemplates)
      .where(eq(targetTemplates.isActive, true))
      .orderBy(targetTemplates.targetType);
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

router.post("/target-templates", requireSuperAdmin, async (req, res) => {
  try {
    const {
      templateName,
      targetType,
      targetPeriod,
      revenueTarget,
      membershipTarget,
      renewalTarget,
      agentRecruitmentTarget,
      isDefault
    } = req.body;
    
    if (isDefault) {
      await db.update(targetTemplates)
        .set({ isDefault: false })
        .where(and(
          eq(targetTemplates.targetType, targetType),
          eq(targetTemplates.targetPeriod, targetPeriod)
        ));
    }
    
    const [template] = await db.insert(targetTemplates).values({
      templateName,
      targetType,
      targetPeriod,
      revenueTarget: revenueTarget || 0,
      membershipTarget: membershipTarget || 0,
      renewalTarget: renewalTarget || 0,
      agentRecruitmentTarget: agentRecruitmentTarget || 0,
      isDefault: isDefault || false,
      createdBy: (req.session as any)?.userId
    }).returning();
    
    res.status(201).json(template);
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({ error: "Failed to create template" });
  }
});

router.put("/target-templates/:id", requireSuperAdmin, async (req, res) => {
  try {
    const { templateName, revenueTarget, membershipTarget, renewalTarget, agentRecruitmentTarget, isDefault, isActive } = req.body;
    
    const [template] = await db.update(targetTemplates)
      .set({
        templateName,
        revenueTarget,
        membershipTarget,
        renewalTarget,
        agentRecruitmentTarget,
        isDefault,
        isActive
      })
      .where(eq(targetTemplates.id, req.params.id))
      .returning();
    
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: "Failed to update template" });
  }
});

// ==================== COMMISSION LEDGER ====================

router.get("/commission-ledger", requireAdminAccess, async (req, res) => {
  try {
    const { userId, franchiseId } = req.query;
    
    let whereClause;
    if (userId) {
      whereClause = eq(commissionLedger.userId, userId as string);
    } else if (franchiseId) {
      whereClause = eq(commissionLedger.franchiseId, franchiseId as string);
    }
    
    const ledger = await db.select().from(commissionLedger)
      .where(whereClause)
      .orderBy(desc(commissionLedger.createdAt))
      .limit(100);
    
    res.json(ledger);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ledger" });
  }
});

// ==================== DASHBOARD STATS ====================

router.get("/commission-stats", requireAdminAccess, async (req, res) => {
  try {
    const pending = await db.select({ count: sql<number>`count(*)::int` })
      .from(commissionRequests)
      .where(eq(commissionRequests.status, "pending"));
    
    const approved = await db.select({ 
      count: sql<number>`count(*)::int`,
      total: sql<number>`COALESCE(SUM(amount), 0)::int`
    })
    .from(commissionRequests)
    .where(eq(commissionRequests.status, "approved"));
    
    const paid = await db.select({ 
      count: sql<number>`count(*)::int`,
      total: sql<number>`COALESCE(SUM(amount), 0)::int`
    })
    .from(commissionRequests)
    .where(eq(commissionRequests.status, "paid"));
    
    const activeTargets = await db.select({ count: sql<number>`count(*)::int` })
      .from(businessTargets)
      .where(eq(businessTargets.status, "active"));
    
    res.json({
      pendingRequests: pending[0]?.count || 0,
      approvedRequests: approved[0]?.count || 0,
      approvedAmount: approved[0]?.total || 0,
      paidRequests: paid[0]?.count || 0,
      paidAmount: paid[0]?.total || 0,
      activeTargets: activeTargets[0]?.count || 0
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
