import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import logoImg from "@/assets/logo.png";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    if (location !== "/") {
      setLocation("/");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  const NavLinks = () => (
    <>
      <button onClick={() => scrollToSection("why-raksha")} className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all cursor-pointer">
        Why Raksha?
      </button>
      <Link href="/how-it-works" onClick={handleNavClick} className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
        How It Works
      </Link>
      <Link href="/plans" onClick={handleNavClick} className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
        Plans
      </Link>
      <Link href="/hospitals" onClick={handleNavClick} className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
        Hospitals
      </Link>
      <Link href="/faq" onClick={handleNavClick} className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
        FAQ
      </Link>
      <Link href="/about-us" onClick={handleNavClick} className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
        About Us
      </Link>
      <Link href="/contact" onClick={handleNavClick} className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
        Contact
      </Link>
    </>
  );

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-lg z-50 border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <img src={logoImg} alt="Raksha Assist Logo" className="h-14 w-auto drop-shadow-md transition-transform group-hover:scale-105" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-2xl tracking-tight text-primary leading-tight">
              Raksha<span className="text-secondary">Assist</span>
            </span>
            <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">Emergency Medical Assistance</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavLinks />
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              Login
            </Link>
            <Link href="/register">
              <Button data-testid="button-join-membership">Join Membership</Button>
            </Link>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          {isOpen && (
            <div className="absolute top-20 left-0 right-0 bg-white border-b shadow-lg p-6 flex flex-col gap-6 z-50">
              <NavLinks />
              <div className="flex flex-col gap-3">
                <Link href="/login">
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link href="/register">
                  <Button className="w-full" data-testid="button-mobile-join">Join Membership</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}