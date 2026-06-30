import { ShieldAlert, CreditCard, Building2 } from "lucide-react";

export function Trust() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white border-y border-slate-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-6">
              Why We Are Different
            </h2>
            <div className="space-y-8">
              <div className="flex gap-4 group animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: '100ms' }}>
                <div className="bg-red-50 p-3 rounded-xl h-fit group-hover:bg-red-100 group-hover:scale-110 transition-all duration-300">
                  <ShieldAlert className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Not an Insurance Company</h3>
                  <p className="text-muted-foreground">
                    We are a membership community. Unlike insurance which involves lengthy paperwork and delays, we focus on <span className="font-semibold text-slate-900">immediate financial assistance</span> when you need to be admitted.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 group animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: '200ms' }}>
                <div className="bg-blue-50 p-3 rounded-xl h-fit group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Hospital-Direct Payments</h3>
                  <p className="text-muted-foreground">
                    We pay the hospital directly. We don't give cash to users. This ensures the funds are used strictly for medical treatment and builds trust with our partner hospitals.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 group animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: '300ms' }}>
                <div className="bg-green-50 p-3 rounded-xl h-fit group-hover:bg-green-100 group-hover:scale-110 transition-all duration-300">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Stage-wise Disbursement</h3>
                  <p className="text-muted-foreground">
                    Funds are released in stages (e.g., ₹20,000 for admission, ₹1 Lakh for surgery) to manage costs effectively while ensuring treatment isn't stopped.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 animate-in fade-in slide-in-from-right-8 duration-700">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Transparent Assistance Process</h3>
            <div className="space-y-6 relative">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary to-primary/20"></div>
              
              {[
                { title: "Upload Proof", desc: "Admission slip & Doctor's note", status: "User" },
                { title: "Verification", desc: "We call the hospital to confirm", status: "Admin" },
                { title: "Approval", desc: "Funds authorized within 2 hours", status: "System" },
                { title: "Transfer", desc: "Direct NEFT/IMPS to Hospital Account", status: "Bank" }
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="relative flex items-center gap-4 pl-8 animate-in fade-in slide-in-from-right-4 duration-500"
                  style={{ animationDelay: `${(i + 1) * 150}ms` }}
                >
                  <div className="absolute left-0 w-6 h-6 rounded-full bg-white border-4 border-primary z-10 shadow-md"></div>
                  <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/20 transition-all duration-300">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-primary/60 bg-primary/5 px-2 py-0.5 rounded">{item.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}