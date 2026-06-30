import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Smartphone, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { SimpleFooter } from "@/components/Footer";
import logo from "@/assets/logo.png";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [mobile, setMobile] = useState("");
  const [sent, setSent] = useState(false);

  const resetMutation = useMutation({
    mutationFn: async (mobile: string) => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to send reset email");
      }
      return result;
    },
    onSuccess: () => {
      setSent(true);
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      toast({ title: "Please enter a valid 10-digit mobile number", variant: "destructive" });
      return;
    }
    resetMutation.mutate(mobile);
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
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>
                {sent 
                  ? "Check your email for reset instructions"
                  : "Enter your registered mobile number to receive a password reset link on your email"
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {sent ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    If an account exists with mobile number +91 {mobile}, a password reset link has been sent to your registered email.
                  </p>
                  <p className="text-muted-foreground text-xs">
                    The link will expire in 1 hour.
                  </p>
                  <Link href="/login">
                    <Button className="w-full mt-4 bg-[#179299] hover:bg-[#127a80]">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                        +91
                      </span>
                      <Input
                        id="mobile"
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Enter your registered mobile number"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#179299] hover:bg-[#127a80]"
                    disabled={resetMutation.isPending || mobile.length !== 10}
                  >
                    {resetMutation.isPending ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                    ) : (
                      'Send Reset Link'
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
