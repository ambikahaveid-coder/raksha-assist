import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, Lock, Loader2, FileText, AlertTriangle, Eye, Database, Users, Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Policy {
  id: string;
  title: string;
  type: string;
  content: string;
  version: string;
}

export default function PrivacyPolicy() {
  const { data: policy, isLoading } = useQuery<Policy>({
    queryKey: ["/api/policies/privacy_policy"],
    queryFn: async () => {
      const res = await fetch("/api/policies/privacy_policy");
      if (!res.ok) return null;
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="bg-primary px-6 py-8 text-center text-white">
              <Lock className="h-10 w-10 mx-auto mb-3 opacity-90" />
              <h1 className="text-2xl font-bold mb-1">Privacy Policy</h1>
              <p className="text-white/80 text-sm">Raksha Assist - Emergency Medical Assistance</p>
              <p className="text-white/60 text-xs mt-1">Last Updated: February 2026</p>
            </div>

            <div className="p-6 md:p-8">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : policy?.content ? (
                <div className="max-w-none text-sm [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-slate-800 [&_h1]:mb-4 [&_h1]:mt-0 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-slate-700 [&_h2]:mb-2 [&_h2]:mt-5 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-slate-700 [&_h3]:mb-2 [&_h3]:mt-4 [&_p]:text-slate-600 [&_p]:leading-relaxed [&_p]:mb-3 [&_ul]:space-y-1 [&_ul]:mb-3 [&_ul]:pl-4 [&_li]:text-slate-600 [&_li]:text-sm [&_strong]:text-slate-700 [&_strong]:font-medium">
                  <ReactMarkdown>{policy.content}</ReactMarkdown>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <AlertBox 
                      icon={<Shield className="h-4 w-4" />}
                      title="Your Privacy Matters"
                      text="We protect your personal information and privacy rights."
                      color="blue"
                    />
                    <AlertBox 
                      icon={<AlertTriangle className="h-4 w-4" />}
                      title="Important Disclosure"
                      text="Raksha Assist is NOT an insurance product."
                      color="amber"
                    />
                  </div>

                  <Section icon={<FileText className="h-4 w-4" />} title="1. About Raksha Assist">
                    <p className="text-slate-600 text-sm leading-relaxed mb-3">
                      Hospital-direct financial support during accidents and medical emergencies.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <InfoCard text="Individual Plans - Up to Rs. 5L" />
                      <InfoCard text="Family Plans - Up to Rs. 10L" />
                      <InfoCard text="Senior Citizen Plans" />
                      <InfoCard text="Maternity Plans" />
                    </div>
                  </Section>

                  <Section icon={<Database className="h-4 w-4" />} title="2. Information We Collect">
                    <div className="space-y-4">
                      <InfoGroup title="Personal Details">
                        <BulletList items={["Name, DOB, Gender", "Mobile & Email", "Address & Pincode", "Aadhar (encrypted)"]} />
                      </InfoGroup>
                      <InfoGroup title="Health Information">
                        <BulletList items={["Blood Group", "Pre-existing conditions", "Known allergies"]} />
                      </InfoGroup>
                      <InfoGroup title="Payment Information">
                        <BulletList items={["Transaction via Razorpay", "Payment receipts"]} />
                      </InfoGroup>
                    </div>
                  </Section>

                  <Section icon={<Eye className="h-4 w-4" />} title="3. How We Use Your Information">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <UseCard title="Membership" desc="Process applications" />
                      <UseCard title="Emergency" desc="Hospital coordination" />
                      <UseCard title="Assistance" desc="Verify & process" />
                      <UseCard title="Communication" desc="Reminders & alerts" />
                      <UseCard title="Support" desc="Query resolution" />
                      <UseCard title="Compliance" desc="Legal requirements" />
                    </div>
                  </Section>

                  <Section icon={<Users className="h-4 w-4" />} title="4. Information Sharing">
                    <BulletList items={[
                      "Network Hospitals - Treatment authorization",
                      "Razorpay - Payment processing",
                      "Franchise Partners - Limited access",
                      "Government - When required by law"
                    ]} />
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-green-700 text-xs flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        We do NOT sell your data to third parties.
                      </p>
                    </div>
                  </Section>

                  <Section icon={<Lock className="h-4 w-4" />} title="5. Data Security">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <SecurityCard title="AES-256" desc="Data encryption" />
                      <SecurityCard title="SSL/TLS" desc="Secure transfer" />
                      <SecurityCard title="Bcrypt" desc="Password hashing" />
                      <SecurityCard title="Cookies" desc="Secure sessions" />
                      <SecurityCard title="RBAC" desc="Access controls" />
                      <SecurityCard title="Audits" desc="Security testing" />
                    </div>
                  </Section>

                  <Section title="6. Data Retention">
                    <div className="space-y-2">
                      <RetentionRow label="Active Members" value="Membership + 7 years" />
                      <RetentionRow label="Payment Records" value="10 years" />
                      <RetentionRow label="Assistance Records" value="Permanent" />
                      <RetentionRow label="Support Logs" value="2 years" />
                    </div>
                  </Section>

                  <Section title="7. Your Rights">
                    <div className="grid grid-cols-3 gap-2">
                      <RightCard title="Access" />
                      <RightCard title="Correction" />
                      <RightCard title="Deletion" />
                      <RightCard title="Portability" />
                      <RightCard title="Opt-out" />
                      <RightCard title="Complain" />
                    </div>
                  </Section>

                  <Section title="8. Cookies">
                    <div className="space-y-2">
                      <CookieRow type="Essential" desc="Login & security" required />
                      <CookieRow type="Analytics" desc="Usage tracking" />
                      <CookieRow type="Visitor" desc="Daily counts" />
                    </div>
                  </Section>

                  <Section title="9. Contact Us">
                    <div className="bg-slate-50 p-4 rounded-lg border">
                      <p className="font-medium text-slate-800 text-sm">Mindwhile IT Solutions Pvt. Ltd.</p>
                      <p className="text-slate-500 text-xs mt-1">2nd & 3rd Floor, 3rd Block, 12th Main, Bashyam Circle, Rajajinagar, Bengaluru - 560 010, India</p>
                      <div className="mt-3 pt-3 border-t space-y-1.5">
                        <p className="text-slate-600 text-xs flex items-center gap-2">
                          <Phone className="h-3 w-3 text-primary" /> +91 81437 52025 (24/7)
                        </p>
                        <p className="text-slate-600 text-xs flex items-center gap-2">
                          <Mail className="h-3 w-3 text-primary" /> support@rakshaassist.com
                        </p>
                        <p className="text-slate-600 text-xs flex items-center gap-2">
                          <Mail className="h-3 w-3 text-primary" /> privacy@rakshaassist.com
                        </p>
                      </div>
                    </div>
                  </Section>

                  <div className="bg-slate-800 text-white p-4 rounded-lg text-center">
                    <p className="text-xs">
                      <strong>Jurisdiction:</strong> Courts of Bengaluru, Karnataka, India
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function AlertBox({ icon, title, text, color }: { icon: React.ReactNode; title: string; text: string; color: "blue" | "amber" }) {
  const colors = {
    blue: "bg-blue-50 border-blue-100 text-blue-800",
    amber: "bg-amber-50 border-amber-100 text-amber-800"
  };
  return (
    <div className={`p-3 rounded-lg border ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="font-medium text-xs">{title}</span>
      </div>
      <p className="text-xs opacity-80">{text}</p>
    </div>
  );
}

function Section({ icon, title, children }: { icon?: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="pt-4 border-t border-slate-100 first:pt-0 first:border-t-0">
      <h2 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
        {icon && <span className="text-primary">{icon}</span>}
        {title}
      </h2>
      {children}
    </section>
  );
}

function InfoCard({ text }: { text: string }) {
  return (
    <div className="bg-slate-50 px-3 py-2 rounded-lg text-xs text-slate-600">{text}</div>
  );
}

function InfoGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-medium text-slate-700 text-xs mb-2">{title}</h3>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function UseCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-blue-50/50 p-2.5 rounded-lg text-center">
      <p className="font-medium text-slate-800 text-xs">{title}</p>
      <p className="text-slate-500 text-[10px]">{desc}</p>
    </div>
  );
}

function SecurityCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-green-50/50 p-2.5 rounded-lg text-center">
      <p className="font-medium text-slate-800 text-xs">{title}</p>
      <p className="text-slate-500 text-[10px]">{desc}</p>
    </div>
  );
}

function RetentionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg">
      <span className="text-slate-700 text-xs">{label}</span>
      <span className="text-slate-500 text-xs">{value}</span>
    </div>
  );
}

function RightCard({ title }: { title: string }) {
  return (
    <div className="bg-slate-50 py-2 px-3 rounded-lg text-center">
      <span className="text-slate-700 text-xs">{title}</span>
    </div>
  );
}

function CookieRow({ type, desc, required }: { type: string; desc: string; required?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${required ? 'bg-green-500' : 'bg-slate-400'}`}></span>
        <span className="text-slate-700 text-xs">{type}</span>
        <span className="text-slate-400 text-xs">- {desc}</span>
      </div>
      {required && <span className="text-[10px] text-green-600 font-medium">Required</span>}
    </div>
  );
}
