import crypto from "crypto";
import { storage } from "../storage";

interface LiftmatePilotOnboardRequest {
  pilotId: string;
  name: string;
  mobile: string;
  email?: string;
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  familyMembers?: Array<{
    name: string;
    relation: string;
    dob?: string;
    gender?: string;
  }>;
}

interface LiftmateRideEventRequest {
  rideId: string;
  pilotId: string;
  event: "start" | "complete" | "cancel";
  timestamp: string;
  fareAmount?: number;
  pickupLocation?: string;
  dropLocation?: string;
  distanceKm?: number;
}

interface LiftmateSettlementRequest {
  batchId: string;
  companyId: string;
  totalAmount: number;
  paymentRef: string;
  rideIds: string[];
}

export function verifyLiftmateWebhook(
  payload: string,
  signature: string,
  webhookSecret: string,
  timestamp: string
): boolean {
  const signaturePayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(signaturePayload)
    .digest("hex");
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch {
    return false;
  }
}

export async function getLiftmateIntegration(companyId: string) {
  return storage.getLiftmateIntegration(companyId);
}

export async function onboardPilot(
  companyId: string,
  data: LiftmatePilotOnboardRequest
): Promise<{ success: boolean; membershipId?: string; error?: string }> {
  try {
    const integration = await storage.getLiftmateIntegration(companyId);
    if (!integration || !integration.isActive) {
      return { success: false, error: "LiftMate integration not active" };
    }

    const company = await storage.getCompanyById(companyId);
    if (!company) {
      return { success: false, error: "Company not found" };
    }

    let user = await storage.getUserByMobile(data.mobile);
    if (!user) {
      user = await storage.createUser({
        mobile: data.mobile,
        name: data.name,
        email: data.email || null,
        role: "user",
      });
    }

    let employee = await storage.getCorporateEmployeeByMobile(companyId, data.mobile);
    if (!employee) {
      employee = await storage.createCorporateEmployee({
        companyId,
        userId: user.id,
        name: data.name,
        email: data.email || null,
        mobile: data.mobile,
        department: "Pilot",
        designation: "Delivery Partner",
        coverageStatus: "active",
      });
    }

    const membershipNumber = `LM${Date.now().toString(36).toUpperCase()}`;
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const membership = await storage.createMembership({
      userId: user.id,
      planType: integration.defaultPlanType,
      membershipNumber,
      planAmount: 0,
      coverageAmount: integration.accidentCoverageAmount,
      status: "active",
      paymentStatus: "corporate",
    });

    await storage.createLiftmatePilot({
      corporateEmployeeId: employee.id,
      liftmatePilotId: data.pilotId,
      vehicleType: data.vehicleType,
      vehicleNumber: data.vehicleNumber,
      licenseNumber: data.licenseNumber,
      membershipId: membership.id,
      onboardingStatus: "completed",
    });

    if (data.familyMembers && data.familyMembers.length > 0) {
      const maxFamily = Math.min(data.familyMembers.length, integration.familyCoverageLimit);
      for (let i = 0; i < maxFamily; i++) {
        const fm = data.familyMembers[i];
        await storage.createFamilyMember({
          membershipId: membership.id,
          name: fm.name,
          relation: fm.relation,
          dob: fm.dob,
          gender: fm.gender,
        });
      }
    }

    await storage.createAuditLog({
      userId: user.id,
      action: "liftmate_pilot_onboard",
      details: `Pilot ${data.pilotId} onboarded with membership ${membershipNumber}`,
      ipAddress: "webhook",
    });

    return { success: true, membershipId: membership.id };
  } catch (error: any) {
    console.error("Pilot onboarding error:", error);
    return { success: false, error: error.message };
  }
}

export async function handleRideEvent(
  companyId: string,
  data: LiftmateRideEventRequest,
  idempotencyKey?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const integration = await storage.getLiftmateIntegration(companyId);
    if (!integration || !integration.isActive) {
      return { success: false, error: "LiftMate integration not active" };
    }

    const pilot = await storage.getLiftmatePilotByExternalId(data.pilotId);
    if (!pilot || !pilot.membershipId) {
      return { success: false, error: "Pilot not found or no active membership" };
    }

    const eventTime = new Date(data.timestamp);

    if (data.event === "start") {
      const existingRide = await storage.getLiftmateRideByExternalId(data.rideId);
      if (existingRide) {
        return { success: true };
      }

      const ride = await storage.createLiftmateRide({
        rideId: data.rideId,
        pilotId: pilot.id,
        membershipId: pilot.membershipId,
        status: "started",
        startedAt: eventTime,
        pickupLocation: data.pickupLocation,
        dropLocation: data.dropLocation,
        coverageActivatedAt: eventTime,
        idempotencyKey,
      });

      await storage.createCoverageExposureLog({
        membershipId: pilot.membershipId,
        rideId: ride.id,
        coverageWindowStart: eventTime,
        coverageType: "ride_time",
      });

    } else if (data.event === "complete") {
      const ride = await storage.getLiftmateRideByExternalId(data.rideId);
      if (!ride) {
        return { success: false, error: "Ride not found" };
      }

      const fareAmount = data.fareAmount || 0;
      const rakshaShare = Math.round(
        (fareAmount * integration.revenueSharePercent / 100) + integration.fixedFeePerRide
      );

      const graceEndTime = new Date(eventTime);
      graceEndTime.setMinutes(graceEndTime.getMinutes() + integration.graceMinutesAfterRide);

      await storage.updateLiftmateRide(ride.id, {
        status: "completed",
        endedAt: eventTime,
        fareAmount,
        rakshaShareAmount: rakshaShare,
        distanceKm: data.distanceKm,
        coverageDeactivatedAt: graceEndTime,
        processedAt: new Date(),
      });

      await storage.updateCoverageExposureLog(ride.id, {
        coverageWindowEnd: graceEndTime,
      });

      await storage.createLiftmateRevenueLedger({
        companyId,
        rideId: ride.id,
        amountDue: rakshaShare,
        gstAmount: Math.round(rakshaShare * 0.18),
        settlementStatus: "pending",
      });

    } else if (data.event === "cancel") {
      const ride = await storage.getLiftmateRideByExternalId(data.rideId);
      if (ride) {
        await storage.updateLiftmateRide(ride.id, {
          status: "cancelled",
          endedAt: eventTime,
          coverageDeactivatedAt: eventTime,
        });

        await storage.updateCoverageExposureLog(ride.id, {
          coverageWindowEnd: eventTime,
        });
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Ride event error:", error);
    return { success: false, error: error.message };
  }
}

export async function processSettlement(
  companyId: string,
  data: LiftmateSettlementRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date();
    
    for (const rideId of data.rideIds) {
      const ride = await storage.getLiftmateRideByExternalId(rideId);
      if (ride) {
        await storage.updateLiftmateRevenueLedgerByRide(ride.id, {
          amountPaid: data.totalAmount / data.rideIds.length,
          paymentRef: data.paymentRef,
          settlementStatus: "paid",
          settlementBatchId: data.batchId,
          settledAt: now,
        });
      }
    }

    await storage.createAuditLog({
      userId: "system",
      action: "liftmate_settlement",
      details: `Settlement batch ${data.batchId} processed for ${data.rideIds.length} rides`,
      ipAddress: "webhook",
    });

    return { success: true };
  } catch (error: any) {
    console.error("Settlement error:", error);
    return { success: false, error: error.message };
  }
}

export async function checkCoverageEligibility(
  membershipId: string,
  incidentTime: Date
): Promise<{ eligible: boolean; rideId?: string; reason?: string }> {
  try {
    const coverageLogs = await storage.getActiveCoverageLogs(membershipId);
    
    for (const log of coverageLogs) {
      const start = new Date(log.coverageWindowStart);
      const end = log.coverageWindowEnd ? new Date(log.coverageWindowEnd) : new Date();
      
      if (incidentTime >= start && incidentTime <= end) {
        return { eligible: true, rideId: log.rideId || undefined };
      }
    }

    return { eligible: false, reason: "No active ride coverage at incident time" };
  } catch (error: any) {
    return { eligible: false, reason: error.message };
  }
}

export async function getPilotDashboardStats(companyId: string) {
  try {
    const pilots = await storage.getLiftmatePilotsByCompany(companyId);
    const rides = await storage.getLiftmateRidesByCompany(companyId);
    const ledger = await storage.getLiftmateRevenueLedgerByCompany(companyId);

    const totalPilots = pilots.length;
    const activePilots = pilots.filter(p => p.isActive).length;
    const totalRides = rides.length;
    const completedRides = rides.filter(r => r.status === "completed").length;
    const totalRevenue = ledger.reduce((sum, l) => sum + (l.amountDue || 0), 0);
    const collectedRevenue = ledger.filter(l => l.settlementStatus === "paid")
      .reduce((sum, l) => sum + (l.amountPaid || 0), 0);
    const pendingRevenue = totalRevenue - collectedRevenue;

    return {
      totalPilots,
      activePilots,
      totalRides,
      completedRides,
      totalRevenue,
      collectedRevenue,
      pendingRevenue,
      recentRides: rides.slice(0, 10),
      pendingSettlements: ledger.filter(l => l.settlementStatus === "pending"),
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return null;
  }
}
