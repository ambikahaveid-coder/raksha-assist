import { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { pageVisits, dailyVisitors } from "../shared/schema";
import { eq } from "drizzle-orm";

// Get today's date in IST (UTC+5:30)
function getTodayIST(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST = UTC + 5:30
  const ist = new Date(now.getTime() + istOffset);
  return ist.toISOString().split("T")[0]; // YYYY-MM-DD in IST
}

// Extract real IP from x-forwarded-for (handles DO load balancer)
function getRealIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    // x-forwarded-for can be "client, proxy1, proxy2" — take first (real client)
    const ips = forwarded.toString().split(",").map(ip => ip.trim());
    return ips[0] || "unknown";
  }
  return req.ip || "unknown";
}

export const visitorTrackingMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Skip API requests and static assets
  if (req.path.startsWith("/api") || req.path.includes(".")) {
    return next();
  }

  try {
    const today = getTodayIST();
    const visitorIp = getRealIp(req);
    const sessionId = req.sessionID || req.headers["x-session-id"]?.toString();

    // Record page visit
    await db.insert(pageVisits).values({
      visitorIp,
      sessionId,
      pagePath: req.path,
      userAgent: req.headers["user-agent"],
      referrer: req.headers["referer"],
      userId: (req.session as any)?.userId || null
    });

    // Update daily visitor count
    const existingRecord = await db.select().from(dailyVisitors).where(eq(dailyVisitors.date, today)).limit(1);

    if (existingRecord.length > 0) {
      const record = existingRecord[0];
      const existingIps: string[] = record.uniqueIps ? JSON.parse(record.uniqueIps) : [];
      const isNewVisitor = !existingIps.includes(visitorIp);

      if (isNewVisitor) {
        existingIps.push(visitorIp);
      }

      await db.update(dailyVisitors)
        .set({
          visitorCount: isNewVisitor ? (record.visitorCount || 0) + 1 : (record.visitorCount || 0),
          pageViews: (record.pageViews || 0) + 1,
          uniqueIps: JSON.stringify(existingIps),
          updatedAt: new Date()
        })
        .where(eq(dailyVisitors.id, record.id));
    } else {
      await db.insert(dailyVisitors).values({
        date: today,
        visitorCount: 1,
        pageViews: 1,
        uniqueIps: JSON.stringify([visitorIp])
      });
    }
  } catch (error) {
    console.error("Visitor tracking error:", error);
  }

  next();
};
