import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Mail, Smartphone, Eye, EyeOff, Car, Building2, Shield, BadgeCheck, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import logoImg from "@/assets/logo.png";

export default function ShowroomLogin() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [mobile, setMobile] = useState("");
  const [mobilePassword, setMobilePassword] = useState("");
  const [showMobilePassword, setShowMobilePassword] = useState(false);

  const [email, setEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  const handleMobileLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || !mobilePassword) return;
    
    setLoading(true);
    try {
      const result = await api.auth.mobileLogin(mobile, mobilePassword);
      if (result.user?.role !== "showroom") {
        toast({
          title: "Access Denied",
          description: "This portal is only for registered showroom partners",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Login Successful",
        description: "Welcome to your Showroom Dashboard!",
      });
      window.location.href = "/showroom/dashboard";
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error?.message || "Invalid mobile number or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !emailPassword) return;
    
    setLoading(true);
    try {
      const result = await api.auth.emailLogin(email, emailPassword);
      if (result.user?.role !== "showroom") {
        toast({
          title: "Access Denied",
          description: "This portal is only for registered showroom partners",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Login Successful",
        description: "Welcome to your Showroom Dashboard!",
      });
      window.location.href = "/showroom/dashboard";
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error?.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div 
        className="lg:w-[45%] text-white p-10 lg:p-16 flex flex-col justify-between min-h-[450px] lg:min-h-screen relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0d9488 50%, #059669 100%)'
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="mb-12 flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20">
              <img src={logoImg} alt="Raksha Assist" className="h-10" />
            </div>
            <div>
              <span className="text-lg font-semibold tracking-wide">Raksha Assist</span>
              <p className="text-xs text-teal-200/80">Showroom Partner Portal</p>
            </div>
          </div>
          
          <div className="mb-14">
            <h1 className="text-4xl lg:text-5xl font-bold mb-2 leading-tight tracking-tight">
              Partner With Us,
            </h1>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Protect Your Customers</span>
            </h2>
            
            <p className="mt-8 text-teal-100/70 text-lg leading-relaxed max-w-lg font-light">
              Join India's leading emergency assistance network. Offer your customers comprehensive vehicle accident protection and earn commissions on every membership sold.
            </p>
          </div>
        </div>
        
        <div className="relative z-10 space-y-5">
          <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl shadow-lg shadow-amber-500/20">
              <Car className="h-5 w-5 text-slate-900" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">All Vehicle Types</h3>
              <p className="text-sm text-teal-200/60">Bikes, Cars, Lorries, Trucks, Buses & More</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl shadow-lg shadow-amber-500/20">
              <TrendingUp className="h-5 w-5 text-slate-900" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Earn 10% Commission</h3>
              <p className="text-sm text-teal-200/60">On every membership sale from your showroom</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl shadow-lg shadow-amber-500/20">
              <BadgeCheck className="h-5 w-5 text-slate-900" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Easy SOS Case Filing</h3>
              <p className="text-sm text-teal-200/60">Help customers file accident cases quickly</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 text-teal-200/50 text-sm">
            <Building2 className="h-4 w-4" />
            <span>500+ Showroom Partners across India</span>
          </div>
        </div>
      </div>

      <div className="lg:w-[55%] bg-gradient-to-br from-slate-50 to-white p-8 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Showroom Partner Login</h1>
            <p className="text-slate-500 text-base">Sign in to manage memberships and SOS cases</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
            <Tabs defaultValue="mobile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 p-1.5 rounded-xl h-14">
                <TabsTrigger 
                  value="mobile" 
                  className="flex items-center justify-center gap-2 h-11 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg text-slate-500 data-[state=active]:text-slate-900 font-medium transition-all duration-200"
                >
                  <Smartphone className="h-4 w-4" />
                  Mobile
                </TabsTrigger>
                <TabsTrigger 
                  value="email" 
                  className="flex items-center justify-center gap-2 h-11 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg text-slate-500 data-[state=active]:text-slate-900 font-medium transition-all duration-200"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mobile">
                <form onSubmit={handleMobileLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="mobile" className="text-slate-700 font-medium text-sm">
                      Mobile Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 text-sm text-slate-500 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl font-medium">
                        +91
                      </span>
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="98765 43210"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="rounded-l-none rounded-r-xl border-slate-200 h-12 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        autoComplete="tel"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobilePassword" className="text-slate-700 font-medium text-sm">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="mobilePassword"
                        type={showMobilePassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={mobilePassword}
                        onChange={(e) => setMobilePassword(e.target.value)}
                        className="rounded-xl border-slate-200 h-12 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all pr-12"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowMobilePassword(!showMobilePassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showMobilePassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold text-base rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300" 
                    disabled={loading || mobile.length !== 10 || !mobilePassword}
                  >
                    {loading ? "Logging in..." : "Login to Dashboard"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  
                  <div className="text-right">
                    <Link href="/forgot-password" className="text-sm text-teal-600 hover:text-teal-700 font-medium hover:underline transition-colors">
                      Forgot Password?
                    </Link>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="email">
                <form onSubmit={handleEmailLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium text-sm">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="showroom@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-xl border-slate-200 h-12 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emailPassword" className="text-slate-700 font-medium text-sm">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="emailPassword"
                        type={showEmailPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={emailPassword}
                        onChange={(e) => setEmailPassword(e.target.value)}
                        className="rounded-xl border-slate-200 h-12 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all pr-12"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmailPassword(!showEmailPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showEmailPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold text-base rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300" 
                    disabled={loading || !email || !emailPassword}
                  >
                    {loading ? "Logging in..." : "Login to Dashboard"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  
                  <div className="text-right">
                    <Link href="/forgot-password" className="text-sm text-teal-600 hover:text-teal-700 font-medium hover:underline transition-colors">
                      Forgot Password?
                    </Link>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 mb-4">Want to become a Showroom Partner?</p>
            <Link href="/showroom/register">
              <Button 
                variant="outline" 
                className="w-full h-12 border-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 font-semibold rounded-xl transition-all duration-200"
              >
                Register Your Showroom
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm">
            <Link href="/" className="text-slate-400 hover:text-slate-600 font-medium transition-colors">
              Home
            </Link>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <Link href="/login" className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 font-medium transition-colors">
              <Shield className="h-3.5 w-3.5" />
              Member Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
