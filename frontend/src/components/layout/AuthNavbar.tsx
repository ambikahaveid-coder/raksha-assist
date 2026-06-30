import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, CreditCard, Bell, Settings, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { NotificationBell } from "@/components/notification-bell";

import logoImg from "@/assets/logo.png";

export function AuthNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, logout, membership } = useAuth();

  const handleNavClick = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      logout();
      setTimeout(() => {
        window.location.href = '/login';
      }, 300);
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  const NavLinks = () => (
    <>
      <Link href="/dashboard" onClick={handleNavClick} className={`block px-3 py-2 text-sm font-medium rounded-lg transition-all ${location === '/dashboard' ? 'text-primary bg-primary/10' : 'text-slate-700 hover:text-primary hover:bg-primary/5'}`}>
        Dashboard
      </Link>
      <Link href="/how-it-works" onClick={handleNavClick} className={`block px-3 py-2 text-sm font-medium rounded-lg transition-all ${location === '/how-it-works' ? 'text-primary bg-primary/10' : 'text-slate-700 hover:text-primary hover:bg-primary/5'}`}>
        How It Works
      </Link>
      <Link href="/plans" onClick={handleNavClick} className={`block px-3 py-2 text-sm font-medium rounded-lg transition-all ${location === '/plans' ? 'text-primary bg-primary/10' : 'text-slate-700 hover:text-primary hover:bg-primary/5'}`}>
        Plans
      </Link>
      <Link href="/faq" onClick={handleNavClick} className={`block px-3 py-2 text-sm font-medium rounded-lg transition-all ${location === '/faq' ? 'text-primary bg-primary/10' : 'text-slate-700 hover:text-primary hover:bg-primary/5'}`}>
        FAQ
      </Link>
      <Link href="/about-us" onClick={handleNavClick} className={`block px-3 py-2 text-sm font-medium rounded-lg transition-all ${location === '/about-us' ? 'text-primary bg-primary/10' : 'text-slate-700 hover:text-primary hover:bg-primary/5'}`}>
        About Us
      </Link>
      <Link href="/contact" onClick={handleNavClick} className={`block px-3 py-2 text-sm font-medium rounded-lg transition-all ${location === '/contact' ? 'text-primary bg-primary/10' : 'text-slate-700 hover:text-primary hover:bg-primary/5'}`}>
        Contact
      </Link>
    </>
  );

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-lg z-50 border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
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

        <div className="hidden md:flex items-center gap-8">
          <NavLinks />
          <div className="flex items-center gap-4">
            <NotificationBell />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-medium">{user?.name || 'Member'}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {membership?.status === 'active' && membership?.paymentStatus === 'completed' 
                        ? 'Active Member' 
                        : 'Pending Activation'}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2 border-b">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.mobile || user?.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/membership-card" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    Membership Card
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <NotificationBell />
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          {isOpen && (
            <div className="absolute top-20 left-0 right-0 bg-white border-b shadow-lg p-6 flex flex-col gap-4 z-50">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{user?.name || 'Member'}</p>
                  <p className="text-xs text-muted-foreground">{user?.mobile || user?.email}</p>
                </div>
              </div>
              <NavLinks />
              <div className="pt-4 border-t space-y-2">
                <Link href="/membership-card" onClick={handleNavClick}>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <CreditCard className="h-4 w-4" />
                    Membership Card
                  </Button>
                </Link>
                <Link href="/profile" onClick={handleNavClick}>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Settings className="h-4 w-4" />
                    Profile Settings
                  </Button>
                </Link>
                <Button variant="destructive" className="w-full justify-start gap-2" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
