import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { 
  FileText, 
  Shield, 
  Users, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle,
  TrendingUp,
  IndianRupee,
  Download,
  Filter,
  Search,
  Calendar,
  UserX,
  ClipboardCheck,
  Wallet,
  Activity,
  Printer
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const CHART_COLORS = {
  primary: "#0B1F3A",
  secondary: "#179299",
  accent: "#F6A60B",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  purple: "#8B5CF6",
};

export default function ReportsDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("sos-cases");
  const [dateRange, setDateRange] = useState("last30days");

  const printReport = () => {
    const activeTabContent = document.querySelector(`[data-state="active"][role="tabpanel"]`);
    if (!activeTabContent) {
      alert("No content to print. Please select a report tab first.");
      return;
    }
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocked. Please allow popups for this site to print reports.");
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Raksha Assist - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #0B1F3A; margin-bottom: 10px; }
            h2 { color: #179299; margin-top: 20px; }
            .print-header { border-bottom: 2px solid #0B1F3A; padding-bottom: 10px; margin-bottom: 20px; }
            .print-date { color: #666; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .stat-box { display: inline-block; padding: 15px; margin: 5px; border: 1px solid #ddd; border-radius: 8px; min-width: 150px; }
            .stat-label { color: #666; font-size: 12px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #0B1F3A; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Raksha Assist - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report</h1>
            <p class="print-date">Generated on: ${new Date().toLocaleString()}</p>
            <p class="print-date">Period: ${dateRange === "last7days" ? "Last 7 Days" : dateRange === "last30days" ? "Last 30 Days" : dateRange === "last90days" ? "Last 90 Days" : "All Time"}</p>
          </div>
          ${activeTabContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      if (!res.ok) return null;
      return res.json();
    },
    retry: false
  });

  const isAuthenticated = !!user && ["admin", "super_admin", "accountant"].includes(user.role);

  const { data: reportsData } = useQuery({
    queryKey: ["reports", "all", dateRange],
    queryFn: async () => {
      const res = await fetch(`/api/reports/summary?range=${dateRange}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAuthenticated
  });

  const { data: claimsData } = useQuery({
    queryKey: ["reports", "claims", dateRange],
    queryFn: async () => {
      const res = await fetch(`/api/reports/claims?range=${dateRange}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAuthenticated
  });

  const { data: hospitalsData } = useQuery({
    queryKey: ["reports", "hospitals"],
    queryFn: async () => {
      const res = await fetch("/api/reports/hospitals");
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAuthenticated
  });

  const { data: financialData } = useQuery({
    queryKey: ["reports", "financial", dateRange],
    queryFn: async () => {
      const res = await fetch(`/api/reports/financial?range=${dateRange}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAuthenticated
  });

  const { data: membersData } = useQuery({
    queryKey: ["reports", "members", dateRange],
    queryFn: async () => {
      const res = await fetch(`/api/reports/members?range=${dateRange}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAuthenticated
  });

  const { data: auditData } = useQuery({
    queryKey: ["reports", "audit", dateRange],
    queryFn: async () => {
      const res = await fetch(`/api/reports/audit?range=${dateRange}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAuthenticated
  });

  const { data: blockedUsersData } = useQuery({
    queryKey: ["reports", "blocked-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/blocked-users", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated
  });

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const claimsStatusData = [
    { name: "Under Verification", value: claimsData?.underVerification || 12, color: CHART_COLORS.warning },
    { name: "Approved", value: claimsData?.approved || 45, color: CHART_COLORS.success },
    { name: "Rejected", value: claimsData?.rejected || 8, color: CHART_COLORS.error },
    { name: "Pending", value: claimsData?.pending || 15, color: CHART_COLORS.accent },
  ];

  const monthlyClaimsData = claimsData?.monthlyTrend || [
    { month: "Jul", claims: 25, approved: 20, rejected: 3 },
    { month: "Aug", claims: 32, approved: 28, rejected: 2 },
    { month: "Sep", claims: 28, approved: 24, rejected: 3 },
    { month: "Oct", claims: 35, approved: 30, rejected: 4 },
    { month: "Nov", claims: 42, approved: 38, rejected: 2 },
    { month: "Dec", claims: 38, approved: 33, rejected: 3 },
  ];

  const planDistribution = membersData?.planDistribution || [
    { name: "Starter", value: 35, color: CHART_COLORS.secondary },
    { name: "Standard", value: 40, color: CHART_COLORS.accent },
    { name: "Family Shield", value: 15, color: CHART_COLORS.purple },
    { name: "Premium Plus", value: 10, color: CHART_COLORS.primary },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Reports Dashboard</h1>
              <p className="text-muted-foreground">Comprehensive analytics and reporting</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last90days">Last 90 Days</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="allTime">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export All
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-4 mb-8">
            <Card className="border-none shadow-sm bg-gradient-to-br from-teal-500 to-teal-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-xs font-medium">Total SOS Cases</p>
                    <p className="text-2xl font-bold">{reportsData?.totalClaims || 80}</p>
                  </div>
                  <FileText className="h-8 w-8 text-teal-200 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs font-medium">Approved</p>
                    <p className="text-2xl font-bold">{reportsData?.approved || 45}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-200 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-gradient-to-br from-amber-500 to-amber-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-xs font-medium">Under Review</p>
                    <p className="text-2xl font-bold">{reportsData?.underReview || 12}</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-200 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs font-medium">Total Members</p>
                    <p className="text-2xl font-bold">{reportsData?.totalMembers || 234}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-200 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-gradient-to-br from-slate-700 to-slate-800 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-xs font-medium">Revenue</p>
                    <p className="text-2xl font-bold">₹{(reportsData?.totalRevenue || 0).toLocaleString("en-IN")}</p>
                  </div>
                  <IndianRupee className="h-8 w-8 text-slate-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Reports</h2>
              <Button variant="outline" onClick={printReport} className="gap-2">
                <Printer className="h-4 w-4" />
                Print Report
              </Button>
            </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex mb-6 bg-white border">
              <TabsTrigger value="sos-cases" className="gap-2">
                <FileText className="h-4 w-4" /> SOS Cases
              </TabsTrigger>
              <TabsTrigger value="hospitals" className="gap-2">
                <Building2 className="h-4 w-4" /> Hospitals
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-2">
                <Users className="h-4 w-4" /> Members
              </TabsTrigger>
              <TabsTrigger value="financial" className="gap-2">
                <Wallet className="h-4 w-4" /> Financial
              </TabsTrigger>
              <TabsTrigger value="blocked" className="gap-2">
                <UserX className="h-4 w-4" /> Blocked
              </TabsTrigger>
              <TabsTrigger value="audit" className="gap-2">
                <Activity className="h-4 w-4" /> Audit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sos-cases">
              <div className="print:block" id="sos-cases-report">
                <ReportHeader 
                  title="SOS Cases Report" 
                  subtitle="Emergency assistance cases status and analysis"
                  dateRange={dateRange === "last30days" ? "Last 30 Days" : dateRange}
                />
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5 text-teal-600" />
                        SOS Cases Status Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={claimsStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={true}
                          >
                            {claimsStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        Monthly SOS Cases Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={monthlyClaimsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                          <YAxis stroke="#64748b" fontSize={12} />
                          <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                          <Bar dataKey="approved" fill={CHART_COLORS.success} name="Approved" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="rejected" fill={CHART_COLORS.error} name="Rejected" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Cases Under Verification</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" /> Filter
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" /> Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(claimsData?.pendingClaims || [
                        { id: "SOS-8821", hospital: "Apollo Hospital", member: "Ravi Kumar", amount: 25000, date: "2024-01-05", status: "under_verification" },
                        { id: "SOS-8819", hospital: "KIMS Hospital", member: "Priya Sharma", amount: 45000, date: "2024-01-04", status: "under_verification" },
                        { id: "SOS-8815", hospital: "Care Hospital", member: "Suresh Reddy", amount: 32000, date: "2024-01-03", status: "pending" },
                      ]).map((claim: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                              <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{claim.id}</p>
                              <p className="text-sm text-slate-500">{claim.hospital} • {claim.member}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">₹{claim.amount.toLocaleString()}</p>
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-xs">
                              {claim.status === 'under_verification' ? 'Under Verification' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="hospitals">
              <div className="print:block" id="hospitals-report">
                <ReportHeader 
                  title="Hospital Network Report" 
                  subtitle="Partner hospitals and network presence"
                />
                
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <Card className="border-none shadow-sm bg-gradient-to-br from-teal-50 to-teal-100">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-teal-700 text-xs font-medium">Active Hospitals</p>
                          <p className="text-2xl font-bold text-teal-900">{hospitalsData?.active || 45}</p>
                        </div>
                        <Building2 className="h-8 w-8 text-teal-600 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-amber-700 text-xs font-medium">Pending Approval</p>
                          <p className="text-2xl font-bold text-amber-900">{hospitalsData?.pending || 8}</p>
                        </div>
                        <Clock className="h-8 w-8 text-amber-600 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-700 text-xs font-medium">Cities Covered</p>
                          <p className="text-2xl font-bold text-purple-900">{hospitalsData?.cities || 12}</p>
                        </div>
                        <Shield className="h-8 w-8 text-purple-600 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Hospital Directory</CardTitle>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input placeholder="Search hospital..." className="pl-9 h-9" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(hospitalsData?.list || [
                        { name: "Apollo Hospitals", city: "Bengaluru", state: "Karnataka", status: "active", sosCases: 12 },
                        { name: "Manipal Hospital", city: "Bengaluru", state: "Karnataka", status: "active", sosCases: 8 },
                        { name: "Fortis Hospital", city: "Bengaluru", state: "Karnataka", status: "active", sosCases: 15 },
                        { name: "Narayana Health", city: "Bengaluru", state: "Karnataka", status: "active", sosCases: 6 },
                      ]).map((hospital: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-teal-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{hospital.name}</p>
                              <p className="text-sm text-slate-500">{hospital.city}, {hospital.state}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-700">{hospital.claims} claims</p>
                              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">
                                {hospital.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="members">
              <div className="print:block" id="members-report">
                <ReportHeader 
                  title="Members Report" 
                  subtitle="Membership statistics and family plan analysis"
                />
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-600" />
                        Plan Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={planDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {planDistribution.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Membership Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">Total Active Members</span>
                        <span className="font-bold text-slate-900">{membersData?.totalActive || 189}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">Family Plans</span>
                        <span className="font-bold text-slate-900">{membersData?.familyPlans || 42}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">Individual Plans</span>
                        <span className="font-bold text-slate-900">{membersData?.individualPlans || 147}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">Verified Members</span>
                        <span className="font-bold text-green-600">{membersData?.verified || 175}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">Pending Verification</span>
                        <span className="font-bold text-amber-600">{membersData?.pendingVerification || 14}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Family Plan Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(membersData?.familyPlansList || [
                        { membershipNumber: "RA-2024-0012", primaryMember: "Rajesh Kumar", members: 4, plan: "Family Shield", support: 200000 },
                        { membershipNumber: "RA-2024-0025", primaryMember: "Sunil Reddy", members: 3, plan: "Premium Plus", support: 300000 },
                        { membershipNumber: "RA-2024-0038", primaryMember: "Venkat Rao", members: 4, plan: "Family Shield", support: 200000 },
                      ]).map((family: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{family.primaryMember}</p>
                              <p className="text-sm text-slate-500">{family.membershipNumber} • {family.plan}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">{family.members} members</p>
                            <p className="text-sm text-teal-600">₹{family.support.toLocaleString()} support</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financial">
              <div className="print:block" id="financial-report">
                <ReportHeader 
                  title="Financial Report" 
                  subtitle="Revenue, payments, and commission analysis"
                />
                
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <Card className="border-none shadow-sm bg-gradient-to-br from-green-50 to-green-100">
                    <CardContent className="p-4">
                      <p className="text-green-700 text-xs font-medium">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-900">₹{(financialData?.totalRevenue || 0).toLocaleString("en-IN")}</p>
                      <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-gradient-to-br from-teal-50 to-teal-100">
                    <CardContent className="p-4">
                      <p className="text-teal-700 text-xs font-medium">Claims Paid</p>
                      <p className="text-2xl font-bold text-teal-900">₹{(financialData?.claimsPaid || 0).toLocaleString("en-IN")}</p>
                      <p className="text-xs text-teal-600 mt-1">{financialData?.claimsCount || 45} claims</p>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
                    <CardContent className="p-4">
                      <p className="text-amber-700 text-xs font-medium">Agent Commission</p>
                      <p className="text-2xl font-bold text-amber-900">₹{(financialData?.totalCommission || 0).toLocaleString("en-IN")}</p>
                      <p className="text-xs text-amber-600 mt-1">15% of sales</p>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardContent className="p-4">
                      <p className="text-purple-700 text-xs font-medium">Pending Payouts</p>
                      <p className="text-2xl font-bold text-purple-900">₹{(financialData?.pendingPayouts || 0).toLocaleString("en-IN")}</p>
                      <p className="text-xs text-purple-600 mt-1">{financialData?.pendingPayoutCount || 8} requests</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-none shadow-sm mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Revenue Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={financialData?.monthlyRevenue || [
                        { month: "Jul", revenue: 65000, claims: 18000 },
                        { month: "Aug", revenue: 72000, claims: 22000 },
                        { month: "Sep", revenue: 68000, claims: 25000 },
                        { month: "Oct", revenue: 85000, claims: 30000 },
                        { month: "Nov", revenue: 92000, claims: 35000 },
                        { month: "Dec", revenue: 88000, claims: 28000 },
                      ]}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorClaimsPaid" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS.error} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={CHART_COLORS.error} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                          formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                        />
                        <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS.success} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                        <Area type="monotone" dataKey="claims" stroke={CHART_COLORS.error} fillOpacity={1} fill="url(#colorClaimsPaid)" name="Claims Paid" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="blocked">
              <div className="print:block" id="blocked-report">
                <ReportHeader 
                  title="Blocked/Blacklisted Report" 
                  subtitle="Users and accounts with access restrictions"
                />
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <Card className="border-none shadow-sm bg-gradient-to-br from-red-50 to-red-100">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-700 text-xs font-medium">Blocked Users</p>
                          <p className="text-2xl font-bold text-red-900">{reportsData?.blockedUsers || 5}</p>
                        </div>
                        <UserX className="h-8 w-8 text-red-600 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-amber-700 text-xs font-medium">Failed Logins (Blocked)</p>
                          <p className="text-2xl font-bold text-amber-900">{reportsData?.failedLogins || 12}</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-amber-600 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UserX className="h-5 w-5 text-red-600" />
                      Blocked Candidates List
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(blockedUsersData && blockedUsersData.length > 0) ? blockedUsersData.slice(0, 5).map((user: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                              <XCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{user.name || "Unknown User"}</p>
                              <p className="text-sm text-slate-500">{user.mobile || user.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-red-600 font-medium">{user.suspendedReason || "Account blocked"}</p>
                            <p className="text-xs text-slate-500">Blocked: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8 text-slate-500">
                          <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                          <p className="font-medium">No blocked users</p>
                          <p className="text-sm">All accounts are in good standing</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="audit">
              <div className="print:block" id="audit-report">
                <ReportHeader 
                  title="Audit Log Report" 
                  subtitle="System activity and user action tracking"
                />
                
                <Card className="border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Recent Activity Logs</CardTitle>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" /> Export Logs
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(auditData?.logs || [
                        { action: "USER_LOGIN", user: "superadmin@rakshaassist.com", details: "Super Admin logged in", timestamp: "2024-01-06 10:30:15", ip: "192.168.1.1" },
                        { action: "MEMBERSHIP_CREATED", user: "Agent: Ravi", details: "New membership RA-2024-0089 created", timestamp: "2024-01-06 09:45:22", ip: "192.168.1.5" },
                        { action: "CLAIM_APPROVED", user: "Admin: Priya", details: "Claim CLM-8821 approved for ₹25,000", timestamp: "2024-01-06 09:30:10", ip: "192.168.1.3" },
                        { action: "SETTING_UPDATED", user: "superadmin@rakshaassist.com", details: "Updated Razorpay API settings", timestamp: "2024-01-05 18:20:45", ip: "192.168.1.1" },
                        { action: "USER_BLOCKED", user: "superadmin@rakshaassist.com", details: "Blocked user: spam_account", timestamp: "2024-01-05 16:15:30", ip: "192.168.1.1" },
                      ]).map((log: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              log.action.includes('LOGIN') ? 'bg-blue-100 text-blue-600' :
                              log.action.includes('CREATED') ? 'bg-green-100 text-green-600' :
                              log.action.includes('APPROVED') ? 'bg-teal-100 text-teal-600' :
                              log.action.includes('BLOCKED') ? 'bg-red-100 text-red-600' :
                              'bg-amber-100 text-amber-600'
                            }`}>
                              <Activity className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[10px]">{log.action}</Badge>
                                <span className="text-sm font-medium text-slate-900">{log.user}</span>
                              </div>
                              <p className="text-xs text-slate-500">{log.details}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">{log.timestamp}</p>
                            <p className="text-[10px] text-slate-400">IP: {log.ip}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
