import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, ArrowRight, AlertCircle, Download } from "lucide-react";
import { Link } from "wouter";

interface Plan {
  id: string;
  name: string;
  planCode: string;
  price: number;
  originalPrice: number;
  coverageAmount: number;
  shortDescription: string;
  features: string;
  isPopular: boolean;
  isFeatured: boolean;
  planCategory: string;
  subscriptionPeriod: string;
}

const fallbackPlans: Plan[] = [
  {
    id: "fallback-1",
    name: "Individual Basic",
    planCode: "IND_BASIC",
    price: 1499,
    originalPrice: 1999,
    coverageAmount: 100000,
    shortDescription: "Basic individual protection.",
    features: '["Individual Support", "Accident Assistance", "Up to ₹1 Lakh Support", "24/7 Helpline", "Digital Membership Card"]',
    isPopular: false,
    isFeatured: false,
    planCategory: "individual",
    subscriptionPeriod: "yearly"
  },
  {
    id: "fallback-2",
    name: "Individual Standard",
    planCode: "IND_STD",
    price: 2499,
    originalPrice: 3499,
    coverageAmount: 200000,
    shortDescription: "Complete individual protection.",
    features: '["Individual Support", "Accident & Medical Emergency", "Up to ₹2 Lakh Support", "Priority Verification", "24/7 Helpline", "Digital Membership Card"]',
    isPopular: true,
    isFeatured: false,
    planCategory: "individual",
    subscriptionPeriod: "yearly"
  },
  {
    id: "fallback-3",
    name: "Family Basic",
    planCode: "FAM_BASIC",
    price: 3999,
    originalPrice: 4999,
    coverageAmount: 200000,
    shortDescription: "Emergency support for your family.",
    features: '["Family Support (up to 4)", "All Medical Emergencies", "Up to ₹2 Lakh Support", "Priority Support", "24/7 Helpline", "Digital Membership Card"]',
    isPopular: false,
    isFeatured: true,
    planCategory: "family",
    subscriptionPeriod: "yearly"
  },
  {
    id: "fallback-4",
    name: "Family Premium",
    planCode: "FAM_PREM",
    price: 7999,
    originalPrice: 9999,
    coverageAmount: 500000,
    shortDescription: "Maximum support for entire family.",
    features: '["Covers up to 8 Family Members", "Up to ₹5 Lakh Support", "All Emergency Types", "VIP Hospital Network", "Zero Processing Fees", "Priority 24/7 Support"]',
    isPopular: false,
    isFeatured: true,
    planCategory: "family",
    subscriptionPeriod: "yearly"
  }
];

const handleDownloadPdf = (planCode: string, planName: string) => {
  const link = document.createElement('a');
  link.href = `/api/brochure/${planCode}`;
  link.download = `${planName.replace(/\s+/g, '_')}_Brochure.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export function Plans() {
  const { data: allPlans = [], isLoading, isError } = useQuery<Plan[]>({
    queryKey: ["public-plans"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/plans");
        if (!res.ok) return fallbackPlans;
        const data = await res.json();
        return data.length > 0 ? data : fallbackPlans;
      } catch (error) {
        return fallbackPlans;
      }
    }
  });

  const getDisplayPlans = (): Plan[] => {
    if (allPlans.length === 0) return fallbackPlans;
    
    const popularFeatured = allPlans.filter(p => p.isPopular || p.isFeatured);
    if (popularFeatured.length >= 4) {
      return popularFeatured.slice(0, 4);
    }
    
    if (popularFeatured.length > 0) {
      const remaining = allPlans.filter(p => !p.isPopular && !p.isFeatured);
      return [...popularFeatured, ...remaining].slice(0, 4);
    }
    
    return allPlans.slice(0, 4);
  };

  const plans = getDisplayPlans();

  const getPeriodText = (period: string) => {
    switch(period) {
      case "monthly": return "/month";
      case "six_month": return "/6 months";
      case "yearly": return "/year";
      default: return "/year";
    }
  };

  const parseFeatures = (features: string | null | undefined): string[] => {
    if (!features) return ["Support included", "24/7 Assistance"];
    try {
      return JSON.parse(features);
    } catch {
      return features.split(",").map(f => f.trim());
    }
  };

  return (
    <section id="plans" className="py-16 md:py-20 lg:py-24 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4">
            Membership Plans
          </h2>
          <p className="text-muted-foreground text-lg">
            Choose the level of assistance that fits your life. Transparent pricing.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <span className="text-green-600 text-lg">✓</span>
            <p className="text-xs text-green-800 font-medium">All plans include 24/7 emergency support · Instant hospital coordination · No paperwork</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-3xl p-8 border border-slate-200 bg-slate-50 flex flex-col gap-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-4 w-full" />
                <div className="space-y-3 flex-1">
                  {[1,2,3,4].map(j => <Skeleton key={j} className="h-4 w-full" />)}
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-2 text-amber-500" />
            <p>Unable to load plans. Please try again later.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
            {plans.map((plan) => {
              const features = parseFeatures(plan.features);
              const isHighlight = plan.isPopular;
              const isDark = plan.isFeatured && plan.planCategory === "family" && plan.price >= 3000;
              
              return (
                <div 
                  key={plan.id} 
                  className={`rounded-3xl p-8 relative flex flex-col border ${
                    isDark 
                      ? 'bg-slate-900 text-white border-slate-800' 
                      : isHighlight 
                        ? 'bg-white border-primary/20 shadow-xl shadow-primary/5 ring-1 ring-primary md:-mt-8 md:mb-8' 
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {isHighlight && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        ₹{plan.price.toLocaleString()}
                      </span>
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-muted-foreground'}`}>
                        {getPeriodText(plan.subscriptionPeriod)}
                      </span>
                    </div>
                    {plan.originalPrice > plan.price && (
                      <p className={`text-sm line-through ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        ₹{plan.originalPrice.toLocaleString()}
                      </p>
                    )}
                    <p className={`mt-4 text-sm ${isDark ? 'text-slate-300' : 'text-muted-foreground'}`}>
                      {plan.shortDescription || `Up to ₹${(plan.coverageAmount / 100000).toFixed(1)}L support`}
                    </p>
                  </div>

                  <ul className="space-y-4 mb-8 flex-1">
                    {features.slice(0, 6).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <Check className={`h-5 w-5 flex-shrink-0 ${isDark ? 'text-accent' : 'text-primary'}`} />
                        <span className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-3">
                    <Link href="/register">
                      <Button 
                        className={`w-full ${isDark 
                          ? 'bg-white text-slate-900 hover:bg-slate-100' 
                          : isHighlight 
                            ? 'bg-primary hover:bg-primary/90' 
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        Join Now
                      </Button>
                    </Link>
                    <Button 
                      variant="outline"
                      size="sm"
                      className={`w-full gap-2 ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : ''}`}
                      onClick={() => handleDownloadPdf(plan.planCode, plan.name)}
                    >
                      <Download className="h-4 w-4" />
                      Download Brochure
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/plans">
            <Button variant="outline" size="lg" className="gap-2">
              View All Plans
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
