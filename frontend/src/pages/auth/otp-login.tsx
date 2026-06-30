import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Smartphone, Home, ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { SimpleFooter } from "@/components/Footer";
import { usePublicIntegrations } from "@/hooks/use-integrations";
import { 
  initializeFirebase, 
  isFirebaseInitialized, 
  setupRecaptcha, 
  sendOTP, 
  verifyOTP, 
  clearConfirmation 
} from "@/lib/firebase";
import logoImg from "@/assets/logo.png";

type Step = "phone" | "otp";

function getCurrentQuerySuffix() {
  return window.location.search || "";
}

function getPostLoginRedirect(userRole?: string | null) {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");

  if (redirect && redirect.startsWith("/")) {
    return redirect;
  }

  switch (userRole) {
    case "super_admin":
      return "/super-admin";
    case "admin":
      return "/admin";
    case "agent":
      return "/agent";
    case "employee":
      return "/employee";
    case "accountant":
      return "/accountant";
    default:
      return "/dashboard";
  }
}

export default function OTPLogin() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("phone");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { data: integrations } = usePublicIntegrations();

  useEffect(() => {
    if (integrations?.firebase?.enabled && integrations.firebase.apiKey && integrations.firebase.projectId) {
      const success = initializeFirebase({
        apiKey: integrations.firebase.apiKey,
        authDomain: integrations.firebase.authDomain || `${integrations.firebase.projectId}.firebaseapp.com`,
        projectId: integrations.firebase.projectId,
        storageBucket: integrations.firebase.storageBucket || undefined,
        messagingSenderId: integrations.firebase.messagingSenderId || undefined,
        appId: integrations.firebase.appId || undefined,
      });
      setFirebaseReady(success);
    }
  }, [integrations]);

  useEffect(() => {
    if (firebaseReady && recaptchaContainerRef.current) {
      setupRecaptcha("recaptcha-container");
    }
  }, [firebaseReady]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || mobile.length !== 10) return;

    if (!firebaseReady) {
      toast({
        title: "Service Unavailable",
        description: "OTP service is not configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await sendOTP(mobile);
      
      if (result.success) {
        setStep("otp");
        setCountdown(30);
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the verification code.",
        });
      } else {
        toast({
          title: "Failed to Send OTP",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return;

    setLoading(true);
    try {
      const verifyResult = await verifyOTP(otp);
      
      if (!verifyResult.success || !verifyResult.idToken) {
        toast({
          title: "Verification Failed",
          description: verifyResult.message,
          variant: "destructive",
        });
        return;
      }

      const result = await api.auth.verifyFirebaseToken(verifyResult.idToken, mobile);
      
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      
      clearConfirmation();
      
      window.location.href = getPostLoginRedirect(result.user?.role);
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Failed to verify your phone number",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    clearConfirmation();
    setOtp("");
    await handleSendOTP({ preventDefault: () => {} } as React.FormEvent);
  };

  const handleBack = () => {
    clearConfirmation();
    setStep("phone");
    setOtp("");
  };

  if (!integrations?.firebase?.enabled) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl border-0">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <img src={logoImg} alt="Raksha Assist" className="h-16" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">OTP Login</CardTitle>
              <CardDescription className="text-red-500">
                OTP login is not available. Firebase is not configured.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-4 pt-4">
              <Link href={`/login${getCurrentQuerySuffix()}`} className="text-[#179299] font-medium hover:underline">
                Use password login instead
              </Link>
            </CardFooter>
          </Card>
        </div>
        <SimpleFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <img src={logoImg} alt="Raksha Assist" className="h-16" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {step === "phone" ? "Login with OTP" : "Verify OTP"}
            </CardTitle>
            <CardDescription>
              {step === "phone" 
                ? "Enter your registered mobile number" 
                : `Enter the 6-digit code sent to +91 ${mobile}`}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {step === "phone" ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                      +91
                    </span>
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="Enter your mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="rounded-l-none"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#179299] hover:bg-[#127a80]" 
                  disabled={loading || mobile.length !== 10 || !firebaseReady}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                  <Smartphone className="ml-2 h-4 w-4" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#179299] hover:bg-[#127a80]" 
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <div className="flex justify-between items-center text-sm">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Change Number
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={countdown > 0}
                    className={`flex items-center gap-1 ${countdown > 0 ? 'text-gray-400' : 'text-[#179299] hover:underline'}`}
                  >
                    <RefreshCw className="h-4 w-4" />
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                  </button>
                </div>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 pt-4">
            <p className="text-center text-sm text-gray-600">
              <Link href={`/login${getCurrentQuerySuffix()}`} className="text-[#179299] font-medium hover:underline">
                Use password login instead
              </Link>
            </p>
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href={`/register${getCurrentQuerySuffix()}`} className="text-[#179299] font-medium hover:underline">
                Register here
              </Link>
            </p>
            <Link href="/" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
      
      <SimpleFooter />
    </div>
  );
}
