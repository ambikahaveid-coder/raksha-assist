import { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  ArrowLeft,
  Upload,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Gift,
  Plus,
  Loader2
} from "lucide-react";
import { OtpInput } from "@/components/ui/otp-input";
import { fetchWithCsrf } from "@/lib/csrf";

interface Plan {
  id: string;
  planCode: string;
  name: string;
  price: number;
  coverageAmount: number;
  isPopular?: boolean;
}

interface AddOnBenefit {
  id: string;
  benefitCode: string;
  name: string;
  description: string;
  price: number;
  benefitAmount: number;
  usageLimit: number;
  isActive: boolean;
}

export default function AgentRegisterMember() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [membershipNumber, setMembershipNumber] = useState("");
  
  const [formData, setFormData] = useState({
    mobile: "",
    name: "",
    email: "",
    aadharNumber: "",
    selectedPlanId: "",
    selectedAddOns: [] as string[],
    paymentMode: "cash"
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: ["agent-plans"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/plans");
      if (!res.ok) return [];
      const data = await res.json();
      return data.filter((p: Plan) => p.price > 0).sort((a: Plan, b: Plan) => a.price - b.price);
    }
  });

  const { data: addOnBenefits = [] } = useQuery<AddOnBenefit[]>({
    queryKey: ["agent", "addOnBenefits"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/agent/add-on-benefits");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const selectedPlan = plans.find(p => p.id === formData.selectedPlanId);
  const selectedAddOnsList = addOnBenefits.filter(a => formData.selectedAddOns.includes(a.id));
  const addOnsTotal = selectedAddOnsList.reduce((sum, a) => sum + a.price, 0);
  const planPrice = selectedPlan?.price || 0;
  const totalAmount = planPrice + addOnsTotal;

  const toggleAddOn = (addOnId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAddOns: prev.selectedAddOns.includes(addOnId)
        ? prev.selectedAddOns.filter(id => id !== addOnId)
        : [...prev.selectedAddOns, addOnId]
    }));
  };

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithCsrf("/api/agent/register-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: formData.mobile.replace(/\s/g, ""),
          name: formData.name,
          email: formData.email,
          aadharNumber: formData.aadharNumber.replace(/\s/g, ""),
          planId: formData.selectedPlanId,
          addOnIds: formData.selectedAddOns,
          paymentMode: formData.paymentMode
        })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Registration failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setMembershipNumber(data.membershipNumber || "RA-XXXXX");
      setIsSuccess(true);
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 3) {
      registerMutation.mutate();
    } else {
      setStep(prev => prev + 1);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center px-4">
          <Card className="w-full max-w-md border-none shadow-lg text-center p-8">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Member ID <span className="font-bold text-slate-900">{membershipNumber}</span> has been created. Digital card link has been sent to their mobile.
            </p>
            {formData.selectedAddOns.length > 0 && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg text-left">
                <p className="text-sm font-medium text-green-800 mb-2">Add-On Benefits Added:</p>
                {selectedAddOnsList.map(addon => (
                  <div key={addon.id} className="text-sm text-green-700 flex items-center gap-2">
                    <Gift className="h-3 w-3" />
                    {addon.name} - ₹{addon.price}
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-3">
              <Link href="/agent">
                <Button variant="outline" className="w-full">Return to Dashboard</Button>
              </Link>
              <Button onClick={() => { 
                setIsSuccess(false); 
                setStep(1); 
                setFormData({
                  mobile: "",
                  name: "",
                  email: "",
                  aadharNumber: "",
                  selectedPlanId: "",
                  selectedAddOns: [],
                  paymentMode: "cash"
                });
              }} className="w-full">
                Register Another Member
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8">
            <Link href="/agent">
              <Button variant="ghost" size="sm" className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">New Member Registration</h1>
            <p className="text-muted-foreground">Authorized Agent Portal • Instant Activation</p>
          </div>

          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-2 flex-1 rounded-full transition-all ${
                  s <= step ? "bg-primary" : "bg-slate-200"
                }`} 
              />
            ))}
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>
                {step === 1 && "Basic Details & Plan Selection"}
                {step === 2 && "KYC & Add-On Benefits"}
                {step === 3 && "Payment Collection"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNext} className="space-y-6">
                {step === 1 && (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label required>Member Mobile</Label>
                        <div className="flex gap-2">
                          <span className="inline-flex items-center px-3 rounded-md border border-input bg-muted text-muted-foreground text-sm">+91</span>
                          <Input 
                            placeholder="98765 43210" 
                            required 
                            value={formData.mobile}
                            onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label required>Full Name</Label>
                        <Input 
                          placeholder="As per Aadhar" 
                          required 
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Email (Optional)</Label>
                      <Input 
                        type="email"
                        placeholder="customer@email.com" 
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label required>Select Plan</Label>
                      {plansLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {plans.slice(0, 6).map((plan) => (
                            <div 
                              key={plan.id}
                              onClick={() => setFormData(prev => ({ ...prev, selectedPlanId: plan.id }))}
                              className={`border rounded-xl p-4 cursor-pointer transition-all relative ${
                                formData.selectedPlanId === plan.id 
                                  ? "border-primary bg-blue-50" 
                                  : "hover:border-primary bg-slate-50 hover:bg-blue-50"
                              }`}
                            >
                              {formData.selectedPlanId === plan.id && (
                                <div className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full"></div>
                              )}
                              {plan.isPopular && (
                                <Badge className="absolute -top-2 left-2 text-[10px] bg-orange-500">Popular</Badge>
                              )}
                              <p className="font-bold text-sm">{plan.name}</p>
                              <p className="text-lg font-bold text-primary">₹{plan.price?.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">₹{plan.coverageAmount?.toLocaleString()} support limit</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label required>Aadhar Number</Label>
                        <Input 
                          placeholder="XXXX XXXX XXXX" 
                          required 
                          value={formData.aadharNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, aadharNumber: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label required>Upload Aadhar Card (Front & Back)</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-primary/50 hover:bg-slate-50 transition-colors cursor-pointer">
                            <input type="file" id="agent-aadhar-front" accept="image/*,.pdf" className="hidden" />
                            <label htmlFor="agent-aadhar-front" className="cursor-pointer">
                              <Upload className="h-6 w-6 mx-auto text-slate-400 mb-2" />
                              <span className="text-xs text-muted-foreground block">Front Side</span>
                              <span className="text-[10px] text-primary">Browse Files</span>
                            </label>
                          </div>
                          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-primary/50 hover:bg-slate-50 transition-colors cursor-pointer">
                            <input type="file" id="agent-aadhar-back" accept="image/*,.pdf" className="hidden" />
                            <label htmlFor="agent-aadhar-back" className="cursor-pointer">
                              <Upload className="h-6 w-6 mx-auto text-slate-400 mb-2" />
                              <span className="text-xs text-muted-foreground block">Back Side</span>
                              <span className="text-[10px] text-primary">Browse Files</span>
                            </label>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Accepted: JPG, PNG, PDF (max 5MB each)</p>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Instant KYC verification enabled</span>
                      </div>
                    </div>

                    {addOnBenefits.length > 0 && (
                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Gift className="h-5 w-5 text-primary" />
                          <Label className="text-base font-semibold">Add-On Benefits (Optional)</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">Recommend additional support options to your customer</p>
                        
                        <div className="grid gap-3">
                          {addOnBenefits.map((addon) => (
                            <div 
                              key={addon.id}
                              onClick={() => toggleAddOn(addon.id)}
                              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                                formData.selectedAddOns.includes(addon.id)
                                  ? "border-primary bg-blue-50"
                                  : "border-slate-200 bg-white hover:border-primary/50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox 
                                  checked={formData.selectedAddOns.includes(addon.id)}
                                  onCheckedChange={() => toggleAddOn(addon.id)}
                                />
                                <div>
                                  <p className="font-medium text-sm">{addon.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {addon.benefitCode === 'THIRD_PARTY_ACCIDENT' ? `${addon.benefitAmount}% of membership fee` : `₹${addon.benefitAmount?.toLocaleString()} support`} • {addon.usageLimit} use(s)
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-green-600 border-green-200">
                                +₹{addon.price}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Plan: {selectedPlan?.name}</span>
                          <span className="font-medium">₹{planPrice.toLocaleString()}</span>
                        </div>
                        
                        {formData.selectedAddOns.length > 0 && (
                          <>
                            <div className="border-t pt-3">
                              <p className="text-sm text-muted-foreground mb-2">Add-On Benefits:</p>
                              {selectedAddOnsList.map(addon => (
                                <div key={addon.id} className="flex items-center justify-between text-sm">
                                  <span className="flex items-center gap-2">
                                    <Gift className="h-3 w-3 text-primary" />
                                    {addon.name}
                                  </span>
                                  <span>₹{addon.price}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        
                        <div className="border-t pt-3 flex items-center justify-between">
                          <span className="font-semibold">Total Amount</span>
                          <span className="text-2xl font-bold text-slate-900">₹{totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label required>Payment Mode</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            className={`h-12 ${formData.paymentMode === 'cash' ? 'border-primary bg-blue-50 text-primary' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, paymentMode: 'cash' }))}
                          >
                            Cash / UPI
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            className={`h-12 ${formData.paymentMode === 'online' ? 'border-primary bg-blue-50 text-primary' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, paymentMode: 'online' }))}
                          >
                            <CreditCard className="mr-2 h-4 w-4" /> Online Link
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                         <Label required>Agent PIN</Label>
                         <OtpInput length={4} onComplete={() => {}} />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-3">
                  {step > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep(prev => prev - 1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="flex-1"
                    disabled={registerMutation.isPending || (step === 1 && !formData.selectedPlanId)}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : step === 3 ? (
                      "Collect Payment & Activate"
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

