import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Clock, Building2 } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/medical_professionals_assisting_patient_in_modern_hospital.png";

export function Hero() {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 lg:pt-44 lg:pb-28 overflow-hidden bg-slate-50">
      <div className="container mx-auto px-4 relative z-10">
        <div className="bg-blue-700 text-white text-center py-2 px-4 rounded-lg mb-6 text-xs md:text-sm flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span><strong>Trusted by 10,000+ families</strong> — Instant hospital assistance, 24/7 emergency support, zero paperwork</span>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-primary text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              24/7 Emergency Support Active
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-slate-900 leading-tight">
              Emergency <br />
              <span className="text-primary">Assistance Platform</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              We provide emergency assistance and coordination services during accidents and medical emergencies. Our membership program connects you with partner hospitals for immediate support on a best-effort basis.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-primary hover:bg-primary/90 text-white" data-testid="button-hero-register">
                  Get Protected Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/plans">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base bg-white border-secondary text-secondary hover:bg-secondary hover:text-white transition-all" data-testid="button-hero-plans">
                  View Membership Plans
                </Button>
              </Link>
            </div>

            <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                  <span>500+</span>
                </div>
                <p className="text-xs text-muted-foreground">Partner Hospitals</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <Building2 className="h-5 w-5 text-accent" />
                  <span>24/7</span>
                </div>
                <p className="text-xs text-muted-foreground">Coordination</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <Clock className="h-5 w-5 text-accent" />
                  <span>Quick</span>
                </div>
                <p className="text-xs text-muted-foreground">Response</p>
              </div>
            </div>
          </div>

          <div className="relative lg:h-[600px] animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-3xl transform rotate-3 scale-105"></div>
            <img 
              src={heroImage} 
              alt="Medical Team Assistance" 
              className="relative rounded-3xl shadow-2xl w-full h-full object-cover border-4 border-white"
            />
            
            {/* Floating Badge */}
            <div className="absolute bottom-8 left-8 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-4 max-w-xs animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">24/7 Support Active</p>
                <p className="text-xs text-muted-foreground">Emergency coordination available round the clock.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}