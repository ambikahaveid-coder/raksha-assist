import { z } from "zod";
import type { Plan } from "../../shared/schema.js";
import { storage } from "../storage.js";

export const PAYMENT_FREQUENCIES = ["monthly", "quarterly", "halfYearly", "yearly"] as const;
export type PaymentFrequency = typeof PAYMENT_FREQUENCIES[number];

export const paymentFrequencySchema = z.enum(PAYMENT_FREQUENCIES).default("yearly");

export const coApplicantSchema = z.object({
  name: z.string().trim().min(1),
  relationship: z.string().trim().optional().default(""),
  age: z.number().int().min(0).max(120),
});

export const paymentRequestSchema = z.object({
  planType: z.string().trim().min(1),
  paymentFrequency: paymentFrequencySchema,
  addOnIds: z.array(z.string()).optional().default([]),
  coApplicants: z.array(coApplicantSchema).optional().default([]),
  termsAgreedAt: z.string().optional(),
});

const PLAN_CODE_ALIASES: Record<string, string> = {
  starter: "STARTER",
  standard: "STANDARD",
  family: "FAMILY_SHIELD",
  premium: "PREMIUM",
};

const CO_APPLICANT_PRICING_BRACKETS = [
  { minAge: 0, maxAge: 17, label: "Child (0-17 yrs)", price: 299, description: "Dependent child" },
  { minAge: 18, maxAge: 45, label: "Adult (18-45 yrs)", price: 499, description: "Spouse / Adult dependent" },
  { minAge: 46, maxAge: 60, label: "Middle Age (46-60 yrs)", price: 999, description: "Parent / Senior dependent" },
  { minAge: 61, maxAge: 120, label: "Senior (61+ yrs)", price: 1499, description: "Senior citizen dependent" },
] as const;

type PricedCoApplicant = z.infer<typeof coApplicantSchema> & {
  ageCategory: string;
  price: number;
};

type AddOnPricing = {
  id: string;
  name: string;
  price: number;
  validityDays: number;
  usageLimit: number;
};

export type CalculatedPaymentPricing = {
  plan: Plan;
  normalizedPlanCode: string;
  paymentFrequency: PaymentFrequency;
  planBaseAmount: number;
  addOnDetails: AddOnPricing[];
  addOnsTotal: number;
  coApplicants: PricedCoApplicant[];
  coApplicantsTotal: number;
  subtotal: number;
  gstAmount: number;
  totalWithGst: number;
  validityDays: number;
  metadata: Record<string, unknown>;
};

export function getCoApplicantPricingBrackets() {
  return CO_APPLICANT_PRICING_BRACKETS;
}

export function normalizeRequestedPlanCode(planType: string): string {
  const normalized = planType.trim().toLowerCase();
  return PLAN_CODE_ALIASES[normalized] || planType.trim().toUpperCase();
}

function getInstallmentAmount(plan: Plan, paymentFrequency: PaymentFrequency): number {
  const yearlyPrice = plan.price;
  const serviceChargePercent = plan.serviceChargePercent || 5;

  switch (paymentFrequency) {
    case "monthly":
      return plan.monthlyPrice || Math.round((yearlyPrice / 12) * (1 + serviceChargePercent / 100));
    case "quarterly":
      return plan.quarterlyPrice || Math.round((yearlyPrice / 4) * (1 + serviceChargePercent / 100));
    case "halfYearly":
      return plan.halfYearlyPrice || Math.round((yearlyPrice / 2) * (1 + serviceChargePercent / 100));
    case "yearly":
    default:
      return yearlyPrice;
  }
}

export function getValidityDaysForFrequency(plan: Plan, paymentFrequency: PaymentFrequency): number {
  const yearlyValidityDays = plan.validityDays || 365;

  switch (paymentFrequency) {
    case "monthly":
      return Math.max(30, Math.round(yearlyValidityDays / 12));
    case "quarterly":
      return Math.max(90, Math.round(yearlyValidityDays / 4));
    case "halfYearly":
      return Math.max(182, Math.round(yearlyValidityDays / 2));
    case "yearly":
    default:
      return yearlyValidityDays;
  }
}

function priceCoApplicants(plan: Plan, coApplicants: z.infer<typeof coApplicantSchema>[]): PricedCoApplicant[] {
  if (coApplicants.length === 0) {
    return [];
  }

  if (plan.planCategory !== "family") {
    throw new Error("Co-applicants are only available for family plans");
  }

  const allowedCoApplicants = Math.max((plan.maxMembers || 1) - 1, 0);
  if (coApplicants.length > allowedCoApplicants) {
    throw new Error(`Selected family members exceed the allowed limit for ${plan.name}`);
  }

  return coApplicants.map((member) => {
    const bracket = CO_APPLICANT_PRICING_BRACKETS.find((entry) => member.age >= entry.minAge && member.age <= entry.maxAge);
    if (!bracket) {
      throw new Error(`Unsupported co-applicant age: ${member.age}`);
    }

    return {
      ...member,
      ageCategory: bracket.label,
      price: bracket.price,
    };
  });
}

export async function calculatePaymentPricing(input: z.infer<typeof paymentRequestSchema>): Promise<CalculatedPaymentPricing> {
  const normalizedPlanCode = normalizeRequestedPlanCode(input.planType);
  const plan = await storage.getPlanByCode(normalizedPlanCode);

  if (!plan) {
    throw new Error(`Invalid plan type: ${input.planType}`);
  }

  const addOnDetails: AddOnPricing[] = [];
  let addOnsTotal = 0;

  for (const addOnId of input.addOnIds) {
    const addOn = await storage.getAddOnBenefitById(addOnId);
    if (addOn && addOn.isActive) {
      addOnDetails.push({
        id: addOn.id,
        name: addOn.name,
        price: addOn.price,
        validityDays: addOn.validityDays,
        usageLimit: addOn.usageLimit,
      });
      addOnsTotal += addOn.price;
    }
  }

  const pricedCoApplicants = priceCoApplicants(plan, input.coApplicants);
  const coApplicantsTotal = pricedCoApplicants.reduce((sum, member) => sum + member.price, 0);
  const planBaseAmount = getInstallmentAmount(plan, input.paymentFrequency);
  const subtotal = planBaseAmount + addOnsTotal + coApplicantsTotal;
  const gstAmount = Math.round(subtotal * 0.18);
  const totalWithGst = subtotal + gstAmount;
  const validityDays = getValidityDaysForFrequency(plan, input.paymentFrequency);

  return {
    plan,
    normalizedPlanCode,
    paymentFrequency: input.paymentFrequency,
    planBaseAmount,
    addOnDetails,
    addOnsTotal,
    coApplicants: pricedCoApplicants,
    coApplicantsTotal,
    subtotal,
    gstAmount,
    totalWithGst,
    validityDays,
    metadata: {
      billing: {
        planCode: plan.planCode,
        paymentFrequency: input.paymentFrequency,
        validityDays,
        planBaseAmount,
        addOnsTotal,
        coApplicantsTotal,
        subtotal,
        gstAmount,
        totalWithGst,
      },
      addOnDetails,
      coApplicants: pricedCoApplicants,
    },
  };
}
