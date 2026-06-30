import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UserPlus, Clock, Phone, Building2, ClipboardCheck, CreditCard, CheckCircle, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const steps = [
  {
    icon: UserPlus,
    title: "Join as Member",
    time: "5 minutes",
    color: "bg-blue-500",
    description: "Register with your mobile number and choose a membership plan. Add family members if you have a family plan.",
    points: [
      { text: "Monthly plans from ₹149/month", color: "text-blue-600" },
      { text: "6-Month plans from ₹899", color: "text-green-600" },
      { text: "Yearly plans from ₹1,499/year", color: "text-blue-600" },
      { text: "Family plans cover up to 8 members", color: "text-green-600" }
    ]
  },
  {
    icon: Clock,
    title: "Wait for Activation",
    time: "15-30 days",
    color: "bg-purple-500",
    description: "Your membership activates after the waiting period. This protects against fraud and ensures genuine emergencies.",
    points: [
      { text: "Monthly: 30 days for medical, 60 days for accidents", color: "text-purple-600" },
      { text: "6-Month: 15 days for medical, 30 days for accidents", color: "text-green-600" },
      { text: "Yearly: 15 days for medical, Day 1 for accidents!", color: "text-purple-600" },
      { text: "", color: "" }
    ]
  },
  {
    icon: Phone,
    title: "Emergency? Call SOS",
    time: "15 minutes",
    color: "bg-emerald-500",
    description: "When an accident or medical emergency happens, call our 24/7 SOS helpline immediately or use the app SOS button.",
    points: [
      { text: "24/7 emergency helpline: +91 81437 52025", color: "text-emerald-600" },
      { text: "In-app SOS button for instant help", color: "text-green-600" },
      { text: "Response within 15 minutes", color: "text-emerald-600" },
      { text: "Available in Telugu, Hindi, English", color: "text-green-600" }
    ]
  },
  {
    icon: Building2,
    title: "Hospital Admission",
    time: "Immediate",
    color: "bg-orange-500",
    description: "Get admitted to any of our 500+ network hospitals. Share admission details through our app or call center.",
    points: [
      { text: "500+ network hospitals across India", color: "text-orange-600" },
      { text: "Share hospital name, patient details", color: "text-green-600" },
      { text: "No paperwork from your side", color: "text-orange-600" },
      { text: "We contact hospital directly", color: "text-green-600" }
    ]
  },
  {
    icon: ClipboardCheck,
    title: "Quick Verification",
    time: "2-4 hours",
    color: "bg-amber-400",
    description: "Our team verifies the emergency with the hospital. We check admission, diagnosis, and treatment plan.",
    points: [
      { text: "Direct hospital verification", color: "text-amber-600" },
      { text: "Medical team reviews case", color: "text-green-600" },
      { text: "No request forms to fill", color: "text-amber-600" },
      { text: "Verification in 2-4 hours", color: "text-green-600" }
    ]
  },
  {
    icon: CreditCard,
    title: "Direct Hospital Payment",
    time: "24-48 hours",
    color: "bg-rose-500",
    description: "We pay the hospital directly in stages. You focus on recovery, not arranging money.",
    points: [
      { text: "₹20,000 immediate release", color: "text-rose-600" },
      { text: "₹1 Lakh within 24 hours", color: "text-green-600" },
      { text: "Up to ₹5 Lakhs based on plan", color: "text-rose-600" },
      { text: "Direct bank transfer to hospital", color: "text-green-600" }
    ]
  }
];

const planComparison = [
  {
    type: "Monthly",
    price: "₹149-₹1,799/month",
    support: "₹25K-₹50K",
    perCase: "100% of support limit",
    medicalWait: "30 days",
    accidentWait: "60 days",
    bestFor: "Try before committing"
  },
  {
    type: "6-Month",
    price: "₹789-₹9,449",
    support: "₹75K-₹1.5L",
    perCase: "53% of support limit",
    medicalWait: "15 days",
    accidentWait: "30 days",
    bestFor: "Balance of value & flexibility"
  },
  {
    type: "Yearly",
    price: "₹1,499-₹17,999",
    support: "₹1L-₹5L",
    perCase: "50% of support limit",
    medicalWait: "15 days",
    accidentWait: "Day 1!",
    bestFor: "Best value. Immediate accident cover",
    highlight: true
  }
];

const covered = [
  "Road accidents (bike, car, bus, train)",
  "Workplace accidents",
  "Medical emergencies (heart attack, stroke)",
  "Emergency surgeries",
  "ICU/CCU treatment",
  "Accidental injuries",
  "Emergency hospitalization",
  "Ambulance coordination"
];

const notCovered = [
  "Pre-existing conditions (NEVER)",
  "Routine health checkups",
  "Elective/cosmetic surgeries",
  "Maternity & childbirth",
  "Dental treatment",
  "Outpatient treatment (OPD)",
  "Self-inflicted injuries",
  "Injuries under alcohol/drugs"
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <main>
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-8">
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4">
                How Raksha Assist Works
              </h1>
              <p className="text-muted-foreground text-base md:text-lg">
                Unlike traditional processes that take months, we pay hospitals directly within 24-48 hours.
              </p>
            </div>

            <div className="max-w-3xl mx-auto mb-10 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 text-orange-500 mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-orange-700 text-sm mb-1">Important: NOT Insurance</h3>
                  <p className="text-xs text-slate-700">
                    Raksha Assist is a MEMBERSHIP-BASED assistance program. We provide financial support directly to hospitals during emergencies. This is NOT an insurance policy. Pre-existing conditions are NEVER covered.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-slate-900 text-center mb-8">6-Step Process</h2>

            <div className="max-w-4xl mx-auto space-y-4">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className="flex flex-col md:flex-row bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className={`${step.color} p-6 md:p-8 flex flex-col items-center justify-center md:w-44 flex-shrink-0`}>
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3">
                      <step.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="text-white font-bold text-xl">Step {index + 1}</div>
                    <div className="text-white/80 text-xs mt-1">{step.time}</div>
                  </div>
                  
                  <div className="p-5 md:p-6 flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {step.points.filter(p => p.text).map((point, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className={`h-4 w-4 ${point.color} flex-shrink-0 mt-0.5`} />
                          <span className="text-xs text-slate-600">{point.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-slate-50">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-10">Plan Comparison</h2>
            
            <div className="max-w-5xl mx-auto overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Plan Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Support Limit</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Per Case*</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Medical Wait</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Accident Wait</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {planComparison.map((plan, index) => (
                    <tr key={index} className={`border-b border-slate-100 ${plan.highlight ? 'bg-green-50' : ''}`}>
                      <td className="py-4 px-4 font-medium text-slate-900">{plan.type}</td>
                      <td className="py-4 px-4 text-slate-700">{plan.price}</td>
                      <td className="py-4 px-4 text-slate-700">{plan.support}</td>
                      <td className="py-4 px-4 text-slate-700">{plan.perCase}</td>
                      <td className="py-4 px-4 text-slate-700">{plan.medicalWait}</td>
                      <td className="py-4 px-4">
                        {plan.accidentWait === "Day 1!" ? (
                          <span className="text-green-600 font-semibold">{plan.accidentWait}</span>
                        ) : (
                          <span className="text-slate-700">{plan.accidentWait}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-600 text-xs">{plan.bestFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              * Per case limit is the maximum amount payable for a single emergency. Total support is the maximum for entire membership period.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-10">What's Covered vs Not Covered</h2>
            
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-green-700 mb-4">
                  <CheckCircle className="h-5 w-5" />
                  What's Covered
                </h3>
                <ul className="space-y-3">
                  {covered.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-red-700 mb-4">
                  <X className="h-5 w-5" />
                  NOT Covered
                </h3>
                <ul className="space-y-3">
                  {notCovered.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                      <X className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-slate-50">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 text-center mb-8">Important Conditions*</h2>
            
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-slate-900 mb-3">Waiting Periods</h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li>* Waiting period starts from payment date</li>
                  <li>* Resets if payment fails or lapses</li>
                  <li>* Different for medical vs accident</li>
                </ul>

                <h4 className="font-bold text-slate-900 mt-6 mb-3">Verification</h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li>* All requests require hospital verification</li>
                  <li>* First 48-hour requests: Enhanced verification</li>
                  <li>* Pre-existing determined by our medical team</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-3">Assistance Limits</h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li>* Per-request limit applies to each emergency</li>
                  <li>* Monthly: Max 1 request per month</li>
                  <li>* 6-Month: Max 2-3 requests total</li>
                </ul>

                <h4 className="font-bold text-slate-900 mt-6 mb-3">Refunds</h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li>* 6-Month plans: Non-refundable</li>
                  <li>* Yearly: 7-day window only (no assistance used)</li>
                  <li>* Monthly: 3-month minimum commitment</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-emerald-50">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Ready to Get Protected?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join 10,000+ families who trust Raksha Assist for emergency protection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/plans">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                  View All Plans <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-slate-300">
                  Join Now
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8 text-xs text-muted-foreground">
              <Link href="/terms-conditions" className="hover:text-primary">Terms & Conditions</Link>
              <span>|</span>
              <Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
              <span>|</span>
              <Link href="/privacy-policy#refund" className="hover:text-primary">Refund Policy</Link>
              <span>|</span>
              <Link href="/faq" className="hover:text-primary">FAQ</Link>
            </div>

            <p className="text-[10px] text-muted-foreground mt-6 max-w-2xl mx-auto">
              * Subject to terms and conditions. Bengaluru, Karnataka jurisdiction. NOT an insurance product.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
