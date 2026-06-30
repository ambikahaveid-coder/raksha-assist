CREATE TABLE "add_on_benefits" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"benefit_code" varchar(50) NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'general' NOT NULL,
	"price" integer NOT NULL,
	"benefit_amount" integer NOT NULL,
	"usage_limit" integer DEFAULT 1 NOT NULL,
	"validity_days" integer DEFAULT 365 NOT NULL,
	"applicable_plans" text,
	"applicable_categories" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "add_on_benefits_benefit_code_unique" UNIQUE("benefit_code")
);
--> statement-breakpoint
CREATE TABLE "admin_permissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"view_payments" boolean DEFAULT false,
	"view_payment_reports" boolean DEFAULT false,
	"view_memberships" boolean DEFAULT true,
	"manage_memberships" boolean DEFAULT false,
	"view_users" boolean DEFAULT true,
	"manage_users" boolean DEFAULT false,
	"view_emergency_requests" boolean DEFAULT true,
	"manage_emergency_requests" boolean DEFAULT true,
	"view_agents" boolean DEFAULT true,
	"manage_agents" boolean DEFAULT false,
	"view_hospitals" boolean DEFAULT true,
	"manage_hospitals" boolean DEFAULT false,
	"view_audit_logs" boolean DEFAULT false,
	"view_system_settings" boolean DEFAULT false,
	"allowed_plan_types" text[],
	"manage_startup_plans" boolean DEFAULT false,
	"manage_gig_worker_plans" boolean DEFAULT false,
	"manage_corporate_plans" boolean DEFAULT false,
	"granted_by" varchar,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_permissions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "agent_commissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" varchar NOT NULL,
	"membership_id" varchar NOT NULL,
	"payment_id" varchar,
	"sale_amount" integer NOT NULL,
	"commission_rate" integer DEFAULT 15 NOT NULL,
	"commission_amount" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payout_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_data" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"total_policies" integer DEFAULT 0 NOT NULL,
	"total_revenue" integer DEFAULT 0 NOT NULL,
	"total_commission" integer DEFAULT 0 NOT NULL,
	"pending_commission" integer DEFAULT 0 NOT NULL,
	"rank" integer,
	"payout_preference" text DEFAULT 'weekly' NOT NULL,
	"bank_name" text,
	"bank_account_number" text,
	"bank_ifsc" text,
	"bank_account_holder" text,
	"upi_id" text,
	"kyc_status" text DEFAULT 'pending' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agent_data_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "agent_franchise_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" varchar NOT NULL,
	"franchise_type" text NOT NULL,
	"franchise_id" varchar NOT NULL,
	"assigned_by" varchar,
	"status" text DEFAULT 'active' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"city_franchise_id" varchar,
	"district_franchise_id" varchar,
	"commission_rate" integer DEFAULT 15,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_payouts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" varchar NOT NULL,
	"amount" integer NOT NULL,
	"payout_method" text NOT NULL,
	"bank_details" text,
	"upi_id" text,
	"transaction_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"processed_by" varchar,
	"processed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_claim_analysis" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"emergency_request_id" varchar NOT NULL,
	"risk_score" integer NOT NULL,
	"fraud_probability" integer NOT NULL,
	"analysis_result" text NOT NULL,
	"red_flags" text[],
	"recommendations" text,
	"document_verified" boolean DEFAULT false,
	"location_verified" boolean DEFAULT false,
	"hospital_verified" boolean DEFAULT false,
	"analyzed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"action" text NOT NULL,
	"details" text,
	"ip_address" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "benefit_usage" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"membership_id" varchar NOT NULL,
	"benefit_type" text NOT NULL,
	"usage_type" text DEFAULT 'plan' NOT NULL,
	"add_on_id" varchar,
	"emergency_request_id" varchar,
	"amount_used" integer NOT NULL,
	"usage_date" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"created_by" varchar
);
--> statement-breakpoint
CREATE TABLE "brochure_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"template_html" text NOT NULL,
	"template_css" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_targets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_type" text NOT NULL,
	"user_id" varchar,
	"franchise_type" text,
	"franchise_id" varchar,
	"target_period" text,
	"target_month" integer,
	"target_quarter" integer,
	"target_year" integer,
	"revenue_target" integer,
	"membership_target" integer,
	"renewal_target" integer,
	"agent_recruitment_target" integer,
	"revenue_achieved" integer DEFAULT 0,
	"memberships_achieved" integer DEFAULT 0,
	"renewals_achieved" integer DEFAULT 0,
	"agents_recruited" integer DEFAULT 0,
	"achievement_percent" integer DEFAULT 0,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"set_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "city_franchises" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city_code" varchar(20) NOT NULL,
	"name" text NOT NULL,
	"city_name" text,
	"district_id" varchar,
	"description" text,
	"pincodes" text[],
	"head_office_address" text,
	"head_office_pincode" varchar(10),
	"owner_id" varchar,
	"owner_name" text,
	"owner_mobile" varchar(15),
	"owner_email" text,
	"pan_number" varchar(12),
	"gst_number" varchar(20),
	"bank_name" text,
	"bank_account_number" text,
	"bank_ifsc" varchar(15),
	"bank_account_holder" text,
	"commission_rate" integer DEFAULT 6 NOT NULL,
	"fixed_monthly_fee" integer DEFAULT 0,
	"target_revenue" integer DEFAULT 0,
	"achieved_revenue" integer DEFAULT 0,
	"total_agents" integer DEFAULT 0,
	"total_members" integer DEFAULT 0,
	"status" text DEFAULT 'pending_approval' NOT NULL,
	"agreement_document" text,
	"agreement_signed_at" timestamp,
	"approved_by" varchar,
	"approved_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "city_franchises_city_code_unique" UNIQUE("city_code")
);
--> statement-breakpoint
CREATE TABLE "commission_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_type" text NOT NULL,
	"commission_rate" integer DEFAULT 15 NOT NULL,
	"bonus_rate" integer DEFAULT 0,
	"minimum_sales" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_by" varchar,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "commission_config_plan_type_unique" UNIQUE("plan_type")
);
--> statement-breakpoint
CREATE TABLE "commission_ledger" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_type" text NOT NULL,
	"user_id" varchar,
	"franchise_type" text,
	"franchise_id" varchar,
	"amount" integer NOT NULL,
	"transaction_type" text NOT NULL,
	"reference_type" text,
	"reference_id" varchar,
	"balance" integer DEFAULT 0,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commission_rate_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"franchise_type" text,
	"plan_category" text,
	"rate" integer,
	"config_name" varchar(255),
	"agent_rate" integer DEFAULT 15,
	"city_franchise_rate" integer DEFAULT 6,
	"district_franchise_rate" integer DEFAULT 5,
	"state_franchise_rate" integer DEFAULT 4,
	"zone_franchise_rate" integer DEFAULT 3,
	"super_admin_rate" integer DEFAULT 67,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"effective_from" timestamp DEFAULT now() NOT NULL,
	"effective_to" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commission_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_type" text NOT NULL,
	"user_id" varchar,
	"franchise_type" text,
	"franchise_id" varchar,
	"amount" integer NOT NULL,
	"request_period" text,
	"bank_details" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"processed_by" varchar,
	"processed_at" timestamp,
	"rejection_reason" text,
	"transaction_id" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"registered_name" text,
	"industry" text,
	"employee_count" integer DEFAULT 0,
	"address" text,
	"city" text,
	"state" text,
	"pincode" varchar(10),
	"phone" varchar(15),
	"email" text,
	"website" text,
	"hr_contact_name" text,
	"hr_contact_email" text,
	"hr_contact_phone" varchar(15),
	"billing_contact_name" text,
	"billing_contact_email" text,
	"billing_contact_phone" varchar(15),
	"pan_number" varchar(12),
	"gst_number" varchar(20),
	"cin_number" varchar(25),
	"bank_name" text,
	"bank_account_number" text,
	"bank_ifsc" varchar(15),
	"bank_account_holder" text,
	"login_email" text,
	"login_password_hash" text,
	"plan_id" varchar,
	"contract_start_date" timestamp,
	"contract_end_date" timestamp,
	"billing_cycle" text DEFAULT 'monthly',
	"payment_terms" text,
	"agreement_document" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_by" varchar,
	"approved_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_login_email_unique" UNIQUE("login_email")
);
--> statement-breakpoint
CREATE TABLE "corporate_employees" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"user_id" varchar,
	"employee_code" varchar(50),
	"name" text NOT NULL,
	"email" text,
	"mobile" varchar(15),
	"department" text,
	"designation" text,
	"date_of_joining" timestamp,
	"date_of_birth" text,
	"gender" text,
	"blood_group" text,
	"emergency_contact" text,
	"emergency_contact_phone" varchar(15),
	"membership_id" varchar,
	"coverage_status" text DEFAULT 'pending' NOT NULL,
	"enrolled_at" timestamp,
	"expires_at" timestamp,
	"invite_token" varchar(100),
	"invite_sent_at" timestamp,
	"invite_accepted_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coverage_exposure_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"membership_id" varchar NOT NULL,
	"ride_id" varchar,
	"coverage_window_start" timestamp NOT NULL,
	"coverage_window_end" timestamp,
	"coverage_type" text DEFAULT 'ride_time' NOT NULL,
	"incident_reported" boolean DEFAULT false,
	"incident_id" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coverage_zones" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"states" text[],
	"cities" text[],
	"radius_km" integer,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_visitors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" text NOT NULL,
	"visitor_count" integer DEFAULT 0,
	"unique_ips" text,
	"page_views" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disease_exclusions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"icd_code" text,
	"description" text,
	"waiting_period_months" integer DEFAULT 12 NOT NULL,
	"is_pre_existing" boolean DEFAULT false NOT NULL,
	"is_lifestyle" boolean DEFAULT false NOT NULL,
	"is_critical" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "district_franchises" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"district_code" varchar(20) NOT NULL,
	"name" text NOT NULL,
	"district_name" text,
	"state_id" varchar,
	"description" text,
	"cities" text[],
	"head_office_address" text,
	"head_office_city" text,
	"head_office_pincode" varchar(10),
	"owner_id" varchar,
	"owner_name" text,
	"owner_mobile" varchar(15),
	"owner_email" text,
	"pan_number" varchar(12),
	"gst_number" varchar(20),
	"bank_name" text,
	"bank_account_number" text,
	"bank_ifsc" varchar(15),
	"bank_account_holder" text,
	"commission_rate" integer DEFAULT 5 NOT NULL,
	"fixed_monthly_fee" integer DEFAULT 0,
	"target_revenue" integer DEFAULT 0,
	"achieved_revenue" integer DEFAULT 0,
	"total_agents" integer DEFAULT 0,
	"total_members" integer DEFAULT 0,
	"status" text DEFAULT 'pending_approval' NOT NULL,
	"agreement_document" text,
	"agreement_signed_at" timestamp,
	"approved_by" varchar,
	"approved_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "district_franchises_district_code_unique" UNIQUE("district_code")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"document_type" varchar(50) NOT NULL,
	"document_name" text NOT NULL,
	"document_url" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"approval_level" integer DEFAULT 0,
	"max_approval_level" integer DEFAULT 2
);
--> statement-breakpoint
CREATE TABLE "email_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" varchar,
	"recipient_email" text NOT NULL,
	"recipient_name" text,
	"subject" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"provider_id" text,
	"error_message" text,
	"metadata" text,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"body_html" text NOT NULL,
	"body_text" text,
	"category" text NOT NULL,
	"variables" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_templates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "emergency_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"hospital_name" text NOT NULL,
	"case_type" text NOT NULL,
	"amount_requested" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employer_auth" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employer_id" varchar NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'employer_admin' NOT NULL,
	"name" text,
	"phone" varchar(15),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login" timestamp,
	"failed_login_attempts" integer DEFAULT 0,
	"locked_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employer_auth_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "employer_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employer_id" varchar NOT NULL,
	"plan_id" varchar,
	"plan_type" text,
	"name" text NOT NULL,
	"description" text,
	"coverage_amount" integer NOT NULL,
	"price_per_employee" integer NOT NULL,
	"max_employees" integer,
	"activated_employees" integer DEFAULT 0,
	"effective_from" timestamp,
	"effective_to" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_by" varchar,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employer_support_contacts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employer_id" varchar NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" varchar(15),
	"whatsapp" varchar(15),
	"role" text DEFAULT 'support',
	"notify_on_sos" boolean DEFAULT true NOT NULL,
	"notify_on_hospitalization" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"registration_number" text,
	"gst_number" text,
	"address" text,
	"city" text,
	"state" text,
	"pincode" varchar(10),
	"contact_person" text,
	"contact_phone" varchar(15),
	"contact_email" text,
	"employee_count" integer DEFAULT 0,
	"plan_id" varchar,
	"zone_id" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enterprise_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"base_price" integer NOT NULL,
	"coverage_amount" integer NOT NULL,
	"max_members" integer DEFAULT 1 NOT NULL,
	"duration_months" integer DEFAULT 12 NOT NULL,
	"co_pay_percent" integer DEFAULT 0 NOT NULL,
	"waiting_period_days" integer DEFAULT 0 NOT NULL,
	"min_enrollment" integer DEFAULT 1,
	"features" text[],
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "family_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"membership_id" varchar NOT NULL,
	"name" text NOT NULL,
	"relation" text NOT NULL,
	"dob" text,
	"gender" text,
	"age" integer
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"plan_id" varchar,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "franchise_commissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"franchise_type" text NOT NULL,
	"franchise_id" varchar NOT NULL,
	"membership_id" varchar,
	"payment_id" varchar,
	"amount" integer NOT NULL,
	"rate" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "franchise_payouts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"franchise_type" text NOT NULL,
	"franchise_id" varchar NOT NULL,
	"amount" integer NOT NULL,
	"payment_method" text,
	"transaction_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"processed_by" varchar,
	"processed_at" timestamp,
	"notes" text,
	"utr_number" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "franchise_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"franchise_type" text NOT NULL,
	"franchise_id" varchar NOT NULL,
	"report_type" text NOT NULL,
	"report_period" text,
	"total_sales" integer DEFAULT 0,
	"total_revenue" integer DEFAULT 0,
	"total_commissions" integer DEFAULT 0,
	"total_payouts" integer DEFAULT 0,
	"new_members" integer DEFAULT 0,
	"renewals" integer DEFAULT 0,
	"metadata" text,
	"report_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fraud_blacklist" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mobile" varchar(15),
	"email" text,
	"aadhar" text,
	"pan_number" varchar(12),
	"reason" text NOT NULL,
	"original_user_id" varchar,
	"blacklisted_by" varchar,
	"evidence" text,
	"legal_action_taken" boolean DEFAULT false,
	"fir_number" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hospital_payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hospital_id" varchar NOT NULL,
	"emergency_request_id" varchar,
	"amount" integer NOT NULL,
	"payment_method" text,
	"transaction_id" text,
	"utr_number" text,
	"invoice_number" text,
	"invoice_date" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"notes" text,
	"processed_by" varchar,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hospitals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"pincode" varchar(10),
	"phone" varchar(15),
	"email" text,
	"contact_person_name" text,
	"contact_person_phone" varchar(15),
	"contact_person_email" text,
	"contact_person_designation" text,
	"bank_name" text,
	"bank_account_number" text,
	"bank_ifsc" varchar(15),
	"bank_account_holder" text,
	"bank_branch" text,
	"pan_number" varchar(12),
	"gst_number" varchar(20),
	"registration_number" text,
	"settlement_terms" text,
	"network_type" text DEFAULT 'cashless',
	"specialties" text,
	"bed_count" integer,
	"emergency_services" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_by" varchar,
	"verified_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incentive_slabs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slab_name" text NOT NULL,
	"target_type" text NOT NULL,
	"min_achievement_percent" integer NOT NULL,
	"max_achievement_percent" integer NOT NULL,
	"incentive_percent" integer NOT NULL,
	"bonus_amount" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"effective_from" timestamp DEFAULT now() NOT NULL,
	"effective_to" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"category" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"config" text,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"mobile" varchar(15) NOT NULL,
	"position" text NOT NULL,
	"experience" text,
	"current_location" text,
	"education" text,
	"resume_url" text,
	"cover_letter" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar,
	"review_notes" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "liftmate_integrations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"api_key" text,
	"webhook_secret" text,
	"revenue_share_percent" integer DEFAULT 5 NOT NULL,
	"fixed_fee_per_ride" integer DEFAULT 500 NOT NULL,
	"settlement_cycle" text DEFAULT 'weekly' NOT NULL,
	"default_plan_type" text DEFAULT 'liftmate_pilot_shield' NOT NULL,
	"family_coverage_limit" integer DEFAULT 3 NOT NULL,
	"accident_coverage_amount" integer DEFAULT 300000 NOT NULL,
	"cashless_buffer_amount" integer DEFAULT 50000 NOT NULL,
	"grace_minutes_after_ride" integer DEFAULT 30 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "liftmate_pilots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"corporate_employee_id" varchar NOT NULL,
	"liftmate_pilot_id" varchar(100) NOT NULL,
	"vehicle_type" text,
	"vehicle_number" varchar(20),
	"license_number" varchar(30),
	"onboarding_status" text DEFAULT 'pending' NOT NULL,
	"membership_id" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "liftmate_revenue_ledger" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"ride_id" varchar,
	"amount_due" integer NOT NULL,
	"amount_paid" integer DEFAULT 0,
	"gst_amount" integer DEFAULT 0,
	"payment_ref" varchar(100),
	"settlement_status" text DEFAULT 'pending' NOT NULL,
	"settlement_batch_id" varchar(100),
	"settled_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "liftmate_rides" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ride_id" varchar(100) NOT NULL,
	"pilot_id" varchar NOT NULL,
	"membership_id" varchar,
	"status" text DEFAULT 'started' NOT NULL,
	"started_at" timestamp NOT NULL,
	"ended_at" timestamp,
	"fare_amount" integer,
	"raksha_share_amount" integer,
	"pickup_location" text,
	"drop_location" text,
	"distance_km" integer,
	"coverage_activated_at" timestamp,
	"coverage_deactivated_at" timestamp,
	"idempotency_key" varchar(100),
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "liftmate_rides_ride_id_unique" UNIQUE("ride_id")
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" varchar(100) NOT NULL,
	"identifier_type" varchar(20) NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"last_attempt_at" timestamp DEFAULT now() NOT NULL,
	"blocked_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_campaigns" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"channel" text NOT NULL,
	"message" text NOT NULL,
	"target_audience" text,
	"scheduled_at" timestamp,
	"sent_at" timestamp,
	"status" text DEFAULT 'draft' NOT NULL,
	"recipient_count" integer DEFAULT 0,
	"delivered_count" integer DEFAULT 0,
	"opened_count" integer DEFAULT 0,
	"clicked_count" integer DEFAULT 0,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membership_add_ons" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"membership_id" varchar NOT NULL,
	"add_on_id" varchar NOT NULL,
	"purchase_price" integer NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"usage_limit" integer NOT NULL,
	"is_exhausted" boolean DEFAULT false NOT NULL,
	"purchased_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	CONSTRAINT "membership_addon_unique" UNIQUE("membership_id","add_on_id")
);
--> statement-breakpoint
CREATE TABLE "membership_usage_summary" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"membership_id" varchar NOT NULL,
	"total_usage_count" integer DEFAULT 0 NOT NULL,
	"total_amount_used" integer DEFAULT 0 NOT NULL,
	"remaining_benefit_amount" integer NOT NULL,
	"remaining_usage_count" integer NOT NULL,
	"last_usage_date" timestamp,
	"next_eligible_date" timestamp,
	"fair_use_violation_count" integer DEFAULT 0 NOT NULL,
	"is_blocked" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "membership_usage_summary_membership_id_unique" UNIQUE("membership_id")
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"membership_number" varchar(20) NOT NULL,
	"plan_type" text NOT NULL,
	"plan_amount" integer DEFAULT 0 NOT NULL,
	"coverage_amount" integer DEFAULT 300000 NOT NULL,
	"status" text DEFAULT 'pending_payment' NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"payment_method" text,
	"transaction_id" text,
	"razorpay_order_id" text,
	"agent_id" varchar,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"expiry_date" timestamp,
	"verified_at" timestamp,
	"vehicle_type" text,
	"vehicle_number" varchar(20),
	"vehicle_make" text,
	"vehicle_model" text,
	"vehicle_year" integer,
	"vehicle_photo_url" text,
	"rc_photo_url" text,
	"property_type" text,
	"property_address" text,
	"business_name" text,
	"business_type" text,
	"business_address" text,
	"plan_category" text,
	CONSTRAINT "memberships_membership_number_unique" UNIQUE("membership_number")
);
--> statement-breakpoint
CREATE TABLE "mobile_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar(255) NOT NULL,
	"user_id" varchar NOT NULL,
	"device_info" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mobile_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'info' NOT NULL,
	"category" text,
	"link" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_push_sent" boolean DEFAULT false NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"code" varchar(50) NOT NULL,
	"discount" text NOT NULL,
	"valid_till" text NOT NULL,
	"target_audience" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "offers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "otp_verifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mobile" varchar(15) NOT NULL,
	"otp_code" varchar(6) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_visits" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visitor_ip" varchar(50),
	"session_id" varchar(100),
	"page_path" text NOT NULL,
	"user_agent" text,
	"referrer" text,
	"user_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"token" varchar(100) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"membership_id" varchar,
	"user_id" varchar NOT NULL,
	"amount" integer NOT NULL,
	"payment_method" text,
	"razorpay_order_id" text,
	"razorpay_payment_id" text,
	"razorpay_signature" text,
	"transaction_id" text,
	"status" text DEFAULT 'created' NOT NULL,
	"status_reason" text,
	"plan_type" text,
	"plan_amount" integer,
	"metadata" text,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_razorpay_order_id_unique" UNIQUE("razorpay_order_id")
);
--> statement-breakpoint
CREATE TABLE "plan_conditions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" varchar,
	"plan_type" text,
	"condition_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"value" text,
	"numeric_value" integer,
	"is_hidden" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_exclusions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" varchar NOT NULL,
	"disease_exclusion_id" varchar NOT NULL,
	"waiting_period_months" integer,
	"co_pay_percent" integer,
	"is_fully_excluded" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_zones" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" varchar NOT NULL,
	"zone_id" varchar NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_code" varchar(50) NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"short_description" text,
	"plan_category" text DEFAULT 'individual' NOT NULL,
	"membership_type" text DEFAULT 'individual' NOT NULL,
	"subscription_period" text DEFAULT 'yearly' NOT NULL,
	"price" integer NOT NULL,
	"original_price" integer,
	"monthly_price" integer,
	"quarterly_price" integer,
	"half_yearly_price" integer,
	"coverage_amount" integer NOT NULL,
	"max_members" integer DEFAULT 1 NOT NULL,
	"validity_days" integer DEFAULT 365 NOT NULL,
	"waiting_period_days" integer DEFAULT 30 NOT NULL,
	"co_pay" integer DEFAULT 0,
	"annual_usage_limit" integer DEFAULT 1,
	"max_benefit_per_usage" integer,
	"fair_usage_cooldown_days" integer DEFAULT 30,
	"pre_hospitalization_amount" integer DEFAULT 0,
	"pre_hospitalization_days" integer DEFAULT 0,
	"post_hospitalization_amount" integer DEFAULT 0,
	"post_hospitalization_days" integer DEFAULT 0,
	"ambulance_cover_amount" integer DEFAULT 0,
	"day_care_amount" integer DEFAULT 0,
	"renewal_bonus" integer DEFAULT 0,
	"nclb_percent" integer DEFAULT 0,
	"service_charge_percent" integer DEFAULT 5,
	"features" text,
	"highlights" text,
	"brochure_url" text,
	"icon_name" text,
	"color_scheme" text,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_popular" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plans_plan_code_unique" UNIQUE("plan_code")
);
--> statement-breakpoint
CREATE TABLE "policies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"version" varchar(20),
	"effective_date" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pre_existing_conditions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"condition_name" text,
	"condition_code" varchar(20),
	"name" text,
	"category" text,
	"description" text,
	"icd_code" text,
	"is_excluded" boolean DEFAULT true,
	"waiting_period_months" integer DEFAULT 0,
	"notes" text,
	"diagnosed_date" timestamp,
	"current_status" text,
	"medications" text,
	"doctor_name" text,
	"hospital_name" text,
	"documents" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_update_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"field_name" text NOT NULL,
	"current_value" text,
	"requested_value" text NOT NULL,
	"reason" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar,
	"review_notes" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promotional_offers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" varchar(20) NOT NULL,
	"description" text,
	"discount_type" text DEFAULT 'percentage' NOT NULL,
	"discount_value" integer NOT NULL,
	"min_purchase_amount" integer DEFAULT 0,
	"max_discount_amount" integer,
	"applicable_plans" text[],
	"usage_limit" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"valid_from" timestamp NOT NULL,
	"valid_until" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promotional_offers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"user_agent" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_incidents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"incident_type" text NOT NULL,
	"severity" text DEFAULT 'low' NOT NULL,
	"description" text NOT NULL,
	"ip_address" varchar(50),
	"user_agent" text,
	"metadata" text,
	"action_taken" text,
	"resolved_by" varchar,
	"resolved_at" timestamp,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "showrooms" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"owner_name" text,
	"vehicle_types" text NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"pincode" varchar(10),
	"phone" varchar(15),
	"email" text,
	"gst_number" varchar(20),
	"pan_number" varchar(12),
	"bank_name" text,
	"bank_account_number" text,
	"bank_ifsc" varchar(15),
	"bank_account_holder" text,
	"commission_rate" integer DEFAULT 10 NOT NULL,
	"total_sales" integer DEFAULT 0 NOT NULL,
	"total_commission" integer DEFAULT 0 NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_by" varchar,
	"verified_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_content" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section" text NOT NULL,
	"title" text,
	"subtitle" text,
	"content" text,
	"metadata" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_content_section_unique" UNIQUE("section")
);
--> statement-breakpoint
CREATE TABLE "sos_case_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"access_level" text DEFAULT 'view' NOT NULL,
	"assigned_by" varchar,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sos_case_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" varchar NOT NULL,
	"event_type" text NOT NULL,
	"description" text,
	"notes" text,
	"created_by" varchar,
	"created_by_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sos_cases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_number" text NOT NULL,
	"user_id" varchar NOT NULL,
	"membership_id" varchar,
	"employer_id" varchar,
	"emergency_type" text NOT NULL,
	"description" text,
	"location" text,
	"latitude" text,
	"longitude" text,
	"hospital_id" varchar,
	"hospital_name" text,
	"patient_name" text,
	"patient_relation" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"assigned_to" varchar,
	"sanction_status" text DEFAULT 'pending',
	"sanction_amount" integer,
	"sanctioned_by" varchar,
	"sanctioned_at" timestamp,
	"sanction_notes" text,
	"is_spam" boolean DEFAULT false NOT NULL,
	"spam_marked_by" varchar,
	"closed_at" timestamp,
	"closed_by" varchar,
	"closure_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sos_cases_case_number_unique" UNIQUE("case_number")
);
--> statement-breakpoint
CREATE TABLE "sos_notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" varchar NOT NULL,
	"recipient_type" text NOT NULL,
	"recipient_id" varchar,
	"recipient_name" text,
	"recipient_phone" varchar(15),
	"recipient_email" text,
	"channel" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_status" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	"last_seen" timestamp DEFAULT now() NOT NULL,
	"last_activity" text,
	CONSTRAINT "staff_status_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "state_franchises" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"state_code" varchar(20) NOT NULL,
	"name" text NOT NULL,
	"state_name" text,
	"zone_id" varchar,
	"description" text,
	"districts" text[],
	"head_office_address" text,
	"head_office_city" text,
	"head_office_pincode" varchar(10),
	"owner_id" varchar,
	"owner_name" text,
	"owner_mobile" varchar(15),
	"owner_email" text,
	"pan_number" varchar(12),
	"gst_number" varchar(20),
	"bank_name" text,
	"bank_account_number" text,
	"bank_ifsc" varchar(15),
	"bank_account_holder" text,
	"commission_rate" integer DEFAULT 4 NOT NULL,
	"fixed_monthly_fee" integer DEFAULT 0,
	"target_revenue" integer DEFAULT 0,
	"achieved_revenue" integer DEFAULT 0,
	"total_agents" integer DEFAULT 0,
	"total_members" integer DEFAULT 0,
	"status" text DEFAULT 'pending_approval' NOT NULL,
	"agreement_document" text,
	"agreement_signed_at" timestamp,
	"approved_by" varchar,
	"approved_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "state_franchises_state_code_unique" UNIQUE("state_code")
);
--> statement-breakpoint
CREATE TABLE "super_admin_login_challenges" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"otp_code" varchar(6) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 5 NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"expires_at" timestamp NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_chats" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar,
	"customer_name" text,
	"customer_mobile" varchar(15),
	"customer_email" text,
	"assigned_to" varchar,
	"status" text DEFAULT 'open' NOT NULL,
	"priority" text DEFAULT 'normal',
	"subject" text,
	"last_message_at" timestamp,
	"closed_at" timestamp,
	"closed_by" varchar,
	"rating" integer,
	"feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" varchar NOT NULL,
	"sender_id" varchar,
	"sender_type" text NOT NULL,
	"sender_name" text,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text,
	"is_encrypted" boolean DEFAULT false,
	"updated_by" varchar,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "target_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_name" text NOT NULL,
	"target_type" text NOT NULL,
	"target_period" text,
	"revenue_target" integer,
	"membership_target" integer,
	"renewal_target" integer,
	"agent_recruitment_target" integer,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sos_abuse" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"spam_count" integer DEFAULT 0 NOT NULL,
	"is_blocked" boolean DEFAULT false NOT NULL,
	"blocked_at" timestamp,
	"blocked_reason" text,
	"unblocked_at" timestamp,
	"unblocked_by" varchar,
	"last_sos_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mobile" varchar(15) NOT NULL,
	"email" text,
	"name" text,
	"aadhar" text,
	"password_hash" text,
	"role" text DEFAULT 'user' NOT NULL,
	"employee_id" varchar(20),
	"department" text,
	"photo_url" text,
	"blood_group" text,
	"date_of_birth" text,
	"is_blocked" boolean DEFAULT false NOT NULL,
	"email_verified" boolean DEFAULT false,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"strike_count" integer DEFAULT 0 NOT NULL,
	"is_suspended" boolean DEFAULT false NOT NULL,
	"suspended_until" timestamp,
	"suspended_reason" text,
	"fraud_score" integer DEFAULT 0 NOT NULL,
	"last_fraud_check" timestamp,
	"aadhar_front_url" text,
	"aadhar_back_url" text,
	"aadhar_verified" boolean DEFAULT false,
	"zone_franchise_id" varchar,
	"state_franchise_id" varchar,
	"district_franchise_id" varchar,
	"city_franchise_id" varchar,
	CONSTRAINT "users_mobile_unique" UNIQUE("mobile"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "vehicle_sos_cases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_number" varchar(20) NOT NULL,
	"membership_id" varchar,
	"user_id" varchar NOT NULL,
	"showroom_id" varchar,
	"vehicle_type" text NOT NULL,
	"vehicle_number" varchar(20),
	"vehicle_make" text,
	"vehicle_model" text,
	"vehicle_year" varchar(4),
	"accident_date" timestamp NOT NULL,
	"accident_location" text,
	"accident_description" text,
	"hospital_name" text,
	"hospital_address" text,
	"estimated_amount" integer,
	"approved_amount" integer,
	"settled_amount" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"documents" text,
	"fir_number" varchar(50),
	"fir_document" text,
	"hospital_bill" text,
	"vehicle_damage_photos" text,
	"processed_by" varchar,
	"processed_at" timestamp,
	"settled_by" varchar,
	"settled_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vehicle_sos_cases_case_number_unique" UNIQUE("case_number")
);
--> statement-breakpoint
CREATE TABLE "zone_franchises" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"zone_code" varchar(20) NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"states" text[],
	"head_office_address" text,
	"head_office_city" text,
	"head_office_state" text,
	"head_office_pincode" varchar(10),
	"owner_id" varchar,
	"owner_name" text,
	"owner_mobile" varchar(15),
	"owner_email" text,
	"pan_number" varchar(12),
	"gst_number" varchar(20),
	"bank_name" text,
	"bank_account_number" text,
	"bank_ifsc" varchar(15),
	"bank_account_holder" text,
	"commission_rate" integer DEFAULT 3 NOT NULL,
	"fixed_monthly_fee" integer DEFAULT 0,
	"target_revenue" integer DEFAULT 0,
	"achieved_revenue" integer DEFAULT 0,
	"total_agents" integer DEFAULT 0,
	"total_members" integer DEFAULT 0,
	"status" text DEFAULT 'pending_approval' NOT NULL,
	"agreement_document" text,
	"agreement_signed_at" timestamp,
	"approved_by" varchar,
	"approved_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "zone_franchises_zone_code_unique" UNIQUE("zone_code")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "add_on_benefits" ADD CONSTRAINT "add_on_benefits_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_permissions" ADD CONSTRAINT "admin_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_permissions" ADD CONSTRAINT "admin_permissions_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_commissions" ADD CONSTRAINT "agent_commissions_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_commissions" ADD CONSTRAINT "agent_commissions_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_commissions" ADD CONSTRAINT "agent_commissions_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_data" ADD CONSTRAINT "agent_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_franchise_assignments" ADD CONSTRAINT "agent_franchise_assignments_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_franchise_assignments" ADD CONSTRAINT "agent_franchise_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_franchise_assignments" ADD CONSTRAINT "agent_franchise_assignments_city_franchise_id_city_franchises_id_fk" FOREIGN KEY ("city_franchise_id") REFERENCES "public"."city_franchises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_franchise_assignments" ADD CONSTRAINT "agent_franchise_assignments_district_franchise_id_district_franchises_id_fk" FOREIGN KEY ("district_franchise_id") REFERENCES "public"."district_franchises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_payouts" ADD CONSTRAINT "agent_payouts_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_payouts" ADD CONSTRAINT "agent_payouts_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_claim_analysis" ADD CONSTRAINT "ai_claim_analysis_emergency_request_id_emergency_requests_id_fk" FOREIGN KEY ("emergency_request_id") REFERENCES "public"."emergency_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefit_usage" ADD CONSTRAINT "benefit_usage_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefit_usage" ADD CONSTRAINT "benefit_usage_add_on_id_add_on_benefits_id_fk" FOREIGN KEY ("add_on_id") REFERENCES "public"."add_on_benefits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefit_usage" ADD CONSTRAINT "benefit_usage_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_targets" ADD CONSTRAINT "business_targets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_targets" ADD CONSTRAINT "business_targets_set_by_users_id_fk" FOREIGN KEY ("set_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "city_franchises" ADD CONSTRAINT "city_franchises_district_id_district_franchises_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."district_franchises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "city_franchises" ADD CONSTRAINT "city_franchises_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "city_franchises" ADD CONSTRAINT "city_franchises_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_config" ADD CONSTRAINT "commission_config_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_ledger" ADD CONSTRAINT "commission_ledger_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_rate_config" ADD CONSTRAINT "commission_rate_config_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_requests" ADD CONSTRAINT "commission_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_requests" ADD CONSTRAINT "commission_requests_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporate_employees" ADD CONSTRAINT "corporate_employees_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporate_employees" ADD CONSTRAINT "corporate_employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporate_employees" ADD CONSTRAINT "corporate_employees_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coverage_exposure_logs" ADD CONSTRAINT "coverage_exposure_logs_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coverage_exposure_logs" ADD CONSTRAINT "coverage_exposure_logs_ride_id_liftmate_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."liftmate_rides"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "district_franchises" ADD CONSTRAINT "district_franchises_state_id_state_franchises_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."state_franchises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "district_franchises" ADD CONSTRAINT "district_franchises_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "district_franchises" ADD CONSTRAINT "district_franchises_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_requests" ADD CONSTRAINT "emergency_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employer_auth" ADD CONSTRAINT "employer_auth_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employer_plans" ADD CONSTRAINT "employer_plans_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employer_plans" ADD CONSTRAINT "employer_plans_plan_id_enterprise_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."enterprise_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employer_plans" ADD CONSTRAINT "employer_plans_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employer_support_contacts" ADD CONSTRAINT "employer_support_contacts_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employers" ADD CONSTRAINT "employers_plan_id_enterprise_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."enterprise_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employers" ADD CONSTRAINT "employers_zone_id_coverage_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."coverage_zones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_commissions" ADD CONSTRAINT "franchise_commissions_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_commissions" ADD CONSTRAINT "franchise_commissions_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_payouts" ADD CONSTRAINT "franchise_payouts_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_blacklist" ADD CONSTRAINT "fraud_blacklist_blacklisted_by_users_id_fk" FOREIGN KEY ("blacklisted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_payments" ADD CONSTRAINT "hospital_payments_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_payments" ADD CONSTRAINT "hospital_payments_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitals" ADD CONSTRAINT "hospitals_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incentive_slabs" ADD CONSTRAINT "incentive_slabs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_settings" ADD CONSTRAINT "integration_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liftmate_integrations" ADD CONSTRAINT "liftmate_integrations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liftmate_pilots" ADD CONSTRAINT "liftmate_pilots_corporate_employee_id_corporate_employees_id_fk" FOREIGN KEY ("corporate_employee_id") REFERENCES "public"."corporate_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liftmate_pilots" ADD CONSTRAINT "liftmate_pilots_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liftmate_revenue_ledger" ADD CONSTRAINT "liftmate_revenue_ledger_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liftmate_revenue_ledger" ADD CONSTRAINT "liftmate_revenue_ledger_ride_id_liftmate_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."liftmate_rides"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liftmate_rides" ADD CONSTRAINT "liftmate_rides_pilot_id_liftmate_pilots_id_fk" FOREIGN KEY ("pilot_id") REFERENCES "public"."liftmate_pilots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liftmate_rides" ADD CONSTRAINT "liftmate_rides_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_add_ons" ADD CONSTRAINT "membership_add_ons_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_add_ons" ADD CONSTRAINT "membership_add_ons_add_on_id_add_on_benefits_id_fk" FOREIGN KEY ("add_on_id") REFERENCES "public"."add_on_benefits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_usage_summary" ADD CONSTRAINT "membership_usage_summary_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile_tokens" ADD CONSTRAINT "mobile_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_visits" ADD CONSTRAINT "page_visits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_conditions" ADD CONSTRAINT "plan_conditions_plan_id_enterprise_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."enterprise_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_exclusions" ADD CONSTRAINT "plan_exclusions_plan_id_enterprise_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."enterprise_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_exclusions" ADD CONSTRAINT "plan_exclusions_disease_exclusion_id_disease_exclusions_id_fk" FOREIGN KEY ("disease_exclusion_id") REFERENCES "public"."disease_exclusions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_zones" ADD CONSTRAINT "plan_zones_plan_id_enterprise_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."enterprise_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_zones" ADD CONSTRAINT "plan_zones_zone_id_coverage_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."coverage_zones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pre_existing_conditions" ADD CONSTRAINT "pre_existing_conditions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_update_requests" ADD CONSTRAINT "profile_update_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_update_requests" ADD CONSTRAINT "profile_update_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotional_offers" ADD CONSTRAINT "promotional_offers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_incidents" ADD CONSTRAINT "security_incidents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_incidents" ADD CONSTRAINT "security_incidents_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showrooms" ADD CONSTRAINT "showrooms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showrooms" ADD CONSTRAINT "showrooms_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_content" ADD CONSTRAINT "site_content_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sos_case_assignments" ADD CONSTRAINT "sos_case_assignments_case_id_sos_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."sos_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sos_case_assignments" ADD CONSTRAINT "sos_case_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sos_case_assignments" ADD CONSTRAINT "sos_case_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sos_case_events" ADD CONSTRAINT "sos_case_events_case_id_sos_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."sos_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sos_case_events" ADD CONSTRAINT "sos_case_events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sos_cases" ADD CONSTRAINT "sos_cases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sos_cases" ADD CONSTRAINT "sos_cases_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sos_cases" ADD CONSTRAINT "sos_cases_employer_id_employers_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sos_cases" ADD CONSTRAINT "sos_cases_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sos_cases" ADD CONSTRAINT "sos_cases_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sos_cases" ADD CONSTRAINT "sos_cases_sanctioned_by_users_id_fk" FOREIGN KEY ("sanctioned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sos_cases" ADD CONSTRAINT "sos_cases_spam_marked_by_users_id_fk" FOREIGN KEY ("spam_marked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sos_cases" ADD CONSTRAINT "sos_cases_closed_by_users_id_fk" FOREIGN KEY ("closed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sos_notifications" ADD CONSTRAINT "sos_notifications_case_id_sos_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."sos_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_status" ADD CONSTRAINT "staff_status_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "state_franchises" ADD CONSTRAINT "state_franchises_zone_id_zone_franchises_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zone_franchises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "state_franchises" ADD CONSTRAINT "state_franchises_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "state_franchises" ADD CONSTRAINT "state_franchises_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "super_admin_login_challenges" ADD CONSTRAINT "super_admin_login_challenges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_chats" ADD CONSTRAINT "support_chats_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_chats" ADD CONSTRAINT "support_chats_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_chats" ADD CONSTRAINT "support_chats_closed_by_users_id_fk" FOREIGN KEY ("closed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_chat_id_support_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."support_chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "target_templates" ADD CONSTRAINT "target_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sos_abuse" ADD CONSTRAINT "user_sos_abuse_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sos_abuse" ADD CONSTRAINT "user_sos_abuse_unblocked_by_users_id_fk" FOREIGN KEY ("unblocked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_sos_cases" ADD CONSTRAINT "vehicle_sos_cases_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_sos_cases" ADD CONSTRAINT "vehicle_sos_cases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_sos_cases" ADD CONSTRAINT "vehicle_sos_cases_showroom_id_showrooms_id_fk" FOREIGN KEY ("showroom_id") REFERENCES "public"."showrooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_sos_cases" ADD CONSTRAINT "vehicle_sos_cases_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_sos_cases" ADD CONSTRAINT "vehicle_sos_cases_settled_by_users_id_fk" FOREIGN KEY ("settled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zone_franchises" ADD CONSTRAINT "zone_franchises_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zone_franchises" ADD CONSTRAINT "zone_franchises_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_agent_commissions_agent_id" ON "agent_commissions" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_agent_commissions_status" ON "agent_commissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_agent_data_kyc_status" ON "agent_data" USING btree ("kyc_status");--> statement-breakpoint
CREATE INDEX "idx_agent_data_is_active" ON "agent_data" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_agent_payouts_agent_id" ON "agent_payouts" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_agent_payouts_status" ON "agent_payouts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_corp_employees_company_id" ON "corporate_employees" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_corp_employees_user_id" ON "corporate_employees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_email_logs_status" ON "email_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_emergency_requests_user_id" ON "emergency_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_emergency_requests_status" ON "emergency_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_family_members_membership_id" ON "family_members" USING btree ("membership_id");--> statement-breakpoint
CREATE INDEX "idx_hospital_payments_hospital_id" ON "hospital_payments" USING btree ("hospital_id");--> statement-breakpoint
CREATE INDEX "idx_hospital_payments_status" ON "hospital_payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_login_attempts_identifier" ON "login_attempts" USING btree ("identifier","identifier_type");--> statement-breakpoint
CREATE INDEX "idx_memberships_user_id" ON "memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_memberships_status" ON "memberships" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_memberships_agent_id" ON "memberships" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_memberships_expiry_date" ON "memberships" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "idx_otp_verifications_mobile" ON "otp_verifications" USING btree ("mobile");--> statement-breakpoint
CREATE INDEX "idx_payments_user_id" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payments_status" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payments_created_at" ON "payments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_showrooms_user_id" ON "showrooms" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_showrooms_is_active" ON "showrooms" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_sos_cases_user_id" ON "sos_cases" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sos_cases_status" ON "sos_cases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_sos_cases_created_at" ON "sos_cases" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_users_created_at" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_vehicle_sos_user_id" ON "vehicle_sos_cases" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_vehicle_sos_status" ON "vehicle_sos_cases" USING btree ("status");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chatbot_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(64) NOT NULL UNIQUE,
	"visitor_name" text,
	"visitor_mobile" varchar(15),
	"visitor_email" text,
	"user_id" varchar REFERENCES "users"("id"),
	"message_count" integer DEFAULT 0 NOT NULL,
	"is_converted" boolean DEFAULT false NOT NULL,
	"last_message_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chatbot_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(64) NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chatbot_sessions_created" ON "chatbot_sessions" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chatbot_messages_session" ON "chatbot_messages" USING btree ("session_id");
