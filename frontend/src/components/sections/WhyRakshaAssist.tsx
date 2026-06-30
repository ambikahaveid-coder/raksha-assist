import { useState } from "react";
import {
  AlertTriangle, HeartPulse, Users, ShieldCheck,
  IndianRupee, Clock, CheckCircle, XCircle, ArrowRight, Ambulance,
  Building2, FileWarning, BadgeCheck, ChevronRight, Activity,
  ShieldAlert, Wallet, UserX, Siren, Hospital, HandCoins
} from "lucide-react";

const comparisonData = [
  {
    category: "Response Time",
    traditional: "15-45 Days Processing",
    raksha: "Target: Within 2 Hours",
    icon: Clock
  },
  {
    category: "Common Rejections",
    traditional: "Multiple Rejection Reasons",
    raksha: "Direct Hospital Assistance",
    icon: XCircle
  },
  {
    category: "Paperwork",
    traditional: "Extensive Documentation",
    raksha: "Admission Slip Based",
    icon: FileWarning
  },
  {
    category: "Payment Flow",
    traditional: "Reimbursement Model",
    raksha: "Hospital-Direct NEFT",
    icon: IndianRupee
  },
  {
    category: "Middlemen",
    traditional: "TPA Involvement",
    raksha: "No TPA, Direct Coordination",
    icon: Building2
  },
  {
    category: "Emergency Help",
    traditional: "Call Center Based",
    raksha: "SOS + Ambulance + Support",
    icon: Ambulance
  }
];

export function WhyRakshaAssist() {
  const [activeTab, setActiveTab] = useState<"problem" | "comparison" | "benefits">("problem");

  return (
    <section id="why-raksha" className="py-16 md:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-red-100">
            <Activity className="h-4 w-4" />
            Understanding India's Emergency Healthcare Gap
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-slate-900 mb-4">
            Why India Needs <span className="text-primary">Raksha Assist</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            Every year, lakhs of Indian families face medical emergencies without adequate financial support. 
            Raksha Assist was built to bridge this critical gap.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
          {[
            {
              icon: Siren,
              label: "Road Accidents",
              desc: "India has among the highest road accident rates in the world",
              color: "from-red-500 to-red-600"
            },
            {
              icon: Wallet,
              label: "Out-of-Pocket Burden",
              desc: "A large share of medical costs comes directly from family savings",
              color: "from-orange-500 to-orange-600"
            },
            {
              icon: UserX,
              label: "Claim Difficulties",
              desc: "Many families struggle with complex claim processes during emergencies",
              color: "from-purple-500 to-purple-600"
            },
            {
              icon: Users,
              label: "Coverage Gap",
              desc: "Crores of Indians lack any form of emergency medical support",
              color: "from-blue-500 to-blue-600"
            }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 text-center h-full">
              <div className={`inline-flex p-2.5 md:p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-3 md:mb-4`}>
                <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <p className="text-sm md:text-base font-bold text-slate-900 mb-1">{stat.label}</p>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{stat.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-100 rounded-xl p-1 gap-1">
            {[
              { id: "problem" as const, label: "The Problem", icon: HeartPulse },
              { id: "comparison" as const, label: "Our Approach", icon: ShieldCheck },
              { id: "benefits" as const, label: "Member Benefits", icon: BadgeCheck }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 md:px-5 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-white text-primary shadow-md"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {activeTab === "problem" && (
          <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-red-50 p-2.5 rounded-xl">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">The Emergency Crisis</h3>
                </div>
                <div className="space-y-5">
                  {[
                    {
                      title: "Road Accidents",
                      desc: "India sees lakhs of road accidents every year. Families are suddenly hit with massive hospital bills they never planned for.",
                      icon: Siren,
                      bg: "bg-red-50",
                      iconColor: "text-red-600"
                    },
                    {
                      title: "Young Lives at Risk",
                      desc: "A large percentage of accident victims are working-age adults (18-45 years) — the breadwinners of their families.",
                      icon: Users,
                      bg: "bg-orange-50",
                      iconColor: "text-orange-600"
                    },
                    {
                      title: "Rural Areas Hit Hardest",
                      desc: "Most accidents happen in rural and semi-urban areas where emergency medical infrastructure is limited.",
                      icon: Hospital,
                      bg: "bg-amber-50",
                      iconColor: "text-amber-600"
                    }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className={`${item.bg} p-2.5 rounded-xl h-fit group-hover:scale-110 transition-transform flex-shrink-0`}>
                        <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-50 p-2.5 rounded-xl">
                    <Wallet className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">The Financial Impact</h3>
                </div>
                <div className="space-y-5">
                  {[
                    {
                      title: "Savings Wiped Out",
                      desc: "A single medical emergency can wipe out years of savings. Many families borrow money or sell assets to pay hospital bills.",
                      icon: IndianRupee,
                      bg: "bg-purple-50",
                      iconColor: "text-purple-600"
                    },
                    {
                      title: "Complex Claim Processes",
                      desc: "Traditional claim processes involve extensive paperwork, long waiting periods, and multiple conditions that lead to delays or rejections.",
                      icon: FileWarning,
                      bg: "bg-rose-50",
                      iconColor: "text-rose-600"
                    },
                    {
                      title: "Delayed Treatment",
                      desc: "When families can't arrange funds quickly, critical treatment gets delayed. In emergencies, every minute matters.",
                      icon: Clock,
                      bg: "bg-blue-50",
                      iconColor: "text-blue-600"
                    }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className={`${item.bg} p-2.5 rounded-xl h-fit group-hover:scale-110 transition-transform flex-shrink-0`}>
                        <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 text-white">
              <div className="text-center mb-6">
                <h3 className="text-xl md:text-2xl font-bold mb-2">The Reality of Medical Emergencies in India</h3>
                <p className="text-slate-300 text-sm">Common challenges families face during health crises</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                  { icon: ShieldAlert, label: "No emergency fund ready when accident happens", color: "text-red-400" },
                  { icon: Clock, label: "Treatment delayed due to payment arrangement", color: "text-orange-400" },
                  { icon: FileWarning, label: "Complex paperwork during the worst moments", color: "text-yellow-400" },
                  { icon: HandCoins, label: "Families forced to borrow at high interest", color: "text-purple-400" }
                ].map((item, i) => (
                  <div key={i} className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <item.icon className={`h-8 w-8 ${item.color} mx-auto mb-3`} />
                    <p className="text-xs text-slate-300 leading-relaxed">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 rounded-2xl p-6 md:p-8 border border-green-100 text-center">
              <ShieldCheck className="h-10 w-10 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                This is Exactly Why Raksha Assist Exists
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                We built Raksha Assist so that when an emergency strikes, your family doesn't have to worry about 
                arranging money, dealing with paperwork, or waiting for approvals. 
                We coordinate directly with the hospital to ensure treatment is not delayed.
              </p>
            </div>
          </div>
        )}

        {activeTab === "comparison" && (
          <div className="animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                How <span className="text-primary">Raksha Assist</span> is Different
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We are NOT an insurance company or TPA. We are a membership-based emergency assistance coordination platform. 
                Here's how our approach works differently.
              </p>
            </div>

            <div className="grid gap-4 md:gap-5 max-w-4xl mx-auto">
              {comparisonData.map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="grid grid-cols-[1fr_auto_1fr] items-stretch">
                    <div className="p-4 md:p-6 bg-red-50/50 border-r border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-[10px] uppercase tracking-wider font-bold text-red-500">Traditional Process</span>
                      </div>
                      <p className="text-sm md:text-base font-semibold text-red-700">{item.traditional}</p>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center px-3 md:px-6 bg-slate-50">
                      <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 mb-1">
                        <item.icon className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
                      </div>
                      <span className="text-[10px] md:text-xs font-bold text-slate-500 text-center leading-tight">{item.category}</span>
                    </div>
                    
                    <div className="p-4 md:p-6 bg-green-50/50 border-l border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-[10px] uppercase tracking-wider font-bold text-green-600">Raksha Assist</span>
                      </div>
                      <p className="text-sm md:text-base font-semibold text-green-700">{item.raksha}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 md:mt-10 bg-gradient-to-br from-primary/5 to-blue-50 rounded-2xl p-6 md:p-8 border border-primary/10 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-4">The Raksha Assist Advantage</h4>
                  <ul className="space-y-3">
                    {[
                      "No waiting period for accident emergencies",
                      "No complex claim process — direct hospital coordination",
                      "Single admission slip is enough to get started",
                      "Hospital-direct NEFT payment, no middlemen",
                      "24/7 SOS with ambulance coordination",
                      "Stage-wise fund release for treatment continuity"
                    ].map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700 font-medium">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                  <div className="text-center">
                    <div className="inline-flex p-4 bg-green-50 rounded-full mb-4">
                      <ShieldCheck className="h-10 w-10 text-green-600" />
                    </div>
                    <h5 className="text-lg font-bold text-slate-900 mb-2">Our Commitment</h5>
                    <div className="text-5xl font-black text-green-600 mb-2">2 Hrs</div>
                    <p className="text-sm text-muted-foreground">
                      Target response time for verified emergency assistance requests with hospital-direct payment
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "benefits" && (
          <div className="animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                What You Get with <span className="text-primary">Raksha Assist</span> Membership
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every membership provides real, tangible benefits designed for Indian families
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-10">
              {[
                {
                  icon: Ambulance,
                  title: "Emergency Ambulance",
                  desc: "Instant ambulance dispatch to your location via SOS button with GPS tracking",
                  highlight: "Within Minutes",
                  iconBg: "bg-red-50",
                  iconColor: "text-red-600",
                  badgeBg: "bg-red-50",
                  badgeText: "text-red-700"
                },
                {
                  icon: Building2,
                  title: "Hospital-Direct Payment",
                  desc: "We coordinate directly with the hospital via NEFT/IMPS. No cash handling, no reimbursement delays",
                  highlight: "Direct Coordination",
                  iconBg: "bg-blue-50",
                  iconColor: "text-blue-600",
                  badgeBg: "bg-blue-50",
                  badgeText: "text-blue-700"
                },
                {
                  icon: IndianRupee,
                  title: "Financial Assistance",
                  desc: "Membership-based financial assistance for emergency medical treatment, surgery, and hospitalization",
                  highlight: "₹1L to ₹10L Plans",
                  iconBg: "bg-green-50",
                  iconColor: "text-green-600",
                  badgeBg: "bg-green-50",
                  badgeText: "text-green-700"
                },
                {
                  icon: Clock,
                  title: "Fast Response",
                  desc: "Emergency verification and coordination targeted within 2 hours, not days or weeks",
                  highlight: "Target: 2 Hours",
                  iconBg: "bg-orange-50",
                  iconColor: "text-orange-600",
                  badgeBg: "bg-orange-50",
                  badgeText: "text-orange-700"
                },
                {
                  icon: Users,
                  title: "Family Coverage",
                  desc: "Cover your entire family under one membership — spouse, children, and parents",
                  highlight: "Up to 6 Members",
                  iconBg: "bg-purple-50",
                  iconColor: "text-purple-600",
                  badgeBg: "bg-purple-50",
                  badgeText: "text-purple-700"
                },
                {
                  icon: HeartPulse,
                  title: "Senior Citizen Plans",
                  desc: "Special plans for parents and seniors with enhanced assistance and priority support",
                  highlight: "60+ Years",
                  iconBg: "bg-teal-50",
                  iconColor: "text-teal-600",
                  badgeBg: "bg-teal-50",
                  badgeText: "text-teal-700"
                }
              ].map((benefit, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className={`inline-flex p-3 rounded-xl ${benefit.iconBg} mb-4 group-hover:scale-110 transition-transform`}>
                    <benefit.icon className={`h-6 w-6 ${benefit.iconColor}`} />
                  </div>
                  <div className={`inline-block text-xs font-bold px-2 py-1 rounded-md ${benefit.badgeBg} ${benefit.badgeText} mb-3`}>
                    {benefit.highlight}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-6 md:p-10 text-white text-center">
              <h4 className="text-2xl md:text-3xl font-bold mb-4">
                Protect Your Family Today
              </h4>
              <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
                Starting at just <span className="font-bold text-white">&#8377;1,499/year</span> — 
                less than <span className="font-bold text-white">&#8377;4/day</span> for emergency medical assistance coordination
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/plans"
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
                >
                  View All Plans
                  <ArrowRight className="h-5 w-5" />
                </a>
                <a
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-white/20 transition-all border border-white/20"
                >
                  Become a Member
                  <ChevronRight className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="mt-8 bg-amber-50 rounded-2xl p-6 border border-amber-100">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-amber-800 mb-1">Important Disclosure</h5>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    Raksha Assist is a <strong>membership-based emergency assistance coordination platform</strong>. 
                    It is NOT insurance, NOT a TPA, and NOT a financial guarantee program. 
                    Services are provided on a best-effort basis under the Indian Contract Act, 1872. 
                    All assistance is subject to verification, terms, and conditions of membership.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}