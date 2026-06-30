import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  Shield,
  Users,
  CreditCard,
  AlertTriangle,
  Heart,
  FileText
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_FAQS = [
  {
    id: "d1", category: "general", sortOrder: 1,
    question: "What is Raksha Assist and how is it different from insurance?",
    answer: "Raksha Assist is a membership-based emergency assistance program, NOT an insurance product. Unlike insurance which works on lengthy reimbursement processes, we provide immediate financial support directly to hospitals during medical emergencies. There's no paperwork hassle or waiting for funds."
  },
  {
    id: "d2", category: "coverage", sortOrder: 2,
    question: "What types of emergencies are covered?",
    answer: "We provide assistance for serious accidents requiring hospitalization (more than 24 hours), medical emergencies like heart attacks, strokes, and other life-threatening conditions. The assistance benefits depend on your membership plan - from basic individual plans to comprehensive family and senior citizen plans."
  },
  {
    id: "d3", category: "emergency", sortOrder: 3,
    question: "How does the emergency assistance process work?",
    answer: "When an emergency occurs: 1) Request assistance through our app or helpline, 2) Upload hospital admission proof and doctor's note, 3) Our team verifies with the hospital directly, 4) Once approved (usually within 2 hours), funds are transferred directly to the hospital in stages based on treatment needs."
  },
  {
    id: "d4", category: "plans", sortOrder: 4,
    question: "What are the assistance limits for each plan?",
    answer: "Individual Basic (₹1,499/year): Up to ₹1 Lakh | Individual Standard (₹2,499/year): Up to ₹2 Lakh | Family Basic (₹3,999/year): Up to ₹2 Lakh for family | Family Premium (₹7,999/year): Up to ₹5 Lakh for up to 8 family members. All plans include 24/7 helpline support. We offer 10 plan categories including senior citizen, maternity, vehicle, and business plans."
  },
  {
    id: "d5", category: "membership", sortOrder: 5,
    question: "When does my membership become active?",
    answer: "Your membership is activated immediately after successful payment verification. You will receive a digital membership card instantly. However, there is a standard 30-day waiting period before you can request emergency assistance (except for accident cases which are covered from day one)."
  },
  {
    id: "d6", category: "membership", sortOrder: 6,
    question: "Can I add my family members to my plan?",
    answer: "Yes! Our Family plans allow you to add family members. Family Basic covers up to 4 members, while Family Premium covers up to 8 family members with higher assistance limits and VIP benefits."
  },
  {
    id: "d7", category: "payment", sortOrder: 7,
    question: "What payment methods are accepted?",
    answer: "We accept all major payment methods through our secure Razorpay payment gateway — UPI, credit/debit cards, net banking, and wallets. You can choose monthly, quarterly, half-yearly, or annual payment plans."
  },
  {
    id: "d8", category: "payment", sortOrder: 8,
    question: "Is there a refund policy?",
    answer: "If you cancel within 15 days of purchase and have not made any assistance request, you are eligible for a full refund. After 15 days, pro-rated refunds may apply based on unused period. Contact support at support@rakshaassist.com for refund requests."
  },
  {
    id: "d9", category: "account", sortOrder: 9,
    question: "How do I access my digital membership card?",
    answer: "After successful registration and payment, log in to your dashboard and navigate to 'Membership Card'. You can download or share your digital card as a PDF. The card includes your member ID, plan details, and 24/7 helpline number."
  },
  {
    id: "d10", category: "general", sortOrder: 10,
    question: "Is there a waiting period?",
    answer: "Yes, there is a standard 30-day waiting period for illness-related emergencies. However, accident cases are covered from Day 1 — no waiting period for accidents. Senior citizen and maternity plans may have specific waiting periods mentioned in the plan details."
  }
];

const CATEGORY_CONFIG: Record<string, { name: string; icon: any; color: string }> = {
  general: { name: "General", icon: HelpCircle, color: "bg-blue-100 text-blue-700" },
  membership: { name: "Membership", icon: Users, color: "bg-green-100 text-green-700" },
  coverage: { name: "Protection", icon: Shield, color: "bg-purple-100 text-purple-700" },
  emergency: { name: "Emergency", icon: AlertTriangle, color: "bg-red-100 text-red-700" },
  payment: { name: "Payment", icon: CreditCard, color: "bg-amber-100 text-amber-700" },
  assistance: { name: "Assistance", icon: Heart, color: "bg-pink-100 text-pink-700" },
  plans: { name: "Plans", icon: FileText, color: "bg-indigo-100 text-indigo-700" },
  account: { name: "Account", icon: Users, color: "bg-slate-100 text-slate-700" },
};

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { data: rawFaqs = [], isLoading } = useQuery({
    queryKey: ["public-faqs"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/faqs");
        if (!res.ok) return [];
        const data = await res.json();
        return data;
      } catch {
        return [];
      }
    }
  });

  const faqs = rawFaqs.length > 0 ? rawFaqs : DEFAULT_FAQS;

  const categories = Object.keys(CATEGORY_CONFIG);

  const groupedFaqs = faqs.reduce((acc: Record<string, any[]>, faq: any) => {
    const cat = faq.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {});

  const filteredFaqs = activeCategory === "all"
    ? faqs
    : faqs.filter((f: any) => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about Raksha Assist membership and services
          </p>
        </div>

        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max justify-center">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("all")}
            >
              All Questions
            </Button>
            {categories.map(cat => {
              const config = CATEGORY_CONFIG[cat];
              const Icon = config.icon;
              const count = groupedFaqs[cat]?.length || 0;
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
          <div className="max-w-3xl mx-auto space-y-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="border rounded-lg px-4 py-5 bg-white shadow-sm flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-5 w-20 rounded-full shrink-0" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-20">
            <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No FAQs available yet.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFaqs.map((faq: any, index: number) => {
                const config = CATEGORY_CONFIG[faq.category] || CATEGORY_CONFIG.general;
                return (
                  <AccordionItem 
                    key={faq.id} 
                    value={faq.id}
                    className="border rounded-lg px-4 bg-white shadow-sm"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <div className="flex items-start gap-3">
                        <Badge className={`${config.color} shrink-0 mt-1`}>
                          {config.name}
                        </Badge>
                        <span className="font-medium text-slate-900">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        )}

        <div className="mt-16 max-w-3xl mx-auto">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Still Have Questions?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground mb-6">
                Our support team is here to help you 24/7
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="outline" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Call Support
                </Button>
                <Button variant="outline" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Live Chat
                </Button>
                <Button variant="outline" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Email Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
