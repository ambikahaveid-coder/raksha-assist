import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, unique, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mobile: varchar("mobile", { length: 15 }).notNull().unique(),
  email: text("email").unique(),
  name: text("name"),
  aadhar: text("aadhar"),
  passwordHash: text("password_hash"),
  role: text("role").notNull().default("user"),
  employeeId: varchar("employee_id", { length: 20 }).unique(),
  department: text("department"),
  photoUrl: text("photo_url"),
  bloodGroup: text("blood_group"),
  dateOfBirth: text("date_of_birth"),
  isBlocked: boolean("is_blocked").notNull().default(false),
  emailVerified: boolean("email_verified").default(false),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  strikeCount: integer("strike_count").notNull().default(0),
  isSuspended: boolean("is_suspended").notNull().default(false),
  suspendedUntil: timestamp("suspended_until"),
  suspendedReason: text("suspended_reason"),
  fraudScore: integer("fraud_score").notNull().default(0),
  lastFraudCheck: timestamp("last_fraud_check"),
  aadharFrontUrl: text("aadhar_front_url"),
  aadharBackUrl: text("aadhar_back_url"),
  aadharVerified: boolean("aadhar_verified").default(false),
  zoneFranchiseId: varchar("zone_franchise_id"),
  stateFranchiseId: varchar("state_franchise_id"),
  districtFranchiseId: varchar("district_franchise_id"),
  cityFranchiseId: varchar("city_franchise_id"),
}, (table) => [index("idx_users_role").on(table.role), index("idx_users_created_at").on(table.createdAt)]);

export const TEAM_ROLES = ["user", "agent", "employee", "support", "marketing", "accountant", "admin", "super_admin", "showroom"] as const;
export type TeamRole = typeof TEAM_ROLES[number];

export const hospitals = pgTable("hospitals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: varchar("pincode", { length: 10 }),
  phone: varchar("phone", { length: 15 }),
  email: text("email"),
  contactPersonName: text("contact_person_name"),
  contactPersonPhone: varchar("contact_person_phone", { length: 15 }),
  contactPersonEmail: text("contact_person_email"),
  contactPersonDesignation: text("contact_person_designation"),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankIfsc: varchar("bank_ifsc", { length: 15 }),
  bankAccountHolder: text("bank_account_holder"),
  bankBranch: text("bank_branch"),
  panNumber: varchar("pan_number", { length: 12 }),
  gstNumber: varchar("gst_number", { length: 20 }),
  registrationNumber: text("registration_number"),
  settlementTerms: text("settlement_terms"),
  networkType: text("network_type").default("cashless"),
  specialties: text("specialties"),
  bedCount: integer("bed_count"),
  emergencyServices: boolean("emergency_services").default(true),
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHospitalSchema = createInsertSchema(hospitals).omit({
  id: true,
  createdAt: true,
});

export type InsertHospital = z.infer<typeof insertHospitalSchema>;
export type Hospital = typeof hospitals.$inferSelect;

// Companies (Corporate Accounts)
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  registeredName: text("registered_name"),
  industry: text("industry"),
  employeeCount: integer("employee_count").default(0),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: varchar("pincode", { length: 10 }),
  phone: varchar("phone", { length: 15 }),
  email: text("email"),
  website: text("website"),
  hrContactName: text("hr_contact_name"),
  hrContactEmail: text("hr_contact_email"),
  hrContactPhone: varchar("hr_contact_phone", { length: 15 }),
  billingContactName: text("billing_contact_name"),
  billingContactEmail: text("billing_contact_email"),
  billingContactPhone: varchar("billing_contact_phone", { length: 15 }),
  panNumber: varchar("pan_number", { length: 12 }),
  gstNumber: varchar("gst_number", { length: 20 }),
  cinNumber: varchar("cin_number", { length: 25 }),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankIfsc: varchar("bank_ifsc", { length: 15 }),
  bankAccountHolder: text("bank_account_holder"),
  loginEmail: text("login_email").unique(),
  loginPasswordHash: text("login_password_hash"),
  planId: varchar("plan_id"),
  contractStartDate: timestamp("contract_start_date"),
  contractEndDate: timestamp("contract_end_date"),
  billingCycle: text("billing_cycle").default("monthly"),
  paymentTerms: text("payment_terms"),
  agreementDocument: text("agreement_document"),
  status: text("status").notNull().default("pending"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

// Corporate Employees (employees under a company)
export const corporateEmployees = pgTable("corporate_employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  userId: varchar("user_id").references(() => users.id),
  employeeCode: varchar("employee_code", { length: 50 }),
  name: text("name").notNull(),
  email: text("email"),
  mobile: varchar("mobile", { length: 15 }),
  department: text("department"),
  designation: text("designation"),
  dateOfJoining: timestamp("date_of_joining"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  bloodGroup: text("blood_group"),
  emergencyContact: text("emergency_contact"),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 15 }),
  membershipId: varchar("membership_id").references(() => memberships.id),
  coverageStatus: text("coverage_status").notNull().default("pending"),
  enrolledAt: timestamp("enrolled_at"),
  expiresAt: timestamp("expires_at"),
  inviteToken: varchar("invite_token", { length: 100 }),
  inviteSentAt: timestamp("invite_sent_at"),
  inviteAcceptedAt: timestamp("invite_accepted_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [index("idx_corp_employees_company_id").on(table.companyId), index("idx_corp_employees_user_id").on(table.userId)]);

export const insertCorporateEmployeeSchema = createInsertSchema(corporateEmployees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCorporateEmployee = z.infer<typeof insertCorporateEmployeeSchema>;
export type CorporateEmployee = typeof corporateEmployees.$inferSelect;

// Vehicle Types for Motor Vehicle Support
export const VEHICLE_TYPES = ["bike", "car", "auto", "lorry", "truck", "bus", "tractor", "other"] as const;
export type VehicleType = typeof VEHICLE_TYPES[number];

// Showrooms (Motor Vehicle Dealerships)
export const showrooms = pgTable("showrooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  ownerName: text("owner_name"),
  vehicleTypes: text("vehicle_types").notNull(), // comma-separated: bike,car,lorry
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: varchar("pincode", { length: 10 }),
  phone: varchar("phone", { length: 15 }),
  email: text("email"),
  gstNumber: varchar("gst_number", { length: 20 }),
  panNumber: varchar("pan_number", { length: 12 }),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankIfsc: varchar("bank_ifsc", { length: 15 }),
  bankAccountHolder: text("bank_account_holder"),
  commissionRate: integer("commission_rate").notNull().default(10),
  totalSales: integer("total_sales").notNull().default(0),
  totalCommission: integer("total_commission").notNull().default(0),
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("idx_showrooms_user_id").on(table.userId), index("idx_showrooms_is_active").on(table.isActive)]);

export const insertShowroomSchema = createInsertSchema(showrooms).omit({
  id: true,
  createdAt: true,
});

export type InsertShowroom = z.infer<typeof insertShowroomSchema>;
export type Showroom = typeof showrooms.$inferSelect;

// Vehicle SOS Cases (Motor Vehicle Accident/Emergency Cases)
export const vehicleSosCases = pgTable("vehicle_sos_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseNumber: varchar("case_number", { length: 20 }).notNull().unique(),
  membershipId: varchar("membership_id").references(() => memberships.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  showroomId: varchar("showroom_id").references(() => showrooms.id),
  vehicleType: text("vehicle_type").notNull(), // bike, car, lorry, truck, bus, auto
  vehicleNumber: varchar("vehicle_number", { length: 20 }),
  vehicleMake: text("vehicle_make"), // Honda, Maruti, Tata, etc.
  vehicleModel: text("vehicle_model"),
  vehicleYear: varchar("vehicle_year", { length: 4 }),
  accidentDate: timestamp("accident_date").notNull(),
  accidentLocation: text("accident_location"),
  accidentDescription: text("accident_description"),
  hospitalName: text("hospital_name"),
  hospitalAddress: text("hospital_address"),
  estimatedAmount: integer("estimated_amount"),
  approvedAmount: integer("approved_amount"),
  settledAmount: integer("settled_amount"),
  status: text("status").notNull().default("pending"), // pending, under_verification, approved, rejected, settled
  rejectionReason: text("rejection_reason"),
  documents: text("documents"), // JSON array of document URLs
  firNumber: varchar("fir_number", { length: 50 }),
  firDocument: text("fir_document"),
  hospitalBill: text("hospital_bill"),
  vehicleDamagePhotos: text("vehicle_damage_photos"), // JSON array
  processedBy: varchar("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  settledBy: varchar("settled_by").references(() => users.id),
  settledAt: timestamp("settled_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [index("idx_vehicle_sos_user_id").on(table.userId), index("idx_vehicle_sos_status").on(table.status)]);

export const insertVehicleSosCaseSchema = createInsertSchema(vehicleSosCases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVehicleSosCase = z.infer<typeof insertVehicleSosCaseSchema>;
export type VehicleSosCase = typeof vehicleSosCases.$inferSelect;

// Email Templates
export const emailTemplates = pgTable("email_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  subject: text("subject").notNull(),
  bodyHtml: text("body_html").notNull(),
  bodyText: text("body_text"),
  category: text("category").notNull(),
  variables: text("variables"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;

// Email Logs
export const emailLogs = pgTable("email_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").references(() => emailTemplates.id),
  recipientEmail: text("recipient_email").notNull(),
  recipientName: text("recipient_name"),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("queued"),
  providerId: text("provider_id"),
  errorMessage: text("error_message"),
  metadata: text("metadata"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("idx_email_logs_status").on(table.status)]);

export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type EmailLog = typeof emailLogs.$inferSelect;

// Hospital Payments/Settlements (defined after emergencyRequests)
export const hospitalPayments = pgTable("hospital_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hospitalId: varchar("hospital_id").notNull().references(() => hospitals.id),
  emergencyRequestId: varchar("emergency_request_id"),
  amount: integer("amount").notNull(),
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  utrNumber: text("utr_number"),
  invoiceNumber: text("invoice_number"),
  invoiceDate: timestamp("invoice_date"),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  processedBy: varchar("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("idx_hospital_payments_hospital_id").on(table.hospitalId), index("idx_hospital_payments_status").on(table.status)]);

export const insertHospitalPaymentSchema = createInsertSchema(hospitalPayments).omit({
  id: true,
  createdAt: true,
});

export type InsertHospitalPayment = z.infer<typeof insertHospitalPaymentSchema>;
export type HospitalPayment = typeof hospitalPayments.$inferSelect;

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const memberships = pgTable("memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  membershipNumber: varchar("membership_number", { length: 20 }).notNull().unique(),
  planType: text("plan_type").notNull(),
  planAmount: integer("plan_amount").notNull().default(0),
  coverageAmount: integer("coverage_amount").notNull().default(300000),
  status: text("status").notNull().default("pending_payment"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  razorpayOrderId: text("razorpay_order_id"),
  agentId: varchar("agent_id").references(() => users.id),
  startDate: timestamp("start_date").defaultNow().notNull(),
  expiryDate: timestamp("expiry_date"),
  verifiedAt: timestamp("verified_at"),
  vehicleType: text("vehicle_type"),
  vehicleNumber: varchar("vehicle_number", { length: 20 }),
  vehicleMake: text("vehicle_make"),
  vehicleModel: text("vehicle_model"),
  vehicleYear: integer("vehicle_year"),
  vehiclePhotoUrl: text("vehicle_photo_url"),
  rcPhotoUrl: text("rc_photo_url"),
  propertyType: text("property_type"),
  propertyAddress: text("property_address"),
  businessName: text("business_name"),
  businessType: text("business_type"),
  businessAddress: text("business_address"),
  planCategory: text("plan_category"),
}, (table) => [index("idx_memberships_user_id").on(table.userId), index("idx_memberships_status").on(table.status), index("idx_memberships_agent_id").on(table.agentId), index("idx_memberships_expiry_date").on(table.expiryDate)]);

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  membershipId: varchar("membership_id").references(() => memberships.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  paymentMethod: text("payment_method"),
  razorpayOrderId: text("razorpay_order_id").unique(),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpaySignature: text("razorpay_signature"),
  transactionId: text("transaction_id"),
  status: text("status").notNull().default("created"),
  statusReason: text("status_reason"),
  planType: text("plan_type"),
  planAmount: integer("plan_amount"),
  metadata: text("metadata"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("idx_payments_user_id").on(table.userId), index("idx_payments_status").on(table.status), index("idx_payments_created_at").on(table.createdAt)]);

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export const insertMembershipSchema = createInsertSchema(memberships).omit({
  id: true,
  startDate: true,
});

export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type Membership = typeof memberships.$inferSelect;

export const familyMembers = pgTable("family_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  membershipId: varchar("membership_id").notNull().references(() => memberships.id),
  name: text("name").notNull(),
  relation: text("relation").notNull(),
  dob: text("dob"),
  gender: text("gender"),
  age: integer("age"),
}, (table) => [index("idx_family_members_membership_id").on(table.membershipId)]);

export const insertFamilyMemberSchema = createInsertSchema(familyMembers).omit({
  id: true,
});

export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type FamilyMember = typeof familyMembers.$inferSelect;

export const agentData = pgTable("agent_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  totalPolicies: integer("total_policies").notNull().default(0),
  totalRevenue: integer("total_revenue").notNull().default(0),
  totalCommission: integer("total_commission").notNull().default(0),
  pendingCommission: integer("pending_commission").notNull().default(0),
  rank: integer("rank"),
  payoutPreference: text("payout_preference").notNull().default("weekly"),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankIfsc: text("bank_ifsc"),
  bankAccountHolder: text("bank_account_holder"),
  upiId: text("upi_id"),
  kycStatus: text("kyc_status").notNull().default("pending"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("idx_agent_data_kyc_status").on(table.kycStatus), index("idx_agent_data_is_active").on(table.isActive)]);

export const insertAgentDataSchema = createInsertSchema(agentData).omit({
  id: true,
  createdAt: true,
});

export type InsertAgentData = z.infer<typeof insertAgentDataSchema>;
export type AgentData = typeof agentData.$inferSelect;

export const agentCommissions = pgTable("agent_commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull().references(() => users.id),
  membershipId: varchar("membership_id").notNull().references(() => memberships.id),
  paymentId: varchar("payment_id").references(() => payments.id),
  saleAmount: integer("sale_amount").notNull(),
  commissionRate: integer("commission_rate").notNull().default(15),
  commissionAmount: integer("commission_amount").notNull(),
  status: text("status").notNull().default("pending"),
  payoutId: varchar("payout_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("idx_agent_commissions_agent_id").on(table.agentId), index("idx_agent_commissions_status").on(table.status)]);

export const insertAgentCommissionSchema = createInsertSchema(agentCommissions).omit({
  id: true,
  createdAt: true,
});

export type InsertAgentCommission = z.infer<typeof insertAgentCommissionSchema>;
export type AgentCommission = typeof agentCommissions.$inferSelect;

export const agentPayouts = pgTable("agent_payouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  payoutMethod: text("payout_method").notNull(),
  bankDetails: text("bank_details"),
  upiId: text("upi_id"),
  transactionId: text("transaction_id"),
  status: text("status").notNull().default("pending"),
  processedBy: varchar("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("idx_agent_payouts_agent_id").on(table.agentId), index("idx_agent_payouts_status").on(table.status)]);

export const insertAgentPayoutSchema = createInsertSchema(agentPayouts).omit({
  id: true,
  createdAt: true,
});

export type InsertAgentPayout = z.infer<typeof insertAgentPayoutSchema>;
export type AgentPayout = typeof agentPayouts.$inferSelect;

export const PAYOUT_PREFERENCES = ["daily", "weekly", "monthly"] as const;
export type PayoutPreference = typeof PAYOUT_PREFERENCES[number];

export const COMMISSION_RATE = 15;

export const offers = pgTable("offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discount: text("discount").notNull(),
  validTill: text("valid_till").notNull(),
  targetAudience: text("target_audience").notNull(),
  status: text("status").notNull().default("active"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOfferSchema = createInsertSchema(offers).omit({
  id: true,
  createdAt: true,
});

export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offers.$inferSelect;

export const emergencyRequests = pgTable("emergency_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  hospitalName: text("hospital_name").notNull(),
  caseType: text("case_type").notNull(),
  amountRequested: integer("amount_requested"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("idx_emergency_requests_user_id").on(table.userId), index("idx_emergency_requests_status").on(table.status)]);

export const insertEmergencyRequestSchema = createInsertSchema(emergencyRequests).omit({
  id: true,
  createdAt: true,
});

export type InsertEmergencyRequest = z.infer<typeof insertEmergencyRequestSchema>;
export type EmergencyRequest = typeof emergencyRequests.$inferSelect;

export const otpVerifications = pgTable("otp_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mobile: varchar("mobile", { length: 15 }).notNull(),
  otpCode: varchar("otp_code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("idx_otp_verifications_mobile").on(table.mobile)]);

export const insertOtpVerificationSchema = createInsertSchema(otpVerifications).omit({
  id: true,
  createdAt: true,
});

export type InsertOtpVerification = z.infer<typeof insertOtpVerificationSchema>;
export type OtpVerification = typeof otpVerifications.$inferSelect;

export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  isEncrypted: boolean("is_encrypted").default(false),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: varchar("token", { length: 100 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(),
  details: text("details"),
  ipAddress: varchar("ip_address", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("idx_audit_logs_user_id").on(table.userId), index("idx_audit_logs_action").on(table.action), index("idx_audit_logs_created_at").on(table.createdAt)]);

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

export const loginAttempts = pgTable("login_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  identifier: varchar("identifier", { length: 100 }).notNull(),
  identifierType: varchar("identifier_type", { length: 20 }).notNull(),
  attemptCount: integer("attempt_count").notNull().default(0),
  lastAttemptAt: timestamp("last_attempt_at").defaultNow().notNull(),
  blockedUntil: timestamp("blocked_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("idx_login_attempts_identifier").on(table.identifier, table.identifierType)]);

export const insertLoginAttemptSchema = createInsertSchema(loginAttempts).omit({
  id: true,
  createdAt: true,
});

export type InsertLoginAttempt = z.infer<typeof insertLoginAttemptSchema>;
export type LoginAttempt = typeof loginAttempts.$inferSelect;

export const PLAN_TYPES = [
  "individual",
  "family", 
  "startup",
  "gig_worker",
  "corporate"
] as const;

export type PlanType = typeof PLAN_TYPES[number];

export const adminPermissions = pgTable("admin_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  viewPayments: boolean("view_payments").default(false),
  viewPaymentReports: boolean("view_payment_reports").default(false),
  viewMemberships: boolean("view_memberships").default(true),
  manageMemberships: boolean("manage_memberships").default(false),
  viewUsers: boolean("view_users").default(true),
  manageUsers: boolean("manage_users").default(false),
  viewEmergencyRequests: boolean("view_emergency_requests").default(true),
  manageEmergencyRequests: boolean("manage_emergency_requests").default(true),
  viewAgents: boolean("view_agents").default(true),
  manageAgents: boolean("manage_agents").default(false),
  viewHospitals: boolean("view_hospitals").default(true),
  manageHospitals: boolean("manage_hospitals").default(false),
  viewAuditLogs: boolean("view_audit_logs").default(false),
  viewSystemSettings: boolean("view_system_settings").default(false),
  allowedPlanTypes: text("allowed_plan_types").array(),
  manageStartupPlans: boolean("manage_startup_plans").default(false),
  manageGigWorkerPlans: boolean("manage_gig_worker_plans").default(false),
  manageCorporatePlans: boolean("manage_corporate_plans").default(false),
  grantedBy: varchar("granted_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAdminPermissionSchema = createInsertSchema(adminPermissions).omit({
  id: true,
  updatedAt: true,
});

export type InsertAdminPermission = z.infer<typeof insertAdminPermissionSchema>;
export type AdminPermission = typeof adminPermissions.$inferSelect;

export const staffStatus = pgTable("staff_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  isOnline: boolean("is_online").notNull().default(false),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
  lastActivity: text("last_activity"),
});

export type StaffStatus = typeof staffStatus.$inferSelect;

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  documentType: varchar("document_type", { length: 50 }).notNull(),
  documentName: text("document_name").notNull(),
  documentUrl: text("document_url"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  approvalLevel: integer("approval_level").default(0),
  maxApprovalLevel: integer("max_approval_level").default(2),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  submittedAt: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export const FINANCIAL_PERMISSIONS = [
  "viewPayments",
  "viewPaymentReports", 
  "manageMemberships"
] as const;

export const ALL_PERMISSIONS = [
  "viewPayments",
  "viewPaymentReports",
  "viewMemberships",
  "manageMemberships",
  "viewUsers",
  "manageUsers",
  "viewEmergencyRequests",
  "manageEmergencyRequests",
  "viewAgents",
  "manageAgents",
  "viewHospitals",
  "manageHospitals",
  "viewAuditLogs",
  "viewSystemSettings",
  "manageStartupPlans",
  "manageGigWorkerPlans",
  "manageCorporatePlans"
] as const;

export const commissionConfig = pgTable("commission_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planType: text("plan_type").notNull().unique(),
  commissionRate: integer("commission_rate").notNull().default(15),
  bonusRate: integer("bonus_rate").default(0),
  minimumSales: integer("minimum_sales").default(0),
  isActive: boolean("is_active").notNull().default(true),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCommissionConfigSchema = createInsertSchema(commissionConfig).omit({
  id: true,
  updatedAt: true,
});

export type InsertCommissionConfig = z.infer<typeof insertCommissionConfigSchema>;
export type CommissionConfig = typeof commissionConfig.$inferSelect;

export const promotionalOffers = pgTable("promotional_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  description: text("description"),
  discountType: text("discount_type").notNull().default("percentage"),
  discountValue: integer("discount_value").notNull(),
  minPurchaseAmount: integer("min_purchase_amount").default(0),
  maxDiscountAmount: integer("max_discount_amount"),
  applicablePlans: text("applicable_plans").array(),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").notNull().default(0),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPromotionalOfferSchema = createInsertSchema(promotionalOffers).omit({
  id: true,
  createdAt: true,
  usedCount: true,
});

export type InsertPromotionalOffer = z.infer<typeof insertPromotionalOfferSchema>;
export type PromotionalOffer = typeof promotionalOffers.$inferSelect;

export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  channel: text("channel").notNull(),
  message: text("message").notNull(),
  targetAudience: text("target_audience"),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  status: text("status").notNull().default("draft"),
  recipientCount: integer("recipient_count").default(0),
  deliveredCount: integer("delivered_count").default(0),
  openedCount: integer("opened_count").default(0),
  clickedCount: integer("clicked_count").default(0),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).omit({
  id: true,
  createdAt: true,
});

export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;

export const aiClaimAnalysis = pgTable("ai_claim_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  emergencyRequestId: varchar("emergency_request_id").notNull().references(() => emergencyRequests.id),
  riskScore: integer("risk_score").notNull(),
  fraudProbability: integer("fraud_probability").notNull(),
  analysisResult: text("analysis_result").notNull(),
  redFlags: text("red_flags").array(),
  recommendations: text("recommendations"),
  documentVerified: boolean("document_verified").default(false),
  locationVerified: boolean("location_verified").default(false),
  hospitalVerified: boolean("hospital_verified").default(false),
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
});

export const insertAiClaimAnalysisSchema = createInsertSchema(aiClaimAnalysis).omit({
  id: true,
  analyzedAt: true,
});

export type InsertAiClaimAnalysis = z.infer<typeof insertAiClaimAnalysisSchema>;
export type AiClaimAnalysis = typeof aiClaimAnalysis.$inferSelect;

// Old enterprise plan categories (kept for backward compatibility)
export const ENTERPRISE_PLAN_CATEGORIES = [
  "individual", "corporate", "gig_worker", "factory_worker", 
  "hospital_partnership", "maternity", "newborn"
] as const;
export type EnterprisePlanCategory = typeof ENTERPRISE_PLAN_CATEGORIES[number];

export const enterprisePlans = pgTable("enterprise_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  basePrice: integer("base_price").notNull(),
  coverageAmount: integer("coverage_amount").notNull(),
  maxMembers: integer("max_members").notNull().default(1),
  durationMonths: integer("duration_months").notNull().default(12),
  coPayPercent: integer("co_pay_percent").notNull().default(0),
  waitingPeriodDays: integer("waiting_period_days").notNull().default(0),
  minEnrollment: integer("min_enrollment").default(1),
  features: text("features").array(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEnterprisePlanSchema = createInsertSchema(enterprisePlans).omit({
  id: true,
  createdAt: true,
});

export type InsertEnterprisePlan = z.infer<typeof insertEnterprisePlanSchema>;
export type EnterprisePlan = typeof enterprisePlans.$inferSelect;

export const diseaseExclusions = pgTable("disease_exclusions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  icdCode: text("icd_code"),
  description: text("description"),
  waitingPeriodMonths: integer("waiting_period_months").notNull().default(12),
  isPreExisting: boolean("is_pre_existing").notNull().default(false),
  isLifestyle: boolean("is_lifestyle").notNull().default(false),
  isCritical: boolean("is_critical").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDiseaseExclusionSchema = createInsertSchema(diseaseExclusions).omit({
  id: true,
  createdAt: true,
});

export type InsertDiseaseExclusion = z.infer<typeof insertDiseaseExclusionSchema>;
export type DiseaseExclusion = typeof diseaseExclusions.$inferSelect;

export const planExclusions = pgTable("plan_exclusions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: varchar("plan_id").notNull().references(() => enterprisePlans.id),
  diseaseExclusionId: varchar("disease_exclusion_id").notNull().references(() => diseaseExclusions.id),
  waitingPeriodMonths: integer("waiting_period_months"),
  coPayPercent: integer("co_pay_percent"),
  isFullyExcluded: boolean("is_fully_excluded").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PlanExclusion = typeof planExclusions.$inferSelect;

export const coverageZones = pgTable("coverage_zones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  states: text("states").array(),
  cities: text("cities").array(),
  radiusKm: integer("radius_km"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCoverageZoneSchema = createInsertSchema(coverageZones).omit({
  id: true,
  createdAt: true,
});

export type InsertCoverageZone = z.infer<typeof insertCoverageZoneSchema>;
export type CoverageZone = typeof coverageZones.$inferSelect;

export const planZones = pgTable("plan_zones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: varchar("plan_id").notNull().references(() => enterprisePlans.id),
  zoneId: varchar("zone_id").notNull().references(() => coverageZones.id),
  isPrimary: boolean("is_primary").notNull().default(false),
});

export type PlanZone = typeof planZones.$inferSelect;

export const employers = pgTable("employers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  registrationNumber: text("registration_number"),
  gstNumber: text("gst_number"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: varchar("pincode", { length: 10 }),
  contactPerson: text("contact_person"),
  contactPhone: varchar("contact_phone", { length: 15 }),
  contactEmail: text("contact_email"),
  employeeCount: integer("employee_count").default(0),
  planId: varchar("plan_id").references(() => enterprisePlans.id),
  zoneId: varchar("zone_id").references(() => coverageZones.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmployerSchema = createInsertSchema(employers).omit({
  id: true,
  createdAt: true,
});

export type InsertEmployer = z.infer<typeof insertEmployerSchema>;
export type Employer = typeof employers.$inferSelect;

export const DISEASE_CATEGORIES = [
  "chronic_lifestyle", "critical_oncology", "autoimmune", 
  "prenatal_anomalies", "congenital", "occupational_hazard",
  "pre_existing", "cosmetic", "experimental"
] as const;
export type DiseaseCategory = typeof DISEASE_CATEGORIES[number];

export const planConditions = pgTable("plan_conditions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: varchar("plan_id").references(() => enterprisePlans.id),
  planType: text("plan_type"),
  conditionType: text("condition_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  value: text("value"),
  numericValue: integer("numeric_value"),
  isHidden: boolean("is_hidden").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPlanConditionSchema = createInsertSchema(planConditions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPlanCondition = z.infer<typeof insertPlanConditionSchema>;
export type PlanCondition = typeof planConditions.$inferSelect;

export const CONDITION_TYPES = [
  "age_limit", "pre_existing_waiting", "claim_limit", "renewal_terms",
  "cancellation_policy", "geographic_restriction", "occupation_exclusion",
  "hospitalization_minimum", "room_rent_cap", "co_payment", "deductible",
  "network_restriction", "document_requirement", "claim_timeline",
  "coverage_start_delay", "family_floater_terms", "portability_terms",
  "bonus_conditions", "penalty_conditions", "custom"
] as const;
export type ConditionType = typeof CONDITION_TYPES[number];

export const employerAuth = pgTable("employer_auth", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employerId: varchar("employer_id").notNull().references(() => employers.id),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("employer_admin"),
  name: text("name"),
  phone: varchar("phone", { length: 15 }),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lockedUntil: timestamp("locked_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEmployerAuthSchema = createInsertSchema(employerAuth).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
  failedLoginAttempts: true,
  lockedUntil: true,
});

export type InsertEmployerAuth = z.infer<typeof insertEmployerAuthSchema>;
export type EmployerAuth = typeof employerAuth.$inferSelect;

export const employerPlans = pgTable("employer_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employerId: varchar("employer_id").notNull().references(() => employers.id),
  planId: varchar("plan_id").references(() => enterprisePlans.id),
  planType: text("plan_type"),
  name: text("name").notNull(),
  description: text("description"),
  coverageAmount: integer("coverage_amount").notNull(),
  pricePerEmployee: integer("price_per_employee").notNull(),
  maxEmployees: integer("max_employees"),
  activatedEmployees: integer("activated_employees").default(0),
  effectiveFrom: timestamp("effective_from"),
  effectiveTo: timestamp("effective_to"),
  status: text("status").notNull().default("pending"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmployerPlanSchema = createInsertSchema(employerPlans).omit({
  id: true,
  createdAt: true,
  activatedEmployees: true,
  approvedBy: true,
  approvedAt: true,
});

export type InsertEmployerPlan = z.infer<typeof insertEmployerPlanSchema>;
export type EmployerPlan = typeof employerPlans.$inferSelect;

export const employerSupportContacts = pgTable("employer_support_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employerId: varchar("employer_id").notNull().references(() => employers.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: varchar("phone", { length: 15 }),
  whatsapp: varchar("whatsapp", { length: 15 }),
  role: text("role").default("support"),
  notifyOnSos: boolean("notify_on_sos").notNull().default(true),
  notifyOnHospitalization: boolean("notify_on_hospitalization").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type EmployerSupportContact = typeof employerSupportContacts.$inferSelect;

export const sosCases = pgTable("sos_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseNumber: text("case_number").notNull().unique(),
  userId: varchar("user_id").notNull().references(() => users.id),
  membershipId: varchar("membership_id").references(() => memberships.id),
  employerId: varchar("employer_id").references(() => employers.id),
  emergencyType: text("emergency_type").notNull(),
  description: text("description"),
  location: text("location"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  hospitalId: varchar("hospital_id").references(() => hospitals.id),
  hospitalName: text("hospital_name"),
  patientName: text("patient_name"),
  patientRelation: text("patient_relation"),
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull().default("normal"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  sanctionStatus: text("sanction_status").default("pending"),
  sanctionAmount: integer("sanction_amount"),
  sanctionedBy: varchar("sanctioned_by").references(() => users.id),
  sanctionedAt: timestamp("sanctioned_at"),
  sanctionNotes: text("sanction_notes"),
  isSpam: boolean("is_spam").notNull().default(false),
  spamMarkedBy: varchar("spam_marked_by").references(() => users.id),
  closedAt: timestamp("closed_at"),
  closedBy: varchar("closed_by").references(() => users.id),
  closureNotes: text("closure_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [index("idx_sos_cases_user_id").on(table.userId), index("idx_sos_cases_status").on(table.status), index("idx_sos_cases_created_at").on(table.createdAt)]);

export const insertSosCaseSchema = createInsertSchema(sosCases).omit({
  id: true,
  caseNumber: true,
  createdAt: true,
  updatedAt: true,
  assignedTo: true,
  sanctionStatus: true,
  sanctionAmount: true,
  sanctionedBy: true,
  sanctionedAt: true,
  sanctionNotes: true,
  isSpam: true,
  spamMarkedBy: true,
  closedAt: true,
  closedBy: true,
  closureNotes: true,
});

export type InsertSosCase = z.infer<typeof insertSosCaseSchema>;
export type SosCase = typeof sosCases.$inferSelect;

export const sosCaseEvents = pgTable("sos_case_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id").notNull().references(() => sosCases.id),
  eventType: text("event_type").notNull(),
  description: text("description"),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdByName: text("created_by_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SosCaseEvent = typeof sosCaseEvents.$inferSelect;

export const sosCaseAssignments = pgTable("sos_case_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id").notNull().references(() => sosCases.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  accessLevel: text("access_level").notNull().default("view"),
  assignedBy: varchar("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
});

export type SosCaseAssignment = typeof sosCaseAssignments.$inferSelect;

export const sosNotifications = pgTable("sos_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id").notNull().references(() => sosCases.id),
  recipientType: text("recipient_type").notNull(),
  recipientId: varchar("recipient_id"),
  recipientName: text("recipient_name"),
  recipientPhone: varchar("recipient_phone", { length: 15 }),
  recipientEmail: text("recipient_email"),
  channel: text("channel").notNull(),
  status: text("status").notNull().default("pending"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SosNotification = typeof sosNotifications.$inferSelect;

export const userSosAbuse = pgTable("user_sos_abuse", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  spamCount: integer("spam_count").notNull().default(0),
  isBlocked: boolean("is_blocked").notNull().default(false),
  blockedAt: timestamp("blocked_at"),
  blockedReason: text("blocked_reason"),
  unblockedAt: timestamp("unblocked_at"),
  unblockedBy: varchar("unblocked_by").references(() => users.id),
  lastSosAt: timestamp("last_sos_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserSosAbuse = typeof userSosAbuse.$inferSelect;

export const SOS_CASE_STATUS = [
  "pending", "acknowledged", "in_progress", "hospitalized", 
  "sanctioned", "completed", "closed", "spam"
] as const;
export type SosCaseStatus = typeof SOS_CASE_STATUS[number];

export const SANCTION_STATUS = [
  "pending", "under_review", "approved", "partially_approved", 
  "declined", "escalated"
] as const;
export type SanctionStatus = typeof SANCTION_STATUS[number];

export const EMERGENCY_TYPES = [
  "accident", "heart_attack", "stroke", "breathing_difficulty",
  "injury", "burn", "poisoning", "pregnancy", "other"
] as const;
export type EmergencyType = typeof EMERGENCY_TYPES[number];

export * from "./models/chat";

// Subscription Period and Membership Type Enums
export const SUBSCRIPTION_PERIODS = ["monthly", "6_months", "yearly"] as const;
export type SubscriptionPeriod = typeof SUBSCRIPTION_PERIODS[number];

export const MEMBERSHIP_TYPES = ["individual", "family"] as const;
export type MembershipType = typeof MEMBERSHIP_TYPES[number];

// Plan Categories - All types of assistance plans
export const PLAN_CATEGORIES = [
  "medical",           // Medical/Health Emergency Assist
  "two_wheeler",       // Bike/Scooter Vehicle Assist
  "car",               // Car/Four Wheeler Assist
  "commercial_vehicle", // Trucks/Buses/Commercial Assist
  "home",              // Residential Property Assist
  "commercial_property", // Commercial Building Assist
  "business",          // Business/Shop Assist
  "corporate",         // Corporate Employee Assist
  "travel",            // Travel Assist
  "personal_accident"  // Personal Accident Assist
] as const;
export type PlanCategory = typeof PLAN_CATEGORIES[number];

// Add-On Categories
export const ADD_ON_CATEGORIES = [
  "medical",
  "vehicle",
  "property",
  "business",
  "travel",
  "general"
] as const;
export type AddOnCategory = typeof ADD_ON_CATEGORIES[number];

// Dynamic Plan Management
export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planCode: varchar("plan_code", { length: 50 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  shortDescription: text("short_description"),
  planCategory: text("plan_category").notNull().default("individual"),
  membershipType: text("membership_type").notNull().default("individual"),
  subscriptionPeriod: text("subscription_period").notNull().default("yearly"),
  price: integer("price").notNull(),
  originalPrice: integer("original_price"),
  monthlyPrice: integer("monthly_price"),
  quarterlyPrice: integer("quarterly_price"),
  halfYearlyPrice: integer("half_yearly_price"),
  coverageAmount: integer("coverage_amount").notNull(),
  maxMembers: integer("max_members").notNull().default(1),
  validityDays: integer("validity_days").notNull().default(365),
  waitingPeriodDays: integer("waiting_period_days").notNull().default(30),
  coPay: integer("co_pay").default(0),
  annualUsageLimit: integer("annual_usage_limit").default(1),
  maxBenefitPerUsage: integer("max_benefit_per_usage"),
  fairUsageCooldownDays: integer("fair_usage_cooldown_days").default(30),
  preHospitalizationAmount: integer("pre_hospitalization_amount").default(0),
  preHospitalizationDays: integer("pre_hospitalization_days").default(0),
  postHospitalizationAmount: integer("post_hospitalization_amount").default(0),
  postHospitalizationDays: integer("post_hospitalization_days").default(0),
  ambulanceCoverAmount: integer("ambulance_cover_amount").default(0),
  dayCareAmount: integer("day_care_amount").default(0),
  renewalBonus: integer("renewal_bonus").default(0),
  nclbPercent: integer("nclb_percent").default(0),
  serviceChargePercent: integer("service_charge_percent").default(5),
  features: text("features"),
  highlights: text("highlights"),
  brochureUrl: text("brochure_url"),
  iconName: text("icon_name"),
  colorScheme: text("color_scheme"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").notNull().default(true),
  isPopular: boolean("is_popular").default(false),
  isFeatured: boolean("is_featured").default(false),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;

// Add-On Benefits
export const addOnBenefits = pgTable("add_on_benefits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  benefitCode: varchar("benefit_code", { length: 50 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull().default("general"),
  price: integer("price").notNull(),
  benefitAmount: integer("benefit_amount").notNull(),
  usageLimit: integer("usage_limit").notNull().default(1),
  validityDays: integer("validity_days").notNull().default(365),
  applicablePlans: text("applicable_plans"),
  applicableCategories: text("applicable_categories"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAddOnBenefitSchema = createInsertSchema(addOnBenefits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAddOnBenefit = z.infer<typeof insertAddOnBenefitSchema>;
export type AddOnBenefit = typeof addOnBenefits.$inferSelect;

// Purchased Add-Ons (one-time purchase per membership)
export const membershipAddOns = pgTable("membership_add_ons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  membershipId: varchar("membership_id").notNull().references(() => memberships.id),
  addOnId: varchar("add_on_id").notNull().references(() => addOnBenefits.id),
  purchasePrice: integer("purchase_price").notNull(),
  usageCount: integer("usage_count").notNull().default(0),
  usageLimit: integer("usage_limit").notNull(),
  isExhausted: boolean("is_exhausted").notNull().default(false),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
}, (table) => [
  unique("membership_addon_unique").on(table.membershipId, table.addOnId),
]);

export type MembershipAddOn = typeof membershipAddOns.$inferSelect;

// Benefit Usage Tracking (for fair-use enforcement)
export const benefitUsage = pgTable("benefit_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  membershipId: varchar("membership_id").notNull().references(() => memberships.id),
  benefitType: text("benefit_type").notNull(),
  usageType: text("usage_type").notNull().default("plan"),
  addOnId: varchar("add_on_id").references(() => addOnBenefits.id),
  emergencyRequestId: varchar("emergency_request_id"),
  amountUsed: integer("amount_used").notNull(),
  usageDate: timestamp("usage_date").defaultNow().notNull(),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
});

export type BenefitUsage = typeof benefitUsage.$inferSelect;

// Membership Usage Summary
export const membershipUsageSummary = pgTable("membership_usage_summary", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  membershipId: varchar("membership_id").notNull().references(() => memberships.id).unique(),
  totalUsageCount: integer("total_usage_count").notNull().default(0),
  totalAmountUsed: integer("total_amount_used").notNull().default(0),
  remainingBenefitAmount: integer("remaining_benefit_amount").notNull(),
  remainingUsageCount: integer("remaining_usage_count").notNull(),
  lastUsageDate: timestamp("last_usage_date"),
  nextEligibleDate: timestamp("next_eligible_date"),
  fairUseViolationCount: integer("fair_use_violation_count").notNull().default(0),
  isBlocked: boolean("is_blocked").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type MembershipUsageSummary = typeof membershipUsageSummary.$inferSelect;

// FAQ Management
export const faqs = pgTable("faqs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull().default("general"),
  planId: varchar("plan_id").references(() => plans.id),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFaqSchema = createInsertSchema(faqs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type Faq = typeof faqs.$inferSelect;

export const FAQ_CATEGORIES = [
  "general", "membership", "assistance", "payment", 
  "coverage", "emergency", "plans", "account"
] as const;
export type FaqCategory = typeof FAQ_CATEGORIES[number];

// Site Content Management
export const siteContent = pgTable("site_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  section: text("section").notNull().unique(),
  title: text("title"),
  subtitle: text("subtitle"),
  content: text("content"),
  metadata: text("metadata"),
  isActive: boolean("is_active").notNull().default(true),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSiteContentSchema = createInsertSchema(siteContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSiteContent = z.infer<typeof insertSiteContentSchema>;
export type SiteContent = typeof siteContent.$inferSelect;

// Brochure Templates
export const brochureTemplates = pgTable("brochure_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  templateHtml: text("template_html").notNull(),
  templateCss: text("template_css"),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BrochureTemplate = typeof brochureTemplates.$inferSelect;

// Mobile App Tokens (for Android/iOS apps)
export const mobileTokens = pgTable("mobile_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  token: varchar("token", { length: 255 }).notNull().unique(),
  userId: varchar("user_id").notNull().references(() => users.id),
  deviceInfo: text("device_info"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MobileToken = typeof mobileTokens.$inferSelect;
export type InsertMobileToken = typeof mobileTokens.$inferInsert;

// Profile Update Requests (requires admin approval)
export const profileUpdateRequests = pgTable("profile_update_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  fieldName: text("field_name").notNull(),
  currentValue: text("current_value"),
  requestedValue: text("requested_value").notNull(),
  reason: text("reason"),
  status: text("status").notNull().default("pending"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProfileUpdateRequestSchema = createInsertSchema(profileUpdateRequests).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
});

export type InsertProfileUpdateRequest = z.infer<typeof insertProfileUpdateRequestSchema>;
export type ProfileUpdateRequest = typeof profileUpdateRequests.$inferSelect;

// Integration Settings (SMS, WhatsApp, Payment Gateways)
export const integrationSettings = pgTable("integration_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: text("provider").notNull(),
  category: text("category").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  config: text("config"),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertIntegrationSettingSchema = createInsertSchema(integrationSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertIntegrationSetting = z.infer<typeof insertIntegrationSettingSchema>;
export type IntegrationSetting = typeof integrationSettings.$inferSelect;

// Super Admin Login Challenges (Two-Factor Authentication)
export const superAdminLoginChallenges = pgTable("super_admin_login_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  otpCode: varchar("otp_code", { length: 6 }).notNull(),
  status: text("status").notNull().default("pending"),
  attemptCount: integer("attempt_count").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(5),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SuperAdminLoginChallenge = typeof superAdminLoginChallenges.$inferSelect;
export type InsertSuperAdminLoginChallenge = typeof superAdminLoginChallenges.$inferInsert;

// Push Subscriptions for Web Push Notifications
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

// In-App Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  category: text("category"),
  link: text("link"),
  isRead: boolean("is_read").notNull().default(false),
  isPushSent: boolean("is_push_sent").notNull().default(false),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

export const NOTIFICATION_TYPES = ["info", "success", "warning", "error", "sos", "payment", "membership"] as const;
export type NotificationType = typeof NOTIFICATION_TYPES[number];

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// LiftMate Integration Configuration
export const liftmateIntegrations = pgTable("liftmate_integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  apiKey: text("api_key"),
  webhookSecret: text("webhook_secret"),
  revenueSharePercent: integer("revenue_share_percent").notNull().default(5),
  fixedFeePerRide: integer("fixed_fee_per_ride").notNull().default(500),
  settlementCycle: text("settlement_cycle").notNull().default("weekly"),
  defaultPlanType: text("default_plan_type").notNull().default("liftmate_pilot_shield"),
  familyCoverageLimit: integer("family_coverage_limit").notNull().default(3),
  accidentCoverageAmount: integer("accident_coverage_amount").notNull().default(300000),
  cashlessBufferAmount: integer("cashless_buffer_amount").notNull().default(50000),
  graceMinutesAfterRide: integer("grace_minutes_after_ride").notNull().default(30),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type LiftmateIntegration = typeof liftmateIntegrations.$inferSelect;
export type InsertLiftmateIntegration = typeof liftmateIntegrations.$inferInsert;

// LiftMate Pilots (linked to corporate employees)
export const liftmatePilots = pgTable("liftmate_pilots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  corporateEmployeeId: varchar("corporate_employee_id").notNull().references(() => corporateEmployees.id),
  liftmatePilotId: varchar("liftmate_pilot_id", { length: 100 }).notNull(),
  vehicleType: text("vehicle_type"),
  vehicleNumber: varchar("vehicle_number", { length: 20 }),
  licenseNumber: varchar("license_number", { length: 30 }),
  onboardingStatus: text("onboarding_status").notNull().default("pending"),
  membershipId: varchar("membership_id").references(() => memberships.id),
  isActive: boolean("is_active").notNull().default(true),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type LiftmatePilot = typeof liftmatePilots.$inferSelect;
export type InsertLiftmatePilot = typeof liftmatePilots.$inferInsert;

// LiftMate Rides (for coverage tracking)
export const liftmateRides = pgTable("liftmate_rides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rideId: varchar("ride_id", { length: 100 }).notNull().unique(),
  pilotId: varchar("pilot_id").notNull().references(() => liftmatePilots.id),
  membershipId: varchar("membership_id").references(() => memberships.id),
  status: text("status").notNull().default("started"),
  startedAt: timestamp("started_at").notNull(),
  endedAt: timestamp("ended_at"),
  fareAmount: integer("fare_amount"),
  rakshaShareAmount: integer("raksha_share_amount"),
  pickupLocation: text("pickup_location"),
  dropLocation: text("drop_location"),
  distanceKm: integer("distance_km"),
  coverageActivatedAt: timestamp("coverage_activated_at"),
  coverageDeactivatedAt: timestamp("coverage_deactivated_at"),
  idempotencyKey: varchar("idempotency_key", { length: 100 }),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const RIDE_STATUSES = ["started", "in_progress", "completed", "cancelled", "disputed"] as const;
export type RideStatus = typeof RIDE_STATUSES[number];

export type LiftmateRide = typeof liftmateRides.$inferSelect;
export type InsertLiftmateRide = typeof liftmateRides.$inferInsert;

// LiftMate Revenue Ledger (for settlements)
export const liftmateRevenueLedger = pgTable("liftmate_revenue_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  rideId: varchar("ride_id").references(() => liftmateRides.id),
  amountDue: integer("amount_due").notNull(),
  amountPaid: integer("amount_paid").default(0),
  gstAmount: integer("gst_amount").default(0),
  paymentRef: varchar("payment_ref", { length: 100 }),
  settlementStatus: text("settlement_status").notNull().default("pending"),
  settlementBatchId: varchar("settlement_batch_id", { length: 100 }),
  settledAt: timestamp("settled_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const SETTLEMENT_STATUSES = ["pending", "invoiced", "paid", "disputed", "written_off"] as const;
export type SettlementStatus = typeof SETTLEMENT_STATUSES[number];

export type LiftmateRevenueLedger = typeof liftmateRevenueLedger.$inferSelect;
export type InsertLiftmateRevenueLedger = typeof liftmateRevenueLedger.$inferInsert;

// Coverage Exposure Logs (tracks active coverage windows during rides)
export const coverageExposureLogs = pgTable("coverage_exposure_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  membershipId: varchar("membership_id").notNull().references(() => memberships.id),
  rideId: varchar("ride_id").references(() => liftmateRides.id),
  coverageWindowStart: timestamp("coverage_window_start").notNull(),
  coverageWindowEnd: timestamp("coverage_window_end"),
  coverageType: text("coverage_type").notNull().default("ride_time"),
  incidentReported: boolean("incident_reported").default(false),
  incidentId: varchar("incident_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CoverageExposureLog = typeof coverageExposureLogs.$inferSelect;
export type InsertCoverageExposureLog = typeof coverageExposureLogs.$inferInsert;

// Job Applications for Careers Page
export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  mobile: varchar("mobile", { length: 15 }).notNull(),
  position: text("position").notNull(),
  experience: text("experience"),
  currentLocation: text("current_location"),
  education: text("education"),
  resumeUrl: text("resume_url"),
  coverLetter: text("cover_letter"),
  status: text("status").notNull().default("pending"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
});

export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;

export const JOB_APPLICATION_STATUSES = ["pending", "reviewing", "shortlisted", "interviewed", "hired", "rejected"] as const;
export type JobApplicationStatus = typeof JOB_APPLICATION_STATUSES[number];

// Security Incidents (Fraud Detection & Abuse Prevention)
export const securityIncidents = pgTable("security_incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  incidentType: text("incident_type").notNull(),
  severity: text("severity").notNull().default("low"),
  description: text("description").notNull(),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  metadata: text("metadata"),
  actionTaken: text("action_taken"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  isResolved: boolean("is_resolved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const INCIDENT_TYPES = [
  "false_sos_alert",
  "suspicious_claim",
  "duplicate_claim", 
  "document_fraud",
  "identity_fraud",
  "multiple_login_attempts",
  "unauthorized_access",
  "payment_fraud",
  "collusion_suspected",
  "policy_violation"
] as const;
export type IncidentType = typeof INCIDENT_TYPES[number];

export const INCIDENT_SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type IncidentSeverity = typeof INCIDENT_SEVERITIES[number];

export type SecurityIncident = typeof securityIncidents.$inferSelect;
export type InsertSecurityIncident = typeof securityIncidents.$inferInsert;

// Fraud Blacklist (Permanent bans)
export const fraudBlacklist = pgTable("fraud_blacklist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mobile: varchar("mobile", { length: 15 }),
  email: text("email"),
  aadhar: text("aadhar"),
  panNumber: varchar("pan_number", { length: 12 }),
  reason: text("reason").notNull(),
  originalUserId: varchar("original_user_id"),
  blacklistedBy: varchar("blacklisted_by").references(() => users.id),
  evidence: text("evidence"),
  legalActionTaken: boolean("legal_action_taken").default(false),
  firNumber: varchar("fir_number", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type FraudBlacklist = typeof fraudBlacklist.$inferSelect;
export type InsertFraudBlacklist = typeof fraudBlacklist.$inferInsert;

// Zone Franchises
export const zoneFranchises = pgTable("zone_franchises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  zoneCode: varchar("zone_code", { length: 20 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  states: text("states").array(),
  headOfficeAddress: text("head_office_address"),
  headOfficeCity: text("head_office_city"),
  headOfficeState: text("head_office_state"),
  headOfficePincode: varchar("head_office_pincode", { length: 10 }),
  ownerId: varchar("owner_id").references(() => users.id),
  ownerName: text("owner_name"),
  ownerMobile: varchar("owner_mobile", { length: 15 }),
  ownerEmail: text("owner_email"),
  panNumber: varchar("pan_number", { length: 12 }),
  gstNumber: varchar("gst_number", { length: 20 }),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankIfsc: varchar("bank_ifsc", { length: 15 }),
  bankAccountHolder: text("bank_account_holder"),
  commissionRate: integer("commission_rate").notNull().default(3),
  fixedMonthlyFee: integer("fixed_monthly_fee").default(0),
  targetRevenue: integer("target_revenue").default(0),
  achievedRevenue: integer("achieved_revenue").default(0),
  totalAgents: integer("total_agents").default(0),
  totalMembers: integer("total_members").default(0),
  status: text("status").notNull().default("pending_approval"),
  agreementDocument: text("agreement_document"),
  agreementSignedAt: timestamp("agreement_signed_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ZoneFranchise = typeof zoneFranchises.$inferSelect;
export type InsertZoneFranchise = typeof zoneFranchises.$inferInsert;

// State Franchises
export const stateFranchises = pgTable("state_franchises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stateCode: varchar("state_code", { length: 20 }).notNull().unique(),
  name: text("name").notNull(),
  stateName: text("state_name"),
  zoneId: varchar("zone_id").references(() => zoneFranchises.id),
  description: text("description"),
  districts: text("districts").array(),
  headOfficeAddress: text("head_office_address"),
  headOfficeCity: text("head_office_city"),
  headOfficePincode: varchar("head_office_pincode", { length: 10 }),
  ownerId: varchar("owner_id").references(() => users.id),
  ownerName: text("owner_name"),
  ownerMobile: varchar("owner_mobile", { length: 15 }),
  ownerEmail: text("owner_email"),
  panNumber: varchar("pan_number", { length: 12 }),
  gstNumber: varchar("gst_number", { length: 20 }),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankIfsc: varchar("bank_ifsc", { length: 15 }),
  bankAccountHolder: text("bank_account_holder"),
  commissionRate: integer("commission_rate").notNull().default(4),
  fixedMonthlyFee: integer("fixed_monthly_fee").default(0),
  targetRevenue: integer("target_revenue").default(0),
  achievedRevenue: integer("achieved_revenue").default(0),
  totalAgents: integer("total_agents").default(0),
  totalMembers: integer("total_members").default(0),
  status: text("status").notNull().default("pending_approval"),
  agreementDocument: text("agreement_document"),
  agreementSignedAt: timestamp("agreement_signed_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type StateFranchise = typeof stateFranchises.$inferSelect;
export type InsertStateFranchise = typeof stateFranchises.$inferInsert;

// District Franchises
export const districtFranchises = pgTable("district_franchises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  districtCode: varchar("district_code", { length: 20 }).notNull().unique(),
  name: text("name").notNull(),
  districtName: text("district_name"),
  stateId: varchar("state_id").references(() => stateFranchises.id),
  description: text("description"),
  cities: text("cities").array(),
  headOfficeAddress: text("head_office_address"),
  headOfficeCity: text("head_office_city"),
  headOfficePincode: varchar("head_office_pincode", { length: 10 }),
  ownerId: varchar("owner_id").references(() => users.id),
  ownerName: text("owner_name"),
  ownerMobile: varchar("owner_mobile", { length: 15 }),
  ownerEmail: text("owner_email"),
  panNumber: varchar("pan_number", { length: 12 }),
  gstNumber: varchar("gst_number", { length: 20 }),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankIfsc: varchar("bank_ifsc", { length: 15 }),
  bankAccountHolder: text("bank_account_holder"),
  commissionRate: integer("commission_rate").notNull().default(5),
  fixedMonthlyFee: integer("fixed_monthly_fee").default(0),
  targetRevenue: integer("target_revenue").default(0),
  achievedRevenue: integer("achieved_revenue").default(0),
  totalAgents: integer("total_agents").default(0),
  totalMembers: integer("total_members").default(0),
  status: text("status").notNull().default("pending_approval"),
  agreementDocument: text("agreement_document"),
  agreementSignedAt: timestamp("agreement_signed_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type DistrictFranchise = typeof districtFranchises.$inferSelect;
export type InsertDistrictFranchise = typeof districtFranchises.$inferInsert;

// City Franchises
export const cityFranchises = pgTable("city_franchises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cityCode: varchar("city_code", { length: 20 }).notNull().unique(),
  name: text("name").notNull(),
  cityName: text("city_name"),
  districtId: varchar("district_id").references(() => districtFranchises.id),
  description: text("description"),
  pincodes: text("pincodes").array(),
  headOfficeAddress: text("head_office_address"),
  headOfficePincode: varchar("head_office_pincode", { length: 10 }),
  ownerId: varchar("owner_id").references(() => users.id),
  ownerName: text("owner_name"),
  ownerMobile: varchar("owner_mobile", { length: 15 }),
  ownerEmail: text("owner_email"),
  panNumber: varchar("pan_number", { length: 12 }),
  gstNumber: varchar("gst_number", { length: 20 }),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankIfsc: varchar("bank_ifsc", { length: 15 }),
  bankAccountHolder: text("bank_account_holder"),
  commissionRate: integer("commission_rate").notNull().default(6),
  fixedMonthlyFee: integer("fixed_monthly_fee").default(0),
  targetRevenue: integer("target_revenue").default(0),
  achievedRevenue: integer("achieved_revenue").default(0),
  totalAgents: integer("total_agents").default(0),
  totalMembers: integer("total_members").default(0),
  status: text("status").notNull().default("pending_approval"),
  agreementDocument: text("agreement_document"),
  agreementSignedAt: timestamp("agreement_signed_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CityFranchise = typeof cityFranchises.$inferSelect;
export type InsertCityFranchise = typeof cityFranchises.$inferInsert;

// Agent Franchise Assignments
export const agentFranchiseAssignments = pgTable("agent_franchise_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull().references(() => users.id),
  franchiseType: text("franchise_type").notNull(),
  franchiseId: varchar("franchise_id").notNull(),
  assignedBy: varchar("assigned_by").references(() => users.id),
  status: text("status").notNull().default("active"),
  isActive: boolean("is_active").notNull().default(true),
  cityFranchiseId: varchar("city_franchise_id").references(() => cityFranchises.id),
  districtFranchiseId: varchar("district_franchise_id").references(() => districtFranchises.id),
  commissionRate: integer("commission_rate").default(15),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AgentFranchiseAssignment = typeof agentFranchiseAssignments.$inferSelect;
export type InsertAgentFranchiseAssignment = typeof agentFranchiseAssignments.$inferInsert;

// Franchise Commissions
export const franchiseCommissions = pgTable("franchise_commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  franchiseType: text("franchise_type").notNull(),
  franchiseId: varchar("franchise_id").notNull(),
  membershipId: varchar("membership_id").references(() => memberships.id),
  paymentId: varchar("payment_id").references(() => payments.id),
  amount: integer("amount").notNull(),
  rate: integer("rate").notNull(),
  status: text("status").notNull().default("pending"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type FranchiseCommission = typeof franchiseCommissions.$inferSelect;
export type InsertFranchiseCommission = typeof franchiseCommissions.$inferInsert;

// Franchise Payouts
export const franchisePayouts = pgTable("franchise_payouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  franchiseType: text("franchise_type").notNull(),
  franchiseId: varchar("franchise_id").notNull(),
  amount: integer("amount").notNull(),
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  status: text("status").notNull().default("pending"),
  processedBy: varchar("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  notes: text("notes"),
  utrNumber: text("utr_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type FranchisePayout = typeof franchisePayouts.$inferSelect;
export type InsertFranchisePayout = typeof franchisePayouts.$inferInsert;

// Franchise Reports
export const franchiseReports = pgTable("franchise_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  franchiseType: text("franchise_type").notNull(),
  franchiseId: varchar("franchise_id").notNull(),
  reportType: text("report_type").notNull(),
  reportPeriod: text("report_period"),
  totalSales: integer("total_sales").default(0),
  totalRevenue: integer("total_revenue").default(0),
  totalCommissions: integer("total_commissions").default(0),
  totalPayouts: integer("total_payouts").default(0),
  newMembers: integer("new_members").default(0),
  renewals: integer("renewals").default(0),
  metadata: text("metadata"),
  reportDate: timestamp("report_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type FranchiseReport = typeof franchiseReports.$inferSelect;
export type InsertFranchiseReport = typeof franchiseReports.$inferInsert;

// Pre-existing Conditions
export const preExistingConditions = pgTable("pre_existing_conditions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  conditionName: text("condition_name"),
  conditionCode: varchar("condition_code", { length: 20 }),
  name: text("name"),
  category: text("category"),
  description: text("description"),
  icdCode: text("icd_code"),
  isExcluded: boolean("is_excluded").default(true),
  waitingPeriodMonths: integer("waiting_period_months").default(0),
  notes: text("notes"),
  diagnosedDate: timestamp("diagnosed_date"),
  currentStatus: text("current_status"),
  medications: text("medications"),
  doctorName: text("doctor_name"),
  hospitalName: text("hospital_name"),
  documents: text("documents"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PreExistingCondition = typeof preExistingConditions.$inferSelect;
export type InsertPreExistingCondition = typeof preExistingConditions.$inferInsert;

// Commission Rate Config
export const commissionRateConfig = pgTable("commission_rate_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  franchiseType: text("franchise_type"),
  planCategory: text("plan_category"),
  rate: integer("rate"),
  configName: varchar("config_name", { length: 255 }),
  agentRate: integer("agent_rate").default(15),
  cityFranchiseRate: integer("city_franchise_rate").default(6),
  districtFranchiseRate: integer("district_franchise_rate").default(5),
  stateFranchiseRate: integer("state_franchise_rate").default(4),
  zoneFranchiseRate: integer("zone_franchise_rate").default(3),
  superAdminRate: integer("super_admin_rate").default(67),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  effectiveFrom: timestamp("effective_from").defaultNow().notNull(),
  effectiveTo: timestamp("effective_to"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CommissionRateConfig = typeof commissionRateConfig.$inferSelect;
export type InsertCommissionRateConfig = typeof commissionRateConfig.$inferInsert;

// Business Targets
export const businessTargets = pgTable("business_targets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  targetType: text("target_type").notNull(),
  userId: varchar("user_id").references(() => users.id),
  franchiseType: text("franchise_type"),
  franchiseId: varchar("franchise_id"),
  targetPeriod: text("target_period"),
  targetMonth: integer("target_month"),
  targetQuarter: integer("target_quarter"),
  targetYear: integer("target_year"),
  revenueTarget: integer("revenue_target"),
  membershipTarget: integer("membership_target"),
  renewalTarget: integer("renewal_target"),
  agentRecruitmentTarget: integer("agent_recruitment_target"),
  revenueAchieved: integer("revenue_achieved").default(0),
  membershipsAchieved: integer("memberships_achieved").default(0),
  renewalsAchieved: integer("renewals_achieved").default(0),
  agentsRecruited: integer("agents_recruited").default(0),
  achievementPercent: integer("achievement_percent").default(0),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  setBy: varchar("set_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type BusinessTarget = typeof businessTargets.$inferSelect;
export type InsertBusinessTarget = typeof businessTargets.$inferInsert;

// Incentive Slabs
export const incentiveSlabs = pgTable("incentive_slabs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slabName: text("slab_name").notNull(),
  targetType: text("target_type").notNull(),
  minAchievementPercent: integer("min_achievement_percent").notNull(),
  maxAchievementPercent: integer("max_achievement_percent").notNull(),
  incentivePercent: integer("incentive_percent").notNull(),
  bonusAmount: integer("bonus_amount").default(0),
  isActive: boolean("is_active").notNull().default(true),
  effectiveFrom: timestamp("effective_from").defaultNow().notNull(),
  effectiveTo: timestamp("effective_to"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type IncentiveSlab = typeof incentiveSlabs.$inferSelect;
export type InsertIncentiveSlab = typeof incentiveSlabs.$inferInsert;

// Commission Requests
export const commissionRequests = pgTable("commission_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestType: text("request_type").notNull(),
  userId: varchar("user_id").references(() => users.id),
  franchiseType: text("franchise_type"),
  franchiseId: varchar("franchise_id"),
  amount: integer("amount").notNull(),
  requestPeriod: text("request_period"),
  bankDetails: text("bank_details"),
  status: text("status").notNull().default("pending"),
  processedBy: varchar("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  rejectionReason: text("rejection_reason"),
  transactionId: text("transaction_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CommissionRequest = typeof commissionRequests.$inferSelect;
export type InsertCommissionRequest = typeof commissionRequests.$inferInsert;

// Commission Ledger
export const commissionLedger = pgTable("commission_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entryType: text("entry_type").notNull(),
  userId: varchar("user_id").references(() => users.id),
  franchiseType: text("franchise_type"),
  franchiseId: varchar("franchise_id"),
  amount: integer("amount").notNull(),
  transactionType: text("transaction_type").notNull(),
  referenceType: text("reference_type"),
  referenceId: varchar("reference_id"),
  balance: integer("balance").default(0),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CommissionLedgerEntry = typeof commissionLedger.$inferSelect;
export type InsertCommissionLedgerEntry = typeof commissionLedger.$inferInsert;

// Target Templates
export const targetTemplates = pgTable("target_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateName: text("template_name").notNull(),
  targetType: text("target_type").notNull(),
  targetPeriod: text("target_period"),
  revenueTarget: integer("revenue_target"),
  membershipTarget: integer("membership_target"),
  renewalTarget: integer("renewal_target"),
  agentRecruitmentTarget: integer("agent_recruitment_target"),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TargetTemplate = typeof targetTemplates.$inferSelect;
export type InsertTargetTemplate = typeof targetTemplates.$inferInsert;

// Daily Visitors (Analytics)
export const dailyVisitors = pgTable("daily_visitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  visitorCount: integer("visitor_count").default(0),
  uniqueIps: text("unique_ips"),
  pageViews: integer("page_views").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type DailyVisitor = typeof dailyVisitors.$inferSelect;
export type InsertDailyVisitor = typeof dailyVisitors.$inferInsert;

// Page Visits (Analytics)
export const pageVisits = pgTable("page_visits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  visitorIp: varchar("visitor_ip", { length: 50 }),
  sessionId: varchar("session_id", { length: 100 }),
  pagePath: text("page_path").notNull(),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PageVisit = typeof pageVisits.$inferSelect;
export type InsertPageVisit = typeof pageVisits.$inferInsert;

// Support Chats
export const supportChats = pgTable("support_chats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => users.id),
  customerName: text("customer_name"),
  customerMobile: varchar("customer_mobile", { length: 15 }),
  customerEmail: text("customer_email"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  status: text("status").notNull().default("open"),
  priority: text("priority").default("normal"),
  subject: text("subject"),
  lastMessageAt: timestamp("last_message_at"),
  closedAt: timestamp("closed_at"),
  closedBy: varchar("closed_by").references(() => users.id),
  rating: integer("rating"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SupportChat = typeof supportChats.$inferSelect;
export type InsertSupportChat = typeof supportChats.$inferInsert;

// Support Messages
export const supportMessages = pgTable("support_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatId: varchar("chat_id").notNull().references(() => supportChats.id),
  senderId: varchar("sender_id"),
  senderType: text("sender_type").notNull(),
  senderName: text("sender_name"),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SupportMessage = typeof supportMessages.$inferSelect;
export type InsertSupportMessage = typeof supportMessages.$inferInsert;

// Policies (Terms, Privacy, etc.)
export const policies = pgTable("policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  version: varchar("version", { length: 20 }),
  effectiveDate: timestamp("effective_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Policy = typeof policies.$inferSelect;
export type InsertPolicy = typeof policies.$inferInsert;

// Chatbot Sessions — one per browser session, tracks visitor across conversation
export const chatbotSessions = pgTable("chatbot_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id", { length: 64 }).notNull().unique(),
  visitorName: text("visitor_name"),
  visitorMobile: varchar("visitor_mobile", { length: 15 }),
  visitorEmail: text("visitor_email"),
  userId: varchar("user_id").references(() => users.id),
  messageCount: integer("message_count").notNull().default(0),
  isConverted: boolean("is_converted").notNull().default(false),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("idx_chatbot_sessions_created").on(t.createdAt)]);

export const chatbotMessages = pgTable("chatbot_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("idx_chatbot_messages_session").on(t.sessionId)]);

export type ChatbotSession = typeof chatbotSessions.$inferSelect;
export type ChatbotMessage = typeof chatbotMessages.$inferSelect;
