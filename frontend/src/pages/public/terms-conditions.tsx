import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, Scale, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Policy {
  id: string;
  title: string;
  type: string;
  content: string;
  version: string;
}

export default function TermsConditions() {
  const { data: policy, isLoading } = useQuery<Policy>({
    queryKey: ["/api/policies/terms_conditions"],
    queryFn: async () => {
      const res = await fetch("/api/policies/terms_conditions");
      if (!res.ok) return null;
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-sm border p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Scale className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                {policy?.title || "Terms & Conditions"}
              </h1>
              <p className="text-muted-foreground">Version {policy?.version || "1.0"}</p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : policy?.content ? (
              <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-strong:text-slate-800 prose-table:text-sm prose-table:border prose-table:border-slate-200 prose-th:bg-slate-100 prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2 prose-td:border-t prose-td:border-slate-200 prose-hr:border-slate-200">
                <ReactMarkdown>{policy.content}</ReactMarkdown>
              </div>
            ) : (
              <div className="prose prose-slate max-w-none space-y-8">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-red-700 uppercase m-0">Important Notice</p>
                      <p className="text-red-600 text-sm m-0 mt-1">
                        RAKSHA ASSIST IS A MEMBERSHIP-BASED EMERGENCY ASSISTANCE PROGRAM. IT IS NOT INSURANCE.
                      </p>
                    </div>
                  </div>
                </div>

                <section>
                  <h2 className="text-xl font-bold text-slate-900">1. Service Definition</h2>
                  <ul className="list-disc ml-6 space-y-2 text-slate-600">
                    <li><strong>Not Insurance:</strong> Raksha Assist is NOT an insurance company. We provide membership-based financial assistance directly to hospitals during emergencies.</li>
                    <li><strong>Discretionary Benefits:</strong> All assistance is provided at the sole discretion of Raksha Assist based on verification and fund availability.</li>
                    <li><strong>Support Limits:</strong> Maximum assistance is capped at your plan limit.</li>
                    <li><strong>Accidents Only:</strong> Assistance applies ONLY to accidents and medical emergencies.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-slate-900">2. Eligibility</h2>
                  <ul className="list-disc ml-6 space-y-2 text-slate-600">
                    <li>Members must be Indian residents</li>
                    <li>Age between 18-70 years for individual plans</li>
                    <li>Family plans cover up to 8 members</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-slate-900">3. Payment Terms</h2>
                  <ul className="list-disc ml-6 space-y-2 text-slate-600">
                    <li>Annual membership fees are non-refundable</li>
                    <li>Renewal must be completed before expiry</li>
                    <li>Grace period of 15 days for renewal</li>
                  </ul>
                </section>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
