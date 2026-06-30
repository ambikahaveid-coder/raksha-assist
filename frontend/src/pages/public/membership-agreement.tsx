import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AlertTriangle, Shield, FileText, Clock, IndianRupee, X, CheckCircle2 } from "lucide-react";

export default function MembershipAgreement() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <FileText className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Membership Agreement & Disclaimer
            </h1>
            <p className="text-slate-500 text-sm">Please read carefully before purchasing a membership</p>
            <p className="text-slate-400 text-xs mt-1">Raksha Assist | CIN: U72900TG2024PTC184818</p>
          </div>

          {/* Critical Warning Banner */}
          <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-700 text-lg uppercase tracking-wide mb-2">
                  ⚠️ Critical Disclaimer — Read Before Joining
                </p>
                <p className="text-red-700 font-semibold text-sm leading-relaxed">
                  RAKSHA ASSIST IS A MEMBERSHIP-BASED EMERGENCY ASSISTANCE PROGRAM. IT IS <u>NOT INSURANCE</u>,
                  NOT A TPA (THIRD PARTY ADMINISTRATOR), AND NOT A FINANCIAL GUARANTEE SCHEME.
                  ALL ASSISTANCE IS PROVIDED ON A BEST-EFFORT, DISCRETIONARY BASIS.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">

            {/* Section 1 - What We Are */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-blue-600 px-6 py-4">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" /> 1. What Raksha Assist Is (and Is NOT)
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="font-bold text-green-700 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> What We ARE
                    </p>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li>✓ Membership-based assistance program</li>
                      <li>✓ Emergency coordination service</li>
                      <li>✓ Hospital liaison & cashless facilitation</li>
                      <li>✓ Ambulance & rescue coordination</li>
                      <li>✓ Direct hospital payment assistance</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="font-bold text-red-700 mb-3 flex items-center gap-2">
                      <X className="h-4 w-4" /> What We Are NOT
                    </p>
                    <ul className="space-y-2 text-sm text-red-800">
                      <li>✗ NOT an Insurance Company</li>
                      <li>✗ NOT a TPA (Third Party Admin)</li>
                      <li>✗ NOT IRDA regulated</li>
                      <li>✗ NOT a financial guarantee scheme</li>
                      <li>✗ NOT a Government scheme</li>
                    </ul>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed border-l-4 border-blue-400 pl-4">
                  Raksha Assist operates under the Indian Contract Act, 1872 as a service membership organization.
                  Our assistance is facilitated through our network of partner hospitals and is subject to verification,
                  fund availability, and fair usage policies.
                </p>
              </div>
            </div>

            {/* Section 2 - Waiting Period */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-amber-500 px-6 py-4">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" /> 2. Waiting Period — Important
                </h2>
              </div>
              <div className="p-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <p className="font-bold text-amber-800 mb-3">⏰ Waiting periods apply from membership activation date:</p>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between bg-white rounded-lg p-2 border">
                        <span className="text-slate-600">Accident / Trauma</span>
                        <span className="font-bold text-green-600">Immediate</span>
                      </div>
                      <div className="flex justify-between bg-white rounded-lg p-2 border">
                        <span className="text-slate-600">General Illness</span>
                        <span className="font-bold text-amber-600">30 Days</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between bg-white rounded-lg p-2 border">
                        <span className="text-slate-600">Major Surgery</span>
                        <span className="font-bold text-amber-600">90 Days</span>
                      </div>
                      <div className="flex justify-between bg-white rounded-lg p-2 border">
                        <span className="text-slate-600">Pre-existing Conditions</span>
                        <span className="font-bold text-red-600">1 Year</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Claims made during the waiting period will not be eligible for assistance.
                  The waiting period is strictly enforced from the date of successful membership activation (not payment date).
                </p>
              </div>
            </div>

            {/* Section 3 - Exclusions */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-red-600 px-6 py-4">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <X className="h-5 w-5" /> 3. What Is NOT Covered (Exclusions)
                </h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  {[
                    "Pre-existing diseases (within 1 year)",
                    "Self-inflicted injuries / suicide attempts",
                    "Alcohol / substance abuse related injuries",
                    "Cosmetic / aesthetic procedures",
                    "Dental treatments (non-accident)",
                    "Maternity & childbirth (standard plans)",
                    "Infertility treatments",
                    "Non-network hospital claims",
                    "OPD consultations & medicines",
                    "War, terrorism, or nuclear events",
                    "Experimental / unproven treatments",
                    "Criminal / intentional acts",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 bg-red-50 rounded-lg p-3 border border-red-100">
                      <X className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4 - Co-payment */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-purple-600 px-6 py-4">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" /> 4. Co-payment & Coverage Limits
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="font-bold text-purple-800 mb-3">Coverage is subject to:</p>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 font-bold mt-0.5">•</span>
                      <span><strong>Plan Limit:</strong> Maximum assistance is capped at your selected plan's coverage amount</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 font-bold mt-0.5">•</span>
                      <span><strong>Co-payment:</strong> Member may be required to pay a portion of hospital bills directly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 font-bold mt-0.5">•</span>
                      <span><strong>Network Hospitals Only:</strong> Cashless assistance is available only at Raksha Assist partner hospitals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 font-bold mt-0.5">•</span>
                      <span><strong>Verification Required:</strong> All claims are subject to verification by our team before assistance is released</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 font-bold mt-0.5">•</span>
                      <span><strong>Fund Availability:</strong> Assistance is subject to fund availability at the time of claim</span>
                    </li>
                  </ul>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Raksha Assist reserves the right to reduce, modify, or deny assistance based on verification findings,
                  misrepresentation of facts, or breach of membership terms.
                </p>
              </div>
            </div>

            {/* Section 5 - Refund Policy */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-700 px-6 py-4">
                <h2 className="text-white font-bold text-lg">5. Refund & Cancellation Policy</h2>
              </div>
              <div className="p-6 space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3 border">
                  <span className="font-bold text-slate-800 shrink-0">Within 7 days:</span>
                  <span>Full refund if no claim has been made and membership not yet activated</span>
                </div>
                <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3 border">
                  <span className="font-bold text-slate-800 shrink-0">After activation:</span>
                  <span>No refund once membership is activated and benefits accessed</span>
                </div>
                <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3 border">
                  <span className="font-bold text-slate-800 shrink-0">Processing fee:</span>
                  <span>₹199 non-refundable processing fee deducted from all refunds</span>
                </div>
                <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3 border">
                  <span className="font-bold text-slate-800 shrink-0">GST:</span>
                  <span>18% GST paid is non-refundable as per Government regulations</span>
                </div>
              </div>
            </div>

            {/* Section 6 - Jurisdiction */}
            <div className="bg-slate-800 rounded-2xl p-6 text-white">
              <h2 className="font-bold text-lg mb-4">6. Governing Law & Jurisdiction</h2>
              <div className="space-y-2 text-slate-300 text-sm leading-relaxed">
                <p>
                  This agreement is governed by the laws of India. Any disputes arising from this membership shall be
                  subject to the <strong className="text-white">exclusive jurisdiction of the courts in Bengaluru, Karnataka, India</strong>.
                </p>
                <p>
                  By purchasing a membership, you confirm that you have read, understood, and agreed to all terms,
                  conditions, exclusions, and disclaimers mentioned in this agreement and in our
                  Terms & Conditions document.
                </p>
                <p className="text-slate-400 text-xs pt-2 border-t border-slate-600">
                  Raksha Assist | CIN: U72900TG2024PTC184818 | Registered Office: 2nd & 3rd Floor, 3rd Block,
                  12th Main, Bashyam Circle, Rajajinagar, Bengaluru - 560 010 | Helpline: +91 81437 52025
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
