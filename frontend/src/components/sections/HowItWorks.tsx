import { UserPlus, FileText, CreditCard, Ambulance, Phone, Shield, CheckCircle, Clock, Heart, Building2 } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Join as Member",
    description: "Register with your mobile number, choose a plan (starting from ₹1,499/year), and add your family members. Membership activates within 24 hours.",
    highlight: "Just ₹4/day"
  },
  {
    icon: Phone,
    title: "Emergency? Call Us",
    description: "Accident happened? Call our 24/7 SOS helpline or press the SOS button in our app. Our emergency team responds within 15 minutes to guide you.",
    highlight: "24/7 Support"
  },
  {
    icon: Building2,
    title: "Hospital Admission",
    description: "Get admitted to any of our 500+ network hospitals across India. Share hospital admission details through our app - no paperwork needed from your side.",
    highlight: "500+ Hospitals"
  },
  {
    icon: CheckCircle,
    title: "Quick Verification",
    description: "Our team directly contacts the hospital to verify admission. No claim forms, no documents chase. We handle everything within 2-4 hours.",
    highlight: "No Claim Forms"
  },
  {
    icon: CreditCard,
    title: "Direct Hospital Payment",
    description: "We pay the hospital directly in stages: ₹20,000 immediately, ₹1 Lakh within 24 hours, up to ₹5 Lakhs based on your plan. You focus on recovery, not money.",
    highlight: "Up to ₹5 Lakhs"
  },
  {
    icon: Heart,
    title: "Recovery Support",
    description: "Our care team follows up on your recovery. Need more funds? We release in stages. Discharged? We ensure all bills are settled with the hospital.",
    highlight: "Complete Care"
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Simple 6-Step Process
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4">
            How Raksha Assist Works
          </h2>
          <p className="text-muted-foreground text-lg">
            Unlike insurance that takes months and rejects claims, we pay hospitals directly within 24-48 hours. Here's exactly how it works:
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative group animate-in fade-in slide-in-from-bottom-6 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/30 hover:-translate-y-2 transition-all duration-300 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full -z-0"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                      <step.icon className="h-7 w-7 text-primary group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary/10 text-sm font-bold text-secondary">
                      {index + 1}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                  
                  <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full mb-3">
                    {step.highlight}
                  </span>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-6 duration-700" style={{ animationDelay: '600ms' }}>
          <div className="inline-flex items-center gap-6 bg-primary/5 px-8 py-4 rounded-2xl">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24-48 hrs</div>
              <div className="text-xs text-muted-foreground">Payment Time</div>
            </div>
            <div className="h-10 w-px bg-primary/20"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0%</div>
              <div className="text-xs text-muted-foreground">Rejection Rate</div>
            </div>
            <div className="h-10 w-px bg-primary/20"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-xs text-muted-foreground">Network Hospitals</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}