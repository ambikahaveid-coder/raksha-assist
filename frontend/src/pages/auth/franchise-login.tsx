import { useState } from "react";
import { fetchWithCsrf, setAuthToken } from "@/lib/csrf";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Building2, Phone, Mail, Lock, Eye, EyeOff, Network, Globe, Building, Home } from "lucide-react";
import logoImg from "@/assets/logo.png";

export default function FranchiseLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "mobile">("email");
  
  const [emailForm, setEmailForm] = useState({ email: "", password: "" });
  const [mobileForm, setMobileForm] = useState({ mobile: "", otp: "" });
  const [otpSent, setOtpSent] = useState(false);

  const emailLoginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await fetchWithCsrf("/api/auth/email-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Login failed");
      }
      return res.json();
    },
    onSuccess: async (data) => {
      if (data.token) setAuthToken(data.token);
      const franchiseRoles = ["zone_franchise", "state_franchise", "district_franchise", "city_franchise"];
      if (franchiseRoles.includes(data.user?.role)) {
        toast({ title: "Login Successful", description: `Welcome back, ${data.user.name}!` });
        setLocation("/franchise");
      } else {
        await fetchWithCsrf("/api/auth/logout", { method: "POST" });
        toast({ 
          title: "Access Denied", 
          description: "This login is for franchise partners only. Please use the regular login.",
          variant: "destructive" 
        });
      }
    },
    onError: (error: Error) => {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: async (mobile: string) => {
      const res = await fetchWithCsrf("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send OTP");
      }
      return res.json();
    },
    onSuccess: () => {
      setOtpSent(true);
      toast({ 
        title: "OTP Sent", 
        description: "Please check your phone for OTP" 
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { mobile: string; otp: string }) => {
      const res = await fetchWithCsrf("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "OTP verification failed");
      }
      return res.json();
    },
    onSuccess: async (data) => {
      if (data.token) setAuthToken(data.token);
      const franchiseRoles = ["zone_franchise", "state_franchise", "district_franchise", "city_franchise"];
      if (franchiseRoles.includes(data.user?.role)) {
        toast({ title: "Login Successful", description: `Welcome back, ${data.user.name}!` });
        setLocation("/franchise");
      } else {
        await fetchWithCsrf("/api/auth/logout", { method: "POST" });
        toast({ 
          title: "Access Denied", 
          description: "This login is for franchise partners only.",
          variant: "destructive" 
        });
      }
    },
    onError: (error: Error) => {
      toast({ title: "Verification Failed", description: error.message, variant: "destructive" });
    },
  });

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.email || !emailForm.password) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }
    emailLoginMutation.mutate(emailForm);
  };

  const handleMobileLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileForm.mobile) {
      toast({ title: "Error", description: "Please enter mobile number", variant: "destructive" });
      return;
    }
    if (!otpSent) {
      sendOtpMutation.mutate(mobileForm.mobile);
    } else {
      if (!mobileForm.otp) {
        toast({ title: "Error", description: "Please enter OTP", variant: "destructive" });
        return;
      }
      verifyOtpMutation.mutate(mobileForm);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img src={logoImg} alt="Raksha Assist" className="h-12 w-auto" />
              <div>
                <h1 className="font-heading font-bold text-2xl text-primary">
                  Raksha<span className="text-secondary">Assist</span>
                </h1>
                <p className="text-xs text-muted-foreground">Franchise Partner Portal</p>
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Franchise Login</CardTitle>
              <CardDescription>
                Access your franchise dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as "email" | "mobile")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="email" className="gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </TabsTrigger>
                  <TabsTrigger value="mobile" className="gap-2">
                    <Phone className="h-4 w-4" /> Mobile OTP
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email">
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="franchise@example.com"
                          className="pl-10"
                          value={emailForm.email}
                          onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          className="pl-10 pr-10"
                          value={emailForm.password}
                          onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={emailLoginMutation.isPending}
                    >
                      {emailLoginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="mobile">
                  <form onSubmit={handleMobileLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="mobile"
                          type="tel"
                          placeholder="9876543210"
                          className="pl-10"
                          maxLength={10}
                          value={mobileForm.mobile}
                          onChange={(e) => setMobileForm({ ...mobileForm, mobile: e.target.value.replace(/\D/g, "") })}
                          disabled={otpSent}
                        />
                      </div>
                    </div>
                    {otpSent && (
                      <div className="space-y-2">
                        <Label htmlFor="otp">Enter OTP</Label>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          value={mobileForm.otp}
                          onChange={(e) => setMobileForm({ ...mobileForm, otp: e.target.value.replace(/\D/g, "") })}
                        />
                      </div>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={sendOtpMutation.isPending || verifyOtpMutation.isPending}
                    >
                      {sendOtpMutation.isPending ? "Sending OTP..." : 
                       verifyOtpMutation.isPending ? "Verifying..." :
                       otpSent ? "Verify & Login" : "Send OTP"}
                    </Button>
                    {otpSent && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="w-full" 
                        onClick={() => { setOtpSent(false); setMobileForm({ ...mobileForm, otp: "" }); }}
                      >
                        Change Mobile Number
                      </Button>
                    )}
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-purple-50">
                    <Network className="h-5 w-5 mx-auto text-purple-600 mb-1" />
                    <p className="text-[10px] text-muted-foreground">Zone</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Globe className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                    <p className="text-[10px] text-muted-foreground">State</p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-50">
                    <Building className="h-5 w-5 mx-auto text-green-600 mb-1" />
                    <p className="text-[10px] text-muted-foreground">District</p>
                  </div>
                  <div className="p-2 rounded-lg bg-orange-50">
                    <Home className="h-5 w-5 mx-auto text-orange-600 mb-1" />
                    <p className="text-[10px] text-muted-foreground">City</p>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  All franchise levels can login here
                </p>
              </div>

              <div className="mt-4 text-center">
                <a href="/login" className="text-sm text-primary hover:underline">
                  Not a franchise partner? Login as member
                </a>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Need franchise partnership? <a href="/contact" className="text-primary hover:underline">Contact us</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
