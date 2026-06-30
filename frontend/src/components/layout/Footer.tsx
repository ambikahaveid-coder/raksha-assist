import { Shield, FileText, Phone, Facebook, Twitter, Instagram, Linkedin, Youtube, MapPin, Eye, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import logoImg from "@/assets/logo.png";

export function SimpleFooter() {
  return (
    <footer className="w-full py-4 px-4 border-t bg-slate-50">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
        <div className="text-center md:text-left">
          <span className="font-semibold text-slate-700">Mindwhile IT Solutions Pvt. Ltd.</span>
          <span className="hidden md:inline"> | </span>
          <span className="block md:inline">2nd & 3rd Floor, 3rd Block, 12th Main, Bashyam Circle, Rajajinagar, Bengaluru - 560 010</span>
        </div>
        <div className="text-center">
          <span className="text-blue-600 font-medium">Raksha Assist</span> - Not an insurance product
        </div>
        <div className="text-center md:text-right">
          &copy; 2026 All Rights Reserved
        </div>
      </div>
    </footer>
  );
}

export function Footer() {
  const { data: visitorData } = useQuery({
    queryKey: ["public-visitor-count"],
    queryFn: async () => {
      const res = await fetch("/api/public/visitor-count");
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 120000,
    staleTime: 60000
  });

  return (
    <footer className="bg-slate-50 border-t border-slate-100 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={logoImg} alt="Raksha Assist Logo" className="h-10 w-auto" />
              <span className="font-heading font-bold text-xl tracking-tight text-primary">
                Raksha<span className="text-secondary">Assist</span>
              </span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed mb-6">
              Membership-based emergency assistance and coordination platform for accidents and medical emergencies.
            </p>
            
            <div className="space-y-3 mb-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Download Our App</p>
              <div className="flex flex-col gap-2">
                <a href="#" className="inline-block bg-black text-white px-3 py-1.5 rounded border border-slate-800 hover:bg-slate-900 transition-colors">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.3414L20.355 12.5094L17.523 9.67742V11.5094H13.523V13.5094H17.523V15.3414ZM11.523 17.5094V13.5094H9.523V17.5094H11.523ZM11.523 9.50942V7.50942H9.523V9.50942H11.523ZM7.523 11.5094H3.523V13.5094H7.523V15.3414L10.355 12.5094L7.523 9.67742V11.5094Z"/></svg>
                    <div className="text-[8px] leading-tight"><p>GET IT ON</p><p className="text-xs font-bold">Google Play</p></div>
                  </div>
                </a>
                <a href="#" className="inline-block bg-black text-white px-3 py-1.5 rounded border border-slate-800 hover:bg-slate-900 transition-colors">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.1 2.48-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .76-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.36 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                    <div className="text-[8px] leading-tight"><p>Download on the</p><p className="text-xs font-bold">App Store</p></div>
                  </div>
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <a href="#" className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary transition-all"><Facebook className="h-4 w-4" /></a>
              <a href="#" className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary transition-all"><Twitter className="h-4 w-4" /></a>
              <a href="https://www.instagram.com/rakshaassist/" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary transition-all"><Instagram className="h-4 w-4" /></a>
              <a href="#" className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary transition-all"><Youtube className="h-4 w-4" /></a>
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4 text-foreground text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li><a href="/about-us" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="/careers" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="/how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4 text-foreground text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li><a href="/faq" className="hover:text-primary transition-colors">FAQs</a></li>
              <li><a href="/plans" className="hover:text-primary transition-colors">View Plans</a></li>
              <li><a href="/hospitals" className="hover:text-primary transition-colors">Hospital Network</a></li>
              <li><a href="/terms-conditions" className="hover:text-primary transition-colors">Terms & Conditions</a></li>
              <li><a href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="/agent-terms" className="hover:text-primary transition-colors">Agent Terms</a></li>
              <li><a href="/franchise-terms" className="hover:text-primary transition-colors">Franchise Terms</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4 text-foreground text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li><a href="/login" className="hover:text-primary transition-colors">Member Login</a></li>
              <li><a href="/register" className="hover:text-primary transition-colors">Register</a></li>
              <li><a href="/franchise-login" className="hover:text-primary transition-colors font-semibold text-primary">Franchise Login</a></li>
            </ul>
          </div>

          <div className="hidden lg:block">
            <h3 className="font-heading font-semibold mb-4 text-foreground text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="h-3 w-3" /><a href="tel:+918143752025" className="hover:text-primary">+91 81437 52025</a></li>
              <li className="flex items-center gap-2"><MapPin className="h-3 w-3" /> Bengaluru, India</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Clean design matching reference */}
        <div className="border-t border-slate-200 pt-6 mt-8 pb-16 md:pb-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Left side - Registered Office */}
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold text-slate-700 mb-1">Registered Office:</p>
              <p>Mindwhile IT Solutions Pvt. Ltd.</p>
              <p>CIN: U72900TG2024PTC184818</p>
              <p>2nd & 3rd Floor, 3rd Block, 12th Main, Bashyam Circle, Rajajinagar, Bengaluru - 560 010</p>
              <p>India</p>
            </div>
            
            {/* Center - Minimal Legal Note */}
            <div className="text-xs text-muted-foreground md:text-center max-w-2xl">
              <p className="leading-relaxed text-slate-500">
                * Raksha Assist is a membership-based assistance program, not an insurance or IRDA-regulated product.
                Services are provided on a best-effort basis. Jurisdiction: Courts of Bengaluru, Karnataka, India.
              </p>
            </div>
            
            {/* Right side - Copyright & Visitor Count */}
            <div className="text-xs text-muted-foreground md:text-right">
              <p>© 2026 All Rights Reserved</p>
              <p className="text-slate-500">Mindwhile IT Solutions Pvt. Ltd.</p>
              {visitorData && (
                <div className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 px-3 py-1.5 rounded-full border border-primary/20">
                  <Eye className="h-3.5 w-3.5 text-primary" />
                  <span className="font-bold text-primary">{visitorData.todayVisitors?.toLocaleString() || 0}</span>
                  <span className="text-slate-600">visitors today</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}