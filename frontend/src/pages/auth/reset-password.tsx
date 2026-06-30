import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { SimpleFooter } from "@/components/Footer";
import logo from "@/assets/logo.png";

export default function ResetPassword() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setInvalidToken(true);
    }
  }, []);

  const resetMutation = useMutation({
    mutationFn: async ({ token, password }: { token: string; password: string }) => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to reset password");
      }
      return result;
    },
    onSuccess: () => {
      setSuccess(true);
      toast({ title: "Password reset successfully!" });
    },
    onError: (error: Error) => {
      if (error.message.includes("expired") || error.message.includes("Invalid")) {
        setInvalidToken(true);
      }
      toast({ title: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    
    resetMutation.mutate({ token, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <main className="flex-1 pt-12 pb-12 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <Card className="border-none shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <img src={logo} alt="Raksha Assist" className="h-12" />
              </div>
              <CardTitle className="text-2xl">
                {success ? "Password Reset!" : invalidToken ? "Invalid Link" : "Create New Password"}
              </CardTitle>
              <CardDescription>
                {success 
                  ? "Your password has been reset successfully"
                  : invalidToken
                  ? "This password reset link is invalid or has expired"
                  : "Enter your new password below"
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {success ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    You can now login with your new password.
                  </p>
                  <Link href="/login">
                    <Button className="w-full mt-4 bg-[#179299] hover:bg-[#127a80]">
                      Go to Login
                    </Button>
                  </Link>
                </div>
              ) : invalidToken ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Please request a new password reset link.
                  </p>
                  <Link href="/forgot-password">
                    <Button className="w-full mt-4 bg-[#179299] hover:bg-[#127a80]">
                      Request New Link
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password (min 6 characters)"
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#179299] hover:bg-[#127a80]"
                    disabled={resetMutation.isPending || password.length < 6 || password !== confirmPassword}
                  >
                    {resetMutation.isPending ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Resetting...</>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                  
                  <div className="text-center pt-4">
                    <Link href="/login" className="text-sm text-[#179299] hover:underline">
                      <ArrowLeft className="h-3 w-3 inline mr-1" />
                      Back to Login
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <SimpleFooter />
    </div>
  );
}
