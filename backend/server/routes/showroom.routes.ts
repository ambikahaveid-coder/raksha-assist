import { Router, Request, Response } from "express";
import { db } from "../db";
import { users, showrooms, vehicleSosCases, memberships, plans } from "../../shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const router = Router();

async function getSessionUser(req: Request) {
  const session = req.session as any;
  if (!session?.userId) return null;
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  return user || null;
}

const showroomRegisterSchema = z.object({
  name: z.string().min(2),
  ownerName: z.string().min(2),
  vehicleTypes: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().length(6),
  phone: z.string().length(10),
  email: z.string().email(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  password: z.string().min(6),
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    const data = showroomRegisterSchema.parse(req.body);
    
    const existingUser = await db.select().from(users).where(eq(users.mobile, data.phone)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Mobile number already registered" });
    }

    const existingEmail = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    if (existingEmail.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const [newUser] = await db.insert(users).values({
      mobile: data.phone,
      email: data.email,
      name: data.ownerName,
      role: "showroom",
      passwordHash,
    }).returning();

    await db.insert(showrooms).values({
      userId: newUser.id,
      name: data.name,
      ownerName: data.ownerName,
      vehicleTypes: data.vehicleTypes,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      phone: data.phone,
      email: data.email,
      gstNumber: data.gstNumber || null,
      panNumber: data.panNumber || null,
    });

    res.json({ success: true, message: "Showroom registered successfully" });
  } catch (error: any) {
    console.error("Showroom registration error:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid input data" });
    }
    res.status(500).json({ error: error.message || "Registration failed" });
  }
});

router.get("/profile", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "showroom") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [showroom] = await db.select().from(showrooms).where(eq(showrooms.userId, user.id)).limit(1);
    if (!showroom) {
      return res.status(404).json({ error: "Showroom profile not found" });
    }

    res.json({ showroom, user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile } });
  } catch (error: any) {
    console.error("Get showroom profile error:", error);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

router.get("/dashboard-stats", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "showroom") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [showroom] = await db.select().from(showrooms).where(eq(showrooms.userId, user.id)).limit(1);
    if (!showroom) {
      return res.status(404).json({ error: "Showroom not found" });
    }

    const sosCasesResult = await db.select({ count: sql<number>`count(*)` })
      .from(vehicleSosCases)
      .where(eq(vehicleSosCases.showroomId, showroom.id));

    const pendingCases = await db.select({ count: sql<number>`count(*)` })
      .from(vehicleSosCases)
      .where(and(
        eq(vehicleSosCases.showroomId, showroom.id),
        eq(vehicleSosCases.status, "pending")
      ));

    const approvedCases = await db.select({ count: sql<number>`count(*)` })
      .from(vehicleSosCases)
      .where(and(
        eq(vehicleSosCases.showroomId, showroom.id),
        eq(vehicleSosCases.status, "approved")
      ));

    const settledCases = await db.select({ count: sql<number>`count(*)` })
      .from(vehicleSosCases)
      .where(and(
        eq(vehicleSosCases.showroomId, showroom.id),
        eq(vehicleSosCases.status, "settled")
      ));

    res.json({
      totalSales: showroom.totalSales,
      totalCommission: showroom.totalCommission,
      commissionRate: showroom.commissionRate,
      totalSosCases: Number(sosCasesResult[0]?.count || 0),
      pendingCases: Number(pendingCases[0]?.count || 0),
      approvedCases: Number(approvedCases[0]?.count || 0),
      settledCases: Number(settledCases[0]?.count || 0),
      isVerified: showroom.isVerified,
    });
  } catch (error: any) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

router.get("/members", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "showroom") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [showroom] = await db.select().from(showrooms).where(eq(showrooms.userId, user.id)).limit(1);
    if (!showroom) {
      return res.status(404).json({ error: "Showroom not found" });
    }

    const members = await db.select({
      id: users.id,
      name: users.name,
      mobile: users.mobile,
      email: users.email,
      createdAt: users.createdAt,
      membership: {
        id: memberships.id,
        status: memberships.status,
        startDate: memberships.startDate,
        expiryDate: memberships.expiryDate,
        planType: memberships.planType,
        coverageAmount: memberships.coverageAmount,
      },
    })
    .from(users)
    .innerJoin(memberships, eq(memberships.userId, users.id))
    .where(eq(users.createdBy, user.id))
    .orderBy(desc(users.createdAt));

    res.json({ members });
  } catch (error: any) {
    console.error("Get members error:", error);
    res.status(500).json({ error: "Failed to get members" });
  }
});

const registerMemberSchema = z.object({
  name: z.string().min(2),
  mobile: z.string().length(10),
  email: z.string().email().optional(),
  vehicleType: z.string().min(2),
  vehicleNumber: z.string().min(4),
  vehicleMake: z.string().min(2),
  vehicleModel: z.string().min(1),
  vehicleYear: z.string().length(4),
  planType: z.string(),
  planAmount: z.number().optional(),
  coverageAmount: z.number().optional(),
});

router.post("/register-member", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "showroom") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const data = registerMemberSchema.parse(req.body);

    const existingUser = await db.select().from(users).where(eq(users.mobile, data.mobile)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Mobile number already registered" });
    }

    const [showroom] = await db.select().from(showrooms).where(eq(showrooms.userId, user.id)).limit(1);
    if (!showroom) {
      return res.status(404).json({ error: "Showroom not found" });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const [newMember] = await db.insert(users).values({
      mobile: data.mobile,
      email: data.email || null,
      name: data.name,
      role: "user",
      passwordHash,
      createdBy: user.id,
    }).returning();

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const membershipNumber = `SH${Date.now().toString(36).toUpperCase()}`;

    await db.insert(memberships).values({
      userId: newMember.id,
      membershipNumber,
      planType: data.planType,
      planAmount: data.planAmount || 0,
      coverageAmount: data.coverageAmount || 300000,
      status: "pending_payment",
      paymentStatus: "pending",
      agentId: user.id,
      startDate,
      expiryDate,
    });

    const commission = Math.floor((data.planAmount || 0) * (showroom.commissionRate / 100));
    await db.update(showrooms)
      .set({
        totalSales: sql`${showrooms.totalSales} + 1`,
        totalCommission: sql`${showrooms.totalCommission} + ${commission}`,
      })
      .where(eq(showrooms.id, showroom.id));

    res.json({ 
      success: true, 
      message: "Member registered successfully",
      memberId: newMember.id,
      membershipNumber,
      tempPassword,
    });
  } catch (error: any) {
    console.error("Register member error:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid input data" });
    }
    res.status(500).json({ error: error.message || "Registration failed" });
  }
});

router.get("/vehicle-sos-cases", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "showroom") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [showroom] = await db.select().from(showrooms).where(eq(showrooms.userId, user.id)).limit(1);
    if (!showroom) {
      return res.status(404).json({ error: "Showroom not found" });
    }

    const cases = await db.select({
      id: vehicleSosCases.id,
      caseNumber: vehicleSosCases.caseNumber,
      vehicleType: vehicleSosCases.vehicleType,
      vehicleNumber: vehicleSosCases.vehicleNumber,
      vehicleMake: vehicleSosCases.vehicleMake,
      vehicleModel: vehicleSosCases.vehicleModel,
      accidentDate: vehicleSosCases.accidentDate,
      accidentLocation: vehicleSosCases.accidentLocation,
      hospitalName: vehicleSosCases.hospitalName,
      estimatedAmount: vehicleSosCases.estimatedAmount,
      approvedAmount: vehicleSosCases.approvedAmount,
      settledAmount: vehicleSosCases.settledAmount,
      status: vehicleSosCases.status,
      createdAt: vehicleSosCases.createdAt,
      memberName: users.name,
      memberMobile: users.mobile,
    })
    .from(vehicleSosCases)
    .innerJoin(users, eq(vehicleSosCases.userId, users.id))
    .where(eq(vehicleSosCases.showroomId, showroom.id))
    .orderBy(desc(vehicleSosCases.createdAt));

    res.json({ cases });
  } catch (error: any) {
    console.error("Get vehicle SOS cases error:", error);
    res.status(500).json({ error: "Failed to get cases" });
  }
});

const createVehicleSosCaseSchema = z.object({
  membershipId: z.string().optional(),
  userId: z.string(),
  vehicleType: z.string().min(2),
  vehicleNumber: z.string().min(4),
  vehicleMake: z.string().min(2),
  vehicleModel: z.string().min(1),
  vehicleYear: z.string().length(4),
  accidentDate: z.string(),
  accidentLocation: z.string().min(5),
  accidentDescription: z.string().min(10),
  hospitalName: z.string().min(2),
  hospitalAddress: z.string().optional(),
  estimatedAmount: z.number().positive(),
  firNumber: z.string().optional(),
});

router.post("/vehicle-sos-cases", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "showroom") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const data = createVehicleSosCaseSchema.parse(req.body);

    const [showroom] = await db.select().from(showrooms).where(eq(showrooms.userId, user.id)).limit(1);
    if (!showroom) {
      return res.status(404).json({ error: "Showroom not found" });
    }

    const caseNumber = `VSC${Date.now().toString(36).toUpperCase()}`;

    const [newCase] = await db.insert(vehicleSosCases).values({
      caseNumber,
      membershipId: data.membershipId || null,
      userId: data.userId,
      showroomId: showroom.id,
      vehicleType: data.vehicleType,
      vehicleNumber: data.vehicleNumber,
      vehicleMake: data.vehicleMake,
      vehicleModel: data.vehicleModel,
      vehicleYear: data.vehicleYear,
      accidentDate: new Date(data.accidentDate),
      accidentLocation: data.accidentLocation,
      accidentDescription: data.accidentDescription,
      hospitalName: data.hospitalName,
      hospitalAddress: data.hospitalAddress || null,
      estimatedAmount: data.estimatedAmount,
      firNumber: data.firNumber || null,
      status: "pending",
    }).returning();

    res.json({ 
      success: true, 
      message: "SOS case created successfully",
      case: newCase,
    });
  } catch (error: any) {
    console.error("Create vehicle SOS case error:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid input data" });
    }
    res.status(500).json({ error: error.message || "Failed to create case" });
  }
});

router.get("/plans", async (req: Request, res: Response) => {
  try {
    const allPlans = await db.select({
      id: plans.id,
      planCode: plans.planCode,
      name: plans.name,
      price: plans.price,
      coverageAmount: plans.coverageAmount,
      planCategory: plans.planCategory,
    }).from(plans).where(eq(plans.isActive, true));

    res.json({ plans: allPlans });
  } catch (error: any) {
    console.error("Get plans error:", error);
    res.status(500).json({ error: "Failed to get plans" });
  }
});

router.get("/admin/vehicle-sos-cases", async (req: Request, res: Response) => {
  try {
    const session = req.session as any;
    const userId = session?.userId;
    const userRole = session?.userRole;
    if (!userId || !["admin", "super_admin", "employee"].includes(userRole || "")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const cases = await db.select({
      id: vehicleSosCases.id,
      caseNumber: vehicleSosCases.caseNumber,
      vehicleType: vehicleSosCases.vehicleType,
      vehicleNumber: vehicleSosCases.vehicleNumber,
      vehicleMake: vehicleSosCases.vehicleMake,
      vehicleModel: vehicleSosCases.vehicleModel,
      vehicleYear: vehicleSosCases.vehicleYear,
      accidentDate: vehicleSosCases.accidentDate,
      accidentLocation: vehicleSosCases.accidentLocation,
      accidentDescription: vehicleSosCases.accidentDescription,
      hospitalName: vehicleSosCases.hospitalName,
      hospitalAddress: vehicleSosCases.hospitalAddress,
      estimatedAmount: vehicleSosCases.estimatedAmount,
      approvedAmount: vehicleSosCases.approvedAmount,
      settledAmount: vehicleSosCases.settledAmount,
      firNumber: vehicleSosCases.firNumber,
      status: vehicleSosCases.status,
      rejectionReason: vehicleSosCases.rejectionReason,
      createdAt: vehicleSosCases.createdAt,
      memberName: users.name,
      memberMobile: users.mobile,
    })
    .from(vehicleSosCases)
    .innerJoin(users, eq(vehicleSosCases.userId, users.id))
    .orderBy(desc(vehicleSosCases.createdAt));

    res.json({ cases });
  } catch (error: any) {
    console.error("Admin get vehicle SOS cases error:", error);
    res.status(500).json({ error: "Failed to get cases" });
  }
});

router.get("/admin/vehicle-sos-cases/:id", async (req: Request, res: Response) => {
  try {
    const session = req.session as any;
    const userId = session?.userId;
    const userRole = session?.userRole;
    if (!userId || !["admin", "super_admin", "employee"].includes(userRole || "")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const caseId = req.params.id;

    const [sosCase] = await db.select({
      id: vehicleSosCases.id,
      caseNumber: vehicleSosCases.caseNumber,
      vehicleType: vehicleSosCases.vehicleType,
      vehicleNumber: vehicleSosCases.vehicleNumber,
      vehicleMake: vehicleSosCases.vehicleMake,
      vehicleModel: vehicleSosCases.vehicleModel,
      vehicleYear: vehicleSosCases.vehicleYear,
      accidentDate: vehicleSosCases.accidentDate,
      accidentLocation: vehicleSosCases.accidentLocation,
      accidentDescription: vehicleSosCases.accidentDescription,
      hospitalName: vehicleSosCases.hospitalName,
      hospitalAddress: vehicleSosCases.hospitalAddress,
      estimatedAmount: vehicleSosCases.estimatedAmount,
      approvedAmount: vehicleSosCases.approvedAmount,
      settledAmount: vehicleSosCases.settledAmount,
      firNumber: vehicleSosCases.firNumber,
      status: vehicleSosCases.status,
      rejectionReason: vehicleSosCases.rejectionReason,
      processedBy: vehicleSosCases.processedBy,
      settledBy: vehicleSosCases.settledBy,
      processedAt: vehicleSosCases.processedAt,
      settledAt: vehicleSosCases.settledAt,
      createdAt: vehicleSosCases.createdAt,
      memberName: users.name,
      memberMobile: users.mobile,
      memberEmail: users.email,
    })
    .from(vehicleSosCases)
    .innerJoin(users, eq(vehicleSosCases.userId, users.id))
    .where(eq(vehicleSosCases.id, caseId))
    .limit(1);

    if (!sosCase) {
      return res.status(404).json({ error: "Case not found" });
    }

    res.json({ case: sosCase });
  } catch (error: any) {
    console.error("Admin get vehicle SOS case error:", error);
    res.status(500).json({ error: "Failed to get case" });
  }
});

const updateCaseStatusSchema = z.object({
  action: z.enum(["verify", "approve", "reject", "settle"]),
  approvedAmount: z.number().positive().finite().optional(),
  settledAmount: z.number().positive().finite().optional(),
  rejectionReason: z.string().optional(),
});

router.put("/admin/vehicle-sos-cases/:id/status", async (req: Request, res: Response) => {
  try {
    const session = req.session as any;
    const sessionUserId = session?.userId;
    const userRole = session?.userRole;
    if (!sessionUserId || !["admin", "super_admin", "employee"].includes(userRole || "")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const caseId = req.params.id;
    const data = updateCaseStatusSchema.parse(req.body);

    const [existingCase] = await db.select().from(vehicleSosCases).where(eq(vehicleSosCases.id, caseId)).limit(1);
    if (!existingCase) {
      return res.status(404).json({ error: "Case not found" });
    }

    let updateData: any = {};

    switch (data.action) {
      case "verify":
        if (existingCase.status !== "pending") {
          return res.status(400).json({ error: "Case must be pending to verify" });
        }
        updateData = {
          status: "under_verification",
          processedBy: sessionUserId,
          processedAt: new Date(),
        };
        break;

      case "approve":
        if (!["pending", "under_verification"].includes(existingCase.status)) {
          return res.status(400).json({ error: "Case must be pending or under verification to approve" });
        }
        if (data.approvedAmount === undefined || !Number.isFinite(data.approvedAmount) || data.approvedAmount <= 0) {
          return res.status(400).json({ error: "Valid positive approved amount is required" });
        }
        updateData = {
          status: "approved",
          approvedAmount: Math.round(data.approvedAmount!),
          processedBy: sessionUserId,
          processedAt: new Date(),
        };
        break;

      case "reject":
        if (!["pending", "under_verification"].includes(existingCase.status)) {
          return res.status(400).json({ error: "Case must be pending or under verification to reject" });
        }
        updateData = {
          status: "rejected",
          rejectionReason: data.rejectionReason || "Application rejected",
          processedBy: sessionUserId,
          processedAt: new Date(),
        };
        break;

      case "settle":
        if (existingCase.status !== "approved") {
          return res.status(400).json({ error: "Case must be approved to settle" });
        }
        if (data.settledAmount === undefined || !Number.isFinite(data.settledAmount) || data.settledAmount <= 0) {
          return res.status(400).json({ error: "Valid positive settled amount is required" });
        }
        updateData = {
          status: "settled",
          settledAmount: Math.round(data.settledAmount!),
          settledBy: sessionUserId,
          settledAt: new Date(),
        };
        break;
    }

    await db.update(vehicleSosCases).set(updateData).where(eq(vehicleSosCases.id, caseId));

    res.json({ success: true, message: `Case ${data.action}d successfully` });
  } catch (error: any) {
    console.error("Update vehicle SOS case status error:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid input data" });
    }
    res.status(500).json({ error: error.message || "Failed to update case" });
  }
});

router.get("/admin/showrooms", async (req: Request, res: Response) => {
  try {
    const session = req.session as any;
    const userRole = session?.userRole;
    if (!session?.userId || !["admin", "super_admin"].includes(userRole || "")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const allShowrooms = await db.select({
      id: showrooms.id,
      name: showrooms.name,
      ownerName: showrooms.ownerName,
      vehicleTypes: showrooms.vehicleTypes,
      city: showrooms.city,
      state: showrooms.state,
      phone: showrooms.phone,
      email: showrooms.email,
      isVerified: showrooms.isVerified,
      totalSales: showrooms.totalSales,
      totalCommission: showrooms.totalCommission,
      commissionRate: showrooms.commissionRate,
      createdAt: showrooms.createdAt,
    }).from(showrooms).orderBy(desc(showrooms.createdAt));

    res.json({ showrooms: allShowrooms });
  } catch (error: any) {
    console.error("Admin get showrooms error:", error);
    res.status(500).json({ error: "Failed to get showrooms" });
  }
});

router.put("/admin/showrooms/:id/verify", async (req: Request, res: Response) => {
  try {
    const session = req.session as any;
    const userRole = session?.userRole;
    if (!session?.userId || !["admin", "super_admin"].includes(userRole || "")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const showroomId = req.params.id;
    const { isVerified } = req.body;

    await db.update(showrooms)
      .set({ isVerified: isVerified ?? true })
      .where(eq(showrooms.id, showroomId));

    res.json({ success: true, message: `Showroom ${isVerified ? "verified" : "unverified"} successfully` });
  } catch (error: any) {
    console.error("Verify showroom error:", error);
    res.status(500).json({ error: "Failed to update showroom" });
  }
});

export default router;
