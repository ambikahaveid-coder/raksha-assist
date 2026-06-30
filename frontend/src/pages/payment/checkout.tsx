import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { loadRazorpayScript } from "@/hooks/use-integrations";
import { fetchWithCsrf } from "@/lib/csrf";
import {
  Shield,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
  IndianRupee,
  AlertCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  XCircle,
  Plus,
  Gift,
  Download,
  Phone,
  CreditCard,
  Wallet,
  Banknote,
  Users,
  Trash2
} from "lucide-react";

interface AddOnBenefit {
  id: string;
  benefitCode: string;
  name: string;
  description: string;
  price: number;
  benefitAmount: number;
  usageLimit: number;
  validityDays: number;
  isActive: boolean;
}

interface Plan {
  id: string;
  planCode: string;
  name: string;
  price: number;
  monthlyPrice?: number | null;
  quarterlyPrice?: number | null;
  halfYearlyPrice?: number | null;
  serviceChargePercent?: number | null;
  coverageAmount: number;
  maxMembers: number;
  features: string;
  isPopular?: boolean;
  planCategory?: string;
  subscriptionPeriod?: string;
}

interface CoApplicant {
  name: string;
  relationship: string;
  age: number | "";
}

const CO_APPLICANT_PRICING_FALLBACK = [
  { minAge: 0, maxAge: 17, label: "Child", price: 299 },
  { minAge: 18, maxAge: 45, label: "Adult", price: 499 },
  { minAge: 46, maxAge: 60, label: "Middle Age", price: 999 },
  { minAge: 61, maxAge: 999, label: "Senior", price: 1499 },
];

const PAYMENT_FREQUENCY_LABELS = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  halfYearly: "Half-Yearly",
  yearly: "Yearly",
} as const;

function getStoredCheckoutSelection(): { planCode: string | null; frequency: keyof typeof PAYMENT_FREQUENCY_LABELS } {
  try {
    const raw = sessionStorage.getItem("checkoutSelection");
    if (!raw) {
      return { planCode: null, frequency: "yearly" };
    }

    const parsed = JSON.parse(raw) as { planCode?: string; frequency?: string };
    const frequency = parsed.frequency && parsed.frequency in PAYMENT_FREQUENCY_LABELS
      ? parsed.frequency as keyof typeof PAYMENT_FREQUENCY_LABELS
      : "yearly";

    return {
      planCode: parsed.planCode || null,
      frequency,
    };
  } catch {
    return { planCode: null, frequency: "yearly" };
  }
}

function clearStoredCheckoutSelection() {
  sessionStorage.removeItem("checkoutSelection");
}

function getCoApplicantPricingFromBrackets(age: number | "", brackets: typeof CO_APPLICANT_PRICING_FALLBACK) {
  if (age === "" || age < 0) return null;
  return brackets.find(b => age >= b.minAge && age <= b.maxAge) || null;
}

function getPlanInstallmentAmount(plan: Plan | undefined, paymentFrequency: keyof typeof PAYMENT_FREQUENCY_LABELS) {
  if (!plan) return 0;

  const yearlyPrice = plan.price || 0;
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

export default function PaymentCheckout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, membership, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const urlParams = new URLSearchParams(window.location.search);
  const storedSelection = getStoredCheckoutSelection();
  const planFromUrl = urlParams.get("plan") || storedSelection.planCode;
  const frequencyFromUrl = urlParams.get("frequency") || storedSelection.frequency;
  const initialPaymentFrequency = frequencyFromUrl && frequencyFromUrl in PAYMENT_FREQUENCY_LABELS
    ? frequencyFromUrl as keyof typeof PAYMENT_FREQUENCY_LABELS
    : "yearly";
  
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [paymentFrequency] = useState<keyof typeof PAYMENT_FREQUENCY_LABELS>(initialPaymentFrequency);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "verifying" | "success" | "failed">("idle");
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [planValidated, setPlanValidated] = useState(false);
  const cashEligibleRoles = ["employee", "agent", "zone_franchise", "state_franchise", "district_franchise", "city_franchise"];
  const canUseCashPayment = user?.role ? cashEligibleRoles.includes(user.role) : false;
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cash">("online");
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);
  const [coApplicants, setCoApplicants] = useState<CoApplicant[]>([]);

  const { data: allPlans = [], isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: ["checkout-plans"],
    queryFn: async () => {
      const res = await fetch("/api/plans");
      if (!res.ok) return [];
      const data = await res.json();
      return data.filter((p: Plan) => p.price > 0).sort((a: Plan, b: Plan) => a.price - b.price);
    }
  });

  const plans = selectedCategory === "all" 
    ? allPlans 
    : allPlans.filter(p => p.planCategory === selectedCategory);

  useEffect(() => {
    if (selectedPlanId && plans.length > 0) {
      const planInCategory = plans.find(p => p.id === selectedPlanId);
      if (!planInCategory) {
        const popular = plans.find(p => p.isPopular);
        setSelectedPlanId(popular?.id || plans[0]?.id || null);
      }
    }
  }, [selectedCategory, plans]);

  const categories = [
    { id: "all", name: "All Plans" },
    { id: "individual", name: "Medical" },
    { id: "family", name: "Family" },
    { id: "senior", name: "Senior Citizen" },
    { id: "maternity", name: "Maternity" },
    { id: "two_wheeler", name: "Two Wheeler" },
    { id: "car", name: "Car" },
    { id: "commercial_vehicle", name: "Commercial" },
    { id: "home", name: "Home" },
    { id: "business", name: "Business" },
    { id: "travel", name: "Travel" }
  ];

  const [vehicleDetails, setVehicleDetails] = useState({
    vehicleType: "",
    vehicleNumber: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: ""
  });

  const [propertyDetails, setPropertyDetails] = useState({
    propertyType: "",
    propertyAddress: ""
  });

  const [businessDetails, setBusinessDetails] = useState({
    businessName: "",
    businessType: "",
    businessAddress: ""
  });

  useEffect(() => {
    console.log("[Checkout] useEffect triggered", { plansLoading, allPlansCount: allPlans.length, planFromUrl, planValidated });
    
    if (plansLoading) {
      console.log("[Checkout] Still loading plans...");
      return;
    }
    
    if (allPlans.length === 0) {
      console.log("[Checkout] No plans loaded yet");
      return;
    }

    if (!planValidated) {
      if (!planFromUrl) {
        console.log("[Checkout] No plan in URL, redirecting to /plans");
        toast({
          title: "Please select a plan first",
          description: "Choose a plan from our options to continue with payment.",
        });
        setLocation("/plans");
        return;
      }
      
      console.log("[Checkout] Searching for plan with code:", planFromUrl);
      const planByCode = allPlans.find(p => p.planCode.toLowerCase() === planFromUrl.toLowerCase());
      console.log("[Checkout] Found plan:", planByCode?.name || "NOT FOUND");
      
      if (planByCode) {
        console.log("[Checkout] Setting selectedPlanId to:", planByCode.id);
        setSelectedPlanId(planByCode.id);
        setPlanValidated(true);
        sessionStorage.setItem("checkoutSelection", JSON.stringify({
          planCode: planByCode.planCode,
          frequency: paymentFrequency
        }));
      } else {
        console.log("[Checkout] Plan not found, redirecting to /plans");
        toast({
          title: "Plan not found",
          description: "The selected plan is no longer available. Please choose another plan.",
          variant: "destructive",
        });
        setLocation("/plans");
        return;
      }
    }
  }, [plansLoading, allPlans, planFromUrl, planValidated, paymentFrequency, setLocation, toast]);

  const { data: addOnBenefits = [] } = useQuery<AddOnBenefit[]>({
    queryKey: ["addOnBenefits"],
    queryFn: async () => {
      const res = await fetch("/api/add-on-benefits");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const { data: coApplicantPricingData } = useQuery({
    queryKey: ["coApplicantPricing"],
    queryFn: async () => {
      const res = await fetch("/api/co-applicant-pricing");
      if (!res.ok) return null;
      return res.json();
    }
  });

  const coApplicantBrackets = coApplicantPricingData?.brackets || CO_APPLICANT_PRICING_FALLBACK;
  const getCoApplicantPricing = (age: number | "") => getCoApplicantPricingFromBrackets(age, coApplicantBrackets);

  const plan = plans.find(p => p.id === selectedPlanId) || plans[0];
  const isVehiclePlan = plan?.planCategory && ['two_wheeler', 'car', 'commercial_vehicle'].includes(plan.planCategory);
  const isHomePlan = plan?.planCategory === 'home';
  const isBusinessPlan = plan?.planCategory === 'business';
  const isFamilyPlan = plan?.planCategory === 'family';
  const maxCoApplicants = isFamilyPlan ? Math.max((plan?.maxMembers || 1) - 1, 0) : 0;

  const addCoApplicant = () => {
    if (coApplicants.length >= maxCoApplicants) {
      toast({ title: "Maximum members reached", description: `This plan allows up to ${plan?.maxMembers} members (including you).`, variant: "destructive" });
      return;
    }
    setCoApplicants(prev => [...prev, { name: "", relationship: "", age: "" }]);
  };

  const removeCoApplicant = (index: number) => {
    setCoApplicants(prev => prev.filter((_, i) => i !== index));
  };

  const updateCoApplicant = (index: number, field: keyof CoApplicant, value: string | number) => {
    setCoApplicants(prev => prev.map((ca, i) => i === index ? { ...ca, [field]: value } : ca));
  };

  const coApplicantsTotal = coApplicants.reduce((total, ca) => {
    const pricing = getCoApplicantPricing(ca.age);
    return total + (pricing?.price || 0);
  }, 0);

  // Compute vehicle eligibility for blocking payment
  const isVehicleEligible = (() => {
    if (!isVehiclePlan) return true; // Not a vehicle plan, always eligible
    if (!vehicleDetails.vehicleYear) return true; // Year not entered yet, allow proceeding
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - parseInt(vehicleDetails.vehicleYear);
    return vehicleAge >= 0 && vehicleAge <= 15; // Must be 15 years or newer
  })();

  const vehicleDetailsComplete = (() => {
    if (!isVehiclePlan) return true;
    return vehicleDetails.vehicleNumber && vehicleDetails.vehicleMake && vehicleDetails.vehicleModel && vehicleDetails.vehicleYear;
  })();

  const parseFeatures = (features: string | null): string[] => {
    if (!features) return [];
    try {
      return JSON.parse(features);
    } catch {
      return features.split(",").map(f => f.trim());
    }
  };
  const selectedPlanAmount = getPlanInstallmentAmount(plan, paymentFrequency);
  const addOnsTotal = selectedAddOns.reduce((total, addOnId) => {
    const addOn = addOnBenefits.find(a => a.id === addOnId);
    return total + (addOn?.price || 0);
  }, 0) + coApplicantsTotal;
  const baseAmount = selectedPlanAmount + addOnsTotal;
  const amountWithGst = Math.round(baseAmount * 1.18);

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const { data: paymentStatusData } = useQuery({
    queryKey: ["paymentStatus", currentOrderId],
    queryFn: async () => {
      if (!currentOrderId) return null;
      const res = await fetchWithCsrf(`/api/payments/status/${currentOrderId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!currentOrderId && paymentStatus === "verifying",
    refetchInterval: paymentStatus === "verifying" ? 3000 : false
  });

  useEffect(() => {
    if (paymentStatusData) {
      if (paymentStatusData.membershipStatus === "active") {
        setPaymentStatus("success");
        setStatusMessage("Payment verified! Your membership is now active.");
        clearStoredCheckoutSelection();
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      } else if (paymentStatusData.paymentStatus === "failed") {
        setPaymentStatus("failed");
        setStatusMessage(paymentStatusData.message || "Payment failed. Please try again.");
      }
    }
  }, [paymentStatusData, queryClient]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated && paymentStatus === "idle") {
      const currentPath = window.location.pathname + window.location.search;
      setLocation(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [authLoading, isAuthenticated, setLocation, paymentStatus]);

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handlePayment = async () => {
    console.log("[Payment] Pay button clicked!");
    
    // Use allPlans to find the plan (not filtered plans)
    const targetPlan = allPlans.find(p => p.id === selectedPlanId) || allPlans[0];
    
    if (!targetPlan || !targetPlan.planCode) {
      toast({ title: "Please select a plan first", variant: "destructive" });
      return;
    }

    // Vehicle eligibility validation
    if (isVehiclePlan && vehicleDetails.vehicleYear) {
      const currentYear = new Date().getFullYear();
      const vehicleAge = currentYear - parseInt(vehicleDetails.vehicleYear);
      if (vehicleAge > 15) {
        toast({ 
          title: "Vehicle Not Eligible", 
          description: "Vehicles older than 15 years are not eligible for assistance coverage.", 
          variant: "destructive" 
        });
        return;
      }
    }

    // Vehicle details required validation
    if (isVehiclePlan && (!vehicleDetails.vehicleNumber || !vehicleDetails.vehicleMake || !vehicleDetails.vehicleModel || !vehicleDetails.vehicleYear)) {
      toast({ 
        title: "Vehicle Details Required", 
        description: "Please fill in all vehicle details before proceeding.", 
        variant: "destructive" 
      });
      return;
    }
    
    toast({ title: "Processing...", description: "Connecting to payment gateway" });
    
    setProcessing(true);
    
    try {
      const razorpayReady = await loadRazorpayScript();
      if (!razorpayReady || !window.Razorpay) {
        toast({
          title: "Payment system failed",
          description: "Razorpay could not be loaded. Please refresh and try again.",
          variant: "destructive"
        });
        setProcessing(false);
        return;
      }

      await createOrderAndPayWithPlan(targetPlan);
    } catch (error: any) {
      console.error("[Payment] Failed before opening checkout:", error);
      setProcessing(false);
      setPaymentStatus("idle");
      toast({ title: error?.message || "Payment failed", variant: "destructive" });
    }
  };

  const createOrderAndPayWithPlan = async (targetPlan: Plan) => {
    try {
      console.log("[Payment] Creating order for plan:", targetPlan.planCode);
      
      const coApplicantsData = coApplicants.filter(ca => ca.name && ca.age !== "").map(ca => ({
        name: ca.name,
        relationship: ca.relationship,
        age: ca.age,
        price: getCoApplicantPricing(ca.age)?.price || 0,
        ageCategory: getCoApplicantPricing(ca.age)?.label || ""
      }));

      const res = await fetchWithCsrf("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: targetPlan.planCode,
          paymentFrequency,
          addOnIds: selectedAddOns,
          coApplicants: coApplicantsData.length > 0 ? coApplicantsData : undefined,
          termsAgreedAt: new Date().toISOString(),
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create order");
      }
      
      const orderData = await res.json();
      console.log("[Payment] Order created:", orderData.orderId);
      setCurrentOrderId(orderData.orderId);

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Raksha Assist",
        description: `${targetPlan.name} Membership`,
        order_id: orderData.orderId,
        prefill: orderData.prefill,
        theme: { color: "#dc2626" },
        handler: async (response: any) => {
          console.log("[Payment] Payment successful, verifying...");
          setPaymentStatus("verifying");
          setStatusMessage("Verifying your payment...");
          
          const verifyRes = await fetchWithCsrf("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }),
          });
          
          if (verifyRes.ok) {
            const result = await verifyRes.json();
            setPaymentStatus("success");
            setStatusMessage(result.message || "Payment verified! Your membership is now active.");
            clearStoredCheckoutSelection();
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              window.location.href = "/dashboard";
            }, 2000);
          } else {
            setPaymentStatus("failed");
            const error = await verifyRes.json().catch(() => ({}));
            setStatusMessage(error.message || "Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            console.log("[Payment] Modal dismissed");
            setProcessing(false);
            setPaymentStatus("idle");
            toast({ title: "Payment cancelled", variant: "destructive" });
          }
        }
      };

      console.log("[Payment] Opening Razorpay popup...");
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        console.error("[Payment] Payment failed:", response.error);
        setProcessing(false);
        setPaymentStatus("failed");
        setStatusMessage(response.error.description || "Payment failed");
        toast({ title: "Payment failed", variant: "destructive" });
      });
      rzp.open();
      console.log("[Payment] Razorpay popup opened");
      
    } catch (error: any) {
      console.error("[Payment] Error:", error);
      setProcessing(false);
      setPaymentStatus("idle");
      toast({ title: error.message || "Payment failed", variant: "destructive" });
    }
  };

  const handleRetry = () => {
    setPaymentStatus("idle");
    setCurrentOrderId(null);
    setStatusMessage("");
    setProcessing(false);
  };

  const handleCashPayment = async () => {
    const targetPlan = allPlans.find(p => p.id === selectedPlanId) || allPlans[0];
    
    if (!targetPlan || !targetPlan.planCode) {
      toast({ title: "Please select a plan first", variant: "destructive" });
      return;
    }
    
    setProcessing(true);
    setPaymentStatus("processing");
    setStatusMessage("Creating cash payment request...");
    
    try {
      const cashCoApplicantsData = coApplicants.filter(ca => ca.name && ca.age !== "").map(ca => ({
        name: ca.name,
        relationship: ca.relationship,
        age: ca.age,
        price: getCoApplicantPricing(ca.age)?.price || 0,
        ageCategory: getCoApplicantPricing(ca.age)?.label || ""
      }));

      const res = await fetchWithCsrf("/api/payments/cash-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: targetPlan.planCode,
          paymentFrequency,
          addOnIds: selectedAddOns,
          coApplicants: cashCoApplicantsData.length > 0 ? cashCoApplicantsData : undefined,
          termsAgreedAt: new Date().toISOString(),
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create cash payment request");
      }
      
      const result = await res.json();
      setPaymentStatus("processing");
      setStatusMessage("Cash payment request submitted! Your membership is now in 'Processing' status. It will be activated once the super admin confirms cash has been received and submitted to the company.");
      clearStoredCheckoutSelection();
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 3000);
      
    } catch (error: any) {
      console.error("[Cash Payment] Error:", error);
      setProcessing(false);
      setPaymentStatus("failed");
      setStatusMessage(error.message || "Failed to create cash payment request");
      toast({ title: error.message || "Failed", variant: "destructive" });
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (plansLoading || !planValidated || !plan) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading plan details...</p>
      </div>
    );
  }

  if (paymentStatus === "processing") {
    return (
      <div className="min-h-screen bg-slate-50">
        <AuthNavbar />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-lg">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
                  <Clock className="h-10 w-10 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Cash Payment - Processing</h2>
                <p className="text-muted-foreground mb-4">{statusMessage}</p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-amber-800 text-sm font-medium">
                    Your membership will be activated by the super admin after verifying the cash payment. Please submit the cash to the company/authorized representative.
                  </p>
                </div>
                <Button onClick={() => window.location.href = "/dashboard"} className="w-full">
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (paymentStatus === "verifying") {
    return (
      <div className="min-h-screen bg-slate-50">
        <AuthNavbar />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-lg">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
                  <Clock className="h-10 w-10 text-amber-600 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Under Verification</h2>
                <p className="text-muted-foreground mb-6">{statusMessage}</p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>This usually takes a few seconds...</span>
                </div>
                <p className="mt-6 text-xs text-muted-foreground">
                  Do not close this page. Your membership will be activated automatically once payment is confirmed.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-slate-50">
        <AuthNavbar />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-lg">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
                <p className="text-muted-foreground mb-4">{statusMessage}</p>
                
                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 mb-6 border border-green-200">
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div>
                      <p className="text-xs text-muted-foreground">Plan</p>
                      <p className="font-bold">{plan.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Amount Paid</p>
                      <p className="font-bold text-green-700">₹{amountWithGst.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Coverage</p>
                      <p className="font-bold">₹{(plan?.coverageAmount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Validity</p>
                      <p className="font-bold">1 Year</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4 text-red-600" />
                    <span className="font-bold text-red-700">24/7 Emergency Helpline</span>
                  </div>
                  <p className="text-lg font-bold text-red-800">+91 81437 52025</p>
                  <p className="text-xs text-slate-600 mt-1">Save this number - call anytime for emergency assistance</p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button onClick={() => setLocation("/membership-card")} className="w-full bg-primary" data-testid="button-view-card">
                    <CreditCard className="mr-2 h-4 w-4" /> View & Download Membership Card
                  </Button>
                  <Button variant="outline" onClick={() => setLocation("/dashboard")} data-testid="button-go-dashboard">
                    Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  Your membership is now active. You can download your digital membership card anytime from the dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <div className="min-h-screen bg-slate-50">
        <AuthNavbar />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-lg">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Failed</h2>
                <p className="text-muted-foreground mb-6">{statusMessage}</p>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">Money Deducted?</p>
                      <p className="text-sm text-amber-700">
                        If money was deducted from your account but payment failed, the amount will be automatically 
                        refunded to your account within 5-7 business days. Our team will verify and update you.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
                  <p className="text-sm font-medium text-blue-800">Need Help? Contact Support</p>
                  <a href="tel:+918143752025" className="text-lg font-bold text-blue-600 hover:underline">+91 81437 52025</a>
                </div>

                <div className="flex flex-col gap-3">
                  <Button onClick={handleRetry} className="w-full" data-testid="button-retry-payment">
                    <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                  </Button>
                  <Button variant="outline" onClick={() => setLocation("/dashboard")} data-testid="button-back-dashboard">
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthNavbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Choose Your Plan</h1>
            <p className="text-muted-foreground">Select a membership plan and complete secure payment</p>
          </div>

          {membership && membership.status === "pending_payment" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">Pending Payment</p>
                  <p className="text-sm text-amber-700">You have a pending payment. Complete it to activate your membership.</p>
                </div>
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="min-w-[100px]"
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {plans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No plans available in this category
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {plans.map((p) => (
                <Card 
                  key={p.id}
                  className={`cursor-pointer transition-all border-2 ${
                    selectedPlanId === p.id 
                      ? "border-primary shadow-lg shadow-primary/10" 
                      : "border-transparent hover:border-slate-200"
                  }`}
                  onClick={() => setSelectedPlanId(p.id)}
                  data-testid={`plan-card-${p.id}`}
                >
                  <CardHeader className="pb-2">
                    {p.isPopular && (
                      <Badge className="w-fit mb-2 bg-primary">Most Popular</Badge>
                    )}
                    <CardTitle className="text-lg">{p.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">₹{getPlanInstallmentAmount(p, paymentFrequency).toLocaleString()}</span>
                      <span className="text-muted-foreground text-sm">/{PAYMENT_FREQUENCY_LABELS[paymentFrequency].toLowerCase()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Coverage: ₹{(p.coverageAmount || 0).toLocaleString()} | {p.maxMembers} member{p.maxMembers > 1 ? 's' : ''}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {parseFeatures(p.features).slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add-On Benefits Section */}
          {addOnBenefits.length > 0 && (
            <Card className="border-none shadow-md mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-accent" />
                  Add Extra Protection
                </CardTitle>
                <CardDescription>
                  Enhance your membership with additional benefits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {addOnBenefits.map((addOn) => (
                    <div 
                      key={addOn.id}
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddOns.includes(addOn.id)
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => toggleAddOn(addOn.id)}
                    >
                      <Checkbox 
                        checked={selectedAddOns.includes(addOn.id)}
                        onCheckedChange={() => toggleAddOn(addOn.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-900">{addOn.name}</h4>
                          <Badge variant="secondary" className="bg-accent/10 text-accent">
                            +₹{addOn.price.toLocaleString()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{addOn.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {addOn.benefitCode === 'THIRD_PARTY_ACCIDENT' 
                              ? `${addOn.benefitAmount}% of membership fee` 
                              : `₹${addOn.benefitAmount.toLocaleString()} benefit`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {addOn.validityDays} days validity
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {addOn.usageLimit} use{addOn.usageLimit > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {isFamilyPlan && maxCoApplicants > 0 && (
            <Card className="border-none shadow-md mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Add Co-Applicants (Family Members)
                </CardTitle>
                <CardDescription>
                  Add up to {maxCoApplicants} family member{maxCoApplicants > 1 ? 's' : ''} to your plan. Pricing is based on age.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground bg-slate-50 rounded-lg p-3">
                  {coApplicantBrackets.map((bracket: { label: string; minAge: number; maxAge: number; price: number }) => (
                    <div key={bracket.label} className="text-center">
                      <p className="font-medium text-slate-700">{bracket.label}</p>
                      <p>{bracket.minAge}-{bracket.maxAge === 999 ? '61+' : bracket.maxAge} yrs</p>
                      <p className="font-semibold text-primary">₹{bracket.price.toLocaleString()}/yr</p>
                    </div>
                  ))}
                </div>

                {coApplicants.map((ca, index) => {
                  const pricing = getCoApplicantPricing(ca.age);
                  return (
                    <div key={index} className="border rounded-xl p-4 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Family Member {index + 1}</span>
                        <div className="flex items-center gap-2">
                          {pricing && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              {pricing.label} - ₹{pricing.price.toLocaleString()}/yr
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCoApplicant(index)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-medium text-slate-600">Name</label>
                          <Input
                            type="text"
                            placeholder="Full name"
                            value={ca.name}
                            onChange={(e) => updateCoApplicant(index, "name", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Relationship</label>
                          <Select
                            value={ca.relationship}
                            onValueChange={(val) => updateCoApplicant(index, "relationship", val)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Spouse">Spouse</SelectItem>
                              <SelectItem value="Child">Child</SelectItem>
                              <SelectItem value="Parent">Parent</SelectItem>
                              <SelectItem value="Sibling">Sibling</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Age</label>
                          <Input
                            type="number"
                            placeholder="Age"
                            min={0}
                            max={120}
                            value={ca.age}
                            onChange={(e) => updateCoApplicant(index, "age", e.target.value ? parseInt(e.target.value) : "")}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {coApplicants.length < maxCoApplicants && (
                  <Button
                    variant="outline"
                    onClick={addCoApplicant}
                    className="w-full border-dashed border-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Family Member ({coApplicants.length}/{maxCoApplicants})
                  </Button>
                )}

                {coApplicantsTotal > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t text-sm">
                    <span className="font-medium text-slate-700">Co-Applicant Total</span>
                    <span className="font-semibold text-primary">₹{coApplicantsTotal.toLocaleString()}/{PAYMENT_FREQUENCY_LABELS[paymentFrequency].toLowerCase()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {isVehiclePlan && (
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {plan?.planCategory === 'two_wheeler' ? '🏍️' : plan?.planCategory === 'car' ? '🚗' : '🚛'}
                  Vehicle Details
                </CardTitle>
                <CardDescription>Enter your vehicle details for assistance coverage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Vehicle Type</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded-lg"
                      value={vehicleDetails.vehicleType}
                      onChange={(e) => setVehicleDetails(prev => ({ ...prev, vehicleType: e.target.value }))}
                    >
                      <option value="">Select Type</option>
                      {plan?.planCategory === 'two_wheeler' && (
                        <>
                          <option value="motorcycle">Motorcycle</option>
                          <option value="scooter">Scooter</option>
                          <option value="electric_bike">Electric Bike</option>
                        </>
                      )}
                      {plan?.planCategory === 'car' && (
                        <>
                          <option value="hatchback">Hatchback</option>
                          <option value="sedan">Sedan</option>
                          <option value="suv">SUV</option>
                          <option value="muv">MUV</option>
                        </>
                      )}
                      {plan?.planCategory === 'commercial_vehicle' && (
                        <>
                          <option value="truck">Truck</option>
                          <option value="bus">Bus</option>
                          <option value="tempo">Tempo</option>
                          <option value="van">Van</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Registration Number</label>
                    <input 
                      type="text"
                      placeholder="KA 01 AB 1234"
                      className="w-full mt-1 p-2 border rounded-lg uppercase"
                      value={vehicleDetails.vehicleNumber}
                      onChange={(e) => setVehicleDetails(prev => ({ ...prev, vehicleNumber: e.target.value.toUpperCase() }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Make</label>
                    <input 
                      type="text"
                      placeholder="Honda, TVS, etc."
                      className="w-full mt-1 p-2 border rounded-lg"
                      value={vehicleDetails.vehicleMake}
                      onChange={(e) => setVehicleDetails(prev => ({ ...prev, vehicleMake: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Model</label>
                    <input 
                      type="text"
                      placeholder="Activa, City, etc."
                      className="w-full mt-1 p-2 border rounded-lg"
                      value={vehicleDetails.vehicleModel}
                      onChange={(e) => setVehicleDetails(prev => ({ ...prev, vehicleModel: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Year</label>
                    <input 
                      type="number"
                      placeholder="2023"
                      min="2009"
                      max={new Date().getFullYear()}
                      className="w-full mt-1 p-2 border rounded-lg"
                      value={vehicleDetails.vehicleYear}
                      onChange={(e) => setVehicleDetails(prev => ({ ...prev, vehicleYear: e.target.value }))}
                    />
                  </div>
                </div>
                
                {vehicleDetails.vehicleYear && (
                  <div className="mt-4 space-y-2">
                    {(() => {
                      const currentYear = new Date().getFullYear();
                      const vehicleAge = currentYear - parseInt(vehicleDetails.vehicleYear);
                      const isBumperEligible = vehicleAge <= 5;
                      
                      if (vehicleAge > 15) {
                        return (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-700 text-sm font-medium">Vehicle older than 15 years is not eligible for assistance coverage.</p>
                          </div>
                        );
                      }
                      
                      return (
                        <>
                          {vehicleAge > 10 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <p className="text-amber-700 text-sm">Vehicle is more than 10 years old. Some coverage options may be limited.</p>
                            </div>
                          )}
                          
                          {isBumperEligible ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <span className="text-green-600 text-lg">✓</span>
                                <div>
                                  <p className="text-green-700 text-sm font-medium">Bumper-to-Bumper Coverage Eligible!</p>
                                  <p className="text-green-600 text-xs">Your vehicle qualifies for comprehensive bumper-to-bumper assistance</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                              <p className="text-slate-600 text-sm">Standard coverage applies. Bumper-to-bumper available for vehicles up to 5 years old.</p>
                            </div>
                          )}
                          
                          {vehicleAge <= 2 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-blue-700 text-sm font-medium">🎉 New Vehicle Discount: 10% off on membership fee!</p>
                            </div>
                          )}
                          
                          {vehicleAge > 2 && vehicleAge <= 5 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-blue-700 text-sm font-medium">🎉 Vehicle Discount: 5% off on membership fee!</p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {isHomePlan && (
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🏠 Property Details</CardTitle>
                <CardDescription>Enter your property details for home assistance coverage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Property Type</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-lg"
                    value={propertyDetails.propertyType}
                    onChange={(e) => setPropertyDetails(prev => ({ ...prev, propertyType: e.target.value }))}
                  >
                    <option value="">Select Type</option>
                    <option value="apartment">Apartment</option>
                    <option value="independent_house">Independent House</option>
                    <option value="villa">Villa</option>
                    <option value="row_house">Row House</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Property Address</label>
                  <textarea 
                    placeholder="Enter complete property address"
                    className="w-full mt-1 p-2 border rounded-lg"
                    rows={3}
                    value={propertyDetails.propertyAddress}
                    onChange={(e) => setPropertyDetails(prev => ({ ...prev, propertyAddress: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {isBusinessPlan && (
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🏢 Business Details</CardTitle>
                <CardDescription>Enter your business details for business assistance coverage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Business Name</label>
                  <input 
                    type="text"
                    placeholder="Your business/company name"
                    className="w-full mt-1 p-2 border rounded-lg"
                    value={businessDetails.businessName}
                    onChange={(e) => setBusinessDetails(prev => ({ ...prev, businessName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Business Type</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-lg"
                    value={businessDetails.businessType}
                    onChange={(e) => setBusinessDetails(prev => ({ ...prev, businessType: e.target.value }))}
                  >
                    <option value="">Select Type</option>
                    <option value="retail_shop">Retail Shop</option>
                    <option value="office">Office</option>
                    <option value="restaurant">Restaurant/Cafe</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="manufacturing">Manufacturing Unit</option>
                    <option value="service_center">Service Center</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Business Address</label>
                  <textarea 
                    placeholder="Enter complete business address"
                    className="w-full mt-1 p-2 border rounded-lg"
                    rows={3}
                    value={businessDetails.businessAddress}
                    onChange={(e) => setBusinessDetails(prev => ({ ...prev, businessAddress: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{plan.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Assistance Limit</span>
                <span className="font-medium">₹{(plan.coverageAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Plan Price</span>
                <span className="font-medium">₹{selectedPlanAmount.toLocaleString()} / {PAYMENT_FREQUENCY_LABELS[paymentFrequency].toLowerCase()}</span>
              </div>
              {selectedAddOns.length > 0 && (
                <div className="py-2 border-b">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Add-On Benefits</span>
                    <span className="font-medium">₹{selectedAddOns.reduce((t, id) => t + (addOnBenefits.find(a => a.id === id)?.price || 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="space-y-1 pl-4">
                    {selectedAddOns.map(addOnId => {
                      const addOn = addOnBenefits.find(a => a.id === addOnId);
                      return addOn ? (
                        <div key={addOn.id} className="flex justify-between text-sm text-muted-foreground">
                          <span>• {addOn.name}</span>
                          <span>₹{addOn.price.toLocaleString()}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              {coApplicants.length > 0 && (
                <div className="py-2 border-b">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Co-Applicants ({coApplicants.length})</span>
                    <span className="font-medium">₹{coApplicantsTotal.toLocaleString()}</span>
                  </div>
                  <div className="space-y-1 pl-4">
                    {coApplicants.map((ca, i) => {
                      const pricing = getCoApplicantPricing(ca.age);
                      return (
                        <div key={i} className="flex justify-between text-sm text-muted-foreground">
                          <span>• {ca.name || `Member ${i + 1}`} ({pricing?.label || 'N/A'})</span>
                          <span>₹{(pricing?.price || 0).toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">GST (18%)</span>
                <span className="font-medium">₹{Math.round(baseAmount * 0.18).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-slate-50 rounded-lg px-4">
                <span className="font-bold text-lg">Total Amount</span>
                <span className="font-bold text-2xl text-primary flex items-center">
                  <IndianRupee className="h-5 w-5" />
                  {amountWithGst.toLocaleString()}
                </span>
              </div>

              <div className="pt-4 space-y-4">
                {canUseCashPayment && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Payment Method</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("online")}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          paymentMethod === "online" 
                            ? "border-primary bg-primary/5 text-primary" 
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <CreditCard className="h-5 w-5" />
                        <span className="font-medium">Online Payment</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cash")}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          paymentMethod === "cash" 
                            ? "border-primary bg-primary/5 text-primary" 
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <Banknote className="h-5 w-5" />
                        <span className="font-medium">Cash Payment</span>
                      </button>
                    </div>
                  </div>
                )}

                {paymentMethod === "cash" && canUseCashPayment && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      <strong>Cash Payment:</strong> Your membership will remain in "Processing" status until the super admin confirms cash has been received and submitted to the company. 
                      Submit cash to the company/authorized representative for activation.
                    </p>
                  </div>
                )}

                <Button 
                  onClick={() => {
                    console.log("[Payment] Button onClick triggered, method:", paymentMethod);
                    if (paymentMethod === "cash") {
                      handleCashPayment();
                    } else {
                      handlePayment();
                    }
                  }}
                  disabled={processing || allPlans.length === 0 || !isVehicleEligible || (!!isVehiclePlan && !vehicleDetailsComplete) || !disclaimerAgreed}
                  className="w-full h-14 text-lg"
                  data-testid="button-pay-now"
                  type="button"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : paymentMethod === "cash" ? (
                    <>
                      <Banknote className="mr-2 h-5 w-5" />
                      Request Cash Payment - ₹{amountWithGst.toLocaleString()}
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-5 w-5" />
                      Pay ₹{amountWithGst.toLocaleString()} Securely
                    </>
                  )}
                </Button>
                
                {paymentMethod === "online" && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Secured by Razorpay | 256-bit SSL Encryption</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Important</p>
                <p className="text-sm text-blue-700">
                  Your membership will be activated only after successful payment verification.
                  This usually happens instantly, but may take up to a few minutes in some cases.
                </p>
              </div>
            </div>
          </div>

          {/* Compact Terms Agreement — near pay button */}
          <div className="mt-4 flex items-start gap-3 px-1">
            <Checkbox
              id="disclaimer-agree"
              checked={disclaimerAgreed}
              onCheckedChange={(checked) => setDisclaimerAgreed(checked === true)}
              className="mt-0.5"
            />
            <label htmlFor="disclaimer-agree" className="text-xs text-slate-500 cursor-pointer leading-relaxed">
              I agree to the{" "}
              <a href="/membership-agreement" target="_blank" className="text-primary underline">Membership Agreement</a>,{" "}
              <a href="/terms" target="_blank" className="text-primary underline">Terms & Conditions</a> and{" "}
              <a href="/refund-policy" target="_blank" className="text-primary underline">Refund Policy</a>.
              I understand Raksha Assist is a membership assistance program, not an insurance product.
            </label>
          </div>

          <p className="mt-3 text-[10px] text-slate-400 text-center leading-relaxed">
            Prices inclusive of 18% GST. All plans subject to fair usage policy.
            Jurisdiction: Courts of Bengaluru, Karnataka, India.
          </p>
        </div>
      </main>
    </div>
  );
}

