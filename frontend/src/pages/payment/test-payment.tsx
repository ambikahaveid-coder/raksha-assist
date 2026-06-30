import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function TestPayment() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<string>("idle");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log("[TestPayment]", msg);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const testRazorpayLoad = async () => {
    addLog("Testing Razorpay script load...");
    
    if (window.Razorpay) {
      addLog("Razorpay already loaded on window");
      return true;
    }

    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        addLog("Script loaded, checking window.Razorpay...");
        setTimeout(() => {
          if (window.Razorpay) {
            addLog("SUCCESS: window.Razorpay is available");
            resolve(true);
          } else {
            addLog("ERROR: Script loaded but window.Razorpay is undefined");
            resolve(false);
          }
        }, 500);
      };
      script.onerror = () => {
        addLog("ERROR: Failed to load Razorpay script");
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const testCreateOrder = async () => {
    addLog("Testing create-order API...");
    
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planType: "STARTER" })
      });
      
      if (!res.ok) {
        const error = await res.json();
        addLog(`ERROR: API returned ${res.status} - ${error.error || JSON.stringify(error)}`);
        return null;
      }
      
      const data = await res.json();
      addLog(`SUCCESS: Order created - ${data.orderId}`);
      addLog(`Key ID: ${data.keyId ? "Present" : "MISSING"}`);
      addLog(`Amount: ${data.amount}`);
      return data;
    } catch (err: any) {
      addLog(`ERROR: ${err.message}`);
      return null;
    }
  };

  const testFullFlow = async () => {
    setStatus("testing");
    setLogs([]);
    
    addLog("=== STARTING FULL PAYMENT TEST ===");
    addLog(`User authenticated: ${isAuthenticated}`);
    addLog(`User ID: ${user?.id || "none"}`);

    // Step 1: Load Razorpay
    const razorpayLoaded = await testRazorpayLoad();
    if (!razorpayLoaded) {
      setStatus("failed");
      toast({ title: "Razorpay script failed to load", variant: "destructive" });
      return;
    }

    // Step 2: Create order
    const orderData = await testCreateOrder();
    if (!orderData) {
      setStatus("failed");
      toast({ title: "Failed to create order", variant: "destructive" });
      return;
    }

    // Step 3: Open Razorpay
    addLog("Opening Razorpay popup...");
    
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "RakshaAssist Test",
      description: "Test Payment",
      order_id: orderData.orderId,
      prefill: orderData.prefill,
      handler: (response: any) => {
        addLog(`PAYMENT SUCCESS: ${response.razorpay_payment_id}`);
        setStatus("success");
        toast({ title: "Payment successful!" });
      },
      modal: {
        ondismiss: () => {
          addLog("Razorpay modal dismissed by user");
          setStatus("idle");
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        addLog(`PAYMENT FAILED: ${response.error.description}`);
        setStatus("failed");
      });
      addLog("Calling razorpay.open()...");
      rzp.open();
      addLog("razorpay.open() called - popup should be visible");
    } catch (err: any) {
      addLog(`ERROR opening Razorpay: ${err.message}`);
      setStatus("failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Payment Flow Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p><strong>Auth Status:</strong> {isAuthenticated ? "Logged In" : "NOT Logged In"}</p>
              <p><strong>User:</strong> {user?.email || user?.phone || "None"}</p>
            </div>

            <Button 
              onClick={testFullFlow} 
              disabled={status === "testing" || !isAuthenticated}
              className="w-full h-12 text-lg"
            >
              {status === "testing" ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Testing...</>
              ) : status === "success" ? (
                <><CheckCircle2 className="mr-2 h-5 w-5" /> Success!</>
              ) : status === "failed" ? (
                <><XCircle className="mr-2 h-5 w-5" /> Failed - Try Again</>
              ) : (
                "Test Complete Payment Flow"
              )}
            </Button>

            {!isAuthenticated && (
              <p className="text-red-600 text-center">Please login first to test payment</p>
            )}

            <div className="mt-4">
              <h3 className="font-bold mb-2">Test Logs:</h3>
              <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-80 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500">Click the button to start test...</p>
                ) : (
                  logs.map((log, i) => <p key={i}>{log}</p>)
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    Razorpay: any;
  }
}
