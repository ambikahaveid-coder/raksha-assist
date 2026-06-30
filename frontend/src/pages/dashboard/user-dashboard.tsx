import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Shield,
  AlertCircle,
  Clock,
  FileText,
  PlusCircle,
  CheckCircle2,
  ChevronRight,
  User,
  CreditCard,
  Loader2,
  Phone,
  Gift,
  Calendar,
  ShoppingCart,
  Sparkles,
  Receipt,
  Activity,
  MapPin,
  UserCheck,
  CircleDollarSign,
  ArrowRight,
  Building2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { fetchWithCsrf } from "@/lib/csrf";
import { SOSChat } from "@/components/sos/SOSChat";
import { SOSTrigger } from "@/components/sos/SOSTrigger";
import { NotificationBell } from "@/components/notification-bell";
import { useToast } from "@/hooks/use-toast";

interface AddOnBenefit {
  id: string;
  benefitCode: string;
  name: string;
  description: string;
  price: number;
  benefitAmount: number;
  usageLimit: number;
  validityDays: number;
  isActive: boolean;
}

export default function UserDashboard() {
  const [, setLocation] = useLocation();
  const [sosOpen, setSosOpen] = useState(false);
  const [sosTriggerOpen, setSosTriggerOpen] = useState(false);
  const [isNewSignup, setIsNewSignup] = useState(false);
  const [addOnShopOpen, setAddOnShopOpen] = useState(false);
  const [purchasingAddOnId, setPurchasingAddOnId] = useState<string | null>(null);
  const { user, membership, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const justSignedUp = sessionStorage.getItem("justSignedUp");
    if (justSignedUp === "true") {
      setIsNewSignup(true);
      sessionStorage.removeItem("justSignedUp");
    }
  }, []);
  
  const { data: emergencyRequests = [] } = useQuery({
    queryKey: ["emergencyRequests"],
    queryFn: api.emergencyRequests.getAll,
    enabled: isAuthenticated,
  });

  // Payment schedule for monthly tracking
  const { data: paymentSchedule } = useQuery({
    queryKey: ["paymentSchedule"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/user/payment-schedule");
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAuthenticated && membership?.status === "active",
  });

  const { data: myAddOns = [], refetch: refetchMyAddOns } = useQuery({
    queryKey: ["myAddOns"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/user/my-add-ons");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: availableAddOns = [] } = useQuery<AddOnBenefit[]>({
    queryKey: ["availableAddOns"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/add-on-benefits");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: sosCases = [] } = useQuery({
    queryKey: ["sosCases"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/sos/my-cases");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const purchasedAddOnIds = myAddOns.map((a: any) => a.addOnId);
  const purchasableAddOns = availableAddOns.filter(a => !purchasedAddOnIds.includes(a.id));

  const purchaseAddOnMutation = useMutation({
    mutationFn: async (addOnId: string) => {
      const res = await fetchWithCsrf("/api/user/purchase-add-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addOnId })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to purchase add-on");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Add-On Purchased!",
        description: "Your new benefit has been added to your membership.",
      });
      refetchMyAddOns();
      queryClient.invalidateQueries({ queryKey: ["myAddOns"] });
      setPurchasingAddOnId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive"
      });
      setPurchasingAddOnId(null);
    }
  });

  const handlePurchaseAddOn = (addOnId: string) => {
    setPurchasingAddOnId(addOnId);
    purchaseAddOnMutation.mutate(addOnId);
  };

  const hasRequest = emergencyRequests.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AuthNavbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name || "Customer"}!</h1>
              <p className="text-muted-foreground">Customer ID: {membership?.membershipNumber || "Pending"}</p>
            </div>
            <div className="flex gap-3 items-center">
              <NotificationBell />
              <Link href="/profile">
                <Button variant="outline" className="bg-white">
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </Button>
              </Link>
              <Button 
                variant="destructive" 
                className="shadow-lg shadow-destructive/20" 
                data-testid="button-emergency-request"
                onClick={() => setSosTriggerOpen(true)}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                SOS Emergency
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {membership?.status === "active" ? (
              <>
                <Card className="border-none shadow-sm overflow-hidden">
                  <div className="bg-primary p-6 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Shield className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="text-white border-white/30 bg-white/10 mb-2">
                          {membership.planType || "Standard"} Plan
                        </Badge>
                        <h2 className="text-3xl font-bold">Active</h2>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div>
                          <p className="text-white/70 text-sm">Valid Until</p>
                          <p className="font-bold">
                            {membership.expiryDate 
                              ? new Date(membership.expiryDate).toLocaleDateString("en-IN", { 
                                  year: "numeric", month: "short", day: "numeric" 
                                })
                              : "N/A"}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Link href="/membership-card">
                            <Button size="sm" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                              <CreditCard className="mr-2 h-4 w-4" />
                              View Card
                            </Button>
                          </Link>
                          <Link href="/payment-history">
                            <Button size="sm" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                              <Receipt className="mr-2 h-4 w-4" />
                              Payments
                            </Button>
                          </Link>
                          <Link href="/plans">
                            <Button size="sm" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                              <Sparkles className="mr-2 h-4 w-4" />
                              Upgrade
                            </Button>
                          </Link>
                          <Link href="/hospitals">
                            <Button size="sm" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                              <Building2 className="mr-2 h-4 w-4" />
                              Hospitals
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6 bg-white">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Financial Assistance Cap</p>
                        <p className="text-xl font-bold">₹{membership.coverageAmount ? membership.coverageAmount.toLocaleString("en-IN") : "Not Set"}</p>
                        <Progress value={0} className="h-2" />
                        <p className="text-xs text-muted-foreground">₹0 used this year</p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Accident Support Enabled</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Medical Emergency Enabled</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-amber-500" />
                          <span>30 Day Waiting Period: Active</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Schedule Card - Monthly Tracking */}
                {paymentSchedule?.hasSchedule && (
                  <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Payment Schedule
                      </CardTitle>
                      <CardDescription>
                        {paymentSchedule.subscriptionPeriod} subscription - Track your payments
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                          <p className="text-xs text-blue-600 font-medium">Next Payment</p>
                          <p className="text-lg font-bold text-blue-900">
                            ₹{paymentSchedule.nextPaymentAmount?.toLocaleString("en-IN") || "N/A"}
                          </p>
                          <p className="text-xs text-blue-600">
                            {paymentSchedule.nextPaymentDate 
                              ? new Date(paymentSchedule.nextPaymentDate).toLocaleDateString("en-IN", { 
                                  day: "numeric", month: "short", year: "numeric" 
                                })
                              : "N/A"}
                          </p>
                        </div>
                        
                        <div className={`p-4 rounded-lg border ${
                          paymentSchedule.isOverdue 
                            ? "bg-red-50 border-red-100" 
                            : paymentSchedule.isDueSoon 
                              ? "bg-amber-50 border-amber-100"
                              : "bg-green-50 border-green-100"
                        }`}>
                          <p className={`text-xs font-medium ${
                            paymentSchedule.isOverdue 
                              ? "text-red-600" 
                              : paymentSchedule.isDueSoon 
                                ? "text-amber-600"
                                : "text-green-600"
                          }`}>Due Status</p>
                          <p className={`text-lg font-bold ${
                            paymentSchedule.isOverdue 
                              ? "text-red-900" 
                              : paymentSchedule.isDueSoon 
                                ? "text-amber-900"
                                : "text-green-900"
                          }`}>
                            {paymentSchedule.isOverdue 
                              ? `Overdue by ${Math.abs(paymentSchedule.daysUntilDue)} days`
                              : paymentSchedule.isDueSoon 
                                ? `Due in ${paymentSchedule.daysUntilDue} days`
                                : `${paymentSchedule.daysUntilDue} days left`}
                          </p>
                          <p className={`text-xs ${
                            paymentSchedule.isOverdue 
                              ? "text-red-600" 
                              : paymentSchedule.isDueSoon 
                                ? "text-amber-600"
                                : "text-green-600"
                          }`}>
                            {paymentSchedule.isOverdue 
                              ? "Please renew now"
                              : paymentSchedule.isDueSoon 
                                ? "Renewal reminder"
                                : "All payments current"}
                          </p>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                          <p className="text-xs text-purple-600 font-medium">Total Paid</p>
                          <p className="text-lg font-bold text-purple-900">
                            ₹{paymentSchedule.totalPaid?.toLocaleString("en-IN") || "0"}
                          </p>
                          <p className="text-xs text-purple-600">
                            {paymentSchedule.paymentCount || 0} payment(s)
                          </p>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                          <p className="text-xs text-slate-600 font-medium">Plan Period</p>
                          <p className="text-lg font-bold text-slate-900">
                            {paymentSchedule.subscriptionPeriod}
                          </p>
                          <p className="text-xs text-slate-600">
                            {paymentSchedule.planName}
                          </p>
                        </div>
                      </div>
                      
                      {(paymentSchedule.isOverdue || paymentSchedule.isDueSoon) && (
                        <div className="mt-4 flex justify-end">
                          <Link href={`/payment?plan=${membership?.planType}`}>
                            <Button size="sm" variant={paymentSchedule.isOverdue ? "destructive" : "default"}>
                              <CreditCard className="mr-2 h-4 w-4" />
                              {paymentSchedule.isOverdue ? "Renew Now" : "Pay Early"}
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
              ) : membership?.status === "pending_cash" ? (
                <Card className="border-none shadow-sm overflow-hidden">
                  <div className="bg-amber-600 p-6 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Clock className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                      <Badge variant="outline" className="text-white border-white/30 bg-white/10 mb-2">
                        {membership.planType || "Selected"} Plan
                      </Badge>
                      <h2 className="text-3xl font-bold mb-2">Processing</h2>
                      <p className="text-white/80">Your cash payment is being verified</p>
                    </div>
                  </div>
                  <CardContent className="p-6 bg-white">
                    <div className="text-center py-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <p className="text-amber-800 text-sm">
                          Your membership is currently being processed. The super admin will activate your membership once the cash payment has been received and submitted to the company. Please contact your agent or company representative for updates.
                        </p>
                      </div>
                      <p className="text-muted-foreground text-xs">Membership Number: {membership.membershipNumber}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : membership?.status === "pending_payment" ? (
                <Card className="border-none shadow-sm overflow-hidden">
                  <div className="bg-amber-500 p-6 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Clock className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                      <Badge variant="outline" className="text-white border-white/30 bg-white/10 mb-2">
                        {membership.planType || "Selected"} Plan
                      </Badge>
                      <h2 className="text-3xl font-bold mb-2">Payment Pending</h2>
                      <p className="text-white/80">Complete your payment to activate your membership</p>
                    </div>
                  </div>
                  <CardContent className="p-6 bg-white">
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">Your plan selection is saved. Complete payment to get started.</p>
                      <div className="flex gap-3 justify-center">
                        <Link href="/plans">
                          <Button variant="outline">
                            <Shield className="mr-2 h-4 w-4" />
                            View Plans
                          </Button>
                        </Link>
                        <Link href={`/payment?plan=${membership.planType}`}>
                          <Button>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Complete Payment
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-none shadow-sm overflow-hidden">
                  <div className="bg-slate-600 p-6 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Shield className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-bold mb-2">No Active Plan</h2>
                      <p className="text-white/80">Choose a plan to protect yourself and your family</p>
                    </div>
                  </div>
                  <CardContent className="p-6 bg-white">
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">Get started with Raksha Assist emergency support today!</p>
                      <Link href="/plans">
                        <Button size="lg">
                          <Shield className="mr-2 h-5 w-5" />
                          View Plans & Get Started
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {sosCases.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Activity className="h-5 w-5 text-red-500" />
                      SOS Case Tracking
                    </h3>
                  </div>
                  
                  {sosCases.slice(0, 5).map((sosCase: any) => {
                    const steps = [
                      { label: "SOS Triggered", key: "triggered", icon: AlertCircle, done: true },
                      { label: "Support Assigned", key: "assigned", icon: UserCheck, done: ["assigned", "in_progress", "sanctioned", "completed", "closed"].includes(sosCase.status) },
                      { label: "In Progress", key: "in_progress", icon: MapPin, done: ["in_progress", "sanctioned", "completed", "closed"].includes(sosCase.status) },
                      { label: "Under Review", key: "review", icon: Phone, done: ["sanctioned", "completed", "closed"].includes(sosCase.status) },
                      { label: "Amount Sanctioned", key: "sanctioned", icon: CircleDollarSign, done: ["sanctioned", "completed", "closed"].includes(sosCase.status) },
                      { label: "Completed", key: "completed", icon: CheckCircle2, done: ["completed", "closed"].includes(sosCase.status) },
                    ];
                    const currentStep = steps.findIndex(s => !s.done);
                    const progressPercent = currentStep === -1 ? 100 : Math.round((currentStep / steps.length) * 100);
                    
                    const statusColors: Record<string, string> = {
                      pending: "bg-amber-100 text-amber-700",
                      assigned: "bg-blue-100 text-blue-700",
                      in_progress: "bg-purple-100 text-purple-700",
                      sanctioned: "bg-green-100 text-green-700",
                      completed: "bg-emerald-100 text-emerald-700",
                      closed: "bg-slate-100 text-slate-700",
                      rejected: "bg-red-100 text-red-700",
                      spam: "bg-gray-100 text-gray-700",
                    };
                    
                    const statusLabels: Record<string, string> = {
                      pending: "Awaiting Response",
                      assigned: "Support Person Assigned",
                      in_progress: "In Progress",
                      sanctioned: "Amount Sanctioned",
                      completed: "Completed",
                      closed: "Case Closed",
                      rejected: "Rejected",
                      spam: "Marked as Spam",
                    };
                    
                    return (
                      <Card key={sosCase.id} className="border-none shadow-sm">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="font-bold text-slate-900">Case #{sosCase.caseNumber || sosCase.id?.slice(0, 8)}</p>
                              <p className="text-xs text-muted-foreground">
                                {sosCase.emergencyType || "Emergency"} - {new Date(sosCase.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                            <Badge className={`border-none ${statusColors[sosCase.status] || "bg-slate-100 text-slate-700"}`}>
                              {statusLabels[sosCase.status] || sosCase.status}
                            </Badge>
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span>{progressPercent}%</span>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                          </div>
                          
                          <div className="grid grid-cols-6 gap-1">
                            {steps.map((step, idx) => {
                              const StepIcon = step.icon;
                              return (
                                <div key={step.key} className="flex flex-col items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                    step.done 
                                      ? "bg-green-100 text-green-600" 
                                      : idx === currentStep 
                                        ? "bg-blue-100 text-blue-600 animate-pulse" 
                                        : "bg-slate-100 text-slate-400"
                                  }`}>
                                    <StepIcon className="h-4 w-4" />
                                  </div>
                                  <p className={`text-[9px] text-center leading-tight ${step.done ? "text-green-600 font-medium" : "text-slate-400"}`}>
                                    {step.label}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                          
                          {sosCase.assignedTo && (
                            <div className="mt-3 p-2 bg-blue-50 rounded-lg flex items-center gap-2 text-sm">
                              <UserCheck className="h-4 w-4 text-blue-600" />
                              <span className="text-blue-700">Support Person: {sosCase.assignedToName || "Assigned"}</span>
                            </div>
                          )}
                          
                          {sosCase.settlementAmount && (
                            <div className="mt-2 p-2 bg-green-50 rounded-lg flex items-center gap-2 text-sm">
                              <CircleDollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-green-700">Settlement: ₹{Number(sosCase.settlementAmount).toLocaleString("en-IN")}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Assistance Requests</h3>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                
                {hasRequest ? (
                  emergencyRequests.slice(0, 3).map((request: any) => (
                    <Card key={request.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <PlusCircle className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{request.hospitalName}</p>
                            <p className="text-xs text-muted-foreground">{request.caseType}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={`border-none ${
                            request.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            request.status === 'approved' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-slate-300" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                    <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">No active requests found</p>
                    <p className="text-slate-400 text-sm">When you submit a request, it will appear here.</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    My Add-On Benefits
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => setAddOnShopOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Get More
                  </Button>
                </div>
                
                {myAddOns.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {myAddOns.map((addon: any) => {
                      const isExpired = new Date(addon.expiresAt) < new Date();
                      const isExhausted = addon.isExhausted || addon.usageCount >= addon.usageLimit;
                      
                      return (
                        <Card key={addon.id} className={`border-none shadow-sm ${isExpired || isExhausted ? 'opacity-60' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${isExpired || isExhausted ? 'bg-slate-100' : 'bg-green-50'}`}>
                                  <Gift className={`h-4 w-4 ${isExpired || isExhausted ? 'text-slate-400' : 'text-green-600'}`} />
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">{addon.benefit?.name || "Benefit"}</p>
                                  <p className="text-xs text-muted-foreground">{addon.benefit?.benefitCode === 'THIRD_PARTY_ACCIDENT' ? `${addon.benefit?.benefitAmount}% of membership fee` : `₹${addon.benefit?.benefitAmount?.toLocaleString()} support`}</p>
                                </div>
                              </div>
                              <Badge variant={isExpired ? "destructive" : isExhausted ? "secondary" : "outline"} className="text-xs">
                                {isExpired ? "Expired" : isExhausted ? "Used" : "Active"}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 pt-3 border-t">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Expires: {new Date(addon.expiresAt).toLocaleDateString()}</span>
                              </div>
                              <span>Usage: {addon.usageCount}/{addon.usageLimit}</span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="border-2 border-dashed border-slate-200">
                    <CardContent className="p-8 text-center">
                      <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Gift className="h-6 w-6 text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-medium">No add-on benefits yet</p>
                      <p className="text-slate-400 text-sm mb-4">Enhance your protection with additional benefits</p>
                      <Button size="sm" onClick={() => setAddOnShopOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Browse Add-Ons
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="space-y-8">
              <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Member Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{user?.name || "Member"}</p>
                      <p className="text-xs text-muted-foreground">+91 {user?.mobile}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Plan Type</span>
                      <span className="font-medium capitalize">{membership?.planType || "Individual"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline" className={`capitalize ${
                        membership?.status === "active" ? "text-green-600 bg-green-50 border-green-200" :
                        membership?.status === "pending_cash" ? "text-amber-600 bg-amber-50 border-amber-200" :
                        "text-slate-600 bg-slate-50 border-slate-200"
                      }`}>{membership?.status === "pending_cash" ? "Processing" : membership?.status || "Pending"}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {purchasableAddOns.length > 0 && (
                <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-blue-50 border-purple-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      Upgrade Protection
                    </CardTitle>
                    <CardDescription>Add extra benefits to your plan</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {purchasableAddOns.slice(0, 2).map((addon) => (
                      <div key={addon.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">{addon.name}</p>
                          <p className="text-xs text-muted-foreground">{addon.benefitCode === 'THIRD_PARTY_ACCIDENT' ? `${addon.benefitAmount}% of membership fee` : `₹${addon.benefitAmount?.toLocaleString()} support`}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePurchaseAddOn(addon.id)}
                          disabled={purchasingAddOnId === addon.id}
                        >
                          {purchasingAddOnId === addon.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>₹{addon.price}</>
                          )}
                        </Button>
                      </div>
                    ))}
                    {purchasableAddOns.length > 2 && (
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => setAddOnShopOpen(true)}>
                        View All ({purchasableAddOns.length} available)
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className="border-none shadow-sm bg-slate-900 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Need Help?</CardTitle>
                  <CardDescription className="text-slate-400">Our AI support team is available 24/7.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 font-bold"
                    onClick={() => setSosOpen(true)}
                    data-testid="button-sos-help"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Get AI Support Now
                  </Button>
                  <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Helpline
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <SOSChat open={sosOpen} onOpenChange={setSosOpen} />
      <SOSTrigger open={sosTriggerOpen} onOpenChange={setSosTriggerOpen} hasActiveMembership={membership?.status === 'active'} />

      <Dialog open={addOnShopOpen} onOpenChange={setAddOnShopOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Add-On Benefits Store
            </DialogTitle>
            <DialogDescription>
              Enhance your protection with additional benefits
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {purchasableAddOns.length > 0 ? (
              purchasableAddOns.map((addon) => (
                <Card key={addon.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Gift className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold">{addon.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{addon.description}</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="outline">{addon.benefitCode === 'THIRD_PARTY_ACCIDENT' ? `${addon.benefitAmount}% of membership fee` : `₹${addon.benefitAmount?.toLocaleString()} support`}</Badge>
                          <Badge variant="outline">{addon.usageLimit} use(s)</Badge>
                          <Badge variant="outline">{addon.validityDays} days validity</Badge>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-primary mb-2">₹{addon.price}</p>
                        <Button 
                          size="sm"
                          onClick={() => handlePurchaseAddOn(addon.id)}
                          disabled={purchasingAddOnId === addon.id}
                        >
                          {purchasingAddOnId === addon.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <PlusCircle className="h-4 w-4 mr-1" />
                          )}
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <p className="text-muted-foreground">You have all available add-ons!</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
