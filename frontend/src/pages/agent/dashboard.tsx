import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { fetchWithCsrf } from "@/lib/csrf";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { 
  Users, 
  UserPlus, 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  Search,
  FileText,
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  Building2,
  IndianRupee,
  BarChart3,
  Target,
  Award,
  Gift
} from "lucide-react";

const CHART_COLORS = {
  primary: "#0B1F3A",
  secondary: "#179299",
  accent: "#F6A60B",
  success: "#10B981",
  purple: "#8B5CF6",
};

export default function AgentDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: "",
    bankAccountNumber: "",
    bankIfsc: "",
    bankAccountHolder: "",
    upiId: ""
  });

  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["agentDashboard"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/agent/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: emergencyRequests = [] } = useQuery({
    queryKey: ["emergencyRequests"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/emergency-requests");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const { data: analytics } = useQuery({
    queryKey: ["analytics", "agent"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/analytics/agent");
      if (!res.ok) return null;
      return res.json();
    }
  });

  const { data: addOnCatalog = [] } = useQuery({
    queryKey: ["agent", "addOnCatalog"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/agent/add-on-benefits");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const updatePayoutPreference = useMutation({
    mutationFn: async (preference: string) => {
      const res = await fetchWithCsrf("/api/agent/payout-preference", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutPreference: preference })
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentDashboard"] });
      toast({ title: "Success", description: "Payout preference updated" });
    }
  });

  const updateBankDetails = useMutation({
    mutationFn: async (data: typeof bankForm) => {
      const res = await fetchWithCsrf("/api/agent/bank-details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentDashboard"] });
      setBankDialogOpen(false);
      toast({ title: "Success", description: "Bank details updated" });
    }
  });

  const requestPayout = useMutation({
    mutationFn: async () => {
      const res = await fetchWithCsrf("/api/agent/request-payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentDashboard"] });
      toast({ title: "Payout Requested", description: "Your payout request has been submitted" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const pendingAlerts = emergencyRequests.filter((r: any) => r.status === "pending");
  const stats = dashboardData?.stats || {};
  const agent = dashboardData?.agent;
  const memberships = dashboardData?.memberships || [];

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">
                  Authorized Partner
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {agent?.payoutPreference || "weekly"} payout
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Partner Dashboard</h1>
              <p className="text-muted-foreground">Welcome, {dashboardData?.user?.name || "Partner"}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/agent/register-member">
                <Button className="shadow-lg shadow-primary/20" data-testid="button-register-member">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register New Customer
                </Button>
              </Link>
            </div>
          </div>

          {pendingAlerts.length > 0 && (
            <Card className="border-2 border-red-500 bg-red-50 mb-8 animate-pulse">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-red-600">Emergency Alerts ({pendingAlerts.length})</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingAlerts.slice(0, 3).map((alert: any) => (
                    <div 
                      key={alert.id} 
                      className="bg-white rounded-lg p-4 border border-red-200 shadow-sm"
                      data-testid={`alert-card-${alert.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-red-600 text-white">{alert.caseType}</Badge>
                            <span className="text-sm text-slate-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(alert.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="font-bold text-slate-900">{alert.hospitalName}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Location pending
                            </span>
                            <span className="font-bold text-red-600">₹{alert.amountRequested?.toLocaleString()}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Customers" 
              value={stats.totalMembers || 0}
              trend="Registered by you" 
              icon={Users} 
              color="text-blue-600" 
              bg="bg-blue-50" 
            />
            <StatCard 
              title="Total Sales" 
              value={formatCurrency(stats.totalSales || 0)}
              trend="Lifetime earnings" 
              icon={Wallet} 
              color="text-green-600" 
              bg="bg-green-50" 
            />
            <StatCard 
              title="Total Commission" 
              value={formatCurrency(stats.totalCommission || 0)}
              trend={`Pending: ${formatCurrency(stats.pendingCommission || 0)}`}
              icon={TrendingUp} 
              color="text-purple-600" 
              bg="bg-purple-50" 
            />
            <StatCard 
              title="Commission Rate" 
              value="15%"
              trend="On every sale" 
              icon={ShieldCheck} 
              color="text-orange-600" 
              bg="bg-orange-50" 
            />
          </div>

          {analytics && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-secondary" />
                    Monthly Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={analytics.monthlyPerformance}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.accent} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={CHART_COLORS.accent} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                        formatter={(value: number, name: string) => [
                          name === "commission" ? `₹${value.toLocaleString()}` : value,
                          name === "commission" ? "Commission" : "Sales"
                        ]}
                      />
                      <Area type="monotone" dataKey="sales" stroke={CHART_COLORS.secondary} fillOpacity={1} fill="url(#colorSales)" name="Sales" />
                      <Area type="monotone" dataKey="commission" stroke={CHART_COLORS.accent} fillOpacity={1} fill="url(#colorCommission)" name="Commission" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-purple-600" />
                    Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl">
                      <p className="text-sm text-teal-700 font-medium">This Month</p>
                      <p className="text-2xl font-bold text-teal-900">{analytics.sales.thisMonth} sales</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                      <p className="text-sm text-purple-700 font-medium">Last Month</p>
                      <p className="text-2xl font-bold text-purple-900">{analytics.sales.lastMonth} sales</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-700 font-medium">Total Earnings</p>
                        <p className="text-2xl font-bold text-amber-900">₹{analytics.commissions.total.toLocaleString()}</p>
                      </div>
                      <Award className="h-10 w-10 text-amber-600 opacity-40" />
                    </div>
                    <div className="mt-2 flex gap-4 text-sm">
                      <span className="text-green-600">Paid: ₹{analytics.commissions.paid.toLocaleString()}</span>
                      <span className="text-amber-600">Pending: ₹{analytics.commissions.pending.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Registrations</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search member..." className="pl-9 h-9" data-testid="input-search-member" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {memberships.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No registrations yet</p>
                        <p className="text-sm">Start registering members to earn commission</p>
                      </div>
                    ) : (
                      memberships.slice(0, 5).map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-slate-500 font-bold border">
                              {member.membershipNumber?.slice(-2)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{member.membershipNumber}</p>
                              <p className="text-xs text-muted-foreground">{member.planType} • {new Date(member.startDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">₹{member.planAmount?.toLocaleString()}</p>
                            <Badge variant="outline" className={`text-[10px] ${member.status === 'active' ? 'text-green-600 bg-green-50 border-green-200' : 'text-amber-600 bg-amber-50 border-amber-200'}`}>
                              {member.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-none shadow-sm bg-gradient-to-br from-primary to-primary/80 text-white">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IndianRupee className="h-5 w-5" />
                    Payout Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white/80 text-xs">Payout Frequency</Label>
                    <Select 
                      value={agent?.payoutPreference || "weekly"}
                      onValueChange={(v) => updatePayoutPreference.mutate(v)}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1" data-testid="select-payout-preference">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-3 bg-white/10 rounded-lg">
                    <p className="text-xs text-white/70">Pending Commission</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.pendingCommission || 0)}</p>
                  </div>

                  <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="secondary" className="w-full bg-white/10 text-white hover:bg-white/20 border-none" data-testid="button-bank-details">
                        <Building2 className="mr-2 h-4 w-4" />
                        {agent?.bankAccountNumber ? "Update Bank Details" : "Add Bank Details"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Bank Account Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Bank Name</Label>
                          <Input 
                            value={bankForm.bankName} 
                            onChange={(e) => setBankForm(f => ({...f, bankName: e.target.value}))}
                            placeholder="e.g., State Bank of India"
                            data-testid="input-bank-name"
                          />
                        </div>
                        <div>
                          <Label>Account Holder Name</Label>
                          <Input 
                            value={bankForm.bankAccountHolder} 
                            onChange={(e) => setBankForm(f => ({...f, bankAccountHolder: e.target.value}))}
                            placeholder="As per bank records"
                            data-testid="input-account-holder"
                          />
                        </div>
                        <div>
                          <Label>Account Number</Label>
                          <Input 
                            value={bankForm.bankAccountNumber} 
                            onChange={(e) => setBankForm(f => ({...f, bankAccountNumber: e.target.value}))}
                            placeholder="Enter account number"
                            data-testid="input-account-number"
                          />
                        </div>
                        <div>
                          <Label>IFSC Code</Label>
                          <Input 
                            value={bankForm.bankIfsc} 
                            onChange={(e) => setBankForm(f => ({...f, bankIfsc: e.target.value.toUpperCase()}))}
                            placeholder="e.g., SBIN0001234"
                            maxLength={11}
                            data-testid="input-ifsc"
                          />
                        </div>
                        <div>
                          <Label>UPI ID (Optional)</Label>
                          <Input 
                            value={bankForm.upiId} 
                            onChange={(e) => setBankForm(f => ({...f, upiId: e.target.value}))}
                            placeholder="yourname@upi"
                            data-testid="input-upi"
                          />
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={() => updateBankDetails.mutate(bankForm)}
                          disabled={updateBankDetails.isPending}
                          data-testid="button-save-bank"
                        >
                          {updateBankDetails.isPending ? "Saving..." : "Save Bank Details"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    className="w-full bg-white text-primary hover:bg-white/90"
                    onClick={() => requestPayout.mutate()}
                    disabled={requestPayout.isPending || (stats.pendingCommission || 0) < 100}
                    data-testid="button-request-payout"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {requestPayout.isPending ? "Processing..." : "Request Payout"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/agent/register-member">
                    <Button variant="outline" className="w-full justify-start">
                      <UserPlus className="mr-2 h-4 w-4" /> Register Customer
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" /> Register Family
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" /> Download Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-green-600 hover:bg-green-50"
                    onClick={() => window.open('/agent-terms', '_blank')}
                  >
                    <FileText className="mr-2 h-4 w-4" /> View Agent Terms
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open('/api/policies/agent_terms/pdf', '_blank')}
                  >
                    <FileText className="mr-2 h-4 w-4" /> Download Agent Terms PDF
                  </Button>
                </CardContent>
              </Card>

              {/* Add-On Benefits Catalog */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    Add-On Benefits Catalog
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{addOnCatalog.length} add-ons available for customers</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
                    {addOnCatalog.length > 0 ? (
                      addOnCatalog.map((addon: any) => (
                        <div key={addon.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{addon.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{addon.description}</p>
                            </div>
                            <Badge variant="outline" className="text-green-600 ml-2 whitespace-nowrap">
                              ₹{addon.price?.toLocaleString()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span className="text-green-700 font-medium">
                              {addon.benefitCode === 'THIRD_PARTY_ACCIDENT' ? `${addon.benefitAmount}% of fee` : `₹${addon.benefitAmount?.toLocaleString()} support`}
                            </span>
                            <span>Valid: {addon.validityDays}d</span>
                            <span>Uses: {addon.usageLimit}</span>
                            <Badge variant="secondary" className="text-[10px] capitalize">{addon.category}</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No add-on benefits available
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Recommend these add-ons to your customers for extra support
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, color, bg }: any) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${bg}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${bg} ${color}`}>
            {trend}
          </span>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
