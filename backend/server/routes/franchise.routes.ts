import { Router, Request, Response } from "express";
import { db } from "../db.js";
import { 
  zoneFranchises, stateFranchises, districtFranchises, cityFranchises,
  agentFranchiseAssignments, franchiseCommissions, franchisePayouts, 
  franchiseReports, preExistingConditions, commissionRateConfig,
  users, memberships, payments
} from "../../shared/schema.js";
import { eq, desc, and, gte, lte, sql, count, sum } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const createZoneSchema = z.object({
  zoneCode: z.string().min(2).max(20),
  name: z.string().min(2),
  description: z.string().optional(),
  states: z.array(z.string()).optional(),
  headOfficeAddress: z.string().optional(),
  headOfficeCity: z.string().optional(),
  headOfficeState: z.string().optional(),
  headOfficePincode: z.string().optional(),
  ownerName: z.string().optional(),
  ownerMobile: z.string().optional(),
  ownerEmail: z.string().email().optional(),
  panNumber: z.string().optional(),
  gstNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIfsc: z.string().optional(),
  bankAccountHolder: z.string().optional(),
  commissionRate: z.number().min(0).max(100).default(3),
});

const createStateSchema = z.object({
  stateCode: z.string().min(2).max(20),
  name: z.string().min(2),
  stateName: z.string().min(2),
  zoneId: z.string().optional(),
  description: z.string().optional(),
  ownerName: z.string().optional(),
  ownerMobile: z.string().optional(),
  ownerEmail: z.string().email().optional(),
  commissionRate: z.number().min(0).max(100).default(4),
});

const createDistrictSchema = z.object({
  districtCode: z.string().min(2).max(20),
  name: z.string().min(2),
  districtName: z.string().min(2),
  stateId: z.string().optional(),
  description: z.string().optional(),
  ownerName: z.string().optional(),
  ownerMobile: z.string().optional(),
  ownerEmail: z.string().email().optional(),
  commissionRate: z.number().min(0).max(100).default(5),
});

const createCitySchema = z.object({
  cityCode: z.string().min(2).max(20),
  name: z.string().min(2),
  cityName: z.string().min(2),
  districtId: z.string().optional(),
  description: z.string().optional(),
  ownerName: z.string().optional(),
  ownerMobile: z.string().optional(),
  ownerEmail: z.string().email().optional(),
  commissionRate: z.number().min(0).max(100).default(6),
});

function requireSuperAdmin(req: Request, res: Response, next: Function) {
  if (!req.session?.userId || req.session.userRole !== "super_admin") {
    return res.status(403).json({ error: "Super Admin access required" });
  }
  next();
}

function requireFranchiseAccess(req: Request, res: Response, next: Function) {
  const allowedRoles = ["super_admin", "admin", "zone_franchise", "state_franchise", "district_franchise", "city_franchise"];
  if (!req.session?.userId || !allowedRoles.includes(req.session.userRole || "")) {
    return res.status(403).json({ error: "Franchise access required" });
  }
  next();
}

async function getFranchiseFilter(userId: string | undefined, userRole: string) {
  if (userRole === "super_admin" || userRole === "admin") {
    return { canViewAll: true };
  }
  if (!userId) return { canViewAll: false };
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return { canViewAll: false };
  return {
    canViewAll: false,
    zoneFranchiseId: user.zoneFranchiseId,
    stateFranchiseId: user.stateFranchiseId,
    districtFranchiseId: user.districtFranchiseId,
    cityFranchiseId: user.cityFranchiseId,
    userRole
  };
}

// ==================== ZONE FRANCHISE ROUTES ====================

router.get("/zones", requireFranchiseAccess, async (req, res) => {
  try {
    const filter = await getFranchiseFilter(req.session!.userId, req.session!.userRole || "");
    let conditions = [eq(zoneFranchises.isActive, true)];
    if (!filter.canViewAll && filter.zoneFranchiseId) {
      conditions.push(eq(zoneFranchises.id, filter.zoneFranchiseId));
    }
    const zones = await db.select().from(zoneFranchises).where(and(...conditions)).orderBy(desc(zoneFranchises.createdAt));
    res.json(zones);
  } catch (error) {
    console.error("Error fetching zones:", error);
    res.status(500).json({ error: "Failed to fetch zones" });
  }
});

router.get("/zones/:id", requireFranchiseAccess, async (req, res) => {
  try {
    const filter = await getFranchiseFilter(req.session!.userId, req.session!.userRole || "");
    const [zone] = await db.select().from(zoneFranchises).where(eq(zoneFranchises.id, req.params.id));
    if (!zone) return res.status(404).json({ error: "Zone not found" });
    if (!filter.canViewAll && filter.zoneFranchiseId && filter.zoneFranchiseId !== zone.id) {
      return res.status(403).json({ error: "Access denied to this zone" });
    }
    res.json(zone);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch zone" });
  }
});

router.post("/zones", requireSuperAdmin, async (req, res) => {
  try {
    const data = createZoneSchema.parse(req.body);
    const [zone] = await db.insert(zoneFranchises).values({
      ...data,
      status: "active",
      approvedBy: req.session!.userId,
      approvedAt: new Date(),
    }).returning();
    res.status(201).json(zone);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create zone" });
  }
});

router.put("/zones/:id", requireSuperAdmin, async (req, res) => {
  try {
    const data = createZoneSchema.partial().parse(req.body);
    const [zone] = await db.update(zoneFranchises)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(zoneFranchises.id, req.params.id))
      .returning();
    res.json(zone);
  } catch (error) {
    res.status(500).json({ error: "Failed to update zone" });
  }
});

router.patch("/zones/:id", requireSuperAdmin, async (req, res) => {
  try {
    const data = createZoneSchema.partial().parse(req.body);
    const [zone] = await db.update(zoneFranchises)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(zoneFranchises.id, req.params.id))
      .returning();
    res.json(zone);
  } catch (error) {
    res.status(500).json({ error: "Failed to update zone" });
  }
});

router.delete("/zones/:id", requireSuperAdmin, async (req, res) => {
  try {
    await db.update(zoneFranchises)
      .set({ isActive: false, status: "deleted" })
      .where(eq(zoneFranchises.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete zone" });
  }
});

router.patch("/zones/:id/status", requireSuperAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive", "blocked", "suspended"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const [zone] = await db.update(zoneFranchises)
      .set({ status, isActive: status === "active", updatedAt: new Date() })
      .where(eq(zoneFranchises.id, req.params.id))
      .returning();
    res.json(zone);
  } catch (error) {
    res.status(500).json({ error: "Failed to update zone status" });
  }
});

router.post("/zones/bulk", requireSuperAdmin, async (req, res) => {
  try {
    const { ids, action } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid ids array" });
    }
    if (!["delete", "block", "unblock"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }
    let results = [];
    for (const id of ids) {
      if (action === "delete") {
        const [zone] = await db.update(zoneFranchises)
          .set({ isActive: false, status: "deleted", updatedAt: new Date() })
          .where(eq(zoneFranchises.id, id))
          .returning();
        results.push(zone);
      } else if (action === "block") {
        const [zone] = await db.update(zoneFranchises)
          .set({ status: "blocked", isActive: false, updatedAt: new Date() })
          .where(eq(zoneFranchises.id, id))
          .returning();
        results.push(zone);
      } else if (action === "unblock") {
        const [zone] = await db.update(zoneFranchises)
          .set({ status: "active", isActive: true, updatedAt: new Date() })
          .where(eq(zoneFranchises.id, id))
          .returning();
        results.push(zone);
      }
    }
    res.json({ success: true, count: results.length, items: results });
  } catch (error) {
    console.error("Bulk zone action error:", error);
    res.status(500).json({ error: "Bulk operation failed" });
  }
});

// ==================== STATE FRANCHISE ROUTES ====================

router.get("/states", requireFranchiseAccess, async (req, res) => {
  try {
    const { zoneId, includeInactive } = req.query;
    const filter = await getFranchiseFilter(req.session!.userId, req.session!.userRole || "");
    let conditions = [];
    if (!includeInactive) {
      conditions.push(eq(stateFranchises.isActive, true));
    }
    if (zoneId) {
      conditions.push(eq(stateFranchises.zoneId, zoneId as string));
    }
    if (!filter.canViewAll) {
      if (filter.stateFranchiseId) {
        conditions.push(eq(stateFranchises.id, filter.stateFranchiseId));
      } else if (filter.zoneFranchiseId) {
        conditions.push(eq(stateFranchises.zoneId, filter.zoneFranchiseId));
      }
    }
    const states = conditions.length > 0
      ? await db.select().from(stateFranchises).where(and(...conditions)).orderBy(desc(stateFranchises.createdAt))
      : await db.select().from(stateFranchises).orderBy(desc(stateFranchises.createdAt));
    res.json(states);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch states" });
  }
});

router.get("/states/:id", requireFranchiseAccess, async (req, res) => {
  try {
    const filter = await getFranchiseFilter(req.session!.userId, req.session!.userRole || "");
    const [state] = await db.select().from(stateFranchises).where(eq(stateFranchises.id, req.params.id));
    if (!state) return res.status(404).json({ error: "State not found" });
    if (!filter.canViewAll) {
      if (filter.stateFranchiseId && filter.stateFranchiseId !== state.id) {
        return res.status(403).json({ error: "Access denied to this state" });
      }
      if (filter.zoneFranchiseId && state.zoneId !== filter.zoneFranchiseId) {
        return res.status(403).json({ error: "Access denied to this state" });
      }
    }
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch state" });
  }
});

router.post("/states", requireSuperAdmin, async (req, res) => {
  try {
    const data = createStateSchema.parse(req.body);
    const [state] = await db.insert(stateFranchises).values({
      ...data,
      status: "active",
      approvedBy: req.session!.userId,
      approvedAt: new Date(),
    }).returning();
    res.status(201).json(state);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create state" });
  }
});

router.put("/states/:id", requireSuperAdmin, async (req, res) => {
  try {
    const data = createStateSchema.partial().parse(req.body);
    const [state] = await db.update(stateFranchises)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(stateFranchises.id, req.params.id))
      .returning();
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: "Failed to update state" });
  }
});

router.patch("/states/:id", requireSuperAdmin, async (req, res) => {
  try {
    const data = createStateSchema.partial().parse(req.body);
    const [state] = await db.update(stateFranchises)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(stateFranchises.id, req.params.id))
      .returning();
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: "Failed to update state" });
  }
});

router.delete("/states/:id", requireSuperAdmin, async (req, res) => {
  try {
    await db.update(stateFranchises)
      .set({ isActive: false, status: "deleted" })
      .where(eq(stateFranchises.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete state" });
  }
});

router.patch("/states/:id/status", requireSuperAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive", "blocked", "suspended"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const [state] = await db.update(stateFranchises)
      .set({ status, isActive: status === "active", updatedAt: new Date() })
      .where(eq(stateFranchises.id, req.params.id))
      .returning();
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: "Failed to update state status" });
  }
});

router.post("/states/bulk", requireSuperAdmin, async (req, res) => {
  try {
    const { ids, action } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid ids array" });
    }
    if (!["delete", "block", "unblock"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }
    let results = [];
    for (const id of ids) {
      if (action === "delete") {
        const [state] = await db.update(stateFranchises)
          .set({ isActive: false, status: "deleted", updatedAt: new Date() })
          .where(eq(stateFranchises.id, id))
          .returning();
        results.push(state);
      } else if (action === "block") {
        const [state] = await db.update(stateFranchises)
          .set({ status: "blocked", isActive: false, updatedAt: new Date() })
          .where(eq(stateFranchises.id, id))
          .returning();
        results.push(state);
      } else if (action === "unblock") {
        const [state] = await db.update(stateFranchises)
          .set({ status: "active", isActive: true, updatedAt: new Date() })
          .where(eq(stateFranchises.id, id))
          .returning();
        results.push(state);
      }
    }
    res.json({ success: true, count: results.length, items: results });
  } catch (error) {
    console.error("Bulk state action error:", error);
    res.status(500).json({ error: "Bulk operation failed" });
  }
});

// ==================== DISTRICT FRANCHISE ROUTES ====================

router.get("/districts", requireFranchiseAccess, async (req, res) => {
  try {
    const { stateId, includeInactive } = req.query;
    const filter = await getFranchiseFilter(req.session!.userId, req.session!.userRole || "");
    let conditions = [];
    if (!includeInactive) {
      conditions.push(eq(districtFranchises.isActive, true));
    }
    if (stateId) {
      conditions.push(eq(districtFranchises.stateId, stateId as string));
    }
    if (!filter.canViewAll) {
      if (filter.districtFranchiseId) {
        conditions.push(eq(districtFranchises.id, filter.districtFranchiseId));
      } else if (filter.stateFranchiseId) {
        conditions.push(eq(districtFranchises.stateId, filter.stateFranchiseId));
      }
    }
    const districts = conditions.length > 0
      ? await db.select().from(districtFranchises).where(and(...conditions)).orderBy(desc(districtFranchises.createdAt))
      : await db.select().from(districtFranchises).orderBy(desc(districtFranchises.createdAt));
    res.json(districts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch districts" });
  }
});

router.post("/districts", requireSuperAdmin, async (req, res) => {
  try {
    const data = createDistrictSchema.parse(req.body);
    const [district] = await db.insert(districtFranchises).values({
      ...data,
      status: "active",
      approvedBy: req.session!.userId,
      approvedAt: new Date(),
    }).returning();
    res.status(201).json(district);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create district" });
  }
});

router.put("/districts/:id", requireSuperAdmin, async (req, res) => {
  try {
    const data = createDistrictSchema.partial().parse(req.body);
    const [district] = await db.update(districtFranchises)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(districtFranchises.id, req.params.id))
      .returning();
    res.json(district);
  } catch (error) {
    res.status(500).json({ error: "Failed to update district" });
  }
});

router.patch("/districts/:id", requireSuperAdmin, async (req, res) => {
  try {
    const data = createDistrictSchema.partial().parse(req.body);
    const [district] = await db.update(districtFranchises)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(districtFranchises.id, req.params.id))
      .returning();
    res.json(district);
  } catch (error) {
    res.status(500).json({ error: "Failed to update district" });
  }
});

router.delete("/districts/:id", requireSuperAdmin, async (req, res) => {
  try {
    await db.update(districtFranchises)
      .set({ isActive: false, status: "deleted" })
      .where(eq(districtFranchises.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete district" });
  }
});

router.patch("/districts/:id/status", requireSuperAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive", "blocked", "suspended"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const [district] = await db.update(districtFranchises)
      .set({ status, isActive: status === "active", updatedAt: new Date() })
      .where(eq(districtFranchises.id, req.params.id))
      .returning();
    res.json(district);
  } catch (error) {
    res.status(500).json({ error: "Failed to update district status" });
  }
});

router.post("/districts/bulk", requireSuperAdmin, async (req, res) => {
  try {
    const { ids, action } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid ids array" });
    }
    if (!["delete", "block", "unblock"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }
    let results = [];
    for (const id of ids) {
      if (action === "delete") {
        const [district] = await db.update(districtFranchises)
          .set({ isActive: false, status: "deleted", updatedAt: new Date() })
          .where(eq(districtFranchises.id, id))
          .returning();
        results.push(district);
      } else if (action === "block") {
        const [district] = await db.update(districtFranchises)
          .set({ status: "blocked", isActive: false, updatedAt: new Date() })
          .where(eq(districtFranchises.id, id))
          .returning();
        results.push(district);
      } else if (action === "unblock") {
        const [district] = await db.update(districtFranchises)
          .set({ status: "active", isActive: true, updatedAt: new Date() })
          .where(eq(districtFranchises.id, id))
          .returning();
        results.push(district);
      }
    }
    res.json({ success: true, count: results.length, items: results });
  } catch (error) {
    console.error("Bulk district action error:", error);
    res.status(500).json({ error: "Bulk operation failed" });
  }
});

// ==================== CITY FRANCHISE ROUTES ====================

router.get("/cities", requireFranchiseAccess, async (req, res) => {
  try {
    const { districtId, includeInactive } = req.query;
    const filter = await getFranchiseFilter(req.session!.userId, req.session!.userRole || "");
    let conditions = [];
    if (!includeInactive) {
      conditions.push(eq(cityFranchises.isActive, true));
    }
    if (districtId) {
      conditions.push(eq(cityFranchises.districtId, districtId as string));
    }
    if (!filter.canViewAll) {
      if (filter.cityFranchiseId) {
        conditions.push(eq(cityFranchises.id, filter.cityFranchiseId));
      } else if (filter.districtFranchiseId) {
        conditions.push(eq(cityFranchises.districtId, filter.districtFranchiseId));
      }
    }
    const cities = conditions.length > 0
      ? await db.select().from(cityFranchises).where(and(...conditions)).orderBy(desc(cityFranchises.createdAt))
      : await db.select().from(cityFranchises).orderBy(desc(cityFranchises.createdAt));
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cities" });
  }
});

router.post("/cities", requireSuperAdmin, async (req, res) => {
  try {
    const data = createCitySchema.parse(req.body);
    const [city] = await db.insert(cityFranchises).values({
      ...data,
      status: "active",
      approvedBy: req.session!.userId,
      approvedAt: new Date(),
    }).returning();
    res.status(201).json(city);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create city" });
  }
});

router.put("/cities/:id", requireSuperAdmin, async (req, res) => {
  try {
    const data = createCitySchema.partial().parse(req.body);
    const [city] = await db.update(cityFranchises)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cityFranchises.id, req.params.id))
      .returning();
    res.json(city);
  } catch (error) {
    res.status(500).json({ error: "Failed to update city" });
  }
});

router.patch("/cities/:id", requireSuperAdmin, async (req, res) => {
  try {
    const data = createCitySchema.partial().parse(req.body);
    const [city] = await db.update(cityFranchises)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cityFranchises.id, req.params.id))
      .returning();
    res.json(city);
  } catch (error) {
    res.status(500).json({ error: "Failed to update city" });
  }
});

router.delete("/cities/:id", requireSuperAdmin, async (req, res) => {
  try {
    await db.update(cityFranchises)
      .set({ isActive: false, status: "deleted" })
      .where(eq(cityFranchises.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete city" });
  }
});

router.patch("/cities/:id/status", requireSuperAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive", "blocked", "suspended"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const [city] = await db.update(cityFranchises)
      .set({ status, isActive: status === "active", updatedAt: new Date() })
      .where(eq(cityFranchises.id, req.params.id))
      .returning();
    res.json(city);
  } catch (error) {
    res.status(500).json({ error: "Failed to update city status" });
  }
});

router.post("/cities/bulk", requireSuperAdmin, async (req, res) => {
  try {
    const { ids, action } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid ids array" });
    }
    if (!["delete", "block", "unblock"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }
    let results = [];
    for (const id of ids) {
      if (action === "delete") {
        const [city] = await db.update(cityFranchises)
          .set({ isActive: false, status: "deleted", updatedAt: new Date() })
          .where(eq(cityFranchises.id, id))
          .returning();
        results.push(city);
      } else if (action === "block") {
        const [city] = await db.update(cityFranchises)
          .set({ status: "blocked", isActive: false, updatedAt: new Date() })
          .where(eq(cityFranchises.id, id))
          .returning();
        results.push(city);
      } else if (action === "unblock") {
        const [city] = await db.update(cityFranchises)
          .set({ status: "active", isActive: true, updatedAt: new Date() })
          .where(eq(cityFranchises.id, id))
          .returning();
        results.push(city);
      }
    }
    res.json({ success: true, count: results.length, items: results });
  } catch (error) {
    console.error("Bulk city action error:", error);
    res.status(500).json({ error: "Bulk operation failed" });
  }
});

// ==================== FRANCHISE HIERARCHY ====================

router.get("/hierarchy", requireFranchiseAccess, async (req, res) => {
  try {
    const zones = await db.select().from(zoneFranchises).where(eq(zoneFranchises.isActive, true));
    const states = await db.select().from(stateFranchises).where(eq(stateFranchises.isActive, true));
    const districts = await db.select().from(districtFranchises).where(eq(districtFranchises.isActive, true));
    const cities = await db.select().from(cityFranchises).where(eq(cityFranchises.isActive, true));

    const hierarchy = zones.map(zone => ({
      ...zone,
      type: "zone",
      children: states.filter(s => s.zoneId === zone.id).map(state => ({
        ...state,
        type: "state",
        children: districts.filter(d => d.stateId === state.id).map(district => ({
          ...district,
          type: "district",
          children: cities.filter(c => c.districtId === district.id).map(city => ({
            ...city,
            type: "city"
          }))
        }))
      }))
    }));

    res.json(hierarchy);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch hierarchy" });
  }
});

// ==================== COMMISSION CONFIGURATION ====================

router.get("/commission-config", requireSuperAdmin, async (req, res) => {
  try {
    const configs = await db.select().from(commissionRateConfig).orderBy(desc(commissionRateConfig.createdAt));
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch commission configs" });
  }
});

router.get("/commission-config/default", async (req, res) => {
  try {
    const [config] = await db.select().from(commissionRateConfig)
      .orderBy(desc(commissionRateConfig.createdAt))
      .limit(1);
    
    if (!config) {
      return res.json({
        agentRate: 15,
        cityFranchiseRate: 6,
        districtFranchiseRate: 5,
        stateFranchiseRate: 4,
        zoneFranchiseRate: 3,
        superAdminRate: 67
      });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch default config" });
  }
});

router.post("/commission-config", requireSuperAdmin, async (req, res) => {
  try {
    const data = z.object({
      configName: z.string().min(2),
      agentRate: z.number().min(0).max(100).default(15),
      cityFranchiseRate: z.number().min(0).max(100).default(6),
      districtFranchiseRate: z.number().min(0).max(100).default(5),
      stateFranchiseRate: z.number().min(0).max(100).default(4),
      zoneFranchiseRate: z.number().min(0).max(100).default(3),
      superAdminRate: z.number().min(0).max(100).default(67),
      isDefault: z.boolean().default(false),
    }).parse(req.body);

    if (data.isDefault) {
      await db.update(commissionRateConfig).set({ isDefault: false });
    }

    const [config] = await db.insert(commissionRateConfig).values({
      ...data,
      createdBy: req.session!.userId,
    }).returning();

    res.status(201).json(config);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create commission config" });
  }
});

// ==================== FRANCHISE DASHBOARD STATS ====================

router.get("/dashboard/stats", requireFranchiseAccess, async (req, res) => {
  try {
    const zoneCount = await db.select({ count: count() }).from(zoneFranchises).where(eq(zoneFranchises.isActive, true));
    const stateCount = await db.select({ count: count() }).from(stateFranchises).where(eq(stateFranchises.isActive, true));
    const districtCount = await db.select({ count: count() }).from(districtFranchises).where(eq(districtFranchises.isActive, true));
    const cityCount = await db.select({ count: count() }).from(cityFranchises).where(eq(cityFranchises.isActive, true));

    const totalAgents = await db.select({ count: count() }).from(users).where(eq(users.role, "agent"));
    const totalMembers = await db.select({ count: count() }).from(memberships);

    const totalRevenue = await db.select({ total: sum(payments.amount) }).from(payments).where(eq(payments.status, "succeeded"));

    res.json({
      zones: zoneCount[0]?.count || 0,
      states: stateCount[0]?.count || 0,
      districts: districtCount[0]?.count || 0,
      cities: cityCount[0]?.count || 0,
      totalAgents: totalAgents[0]?.count || 0,
      totalMembers: totalMembers[0]?.count || 0,
      totalRevenue: totalRevenue[0]?.total || 0,
      commissionDistribution: {
        agent: 15,
        city: 6,
        district: 5,
        state: 4,
        zone: 3,
        superAdmin: 67
      }
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// ==================== FRANCHISE REPORTS ====================

router.get("/reports", requireFranchiseAccess, async (req, res) => {
  try {
    const { franchiseType, franchiseId, period, startDate, endDate } = req.query;
    
    let query = db.select().from(franchiseReports);
    
    if (franchiseType) {
      query = query.where(eq(franchiseReports.franchiseType, franchiseType as string)) as any;
    }
    if (franchiseId) {
      query = query.where(eq(franchiseReports.franchiseId, franchiseId as string)) as any;
    }

    const reports = await query.orderBy(desc(franchiseReports.reportDate)).limit(100);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// ==================== FRANCHISE PAYOUTS ====================

router.get("/payouts", requireFranchiseAccess, async (req, res) => {
  try {
    const { franchiseType, franchiseId, status } = req.query;
    
    let query = db.select().from(franchisePayouts);
    
    if (franchiseType) {
      query = query.where(eq(franchisePayouts.franchiseType, franchiseType as string)) as any;
    }
    if (status) {
      query = query.where(eq(franchisePayouts.status, status as string)) as any;
    }

    const payouts = await query.orderBy(desc(franchisePayouts.createdAt)).limit(100);
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payouts" });
  }
});

router.post("/payouts/:id/process", requireSuperAdmin, async (req, res) => {
  try {
    const { transactionId, utrNumber, notes } = req.body;
    
    const [payout] = await db.update(franchisePayouts)
      .set({
        status: "completed",
        transactionId,
        utrNumber,
        notes,
        processedBy: req.session!.userId,
        processedAt: new Date()
      })
      .where(eq(franchisePayouts.id, req.params.id))
      .returning();

    res.json(payout);
  } catch (error) {
    res.status(500).json({ error: "Failed to process payout" });
  }
});

// ==================== PRE-EXISTING CONDITIONS ====================

router.get("/pre-existing-conditions", async (req, res) => {
  try {
    const conditions = await db.select().from(preExistingConditions).where(eq(preExistingConditions.isActive, true));
    res.json(conditions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pre-existing conditions" });
  }
});

router.post("/pre-existing-conditions", requireSuperAdmin, async (req, res) => {
  try {
    const data = z.object({
      conditionCode: z.string().min(2).max(20),
      name: z.string().min(2),
      category: z.string().min(2),
      description: z.string().optional(),
      icdCode: z.string().optional(),
      isExcluded: z.boolean().default(true),
      waitingPeriodMonths: z.number().default(0),
      notes: z.string().optional(),
    }).parse(req.body);

    const [condition] = await db.insert(preExistingConditions).values(data).returning();
    res.status(201).json(condition);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create condition" });
  }
});

// ==================== AGENT FRANCHISE ASSIGNMENTS ====================

router.get("/agent-assignments", requireFranchiseAccess, async (req, res) => {
  try {
    const { cityId, districtId } = req.query;
    
    const conditions = [eq(agentFranchiseAssignments.isActive, true)];
    
    if (cityId) {
      conditions.push(eq(agentFranchiseAssignments.cityFranchiseId, cityId as string));
    }
    if (districtId) {
      conditions.push(eq(agentFranchiseAssignments.districtFranchiseId, districtId as string));
    }

    const assignments = await db.select().from(agentFranchiseAssignments).where(and(...conditions));
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agent assignments" });
  }
});

router.post("/agent-assignments", requireSuperAdmin, async (req, res) => {
  try {
    const data = z.object({
      agentId: z.string(),
      cityFranchiseId: z.string().optional(),
      districtFranchiseId: z.string().optional(),
      commissionRate: z.number().min(0).max(100).default(15),
    }).parse(req.body);

    const [assignment] = await db.insert(agentFranchiseAssignments).values({
      agentId: data.agentId,
      franchiseType: data.cityFranchiseId ? "city" : "district",
      franchiseId: data.cityFranchiseId || data.districtFranchiseId || "",
      cityFranchiseId: data.cityFranchiseId,
      districtFranchiseId: data.districtFranchiseId,
      commissionRate: data.commissionRate,
      assignedBy: req.session!.userId,
    }).returning();

    res.status(201).json(assignment);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create assignment" });
  }
});

// ==================== BULK OPERATIONS ====================

const VALID_STATUSES = ["active", "inactive", "suspended", "pending"];

function validateBulkRequest(ids: any, status?: string) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { valid: false, error: "No IDs provided" };
  }
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return { valid: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` };
  }
  return { valid: true };
}

// Bulk delete zones
router.post("/zones/bulk-delete", requireSuperAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    const validation = validateBulkRequest(ids);
    if (!validation.valid) return res.status(400).json({ error: validation.error });
    for (const id of ids) {
      await db.update(zoneFranchises).set({ isActive: false, status: "deleted" }).where(eq(zoneFranchises.id, id));
    }
    res.json({ success: true, deleted: ids.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to bulk delete zones" });
  }
});

// Bulk status update zones
router.post("/zones/bulk-status", requireSuperAdmin, async (req, res) => {
  try {
    const { ids, status } = req.body;
    const validation = validateBulkRequest(ids, status);
    if (!validation.valid) return res.status(400).json({ error: validation.error });
    for (const id of ids) {
      await db.update(zoneFranchises).set({ status }).where(eq(zoneFranchises.id, id));
    }
    res.json({ success: true, updated: ids.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to bulk update zones" });
  }
});

// Bulk delete states
router.post("/states/bulk-delete", requireSuperAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    const validation = validateBulkRequest(ids);
    if (!validation.valid) return res.status(400).json({ error: validation.error });
    for (const id of ids) {
      await db.update(stateFranchises).set({ isActive: false, status: "deleted" }).where(eq(stateFranchises.id, id));
    }
    res.json({ success: true, deleted: ids.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to bulk delete states" });
  }
});

// Bulk status update states
router.post("/states/bulk-status", requireSuperAdmin, async (req, res) => {
  try {
    const { ids, status } = req.body;
    const validation = validateBulkRequest(ids, status);
    if (!validation.valid) return res.status(400).json({ error: validation.error });
    for (const id of ids) {
      await db.update(stateFranchises).set({ status }).where(eq(stateFranchises.id, id));
    }
    res.json({ success: true, updated: ids.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to bulk update states" });
  }
});

// Bulk delete districts
router.post("/districts/bulk-delete", requireSuperAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    const validation = validateBulkRequest(ids);
    if (!validation.valid) return res.status(400).json({ error: validation.error });
    for (const id of ids) {
      await db.update(districtFranchises).set({ isActive: false, status: "deleted" }).where(eq(districtFranchises.id, id));
    }
    res.json({ success: true, deleted: ids.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to bulk delete districts" });
  }
});

// Bulk status update districts
router.post("/districts/bulk-status", requireSuperAdmin, async (req, res) => {
  try {
    const { ids, status } = req.body;
    const validation = validateBulkRequest(ids, status);
    if (!validation.valid) return res.status(400).json({ error: validation.error });
    for (const id of ids) {
      await db.update(districtFranchises).set({ status }).where(eq(districtFranchises.id, id));
    }
    res.json({ success: true, updated: ids.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to bulk update districts" });
  }
});

// Bulk delete cities
router.post("/cities/bulk-delete", requireSuperAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    const validation = validateBulkRequest(ids);
    if (!validation.valid) return res.status(400).json({ error: validation.error });
    for (const id of ids) {
      await db.update(cityFranchises).set({ isActive: false, status: "deleted" }).where(eq(cityFranchises.id, id));
    }
    res.json({ success: true, deleted: ids.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to bulk delete cities" });
  }
});

// Bulk status update cities
router.post("/cities/bulk-status", requireSuperAdmin, async (req, res) => {
  try {
    const { ids, status } = req.body;
    const validation = validateBulkRequest(ids, status);
    if (!validation.valid) return res.status(400).json({ error: validation.error });
    for (const id of ids) {
      await db.update(cityFranchises).set({ status }).where(eq(cityFranchises.id, id));
    }
    res.json({ success: true, updated: ids.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to bulk update cities" });
  }
});

// ==================== CSV EXPORT ====================

// Export zones
router.get("/zones/export", requireSuperAdmin, async (req, res) => {
  try {
    const zones = await db.select().from(zoneFranchises).where(eq(zoneFranchises.isActive, true));
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: "Failed to export zones" });
  }
});

// Export states
router.get("/states/export", requireSuperAdmin, async (req, res) => {
  try {
    const states = await db.select().from(stateFranchises).where(eq(stateFranchises.isActive, true));
    res.json(states);
  } catch (error) {
    res.status(500).json({ error: "Failed to export states" });
  }
});

// Export districts
router.get("/districts/export", requireSuperAdmin, async (req, res) => {
  try {
    const districts = await db.select().from(districtFranchises).where(eq(districtFranchises.isActive, true));
    res.json(districts);
  } catch (error) {
    res.status(500).json({ error: "Failed to export districts" });
  }
});

// Export cities
router.get("/cities/export", requireSuperAdmin, async (req, res) => {
  try {
    const cities = await db.select().from(cityFranchises).where(eq(cityFranchises.isActive, true));
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: "Failed to export cities" });
  }
});

// ==================== SEED INDIA GEOGRAPHY ====================

router.post("/seed-india", requireSuperAdmin, async (req, res) => {
  try {
    // Check if already seeded
    const existingZones = await db.select().from(zoneFranchises).limit(1);
    if (existingZones.length > 0) {
      return res.json({ message: "Geography data already exists", skipped: true });
    }

    const indiaZones = [
      { zoneCode: "NORTH", name: "North Zone", states: ["Delhi", "Haryana", "Punjab", "Uttar Pradesh", "Uttarakhand", "Himachal Pradesh", "Jammu & Kashmir", "Ladakh", "Chandigarh"] },
      { zoneCode: "SOUTH", name: "South Zone", states: ["Karnataka", "Tamil Nadu", "Kerala", "Andhra Pradesh", "Telangana", "Puducherry", "Lakshadweep", "Andaman & Nicobar"] },
      { zoneCode: "EAST", name: "East Zone", states: ["West Bengal", "Bihar", "Jharkhand", "Odisha", "Sikkim"] },
      { zoneCode: "WEST", name: "West Zone", states: ["Maharashtra", "Gujarat", "Rajasthan", "Goa", "Dadra & Nagar Haveli", "Daman & Diu"] },
      { zoneCode: "CENTRAL", name: "Central Zone", states: ["Madhya Pradesh", "Chhattisgarh"] },
      { zoneCode: "NORTHEAST", name: "Northeast Zone", states: ["Assam", "Meghalaya", "Manipur", "Mizoram", "Tripura", "Nagaland", "Arunachal Pradesh"] },
    ];

    const indiaStates = [
      { code: "AP", name: "Andhra Pradesh", zone: "SOUTH" },
      { code: "AR", name: "Arunachal Pradesh", zone: "NORTHEAST" },
      { code: "AS", name: "Assam", zone: "NORTHEAST" },
      { code: "BR", name: "Bihar", zone: "EAST" },
      { code: "CT", name: "Chhattisgarh", zone: "CENTRAL" },
      { code: "GA", name: "Goa", zone: "WEST" },
      { code: "GJ", name: "Gujarat", zone: "WEST" },
      { code: "HR", name: "Haryana", zone: "NORTH" },
      { code: "HP", name: "Himachal Pradesh", zone: "NORTH" },
      { code: "JH", name: "Jharkhand", zone: "EAST" },
      { code: "KA", name: "Karnataka", zone: "SOUTH" },
      { code: "KL", name: "Kerala", zone: "SOUTH" },
      { code: "MP", name: "Madhya Pradesh", zone: "CENTRAL" },
      { code: "MH", name: "Maharashtra", zone: "WEST" },
      { code: "MN", name: "Manipur", zone: "NORTHEAST" },
      { code: "ML", name: "Meghalaya", zone: "NORTHEAST" },
      { code: "MZ", name: "Mizoram", zone: "NORTHEAST" },
      { code: "NL", name: "Nagaland", zone: "NORTHEAST" },
      { code: "OD", name: "Odisha", zone: "EAST" },
      { code: "PB", name: "Punjab", zone: "NORTH" },
      { code: "RJ", name: "Rajasthan", zone: "WEST" },
      { code: "SK", name: "Sikkim", zone: "EAST" },
      { code: "TN", name: "Tamil Nadu", zone: "SOUTH" },
      { code: "TG", name: "Telangana", zone: "SOUTH" },
      { code: "TR", name: "Tripura", zone: "NORTHEAST" },
      { code: "UP", name: "Uttar Pradesh", zone: "NORTH" },
      { code: "UK", name: "Uttarakhand", zone: "NORTH" },
      { code: "WB", name: "West Bengal", zone: "EAST" },
      { code: "DL", name: "Delhi", zone: "NORTH" },
      { code: "JK", name: "Jammu & Kashmir", zone: "NORTH" },
      { code: "LA", name: "Ladakh", zone: "NORTH" },
      { code: "CH", name: "Chandigarh", zone: "NORTH" },
      { code: "PY", name: "Puducherry", zone: "SOUTH" },
      { code: "AN", name: "Andaman & Nicobar", zone: "SOUTH" },
      { code: "LD", name: "Lakshadweep", zone: "SOUTH" },
      { code: "DD", name: "Dadra & Nagar Haveli", zone: "WEST" },
      { code: "DN", name: "Daman & Diu", zone: "WEST" },
    ];

    const majorDistricts: Record<string, string[]> = {
      "KA": ["Bangalore Urban", "Bangalore Rural", "Mysore", "Mangalore", "Hubli-Dharwad", "Belgaum", "Gulbarga", "Bellary", "Shimoga", "Tumkur"],
      "TN": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Dindigul"],
      "MH": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Nanded"],
      "DL": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "South Delhi", "West Delhi", "North West Delhi", "South West Delhi", "North East Delhi", "Shahdara"],
      "TG": ["Hyderabad", "Rangareddy", "Medchal-Malkajgiri", "Sangareddy", "Warangal Urban", "Karimnagar", "Nizamabad", "Khammam", "Nalgonda", "Mahabubnagar"],
      "AP": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Kakinada", "Rajahmundry", "Kadapa", "Anantapur"],
      "GJ": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Mehsana"],
      "UP": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Allahabad", "Bareilly", "Aligarh", "Moradabad"],
    };

    const majorCities: Record<string, string[]> = {
      "Bangalore Urban": ["Bengaluru", "Whitefield", "Electronic City", "Yelahanka", "Marathahalli"],
      "Mumbai": ["Mumbai Central", "Andheri", "Bandra", "Borivali", "Navi Mumbai"],
      "Chennai": ["Chennai Central", "Adyar", "T Nagar", "Velachery", "Tambaram"],
      "Hyderabad": ["Hyderabad Central", "Gachibowli", "Madhapur", "Secunderabad", "Kukatpally"],
      "Pune": ["Pune City", "Hinjewadi", "Kothrud", "Hadapsar", "Pimpri-Chinchwad"],
    };

    // Insert zones
    const zoneMap: Record<string, string> = {};
    for (const zone of indiaZones) {
      const [inserted] = await db.insert(zoneFranchises).values({
        zoneCode: zone.zoneCode,
        name: zone.name,
        states: zone.states,
        commissionRate: 3,
        status: "active",
      }).returning();
      zoneMap[zone.zoneCode] = inserted.id;
    }

    // Insert states
    const stateMap: Record<string, string> = {};
    for (const state of indiaStates) {
      const [inserted] = await db.insert(stateFranchises).values({
        stateCode: state.code,
        name: state.name,
        stateName: state.name,
        zoneId: zoneMap[state.zone] || null,
        commissionRate: 4,
        status: "active",
      }).returning();
      stateMap[state.code] = inserted.id;
    }

    // Insert districts
    const districtMap: Record<string, string> = {};
    for (const [stateCode, districts] of Object.entries(majorDistricts)) {
      for (const districtName of districts) {
        const districtCode = `${stateCode}_${districtName.substring(0, 3).toUpperCase()}`;
        const [inserted] = await db.insert(districtFranchises).values({
          districtCode,
          name: districtName,
          districtName: districtName,
          stateId: stateMap[stateCode] || null,
          commissionRate: 5,
          status: "active",
        }).returning();
        districtMap[districtName] = inserted.id;
      }
    }

    // Insert cities
    for (const [districtName, cities] of Object.entries(majorCities)) {
      for (const cityName of cities) {
        const cityCode = `${districtName.substring(0, 3).toUpperCase()}_${cityName.substring(0, 3).toUpperCase()}`;
        await db.insert(cityFranchises).values({
          cityCode,
          name: cityName,
          cityName: cityName,
          districtId: districtMap[districtName] || null,
          commissionRate: 6,
          status: "active",
        });
      }
    }

    res.json({ 
      success: true, 
      message: "India geography data seeded successfully",
      counts: {
        zones: indiaZones.length,
        states: indiaStates.length,
        districts: Object.values(majorDistricts).flat().length,
        cities: Object.values(majorCities).flat().length
      }
    });
  } catch (error) {
    console.error("Error seeding India geography:", error);
    res.status(500).json({ error: "Failed to seed India geography data" });
  }
});

// ==================== FRANCHISE USER MANAGEMENT ====================

router.get("/users", requireFranchiseAccess, async (req, res) => {
  try {
    const filter = await getFranchiseFilter(req.session!.userId, req.session!.userRole || "");
    let conditions: any[] = [];
    
    if (!filter.canViewAll) {
      if (filter.cityFranchiseId) {
        conditions.push(eq(users.cityFranchiseId, filter.cityFranchiseId));
      } else if (filter.districtFranchiseId) {
        conditions.push(eq(users.districtFranchiseId, filter.districtFranchiseId));
      } else if (filter.stateFranchiseId) {
        conditions.push(eq(users.stateFranchiseId, filter.stateFranchiseId));
      } else if (filter.zoneFranchiseId) {
        conditions.push(eq(users.zoneFranchiseId, filter.zoneFranchiseId));
      }
    }
    
    const userList = conditions.length > 0
      ? await db.select({
          id: users.id,
          name: users.name,
          mobile: users.mobile,
          email: users.email,
          role: users.role,
          zoneFranchiseId: users.zoneFranchiseId,
          stateFranchiseId: users.stateFranchiseId,
          districtFranchiseId: users.districtFranchiseId,
          cityFranchiseId: users.cityFranchiseId,
          createdAt: users.createdAt
        }).from(users).where(and(...conditions)).orderBy(desc(users.createdAt))
      : await db.select({
          id: users.id,
          name: users.name,
          mobile: users.mobile,
          email: users.email,
          role: users.role,
          zoneFranchiseId: users.zoneFranchiseId,
          stateFranchiseId: users.stateFranchiseId,
          districtFranchiseId: users.districtFranchiseId,
          cityFranchiseId: users.cityFranchiseId,
          createdAt: users.createdAt
        }).from(users).orderBy(desc(users.createdAt));
    
    res.json(userList);
  } catch (error) {
    console.error("Error fetching franchise users:", error);
    res.status(500).json({ error: "Failed to fetch franchise users" });
  }
});

router.post("/users/:userId/assign", requireSuperAdmin, async (req, res) => {
  try {
    const { zoneFranchiseId, stateFranchiseId, districtFranchiseId, cityFranchiseId, role } = req.body;
    
    const updateData: any = {};
    if (zoneFranchiseId !== undefined) updateData.zoneFranchiseId = zoneFranchiseId;
    if (stateFranchiseId !== undefined) updateData.stateFranchiseId = stateFranchiseId;
    if (districtFranchiseId !== undefined) updateData.districtFranchiseId = districtFranchiseId;
    if (cityFranchiseId !== undefined) updateData.cityFranchiseId = cityFranchiseId;
    if (role) updateData.role = role;
    
    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, req.params.userId))
      .returning();
    
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const { passwordHash, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    console.error("Error assigning user to franchise:", error);
    res.status(500).json({ error: "Failed to assign user to franchise" });
  }
});

router.get("/users/by-franchise/:type/:franchiseId", requireFranchiseAccess, async (req, res) => {
  try {
    const { type, franchiseId } = req.params;
    const filter = await getFranchiseFilter(req.session!.userId, req.session!.userRole || "");
    
    let condition;
    switch (type) {
      case "zone":
        if (!filter.canViewAll && filter.zoneFranchiseId && filter.zoneFranchiseId !== franchiseId) {
          return res.status(403).json({ error: "Access denied" });
        }
        condition = eq(users.zoneFranchiseId, franchiseId);
        break;
      case "state":
        if (!filter.canViewAll && filter.stateFranchiseId && filter.stateFranchiseId !== franchiseId) {
          return res.status(403).json({ error: "Access denied" });
        }
        condition = eq(users.stateFranchiseId, franchiseId);
        break;
      case "district":
        if (!filter.canViewAll && filter.districtFranchiseId && filter.districtFranchiseId !== franchiseId) {
          return res.status(403).json({ error: "Access denied" });
        }
        condition = eq(users.districtFranchiseId, franchiseId);
        break;
      case "city":
        if (!filter.canViewAll && filter.cityFranchiseId && filter.cityFranchiseId !== franchiseId) {
          return res.status(403).json({ error: "Access denied" });
        }
        condition = eq(users.cityFranchiseId, franchiseId);
        break;
      default:
        return res.status(400).json({ error: "Invalid franchise type" });
    }
    
    const userList = await db.select({
      id: users.id,
      name: users.name,
      mobile: users.mobile,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt
    }).from(users).where(condition).orderBy(desc(users.createdAt));
    
    res.json(userList);
  } catch (error) {
    console.error("Error fetching users by franchise:", error);
    res.status(500).json({ error: "Failed to fetch users by franchise" });
  }
});

export default router;
