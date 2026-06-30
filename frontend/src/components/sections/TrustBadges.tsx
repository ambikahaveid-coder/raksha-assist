import { Shield, Award, Lock, CheckCircle, BadgeCheck, Verified } from "lucide-react";

export function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: "ISO 27001",
      subtitle: "Certified",
      description: "Information Security",
      color: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      icon: Award,
      title: "MSME",
      subtitle: "Registered",
      description: "Govt. of India",
      color: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      icon: Lock,
      title: "256-bit SSL",
      subtitle: "Encrypted",
      description: "Secure Payments",
      color: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      icon: CheckCircle,
      title: "RBI Compliant",
      subtitle: "Payment Gateway",
      description: "Razorpay Partner",
      color: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    {
      icon: BadgeCheck,
      title: "Startup India",
      subtitle: "Recognized",
      description: "DPIIT Certified",
      color: "bg-teal-50",
      iconColor: "text-teal-600"
    },
    {
      icon: Verified,
      title: "GST Registered",
      subtitle: "Verified",
      description: "Tax Compliant",
      color: "bg-rose-50",
      iconColor: "text-rose-600"
    }
  ];

  return (
    <section className="py-12 bg-gradient-to-b from-slate-50 to-white border-y border-slate-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Trusted & Certified</h3>
          <p className="text-muted-foreground text-sm">Your security and trust is our priority</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {badges.map((badge, index) => (
            <div 
              key={index}
              className="flex flex-col items-center p-4 rounded-xl border border-slate-100 bg-white hover:shadow-md transition-all duration-300 group"
            >
              <div className={`${badge.color} p-3 rounded-full mb-3 group-hover:scale-110 transition-transform`}>
                <badge.icon className={`h-6 w-6 ${badge.iconColor}`} />
              </div>
              <span className="font-bold text-slate-900 text-sm text-center">{badge.title}</span>
              <span className="text-xs text-primary font-medium">{badge.subtitle}</span>
              <span className="text-xs text-muted-foreground mt-1 text-center">{badge.description}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>10,000+ Active Members</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>500+ Network Hospitals</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>24/7 Emergency Support</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Pan-India Network</span>
          </div>
        </div>
      </div>
    </section>
  );
}
