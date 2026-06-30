import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/layout/Navbar";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  Bike,
  Car,
  Truck,
  Home,
  Building2,
  Store,
  Users,
  Plane,
  Shield,
  Stethoscope,
  Star,
  Sparkles,
  CreditCard
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const FALLBACK_PLANS = [
  {
    id: "fb-1", planCode: "STARTER", name: "Raksha Individual Basic", planCategory: "individual",
    price: 599, originalPrice: 999, coverageAmount: 100000, subscriptionPeriod: "yearly",
    shortDescription: "Entry-level individual protection.", isPopular: false, isFeatured: false,
    features: '["Accident Support up to ₹1 Lakh","Cashless Network Hospitals","24/7 Emergency Helpline","Basic Ambulance","Digital Membership Card","45-Day Waiting (Illness)","20% Co-Pay"]',
    maxMembers: 1, waitingPeriodDays: 45, preHospitalizationAmount: 0, postHospitalizationAmount: 0,
    ambulanceCoverAmount: 1000, dayCareAmount: 0, renewalBonus: 0, nclbPercent: 0, monthlyPrice: null, quarterlyPrice: null, halfYearlyPrice: null, serviceChargePercent: 5
  },
  {
    id: "fb-2", planCode: "STANDARD", name: "Raksha Individual Silver", planCategory: "individual",
    price: 1199, originalPrice: 1799, coverageAmount: 200000, subscriptionPeriod: "yearly",
    shortDescription: "Balanced individual coverage.", isPopular: false, isFeatured: false,
    features: '["Accident & Medical Support up to ₹2 Lakh","500+ Cashless Hospitals","24/7 Priority Helpline","Free Ambulance up to 50 km","Pre & Post Hospitalization","30-Day Waiting","Only 10% Co-Pay"]',
    maxMembers: 1, waitingPeriodDays: 30, preHospitalizationAmount: 3000, postHospitalizationAmount: 3000,
    ambulanceCoverAmount: 2500, dayCareAmount: 0, renewalBonus: 5, nclbPercent: 0, monthlyPrice: null, quarterlyPrice: null, halfYearlyPrice: null, serviceChargePercent: 5
  },
  {
    id: "fb-3", planCode: "PREMIUM", name: "Raksha Individual Gold", planCategory: "individual",
    price: 2499, originalPrice: 3499, coverageAmount: 400000, subscriptionPeriod: "yearly",
    shortDescription: "Most popular individual plan.", isPopular: true, isFeatured: true,
    features: '["Full Emergency Support up to ₹4 Lakh","1000+ Cashless Hospitals Pan-India","24/7 Priority SOS","Free Ambulance Unlimited","Pre & Post Hospitalization","Personal Care Coordinator","Only 5% Co-Pay","15-Day Waiting"]',
    maxMembers: 1, waitingPeriodDays: 15, preHospitalizationAmount: 7500, postHospitalizationAmount: 7500,
    ambulanceCoverAmount: 5000, dayCareAmount: 10000, renewalBonus: 10, nclbPercent: 5, monthlyPrice: null, quarterlyPrice: null, halfYearlyPrice: null, serviceChargePercent: 5
  },
  {
    id: "fb-4", planCode: "PLATINUM", name: "Raksha Individual Platinum", planCategory: "individual",
    price: 4999, originalPrice: 6999, coverageAmount: 700000, subscriptionPeriod: "yearly",
    shortDescription: "Flagship VIP individual plan.", isPopular: false, isFeatured: true,
    features: '["Full Support up to ₹7 Lakh","VIP Hospital Network","Zero Co-Pay on Claims","Priority + Air Ambulance","Full Pre & Post Hospitalization","Dedicated Care Manager","Legal Assistance","7-Day Fast-Track Activation"]',
    maxMembers: 1, waitingPeriodDays: 7, preHospitalizationAmount: 15000, postHospitalizationAmount: 15000,
    ambulanceCoverAmount: 10000, dayCareAmount: 20000, renewalBonus: 15, nclbPercent: 10, monthlyPrice: null, quarterlyPrice: null, halfYearlyPrice: null, serviceChargePercent: 5
  },
  {
    id: "fb-5", planCode: "FAMILY_BASIC", name: "Raksha Family Essential", planCategory: "family",
    price: 1999, originalPrice: 2999, coverageAmount: 200000, subscriptionPeriod: "yearly",
    shortDescription: "Entry-level family floater (up to 4 members).", isPopular: false, isFeatured: false,
    features: '["Self + Spouse + 2 Kids","Accident Support up to ₹2 Lakh (Shared)","Cashless Hospitals","24/7 Helpline","Digital Cards for All","45-Day Waiting","20% Co-Pay"]',
    maxMembers: 4, waitingPeriodDays: 45, preHospitalizationAmount: 0, postHospitalizationAmount: 0,
    ambulanceCoverAmount: 1500, dayCareAmount: 0, renewalBonus: 0, nclbPercent: 0, monthlyPrice: null, quarterlyPrice: null, halfYearlyPrice: null, serviceChargePercent: 5
  },
  {
    id: "fb-6", planCode: "FAMILY_SHIELD", name: "Raksha Family Shield", planCategory: "family",
    price: 3499, originalPrice: 4999, coverageAmount: 400000, subscriptionPeriod: "yearly",
    shortDescription: "Comprehensive family floater (up to 5 members).", isPopular: true, isFeatured: true,
    features: '["Up to 5 Members","Support up to ₹4 Lakh (Shared)","500+ Cashless Hospitals","Priority Ambulance","Pre & Post Hospitalization","Add Parents (18-60)","Only 10% Co-Pay","30-Day Waiting"]',
    maxMembers: 5, waitingPeriodDays: 30, preHospitalizationAmount: 5000, postHospitalizationAmount: 5000,
    ambulanceCoverAmount: 3000, dayCareAmount: 5000, renewalBonus: 5, nclbPercent: 0, monthlyPrice: null, quarterlyPrice: null, halfYearlyPrice: null, serviceChargePercent: 5
  },
  {
    id: "fb-7", planCode: "FAMILY_PREMIUM", name: "Raksha Family Crown", planCategory: "family",
    price: 5999, originalPrice: 8499, coverageAmount: 700000, subscriptionPeriod: "yearly",
    shortDescription: "Premium family floater (up to 6 members).", isPopular: false, isFeatured: true,
    features: '["Up to 6 Members","Support up to ₹7 Lakh (Shared)","1000+ Pan-India Hospitals","Priority + Air Ambulance","Full Pre & Post Hospitalization","Personal Care Manager","Only 5% Co-Pay","15-Day Waiting"]',
    maxMembers: 6, waitingPeriodDays: 15, preHospitalizationAmount: 10000, postHospitalizationAmount: 10000,
    ambulanceCoverAmount: 5000, dayCareAmount: 10000, renewalBonus: 10, nclbPercent: 5, monthlyPrice: null, quarterlyPrice: null, halfYearlyPrice: null, serviceChargePercent: 5
  },
  {
    id: "fb-8", planCode: "FAMILY_ROYALE", name: "Raksha Family Royale", planCategory: "family",
    price: 9999, originalPrice: 13999, coverageAmount: 1200000, subscriptionPeriod: "yearly",
    shortDescription: "Flagship VIP family plan (up to 6 members).", isPopular: false, isFeatured: true,
    features: '["Up to 6 Members","Full Support up to ₹12 Lakh","VIP Hospital Access","Zero Co-Pay","Priority + Air Ambulance","Dedicated Family Care Manager","Legal Assistance","7-Day Activation"]',
    maxMembers: 6, waitingPeriodDays: 7, preHospitalizationAmount: 20000, postHospitalizationAmount: 20000,
    ambulanceCoverAmount: 10000, dayCareAmount: 25000, renewalBonus: 15, nclbPercent: 10, monthlyPrice: null, quarterlyPrice: null, halfYearlyPrice: null, serviceChargePercent: 5
  },
  {
    id: "fb-9", planCode: "BIZ_STARTER", name: "Raksha Business Essential", planCategory: "business",
    price: 2999, originalPrice: 4499, coverageAmount: 300000, subscriptionPeriod: "yearly",
    shortDescription: "Emergency protection for freelancers & self-employed.", isPopular: false, isFeatured: false,
    features: '["Emergency Assistance up to ₹3 Lakh","Accident Coverage — No Waiting Period","500+ Cashless Hospitals","Legal FIR Assistance","Ambulance Coordination","Post-Hospitalization Follow-up","30-Day Waiting (Illness)","15% Co-Pay"]',
    maxMembers: 1, waitingPeriodDays: 30, preHospitalizationAmount: 3000, postHospitalizationAmount: 3000,
    ambulanceCoverAmount: 3000, dayCareAmount: 0, renewalBonus: 5, nclbPercent: 0, monthlyPrice: null, quarterlyPrice: null, halfYearlyPrice: null, serviceChargePercent: 5
  },
  {
    id: "fb-10", planCode: "BIZ_PRO", name: "Raksha Business Pro", planCategory: "business",
    price: 5499, originalPrice: 7999, coverageAmount: 600000, subscriptionPeriod: "yearly",
    shortDescription: "For professionals who can't afford downtime — covers self + spouse.", isPopular: true, isFeatured: true,
    features: '["Emergency Assistance up to ₹6 Lakh","Self + Spouse Covered","1000+ Cashless Hospitals Pan-India","Priority Ambulance Unlimited","Legal Accident Consultation","Pre & Post Hospitalization","Medicine Delivery","Personal Care Coordinator","15-Day Waiting (Illness)","Only 10% Co-Pay"]',
    maxMembers: 2, waitingPeriodDays: 15, preHospitalizationAmount: 7500, postHospitalizationAmount: 7500,
    ambulanceCoverAmount: 7500, dayCareAmount: 10000, renewalBonus: 10, nclbPercent: 5, monthlyPrice: null, quarterlyPrice: null, halfYearlyPrice: null, serviceChargePercent: 5
  },
  {
    id: "fb-11", planCode: "BIZ_ELITE", name: "Raksha Business Elite", planCategory: "business",
    price: 9999, originalPrice: 14999, coverageAmount: 1200000, subscriptionPeriod: "yearly",
    shortDescription: "Flagship plan for business owners & directors — zero co-pay.", isPopular: false, isFeatured: true,
    features: '["Emergency Assistance up to ₹12 Lakh","Self + Spouse + 2 Children","Zero Co-Pay on All Assistance","VIP Hospital Network","Air Ambulance Coordination","Dedicated Relationship Manager","Legal Assistance Package","Zero Processing Fees","7-Day Fast-Track Activation","Annual Health Review"]',
    maxMembers: 4, waitingPeriodDays: 7, preHospitalizationAmount: 15000, postHospitalizationAmount: 15000,
    ambulanceCoverAmount: 15000, dayCareAmount: 25000, renewalBonus: 15, nclbPercent: 10, monthlyPrice: null, quarterlyPrice: null, halfYearlyPrice: null, serviceChargePercent: 5
  },
  {
    id: "fb-12", planCode: "CORP_ESSENTIAL", name: "Raksha Corporate Essential", planCategory: "corporate",
    price: 1299, originalPrice: 1999, coverageAmount: 200000, subscriptionPeriod: "yearly",
    shortDescription: "Group assistance for startups — min 5 employees.", isPopular: false, isFeatured: false,
    features: '["₹2 Lakh Assistance per Employee","Min 5 Employees","HR Enrollment Portal","Group Billing (Single Invoice)","Individual Card per Employee","24/7 Emergency Helpline","Cashless Hospitals","30-Day Waiting (Illness)","20% Co-Pay"]',
    maxMembers: 1, waitingPeriodDays: 30, preHospitalizationAmount: 0, postHospitalizationAmount: 0,
    ambulanceCoverAmount: 1500, dayCareAmount: 0, renewalBonus: 0, nclbPercent: 0, monthlyPrice: null, quarterlyPrice: null, halfYearlyPrice: null, serviceChargePercent: 5
  },
  {
    id: "fb-13", planCode: "CORP_STANDARD", name: "Raksha Corporate Standard", planCategory: "corporate",
    price: 2299, originalPrice: 3499, coverageAmount: 400000, subscriptionPeriod: "yearly",
    shortDescription: "Employee welfare plan for SMEs — min 10 employees.", isPopular: true, isFeatured: false,
    features: '["₹4 Lakh Assistance per Employee","Min 10 Employees","HR Dashboard + Monthly Reports","Priority Emergency Response SLA","1000+ Cashless Hospitals","Priority Ambulance","GST Invoice","20-Day Waiting (Illness)","Only 15% Co-Pay"]',
    maxMembers: 1, waitingPeriodDays: 20, preHospitalizationAmount: 5000, postHospitalizationAmount: 5000,
    ambulanceCoverAmount: 3000, dayCareAmount: 5000, renewalBonus: 5, nclbPercent: 0, monthlyPrice: null, quarterlyPrice: null, halfYearlyPrice: null, serviceChargePercent: 5
  },
  {
    id: "fb-14", planCode: "CORP_PREMIUM", name: "Raksha Corporate Premium", planCategory: "corporate",
    price: 3799, originalPrice: 5499, coverageAmount: 600000, subscriptionPeriod: "yearly",
    shortDescription: "With dependent coverage & dedicated manager — min 25 employees.", isPopular: false, isFeatured: true,
    features: '["₹6 Lakh Assistance per Employee","Employee + 1 Dependent Covered","Min 25 Employees","Dedicated Account Manager","HR Dashboard + Quarterly Review","VIP Hospital Network","Air Ambulance","Legal Consultation per Employee","Only 10% Co-Pay","10-Day Waiting (Illness)"]',
    maxMembers: 2, waitingPeriodDays: 10, preHospitalizationAmount: 10000, postHospitalizationAmount: 10000,
    ambulanceCoverAmount: 7500, dayCareAmount: 10000, renewalBonus: 10, nclbPercent: 5, monthlyPrice: null, quarterlyPrice: null, halfYearlyPrice: null, serviceChargePercent: 5
  },
  {
    id: "fb-15", planCode: "CORP_ENTERPRISE", name: "Raksha Corporate Enterprise", planCategory: "corporate",
    price: 5499, originalPrice: 7999, coverageAmount: 1000000, subscriptionPeriod: "yearly",
    shortDescription: "Enterprise-grade full family coverage — min 50 employees.", isPopular: false, isFeatured: true,
    features: '["₹10 Lakh Assistance per Employee","Full Family Coverage (Employee + 3 Dependents)","Min 50 Employees","Zero Co-Pay on All Claims","White-Label Cards with Company Logo","Dedicated Senior Relationship Manager","Custom VIP Helpline Number","Air Ambulance + Priority Hospitals","Custom SLA Agreement","Zero Processing Fees","7-Day Activation","Monthly + Quarterly Analytics"]',
    maxMembers: 4, waitingPeriodDays: 7, preHospitalizationAmount: 20000, postHospitalizationAmount: 20000,
    ambulanceCoverAmount: 15000, dayCareAmount: 25000, renewalBonus: 15, nclbPercent: 10, monthlyPrice: null, quarterlyPrice: null, halfYearlyPrice: null, serviceChargePercent: 5
  }
];

const CATEGORY_CONFIG: Record<string, { name: string; icon: any; description: string; color: string }> = {
  individual: { 
    name: "Individual Plans", 
    icon: Shield, 
    description: "Emergency support for individuals",
    color: "bg-blue-50 border-blue-200 text-blue-700"
  },
  family: {
    name: "Family Plans",
    icon: Users,
    description: "Comprehensive protection for your entire family",
    color: "bg-green-50 border-green-200 text-green-700"
  },
  business: {
    name: "Business Shield",
    icon: Shield,
    description: "For self-employed professionals, entrepreneurs & business owners",
    color: "bg-amber-50 border-amber-200 text-amber-700"
  },
  corporate: {
    name: "Corporate Shield",
    icon: Users,
    description: "Group plans for companies — per employee pricing, HR portal included",
    color: "bg-indigo-50 border-indigo-200 text-indigo-700"
  },
  senior: {
    name: "Senior Citizen Plans", 
    icon: Stethoscope, 
    description: "Specialized care for senior citizens (60+ years)",
    color: "bg-purple-50 border-purple-200 text-purple-700"
  },
  maternity: { 
    name: "Maternity Plans", 
    icon: Stethoscope, 
    description: "Emergency care during pregnancy",
    color: "bg-pink-50 border-pink-200 text-pink-700"
  },
  two_wheeler: { 
    name: "Two Wheeler Assist", 
    icon: Bike, 
    description: "Roadside assistance for bikes and scooters",
    color: "bg-orange-50 border-orange-200 text-orange-700"
  },
  car: { 
    name: "Car Assist", 
    icon: Car, 
    description: "Complete protection for your car",
    color: "bg-slate-50 border-slate-200 text-slate-700"
  },
  commercial_vehicle: { 
    name: "Commercial Vehicle Assist", 
    icon: Truck, 
    description: "Fleet and commercial vehicle support",
    color: "bg-amber-50 border-amber-200 text-amber-700"
  },
  home: { 
    name: "Home Assist", 
    icon: Home, 
    description: "Home emergency assistance services",
    color: "bg-cyan-50 border-cyan-200 text-cyan-700"
  },
  business: { 
    name: "Business Assist", 
    icon: Store, 
    description: "Complete business protection package",
    color: "bg-indigo-50 border-indigo-200 text-indigo-700"
  },
  travel: { 
    name: "Travel Assist", 
    icon: Plane, 
    description: "Travel emergency assistance",
    color: "bg-rose-50 border-rose-200 text-rose-700"
  }
};

type PaymentFrequency = "monthly" | "quarterly" | "halfYearly" | "yearly";

const PAYMENT_OPTIONS: { value: PaymentFrequency; label: string; months: number; discount: string }[] = [
  { value: "monthly", label: "Monthly", months: 1, discount: "+5% service" },
  { value: "quarterly", label: "3 Months", months: 3, discount: "+3% service" },
  { value: "halfYearly", label: "6 Months", months: 6, discount: "+2% service" },
  { value: "yearly", label: "1 Year", months: 12, discount: "Best Value" },
];

function persistCheckoutSelection(planCode: string, frequency: PaymentFrequency) {
  sessionStorage.setItem("checkoutSelection", JSON.stringify({ planCode, frequency }));
}

export default function AllPlansPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>("yearly");
  const { isAuthenticated, membership } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load Razorpay script on mount
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const { data: rawPlans = [], isLoading } = useQuery({
    queryKey: ["public-plans"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/plans");
        if (!res.ok) return [];
        const data = await res.json();
        return data;
      } catch {
        return [];
      }
    }
  });

  const plans = rawPlans.length > 0 ? rawPlans : FALLBACK_PLANS;

  const { data: addOns = [] } = useQuery({
    queryKey: ["public-addons"],
    queryFn: async () => {
      const res = await fetch("/api/add-on-benefits");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const categories = Object.keys(CATEGORY_CONFIG);
  
  const groupedPlans = plans.reduce((acc: Record<string, any[]>, plan: any) => {
    const cat = plan.planCategory || "individual";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(plan);
    return acc;
  }, {});

  const filteredPlans = activeCategory === "all" 
    ? plans 
    : plans.filter((p: any) => p.planCategory === activeCategory);

  const parseFeatures = (features: string | null): string[] => {
    if (!features) return [];
    try {
      return JSON.parse(features);
    } catch {
      return features.split(",").map(f => f.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {isAuthenticated ? <AuthNavbar /> : <Navbar />}
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            All Assistance Plans
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Comprehensive protection for your life, vehicles, property, and business
          </p>
          <div className="inline-block bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> This is a membership-based assistance program, NOT an insurance product.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-green-700 font-medium">Verified & Trusted</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-blue-700 font-medium">10,000+ Members</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-4 py-2">
              <Star className="h-4 w-4 text-purple-600" />
              <span className="text-purple-700 font-medium">4.8/5 Rating</span>
            </div>
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-2">
              <CreditCard className="h-4 w-4 text-orange-600" />
              <span className="text-orange-700 font-medium">Secure Razorpay Payments</span>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-2xl shadow-lg p-4 border">
            <p className="text-sm text-muted-foreground mb-3">Choose your payment frequency:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {PAYMENT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPaymentFrequency(option.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    paymentFrequency === option.value
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <div>{option.label}</div>
                  <div className={`text-xs ${paymentFrequency === option.value ? 'text-white/80' : 'text-slate-400'}`}>
                    {option.discount}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("all")}
            >
              All Plans
            </Button>
            {categories.map(cat => {
              const config = CATEGORY_CONFIG[cat];
              const Icon = config.icon;
              const count = groupedPlans[cat]?.length || 0;
              if (count === 0) return null;
              return (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {config.name}
                  <Badge variant="secondary" className="ml-1">{count}</Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800 p-6 pt-12 flex flex-col gap-3">
                <Skeleton className="h-6 w-40 bg-slate-700" />
                <Skeleton className="h-4 w-full bg-slate-700" />
                <Skeleton className="h-10 w-28 bg-slate-700 mt-2" />
                <Skeleton className="h-6 w-32 bg-slate-700" />
                <div className="space-y-2 mt-2">
                  {[1,2,3,4,5].map(j => <Skeleton key={j} className="h-4 w-full bg-slate-700" />)}
                </div>
                <Skeleton className="h-10 w-full bg-slate-700 mt-4 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No plans available in this category yet.</p>
          </div>
        ) : (
          <>
            {activeCategory === "all" ? (
              <div className="space-y-12">
                {categories.map(cat => {
                  const catPlans = groupedPlans[cat] || [];
                  if (catPlans.length === 0) return null;
                  const config = CATEGORY_CONFIG[cat];
                  const Icon = config.icon;
                  
                  return (
                    <section key={cat}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`p-2 rounded-lg ${config.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">{config.name}</h2>
                          <p className="text-sm text-muted-foreground">{config.description}</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {catPlans.map((plan: any) => (
                          <PlanCard key={plan.id} plan={plan} parseFeatures={parseFeatures} paymentFrequency={paymentFrequency} isAuthenticated={isAuthenticated} currentPlanCode={membership?.planType} />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlans.map((plan: any) => (
                  <PlanCard key={plan.id} plan={plan} parseFeatures={parseFeatures} paymentFrequency={paymentFrequency} isAuthenticated={isAuthenticated} currentPlanCode={membership?.planType} />
                ))}
              </div>
            )}
          </>
        )}

        {addOns.length > 0 && (
          <section className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Enhance Your Protection</h2>
              <p className="text-muted-foreground mb-2">Add extra benefits to any plan — selectable at checkout.</p>
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                ✓ Select add-ons while choosing your plan
              </Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {addOns.slice(0, 8).map((addon: any) => {
                const benefitDisplay = addon.benefitAmount >= 100000
                  ? `₹${(addon.benefitAmount / 100000).toFixed(1)}L`
                  : addon.benefitAmount >= 1000
                    ? `₹${(addon.benefitAmount / 1000).toFixed(0)}K`
                    : `₹${addon.benefitAmount}`;
                return (
                  <div key={addon.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-slate-900 text-sm leading-tight">{addon.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{addon.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-lg font-bold text-primary">₹{addon.price}</span>
                        <span className="text-xs text-muted-foreground">/year</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500">Benefit up to</p>
                        <p className="text-sm font-bold text-green-700">{benefitDisplay}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {addOns.length > 8 && (
              <p className="text-center text-sm text-muted-foreground mt-4">+{addOns.length - 8} more add-ons available during checkout</p>
            )}
            <p className="text-center text-xs text-muted-foreground mt-6">
              Add-ons can be selected on the payment page when you choose a plan.
            </p>
          </section>
        )}

        <div className="mt-16 text-center">
          <Card className="inline-block max-w-xl">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-2">Need a Custom Plan?</h3>
              <p className="text-muted-foreground mb-4">
                For corporate bulk enrollments or custom requirements, contact our team
              </p>
              <Link href="/contact">
                <Button>Contact Sales Team</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
          <p className="text-xs text-slate-500 leading-relaxed max-w-3xl mx-auto">
            *Terms and Conditions apply. All plans are subject to waiting period, co-payment, fair usage policy, and other terms as mentioned in the membership agreement. 
            Prices shown are exclusive of applicable taxes (18% GST will be added at checkout). Monthly and quarterly payments include additional service charges. 
            Raksha Assist is a membership-based emergency assistance program and is NOT an insurance product. 
            Benefits are subject to verification and approval. Pre-existing conditions may have separate waiting periods. 
            For complete terms, visit our <a href="/terms" className="text-primary underline">Terms & Conditions</a> page.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function PlanCard({ plan, parseFeatures, paymentFrequency, isAuthenticated, currentPlanCode }: { plan: any; parseFeatures: (f: string | null) => string[]; paymentFrequency: PaymentFrequency; isAuthenticated?: boolean; currentPlanCode?: string }) {
  const features = parseFeatures(plan.features);
  const yearlyPrice = plan.subscriptionPeriod === 'monthly' ? plan.price * 12 : plan.price;
  const isCurrentPlan = currentPlanCode === plan.planCategory || currentPlanCode === plan.planCode;
  
  const getDisplayPrice = () => {
    switch (paymentFrequency) {
      case "monthly":
        return plan.monthlyPrice || Math.round(yearlyPrice / 12 * 1.05);
      case "quarterly":
        return plan.quarterlyPrice || Math.round(yearlyPrice / 4 * 1.03);
      case "halfYearly":
        return plan.halfYearlyPrice || Math.round(yearlyPrice / 2 * 1.02);
      case "yearly":
      default:
        return yearlyPrice;
    }
  };

  const getPeriodLabel = () => {
    switch (paymentFrequency) {
      case "monthly": return "month";
      case "quarterly": return "3 months";
      case "halfYearly": return "6 months";
      case "yearly": default: return "year";
    }
  };

  const displayPrice = getDisplayPrice();
  const serviceCharge = paymentFrequency !== "yearly" ? plan.serviceChargePercent || 5 : 0;
  
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800 text-white ${plan.isFeatured ? 'ring-2 ring-orange-500 shadow-xl' : 'shadow-lg'}`}>
      {plan.isPopular && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
          Most Popular
        </div>
      )}
      {plan.isFeatured && !plan.isPopular && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Featured
        </div>
      )}
      
      <div className="p-6 pt-12">
        <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
        <p className="text-slate-400 text-sm mb-4">{plan.shortDescription || plan.description}</p>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white">₹{displayPrice?.toLocaleString()}</span>
            <span className="text-slate-400 text-sm">/{getPeriodLabel()}</span>
          </div>
          {paymentFrequency !== "yearly" && (
            <p className="text-slate-500 text-xs mt-1">
              +{serviceCharge}% service charge • ₹{yearlyPrice.toLocaleString()}/year if paid annually
            </p>
          )}
          {paymentFrequency === "yearly" && (
            <p className="text-green-400 text-xs mt-1">Best value - No extra charges!</p>
          )}
        </div>

        <div className="inline-block bg-orange-500/20 border border-orange-500/30 rounded-lg px-3 py-1.5 mb-4">
          <span className="text-orange-400 text-sm font-semibold">
            Up to ₹{plan.coverageAmount >= 100000 ? (plan.coverageAmount / 100000).toFixed(0) + ' Lakh' : plan.coverageAmount.toLocaleString()} Support
          </span>
        </div>

        {(plan.preHospitalizationAmount > 0 || plan.postHospitalizationAmount > 0 || plan.ambulanceCoverAmount > 0) && (
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            {plan.preHospitalizationAmount > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded px-2 py-1.5">
                <p className="text-blue-400 font-medium">Pre-Hospital</p>
                <p className="text-slate-300">₹{(plan.preHospitalizationAmount / 1000).toFixed(0)}K • {plan.preHospitalizationDays}d</p>
              </div>
            )}
            {plan.postHospitalizationAmount > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded px-2 py-1.5">
                <p className="text-green-400 font-medium">Post-Hospital</p>
                <p className="text-slate-300">₹{(plan.postHospitalizationAmount / 1000).toFixed(0)}K • {plan.postHospitalizationDays}d</p>
              </div>
            )}
            {plan.ambulanceCoverAmount > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded px-2 py-1.5">
                <p className="text-red-400 font-medium">Ambulance</p>
                <p className="text-slate-300">₹{plan.ambulanceCoverAmount.toLocaleString()}</p>
              </div>
            )}
            {plan.dayCareAmount > 0 && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded px-2 py-1.5">
                <p className="text-purple-400 font-medium">Day Care</p>
                <p className="text-slate-300">₹{(plan.dayCareAmount / 1000).toFixed(0)}K</p>
              </div>
            )}
          </div>
        )}

        {(plan.renewalBonus > 0 || plan.nclbPercent > 0) && (
          <div className="flex gap-2 mb-4 text-xs">
            {plan.renewalBonus > 0 && (
              <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded">+{plan.renewalBonus}% Renewal Bonus</span>
            )}
            {plan.nclbPercent > 0 && (
              <span className="bg-teal-500/20 text-teal-400 px-2 py-1 rounded">{plan.nclbPercent}% NCLB</span>
            )}
          </div>
        )}

        <p className="text-slate-400 text-sm mb-4">
          {plan.maxMembers > 1 && `${plan.maxMembers} Members • `}
          {plan.waitingPeriodDays === 0 ? 'Zero Wait' : `${plan.waitingPeriodDays} days waiting`}
        </p>

        <ul className="space-y-2 mb-6">
          {features.slice(0, 5).map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-slate-300">{feature}</span>
            </li>
          ))}
          {features.length > 5 && (
            <li className="text-sm text-slate-500">+{features.length - 5} more features</li>
          )}
        </ul>

        {isAuthenticated ? (
          isCurrentPlan ? (
            <Button className="w-full bg-slate-600 text-white font-semibold py-3" disabled>
              Current Plan
            </Button>
          ) : (
            <Link
              href={`/payment?plan=${plan.planCode}&frequency=${paymentFrequency}`}
              onClick={() => persistCheckoutSelection(plan.planCode, paymentFrequency)}
            >
              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3">
                <CreditCard className="mr-2 h-4 w-4" />
                Pay ₹{plan.price.toLocaleString()} Now
              </Button>
            </Link>
          )
        ) : (
          <Link
            href={`/register?plan=${plan.planCode}&frequency=${paymentFrequency}`}
            onClick={() => persistCheckoutSelection(plan.planCode, paymentFrequency)}
          >
            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3">
              Choose Plan
            </Button>
          </Link>
        )}
        <p className="text-[10px] text-slate-500 text-center mt-2 leading-tight">
          *Terms and Conditions apply. Waiting period, co-pay & fair usage limits applicable.
        </p>
      </div>
    </div>
  );
}
