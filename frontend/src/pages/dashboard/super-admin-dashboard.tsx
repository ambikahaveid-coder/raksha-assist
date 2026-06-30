import { useState, useEffect } from "react";
import { fetchWithCsrf } from "@/lib/csrf";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { preventBackNavigation, clearSessionOnLogout } from "@/lib/security";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Link, useLocation } from "wouter";
import {
  Users,
  Building2,
  Shield,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Plus,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Loader2,
  Crown,
  Briefcase,
  User,
  Settings,
  Key,
  History,
  Eye,
  EyeOff,
  Save,
  UserPlus,
  Calendar,
  CreditCard,
  LayoutDashboard,
  FileText,
  TrendingUp,
  IndianRupee,
  FileCheck,
  Activity,
  LogOut,
  Menu,
  X,
  Circle,
  BarChart3,
  PieChart,
  ClipboardList,
  Wallet,
  Receipt,
  Building,
  HeartPulse,
  Gift,
  Megaphone,
  Percent,
  MessageSquare,
  Tag,
  Target,
  Pencil,
  Home,
  Network,
  Globe,
  Ban,
  Edit,
  ShieldCheck,
  ShieldOff,
  Car,
  RefreshCw
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { PlansManager, StaffManagerEnhanced, PoliciesManager, RolesPermissionsManager, ActivityLogsViewer } from "@/components/admin/CRUDManager";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { HospitalsManager } from "@/components/admin/HospitalsManager";
import { SOSCasesManager } from "@/components/admin/SOSCasesManager";
import { AssistanceRequestsManager } from "@/components/admin/ClaimsManager";
import VehicleSosCasesAdmin from "@/pages/admin/vehicle-sos-cases";

const CHART_COLORS = {
  primary: "#0B1F3A",
  secondary: "#179299",
  accent: "#F6A60B",
  success: "#10B981",
  danger: "#EF4444",
  purple: "#8B5CF6",
  slate: "#6B7A90",
  teal: "#14B8A6",
  orange: "#F97316",
  pink: "#EC4899",
};

const PIE_COLORS = ["#179299", "#F6A60B", "#8B5CF6", "#10B981", "#EF4444", "#EC4899"];

const MENU_ITEMS = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, category: "main" },
  { id: "analytics", label: "Analytics", icon: TrendingUp, category: "main" },
  { id: "calendar", label: "Calendar", icon: Calendar, category: "main" },
  { id: "users", label: "User Management", icon: Users, category: "main" },
  { id: "staff", label: "Staff Management", icon: UserPlus, category: "main" },
  { id: "hospitals", label: "Hospitals", icon: Building2, category: "operations" },
  { id: "requests", label: "Emergency Requests", icon: HeartPulse, category: "operations" },
  { id: "sos-cases", label: "SOS Cases", icon: AlertTriangle, category: "operations" },
  { id: "vehicle-sos", label: "Vehicle SOS Cases", icon: Car, category: "operations" },
  { id: "claims", label: "Assistance Requests", icon: ClipboardList, category: "operations" },
  { id: "plans", label: "Plan Studio", icon: FileText, category: "products" },
  { id: "add-ons", label: "Add-On Benefits", icon: Gift, category: "products" },
  { id: "faqs", label: "FAQ Manager", icon: MessageSquare, category: "products" },
  { id: "enterprise", label: "Enterprise Plans", icon: Building2, category: "products" },
  { id: "exclusions", label: "Disease Exclusions", icon: XCircle, category: "products" },
  { id: "zones", label: "Coverage Zones", icon: MapPin, category: "products" },
  { id: "employers", label: "Employers", icon: Briefcase, category: "products" },
  { id: "chatbot-leads", label: "Chatbot Leads", icon: MessageSquare, category: "reports" },
  { id: "reports", label: "Reports", icon: BarChart3, category: "reports" },
  { id: "financial", label: "Financial Reports", icon: IndianRupee, category: "reports" },
  { id: "promotional", label: "Promotional Offers", icon: Gift, category: "marketing" },
  { id: "campaigns", label: "Marketing Campaigns", icon: Megaphone, category: "marketing" },
  { id: "commissions", label: "Commission Config", icon: Percent, category: "marketing" },
  { id: "targets", label: "Targets & Incentives", icon: Target, category: "marketing" },
  { id: "audit", label: "Audit Logs", icon: History, category: "compliance" },
  { id: "permissions", label: "Permissions", icon: Key, category: "compliance" },
  { id: "documents", label: "Documents", icon: FileCheck, category: "compliance" },
  { id: "policies", label: "Policies", icon: Shield, category: "compliance" },
  { id: "franchise", label: "Franchise Network", icon: Network, category: "operations" },
  { id: "aadhar", label: "Aadhar Verification", icon: FileCheck, category: "operations" },
  { id: "settings", label: "Settings", icon: Settings, category: "system" },
];

const CATEGORY_LABELS: Record<string, string> = {
  main: "Main",
  operations: "Operations",
  products: "Products & Plans",
  reports: "Reports & Analytics",
  marketing: "Marketing & Sales",
  compliance: "Compliance",
  system: "System"
};

const PERMISSION_LABELS: Record<string, { label: string; description: string; isFinancial?: boolean }> = {
  viewPayments: { label: "View Payments", description: "View payment transaction records", isFinancial: true },
  viewPaymentReports: { label: "View Payment Reports", description: "Access financial reports and revenue data", isFinancial: true },
  viewMemberships: { label: "View Memberships", description: "View membership records" },
  manageMemberships: { label: "Manage Memberships", description: "Modify membership status and details", isFinancial: true },
  viewUsers: { label: "View Users", description: "View user profiles" },
  manageUsers: { label: "Manage Users", description: "Block/unblock users and change roles" },
  viewEmergencyRequests: { label: "View Emergency Requests", description: "View assistance requests" },
  manageEmergencyRequests: { label: "Manage Emergency Requests", description: "Approve or reject requests" },
  viewAgents: { label: "View Agents", description: "View agent performance data" },
  manageAgents: { label: "Manage Agents", description: "Modify agent assignments" },
  viewHospitals: { label: "View Hospitals", description: "View hospital network" },
  manageHospitals: { label: "Manage Hospitals", description: "Add or modify hospital records" },
  viewAuditLogs: { label: "View Audit Logs", description: "Access system activity logs" },
  viewSystemSettings: { label: "View System Settings", description: "View configuration settings" }
};

export default function SuperAdminDashboard() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: sosPendingCount = 0 } = useQuery<number>({
    queryKey: ["sos-pending-count"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/sos-cases", {});
      if (!res.ok) return 0;
      const cases = await res.json();
      return cases.filter((c: any) => c.status === "pending").length;
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (user && user.role === "super_admin") {
      preventBackNavigation();
    }
  }, [user]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 bg-red-600 rounded flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          {sidebarOpen && <span className="text-white font-bold tracking-tight uppercase">Raksha Ctrl</span>}
        </div>
        
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-6 pb-6">
            {Object.keys(CATEGORY_LABELS).map(category => (
              <div key={category} className="space-y-1">
                {sidebarOpen && (
                  <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    {CATEGORY_LABELS[category]}
                  </h3>
                )}
                {MENU_ITEMS.filter(item => item.category === category).map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if ((item as any).link) setLocation((item as any).link);
                      else setActiveTab(item.id);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                      activeTab === item.id 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    } ${item.id === "sos-cases" && sosPendingCount > 0 ? "animate-pulse" : ""}`}
                  >
                    <div className="relative">
                      <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-white' : 'group-hover:text-red-500'}`} />
                      {item.id === "sos-cases" && sosPendingCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-ping" />
                      )}
                    </div>
                    {sidebarOpen && (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm font-medium leading-none">{item.label}</span>
                        {item.id === "sos-cases" && sosPendingCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                            {sosPendingCount}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-4 bg-slate-800/50">
          <button
            onClick={async () => {
              try {
                await fetchWithCsrf('/api/auth/logout', { method: 'POST', credentials: 'include' });
                clearSessionOnLogout();
                queryClient.clear();
                window.location.href = '/';
              } catch {
                window.location.href = '/';
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-white flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </button>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {MENU_ITEMS.find(i => i.id === activeTab)?.label || "Dashboard"}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900 leading-none">Super Administrator</span>
              <span className="text-[10px] text-green-600 font-bold uppercase mt-1 flex items-center gap-1">
                <Circle className="h-1.5 w-1.5 fill-current" /> Live System Access
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full">
                  <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-200 cursor-pointer hover:ring-primary transition-all">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                    <AvatarFallback>SA</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || "Super Admin"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab("settings")} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("overview")} className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={async () => {
                    try {
                      await fetchWithCsrf('/api/auth/logout', { method: 'POST', credentials: 'include' });
                      clearSessionOnLogout();
                      queryClient.clear();
                      window.location.href = '/';
                    } catch {
                      window.location.href = '/';
                    }
                  }}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-12">
             {activeTab === "overview" && <DashboardOverview />}
             {activeTab === "analytics" && <AnalyticsDashboard />}
             {activeTab === "users" && <UserManagement />}
             {activeTab === "staff" && <StaffManagerEnhanced />}
             {activeTab === "hospitals" && <HospitalsManager />}
             {activeTab === "sos-cases" && <SOSCasesManager />}
             {activeTab === "vehicle-sos" && <VehicleSosCasesAdmin />}
             {activeTab === "requests" && <SOSCasesManager />}
             {activeTab === "claims" && <AssistanceRequestsManager />}
             {activeTab === "plans" && <PlansManager />}
             {activeTab === "permissions" && <RolesPermissionsManager />}
             {activeTab === "policies" && <PoliciesManager />}
             {activeTab === "audit" && <ActivityLogsViewer />}
             {activeTab === "franchise" && <FranchiseManager />}
             {activeTab === "settings" && <SettingsPanel />}
             {activeTab === "commissions" && <CommissionConfigManager />}
             {activeTab === "promotional" && <PromotionalOffersManager />}
             {activeTab === "campaigns" && <MarketingCampaignsManager />}
             {activeTab === "faqs" && <FAQManager />}
             {activeTab === "chatbot-leads" && <ChatbotLeadsPanel />}
             {activeTab === "reports" && <ReportsManager />}
             {activeTab === "financial" && <FinancialReportsManager />}
             {activeTab === "add-ons" && <AddOnsManager />}
             {activeTab === "calendar" && <CalendarManager />}
             {activeTab === "targets" && <TargetsIncentivesManager />}
             {activeTab === "aadhar" && <AadharVerificationManager />}
             {activeTab === "exclusions" && <DiseaseExclusionsManager />}
             {activeTab === "zones" && <CoverageZonesManager />}
             {activeTab === "employers" && <EmployersManager />}
             {activeTab === "enterprise" && <EnterprisePlansManager />}
             {activeTab === "documents" && <DocumentsManager />}
             {!["overview", "analytics", "users", "staff", "hospitals", "sos-cases", "vehicle-sos", "requests", "claims", "plans", "permissions", "policies", "franchise", "audit", "settings", "commissions", "promotional", "campaigns", "faqs", "reports", "financial", "add-ons", "calendar", "targets", "aadhar", "exclusions", "zones", "employers", "enterprise", "documents", "chatbot-leads"].includes(activeTab) && (
               <div className="mt-8 p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                  <Shield className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-400">Section Under Development</h3>
                  <p className="text-slate-400 max-w-sm mx-auto mt-2">
                    This module is being enhanced with additional features.
                  </p>
               </div>
             )}
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/analytics");
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 30000
  });
  
  const { data: visitorStats, isLoading: visitorLoading, dataUpdatedAt, refetch: refetchVisitors } = useQuery({
    queryKey: ["admin-visitor-stats"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/visitor-stats?days=30");
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 30000
  });

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  const revenueData = stats?.revenueByDay || [];
  const planDistribution = stats?.planDistribution || [];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={isLoading ? "..." : formatCurrency(stats?.totalRevenue || 0)} 
          icon={IndianRupee} 
          trend={stats?.revenueTrend || "+0%"} 
          color="blue" 
        />
        <StatCard 
          title="Active Members" 
          value={isLoading ? "..." : (stats?.totalMemberships || 0).toLocaleString()} 
          icon={Users} 
          trend={stats?.membershipTrend || "+0%"} 
          color="teal" 
        />
        <StatCard 
          title="Total Users" 
          value={isLoading ? "..." : (stats?.totalUsers || 0).toLocaleString()} 
          icon={Activity} 
          trend={stats?.usersTrend || "+0%"} 
          color="orange" 
        />
        <StatCard 
          title="Active Plans" 
          value={isLoading ? "..." : (stats?.totalPlans || 0).toString()} 
          icon={ClipboardList} 
          trend={stats?.plansTrend || "+0"} 
          color="purple" 
        />
      </div>
      
      {/* Visitor Statistics Section */}
      <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-500" /> Daily Website Visitors
              <span className="flex items-center gap-1 bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-normal normal-case">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" /> Live
              </span>
            </CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                Updated: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--'}
              </span>
              <button
                onClick={() => refetchVisitors()}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 border border-blue-200 rounded-lg px-2 py-1 hover:bg-blue-50"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold">TODAY</span>
              </div>
              <div className="text-4xl font-bold text-green-600 mt-2">
                {visitorLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : (visitorStats?.todayVisitors || 0).toLocaleString()}
              </div>
              <div className="text-sm text-slate-600 mt-1 font-medium">Unique Visitors</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {visitorLoading ? "..." : (visitorStats?.todayPageViews || 0).toLocaleString()}
              </div>
              <div className="text-sm text-slate-600 mt-1">Today's Page Views</div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {visitorLoading ? "..." : (visitorStats?.totalVisitors || 0).toLocaleString()}
              </div>
              <div className="text-sm text-slate-600 mt-1">Total (30 Days)</div>
            </div>
            <div className="bg-orange-50 rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold text-orange-600">
                {visitorLoading ? "..." : (visitorStats?.avgVisitorsPerDay || 0).toLocaleString()}
              </div>
              <div className="text-sm text-slate-600 mt-1">Avg/Day</div>
            </div>
          </div>
          
          {/* Visitor Chart */}
          <div className="h-[250px]">
            {visitorLoading ? (
              <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : !visitorStats?.dailyStats || visitorStats.dailyStats.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">No visitor data yet. Visitors will be tracked automatically.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visitorStats.dailyStats.slice(0, 14).reverse()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10}} 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [value.toLocaleString(), name === 'visitors' ? 'Unique Visitors' : 'Page Views']}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  />
                  <Bar dataKey="visitors" fill="#22c55e" name="visitors" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pageViews" fill="#3b82f6" name="pageViews" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b px-6 py-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" /> Revenue Growth (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : revenueData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">No revenue data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b px-6 py-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-teal-500" /> Plan Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : planDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">No membership data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {planDistribution.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  return (
    <Card className="rounded-3xl border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <span className={`text-[10px] font-bold ${trend.startsWith('+') ? 'text-green-600' : 'text-slate-400'} mt-1`}>
            {trend} from last month
          </span>
        </div>
        <div className={`h-12 w-12 rounded-2xl bg-${color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </CardContent>
    </Card>
  );
}

function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "active">("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [selectedUserPayments, setSelectedUserPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin", "users-detailed"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/users?details=true");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    }
  });

  const { data: activeMembers = [], isLoading: loadingActive } = useQuery({
    queryKey: ["admin", "active-members"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/active-members");
      if (!res.ok) throw new Error("Failed to fetch active members");
      return res.json();
    }
  });

  const toggleBlockMutation = useMutation({
    mutationFn: async ({ userId, isBlocked }: { userId: number; isBlocked: boolean }) => {
      const res = await fetchWithCsrf(`/api/admin/users/${userId}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ blocked: !isBlocked })
      });
      if (!res.ok) throw new Error("Failed to update user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users-detailed"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "active-members"] });
      toast({ title: "User status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    }
  });

  const [activatingUserId, setActivatingUserId] = useState<string | null>(null);
  const [activatePlanCode, setActivatePlanCode] = useState("STARTER");

  const createMembershipMutation = useMutation({
    mutationFn: async ({ userId, planCode }: { userId: string; planCode: string }) => {
      const res = await fetchWithCsrf(`/api/admin/users/${userId}/create-membership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode, notes: "Manually activated by Super Admin" })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Membership Activated!", description: data.message });
      setActivatingUserId(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "users-detailed"] });
    },
    onError: (e: Error) => {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  });

  const fixStuckPaymentsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithCsrf("/api/admin/fix-stuck-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fix stuck payments");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users-detailed"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "active-members"] });
      toast({ 
        title: "Stuck payments fixed", 
        description: `Fixed ${data.stuckFixed} stuck payments and ${data.inconsistentFixed} inconsistent records`
      });
    },
    onError: () => {
      toast({ title: "Failed to fix stuck payments", variant: "destructive" });
    }
  });

  const loadUserPayments = async (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    setLoadingPayments(true);
    try {
      const res = await fetchWithCsrf(`/api/admin/users/${userId}/payments`);
      if (res.ok) {
        const payments = await res.json();
        setSelectedUserPayments(payments);
        setExpandedUser(userId);
      }
    } catch (e) {
      toast({ title: "Failed to load payments", variant: "destructive" });
    } finally {
      setLoadingPayments(false);
    }
  };

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = !searchTerm || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile?.includes(searchTerm);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredActiveMembers = activeMembers.filter((item: any) => {
    const user = item.user;
    return !searchTerm || 
      user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.mobile?.includes(searchTerm) ||
      item.membership?.membershipNumber?.includes(searchTerm);
  });

  const getRoleBadge = (role: string, isBlocked: boolean) => {
    if (isBlocked) return <Badge variant="destructive" className="rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-widest">Blocked</Badge>;
    
    const roleColors: Record<string, string> = {
      user: "bg-emerald-100 text-emerald-700 border-emerald-200",
      agent: "bg-blue-100 text-blue-700 border-blue-200",
      admin: "bg-purple-100 text-purple-700 border-purple-200",
      super_admin: "bg-slate-900 text-white border-slate-900",
      employee: "bg-amber-100 text-amber-700 border-amber-200",
      accountant: "bg-cyan-100 text-cyan-700 border-cyan-200"
    };
    
    return (
      <Badge variant="outline" className={`rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-widest ${roleColors[role] || "bg-slate-100 text-slate-700"}`}>
        {role === "super_admin" ? "Super Admin" : role}
      </Badge>
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "₹0";
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  if (isLoading || loadingActive) {
    return (
      <div className="bg-white rounded-3xl p-8 border-none shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 border-none shadow-sm">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-500 mt-1">
            {activeTab === "all" ? `${users.length} registered users` : `${activeMembers.length} active members`}
          </p>
        </div>
        <div className="flex gap-3">
          <Input
            placeholder="Search by name, email, mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-72 rounded-xl"
          />
          {activeTab === "all" && (
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40 rounded-xl">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="agent">Agents</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="employee">Employees</SelectItem>
                <SelectItem value="accountant">Accountants</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b pb-4 justify-between">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "all" ? "default" : "ghost"}
            onClick={() => setActiveTab("all")}
            className="rounded-xl"
          >
            <Users className="h-4 w-4 mr-2" />
            All Users ({users.length})
          </Button>
          <Button
            variant={activeTab === "active" ? "default" : "ghost"}
            onClick={() => setActiveTab("active")}
            className="rounded-xl"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Active Members ({activeMembers.length})
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={() => fixStuckPaymentsMutation.mutate()}
          disabled={fixStuckPaymentsMutation.isPending}
          className="rounded-xl text-amber-600 border-amber-200 hover:bg-amber-50"
        >
          {fixStuckPaymentsMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <AlertCircle className="h-4 w-4 mr-2" />
          )}
          Fix Stuck Payments
        </Button>
      </div>
      
      {activeTab === "all" ? (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {searchTerm || roleFilter !== "all" ? "No users match your search" : "No users found"}
            </div>
          ) : (
            filteredUsers.map((user: any) => (
              <div key={user.id} className="bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => loadUserPayments(user.id)}>
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                      <AvatarFallback className={user.isBlocked ? "bg-red-100 text-red-600" : "bg-teal-100 text-teal-700"}>
                        {user.name?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-slate-900">{user.name || "Unnamed User"}</p>
                        {getRoleBadge(user.role, user.isBlocked)}
                        {user.membership && (
                          <Badge variant="outline" className={`text-[10px] ${user.membership.status === "active" ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
                            {user.membership.status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-4 text-xs text-slate-500 mt-1">
                        {user.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{user.email}</span>}
                        {user.mobile && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{user.mobile}</span>}
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Joined {formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {user.membership ? (
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Plan</p>
                        <p className="font-semibold text-slate-900">{user.membership.planName}</p>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Plan</p>
                        <p className="text-slate-400">No Plan</p>
                      </div>
                    )}
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Total Paid</p>
                      <p className="font-semibold text-green-600">{formatCurrency(user.paymentSummary?.totalAmount)}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); toggleBlockMutation.mutate({ userId: user.id, isBlocked: user.isBlocked }); }}
                      className={`rounded-xl ${user.isBlocked ? "text-green-600 hover:bg-green-50" : "text-red-500 hover:bg-red-50"}`}
                      disabled={user.role === "super_admin"}
                    >
                      {user.isBlocked ? <><ShieldCheck className="h-4 w-4 mr-1" /> Unblock</> : <><ShieldOff className="h-4 w-4 mr-1" /> Block</>}
                    </Button>
                    <Eye className={`h-4 w-4 ${expandedUser === user.id ? "text-teal-600" : "text-slate-400"}`} />
                  </div>
                </div>

                {expandedUser === user.id && (
                  <div className="border-t border-slate-200 p-4 bg-white rounded-b-2xl">
                    <div className="grid grid-cols-3 gap-6 mb-4">
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2"><User className="h-4 w-4" /> Personal Details</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-slate-500">Name:</span> {user.name || "-"}</p>
                          <p><span className="text-slate-500">Email:</span> {user.email || "-"}</p>
                          <p><span className="text-slate-500">Mobile:</span> {user.mobile || "-"}</p>
                          <p><span className="text-slate-500">City:</span> {user.city || "-"}</p>
                          <p><span className="text-slate-500">State:</span> {user.state || "-"}</p>
                          <p><span className="text-slate-500">Blood Group:</span> {user.bloodGroup || "-"}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2"><CreditCard className="h-4 w-4" /> Membership Details</h4>
                        {user.membership ? (
                          <div className="space-y-1 text-sm">
                            <p><span className="text-slate-500">Membership #:</span> {user.membership.membershipNumber}</p>
                            <p><span className="text-slate-500">Plan:</span> {user.membership.planName}</p>
                            <p><span className="text-slate-500">Status:</span> <Badge variant="outline" className={user.membership.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>{user.membership.status}</Badge></p>
                            <p><span className="text-slate-500">Coverage:</span> {formatCurrency(user.membership.coverageAmount)}</p>
                            <p><span className="text-slate-500">Valid From:</span> {formatDate(user.membership.startDate)}</p>
                            <p><span className="text-slate-500">Valid Until:</span> {formatDate(user.membership.endDate)}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-slate-400 text-sm mb-3">No active membership</p>
                            {activatingUserId === user.id ? (
                              <div className="space-y-2">
                                <select
                                  className="w-full border rounded px-2 py-1 text-sm"
                                  value={activatePlanCode}
                                  onChange={(e) => setActivatePlanCode(e.target.value)}
                                >
                                  <optgroup label="Individual Plans">
                                    <option value="STARTER">Starter (₹599/yr)</option>
                                    <option value="STANDARD">Standard (₹999/yr)</option>
                                    <option value="PREMIUM">Premium (₹1,499/yr)</option>
                                    <option value="PLATINUM">Platinum (₹2,499/yr)</option>
                                  </optgroup>
                                  <optgroup label="Family Plans">
                                    <option value="FAMILY_BASIC">Family Basic</option>
                                    <option value="FAMILY_SHIELD">Family Shield</option>
                                    <option value="FAMILY_PREMIUM">Family Premium</option>
                                    <option value="FAMILY_ROYALE">Family Royale</option>
                                  </optgroup>
                                </select>
                                <div className="flex gap-2">
                                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white"
                                    disabled={createMembershipMutation.isPending}
                                    onClick={() => createMembershipMutation.mutate({ userId: user.id, planCode: activatePlanCode })}>
                                    {createMembershipMutation.isPending ? "Activating..." : "Confirm Activate"}
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setActivatingUserId(null)}>Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white"
                                onClick={() => { setActivatingUserId(user.id); setActivatePlanCode("STARTER"); }}>
                                + Activate Membership
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2"><Wallet className="h-4 w-4" /> Payment Summary</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-slate-500">Total Payments:</span> {user.paymentSummary?.totalPayments || 0}</p>
                          <p><span className="text-slate-500">Total Amount:</span> <span className="font-semibold text-green-600">{formatCurrency(user.paymentSummary?.totalAmount)}</span></p>
                          <p><span className="text-slate-500">Last Payment:</span> {formatDate(user.paymentSummary?.lastPaymentDate)}</p>
                          <p><span className="text-slate-500">Last Amount:</span> {formatCurrency(user.paymentSummary?.lastPaymentAmount)}</p>
                        </div>
                      </div>
                    </div>

                    {loadingPayments ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                      </div>
                    ) : selectedUserPayments.length > 0 ? (
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2"><Receipt className="h-4 w-4" /> Payment History</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 text-slate-500 font-medium">Date</th>
                                <th className="text-left py-2 text-slate-500 font-medium">Amount</th>
                                <th className="text-left py-2 text-slate-500 font-medium">Plan</th>
                                <th className="text-left py-2 text-slate-500 font-medium">Transaction ID</th>
                                <th className="text-left py-2 text-slate-500 font-medium">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedUserPayments.map((payment: any) => (
                                <tr key={payment.id} className="border-b border-slate-100">
                                  <td className="py-2">{formatDate(payment.createdAt)}</td>
                                  <td className="py-2 font-semibold">{formatCurrency(payment.amount)}</td>
                                  <td className="py-2">{payment.planType || "-"}</td>
                                  <td className="py-2 text-xs font-mono">{payment.transactionId || payment.razorpayOrderId || "-"}</td>
                                  <td className="py-2">
                                    <Badge variant="outline" className={payment.status === "completed" ? "bg-green-100 text-green-700" : payment.status === "failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}>
                                      {payment.status}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm text-center py-4">No payment history found</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredActiveMembers.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {searchTerm ? "No active members match your search" : "No active members found"}
            </div>
          ) : (
            filteredActiveMembers.map((item: any) => (
              <div key={item.membership.id} className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border border-green-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                      <AvatarFallback className="bg-green-100 text-green-700">
                        {item.user?.name?.substring(0, 2).toUpperCase() || "M"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-slate-900">{item.user?.name || "Unknown"}</p>
                        <Badge className="bg-green-600 text-white text-[10px]">ACTIVE</Badge>
                      </div>
                      <div className="flex gap-4 text-xs text-slate-500 mt-1">
                        {item.user?.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{item.user.email}</span>}
                        {item.user?.mobile && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{item.user.mobile}</span>}
                        <span className="flex items-center gap-1 font-mono text-teal-700"><CreditCard className="h-3 w-3" />{item.membership.membershipNumber}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Plan</p>
                      <p className="font-semibold text-slate-900">{item.membership.planName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Support</p>
                      <p className="font-semibold text-teal-600">{formatCurrency(item.membership.coverageAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Valid Until</p>
                      <p className="font-semibold text-slate-900">{formatDate(item.membership.endDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Total Paid</p>
                      <p className="font-semibold text-green-600">{formatCurrency(item.paymentSummary?.totalPaid)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function StaffManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [staffRole, setStaffRole] = useState<"admin" | "employee" | "agent" | "marketing" | "accountant">("admin");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    aadhar: "",
    bloodGroup: "",
    dateOfBirth: ""
  });
  const [saving, setSaving] = useState(false);

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ["admin", "staff-list"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/staff-list", );
      if (!res.ok) throw new Error("Failed to fetch staff");
      return res.json();
    }
  });

  const handleCreateStaff = async () => {
    if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetchWithCsrf("/api/admin/create-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData, role: staffRole })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create staff");
      }
      
      toast({ title: `${staffRole.charAt(0).toUpperCase() + staffRole.slice(1)} created successfully` });
      queryClient.invalidateQueries({ queryKey: ["admin", "staff-list"] });
      setDialogOpen(false);
      setFormData({ name: "", email: "", mobile: "", password: "", aadhar: "", bloodGroup: "", dateOfBirth: "" });
    } catch (error: any) {
      toast({ title: error.message || "Failed to create staff", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-blue-100 text-blue-700";
      case "agent": return "bg-green-100 text-green-700";
      case "employee": return "bg-orange-100 text-orange-700";
      case "marketing": return "bg-purple-100 text-purple-700";
      case "accountant": return "bg-teal-100 text-teal-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Staff Management</h2>
          <p className="text-muted-foreground">Create and manage all team members</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-staff">
              <UserPlus className="h-4 w-4 mr-2" /> Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Staff Member</DialogTitle>
              <DialogDescription>Add a new team member to your organization.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Role Type</Label>
                <Select value={staffRole} onValueChange={(v: any) => setStaffRole(v)}>
                  <SelectTrigger data-testid="select-staff-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="marketing">Marketing Team</SelectItem>
                    <SelectItem value="accountant">Accountant Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                  data-testid="input-staff-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input 
                  type="email"
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com"
                  data-testid="input-staff-email"
                />
              </div>
              <div className="space-y-2">
                <Label>Mobile Number *</Label>
                <Input 
                  value={formData.mobile} 
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  placeholder="10-digit mobile number"
                  data-testid="input-staff-mobile"
                />
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input 
                  type="password"
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Minimum 6 characters"
                  data-testid="input-staff-password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateStaff} disabled={saving} data-testid="button-submit-staff">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Create {staffRole.charAt(0).toUpperCase() + staffRole.slice(1)}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border-none">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {staffList.map((staff: any) => (
              <div key={staff.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border-2 border-white shadow">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.email}`} />
                    <AvatarFallback>{staff.name?.substring(0, 2) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900">{staff.name || "Unnamed"}</p>
                      <Badge className={`${getRoleBadgeColor(staff.role)} border-none text-[10px] font-bold uppercase`}>
                        {staff.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{staff.email} • {staff.mobile}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      if (confirm("Are you sure?")) {
                        fetchWithCsrf(`/api/admin/staff/${staff.id}`, { method: "DELETE" })
                          .then(() => queryClient.invalidateQueries({ queryKey: ["admin", "staff-list"] }));
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FranchiseManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("zones");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const { data: zones = [] } = useQuery<any[]>({ queryKey: ["/api/franchise/zones"] });
  const { data: states = [] } = useQuery<any[]>({ queryKey: ["/api/franchise/states"] });
  const { data: districts = [] } = useQuery<any[]>({ queryKey: ["/api/franchise/districts"] });
  const { data: cities = [] } = useQuery<any[]>({ queryKey: ["/api/franchise/cities"] });
  const { data: stats } = useQuery<any>({ queryKey: ["/api/franchise/dashboard/stats"] });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/franchise/zones"] });
    queryClient.invalidateQueries({ queryKey: ["/api/franchise/states"] });
    queryClient.invalidateQueries({ queryKey: ["/api/franchise/districts"] });
    queryClient.invalidateQueries({ queryKey: ["/api/franchise/cities"] });
    queryClient.invalidateQueries({ queryKey: ["/api/franchise/dashboard/stats"] });
  };

  const createMutation = useMutation({
    mutationFn: async (data: { type: string; payload: any }) => {
      const res = await fetchWithCsrf(`/api/franchise/${data.type}s`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data.payload),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Created successfully" });
      setIsDialogOpen(false);
      setFormData({});
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { type: string; id: string; payload: any }) => {
      const res = await fetchWithCsrf(`/api/franchise/${data.type}s/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data.payload),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Updated successfully" });
      setIsDialogOpen(false);
      setEditItem(null);
      setFormData({});
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (data: { type: string; id: string }) => {
      const res = await fetchWithCsrf(`/api/franchise/${data.type}s/${data.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Deleted successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (data: { type: string; id: string; status: string }) => {
      const res = await fetchWithCsrf(`/api/franchise/${data.type}s/${data.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: data.status }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Status updated" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const openCreate = (type: string) => {
    setEditItem(null);
    setFormData({ type });
    setIsDialogOpen(true);
  };

  const openEdit = (type: string, item: any) => {
    setEditItem({ type, item });
    setFormData({
      type,
      code: item[`${type}Code`] || item.code || "",
      name: item.name || "",
      regionName: item[`${type}Name`] || item.name || "",
      ownerName: item.ownerName || "",
      ownerMobile: item.ownerMobile || "",
      ownerEmail: item.ownerEmail || "",
      commissionRate: item.commissionRate?.toString() || "",
      zoneId: item.zoneId || "",
      stateId: item.stateId || "",
      districtId: item.districtId || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const type = formData.type;
    const payload: any = {
      name: formData.name,
      ownerName: formData.ownerName,
      ownerMobile: formData.ownerMobile,
      ownerEmail: formData.ownerEmail,
      commissionRate: parseFloat(formData.commissionRate) || (type === "zone" ? 3 : type === "state" ? 4 : type === "district" ? 5 : 6),
    };

    if (type === "zone") {
      payload.zoneCode = formData.code;
    } else if (type === "state") {
      payload.stateCode = formData.code;
      payload.stateName = formData.regionName || formData.name;
      payload.zoneId = formData.zoneId || null;
    } else if (type === "district") {
      payload.districtCode = formData.code;
      payload.districtName = formData.regionName || formData.name;
      payload.stateId = formData.stateId || null;
    } else if (type === "city") {
      payload.cityCode = formData.code;
      payload.cityName = formData.regionName || formData.name;
      payload.districtId = formData.districtId || null;
    }

    if (editItem) {
      updateMutation.mutate({ type, id: editItem.item.id, payload });
    } else {
      createMutation.mutate({ type, payload });
    }
  };

  const tabs = [
    { id: "zones", label: "Zones", count: zones.length, icon: Globe },
    { id: "states", label: "States", count: states.length, icon: MapPin },
    { id: "districts", label: "Districts", count: districts.length, icon: Building },
    { id: "cities", label: "Cities", count: cities.length, icon: Home },
  ];

  const renderTable = (type: string, data: any[], columns: string[]) => (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {col.replace(/([A-Z])/g, " $1").trim()}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-slate-400">
                  No {type}s found. Click "Add {type}" to create one.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-3 text-sm text-slate-700">
                      {col === "status" ? (
                        <Badge variant={item[col] === "active" ? "default" : "secondary"}>
                          {item[col]}
                        </Badge>
                      ) : col === "commissionRate" ? (
                        `${item[col]}%`
                      ) : (
                        item[col] || "-"
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(type, item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => statusMutation.mutate({ type, id: item.id, status: item.status === "active" ? "blocked" : "active" })}
                      >
                        {item.status === "active" ? <Ban className="h-4 w-4 text-orange-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate({ type, id: item.id })}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Franchise Network</h2>
          <p className="text-muted-foreground">Manage your franchise hierarchy - Zones, States, Districts & Cities</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Zones</p>
                <p className="text-2xl font-bold">{stats?.zones || zones.length}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">States</p>
                <p className="text-2xl font-bold">{stats?.states || states.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Districts</p>
                <p className="text-2xl font-bold">{stats?.districts || districts.length}</p>
              </div>
              <Building className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Cities</p>
                <p className="text-2xl font-bold">{stats?.cities || cities.length}</p>
              </div>
              <Home className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 border-b pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className="gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <Badge variant="secondary" className="ml-1">{tab.count}</Badge>
          </Button>
        ))}
        <div className="flex-1" />
        <Button onClick={() => openCreate(activeTab.slice(0, -1))} className="gap-2">
          <Plus className="h-4 w-4" />
          Add {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1, -1)}
        </Button>
      </div>

      {activeTab === "zones" && renderTable("zone", zones, ["zoneCode", "name", "ownerName", "ownerMobile", "commissionRate", "status"])}
      {activeTab === "states" && renderTable("state", states, ["stateCode", "name", "stateName", "ownerName", "commissionRate", "status"])}
      {activeTab === "districts" && renderTable("district", districts, ["districtCode", "name", "districtName", "ownerName", "commissionRate", "status"])}
      {activeTab === "cities" && renderTable("city", cities, ["cityCode", "name", "cityName", "ownerName", "commissionRate", "status"])}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit" : "Add"} {formData.type?.charAt(0).toUpperCase() + formData.type?.slice(1)}</DialogTitle>
            <DialogDescription>
              {editItem ? "Update the details below" : "Fill in the details to create a new franchise"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  value={formData.code || ""}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder={`${formData.type?.toUpperCase()}_001`}
                />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
            </div>

            {formData.type === "state" && (
              <div className="space-y-2">
                <Label>Zone</Label>
                <Select value={formData.zoneId || ""} onValueChange={(v) => setFormData({ ...formData, zoneId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select Zone" /></SelectTrigger>
                  <SelectContent>
                    {zones.map((z: any) => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.type === "district" && (
              <div className="space-y-2">
                <Label>State</Label>
                <Select value={formData.stateId || ""} onValueChange={(v) => setFormData({ ...formData, stateId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                  <SelectContent>
                    {states.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.type === "city" && (
              <div className="space-y-2">
                <Label>District</Label>
                <Select value={formData.districtId || ""} onValueChange={(v) => setFormData({ ...formData, districtId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                  <SelectContent>
                    {districts.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Owner Name</Label>
              <Input
                value={formData.ownerName || ""}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="Franchise owner name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mobile</Label>
                <Input
                  value={formData.ownerMobile || ""}
                  onChange={(e) => setFormData({ ...formData, ownerMobile: e.target.value })}
                  placeholder="9876543210"
                />
              </div>
              <div className="space-y-2">
                <Label>Commission %</Label>
                <Input
                  type="number"
                  value={formData.commissionRate || ""}
                  onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                  placeholder="3"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.ownerEmail || ""}
                onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                placeholder="owner@example.com"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editItem ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SettingsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settingsTab, setSettingsTab] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", email: "" });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  const [razorpayConfig, setRazorpayConfig] = useState({ keyId: "", keySecret: "", webhookSecret: "", enabled: false });
  const [firebaseConfig, setFirebaseConfig] = useState({ apiKey: "", authDomain: "", projectId: "", storageBucket: "", messagingSenderId: "", appId: "", enabled: false });
  const [analyticsConfig, setAnalyticsConfig] = useState({ measurementId: "", enabled: false });
  const [emailConfig, setEmailConfig] = useState({ provider: "resend", apiKey: "", fromEmail: "", fromName: "", enabled: false });

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/auth/me", );
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    }
  });

  const { data: systemSettings } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/settings", );
      if (!res.ok) return {};
      return res.json();
    }
  });

  useEffect(() => {
    if (currentUser?.user) {
      setProfileData({
        name: currentUser.user.name || "",
        email: currentUser.user.email || ""
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (systemSettings) {
      if (systemSettings.razorpay) setRazorpayConfig(systemSettings.razorpay);
      if (systemSettings.firebase) setFirebaseConfig(systemSettings.firebase);
      if (systemSettings.analytics) setAnalyticsConfig(systemSettings.analytics);
      if (systemSettings.email) setEmailConfig(systemSettings.email);
    }
  }, [systemSettings]);

  const handleUpdateProfile = async () => {
    if (!profileData.name.trim() || !profileData.email.trim()) {
      toast({ title: "Error", description: "Name and email are required", variant: "destructive" });
      return;
    }
    setIsUpdatingProfile(true);
    try {
      const res = await fetchWithCsrf("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: profileData.name, email: profileData.email })
      });
      if (!res.ok) throw new Error("Failed to update profile");
      toast({ title: "Success", description: "Profile updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast({ title: "Error", description: "Current and new password are required", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await fetchWithCsrf("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          currentPassword: passwordData.currentPassword, 
          newPassword: passwordData.newPassword 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      toast({ title: "Success", description: "Password changed successfully" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to change password", variant: "destructive" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveSystemSettings = async (category: string, config: any) => {
    setIsSavingSettings(true);
    try {
      const res = await fetchWithCsrf("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ category, config })
      });
      if (!res.ok) throw new Error("Failed to save settings");
      toast({ 
        title: "Saved Successfully!", 
        description: `${category.charAt(0).toUpperCase() + category.slice(1)} settings have been updated.`,
        duration: 5000
      });
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings. Please try again.", variant: "destructive" });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const settingsTabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "razorpay", label: "Razorpay", icon: CreditCard },
    { id: "firebase", label: "Firebase", icon: Shield },
    { id: "analytics", label: "Google Analytics", icon: BarChart3 },
    { id: "email", label: "Email", icon: Mail },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {settingsTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={settingsTab === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSettingsTab(tab.id)}
            className="gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {settingsTab === "profile" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>Update your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={profileData.name} 
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={profileData.email} 
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile}>
                {isUpdatingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Update Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your login password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input 
                    id="currentPassword" 
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword} 
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input 
                      id="newPassword" 
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword} 
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    value={passwordData.confirmPassword} 
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
                Change Password
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {settingsTab === "razorpay" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Razorpay Payment Gateway
            </CardTitle>
            <CardDescription>Configure Razorpay for payment processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <Label className="text-base font-medium">Enable Razorpay</Label>
                <p className="text-sm text-muted-foreground">Accept payments via Razorpay</p>
              </div>
              <Switch
                checked={razorpayConfig.enabled}
                onCheckedChange={(checked) => setRazorpayConfig(prev => ({ ...prev, enabled: checked }))}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="razorpay-key-id">Key ID</Label>
                <Input 
                  id="razorpay-key-id"
                  value={razorpayConfig.keyId} 
                  onChange={(e) => setRazorpayConfig(prev => ({ ...prev, keyId: e.target.value }))}
                  placeholder="rzp_live_xxxxx or rzp_test_xxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="razorpay-key-secret">Key Secret</Label>
                <Input 
                  id="razorpay-key-secret"
                  type="password"
                  value={razorpayConfig.keySecret} 
                  onChange={(e) => setRazorpayConfig(prev => ({ ...prev, keySecret: e.target.value }))}
                  placeholder="Your Razorpay secret key"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="razorpay-webhook-secret">Webhook Secret</Label>
              <Input 
                id="razorpay-webhook-secret"
                type="password"
                value={razorpayConfig.webhookSecret} 
                onChange={(e) => setRazorpayConfig(prev => ({ ...prev, webhookSecret: e.target.value }))}
                placeholder="Webhook signing secret"
              />
              <p className="text-xs text-muted-foreground">Used to verify webhook signatures from Razorpay</p>
            </div>
            <Button 
              onClick={() => handleSaveSystemSettings("razorpay", razorpayConfig)} 
              disabled={isSavingSettings}
            >
              {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Razorpay Settings
            </Button>
          </CardContent>
        </Card>
      )}

      {settingsTab === "firebase" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              Firebase Configuration
            </CardTitle>
            <CardDescription>Configure Firebase for OTP authentication and push notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <Label className="text-base font-medium">Enable Firebase</Label>
                <p className="text-sm text-muted-foreground">Use Firebase for OTP and notifications</p>
              </div>
              <Switch
                checked={firebaseConfig.enabled}
                onCheckedChange={(checked) => setFirebaseConfig(prev => ({ ...prev, enabled: checked }))}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firebase-api-key">API Key</Label>
                <Input 
                  id="firebase-api-key"
                  value={firebaseConfig.apiKey} 
                  onChange={(e) => setFirebaseConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firebase-auth-domain">Auth Domain</Label>
                <Input 
                  id="firebase-auth-domain"
                  value={firebaseConfig.authDomain} 
                  onChange={(e) => setFirebaseConfig(prev => ({ ...prev, authDomain: e.target.value }))}
                  placeholder="your-app.firebaseapp.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firebase-project-id">Project ID</Label>
                <Input 
                  id="firebase-project-id"
                  value={firebaseConfig.projectId} 
                  onChange={(e) => setFirebaseConfig(prev => ({ ...prev, projectId: e.target.value }))}
                  placeholder="your-project-id"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firebase-storage-bucket">Storage Bucket</Label>
                <Input 
                  id="firebase-storage-bucket"
                  value={firebaseConfig.storageBucket} 
                  onChange={(e) => setFirebaseConfig(prev => ({ ...prev, storageBucket: e.target.value }))}
                  placeholder="your-app.appspot.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firebase-messaging-sender-id">Messaging Sender ID</Label>
                <Input 
                  id="firebase-messaging-sender-id"
                  value={firebaseConfig.messagingSenderId} 
                  onChange={(e) => setFirebaseConfig(prev => ({ ...prev, messagingSenderId: e.target.value }))}
                  placeholder="123456789012"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firebase-app-id">App ID</Label>
                <Input 
                  id="firebase-app-id"
                  value={firebaseConfig.appId} 
                  onChange={(e) => setFirebaseConfig(prev => ({ ...prev, appId: e.target.value }))}
                  placeholder="1:123456789:web:abcdef"
                />
              </div>
            </div>
            <Button 
              onClick={() => handleSaveSystemSettings("firebase", firebaseConfig)} 
              disabled={isSavingSettings}
            >
              {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Firebase Settings
            </Button>
          </CardContent>
        </Card>
      )}

      {settingsTab === "analytics" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Google Analytics
            </CardTitle>
            <CardDescription>Configure Google Analytics 4 for website tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <Label className="text-base font-medium">Enable Google Analytics</Label>
                <p className="text-sm text-muted-foreground">Track website visitors and events</p>
              </div>
              <Switch
                checked={analyticsConfig.enabled}
                onCheckedChange={(checked) => setAnalyticsConfig(prev => ({ ...prev, enabled: checked }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ga-measurement-id">Measurement ID (GA4)</Label>
              <Input 
                id="ga-measurement-id"
                value={analyticsConfig.measurementId} 
                onChange={(e) => setAnalyticsConfig(prev => ({ ...prev, measurementId: e.target.value }))}
                placeholder="G-XXXXXXXXXX"
              />
              <p className="text-xs text-muted-foreground">Find this in Google Analytics Admin &gt; Data Streams &gt; Web</p>
            </div>
            <Button 
              onClick={() => handleSaveSystemSettings("analytics", analyticsConfig)} 
              disabled={isSavingSettings}
            >
              {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Analytics Settings
            </Button>
          </CardContent>
        </Card>
      )}

      {settingsTab === "email" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-600" />
              Email Configuration
            </CardTitle>
            <CardDescription>Configure email service for notifications and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <Label className="text-base font-medium">Enable Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send emails for alerts and notifications</p>
              </div>
              <Switch
                checked={emailConfig.enabled}
                onCheckedChange={(checked) => setEmailConfig(prev => ({ ...prev, enabled: checked }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-provider">Email Provider</Label>
              <Select 
                value={emailConfig.provider} 
                onValueChange={(value) => setEmailConfig(prev => ({ ...prev, provider: value }))}
              >
                <SelectTrigger id="email-provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resend">Resend</SelectItem>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                  <SelectItem value="smtp">SMTP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-api-key">API Key</Label>
              <Input 
                id="email-api-key"
                type="password"
                value={emailConfig.apiKey} 
                onChange={(e) => setEmailConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Your email service API key"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email-from-email">From Email</Label>
                <Input 
                  id="email-from-email"
                  type="email"
                  value={emailConfig.fromEmail} 
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                  placeholder="noreply@rakshaassist.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-from-name">From Name</Label>
                <Input 
                  id="email-from-name"
                  value={emailConfig.fromName} 
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, fromName: e.target.value }))}
                  placeholder="Raksha Assist"
                />
              </div>
            </div>
            <Button 
              onClick={() => handleSaveSystemSettings("email", emailConfig)} 
              disabled={isSavingSettings}
            >
              {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Email Settings
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CommissionConfigManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [config, setConfig] = useState({
    agent: 15, city: 6, district: 5, state: 4, zone: 3, company: 67
  });
  const [isSaving, setIsSaving] = useState(false);
  const [sampleAmount, setSampleAmount] = useState(5000);

  const { data: commissionConfig } = useQuery({
    queryKey: ["commission-config"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/commission-config");
      if (!res.ok) return null;
      return res.json();
    }
  });

  useEffect(() => {
    if (commissionConfig) setConfig(commissionConfig);
  }, [commissionConfig]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetchWithCsrf("/api/admin/commission-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(config)
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Success", description: "Commission configuration saved" });
      queryClient.invalidateQueries({ queryKey: ["commission-config"] });
    } catch {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const rolePermissions = [
    { role: "Agent", permissions: ["Sell memberships", "Earn 15% commission", "View own sales", "Register members"], color: "bg-blue-500" },
    { role: "City Franchise", permissions: ["Manage city agents", "Earn 6% on city sales", "View city reports", "Approve local agents"], color: "bg-teal-500" },
    { role: "District Franchise", permissions: ["Manage district", "Earn 5% on district sales", "View district analytics", "Manage cities"], color: "bg-purple-500" },
    { role: "State Franchise", permissions: ["Manage state operations", "Earn 4% on state sales", "Full state reports", "Manage districts"], color: "bg-orange-500" },
    { role: "Zone Franchise", permissions: ["Manage zone (multi-state)", "Earn 3% on zone sales", "Zone-wide analytics", "Manage states"], color: "bg-red-500" },
    { role: "Employee", permissions: ["View members", "Process verifications", "Handle SOS cases", "Fixed salary + bonus"], color: "bg-slate-500" },
    { role: "Super Admin", permissions: ["Full system access", "Company profit (67%)", "All configurations", "Financial reports"], color: "bg-amber-500" }
  ];

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Percent className="h-5 w-5 text-primary" /> Commission & Profit Structure</CardTitle>
          <CardDescription>Configure how membership fees are distributed across all roles (must total 100%)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { key: "agent", label: "Agent Commission", icon: User, desc: "Per sale earning" },
              { key: "city", label: "City Franchise", icon: Building, desc: "City-level share" },
              { key: "district", label: "District Franchise", icon: MapPin, desc: "District-level share" },
              { key: "state", label: "State Franchise", icon: Globe, desc: "State-level share" },
              { key: "zone", label: "Zone Franchise", icon: Network, desc: "Zone-level share" },
              { key: "company", label: "Company Profit", icon: Crown, desc: "Retained earnings" }
            ].map(({ key, label, icon: Icon, desc }) => (
              <div key={key} className="p-4 border rounded-xl space-y-2 hover:shadow-md transition-shadow">
                <Label className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-primary" /> {label}</Label>
                <p className="text-xs text-slate-500">{desc}</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config[key as keyof typeof config]}
                    onChange={(e) => setConfig({ ...config, [key]: Number(e.target.value) })}
                    className="flex-1 font-bold text-lg"
                  />
                  <span className="text-slate-500 font-bold">%</span>
                </div>
                <p className="text-xs text-green-600 font-medium">₹{Math.round(sampleAmount * config[key as keyof typeof config] / 100)} per ₹{sampleAmount}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-medium">Total: </span>
                <span className={Object.values(config).reduce((a, b) => a + b, 0) === 100 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                  {Object.values(config).reduce((a, b) => a + b, 0)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Sample Amount:</Label>
                <Input type="number" value={sampleAmount} onChange={e => setSampleAmount(Number(e.target.value) || 5000)} className="w-24 h-8" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={isSaving || Object.values(config).reduce((a, b) => a + b, 0) !== 100}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5 text-primary" /> Role Permissions & Earnings</CardTitle>
          <CardDescription>What each role can do and earn in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rolePermissions.map(({ role, permissions, color }) => (
              <div key={role} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium mb-3 ${color}`}>
                  {role}
                </div>
                <ul className="space-y-1">
                  {permissions.map((perm, idx) => (
                    <li key={idx} className="text-sm flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><IndianRupee className="h-5 w-5 text-primary" /> Profit Distribution Example</CardTitle>
          <CardDescription>How a ₹{sampleAmount.toLocaleString()} membership fee is distributed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "Agent earns", value: config.agent, color: "bg-blue-500" },
              { label: "City Franchise earns", value: config.city, color: "bg-teal-500" },
              { label: "District Franchise earns", value: config.district, color: "bg-purple-500" },
              { label: "State Franchise earns", value: config.state, color: "bg-orange-500" },
              { label: "Zone Franchise earns", value: config.zone, color: "bg-red-500" },
              { label: "Company Profit", value: config.company, color: "bg-amber-500" }
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-40 text-sm font-medium">{label}</div>
                <div className="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${value}%` }} />
                </div>
                <div className="w-20 text-right font-bold">₹{Math.round(sampleAmount * value / 100).toLocaleString()}</div>
                <div className="w-12 text-right text-slate-500">{value}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PromotionalOffersManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", code: "", discountType: "percentage", discountValue: 0, validFrom: "", validTo: "", maxUses: 100, isActive: true });

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["promotional-offers"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/promotional-offers", );
      if (!res.ok) return [];
      return res.json();
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editItem ? `/api/admin/promotional-offers/${editItem.id}` : "/api/admin/promotional-offers";
      const res = await fetchWithCsrf(url, {
        method: editItem ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: editItem ? "Offer updated" : "Offer created" });
      queryClient.invalidateQueries({ queryKey: ["promotional-offers"] });
      setIsDialogOpen(false);
      setEditItem(null);
      setFormData({ name: "", code: "", discountType: "percentage", discountValue: 0, validFrom: "", validTo: "", maxUses: 100, isActive: true });
    },
    onError: () => toast({ title: "Error", description: "Failed to save offer", variant: "destructive" })
  });

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> Promotional Offers</CardTitle>
          <CardDescription>Manage discount codes and promotional offers</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditItem(null); setFormData({ name: "", code: "", discountType: "percentage", discountValue: 0, validFrom: "", validTo: "", maxUses: 100, isActive: true }); }}>
              <Plus className="h-4 w-4 mr-2" /> Add Offer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editItem ? "Edit Offer" : "Create Promotional Offer"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Offer Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div><Label>Promo Code</Label><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Discount Type</Label>
                  <Select value={formData.discountType} onValueChange={(v) => setFormData({ ...formData, discountType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed Amount</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Discount Value</Label><Input type="number" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Valid From</Label><Input type="date" value={formData.validFrom} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })} /></div>
                <div><Label>Valid To</Label><Input type="date" value={formData.validTo} onChange={(e) => setFormData({ ...formData, validTo: e.target.value })} /></div>
              </div>
              <div><Label>Max Uses</Label><Input type="number" value={formData.maxUses} onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })} /></div>
            </div>
            <DialogFooter>
              <Button onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {editItem ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
          <div className="space-y-3">
            {offers.length === 0 ? <p className="text-center text-slate-500 py-8">No promotional offers yet. Click "Add Offer" to create one.</p> : offers.map((offer: any) => (
              <div key={offer.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-medium">{offer.name}</div>
                  <div className="text-sm text-slate-500">Code: <span className="font-mono bg-slate-200 px-2 rounded">{offer.code}</span> | {offer.discountType === "percentage" ? `${offer.discountValue}% off` : `₹${offer.discountValue} off`}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={offer.isActive ? "default" : "secondary"}>{offer.isActive ? "Active" : "Inactive"}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => { setEditItem(offer); setFormData(offer); setIsDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MarketingCampaignsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", type: "email", subject: "", content: "", targetAudience: "all", scheduledAt: "" });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["marketing-campaigns"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/marketing-campaigns", );
      if (!res.ok) return [];
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetchWithCsrf("/api/admin/marketing-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Campaign created successfully" });
      queryClient.invalidateQueries({ queryKey: ["marketing-campaigns"] });
      setIsDialogOpen(false);
      setFormData({ name: "", type: "email", subject: "", content: "", targetAudience: "all", scheduledAt: "" });
    },
    onError: () => toast({ title: "Error", description: "Failed to create campaign", variant: "destructive" })
  });

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" /> Marketing Campaigns</CardTitle>
          <CardDescription>Create and manage email/SMS marketing campaigns</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Create Campaign</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Marketing Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Campaign Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div><Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="email">Email</SelectItem><SelectItem value="sms">SMS</SelectItem><SelectItem value="push">Push Notification</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Subject</Label><Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} /></div>
              <div><Label>Content</Label><textarea className="w-full border rounded-lg p-3 min-h-[100px]" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} /></div>
              <div><Label>Target Audience</Label>
                <Select value={formData.targetAudience} onValueChange={(v) => setFormData({ ...formData, targetAudience: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Users</SelectItem><SelectItem value="members">Active Members</SelectItem><SelectItem value="expired">Expired Members</SelectItem><SelectItem value="agents">Agents Only</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Schedule (optional)</Label><Input type="datetime-local" value={formData.scheduledAt} onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Create Campaign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
          <div className="space-y-3">
            {campaigns.length === 0 ? <p className="text-center text-slate-500 py-8">No campaigns yet. Click "Create Campaign" to start.</p> : campaigns.map((campaign: any) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-medium">{campaign.name}</div>
                  <div className="text-sm text-slate-500">{campaign.type.toUpperCase()} | {campaign.targetAudience} | {campaign.status}</div>
                </div>
                <Badge variant={campaign.status === "sent" ? "default" : campaign.status === "scheduled" ? "outline" : "secondary"}>{campaign.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FAQManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState({ question: "", answer: "", category: "general", sortOrder: 1, isActive: true });

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/faqs", );
      if (!res.ok) return [];
      return res.json();
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editItem ? `/api/admin/faqs/${editItem.id}` : "/api/admin/faqs";
      const res = await fetchWithCsrf(url, {
        method: editItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: editItem ? "FAQ updated" : "FAQ created" });
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      setIsDialogOpen(false);
      setEditItem(null);
      setFormData({ question: "", answer: "", category: "general", sortOrder: 1, isActive: true });
    },
    onError: () => toast({ title: "Error", description: "Failed to save FAQ", variant: "destructive" })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithCsrf(`/api/admin/faqs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "FAQ removed" });
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
    }
  });

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> FAQ Manager</CardTitle>
          <CardDescription>Manage frequently asked questions</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditItem(null); setFormData({ question: "", answer: "", category: "general", sortOrder: 1, isActive: true }); }}>
              <Plus className="h-4 w-4 mr-2" /> Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editItem ? "Edit FAQ" : "Add New FAQ"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Question</Label><Input value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} /></div>
              <div><Label>Answer</Label><textarea className="w-full border rounded-lg p-3 min-h-[100px]" value={formData.answer} onChange={(e) => setFormData({ ...formData, answer: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="general">General</SelectItem><SelectItem value="membership">Membership</SelectItem><SelectItem value="payment">Payment</SelectItem><SelectItem value="claims">Claims</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Sort Order</Label><Input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {editItem ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
          <div className="space-y-3">
            {faqs.length === 0 ? <p className="text-center text-slate-500 py-8">No FAQs yet</p> : faqs.map((faq: any) => (
              <div key={faq.id} className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{faq.question}</div>
                    <div className="text-sm text-slate-500 mt-1 line-clamp-2">{faq.answer}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant="outline">{faq.category}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => { setEditItem(faq); setFormData(faq); setIsDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(faq.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReportsManager() {
  const { data: stats } = useQuery({
    queryKey: ["reports-stats"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/analytics", );
      if (!res.ok) return null;
      return res.json();
    }
  });

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Reports Dashboard</CardTitle>
          <CardDescription>Real-time analytics from database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.totalUsers || 0}</div>
              <div className="text-sm text-slate-600">Total Users</div>
            </div>
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.totalMemberships || 0}</div>
              <div className="text-sm text-slate-600">Active Memberships</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl text-center">
              <div className="text-2xl font-bold text-orange-600">₹{(stats?.totalRevenue || 0).toLocaleString("en-IN")}</div>
              <div className="text-sm text-slate-600">Total Revenue</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl text-center">
              <div className="text-2xl font-bold text-purple-600">{stats?.totalPlans || 0}</div>
              <div className="text-sm text-slate-600">Active Plans</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Membership Trends</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.membershipTrends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#179299" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function FinancialReportsManager() {
  const queryClient = useQueryClient();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [refundReason, setRefundReason] = useState("");
  const [approvalCode, setApprovalCode] = useState("");
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["financial-payments"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/payments");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const activateMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const res = await fetchWithCsrf(`/api/admin/payments/${paymentId}/activate`, {
        method: "POST"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to activate");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-payments"] });
      alert("Membership activated successfully!");
    },
    onError: (error: any) => {
      alert(error.message || "Failed to activate");
    }
  });

  const refundMutation = useMutation({
    mutationFn: async ({ paymentId, reason, code }: { paymentId: string; reason: string; code: string }) => {
      const res = await fetchWithCsrf(`/api/admin/payments/${paymentId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, approvalCode: code })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to refund");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-payments"] });
      setShowRefundDialog(false);
      setRefundReason("");
      setApprovalCode("");
      alert("Refund processed successfully!");
    },
    onError: (error: any) => {
      alert(error.message || "Failed to process refund");
    }
  });

  const successPayments = payments.filter((p: any) => p.status === "succeeded");
  const pendingPayments = payments.filter((p: any) => p.status === "created" || p.status === "pending");
  const failedPayments = payments.filter((p: any) => p.status === "failed");
  
  const totalRevenue = successPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const cgst = totalRevenue * 0.09;
  const sgst = totalRevenue * 0.09;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "succeeded": return "bg-green-100 text-green-800";
      case "failed": return "bg-red-100 text-red-800";
      case "created":
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "refunded": return "bg-purple-100 text-purple-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-6 gap-4">
        <Card className="rounded-xl"><CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString("en-IN")}</div>
          <div className="text-sm text-slate-600">Total Revenue</div>
        </CardContent></Card>
        <Card className="rounded-xl"><CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold text-green-600">{successPayments.length}</div>
          <div className="text-sm text-slate-600">Successful</div>
        </CardContent></Card>
        <Card className="rounded-xl"><CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold text-yellow-600">{pendingPayments.length}</div>
          <div className="text-sm text-slate-600">Pending</div>
        </CardContent></Card>
        <Card className="rounded-xl"><CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold text-red-600">{failedPayments.length}</div>
          <div className="text-sm text-slate-600">Failed</div>
        </CardContent></Card>
        <Card className="rounded-xl"><CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold text-blue-600">₹{Math.round(cgst).toLocaleString("en-IN")}</div>
          <div className="text-sm text-slate-600">CGST (9%)</div>
        </CardContent></Card>
        <Card className="rounded-xl"><CardContent className="pt-6 text-center">
          <div className="text-2xl font-bold text-blue-600">₹{Math.round(sgst).toLocaleString("en-IN")}</div>
          <div className="text-sm text-slate-600">SGST (9%)</div>
        </CardContent></Card>
      </div>
      
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Payment Transactions</CardTitle>
          <p className="text-sm text-muted-foreground">View all payments, activate pending memberships, or process refunds</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading payments...</div>
          ) : payments.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {payments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-lg">₹{payment.amount?.toLocaleString("en-IN")}</div>
                      <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      {payment.userName} ({payment.userMobile}) | {payment.membershipNumber}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(payment.createdAt).toLocaleString()} | Plan: {payment.planType} | TXN: {payment.razorpayPaymentId || payment.razorpayOrderId || "N/A"}
                    </div>
                    {payment.statusReason && (
                      <div className="text-xs text-orange-600 mt-1">{payment.statusReason}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {(payment.status === "created" || payment.status === "pending") && payment.membershipStatus !== "active" && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-green-600 border-green-300"
                        onClick={() => activateMutation.mutate(payment.id)}
                        disabled={activateMutation.isPending}
                      >
                        Activate
                      </Button>
                    )}
                    {payment.status === "succeeded" && payment.razorpayPaymentId && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-300"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowRefundDialog(true);
                        }}
                      >
                        Refund
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Refund ₹{selectedPayment ? selectedPayment.amount?.toLocaleString("en-IN") : 0} to {selectedPayment?.userName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Reason for Refund</Label>
              <Input 
                value={refundReason} 
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter reason for refund"
              />
            </div>
            <div>
              <Label>Company Approval Code</Label>
              <Input 
                value={approvalCode} 
                onChange={(e) => setApprovalCode(e.target.value)}
                placeholder="Enter approval code"
                type="password"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Contact company admin for approval code. Set in Settings &gt; REFUND_APPROVAL_CODE
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>Cancel</Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (selectedPayment && refundReason && approvalCode) {
                  refundMutation.mutate({
                    paymentId: selectedPayment.id,
                    reason: refundReason,
                    code: approvalCode
                  });
                }
              }}
              disabled={!refundReason || !approvalCode || refundMutation.isPending}
            >
              {refundMutation.isPending ? "Processing..." : "Process Refund"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddOnsManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<any>(null);
  const [viewingAddOn, setViewingAddOn] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "blocked">("all");
  const [formData, setFormData] = useState({
    benefitCode: "",
    name: "",
    description: "",
    price: 0,
    benefitAmount: 0,
    validityDays: 365,
    usageLimit: 1,
    category: "health",
    applicablePlans: "",
    applicableCategories: "",
    isActive: true
  });

  const { data: addOns = [], isLoading } = useQuery({
    queryKey: ["admin-add-on-benefits"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/add-on-benefits");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetchWithCsrf("/api/admin/add-on-benefits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create add-on");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-add-on-benefits"] });
      toast({ title: "Success", description: "Add-on created successfully" });
      resetForm();
    },
    onError: (error: any) => toast({ title: "Error", description: error.message || "Failed to create add-on", variant: "destructive" })
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetchWithCsrf(`/api/admin/add-on-benefits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update add-on");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-add-on-benefits"] });
      toast({ title: "Success", description: "Add-on updated successfully" });
      resetForm();
    },
    onError: (error: any) => toast({ title: "Error", description: error.message || "Failed to update add-on", variant: "destructive" })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithCsrf(`/api/admin/add-on-benefits/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete add-on");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-add-on-benefits"] });
      toast({ title: "Success", description: "Add-on deleted successfully" });
    },
    onError: (error: any) => toast({ title: "Error", description: error.message || "Failed to delete add-on", variant: "destructive" })
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithCsrf(`/api/admin/add-on-benefits/${id}/toggle`, { method: "PATCH" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to toggle add-on status");
      }
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin-add-on-benefits"] });
      toast({ title: "Success", description: `Add-on ${data.isActive ? "activated" : "blocked"} successfully` });
    },
    onError: (error: any) => toast({ title: "Error", description: error.message || "Failed to toggle status", variant: "destructive" })
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingAddOn(null);
    setFormData({ benefitCode: "", name: "", description: "", price: 0, benefitAmount: 0, validityDays: 365, usageLimit: 1, category: "health", applicablePlans: "", applicableCategories: "", isActive: true });
  };

  const handleEdit = (addon: any) => {
    setEditingAddOn(addon);
    setFormData({
      benefitCode: addon.benefitCode || "",
      name: addon.name || "",
      description: addon.description || "",
      price: addon.price || 0,
      benefitAmount: addon.benefitAmount || 0,
      validityDays: addon.validityDays || 365,
      usageLimit: addon.usageLimit || 1,
      category: addon.category || "health",
      applicablePlans: addon.applicablePlans || "",
      applicableCategories: addon.applicableCategories || "",
      isActive: addon.isActive !== false
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.name || formData.price <= 0) {
      toast({ title: "Error", description: "Name and price are required", variant: "destructive" });
      return;
    }
    if (!formData.benefitCode && !editingAddOn) {
      toast({ title: "Error", description: "Benefit code is required", variant: "destructive" });
      return;
    }
    if (editingAddOn) {
      updateMutation.mutate({ id: editingAddOn.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredAddOns = addOns.filter((addon: any) => {
    if (filterStatus === "active") return addon.isActive;
    if (filterStatus === "blocked") return !addon.isActive;
    return true;
  });

  const activeCount = addOns.filter((a: any) => a.isActive).length;
  const blockedCount = addOns.filter((a: any) => !a.isActive).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{addOns.length}</p>
            <p className="text-xs text-muted-foreground">Total Add-Ons</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{blockedCount}</p>
            <p className="text-xs text-muted-foreground">Blocked</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> Add-On Benefits Manager</CardTitle>
            <CardDescription>Add, view, edit, delete, and block/unblock add-on benefits</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Filter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({addOns.length})</SelectItem>
                <SelectItem value="active">Active ({activeCount})</SelectItem>
                <SelectItem value="blocked">Blocked ({blockedCount})</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
              <Plus className="h-4 w-4" /> Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : filteredAddOns.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {filterStatus === "all" ? "No add-ons found. Click \"Add New\" to create one." : `No ${filterStatus} add-ons found.`}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAddOns.map((addon: any) => (
                <div key={addon.id} className={`p-4 border rounded-xl transition-shadow ${addon.isActive ? 'hover:shadow-md bg-white' : 'bg-slate-50 border-red-200 opacity-75'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{addon.name}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{addon.benefitCode}</div>
                    </div>
                    <Badge variant={addon.isActive ? "default" : "destructive"} className="text-xs ml-2">
                      {addon.isActive ? "Active" : "Blocked"}
                    </Badge>
                  </div>
                  <div className="text-lg font-bold text-primary">₹{addon.price?.toLocaleString()}</div>
                  <div className="text-sm text-green-700 font-medium">Support: ₹{addon.benefitAmount?.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 mt-1 line-clamp-2">{addon.description}</div>
                  <div className="text-xs text-slate-400 mt-2 flex gap-3">
                    <span>Valid: {addon.validityDays}d</span>
                    <span>Uses: {addon.usageLimit}</span>
                    <span className="capitalize">{addon.category}</span>
                  </div>
                  <div className="flex gap-1 mt-3 pt-3 border-t">
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => setViewingAddOn(addon)}>
                      <Eye className="h-3 w-3 mr-1" /> View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => handleEdit(addon)}>
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button
                      variant={addon.isActive ? "outline" : "default"}
                      size="sm"
                      className={`flex-1 text-xs h-8 ${addon.isActive ? 'text-orange-600 border-orange-200 hover:bg-orange-50' : 'bg-green-600 hover:bg-green-700'}`}
                      onClick={() => toggleMutation.mutate(addon.id)}
                      disabled={toggleMutation.isPending}
                    >
                      {addon.isActive ? <><Ban className="h-3 w-3 mr-1" /> Block</> : <><CheckCircle className="h-3 w-3 mr-1" /> Unblock</>}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 h-8 w-8 p-0" onClick={() => {
                      if (confirm("Permanently delete this add-on? This cannot be undone.")) deleteMutation.mutate(addon.id);
                    }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewingAddOn} onOpenChange={(open) => { if (!open) setViewingAddOn(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add-On Details</DialogTitle>
            <DialogDescription>Full details of this add-on benefit</DialogDescription>
          </DialogHeader>
          {viewingAddOn && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">{viewingAddOn.name}</span>
                <Badge variant={viewingAddOn.isActive ? "default" : "destructive"}>
                  {viewingAddOn.isActive ? "Active" : "Blocked"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Benefit Code</p>
                  <p className="font-mono font-medium">{viewingAddOn.benefitCode}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="font-medium capitalize">{viewingAddOn.category}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600">Price</p>
                  <p className="font-bold text-blue-900">₹{viewingAddOn.price?.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-600">Support Amount</p>
                  <p className="font-bold text-green-900">₹{viewingAddOn.benefitAmount?.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Validity</p>
                  <p className="font-medium">{viewingAddOn.validityDays} days</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Usage Limit</p>
                  <p className="font-medium">{viewingAddOn.usageLimit} times</p>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-sm mt-1">{viewingAddOn.description || "No description"}</p>
              </div>
              {viewingAddOn.applicablePlans && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Applicable Plans</p>
                  <p className="text-sm mt-1">{viewingAddOn.applicablePlans}</p>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Created: {viewingAddOn.createdAt ? new Date(viewingAddOn.createdAt).toLocaleDateString("en-IN") : "N/A"}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingAddOn(null)}>Close</Button>
            <Button onClick={() => { handleEdit(viewingAddOn); setViewingAddOn(null); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAddOn ? "Edit Add-On" : "Create New Add-On"}</DialogTitle>
            <DialogDescription>Fill in the details for the add-on benefit</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Benefit Code *</Label>
                <Input value={formData.benefitCode} onChange={(e) => setFormData({ ...formData, benefitCode: e.target.value.toUpperCase().replace(/\s+/g, '_') })} placeholder="e.g. AMBULANCE_PRIORITY" disabled={!!editingAddOn} />
              </div>
              <div>
                <Label>Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Ambulance Priority" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description of the add-on benefit" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (₹) *</Label>
                <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Support Amount (₹) *</Label>
                <Input type="number" value={formData.benefitAmount} onChange={(e) => setFormData({ ...formData, benefitAmount: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Validity (Days)</Label>
                <Input type="number" value={formData.validityDays} onChange={(e) => setFormData({ ...formData, validityDays: parseInt(e.target.value) || 365 })} />
              </div>
              <div>
                <Label>Usage Limit</Label>
                <Input type="number" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 1 })} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                    <SelectItem value="medicine">Medicine</SelectItem>
                    <SelectItem value="accident">Accident</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Applicable Plans (optional)</Label>
              <Input value={formData.applicablePlans} onChange={(e) => setFormData({ ...formData, applicablePlans: e.target.value })} placeholder="e.g. all or specific plan codes" />
            </div>
            <div>
              <Label>Applicable Categories (optional)</Label>
              <Input value={formData.applicableCategories} onChange={(e) => setFormData({ ...formData, applicableCategories: e.target.value })} placeholder="e.g. two_wheeler, car, family" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.isActive} onCheckedChange={(v) => setFormData({ ...formData, isActive: v })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingAddOn ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CalendarManager() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-calendar-events", selectedDate.getMonth(), selectedDate.getFullYear()],
    queryFn: async () => {
      const month = selectedDate.getMonth();
      const year = selectedDate.getFullYear();
      const res = await fetchWithCsrf(`/api/admin/calendar-events?month=${month}&year=${year}`);
      if (!res.ok) return [];
      const data = await res.json();
      const allEvents: any[] = [];
      
      if (data.membershipEvents) {
        data.membershipEvents.forEach((e: any) => {
          if (e.count > 0) {
            allEvents.push({
              date: new Date(e.date),
              title: `${e.count} new memberships`,
              type: "membership"
            });
          }
        });
      }
      
      if (data.revenueEvents) {
        data.revenueEvents.forEach((e: any) => {
          if (e.amount > 0) {
            allEvents.push({
              date: new Date(e.date),
              title: `₹${Number(e.amount).toLocaleString("en-IN")} revenue`,
              type: "revenue"
            });
          }
        });
      }
      
      return allEvents;
    }
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];
    
    const startPad = firstDay.getDay();
    for (let i = startPad - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    const endPad = 42 - days.length;
    for (let i = 1; i <= endPad; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((e: any) => {
      const eDate = new Date(e.date);
      return eDate.toDateString() === date.toDateString();
    });
  };

  const days = getDaysInMonth(selectedDate);
  const monthNames = ["January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Calendar
            </CardTitle>
            <CardDescription>View membership and revenue events</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}>
              Previous
            </Button>
            <span className="font-medium px-4">
              {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </span>
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}>
              Next
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="text-center py-2 text-sm font-medium text-slate-500">{day}</div>
              ))}
              {days.map((date, idx) => {
                const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                const isToday = date.toDateString() === new Date().toDateString();
                const dayEvents = getEventsForDate(date);
                
                return (
                  <div 
                    key={idx} 
                    className={`min-h-[80px] p-1 border rounded-lg ${
                      !isCurrentMonth ? 'bg-slate-50 text-slate-300' : 
                      isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
                    }`}
                  >
                    <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1 mt-1">
                      {dayEvents.slice(0, 2).map((e: any, i: number) => (
                        <div 
                          key={i} 
                          className={`text-[10px] px-1 py-0.5 rounded truncate ${
                            e.type === 'membership' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-slate-400">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TargetsIncentivesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState("targets");
  const [showTargetDialog, setShowTargetDialog] = useState(false);
  const [showSlabDialog, setShowSlabDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const { data: targets = [], isLoading: loadingTargets } = useQuery({
    queryKey: ["/api/admin/targets"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/targets");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const { data: slabs = [], isLoading: loadingSlabs } = useQuery({
    queryKey: ["/api/admin/incentive-slabs"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/incentive-slabs");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const { data: pendingRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["/api/admin/commission-requests/pending"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/commission-requests/pending");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/commission-stats"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/commission-stats");
      if (!res.ok) return { pendingRequests: 0, approvedAmount: 0, paidAmount: 0, activeTargets: 0 };
      return res.json();
    }
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/users");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const [targetForm, setTargetForm] = useState({
    targetType: "agent",
    userId: "",
    targetPeriod: "monthly",
    targetMonth: new Date().getMonth() + 1,
    targetYear: new Date().getFullYear(),
    revenueTarget: 0,
    membershipTarget: 0,
    notes: ""
  });

  const [slabForm, setSlabForm] = useState({
    slabName: "",
    targetType: "agent",
    minAchievementPercent: 0,
    maxAchievementPercent: 50,
    incentivePercent: 5,
    bonusAmount: 0
  });

  const [approvalForm, setApprovalForm] = useState({
    approvedAmount: 0,
    reviewNotes: ""
  });

  const createTarget = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetchWithCsrf("/api/admin/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create target");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/targets"] });
      toast({ title: "Target created successfully" });
      setShowTargetDialog(false);
    }
  });

  const createSlab = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetchWithCsrf("/api/admin/incentive-slabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create slab");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/incentive-slabs"] });
      toast({ title: "Incentive slab created successfully" });
      setShowSlabDialog(false);
    }
  });

  const approveRequest = useMutation({
    mutationFn: async ({ id, amount, notes }: { id: string; amount: number; notes: string }) => {
      const res = await fetchWithCsrf(`/api/admin/commission-requests/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ approvedAmount: amount, reviewNotes: notes })
      });
      if (!res.ok) throw new Error("Failed to approve");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/commission-requests/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/commission-stats"] });
      toast({ title: "Request approved" });
      setSelectedRequest(null);
    }
  });

  const rejectRequest = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const res = await fetchWithCsrf(`/api/admin/commission-requests/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reviewNotes: notes })
      });
      if (!res.ok) throw new Error("Failed to reject");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/commission-requests/pending"] });
      toast({ title: "Request rejected" });
      setSelectedRequest(null);
    }
  });

  const TARGET_TYPES = [
    { value: "agent", label: "Agent" },
    { value: "employee", label: "Employee" },
    { value: "zone_franchise", label: "Zone Franchise" },
    { value: "state_franchise", label: "State Franchise" },
    { value: "district_franchise", label: "District Franchise" },
    { value: "city_franchise", label: "City Franchise" }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending Approvals</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.pendingRequests || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Approved Amount</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats?.approvedAmount || 0)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Paid Out</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats?.paidAmount || 0)}</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Active Targets</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.activeTargets || 0}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveSubTab("targets")}
          className={`px-4 py-2 font-medium border-b-2 transition ${activeSubTab === "targets" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}
        >
          Business Targets
        </button>
        <button
          onClick={() => setActiveSubTab("slabs")}
          className={`px-4 py-2 font-medium border-b-2 transition ${activeSubTab === "slabs" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}
        >
          Incentive Slabs
        </button>
        <button
          onClick={() => setActiveSubTab("pending")}
          className={`px-4 py-2 font-medium border-b-2 transition ${activeSubTab === "pending" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}
        >
          Pending Approvals {(stats?.pendingRequests || 0) > 0 && <Badge variant="destructive" className="ml-2">{stats.pendingRequests}</Badge>}
        </button>
      </div>

      {activeSubTab === "targets" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Business Targets</CardTitle>
              <CardDescription>Set monthly/quarterly targets for agents, employees, and franchises</CardDescription>
            </div>
            <Dialog open={showTargetDialog} onOpenChange={setShowTargetDialog}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Set New Target</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Set Business Target</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Target Type</Label>
                      <Select value={targetForm.targetType} onValueChange={v => setTargetForm({ ...targetForm, targetType: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TARGET_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Period</Label>
                      <Select value={targetForm.targetPeriod} onValueChange={v => setTargetForm({ ...targetForm, targetPeriod: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Assign To (User)</Label>
                    <Select value={targetForm.userId} onValueChange={v => setTargetForm({ ...targetForm, userId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                      <SelectContent>
                        {users.filter((u: any) => {
                          const roleMap: Record<string, string[]> = {
                            "agent": ["agent"],
                            "employee": ["employee"],
                            "zone_franchise": ["zone_franchise"],
                            "state_franchise": ["state_franchise"],
                            "district_franchise": ["district_franchise"],
                            "city_franchise": ["city_franchise"]
                          };
                          return roleMap[targetForm.targetType]?.includes(u.role);
                        }).map((u: any) => (
                          <SelectItem key={u.id} value={u.id}>{u.name || u.mobile} ({u.role})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Month</Label>
                      <Select value={String(targetForm.targetMonth)} onValueChange={v => setTargetForm({ ...targetForm, targetMonth: Number(v) })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                            <SelectItem key={m} value={String(m)}>{new Date(2024, m-1).toLocaleString("default", { month: "long" })}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Year</Label>
                      <Input type="number" value={targetForm.targetYear} onChange={e => setTargetForm({ ...targetForm, targetYear: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Revenue Target (₹)</Label>
                      <Input type="number" value={targetForm.revenueTarget} onChange={e => setTargetForm({ ...targetForm, revenueTarget: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label>Membership Target</Label>
                      <Input type="number" value={targetForm.membershipTarget} onChange={e => setTargetForm({ ...targetForm, membershipTarget: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Input value={targetForm.notes} onChange={e => setTargetForm({ ...targetForm, notes: e.target.value })} placeholder="Optional notes" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowTargetDialog(false)}>Cancel</Button>
                  <Button onClick={() => createTarget.mutate(targetForm)} disabled={createTarget.isPending}>
                    {createTarget.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create Target
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loadingTargets ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : targets.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No targets set yet. Create your first target above.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">User</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Period</th>
                      <th className="text-right p-2">Revenue Target</th>
                      <th className="text-right p-2">Achieved</th>
                      <th className="text-center p-2">Progress</th>
                      <th className="text-center p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {targets.map((target: any) => (
                      <tr key={target.id} className="border-b hover:bg-slate-50">
                        <td className="p-2">{target.user?.name || target.user?.mobile || "N/A"}</td>
                        <td className="p-2"><Badge variant="outline">{target.targetType}</Badge></td>
                        <td className="p-2">{target.targetPeriod} - {target.targetMonth}/{target.targetYear}</td>
                        <td className="p-2 text-right">{formatCurrency(target.revenueTarget)}</td>
                        <td className="p-2 text-right">{formatCurrency(target.revenueAchieved)}</td>
                        <td className="p-2">
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, target.achievementPercent)}%` }} />
                          </div>
                          <span className="text-xs text-slate-500">{target.achievementPercent}%</span>
                        </td>
                        <td className="p-2 text-center">
                          <Badge variant={target.status === "active" ? "default" : "secondary"}>{target.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeSubTab === "slabs" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Incentive Slabs</CardTitle>
              <CardDescription>Define incentive percentages based on target achievement levels</CardDescription>
            </div>
            <Dialog open={showSlabDialog} onOpenChange={setShowSlabDialog}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Add Slab</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Incentive Slab</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Slab Name</Label>
                    <Input value={slabForm.slabName} onChange={e => setSlabForm({ ...slabForm, slabName: e.target.value })} placeholder="e.g., Bronze (0-50%)" />
                  </div>
                  <div>
                    <Label>Target Type</Label>
                    <Select value={slabForm.targetType} onValueChange={v => setSlabForm({ ...slabForm, targetType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TARGET_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Min Achievement %</Label>
                      <Input type="number" value={slabForm.minAchievementPercent} onChange={e => setSlabForm({ ...slabForm, minAchievementPercent: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label>Max Achievement %</Label>
                      <Input type="number" value={slabForm.maxAchievementPercent} onChange={e => setSlabForm({ ...slabForm, maxAchievementPercent: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Incentive %</Label>
                      <Input type="number" value={slabForm.incentivePercent} onChange={e => setSlabForm({ ...slabForm, incentivePercent: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label>Bonus Amount (₹)</Label>
                      <Input type="number" value={slabForm.bonusAmount} onChange={e => setSlabForm({ ...slabForm, bonusAmount: Number(e.target.value) })} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSlabDialog(false)}>Cancel</Button>
                  <Button onClick={() => createSlab.mutate(slabForm)} disabled={createSlab.isPending}>
                    {createSlab.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create Slab
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loadingSlabs ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : slabs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No incentive slabs defined yet. Create your first slab above.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {slabs.map((slab: any) => (
                  <Card key={slab.id} className="border-2">
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg">{slab.slabName}</h3>
                      <Badge variant="outline" className="mt-1">{slab.targetType}</Badge>
                      <div className="mt-3 space-y-1 text-sm">
                        <p>Achievement: {slab.minAchievementPercent}% - {slab.maxAchievementPercent}%</p>
                        <p className="text-green-600 font-medium">Incentive: {slab.incentivePercent}%</p>
                        {slab.bonusAmount > 0 && <p className="text-blue-600">+ Bonus: {formatCurrency(slab.bonusAmount)}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeSubTab === "pending" && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Commission Approvals</CardTitle>
            <CardDescription>Review and approve commission requests from agents and franchises</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRequests ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No pending commission requests.</div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request: any) => (
                  <Card key={request.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">{request.user?.name || request.user?.mobile}</h4>
                          <p className="text-sm text-slate-500">{request.requestType} - {request.requestPeriod}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Revenue Generated</p>
                          <p className="text-lg font-bold">{formatCurrency(request.revenueGenerated)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Calculated Incentive</p>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(request.calculatedIncentive)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Dialog 
                            open={selectedRequest?.id === request.id} 
                            onOpenChange={(open) => {
                              if (open) {
                                setSelectedRequest(request);
                                setApprovalForm({ approvedAmount: request.calculatedIncentive, reviewNotes: "" });
                              } else {
                                setSelectedRequest(null);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">Review</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Review Commission Request</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-slate-500">User</p>
                                    <p className="font-medium">{request.user?.name || request.user?.mobile}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500">Type</p>
                                    <p className="font-medium">{request.requestType}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500">Period</p>
                                    <p className="font-medium">{request.requestPeriod}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500">Achievement</p>
                                    <p className="font-medium">{request.achievementPercent}%</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500">Revenue</p>
                                    <p className="font-medium">{formatCurrency(request.revenueGenerated)}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500">Memberships</p>
                                    <p className="font-medium">{request.membershipsGenerated}</p>
                                  </div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                  <p className="text-sm text-green-700">System Calculated Incentive</p>
                                  <p className="text-2xl font-bold text-green-600">{formatCurrency(request.calculatedIncentive)}</p>
                                </div>
                                <div>
                                  <Label>Approved Amount (₹)</Label>
                                  <Input 
                                    type="number" 
                                    value={approvalForm.approvedAmount}
                                    onChange={e => setApprovalForm({ ...approvalForm, approvedAmount: Number(e.target.value) })}
                                  />
                                </div>
                                <div>
                                  <Label>Review Notes</Label>
                                  <Input 
                                    placeholder="Optional notes" 
                                    value={approvalForm.reviewNotes}
                                    onChange={e => setApprovalForm({ ...approvalForm, reviewNotes: e.target.value })}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button 
                                  variant="destructive" 
                                  disabled={rejectRequest.isPending}
                                  onClick={() => rejectRequest.mutate({ 
                                    id: request.id, 
                                    notes: approvalForm.reviewNotes
                                  })}
                                >
                                  {rejectRequest.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                  Reject
                                </Button>
                                <Button 
                                  disabled={approveRequest.isPending}
                                  onClick={() => approveRequest.mutate({ 
                                    id: request.id, 
                                    amount: approvalForm.approvedAmount,
                                    notes: approvalForm.reviewNotes
                                  })}
                                >
                                  {approveRequest.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                  Approve
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AadharVerificationManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingUsers = [], isLoading } = useQuery({
    queryKey: ["/api/admin/aadhar/pending"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/aadhar/pending");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ userId, action, reason }: { userId: string; action: "approve" | "reject"; reason?: string }) => {
      const res = await fetchWithCsrf(`/api/admin/aadhar/verify/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason })
      });
      if (!res.ok) throw new Error("Verification failed");
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({ 
        title: variables.action === "approve" ? "Aadhar Verified" : "Verification Rejected",
        description: variables.action === "approve" ? "User's Aadhar has been approved" : "User's Aadhar has been rejected"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/aadhar/pending"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to process verification", variant: "destructive" });
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Pending Aadhar Verifications
          </CardTitle>
          <CardDescription>
            Users who have uploaded Aadhar documents and are awaiting manual verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>No pending Aadhar verifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user: any) => (
                <Card key={user.id} className="border-l-4 border-l-amber-500">
                  <CardContent className="pt-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{user.fullName || "No Name"}</span>
                          <Badge variant="outline">{user.membershipId || "No ID"}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.mobile || "N/A"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email || "N/A"}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Aadhar Number:</span>{" "}
                          <span className="font-mono">{user.aadharNumber || "Not provided"}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Submitted: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {user.aadharFrontUrl && (
                          <a href={user.aadharFrontUrl} target="_blank" rel="noopener noreferrer" className="block">
                            <img 
                              src={user.aadharFrontUrl} 
                              alt="Aadhar Front" 
                              className="h-20 w-32 object-cover rounded border hover:border-primary transition-colors"
                            />
                            <span className="text-xs text-center block mt-1">Front</span>
                          </a>
                        )}
                        {user.aadharBackUrl && (
                          <a href={user.aadharBackUrl} target="_blank" rel="noopener noreferrer" className="block">
                            <img 
                              src={user.aadharBackUrl} 
                              alt="Aadhar Back" 
                              className="h-20 w-32 object-cover rounded border hover:border-primary transition-colors"
                            />
                            <span className="text-xs text-center block mt-1">Back</span>
                          </a>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 justify-center">
                        <Button 
                          size="sm" 
                          onClick={() => verifyMutation.mutate({ userId: user.id, action: "approve" })}
                          disabled={verifyMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {verifyMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => verifyMutation.mutate({ userId: user.id, action: "reject", reason: "Documents unclear or invalid" })}
                          disabled={verifyMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DiseaseExclusionsManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", category: "chronic", description: "", waitingPeriodMonths: 12, isPreExisting: false });

  const { data: exclusions = [], isLoading } = useQuery({
    queryKey: ["disease-exclusions"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/disease-exclusions");
      return res.ok ? res.json() : [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetchWithCsrf("/api/admin/disease-exclusions", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disease-exclusions"] });
      toast({ title: "Success", description: "Exclusion added" });
      setShowForm(false);
      setFormData({ name: "", category: "chronic", description: "", waitingPeriodMonths: 12, isPreExisting: false });
    }
  });

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><XCircle className="h-5 w-5" /> Disease Exclusions</CardTitle>
            <CardDescription>Manage conditions excluded from assistance</CardDescription>
          </div>
          <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" /> Add Exclusion</Button>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div> : 
          exclusions.length === 0 ? <div className="text-center py-8 text-slate-500">No exclusions defined</div> : (
            <div className="space-y-3">
              {exclusions.map((ex: any) => (
                <div key={ex.id} className="p-4 border rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-medium">{ex.name}</div>
                    <div className="text-sm text-slate-500">{ex.category} - {ex.waitingPeriodMonths} months waiting</div>
                  </div>
                  <Badge variant={ex.isPreExisting ? "secondary" : "default"}>{ex.isPreExisting ? "Pre-existing" : "Standard"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Disease Exclusion</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Disease Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="chronic">Chronic</SelectItem>
                <SelectItem value="genetic">Genetic</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Waiting Period (months)" value={formData.waitingPeriodMonths} onChange={e => setFormData({...formData, waitingPeriodMonths: parseInt(e.target.value) || 12})} />
            <Textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <Button onClick={() => createMutation.mutate(formData)} disabled={!formData.name}>Add Exclusion</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CoverageZonesManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", states: "", description: "", isActive: true });

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ["coverage-zones"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/coverage-zones");
      return res.ok ? res.json() : [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetchWithCsrf("/api/admin/coverage-zones", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, states: data.states.split(",").map((s: string) => s.trim()) })
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coverage-zones"] });
      toast({ title: "Success", description: "Zone added" });
      setShowForm(false);
    }
  });

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Coverage Zones</CardTitle>
            <CardDescription>Manage service areas and regions</CardDescription>
          </div>
          <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" /> Add Zone</Button>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div> : 
          zones.length === 0 ? <div className="text-center py-8 text-slate-500">No coverage zones defined</div> : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zones.map((zone: any) => (
                <div key={zone.id} className="p-4 border rounded-xl">
                  <div className="font-medium">{zone.name}</div>
                  <div className="text-sm text-slate-500">{Array.isArray(zone.states) ? zone.states.join(", ") : zone.states}</div>
                  <Badge variant={zone.isActive ? "default" : "secondary"} className="mt-2">{zone.isActive ? "Active" : "Inactive"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Coverage Zone</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Zone Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <Input placeholder="States (comma-separated)" value={formData.states} onChange={e => setFormData({...formData, states: e.target.value})} />
            <Textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <Button onClick={() => createMutation.mutate(formData)} disabled={!formData.name}>Add Zone</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmployersManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", contactPerson: "", email: "", mobile: "", address: "", gstNumber: "" });

  const { data: employers = [], isLoading } = useQuery({
    queryKey: ["employers"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/employers");
      return res.ok ? res.json() : [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetchWithCsrf("/api/admin/employers", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employers"] });
      toast({ title: "Success", description: "Employer added" });
      setShowForm(false);
      setFormData({ name: "", contactPerson: "", email: "", mobile: "", address: "", gstNumber: "" });
    }
  });

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> Employers / Corporate</CardTitle>
            <CardDescription>Manage corporate membership accounts</CardDescription>
          </div>
          <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" /> Add Employer</Button>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div> : 
          employers.length === 0 ? <div className="text-center py-8 text-slate-500">No employers registered</div> : (
            <div className="space-y-3">
              {employers.map((emp: any) => (
                <div key={emp.id} className="p-4 border rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-medium">{emp.name}</div>
                    <div className="text-sm text-slate-500">{emp.contactPerson} - {emp.email}</div>
                  </div>
                  <Badge variant={emp.isActive !== false ? "default" : "secondary"}>{emp.isActive !== false ? "Active" : "Inactive"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Employer</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Company Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <Input placeholder="Contact Person" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
            <Input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <Input placeholder="Mobile" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
            <Input placeholder="GST Number" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} />
            <Textarea placeholder="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            <Button onClick={() => createMutation.mutate(formData)} disabled={!formData.name || !formData.email}>Add Employer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EnterprisePlansManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    companyName: "", 
    contactPerson: "", 
    email: "", 
    mobile: "", 
    employeeCount: 10,
    planId: "",
    discountPercent: 10,
    notes: ""
  });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["enterprise-plans"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/enterprise-plans");
      return res.ok ? res.json() : [];
    }
  });

  const { data: allPlans = [] } = useQuery({
    queryKey: ["all-plans"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/plans");
      return res.ok ? res.json() : [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetchWithCsrf("/api/admin/enterprise-plans", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprise-plans"] });
      toast({ title: "Success", description: "Enterprise plan created" });
      setShowForm(false);
      setFormData({ companyName: "", contactPerson: "", email: "", mobile: "", employeeCount: 10, planId: "", discountPercent: 10, notes: "" });
    }
  });

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Enterprise Plans</CardTitle>
            <CardDescription>Bulk corporate membership subscriptions</CardDescription>
          </div>
          <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" /> Create Enterprise Plan</Button>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div> : 
          plans.length === 0 ? <div className="text-center py-8 text-slate-500">No enterprise subscriptions yet</div> : (
            <div className="space-y-3">
              {plans.map((plan: any) => (
                <div key={plan.id} className="p-4 border rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-medium">{plan.companyName}</div>
                    <div className="text-sm text-slate-500">{plan.contactPerson} - {plan.employeeCount} employees - {plan.discountPercent}% discount</div>
                  </div>
                  <Badge variant={plan.status === "active" ? "default" : "secondary"}>{plan.status || "pending"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Enterprise Plan</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <Input placeholder="Company Name" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
            <Input placeholder="Contact Person" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
            <Input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <Input placeholder="Mobile" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
            <Input type="number" placeholder="Employee Count" value={formData.employeeCount} onChange={e => setFormData({...formData, employeeCount: parseInt(e.target.value) || 10})} />
            <Select value={formData.planId} onValueChange={v => setFormData({...formData, planId: v})}>
              <SelectTrigger><SelectValue placeholder="Select Base Plan" /></SelectTrigger>
              <SelectContent>
                {allPlans.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.name} - ₹{p.price}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Discount %" value={formData.discountPercent} onChange={e => setFormData({...formData, discountPercent: parseInt(e.target.value) || 0})} />
            <Textarea placeholder="Notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
            <Button onClick={() => createMutation.mutate(formData)} disabled={!formData.companyName || !formData.email} className="w-full">Create Enterprise Plan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DocumentsManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    category: "agreement", 
    description: "", 
    content: "",
    isRequired: true,
    forRole: "all"
  });

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["admin-documents"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/documents");
      return res.ok ? res.json() : [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetchWithCsrf("/api/admin/documents", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      toast({ title: "Success", description: "Document template created" });
      setShowForm(false);
      setFormData({ name: "", category: "agreement", description: "", content: "", isRequired: true, forRole: "all" });
    }
  });

  const defaultTemplates = [
    { name: "Membership Agreement", category: "agreement", description: "Terms and conditions template" },
    { name: "Privacy Policy", category: "policy", description: "Data handling guidelines" },
    { name: "Claim Form", category: "form", description: "Assistance request template" },
    { name: "Hospital Agreement", category: "agreement", description: "Network hospital contract" },
    { name: "Agent Contract", category: "agreement", description: "Agent onboarding terms" },
    { name: "Franchise Agreement", category: "agreement", description: "Franchise terms template" }
  ];

  const allDocs = documents.length > 0 ? documents : defaultTemplates;

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><FileCheck className="h-5 w-5" /> Documents & Templates</CardTitle>
            <CardDescription>Manage document templates and compliance files</CardDescription>
          </div>
          <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" /> Add Document</Button>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allDocs.map((doc: any, idx: number) => (
                <div key={doc.id || idx} className="p-6 border rounded-xl text-center hover:shadow-md transition-shadow cursor-pointer">
                  <FileText className="h-10 w-10 text-primary mx-auto mb-3" />
                  <div className="font-medium">{doc.name}</div>
                  <div className="text-sm text-slate-500">{doc.description}</div>
                  {doc.category && <Badge variant="outline" className="mt-2">{doc.category}</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Document Template</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <Input placeholder="Document Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="agreement">Agreement</SelectItem>
                <SelectItem value="policy">Policy</SelectItem>
                <SelectItem value="form">Form</SelectItem>
                <SelectItem value="certificate">Certificate</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formData.forRole} onValueChange={v => setFormData({...formData, forRole: v})}>
              <SelectTrigger><SelectValue placeholder="For Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="member">Members</SelectItem>
                <SelectItem value="agent">Agents</SelectItem>
                <SelectItem value="franchise">Franchises</SelectItem>
                <SelectItem value="hospital">Hospitals</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <Textarea placeholder="Document Content / Template Text" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} rows={5} />
            <Button onClick={() => createMutation.mutate(formData)} disabled={!formData.name} className="w-full">Add Document</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== CHATBOT LEADS PANEL =====
function ChatbotLeadsPanel() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const { data: sessions = [], isLoading } = useQuery<any[]>({
    queryKey: ["admin", "chatbot-sessions"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/chatbot-sessions?limit=100");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: messages = [] } = useQuery<any[]>({
    queryKey: ["admin", "chatbot-messages", selectedSession],
    queryFn: async () => {
      if (!selectedSession) return [];
      const res = await fetchWithCsrf(`/api/admin/chatbot-sessions/${selectedSession}/messages`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!selectedSession,
  });

  const totalSessions = sessions.length;
  const withPhone = sessions.filter((s: any) => s.visitorMobile).length;
  const converted = sessions.filter((s: any) => s.isConverted).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <p className="text-3xl font-bold text-slate-900">{totalSessions}</p>
          <p className="text-sm text-slate-500 mt-1">Total Conversations</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <p className="text-3xl font-bold text-teal-600">{withPhone}</p>
          <p className="text-sm text-slate-500 mt-1">Phone Captured</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <p className="text-3xl font-bold text-green-600">{converted}</p>
          <p className="text-sm text-slate-500 mt-1">Buy Intent Detected</p>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Recent Conversations</h3>
          </div>
          <div className="overflow-y-auto max-h-[500px]">
            {isLoading ? (
              <div className="p-6 text-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400 mx-auto" /></div>
            ) : sessions.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No conversations yet</div>
            ) : (
              sessions.map((s: any) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSession(s.sessionId)}
                  className={`px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${selectedSession === s.sessionId ? "bg-teal-50 border-l-2 border-l-teal-500" : ""}`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-slate-800 text-xs">{s.visitorName || "Anonymous"}</span>
                    <span className="text-[10px] text-slate-400">{s.lastMessageAt ? new Date(s.lastMessageAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}</span>
                  </div>
                  {s.visitorMobile && <p className="text-[10px] text-teal-600 font-mono mb-0.5">📱 {s.visitorMobile}</p>}
                  <p className="text-[10px] text-slate-500 truncate">{s.firstMessage || "—"}</p>
                  <div className="flex gap-1 mt-1">
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{s.messageCount} msgs</span>
                    {s.isConverted && <span className="text-[9px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">Buy Intent</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="col-span-3 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">{selectedSession ? "Conversation" : "Select a conversation"}</h3>
          </div>
          <div className="overflow-y-auto max-h-[500px] p-4 space-y-3">
            {!selectedSession ? (
              <div className="text-center text-slate-400 py-16 text-sm">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-slate-200" />
                Click a conversation to read it
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-slate-400 py-8 text-sm"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></div>
            ) : (
              messages.map((m: any) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-[#0B1F3A] text-white" : "bg-slate-100 text-slate-700"}`}>
                    <p className={`text-[9px] mb-1 font-medium ${m.role === "user" ? "text-white/60" : "text-slate-400"}`}>
                      {m.role === "user" ? "Visitor" : "Raksha Buddy"} · {new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {m.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
