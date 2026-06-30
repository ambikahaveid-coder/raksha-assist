import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { fetchWithCsrf } from "@/lib/csrf";
import { 
  IndianRupee, TrendingUp, Users, FileText, Download, Calendar,
  CreditCard, Wallet, PieChart, BarChart3, ArrowUpRight, ArrowDownRight,
  Search, Filter, Loader2, Building2, Percent, Receipt, Clock, Banknote, CheckCircle
} from "lucide-react";

export default function AccountantDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("month");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { user, isLoading: userLoading } = useAuth();

  const isAuthorized = !!user && ["accountant", "admin", "super_admin"].includes(user.role);

  const { data: reports } = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/reports");
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAuthorized
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/payments");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthorized
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ["admin", "commission-config"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/commission-config");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthorized
  });

  const { data: pendingCashPayments = [], isLoading: cashLoading } = useQuery({
    queryKey: ["accountant", "pending-cash-payments"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/accountant/pending-cash-payments");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthorized,
    refetchInterval: 30000
  });

  const confirmCashMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const res = await fetchWithCsrf("/api/accountant/confirm-cash-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to confirm payment");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Success", description: data.message || "Cash payment confirmed" });
      queryClient.invalidateQueries({ queryKey: ["accountant", "pending-cash-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const totalRevenue = reports?.totalRevenue || 0;
  const gstAmount = Math.round(totalRevenue * 0.18 / 1.18);
  const totalCommissions = reports?.agentCommissions || 0;
  const netRevenue = totalRevenue - gstAmount - totalCommissions;
  const totalMemberships = reports?.totalMemberships || 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
                  Accounts Department
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Accountant Dashboard</h1>
              <p className="text-muted-foreground">Welcome, {user?.name || "Accountant"}</p>
            </div>
            <div className="flex items-center gap-3">
              <select 
                className="px-3 py-2 bg-white border rounded-lg text-sm"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border-none shadow-sm bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-green-700 font-medium">Gross Revenue</p>
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-800">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+12% from last month</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-blue-700 font-medium">GST Liability (18%)</p>
                  <Receipt className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-800">₹{gstAmount.toLocaleString()}</p>
                <p className="text-xs text-blue-600 mt-1">To be filed quarterly</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-purple-700 font-medium">Agent Commissions</p>
                  <Percent className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-purple-800">₹{totalCommissions.toLocaleString()}</p>
                <p className="text-xs text-purple-600 mt-1">15% of collections</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-amber-700 font-medium">Net Revenue</p>
                  <Wallet className="h-4 w-4 text-amber-600" />
                </div>
                <p className="text-3xl font-bold text-amber-800">₹{netRevenue.toLocaleString()}</p>
                <p className="text-xs text-amber-600 mt-1">After deductions</p>
              </CardContent>
            </Card>
          </div>

          {/* Pending Cash Payments Section */}
          {pendingCashPayments.length > 0 && (
            <Card className="border-none shadow-sm mb-8 border-l-4 border-l-amber-500">
              <CardHeader className="bg-amber-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-amber-600" />
                    <CardTitle className="text-lg text-amber-800">Pending Cash Payments</CardTitle>
                    <Badge className="bg-amber-500 text-white">{pendingCashPayments.length}</Badge>
                  </div>
                </div>
                <CardDescription className="text-amber-700">
                  Confirm cash received to activate memberships
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {pendingCashPayments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-slate-900">{payment.userName}</span>
                          <Badge variant="outline" className="text-amber-700 border-amber-300">
                            {payment.membershipNumber}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-4">
                          <span>{payment.userMobile}</span>
                          <span>•</span>
                          <span>{payment.planName}</span>
                          <span>•</span>
                          <span className="text-slate-400">
                            {new Date(payment.createdAt).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-slate-900">
                          ₹{payment.amount?.toLocaleString()}
                        </span>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => confirmCashMutation.mutate(payment.id)}
                          disabled={confirmCashMutation.isPending}
                        >
                          {confirmCashMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Confirm Cash
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white border shadow-sm p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <PieChart className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="payments" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <CreditCard className="h-4 w-4 mr-2" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="commissions" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Percent className="h-4 w-4 mr-2" />
                Commissions
              </TabsTrigger>
              <TabsTrigger value="gst" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Receipt className="h-4 w-4 mr-2" />
                GST Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Balance Sheet Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between p-4 bg-green-50 rounded-lg">
                      <span className="font-medium">Total Collections</span>
                      <span className="font-bold text-green-700">₹{totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-4 bg-red-50 rounded-lg">
                      <span className="font-medium">Less: GST Payable</span>
                      <span className="font-bold text-red-700">- ₹{gstAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-4 bg-red-50 rounded-lg">
                      <span className="font-medium">Less: Agent Commissions</span>
                      <span className="font-bold text-red-700">- ₹{totalCommissions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary">
                      <span className="font-bold">Net Retained Earnings</span>
                      <span className="font-bold text-primary">₹{netRevenue.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-slate-400" />
                        <span>Total Memberships</span>
                      </div>
                      <span className="font-bold">{totalMemberships}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-slate-400" />
                        <span>Successful Payments</span>
                      </div>
                      <span className="font-bold">{payments.filter((p: any) => p.status === 'completed').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-slate-400" />
                        <span>Pending Payments</span>
                      </div>
                      <span className="font-bold text-amber-600">{payments.filter((p: any) => p.status === 'pending').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-slate-400" />
                        <span>Avg. Transaction Value</span>
                      </div>
                      <span className="font-bold">₹{payments.length > 0 ? Math.round(totalRevenue / payments.length).toLocaleString() : 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Payment Transactions</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input className="pl-10 w-64" placeholder="Search transactions..." />
                      </div>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Transaction ID</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Member</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">GST</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {payments.length > 0 ? payments.slice(0, 10).map((payment: any) => (
                          <tr key={payment.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm font-mono">{payment.transactionId || payment.id.slice(0, 8)}</td>
                            <td className="px-4 py-3 text-sm">{payment.membershipId?.slice(0, 8)}...</td>
                            <td className="px-4 py-3 text-sm font-bold">₹{payment.amount?.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-slate-500">₹{Math.round((payment.amount || 0) * 0.18 / 1.18).toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-slate-500">{new Date(payment.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                                {payment.status}
                              </Badge>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No payments found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="commissions" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card className="border-none shadow-sm">
                  <CardContent className="pt-4">
                    <p className="text-sm text-slate-500">Agent Commissions (15%)</p>
                    <p className="text-2xl font-bold text-blue-600">₹{Math.round(totalRevenue * 0.15).toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="pt-4">
                    <p className="text-sm text-slate-500">Franchise Total (18%)</p>
                    <p className="text-xl font-bold text-purple-600">₹{Math.round(totalRevenue * 0.18).toLocaleString()}</p>
                    <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                      <p>City: ₹{Math.round(totalRevenue * 0.06).toLocaleString()} (6%)</p>
                      <p>District: ₹{Math.round(totalRevenue * 0.05).toLocaleString()} (5%)</p>
                      <p>State: ₹{Math.round(totalRevenue * 0.04).toLocaleString()} (4%)</p>
                      <p>Zone: ₹{Math.round(totalRevenue * 0.03).toLocaleString()} (3%)</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="pt-4">
                    <p className="text-sm text-slate-500">Company Retention (67%)</p>
                    <p className="text-2xl font-bold text-green-600">₹{Math.round(totalRevenue * 0.67).toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Commission Structure</CardTitle>
                  <CardDescription>Standard commission rates for all franchise levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Level</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Rate</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Estimated Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {[
                          { level: "Agent", rate: 15, color: "text-blue-600" },
                          { level: "City Franchise", rate: 6, color: "text-purple-600" },
                          { level: "District Franchise", rate: 5, color: "text-indigo-600" },
                          { level: "State Franchise", rate: 4, color: "text-violet-600" },
                          { level: "Zone Franchise", rate: 3, color: "text-pink-600" },
                          { level: "Super Admin (Company)", rate: 67, color: "text-green-600" },
                        ].map((item) => (
                          <tr key={item.level} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm font-medium">{item.level}</td>
                            <td className="px-4 py-3 text-sm"><Badge variant="outline">{item.rate}%</Badge></td>
                            <td className={`px-4 py-3 text-sm font-bold ${item.color}`}>₹{Math.round(totalRevenue * item.rate / 100).toLocaleString()}</td>
                            <td className="px-4 py-3"><Badge variant="secondary">Calculated</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-100">
                        <tr>
                          <td className="px-4 py-3 text-sm font-bold">Total</td>
                          <td className="px-4 py-3 text-sm font-bold">100%</td>
                          <td className="px-4 py-3 text-sm font-bold text-primary">₹{totalRevenue.toLocaleString()}</td>
                          <td className="px-4 py-3"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Agent Payouts</CardTitle>
                      <CardDescription>Individual agent commission payments</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Agent</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Policies Sold</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Revenue Generated</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Commission (15%)</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {commissions.length > 0 ? commissions.slice(0, 10).map((c: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm font-medium">{c.agentName || c.name || "N/A"}</td>
                            <td className="px-4 py-3 text-sm">{c.policiesSold || c.salesCount || 0}</td>
                            <td className="px-4 py-3 text-sm">₹{(c.revenue || c.totalSales || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm font-bold text-purple-600">₹{(c.commission || c.commissionAmount || 0).toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <Badge variant={c.status === 'paid' ? 'default' : 'secondary'}>
                                {c.status || c.paymentStatus || 'Pending'}
                              </Badge>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                              No commission data available yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gst" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm">
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-500 mb-2">CGST (9%)</p>
                    <p className="text-2xl font-bold">₹{Math.round(gstAmount / 2).toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-500 mb-2">SGST (9%)</p>
                    <p className="text-2xl font-bold">₹{Math.round(gstAmount / 2).toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-500 mb-2">Total GST Liability</p>
                    <p className="text-2xl font-bold text-blue-600">₹{gstAmount.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">GST Filing Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['GSTR-1', 'GSTR-3B', 'GSTR-9'].map((form, i) => (
                      <div key={form} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="font-medium">{form}</p>
                            <p className="text-xs text-slate-400">{form === 'GSTR-9' ? 'Annual Return' : 'Monthly Return'}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                          Pending
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
