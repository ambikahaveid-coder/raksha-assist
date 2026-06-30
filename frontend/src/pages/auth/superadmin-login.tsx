import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, EyeOff, Lock, AlertTriangle, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SimpleFooter } from "@/components/Footer";
import { fetchWithCsrf, setAuthToken } from "@/lib/csrf";

export default function SuperAdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/superadmin/direct-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || data.details || "Authentication failed");
      }
      
      if (data.token) {
        setAuthToken(data.token);
        localStorage.setItem("raksha_auth_token", data.token);
      }
      
      toast({ 
        title: "Access Granted", 
        description: "Welcome, Super Administrator" 
      });
      
      setTimeout(() => {
        window.location.href = "/super-admin";
      }, 300);
    } catch (error: any) {
      toast({
        title: "Access Denied",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="flex-1 flex items-center justify-center p-4">
      
      <Button
        variant="ghost"
        className="absolute top-4 left-4 z-20 text-slate-400 hover:text-white hover:bg-slate-700/50"
        onClick={() => setLocation("/")}
        data-testid="button-home"
      >
        <Home className="h-5 w-5 mr-2" />
        Home
      </Button>
      
      <Card className="w-full max-w-md relative z-10 bg-slate-800/90 border-slate-700 shadow-2xl backdrop-blur">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-600/20 flex items-center justify-center border border-red-500/30">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-xl font-bold text-white">
            Restricted Access
          </CardTitle>
          <p className="text-sm text-slate-400 mt-2">
            Super Administrator Portal
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-200">
              Unauthorized access attempts are logged and monitored.
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-sm">Administrator Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoComplete="email"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500/20"
                data-testid="input-superadmin-email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 pr-10 focus:border-red-500 focus:ring-red-500/20"
                  data-testid="input-superadmin-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-medium"
              disabled={loading}
              data-testid="button-superadmin-login"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Secure Login
                </div>
              )}
            </Button>
          </form>
          
          <p className="text-center text-xs text-slate-500">
            Protected by Raksha Assist Security
          </p>
        </CardContent>
      </Card>
      </div>
      <div className="relative z-10">
        <SimpleFooter />
      </div>
    </div>
  );
}
