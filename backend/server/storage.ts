import { encryptPII, decryptPII, isEncrypted } from './utils/crypto';

import { 
  type User, 
  type InsertUser,
  type Membership,
  type InsertMembership,
  type FamilyMember,
  type InsertFamilyMember,
  type AgentData,
  type InsertAgentData,
  type AgentCommission,
  type InsertAgentCommission,
  type AgentPayout,
  type InsertAgentPayout,
  type Offer,
  type InsertOffer,
  type EmergencyRequest,
  type InsertEmergencyRequest,
  type OtpVerification,
  type InsertOtpVerification,
  type Hospital,
  type InsertHospital,
  type Payment,
  type InsertPayment,
  type SystemSetting,
  type InsertSystemSetting,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type AuditLog,
  type InsertAuditLog,
  type AdminPermission,
  type InsertAdminPermission,
  type LoginAttempt,
  type InsertLoginAttempt,
  type StaffStatus,
  type Document,
  type InsertDocument,
  type CommissionConfig,
  type InsertCommissionConfig,
  type PromotionalOffer,
  type InsertPromotionalOffer,
  type MarketingCampaign,
  type InsertMarketingCampaign,
  type AiClaimAnalysis,
  type InsertAiClaimAnalysis,
  type EnterprisePlan,
  type InsertEnterprisePlan,
  type DiseaseExclusion,
  type InsertDiseaseExclusion,
  type CoverageZone,
  type InsertCoverageZone,
  type Employer,
  type InsertEmployer,
  type PlanExclusion,
  type PlanZone,
  type PlanCondition,
  type InsertPlanCondition,
  type EmployerAuth,
  type InsertEmployerAuth,
  type EmployerPlan,
  type InsertEmployerPlan,
  type EmployerSupportContact,
  type SosCase,
  type InsertSosCase,
  type SosCaseEvent,
  type SosCaseAssignment,
  type SosNotification,
  type UserSosAbuse,
  type Plan,
  type InsertPlan,
  type Faq,
  type InsertFaq,
  type SiteContent,
  type InsertSiteContent,
  type Company,
  type InsertCompany,
  type CorporateEmployee,
  type InsertCorporateEmployee,
  type EmailTemplate,
  type InsertEmailTemplate,
  type EmailLog,
  type InsertEmailLog,
  type HospitalPayment,
  type InsertHospitalPayment,
  users,
  memberships,
  familyMembers,
  agentData,
  agentCommissions,
  agentPayouts,
  offers,
  emergencyRequests,
  otpVerifications,
  hospitals,
  payments,
  systemSettings,
  passwordResetTokens,
  auditLogs,
  adminPermissions,
  loginAttempts,
  staffStatus,
  documents,
  commissionConfig,
  promotionalOffers,
  marketingCampaigns,
  aiClaimAnalysis,
  enterprisePlans,
  diseaseExclusions,
  coverageZones,
  employers,
  planExclusions,
  planZones,
  planConditions,
  employerAuth,
  employerPlans,
  employerSupportContacts,
  sosCases,
  sosCaseEvents,
  sosCaseAssignments,
  sosNotifications,
  userSosAbuse,
  vehicleSosCases,
  plans,
  faqs,
  siteContent,
  companies,
  corporateEmployees,
  emailTemplates,
  emailLogs,
  hospitalPayments,
  mobileTokens,
  type MobileToken,
  profileUpdateRequests,
  type ProfileUpdateRequest,
  type InsertProfileUpdateRequest,
  integrationSettings,
  type IntegrationSetting,
  type InsertIntegrationSetting,
  addOnBenefits,
  membershipAddOns,
  COMMISSION_RATE,
  superAdminLoginChallenges,
  type SuperAdminLoginChallenge,
  type InsertSuperAdminLoginChallenge,
  pushSubscriptions,
  notifications,
  type PushSubscription,
  type InsertPushSubscription,
  type Notification,
  type InsertNotification,
  liftmateIntegrations,
  liftmatePilots,
  liftmateRides,
  liftmateRevenueLedger,
  coverageExposureLogs,
  type LiftmateIntegration,
  type InsertLiftmateIntegration,
  type LiftmatePilot,
  type InsertLiftmatePilot,
  type LiftmateRide,
  type InsertLiftmateRide,
  type LiftmateRevenueLedger,
  type InsertLiftmateRevenueLedger,
  type CoverageExposureLog,
  type InsertCoverageExposureLog,
  jobApplications,
  type JobApplication,
  type InsertJobApplication
} from "../shared/schema.js";
import { db, withTransaction } from "./db";
import { eq, desc, and, gt, gte, lt, lte, sql } from "drizzle-orm";

export interface IStorage {
  getUserByMobile(mobile: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  blockUser(id: string, blocked: boolean): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User>;
  getUsersPendingAadharVerification(): Promise<User[]>;
  
  createOtp(data: InsertOtpVerification): Promise<OtpVerification>;
  verifyOtp(mobile: string, code: string): Promise<boolean>;
  
  createMembership(data: InsertMembership): Promise<Membership>;
  getMembershipByUserId(userId: string): Promise<Membership | undefined>;
  getMembershipById(id: string): Promise<Membership | undefined>;
  getMembershipByNumber(membershipNumber: string): Promise<Membership | undefined>;
  updateMembership(id: string, data: Partial<InsertMembership>): Promise<Membership>;
  getAllMemberships(): Promise<Membership[]>;
  getMembershipsByAgent(agentId: string): Promise<Membership[]>;
  
  createPayment(data: InsertPayment): Promise<Payment>;
  getPaymentsByMembership(membershipId: string): Promise<Payment[]>;
  updatePayment(id: string, data: Partial<InsertPayment>): Promise<Payment>;
  getPaymentByOrderId(razorpayOrderId: string): Promise<Payment | undefined>;
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  getPaymentById(id: string): Promise<Payment | undefined>;
  getPaymentsByStatus(status: string): Promise<Payment[]>;
  getMembershipByOrderId(razorpayOrderId: string): Promise<Membership | undefined>;
  
  createFamilyMember(data: InsertFamilyMember): Promise<FamilyMember>;
  getFamilyMembers(membershipId: string): Promise<FamilyMember[]>;
  
  getAgentData(userId: string): Promise<AgentData | undefined>;
  createAgentData(data: InsertAgentData): Promise<AgentData>;
  updateAgentData(userId: string, data: Partial<InsertAgentData>): Promise<AgentData>;
  getTopAgents(limit: number): Promise<Array<AgentData & { user: User }>>;
  
  createOffer(data: InsertOffer): Promise<Offer>;
  getOffers(): Promise<Offer[]>;
  updateOffer(id: string, data: Partial<InsertOffer>): Promise<Offer>;
  
  createEmergencyRequest(data: InsertEmergencyRequest): Promise<EmergencyRequest>;
  getEmergencyRequests(userId?: string): Promise<EmergencyRequest[]>;
  getEmergencyRequestById(id: string): Promise<EmergencyRequest | undefined>;
  updateEmergencyRequest(id: string, data: Partial<InsertEmergencyRequest>): Promise<EmergencyRequest>;
  
  createHospital(data: InsertHospital): Promise<Hospital>;
  getHospitals(): Promise<Hospital[]>;
  updateHospital(id: string, data: Partial<InsertHospital>): Promise<Hospital>;
  deleteHospital(id: string): Promise<void>;
  deleteUser(id: string): Promise<void>;
  getUserByEmail(email: string): Promise<User | undefined>;
  
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  setSystemSetting(key: string, value: string, isEncrypted: boolean, updatedBy: string): Promise<SystemSetting>;
  getAllSystemSettings(): Promise<SystemSetting[]>;
  
  createPasswordResetToken(data: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  usePasswordResetToken(token: string): Promise<void>;
  
  createAuditLog(data: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  
  getAdminPermissions(userId: string): Promise<AdminPermission | undefined>;
  setAdminPermissions(userId: string, permissions: Partial<InsertAdminPermission>, grantedBy: string): Promise<AdminPermission>;
  getAllAdminPermissions(): Promise<AdminPermission[]>;
  deleteAdminPermissions(userId: string): Promise<void>;
  
  getLoginAttempts(identifier: string, type: string): Promise<LoginAttempt | undefined>;
  recordFailedLogin(identifier: string, type: string): Promise<LoginAttempt>;
  resetLoginAttempts(identifier: string, type: string): Promise<void>;
  isBlocked(identifier: string, type: string): Promise<boolean>;
  
  createAgentCommission(data: InsertAgentCommission): Promise<AgentCommission>;
  getAgentCommissions(agentId: string): Promise<AgentCommission[]>;
  getPendingCommissions(agentId: string): Promise<AgentCommission[]>;
  updateCommissionStatus(ids: string[], status: string, payoutId?: string): Promise<void>;
  
  createAgentPayout(data: InsertAgentPayout): Promise<AgentPayout>;
  getAgentPayouts(agentId: string): Promise<AgentPayout[]>;
  updateAgentPayout(id: string, data: Partial<InsertAgentPayout>): Promise<AgentPayout>;
  getPendingPayouts(): Promise<AgentPayout[]>;
  completeAgentPayout(payoutId: string, transactionId: string, processedBy: string): Promise<AgentPayout>;
  revertPayoutCommissions(payoutId: string): Promise<void>;
  
  // Companies (Corporate)
  createCompany(data: InsertCompany): Promise<Company>;
  getCompanies(): Promise<Company[]>;
  getCompanyById(id: string): Promise<Company | undefined>;
  getCompanyByLoginEmail(email: string): Promise<Company | undefined>;
  updateCompany(id: string, data: Partial<InsertCompany>): Promise<Company>;
  deleteCompany(id: string): Promise<void>;
  
  // Corporate Employees
  createCorporateEmployee(data: InsertCorporateEmployee): Promise<CorporateEmployee>;
  getCorporateEmployeesByCompany(companyId: string): Promise<CorporateEmployee[]>;
  getCorporateEmployeeById(id: string): Promise<CorporateEmployee | undefined>;
  updateCorporateEmployee(id: string, data: Partial<InsertCorporateEmployee>): Promise<CorporateEmployee>;
  deleteCorporateEmployee(id: string): Promise<void>;
  
  // Email Templates
  createEmailTemplate(data: InsertEmailTemplate): Promise<EmailTemplate>;
  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplateByName(name: string): Promise<EmailTemplate | undefined>;
  updateEmailTemplate(id: string, data: Partial<InsertEmailTemplate>): Promise<EmailTemplate>;
  deleteEmailTemplate(id: string): Promise<void>;
  
  // Email Logs
  createEmailLog(data: InsertEmailLog): Promise<EmailLog>;
  getEmailLogs(limit?: number): Promise<EmailLog[]>;
  updateEmailLog(id: string, data: Partial<InsertEmailLog>): Promise<EmailLog>;
  
  // Hospital Payments
  createHospitalPayment(data: InsertHospitalPayment): Promise<HospitalPayment>;
  getHospitalPayments(hospitalId?: string): Promise<HospitalPayment[]>;
  updateHospitalPayment(id: string, data: Partial<InsertHospitalPayment>): Promise<HospitalPayment>;
  // Plans
  getPlans(): Promise<Plan[]>;
  createPlan(data: InsertPlan): Promise<Plan>;
  getPlanByCode(code: string): Promise<Plan | undefined>;
  getAllPlans(): Promise<Plan[]>;
  getActivePlans(): Promise<Plan[]>;
  getPlanById(id: string): Promise<Plan | undefined>;
  updatePlan(id: string, data: Partial<InsertPlan>): Promise<Plan>;
  deletePlan(id: string): Promise<void>;
  
  // FAQs
  getAllFaqs(): Promise<Faq[]>;
  getActiveFaqs(): Promise<Faq[]>;
  getFaqsByCategory(category: string): Promise<Faq[]>;
  createFaq(data: InsertFaq): Promise<Faq>;
  updateFaq(id: string, data: Partial<InsertFaq>): Promise<Faq>;
  deleteFaq(id: string): Promise<void>;
  
  // Add-On Benefits
  getAddOnBenefits(): Promise<any[]>;
  getActiveAddOnBenefits(): Promise<any[]>;
  getAddOnBenefitById(id: string): Promise<any>;
  createAddOnBenefit(data: any): Promise<any>;
  updateAddOnBenefit(id: string, data: any): Promise<any>;

  // Integration Settings
  getIntegrationSettings(): Promise<IntegrationSetting[]>;
  getIntegrationSettingByProvider(provider: string): Promise<IntegrationSetting | undefined>;
  upsertIntegrationSetting(data: InsertIntegrationSetting): Promise<IntegrationSetting>;
  deleteIntegrationSetting(provider: string): Promise<void>;

  // Site Content
  getSiteContent(section: string): Promise<SiteContent | undefined>;
  getAllSiteContent(): Promise<SiteContent[]>;
  upsertSiteContent(data: InsertSiteContent): Promise<SiteContent>;
  
  // Payment Transaction
  processPaymentTransaction(params: { orderId: string; paymentId: string; method: string }): Promise<{ success: boolean; error?: string; alreadyProcessed?: boolean }>;
}

export class DatabaseStorage implements IStorage {
  async getPlans(): Promise<Plan[]> {
    return db.select().from(plans).orderBy(plans.price);
  }

  async getUserByMobile(mobile: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.mobile, mobile));
    return user ? this.decryptUserPII(user) : undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ? this.decryptUserPII(user) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const dataToInsert = { ...insertUser };
    if (dataToInsert.aadhar) {
      dataToInsert.aadhar = encryptPII(dataToInsert.aadhar);
    }
    const [user] = await db.insert(users).values(dataToInsert).returning();
    return this.decryptUserPII(user);
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
    const dataToUpdate = { ...data };
    if (dataToUpdate.aadhar !== undefined && dataToUpdate.aadhar !== null) {
      if (!isEncrypted(dataToUpdate.aadhar)) {
        dataToUpdate.aadhar = encryptPII(dataToUpdate.aadhar);
      }
    }
    const [user] = await db.update(users).set(dataToUpdate).where(eq(users.id, id)).returning();
    return this.decryptUserPII(user);
  }

  private decryptUserPII(user: User): User {
    if (user.aadhar && isEncrypted(user.aadhar)) {
      return { ...user, aadhar: decryptPII(user.aadhar) };
    }
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const userList = await db.select().from(users).orderBy(desc(users.createdAt));
    return userList.map(u => this.decryptUserPII(u));
  }

  async getUsersByRole(role: string): Promise<User[]> {
    const userList = await db.select().from(users).where(eq(users.role, role)).orderBy(desc(users.createdAt));
    return userList.map(u => this.decryptUserPII(u));
  }

  async blockUser(id: string, blocked: boolean): Promise<User> {
    const [user] = await db.update(users).set({ isBlocked: blocked }).where(eq(users.id, id)).returning();
    return this.decryptUserPII(user);
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const [user] = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return this.decryptUserPII(user);
  }

  async getUsersPendingAadharVerification(): Promise<User[]> {
    const userList = await db.select().from(users).where(
      and(
        sql`${users.aadharFrontUrl} IS NOT NULL`,
        sql`${users.aadharBackUrl} IS NOT NULL`,
        eq(users.aadharVerified, false)
      )
    ).orderBy(desc(users.createdAt));
    return userList.map(u => this.decryptUserPII(u));
  }

  async createOtp(data: InsertOtpVerification): Promise<OtpVerification> {
    const [otp] = await db.insert(otpVerifications).values(data).returning();
    return otp;
  }

  async verifyOtp(mobile: string, code: string): Promise<boolean> {
    const isDev = process.env.NODE_ENV !== 'production';
    const isDemo = process.env.OTP_PROVIDER === 'demo';
    
    if (isDev && isDemo && code === '123456') {
      const [pendingOtp] = await db
        .select()
        .from(otpVerifications)
        .where(
          and(
            eq(otpVerifications.mobile, mobile),
            eq(otpVerifications.verified, false),
            gt(otpVerifications.expiresAt, new Date())
          )
        );
      
      if (pendingOtp) {
        await db
          .update(otpVerifications)
          .set({ verified: true })
          .where(eq(otpVerifications.id, pendingOtp.id));
        console.log(`[OTP Dev] Accepted dev OTP 123456 for mobile ${mobile}`);
        return true;
      }
    }
    
    const [otp] = await db
      .select()
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.mobile, mobile),
          eq(otpVerifications.otpCode, code),
          eq(otpVerifications.verified, false),
          gt(otpVerifications.expiresAt, new Date())
        )
      );

    if (otp) {
      await db
        .update(otpVerifications)
        .set({ verified: true })
        .where(eq(otpVerifications.id, otp.id));
      return true;
    }
    return false;
  }

  async createMembership(data: InsertMembership): Promise<Membership> {
    const [membership] = await db.insert(memberships).values(data).returning();
    return membership;
  }

  async getMembershipByUserId(userId: string): Promise<Membership | undefined> {
    const [membership] = await db.select().from(memberships).where(eq(memberships.userId, userId));
    return membership;
  }

  async getMembershipById(id: string): Promise<Membership | undefined> {
    const [membership] = await db.select().from(memberships).where(eq(memberships.id, id));
    return membership;
  }

  async getMembershipByNumber(membershipNumber: string): Promise<Membership | undefined> {
    const [membership] = await db.select().from(memberships).where(eq(memberships.membershipNumber, membershipNumber));
    return membership;
  }

  async updateMembership(id: string, data: Partial<InsertMembership>): Promise<Membership> {
    const [membership] = await db.update(memberships).set(data).where(eq(memberships.id, id)).returning();
    return membership;
  }

  async getAllMemberships(): Promise<Membership[]> {
    return db.select().from(memberships).orderBy(desc(memberships.startDate));
  }

  async getMembershipsByAgent(agentId: string): Promise<Membership[]> {
    return db.select().from(memberships).where(eq(memberships.agentId, agentId)).orderBy(desc(memberships.startDate));
  }

  async createPayment(data: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(data).returning();
    return payment;
  }

  async getPaymentsByMembership(membershipId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.membershipId, membershipId)).orderBy(desc(payments.createdAt));
  }

  async updatePayment(id: string, data: Partial<InsertPayment>): Promise<Payment> {
    const [payment] = await db.update(payments).set(data).where(eq(payments.id, id)).returning();
    return payment;
  }

  async getPaymentByOrderId(razorpayOrderId: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.razorpayOrderId, razorpayOrderId));
    return payment;
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt));
  }

  async getPaymentById(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentsByStatus(status: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.status, status)).orderBy(desc(payments.createdAt));
  }

  async getMembershipByOrderId(razorpayOrderId: string): Promise<Membership | undefined> {
    const [membership] = await db.select().from(memberships).where(eq(memberships.razorpayOrderId, razorpayOrderId));
    return membership;
  }

  async createFamilyMember(data: InsertFamilyMember): Promise<FamilyMember> {
    const [member] = await db.insert(familyMembers).values(data).returning();
    return member;
  }

  async getFamilyMembers(membershipId: string): Promise<FamilyMember[]> {
    return db.select().from(familyMembers).where(eq(familyMembers.membershipId, membershipId));
  }

  async getAgentData(userId: string): Promise<AgentData | undefined> {
    const [agent] = await db.select().from(agentData).where(eq(agentData.userId, userId));
    return agent;
  }

  async createAgentData(data: InsertAgentData): Promise<AgentData> {
    const [agent] = await db.insert(agentData).values(data).returning();
    return agent;
  }

  async updateAgentData(userId: string, data: Partial<InsertAgentData>): Promise<AgentData> {
    const [agent] = await db.update(agentData).set(data).where(eq(agentData.userId, userId)).returning();
    return agent;
  }

  async getTopAgents(limit: number): Promise<Array<AgentData & { user: User }>> {
    const result = await db
      .select({
        agent: agentData,
        user: users
      })
      .from(agentData)
      .innerJoin(users, eq(agentData.userId, users.id))
      .orderBy(desc(agentData.totalRevenue))
      .limit(limit);
    
    return result.map(r => ({
      ...r.agent,
      user: r.user
    }));
  }

  async createOffer(data: InsertOffer): Promise<Offer> {
    const [offer] = await db.insert(offers).values(data).returning();
    return offer;
  }

  async getOffers(): Promise<Offer[]> {
    return db.select().from(offers).orderBy(desc(offers.createdAt));
  }

  async updateOffer(id: string, data: Partial<InsertOffer>): Promise<Offer> {
    const [offer] = await db.update(offers).set(data).where(eq(offers.id, id)).returning();
    return offer;
  }

  async createEmergencyRequest(data: InsertEmergencyRequest): Promise<EmergencyRequest> {
    const [request] = await db.insert(emergencyRequests).values(data).returning();
    return request;
  }

  async getEmergencyRequests(userId?: string): Promise<EmergencyRequest[]> {
    if (userId) {
      return db.select().from(emergencyRequests).where(eq(emergencyRequests.userId, userId)).orderBy(desc(emergencyRequests.createdAt));
    }
    return db.select().from(emergencyRequests).orderBy(desc(emergencyRequests.createdAt));
  }

  async getEmergencyRequestById(id: string): Promise<EmergencyRequest | undefined> {
    const [request] = await db.select().from(emergencyRequests).where(eq(emergencyRequests.id, id));
    return request;
  }

  async updateEmergencyRequest(id: string, data: Partial<InsertEmergencyRequest>): Promise<EmergencyRequest> {
    const [request] = await db.update(emergencyRequests).set(data).where(eq(emergencyRequests.id, id)).returning();
    return request;
  }

  async createHospital(data: InsertHospital): Promise<Hospital> {
    const [hospital] = await db.insert(hospitals).values(data).returning();
    return hospital;
  }

  async getHospitals(): Promise<Hospital[]> {
    return db.select().from(hospitals).orderBy(desc(hospitals.createdAt));
  }

  async updateHospital(id: string, data: Partial<InsertHospital>): Promise<Hospital> {
    const [hospital] = await db.update(hospitals).set(data).where(eq(hospitals.id, id)).returning();
    return hospital;
  }

  async deleteHospital(id: string): Promise<void> {
    await db.delete(hospitals).where(eq(hospitals.id, id));
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    console.log("[Storage] getUserByEmail called with:", email);
    try {
      const result = await db.select().from(users).where(eq(users.email, email));
      console.log("[Storage] Query result length:", result.length);
      const [user] = result;
      if (user) {
        console.log("[Storage] User found:", user.id, user.email, user.role);
      } else {
        console.log("[Storage] No user found for email:", email);
      }
      return user ? this.decryptUserPII(user) : undefined;
    } catch (error: any) {
      console.error("[Storage] getUserByEmail error:", error.message);
      throw error;
    }
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting;
  }

  async setSystemSetting(key: string, value: string, isEncrypted: boolean, updatedBy: string): Promise<SystemSetting> {
    const existing = await this.getSystemSetting(key);
    if (existing) {
      const [setting] = await db.update(systemSettings)
        .set({ value, isEncrypted, updatedBy, updatedAt: new Date() })
        .where(eq(systemSettings.key, key))
        .returning();
      return setting;
    }
    const [setting] = await db.insert(systemSettings)
      .values({ key, value, isEncrypted, updatedBy })
      .returning();
    return setting;
  }

  async getAllSystemSettings(): Promise<SystemSetting[]> {
    return db.select().from(systemSettings).orderBy(systemSettings.key);
  }

  async createPasswordResetToken(data: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [token] = await db.insert(passwordResetTokens).values(data).returning();
    return token;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db.select().from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, new Date())
      ));
    return resetToken && !resetToken.usedAt ? resetToken : undefined;
  }

  async usePasswordResetToken(token: string): Promise<void> {
    await db.update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.token, token));
  }

  async createAuditLog(data: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(data).returning();
    return log;
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }

  async getAdminPermissions(userId: string): Promise<AdminPermission | undefined> {
    const [permission] = await db.select().from(adminPermissions).where(eq(adminPermissions.userId, userId));
    return permission;
  }

  async setAdminPermissions(userId: string, permissions: Partial<InsertAdminPermission>, grantedBy: string): Promise<AdminPermission> {
    const existing = await this.getAdminPermissions(userId);
    if (existing) {
      const [updated] = await db.update(adminPermissions)
        .set({ ...permissions, grantedBy, updatedAt: new Date() })
        .where(eq(adminPermissions.userId, userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(adminPermissions)
      .values({ userId, ...permissions, grantedBy })
      .returning();
    return created;
  }

  async getAllAdminPermissions(): Promise<AdminPermission[]> {
    return db.select().from(adminPermissions).orderBy(desc(adminPermissions.updatedAt));
  }

  async deleteAdminPermissions(userId: string): Promise<void> {
    await db.delete(adminPermissions).where(eq(adminPermissions.userId, userId));
  }

  async getLoginAttempts(identifier: string, type: string): Promise<LoginAttempt | undefined> {
    const [attempt] = await db.select().from(loginAttempts)
      .where(and(
        eq(loginAttempts.identifier, identifier),
        eq(loginAttempts.identifierType, type)
      ));
    return attempt;
  }

  async recordFailedLogin(identifier: string, type: string): Promise<LoginAttempt> {
    return await withTransaction(async (tx) => {
      const [existing] = await tx.select().from(loginAttempts)
        .where(and(
          eq(loginAttempts.identifier, identifier),
          eq(loginAttempts.identifierType, type)
        ));
      const now = new Date();
      
      if (existing) {
        const newCount = existing.attemptCount + 1;
        const blockedUntil = newCount >= 3 ? new Date(now.getTime() + 30 * 60 * 1000) : null;
        
        const [updated] = await tx.update(loginAttempts)
          .set({ 
            attemptCount: newCount, 
            lastAttemptAt: now,
            blockedUntil 
          })
          .where(eq(loginAttempts.id, existing.id))
          .returning();
        return updated;
      }
      
      const [created] = await tx.insert(loginAttempts)
        .values({ 
          identifier, 
          identifierType: type, 
          attemptCount: 1,
          lastAttemptAt: now
        })
        .returning();
      return created;
    });
  }

  async resetLoginAttempts(identifier: string, type: string): Promise<void> {
    await db.delete(loginAttempts)
      .where(and(
        eq(loginAttempts.identifier, identifier),
        eq(loginAttempts.identifierType, type)
      ));
  }

  async isBlocked(identifier: string, type: string): Promise<boolean> {
    const attempt = await this.getLoginAttempts(identifier, type);
    if (!attempt || !attempt.blockedUntil) return false;
    return new Date() < attempt.blockedUntil;
  }

  async createAgentCommission(data: InsertAgentCommission): Promise<AgentCommission> {
    const [commission] = await db.insert(agentCommissions).values(data).returning();
    
    const agent = await this.getAgentData(data.agentId);
    if (agent) {
      await db.update(agentData)
        .set({ 
          pendingCommission: agent.pendingCommission + data.commissionAmount,
          totalCommission: agent.totalCommission + data.commissionAmount
        })
        .where(eq(agentData.userId, data.agentId));
    }
    
    return commission;
  }

  async getAgentCommissions(agentId: string): Promise<AgentCommission[]> {
    return db.select().from(agentCommissions)
      .where(eq(agentCommissions.agentId, agentId))
      .orderBy(desc(agentCommissions.createdAt));
  }

  async getPendingCommissions(agentId: string): Promise<AgentCommission[]> {
    return db.select().from(agentCommissions)
      .where(and(
        eq(agentCommissions.agentId, agentId),
        eq(agentCommissions.status, "pending")
      ))
      .orderBy(desc(agentCommissions.createdAt));
  }

  async updateCommissionStatus(ids: string[], status: string, payoutId?: string): Promise<void> {
    for (const id of ids) {
      await db.update(agentCommissions)
        .set({ status, payoutId: payoutId || null })
        .where(eq(agentCommissions.id, id));
    }
  }

  async createAgentPayout(data: InsertAgentPayout): Promise<AgentPayout> {
    const [payout] = await db.insert(agentPayouts).values(data).returning();
    return payout;
  }

  async completeAgentPayout(payoutId: string, transactionId: string, processedBy: string): Promise<AgentPayout> {
    return await withTransaction(async (tx) => {
      const [payout] = await tx.select().from(agentPayouts).where(eq(agentPayouts.id, payoutId));
      if (!payout) throw new Error("Payout not found");
      
      const [updated] = await tx.update(agentPayouts)
        .set({ 
          status: "completed",
          transactionId,
          processedBy,
          processedAt: new Date()
        })
        .where(eq(agentPayouts.id, payoutId))
        .returning();
      
      const [agent] = await tx.select().from(agentData).where(eq(agentData.userId, payout.agentId));
      if (agent) {
        await tx.update(agentData)
          .set({ pendingCommission: Math.max(0, agent.pendingCommission - payout.amount) })
          .where(eq(agentData.userId, payout.agentId));
      }
      
      await tx.update(agentCommissions)
        .set({ status: "paid" })
        .where(eq(agentCommissions.payoutId, payoutId));
      
      return updated;
    });
  }

  async getAgentPayouts(agentId: string): Promise<AgentPayout[]> {
    return db.select().from(agentPayouts)
      .where(eq(agentPayouts.agentId, agentId))
      .orderBy(desc(agentPayouts.createdAt));
  }

  async updateAgentPayout(id: string, data: Partial<InsertAgentPayout>): Promise<AgentPayout> {
    const [updated] = await db.update(agentPayouts)
      .set(data)
      .where(eq(agentPayouts.id, id))
      .returning();
    return updated;
  }

  async getPendingPayouts(): Promise<AgentPayout[]> {
    return db.select().from(agentPayouts)
      .where(eq(agentPayouts.status, "pending"))
      .orderBy(desc(agentPayouts.createdAt));
  }

  async revertPayoutCommissions(payoutId: string): Promise<void> {
    await db.update(agentCommissions)
      .set({ status: "pending", payoutId: null })
      .where(eq(agentCommissions.payoutId, payoutId));
  }

  async updateStaffStatus(userId: string, isOnline: boolean, activity?: string): Promise<StaffStatus> {
    const existing = await db.select().from(staffStatus).where(eq(staffStatus.userId, userId));
    
    if (existing.length > 0) {
      const [updated] = await db.update(staffStatus)
        .set({ 
          isOnline, 
          lastSeen: new Date(),
          lastActivity: activity || existing[0].lastActivity
        })
        .where(eq(staffStatus.userId, userId))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(staffStatus)
      .values({ userId, isOnline, lastActivity: activity })
      .returning();
    return created;
  }

  async getStaffStatus(userId: string): Promise<StaffStatus | undefined> {
    const [status] = await db.select().from(staffStatus).where(eq(staffStatus.userId, userId));
    return status;
  }

  async getAllStaffStatus(): Promise<StaffStatus[]> {
    return db.select().from(staffStatus);
  }

  async markOfflineStaff(timeoutMinutes: number = 5): Promise<void> {
    const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    await db.update(staffStatus)
      .set({ isOnline: false })
      .where(and(
        eq(staffStatus.isOnline, true),
        lt(staffStatus.lastSeen, cutoff)
      ));
  }

  async createDocument(data: InsertDocument): Promise<Document> {
    const [doc] = await db.insert(documents).values(data).returning();
    return doc;
  }

  async getDocumentById(id: string): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc;
  }

  async getDocumentsByUser(userId: string): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.submittedAt));
  }

  async getAllDocuments(): Promise<Document[]> {
    return db.select().from(documents).orderBy(desc(documents.submittedAt));
  }

  async updateDocument(id: string, data: Partial<InsertDocument>): Promise<Document> {
    const [updated] = await db.update(documents).set(data).where(eq(documents.id, id)).returning();
    return updated;
  }

  async getReportStats(): Promise<{
    totalRevenue: number;
    gstCollected: number;
    agentCommissions: number;
    netRevenue: number;
    totalMemberships: number;
    activeMemberships: number;
    pendingEmergencies: number;
    resolvedEmergencies: number;
    monthlyData: { month: string; revenue: number; memberships: number }[];
  }> {
    const [revenueResult] = await db.select({
      total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`
    }).from(payments).where(eq(payments.status, "succeeded"));
    
    // Ensure totalRevenue is always a valid number
    const rawTotal = revenueResult?.total || 0;
    const totalRevenue = typeof rawTotal === 'string' ? parseFloat(rawTotal) : Number(rawTotal);
    
    const [membershipResult] = await db.select({
      total: sql<number>`COUNT(*)::int`,
      active: sql<number>`COUNT(*) FILTER (WHERE ${memberships.status} = 'active')::int`
    }).from(memberships);

    const [emergencyResult] = await db.select({
      pending: sql<number>`COUNT(*) FILTER (WHERE status = 'pending')::int`,
      resolved: sql<number>`COUNT(*) FILTER (WHERE status = 'resolved')::int`
    }).from(emergencyRequests);

    const [commissionResult] = await db.select({
      total: sql<number>`COALESCE(SUM(${agentCommissions.commissionAmount}), 0)::int`
    }).from(agentCommissions).where(eq(agentCommissions.status, "paid"));
    
    const gstCollected = Math.round(totalRevenue * 0.18);
    const agentCommTotal = Number(commissionResult?.total || 0);
    const netRevenue = totalRevenue - gstCollected - agentCommTotal;

    const monthlyDataResult = await db.select({
      month: sql<string>`to_char(${payments.createdAt}, 'Mon')`,
      revenue: sql<number>`SUM(${payments.amount})::int`,
      memberships: sql<number>`COUNT(DISTINCT ${memberships.id})::int`,
      orderDate: sql<string>`to_char(${payments.createdAt}, 'YYYY-MM')`
    })
    .from(payments)
    .leftJoin(memberships, eq(payments.membershipId, memberships.id))
    .where(and(eq(payments.status, 'succeeded'), gte(payments.createdAt, sql`now() - interval '6 months'`)))
    .groupBy(sql`1, 4`)
    .orderBy(sql`4`);

    return {
      totalRevenue,
      gstCollected,
      agentCommissions: agentCommTotal,
      netRevenue,
      totalMemberships: membershipResult?.total || 0,
      activeMemberships: membershipResult?.active || 0,
      pendingEmergencies: emergencyResult?.pending || 0,
      resolvedEmergencies: emergencyResult?.resolved || 0,
      monthlyData: monthlyDataResult.map(r => ({
        month: r.month,
        revenue: r.revenue || 0,
        memberships: r.memberships || 0
      }))
    };
  }

  async getSuperAdminAnalytics(): Promise<{
    revenue: { total: number; thisMonth: number; lastMonth: number; growth: number };
    memberships: { total: number; active: number; expired: number; pending: number };
    agents: { total: number; active: number; topPerformers: { id: string; name: string; sales: number; commission: number }[] };
    claims: { total: number; pending: number; approved: number; rejected: number; totalAmount: number };
    monthlyTrends: { month: string; revenue: number; memberships: number; claims: number }[];
    planDistribution: { plan: string; count: number; revenue: number }[];
  }> {
    // Senior Dev optimization: Shift all logic to SQL aggregations
    const [revStats] = await db.select({
      total: sql<number>`COALESCE(SUM(${payments.amount}), 0)::int`
    }).from(payments).where(eq(payments.status, "succeeded"));

    const totalRevenue = revStats?.total || 0;

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMonthRes] = await db.select({ val: sql<number>`COALESCE(SUM(${payments.amount}), 0)::int` })
      .from(payments).where(and(eq(payments.status, "succeeded"), gte(payments.createdAt, thisMonthStart)));
    const [lastMonthRes] = await db.select({ val: sql<number>`COALESCE(SUM(${payments.amount}), 0)::int` })
      .from(payments).where(and(eq(payments.status, "succeeded"), gte(payments.createdAt, lastMonthStart), lte(payments.createdAt, lastMonthEnd)));
    
    const thisMonthRevenue = thisMonthRes?.val || 0;
    const lastMonthRevenue = lastMonthRes?.val || 0;
    const growth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;

    const [mStats] = await db.select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) FILTER (WHERE status = 'active')::int`,
      expired: sql<number>`count(*) FILTER (WHERE status = 'expired')::int`,
      pending: sql<number>`count(*) FILTER (WHERE status = 'pending')::int`
    }).from(memberships);

    const [agentStats] = await db.select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) FILTER (WHERE is_blocked = false)::int`
    }).from(users).where(eq(users.role, 'agent'));

    const agentPerformance = await db.select({
      id: users.id,
      name: sql<string>`COALESCE(${users.name}, ${users.email}, 'Agent')`,
      sales: sql<number>`count(DISTINCT ${memberships.id})::int`,
      commission: sql<number>`COALESCE(SUM(${agentCommissions.commissionAmount}), 0)::int`
    })
    .from(users)
    .leftJoin(memberships, eq(users.id, memberships.agentId))
    .leftJoin(agentCommissions, eq(users.id, agentCommissions.agentId))
    .where(eq(users.role, 'agent'))
    .groupBy(users.id)
    .orderBy(sql`sales DESC`)
    .limit(10);

    const [cStats] = await db.select({
      total: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) FILTER (WHERE status = 'pending')::int`,
      approved: sql<number>`count(*) FILTER (WHERE status = 'approved')::int`,
      rejected: sql<number>`count(*) FILTER (WHERE status = 'rejected')::int`,
      totalAmount: sql<number>`COALESCE(SUM(${emergencyRequests.amountRequested}), 0)::int`
    }).from(emergencyRequests);

    // Senior Dev Optimization: Single query for monthly trends using SQL aggregation
    const monthlyTrendsResult = await db.select({
      month: sql<string>`to_char(${payments.createdAt}, 'Mon')`,
      revenue: sql<number>`SUM(${payments.amount})::int`,
      memberships: sql<number>`COUNT(DISTINCT ${memberships.id})::int`,
      claims: sql<number>`COUNT(DISTINCT ${emergencyRequests.id})::int`,
      orderDate: sql<string>`to_char(${payments.createdAt}, 'YYYY-MM')`
    })
    .from(payments)
    .leftJoin(memberships, eq(payments.membershipId, memberships.id))
    .leftJoin(emergencyRequests, eq(payments.userId, emergencyRequests.userId))
    .where(and(eq(payments.status, 'succeeded'), gte(payments.createdAt, sql`now() - interval '6 months'`)))
    .groupBy(sql`1, 5`)
    .orderBy(sql`5`);

    const monthlyTrends = monthlyTrendsResult.map(r => ({
      month: r.month,
      revenue: r.revenue || 0,
      memberships: r.memberships || 0,
      claims: r.claims || 0
    }));

    // Optimized plan distribution query
    const planDistribution = await db.select({
      plan: memberships.planType,
      count: sql<number>`count(*)::int`,
      revenue: sql<number>`COALESCE(SUM(${memberships.planAmount}), 0)::int`
    })
    .from(memberships)
    .groupBy(memberships.planType);

    return {
      revenue: { total: totalRevenue, thisMonth: thisMonthRevenue, lastMonth: lastMonthRevenue, growth },
      memberships: { total: mStats.total, active: mStats.active, expired: mStats.expired, pending: mStats.pending },
      agents: { total: agentStats.total, active: agentStats.active, topPerformers: agentPerformance as any },
      claims: { total: cStats.total, pending: cStats.pending, approved: cStats.approved, rejected: cStats.rejected, totalAmount: cStats.totalAmount },
      monthlyTrends,
      planDistribution
    };
  }

  async getAgentAnalytics(agentId: string): Promise<{
    sales: { total: number; thisMonth: number; lastMonth: number };
    commissions: { total: number; pending: number; paid: number };
    conversions: { totalLeads: number; converted: number; rate: number };
    monthlyPerformance: { month: string; sales: number; commission: number }[];
    recentSales: { id: string; planType: string; amount: number; date: Date }[];
  }> {
    const agentMemberships = await this.getMembershipsByAgent(agentId);
    const agentCommList = await db.select().from(agentCommissions).where(eq(agentCommissions.agentId, agentId));
    
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const totalSales = agentMemberships.length;
    const thisMonthSales = agentMemberships.filter(m => m.startDate && new Date(m.startDate) >= thisMonthStart).length;
    const lastMonthSales = agentMemberships.filter(m => m.startDate && new Date(m.startDate) >= lastMonthStart && new Date(m.startDate) <= lastMonthEnd).length;

    const totalCommission = agentCommList.reduce((sum, c) => sum + c.commissionAmount, 0);
    const pendingCommission = agentCommList.filter(c => c.status === "pending").reduce((sum, c) => sum + c.commissionAmount, 0);
    const paidCommission = agentCommList.filter(c => c.status === "paid").reduce((sum, c) => sum + c.commissionAmount, 0);

    const monthlyPerformance: { month: string; sales: number; commission: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.toLocaleString('default', { month: 'short' });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      const monthSales = agentMemberships.filter(m => m.startDate && new Date(m.startDate) >= monthStart && new Date(m.startDate) <= monthEnd).length;
      const monthCommission = agentCommList
        .filter(c => c.createdAt && c.createdAt >= monthStart && c.createdAt <= monthEnd)
        .reduce((sum, c) => sum + c.commissionAmount, 0);

      monthlyPerformance.push({ month: monthKey, sales: monthSales, commission: monthCommission });
    }

    const recentSales = agentMemberships.slice(0, 10).map(m => ({
      id: m.id,
      planType: m.planType,
      amount: m.planAmount,
      date: m.startDate
    }));

    return {
      sales: { total: totalSales, thisMonth: thisMonthSales, lastMonth: lastMonthSales },
      commissions: { total: totalCommission, pending: pendingCommission, paid: paidCommission },
      conversions: { totalLeads: totalSales, converted: totalSales, rate: 100 },
      monthlyPerformance,
      recentSales
    };
  }

  async getAdminAnalytics(): Promise<{
    operations: { documentsReviewed: number; pendingDocuments: number; emergenciesHandled: number };
    staff: { totalStaff: number; onlineStaff: number; offlineStaff: number };
    memberships: { newThisWeek: number; pendingVerification: number };
    activityLog: { action: string; timestamp: Date }[];
  }> {
    const allDocs = await this.getAllDocuments();
    const allEmergencies = await db.select().from(emergencyRequests);
    const allStaffStatus = await this.getAllStaffStatus();
    const allMemberships = await this.getAllMemberships();
    const recentLogs = await this.getAuditLogs(20);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      operations: {
        documentsReviewed: allDocs.filter(d => d.status === "approved" || d.status === "rejected").length,
        pendingDocuments: allDocs.filter(d => d.status === "pending").length,
        emergenciesHandled: allEmergencies.filter(e => e.status !== "pending").length
      },
      staff: {
        totalStaff: allStaffStatus.length,
        onlineStaff: allStaffStatus.filter(s => s.isOnline).length,
        offlineStaff: allStaffStatus.filter(s => !s.isOnline).length
      },
      memberships: {
        newThisWeek: allMemberships.filter(m => m.startDate && new Date(m.startDate) >= weekAgo).length,
        pendingVerification: allMemberships.filter(m => m.status === "pending").length
      },
      activityLog: recentLogs.map(l => ({ action: l.action, timestamp: l.createdAt }))
    };
  }

  async getEmployeeAnalytics(employeeId: string): Promise<{
    tasks: { assigned: number; completed: number; pending: number };
    emergencies: { handled: number; avgResponseTime: string };
    documents: { reviewed: number; pending: number };
    weeklyActivity: { day: string; tasks: number }[];
  }> {
    const allEmergencies = await db.select().from(emergencyRequests);
    const allDocs = await this.getAllDocuments();

    const handledEmergencies = allEmergencies.filter(e => e.status !== "pending");
    const reviewedDocs = allDocs.filter(d => d.reviewedBy === employeeId);

    const now = new Date();
    const weeklyActivity: { day: string; tasks: number }[] = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      weeklyActivity.push({ day: days[d.getDay()], tasks: Math.floor(Math.random() * 10) });
    }

    return {
      tasks: { assigned: handledEmergencies.length + reviewedDocs.length, completed: handledEmergencies.length, pending: allDocs.filter(d => d.status === "pending").length },
      emergencies: { handled: handledEmergencies.length, avgResponseTime: "2.5 hrs" },
      documents: { reviewed: reviewedDocs.length, pending: allDocs.filter(d => d.status === "pending").length },
      weeklyActivity
    };
  }

  async getCommissionConfigs(): Promise<CommissionConfig[]> {
    return db.select().from(commissionConfig);
  }

  async getCommissionConfigByPlan(planType: string): Promise<CommissionConfig | undefined> {
    const [config] = await db.select().from(commissionConfig).where(eq(commissionConfig.planType, planType));
    return config;
  }

  async upsertCommissionConfig(planType: string, rate: number, bonusRate: number, updatedBy: string): Promise<CommissionConfig> {
    const existing = await this.getCommissionConfigByPlan(planType);
    if (existing) {
      const [updated] = await db.update(commissionConfig)
        .set({ commissionRate: rate, bonusRate, updatedBy, updatedAt: new Date() })
        .where(eq(commissionConfig.planType, planType))
        .returning();
      return updated;
    }
    const [created] = await db.insert(commissionConfig)
      .values({ planType, commissionRate: rate, bonusRate, updatedBy, isActive: true })
      .returning();
    return created;
  }

  async getPromotionalOffers(): Promise<PromotionalOffer[]> {
    return db.select().from(promotionalOffers).orderBy(desc(promotionalOffers.createdAt));
  }

  async getActivePromotionalOffers(): Promise<PromotionalOffer[]> {
    const now = new Date();
    return db.select().from(promotionalOffers)
      .where(and(
        eq(promotionalOffers.isActive, true),
        lt(promotionalOffers.validFrom, now),
        gt(promotionalOffers.validUntil, now)
      ));
  }

  async getPromotionalOfferByCode(code: string): Promise<PromotionalOffer | undefined> {
    const [offer] = await db.select().from(promotionalOffers).where(eq(promotionalOffers.code, code.toUpperCase()));
    return offer;
  }

  async createPromotionalOffer(data: InsertPromotionalOffer): Promise<PromotionalOffer> {
    const [offer] = await db.insert(promotionalOffers).values({ ...data, code: data.code.toUpperCase() }).returning();
    return offer;
  }

  async updatePromotionalOffer(id: string, data: Partial<InsertPromotionalOffer>): Promise<PromotionalOffer> {
    const [updated] = await db.update(promotionalOffers).set(data).where(eq(promotionalOffers.id, id)).returning();
    return updated;
  }

  async incrementOfferUsage(id: string): Promise<void> {
    await db.update(promotionalOffers)
      .set({ usedCount: sql`${promotionalOffers.usedCount} + 1` })
      .where(eq(promotionalOffers.id, id));
  }

  async getMarketingCampaigns(): Promise<MarketingCampaign[]> {
    return db.select().from(marketingCampaigns).orderBy(desc(marketingCampaigns.createdAt));
  }

  async createMarketingCampaign(data: InsertMarketingCampaign): Promise<MarketingCampaign> {
    const [campaign] = await db.insert(marketingCampaigns).values(data).returning();
    return campaign;
  }

  async updateMarketingCampaign(id: string, data: Partial<InsertMarketingCampaign>): Promise<MarketingCampaign> {
    const [updated] = await db.update(marketingCampaigns).set(data).where(eq(marketingCampaigns.id, id)).returning();
    return updated;
  }

  async getAiClaimAnalysis(emergencyRequestId: string): Promise<AiClaimAnalysis | undefined> {
    const [analysis] = await db.select().from(aiClaimAnalysis).where(eq(aiClaimAnalysis.emergencyRequestId, emergencyRequestId));
    return analysis;
  }

  async createAiClaimAnalysis(data: InsertAiClaimAnalysis): Promise<AiClaimAnalysis> {
    const [analysis] = await db.insert(aiClaimAnalysis).values(data).returning();
    return analysis;
  }

  async generateEmployeeId(role: string): Promise<string> {
    const prefix = role === "marketing" ? "MKT" : role === "accountant" ? "ACC" : role === "admin" ? "ADM" : role === "employee" ? "EMP" : "AGT";
    const count = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.role, role));
    const num = Number(count[0]?.count || 0) + 1;
    return `${prefix}${String(num).padStart(5, "0")}`;
  }

  async getEnterprisePlans(): Promise<EnterprisePlan[]> {
    return db.select().from(enterprisePlans).orderBy(enterprisePlans.category);
  }

  async getEnterprisePlansByCategory(category: string): Promise<EnterprisePlan[]> {
    return db.select().from(enterprisePlans).where(eq(enterprisePlans.category, category));
  }

  async getEnterprisePlan(id: string): Promise<EnterprisePlan | undefined> {
    const [plan] = await db.select().from(enterprisePlans).where(eq(enterprisePlans.id, id));
    return plan;
  }

  async createEnterprisePlan(data: InsertEnterprisePlan): Promise<EnterprisePlan> {
    const [plan] = await db.insert(enterprisePlans).values(data).returning();
    return plan;
  }

  async updateEnterprisePlan(id: string, data: Partial<InsertEnterprisePlan>): Promise<EnterprisePlan> {
    const [updated] = await db.update(enterprisePlans).set(data).where(eq(enterprisePlans.id, id)).returning();
    return updated;
  }

  // Add-On Benefits
  async getAddOnBenefits(): Promise<any[]> {
    return db.select().from(addOnBenefits).orderBy(addOnBenefits.name);
  }

  async getActiveAddOnBenefits(): Promise<any[]> {
    return db.select().from(addOnBenefits).where(eq(addOnBenefits.isActive, true)).orderBy(addOnBenefits.name);
  }

  async getAddOnBenefitById(id: string): Promise<any> {
    const [addOn] = await db.select().from(addOnBenefits).where(eq(addOnBenefits.id, id));
    return addOn;
  }

  async createAddOnBenefit(data: any): Promise<any> {
    const [addOn] = await db.insert(addOnBenefits).values(data).returning();
    return addOn;
  }

  async updateAddOnBenefit(id: string, data: any): Promise<any> {
    const [updated] = await db.update(addOnBenefits).set({ ...data, updatedAt: new Date() }).where(eq(addOnBenefits.id, id)).returning();
    return updated;
  }

  // Membership Add-Ons
  async getMembershipAddOns(membershipId: string): Promise<any[]> {
    return db.select().from(membershipAddOns).where(eq(membershipAddOns.membershipId, membershipId));
  }

  async createMembershipAddOn(data: { membershipId: string; addOnId: string; purchasePrice: number; usageLimit: number; expiresAt?: Date }): Promise<any> {
    const [addOn] = await db.insert(membershipAddOns).values(data).returning();
    return addOn;
  }

  async updateMembershipAddOnUsage(id: string, usageCount: number, isExhausted: boolean): Promise<any> {
    const [updated] = await db.update(membershipAddOns).set({ usageCount, isExhausted }).where(eq(membershipAddOns.id, id)).returning();
    return updated;
  }

  async getDiseaseExclusions(): Promise<DiseaseExclusion[]> {
    return db.select().from(diseaseExclusions).where(eq(diseaseExclusions.isActive, true)).orderBy(diseaseExclusions.category);
  }

  async createDiseaseExclusion(data: InsertDiseaseExclusion): Promise<DiseaseExclusion> {
    const [exclusion] = await db.insert(diseaseExclusions).values(data).returning();
    return exclusion;
  }

  async updateDiseaseExclusion(id: string, data: Partial<InsertDiseaseExclusion>): Promise<DiseaseExclusion> {
    const [updated] = await db.update(diseaseExclusions).set(data).where(eq(diseaseExclusions.id, id)).returning();
    return updated;
  }

  async getCoverageZones(): Promise<CoverageZone[]> {
    return db.select().from(coverageZones).where(eq(coverageZones.isActive, true)).orderBy(coverageZones.type);
  }

  async createCoverageZone(data: InsertCoverageZone): Promise<CoverageZone> {
    const [zone] = await db.insert(coverageZones).values(data).returning();
    return zone;
  }

  async updateCoverageZone(id: string, data: Partial<InsertCoverageZone>): Promise<CoverageZone> {
    const [updated] = await db.update(coverageZones).set(data).where(eq(coverageZones.id, id)).returning();
    return updated;
  }

  async getEmployers(): Promise<Employer[]> {
    return db.select().from(employers).orderBy(desc(employers.createdAt));
  }

  async getEmployerById(id: string): Promise<Employer | undefined> {
    const [employer] = await db.select().from(employers).where(eq(employers.id, id));
    return employer;
  }

  async createEmployer(data: InsertEmployer): Promise<Employer> {
    const [employer] = await db.insert(employers).values(data).returning();
    return employer;
  }

  async updateEmployer(id: string, data: Partial<InsertEmployer>): Promise<Employer> {
    const [updated] = await db.update(employers).set(data).where(eq(employers.id, id)).returning();
    return updated;
  }

  async getPlanExclusions(planId: string): Promise<PlanExclusion[]> {
    return db.select().from(planExclusions).where(eq(planExclusions.planId, planId));
  }

  async addPlanExclusion(planId: string, diseaseExclusionId: string, waitingPeriodMonths?: number, coPayPercent?: number, isFullyExcluded?: boolean): Promise<PlanExclusion> {
    const [exclusion] = await db.insert(planExclusions).values({
      planId,
      diseaseExclusionId,
      waitingPeriodMonths,
      coPayPercent,
      isFullyExcluded: isFullyExcluded || false
    }).returning();
    return exclusion;
  }

  async removePlanExclusion(id: string): Promise<void> {
    await db.delete(planExclusions).where(eq(planExclusions.id, id));
  }

  async getPlanZones(planId: string): Promise<PlanZone[]> {
    return db.select().from(planZones).where(eq(planZones.planId, planId));
  }

  async addPlanZone(planId: string, zoneId: string, isPrimary?: boolean): Promise<PlanZone> {
    const [zone] = await db.insert(planZones).values({
      planId,
      zoneId,
      isPrimary: isPrimary || false
    }).returning();
    return zone;
  }

  async removePlanZone(id: string): Promise<void> {
    await db.delete(planZones).where(eq(planZones.id, id));
  }

  async getPlanConditions(): Promise<PlanCondition[]> {
    return db.select().from(planConditions).orderBy(desc(planConditions.createdAt));
  }

  async getPlanConditionsByPlan(planId: string): Promise<PlanCondition[]> {
    return db.select().from(planConditions).where(eq(planConditions.planId, planId));
  }

  async getPlanConditionsByType(planType: string): Promise<PlanCondition[]> {
    return db.select().from(planConditions).where(eq(planConditions.planType, planType));
  }

  async createPlanCondition(data: InsertPlanCondition): Promise<PlanCondition> {
    const [condition] = await db.insert(planConditions).values(data).returning();
    return condition;
  }

  async updatePlanCondition(id: string, data: Partial<InsertPlanCondition>): Promise<PlanCondition> {
    const [updated] = await db.update(planConditions).set({ ...data, updatedAt: new Date() }).where(eq(planConditions.id, id)).returning();
    return updated;
  }

  async deletePlanCondition(id: string): Promise<void> {
    await db.delete(planConditions).where(eq(planConditions.id, id));
  }

  async getEmployerAuthByEmail(email: string): Promise<EmployerAuth | undefined> {
    const [auth] = await db.select().from(employerAuth).where(eq(employerAuth.email, email));
    return auth;
  }

  async getEmployerAuthById(id: string): Promise<EmployerAuth | undefined> {
    const [auth] = await db.select().from(employerAuth).where(eq(employerAuth.id, id));
    return auth;
  }

  async getEmployerAuthByEmployerId(employerId: string): Promise<EmployerAuth[]> {
    return db.select().from(employerAuth).where(eq(employerAuth.employerId, employerId));
  }

  async createEmployerAuth(data: InsertEmployerAuth): Promise<EmployerAuth> {
    const [auth] = await db.insert(employerAuth).values(data).returning();
    return auth;
  }

  async updateEmployerAuth(id: string, data: Partial<InsertEmployerAuth>): Promise<EmployerAuth> {
    const [updated] = await db.update(employerAuth).set({ ...data, updatedAt: new Date() }).where(eq(employerAuth.id, id)).returning();
    return updated;
  }

  async getEmployerPlans(employerId: string): Promise<EmployerPlan[]> {
    return db.select().from(employerPlans).where(eq(employerPlans.employerId, employerId)).orderBy(desc(employerPlans.createdAt));
  }

  async getAllEmployerPlans(): Promise<EmployerPlan[]> {
    return db.select().from(employerPlans).orderBy(desc(employerPlans.createdAt));
  }

  async createEmployerPlan(data: InsertEmployerPlan): Promise<EmployerPlan> {
    const [plan] = await db.insert(employerPlans).values(data).returning();
    return plan;
  }

  async updateEmployerPlan(id: string, data: Partial<InsertEmployerPlan>): Promise<EmployerPlan> {
    const [updated] = await db.update(employerPlans).set(data).where(eq(employerPlans.id, id)).returning();
    return updated;
  }

  async getEmployerSupportContacts(employerId: string): Promise<EmployerSupportContact[]> {
    return db.select().from(employerSupportContacts).where(eq(employerSupportContacts.employerId, employerId));
  }

  async createEmployerSupportContact(data: Omit<EmployerSupportContact, 'id' | 'createdAt'>): Promise<EmployerSupportContact> {
    const [contact] = await db.insert(employerSupportContacts).values(data as any).returning();
    return contact;
  }

  async generateCaseNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await db.select({ count: sql<number>`count(*)` }).from(sosCases);
    const num = (count[0]?.count || 0) + 1;
    return `SOS${dateStr}${String(num).padStart(4, '0')}`;
  }

  async createSosCase(data: InsertSosCase): Promise<SosCase> {
    const caseNumber = await this.generateCaseNumber();
    const [sosCase] = await db.insert(sosCases).values({ ...data, caseNumber }).returning();
    return sosCase;
  }

  async getSosCaseById(id: string): Promise<SosCase | undefined> {
    const [sosCase] = await db.select().from(sosCases).where(eq(sosCases.id, id));
    return sosCase;
  }

  async getSosCaseByNumber(caseNumber: string): Promise<SosCase | undefined> {
    const [sosCase] = await db.select().from(sosCases).where(eq(sosCases.caseNumber, caseNumber));
    return sosCase;
  }

  async getSosCasesByUser(userId: string): Promise<SosCase[]> {
    return db.select().from(sosCases).where(eq(sosCases.userId, userId)).orderBy(desc(sosCases.createdAt));
  }

  async getSosCasesByEmployer(employerId: string): Promise<SosCase[]> {
    return db.select().from(sosCases).where(eq(sosCases.employerId, employerId)).orderBy(desc(sosCases.createdAt));
  }

  async getAllSosCases(): Promise<any[]> {
    // Senior Dev Optimization: Using Joins to avoid N+1 query overhead
    const result = await db
      .select({
        sosCase: sosCases,
        user: users
      })
      .from(sosCases)
      .leftJoin(users, eq(sosCases.userId, users.id))
      .orderBy(desc(sosCases.createdAt));

    return result.map(r => ({
      ...r.sosCase,
      userName: r.user?.name || "Unknown",
      userMobile: r.user?.mobile || null,
      sanctionedAmount: r.sosCase.sanctionAmount,
    }));
  }

  async updateSosCase(id: string, data: Partial<SosCase>): Promise<SosCase> {
    const [updated] = await db.update(sosCases).set({ ...data, updatedAt: new Date() }).where(eq(sosCases.id, id)).returning();
    return updated;
  }

  async addSosCaseEvent(caseId: string, eventType: string, description: string, createdBy?: string, createdByName?: string): Promise<SosCaseEvent> {
    const [event] = await db.insert(sosCaseEvents).values({
      caseId, eventType, description, createdBy, createdByName
    } as any).returning();
    return event;
  }

  async getSosCaseEvents(caseId: string): Promise<SosCaseEvent[]> {
    return db.select().from(sosCaseEvents).where(eq(sosCaseEvents.caseId, caseId)).orderBy(desc(sosCaseEvents.createdAt));
  }

  async assignSosCase(caseId: string, userId: string, assignedBy: string, accessLevel: string = 'manage'): Promise<SosCaseAssignment> {
    const [assignment] = await db.insert(sosCaseAssignments).values({
      caseId, userId, assignedBy, accessLevel
    } as any).returning();
    return assignment;
  }

  async getSosCaseAssignments(caseId: string): Promise<SosCaseAssignment[]> {
    return db.select().from(sosCaseAssignments).where(eq(sosCaseAssignments.caseId, caseId));
  }

  async createSosNotification(data: Omit<SosNotification, 'id' | 'createdAt'>): Promise<SosNotification> {
    const [notification] = await db.insert(sosNotifications).values(data as any).returning();
    return notification;
  }

  async getUserSosAbuse(userId: string): Promise<UserSosAbuse | undefined> {
    const [abuse] = await db.select().from(userSosAbuse).where(eq(userSosAbuse.userId, userId));
    return abuse;
  }

  async incrementSosSpamCount(userId: string): Promise<UserSosAbuse> {
    const existing = await this.getUserSosAbuse(userId);
    if (existing) {
      const newCount = existing.spamCount + 1;
      const shouldBlock = newCount >= 3;
      const [updated] = await db.update(userSosAbuse).set({
        spamCount: newCount,
        isBlocked: shouldBlock,
        blockedAt: shouldBlock ? new Date() : null,
        blockedReason: shouldBlock ? 'Excessive spam SOS alerts' : null,
        updatedAt: new Date()
      }).where(eq(userSosAbuse.userId, userId)).returning();
      return updated;
    } else {
      const [created] = await db.insert(userSosAbuse).values({
        userId,
        spamCount: 1
      } as any).returning();
      return created;
    }
  }

  async unblockUserSos(userId: string, unblockedBy: string): Promise<UserSosAbuse> {
    const [updated] = await db.update(userSosAbuse).set({
      isBlocked: false,
      spamCount: 0,
      unblockedAt: new Date(),
      unblockedBy,
      updatedAt: new Date()
    }).where(eq(userSosAbuse.userId, userId)).returning();
    return updated;
  }

  async updateUserLastSos(userId: string): Promise<void> {
    const existing = await this.getUserSosAbuse(userId);
    if (existing) {
      await db.update(userSosAbuse).set({ lastSosAt: new Date(), updatedAt: new Date() }).where(eq(userSosAbuse.userId, userId));
    } else {
      await db.insert(userSosAbuse).values({ userId, lastSosAt: new Date() } as any);
    }
  }

  // Plans Management
  async getAllPlans(): Promise<Plan[]> {
    return db.select().from(plans).orderBy(plans.sortOrder);
  }

  async getActivePlans(): Promise<Plan[]> {
    return db.select().from(plans).where(eq(plans.isActive, true)).orderBy(plans.sortOrder);
  }

  async getPlanById(id: string): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan;
  }

  async getPlanByCode(code: string): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(sql`LOWER(${plans.planCode}) = LOWER(${code})`);
    return plan;
  }

  async createPlan(data: InsertPlan): Promise<Plan> {
    const [plan] = await db.insert(plans).values(data as any).returning();
    return plan;
  }

  async updatePlan(id: string, data: Partial<InsertPlan>): Promise<Plan> {
    const [plan] = await db.update(plans).set({ ...data, updatedAt: new Date() } as any).where(eq(plans.id, id)).returning();
    return plan;
  }

  async deletePlan(id: string): Promise<void> {
    await db.delete(plans).where(eq(plans.id, id));
  }

  // FAQ Management
  async getAllFaqs(): Promise<Faq[]> {
    return db.select().from(faqs).orderBy(faqs.sortOrder);
  }

  async getActiveFaqs(): Promise<Faq[]> {
    return db.select().from(faqs).where(eq(faqs.isActive, true)).orderBy(faqs.sortOrder);
  }

  async getFaqsByCategory(category: string): Promise<Faq[]> {
    return db.select().from(faqs).where(and(eq(faqs.category, category), eq(faqs.isActive, true))).orderBy(faqs.sortOrder);
  }

  async createFaq(data: InsertFaq): Promise<Faq> {
    const [faq] = await db.insert(faqs).values(data as any).returning();
    return faq;
  }

  async updateFaq(id: string, data: Partial<InsertFaq>): Promise<Faq> {
    const [faq] = await db.update(faqs).set({ ...data, updatedAt: new Date() } as any).where(eq(faqs.id, id)).returning();
    return faq;
  }

  async deleteFaq(id: string): Promise<void> {
    await db.delete(faqs).where(eq(faqs.id, id));
  }

  // Site Content Management
  async getSiteContent(section: string): Promise<SiteContent | undefined> {
    const [content] = await db.select().from(siteContent).where(eq(siteContent.section, section));
    return content;
  }

  async getAllSiteContent(): Promise<SiteContent[]> {
    return db.select().from(siteContent);
  }

  async upsertSiteContent(data: InsertSiteContent): Promise<SiteContent> {
    const existing = await this.getSiteContent(data.section);
    if (existing) {
      const [updated] = await db.update(siteContent).set({ ...data, updatedAt: new Date() } as any).where(eq(siteContent.section, data.section)).returning();
      return updated;
    }
    const [created] = await db.insert(siteContent).values(data as any).returning();
    return created;
  }

  // Mobile Token Management (for Android/iOS apps)
  async createMobileToken(token: string, userId: string, deviceInfo?: string): Promise<MobileToken> {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const [created] = await db.insert(mobileTokens).values({
      token,
      userId,
      deviceInfo,
      expiresAt
    }).returning();
    return created;
  }

  async getMobileTokenSession(token: string): Promise<{ userId: string; expiresAt: Date } | null> {
    const [record] = await db.select().from(mobileTokens).where(eq(mobileTokens.token, token));
    if (!record) return null;
    if (new Date() > record.expiresAt) {
      await this.deleteMobileToken(token);
      return null;
    }
    return { userId: record.userId, expiresAt: record.expiresAt };
  }

  async deleteMobileToken(token: string): Promise<void> {
    await db.delete(mobileTokens).where(eq(mobileTokens.token, token));
  }

  async deleteUserMobileTokens(userId: string): Promise<void> {
    await db.delete(mobileTokens).where(eq(mobileTokens.userId, userId));
  }

  // Profile Update Requests
  async createProfileUpdateRequest(data: InsertProfileUpdateRequest): Promise<ProfileUpdateRequest> {
    const [created] = await db.insert(profileUpdateRequests).values(data as any).returning();
    return created;
  }

  async getProfileUpdateRequests(status?: string): Promise<ProfileUpdateRequest[]> {
    if (status) {
      return db.select().from(profileUpdateRequests).where(eq(profileUpdateRequests.status, status)).orderBy(desc(profileUpdateRequests.createdAt));
    }
    return db.select().from(profileUpdateRequests).orderBy(desc(profileUpdateRequests.createdAt));
  }

  async getProfileUpdateRequestsByUser(userId: string): Promise<ProfileUpdateRequest[]> {
    return db.select().from(profileUpdateRequests).where(eq(profileUpdateRequests.userId, userId)).orderBy(desc(profileUpdateRequests.createdAt));
  }

  async updateProfileUpdateRequest(id: string, data: Partial<ProfileUpdateRequest>): Promise<ProfileUpdateRequest> {
    const [updated] = await db.update(profileUpdateRequests).set(data as any).where(eq(profileUpdateRequests.id, id)).returning();
    return updated;
  }

  // Integration Settings
  async getIntegrationSettings(): Promise<IntegrationSetting[]> {
    return db.select().from(integrationSettings).orderBy(integrationSettings.category);
  }

  async getIntegrationSettingByProvider(provider: string): Promise<IntegrationSetting | undefined> {
    const [setting] = await db.select().from(integrationSettings).where(eq(integrationSettings.provider, provider));
    return setting;
  }

  async upsertIntegrationSetting(data: InsertIntegrationSetting): Promise<IntegrationSetting> {
    const existing = await this.getIntegrationSettingByProvider(data.provider);
    if (existing) {
      const [updated] = await db.update(integrationSettings).set({ ...data, updatedAt: new Date() } as any).where(eq(integrationSettings.provider, data.provider)).returning();
      return updated;
    }
    const [created] = await db.insert(integrationSettings).values(data as any).returning();
    return created;
  }

  async deleteIntegrationSetting(provider: string): Promise<void> {
    await db.delete(integrationSettings).where(eq(integrationSettings.provider, provider));
  }

  // Super Admin Login Challenges
  async createSuperAdminLoginChallenge(data: InsertSuperAdminLoginChallenge): Promise<SuperAdminLoginChallenge> {
    const [challenge] = await db.insert(superAdminLoginChallenges).values(data as any).returning();
    return challenge;
  }

  async getSuperAdminLoginChallenge(id: string): Promise<SuperAdminLoginChallenge | undefined> {
    const [challenge] = await db.select().from(superAdminLoginChallenges).where(eq(superAdminLoginChallenges.id, id));
    return challenge;
  }

  async updateSuperAdminLoginChallenge(id: string, data: Partial<SuperAdminLoginChallenge>): Promise<SuperAdminLoginChallenge> {
    const [updated] = await db.update(superAdminLoginChallenges).set(data as any).where(eq(superAdminLoginChallenges.id, id)).returning();
    return updated;
  }

  // Companies (Corporate)
  async createCompany(data: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(data as any).returning();
    return company;
  }

  async getCompanies(): Promise<Company[]> {
    return db.select().from(companies).orderBy(desc(companies.createdAt));
  }

  async getCompanyById(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getCompanyByLoginEmail(email: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.loginEmail, email));
    return company;
  }

  async updateCompany(id: string, data: Partial<InsertCompany>): Promise<Company> {
    const [company] = await db.update(companies).set({ ...data, updatedAt: new Date() } as any).where(eq(companies.id, id)).returning();
    return company;
  }

  async deleteCompany(id: string): Promise<void> {
    await db.delete(companies).where(eq(companies.id, id));
  }

  // Corporate Employees
  async createCorporateEmployee(data: InsertCorporateEmployee): Promise<CorporateEmployee> {
    const [employee] = await db.insert(corporateEmployees).values(data as any).returning();
    return employee;
  }

  async getCorporateEmployeesByCompany(companyId: string): Promise<CorporateEmployee[]> {
    return db.select().from(corporateEmployees).where(eq(corporateEmployees.companyId, companyId)).orderBy(desc(corporateEmployees.createdAt));
  }

  async getCorporateEmployeeById(id: string): Promise<CorporateEmployee | undefined> {
    const [employee] = await db.select().from(corporateEmployees).where(eq(corporateEmployees.id, id));
    return employee;
  }

  async updateCorporateEmployee(id: string, data: Partial<InsertCorporateEmployee>): Promise<CorporateEmployee> {
    const [employee] = await db.update(corporateEmployees).set({ ...data, updatedAt: new Date() } as any).where(eq(corporateEmployees.id, id)).returning();
    return employee;
  }

  async deleteCorporateEmployee(id: string): Promise<void> {
    await db.delete(corporateEmployees).where(eq(corporateEmployees.id, id));
  }

  // Email Templates
  async createEmailTemplate(data: InsertEmailTemplate): Promise<EmailTemplate> {
    const [template] = await db.insert(emailTemplates).values(data as any).returning();
    return template;
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return db.select().from(emailTemplates).orderBy(emailTemplates.category);
  }

  async getEmailTemplateByName(name: string): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.name, name));
    return template;
  }

  async updateEmailTemplate(id: string, data: Partial<InsertEmailTemplate>): Promise<EmailTemplate> {
    const [template] = await db.update(emailTemplates).set({ ...data, updatedAt: new Date() } as any).where(eq(emailTemplates.id, id)).returning();
    return template;
  }

  async deleteEmailTemplate(id: string): Promise<void> {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
  }

  // Email Logs
  async createEmailLog(data: InsertEmailLog): Promise<EmailLog> {
    const [log] = await db.insert(emailLogs).values(data as any).returning();
    return log;
  }

  async getEmailLogs(limit: number = 100): Promise<EmailLog[]> {
    return db.select().from(emailLogs).orderBy(desc(emailLogs.createdAt)).limit(limit);
  }

  async updateEmailLog(id: string, data: Partial<InsertEmailLog>): Promise<EmailLog> {
    const [log] = await db.update(emailLogs).set(data as any).where(eq(emailLogs.id, id)).returning();
    return log;
  }

  // Hospital Payments
  async createHospitalPayment(data: InsertHospitalPayment): Promise<HospitalPayment> {
    const [payment] = await db.insert(hospitalPayments).values(data as any).returning();
    return payment;
  }

  async getHospitalPayments(hospitalId?: string): Promise<HospitalPayment[]> {
    if (hospitalId) {
      return db.select().from(hospitalPayments).where(eq(hospitalPayments.hospitalId, hospitalId)).orderBy(desc(hospitalPayments.createdAt));
    }
    return db.select().from(hospitalPayments).orderBy(desc(hospitalPayments.createdAt));
  }

  async updateHospitalPayment(id: string, data: Partial<InsertHospitalPayment>): Promise<HospitalPayment> {
    const [payment] = await db.update(hospitalPayments).set(data as any).where(eq(hospitalPayments.id, id)).returning();
    return payment;
  }

  // Push Subscriptions
  async createPushSubscription(data: InsertPushSubscription): Promise<PushSubscription> {
    const existing = await db.select().from(pushSubscriptions)
      .where(and(eq(pushSubscriptions.userId, data.userId), eq(pushSubscriptions.endpoint, data.endpoint)));
    if (existing.length > 0) {
      const [updated] = await db.update(pushSubscriptions)
        .set({ ...data, isActive: true, updatedAt: new Date() } as any)
        .where(eq(pushSubscriptions.id, existing[0].id))
        .returning();
      return updated;
    }
    const [sub] = await db.insert(pushSubscriptions).values(data as any).returning();
    return sub;
  }

  async getPushSubscriptionsByUser(userId: string): Promise<PushSubscription[]> {
    return db.select().from(pushSubscriptions)
      .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.isActive, true)));
  }

  async deletePushSubscription(userId: string, endpoint: string): Promise<void> {
    await db.update(pushSubscriptions)
      .set({ isActive: false } as any)
      .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)));
  }

  // Notifications
  async createNotification(data: InsertNotification): Promise<Notification> {
    const [notif] = await db.insert(notifications).values(data as any).returning();
    return notif;
  }

  async getNotificationsByUser(userId: string, limit: number = 50): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    const result = await db.select().from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.length;
  }

  async markNotificationRead(id: string): Promise<Notification> {
    const [notif] = await db.update(notifications)
      .set({ isRead: true, readAt: new Date() } as any)
      .where(eq(notifications.id, id))
      .returning();
    return notif;
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true, readAt: new Date() } as any)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  async updateNotificationPushStatus(id: string, sent: boolean): Promise<void> {
    await db.update(notifications).set({ isPushSent: sent } as any).where(eq(notifications.id, id));
  }

  // LiftMate Integration Methods
  async getLiftmateIntegration(companyId: string): Promise<LiftmateIntegration | undefined> {
    const [integration] = await db.select().from(liftmateIntegrations)
      .where(eq(liftmateIntegrations.companyId, companyId));
    return integration;
  }

  async createLiftmateIntegration(data: InsertLiftmateIntegration): Promise<LiftmateIntegration> {
    const [integration] = await db.insert(liftmateIntegrations).values(data as any).returning();
    return integration;
  }

  async updateLiftmateIntegration(id: string, data: Partial<InsertLiftmateIntegration>): Promise<LiftmateIntegration> {
    const [integration] = await db.update(liftmateIntegrations)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(liftmateIntegrations.id, id))
      .returning();
    return integration;
  }

  // LiftMate Pilots
  async createLiftmatePilot(data: InsertLiftmatePilot): Promise<LiftmatePilot> {
    const [pilot] = await db.insert(liftmatePilots).values(data as any).returning();
    return pilot;
  }

  async getLiftmatePilotByExternalId(liftmatePilotId: string): Promise<LiftmatePilot | undefined> {
    const [pilot] = await db.select().from(liftmatePilots)
      .where(eq(liftmatePilots.liftmatePilotId, liftmatePilotId));
    return pilot;
  }

  async getLiftmatePilotsByCompany(companyId: string): Promise<LiftmatePilot[]> {
    return db.select().from(liftmatePilots)
      .innerJoin(corporateEmployees, eq(liftmatePilots.corporateEmployeeId, corporateEmployees.id))
      .where(eq(corporateEmployees.companyId, companyId))
      .then(rows => rows.map(r => r.liftmate_pilots));
  }

  async updateLiftmatePilot(id: string, data: Partial<InsertLiftmatePilot>): Promise<LiftmatePilot> {
    const [pilot] = await db.update(liftmatePilots)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(liftmatePilots.id, id))
      .returning();
    return pilot;
  }

  // LiftMate Rides
  async createLiftmateRide(data: InsertLiftmateRide): Promise<LiftmateRide> {
    const [ride] = await db.insert(liftmateRides).values(data as any).returning();
    return ride;
  }

  async getLiftmateRideByExternalId(rideId: string): Promise<LiftmateRide | undefined> {
    const [ride] = await db.select().from(liftmateRides)
      .where(eq(liftmateRides.rideId, rideId));
    return ride;
  }

  async getLiftmateRidesByCompany(companyId: string): Promise<LiftmateRide[]> {
    return db.select().from(liftmateRides)
      .innerJoin(liftmatePilots, eq(liftmateRides.pilotId, liftmatePilots.id))
      .innerJoin(corporateEmployees, eq(liftmatePilots.corporateEmployeeId, corporateEmployees.id))
      .where(eq(corporateEmployees.companyId, companyId))
      .orderBy(desc(liftmateRides.createdAt))
      .then(rows => rows.map(r => r.liftmate_rides));
  }

  async updateLiftmateRide(id: string, data: Partial<InsertLiftmateRide>): Promise<LiftmateRide> {
    const [ride] = await db.update(liftmateRides)
      .set(data as any)
      .where(eq(liftmateRides.id, id))
      .returning();
    return ride;
  }

  // LiftMate Revenue Ledger
  async createLiftmateRevenueLedger(data: InsertLiftmateRevenueLedger): Promise<LiftmateRevenueLedger> {
    const [ledger] = await db.insert(liftmateRevenueLedger).values(data as any).returning();
    return ledger;
  }

  async getLiftmateRevenueLedgerByCompany(companyId: string): Promise<LiftmateRevenueLedger[]> {
    return db.select().from(liftmateRevenueLedger)
      .where(eq(liftmateRevenueLedger.companyId, companyId))
      .orderBy(desc(liftmateRevenueLedger.createdAt));
  }

  async getLiftmateRevenueLedgerByRide(rideId: string): Promise<LiftmateRevenueLedger | undefined> {
    const [ledger] = await db.select().from(liftmateRevenueLedger)
      .where(eq(liftmateRevenueLedger.rideId, rideId));
    return ledger;
  }

  async updateLiftmateRevenueLedgerByRide(rideId: string, data: Partial<InsertLiftmateRevenueLedger>): Promise<LiftmateRevenueLedger> {
    const [ledger] = await db.update(liftmateRevenueLedger)
      .set(data as any)
      .where(eq(liftmateRevenueLedger.rideId, rideId))
      .returning();
    return ledger;
  }

  // Coverage Exposure Logs
  async createCoverageExposureLog(data: InsertCoverageExposureLog): Promise<CoverageExposureLog> {
    const [log] = await db.insert(coverageExposureLogs).values(data as any).returning();
    return log;
  }

  async getActiveCoverageLogs(membershipId: string): Promise<CoverageExposureLog[]> {
    return db.select().from(coverageExposureLogs)
      .where(eq(coverageExposureLogs.membershipId, membershipId))
      .orderBy(desc(coverageExposureLogs.createdAt));
  }

  async updateCoverageExposureLog(rideId: string, data: Partial<InsertCoverageExposureLog>): Promise<CoverageExposureLog> {
    const [log] = await db.update(coverageExposureLogs)
      .set(data as any)
      .where(eq(coverageExposureLogs.rideId, rideId))
      .returning();
    return log;
  }

  async getCorporateEmployeeByMobile(companyId: string, mobile: string): Promise<CorporateEmployee | undefined> {
    const [employee] = await db.select().from(corporateEmployees)
      .where(and(eq(corporateEmployees.companyId, companyId), eq(corporateEmployees.mobile, mobile)));
    return employee;
  }

  // Job Applications
  async createJobApplication(data: InsertJobApplication): Promise<JobApplication> {
    const [application] = await db.insert(jobApplications).values(data as any).returning();
    return application;
  }

  async getJobApplications(): Promise<JobApplication[]> {
    return db.select().from(jobApplications).orderBy(desc(jobApplications.createdAt));
  }

  async getJobApplicationById(id: string): Promise<JobApplication | undefined> {
    const [application] = await db.select().from(jobApplications).where(eq(jobApplications.id, id));
    return application;
  }

  async updateJobApplication(id: string, data: Partial<InsertJobApplication>): Promise<JobApplication> {
    const [application] = await db.update(jobApplications)
      .set(data as any)
      .where(eq(jobApplications.id, id))
      .returning();
    return application;
  }

  async processPaymentTransaction(params: {
    orderId: string;
    paymentId: string;
    method: string;
  }): Promise<{ success: boolean; error?: string; alreadyProcessed?: boolean }> {
    try {
      return await withTransaction(async (tx) => {
        const [payment] = await tx.select().from(payments).where(eq(payments.razorpayOrderId, params.orderId));
        if (!payment) {
          throw new Error("Payment not found");
        }

        if (payment.status === "succeeded" && payment.razorpayPaymentId === params.paymentId) {
          return { success: true, alreadyProcessed: true };
        }

      const [membership] = await tx.select().from(memberships).where(eq(memberships.razorpayOrderId, params.orderId));
      const [plan] = membership ? await tx.select().from(plans).where(sql`LOWER(${plans.planCode}) = LOWER(${membership.planType})`) : [null];
      let validityDays = plan?.validityDays || 365;
      if (payment.metadata) {
        try {
          const parsed = JSON.parse(payment.metadata);
          const metadataValidityDays = parsed?.billing?.validityDays;
          if (typeof metadataValidityDays === "number" && metadataValidityDays > 0) {
            validityDays = metadataValidityDays;
          }
        } catch (parseError) {
          console.warn("[Transaction] Failed to parse payment metadata for validityDays:", parseError);
        }
      }

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + validityDays);

      await tx.update(payments)
        .set({
          status: "succeeded",
          paymentMethod: params.method,
          razorpayPaymentId: params.paymentId,
          processedAt: new Date()
        })
        .where(eq(payments.id, payment.id));

      if (membership) {
        const activationTime = new Date();
        const [updatedMembership] = await tx.update(memberships)
          .set({
            status: "active",
            paymentStatus: "completed",
            paymentMethod: params.method,
            transactionId: params.paymentId,
            startDate: activationTime,
            verifiedAt: activationTime,
            expiryDate
          })
          .where(eq(memberships.id, membership.id))
          .returning();

        if (updatedMembership.agentId) {
          const saleAmount = updatedMembership.planAmount || payment.amount;
          const commissionAmount = Math.round(saleAmount * 0.15);
          
          await tx.insert(agentCommissions).values({
            agentId: updatedMembership.agentId,
            membershipId: updatedMembership.id,
            paymentId: payment.id,
            saleAmount,
            commissionRate: 15,
            commissionAmount,
            status: "pending"
          });

          const [agentInfo] = await tx.select().from(agentData).where(eq(agentData.userId, updatedMembership.agentId));
          if (agentInfo) {
            await tx.update(agentData)
              .set({
                totalPolicies: agentInfo.totalPolicies + 1,
                totalRevenue: agentInfo.totalRevenue + saleAmount,
                totalCommission: agentInfo.totalCommission + commissionAmount,
                pendingCommission: agentInfo.pendingCommission + commissionAmount
              })
              .where(eq(agentData.userId, updatedMembership.agentId));
          }
        }
      }

      return { success: true };
      });
    } catch (error: any) {
      console.error('[Transaction] Payment processing failed:', error.message);
      return { success: false, error: error.message };
    }
  }
  async getAllVehicleSosCases() {
    return await db
      .select()
      .from(vehicleSosCases)
      .orderBy(desc(vehicleSosCases.createdAt));
  }

  async getVehicleSosCasesByUser(userId: string) {
    return await db
      .select()
      .from(vehicleSosCases)
      .where(eq(vehicleSosCases.userId, userId))
      .orderBy(desc(vehicleSosCases.createdAt));
  }

  async getVehicleSosCaseById(id: string) {
    const [result] = await db
      .select()
      .from(vehicleSosCases)
      .where(eq(vehicleSosCases.id, id));
    return result;
  }

  async createVehicleSosCase(data: any) {
    const caseNumber = `VSOS-${Date.now().toString(36).toUpperCase()}`;
    const [result] = await db
      .insert(vehicleSosCases)
      .values({ ...data, caseNumber })
      .returning();
    return result;
  }

  async updateVehicleSosCaseStatus(id: string, updates: any) {
    const [result] = await db
      .update(vehicleSosCases)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(vehicleSosCases.id, id))
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
