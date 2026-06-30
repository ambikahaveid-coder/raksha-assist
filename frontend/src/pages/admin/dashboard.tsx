import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { fetchWithCsrf } from "@/lib/csrf";
import { useAuth } from "@/hooks/use-auth";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Building2,
  ChevronRight,
  Search,
  LogOut,
  ShieldCheck,
  Trophy,
  Megaphone,
  PhoneCall,
  TrendingUp,
  BarChart3,
  Activity,
  Loader2,
  Home,
  Briefcase,
  Hospital,
  Car
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import logoImg from "@/assets/logo.png";
import { Leaderboard } from "@/components/admin/Leaderboard";
import { OffersManager } from "@/components/admin/OffersManager";
import VehicleSosCasesAdmin from "@/pages/admin/vehicle-sos-cases";

const CHART_COLORS = {
  primary: "#0B1F3A",
  secondary: "#179299",
  accent: "#F6A60B",
  success: "#10B981",
  warning: "#F59E0B",
  purple: "#8B5CF6",
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  const { user, isLoading: userLoading } = useAuth();

  const isAuthorized = !!user && ["admin", "super_admin"].includes(user.role);
  const isSuperAdmin = user?.role === "super_admin";

  const { data: analytics } = useQuery({
    queryKey: ["analytics", "admin"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/analytics/admin");
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAuthorized
  });

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const stats = [
    { title: "Total Members", value: analytics?.totalMembers?.toLocaleString() || "12,450", icon: Users, color: "text-blue-600" },
    { title: "Active Requests", value: analytics?.activeRequests?.toString() || "24", icon: ShieldAlert, color: "text-orange-600" },
    { title: "Disbursed (MTD)", value: `₹${((analytics?.disbursedMTD || 4520000) / 100000).toFixed(1)}L`, icon: CheckCircle, color: "text-green-600" },
    { title: "Partner Hospitals", value: analytics?.partnerHospitals?.toString() || "156", icon: Building2, color: "text-purple-600" },
  ];

  const membershipStatusData = [
    { name: "Active", value: analytics?.membershipStatus?.active || 85, color: CHART_COLORS.success },
    { name: "Expired", value: analytics?.membershipStatus?.expired || 10, color: CHART_COLORS.warning },
    { name: "Pending", value: analytics?.membershipStatus?.pending || 5, color: CHART_COLORS.purple },
  ];

  const SidebarItem = ({ id, label, icon: Icon, superOnly = false }: any) => {
    if (superOnly && !isSuperAdmin) return null;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
          activeTab === id 
            ? "bg-primary text-white shadow-lg shadow-primary/20" 
            : "text-slate-500 hover:bg-slate-50"
        }`}
      >
        <Icon className="h-5 w-5" />
        <span className="font-medium">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 fixed h-full overflow-y-auto">
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="Logo" className="h-8 w-auto" />
          <span className="font-heading font-bold text-lg text-primary">Raksha<span className="text-secondary">Admin</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 mb-2 mt-2">Operations</div>
          <SidebarItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
          <SidebarItem id="users" label="Member Management" icon={Users} />
          <SidebarItem id="requests" label="Emergency Cases" icon={ShieldAlert} />
          <SidebarItem id="vehicle-sos" label="Vehicle SOS Cases" icon={Car} />
          
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 mb-2 mt-6">Growth</div>
          <SidebarItem id="offers" label="Offers & Promos" icon={Megaphone} />
          <SidebarItem id="leaderboard" label="Partner Leaderboard" icon={Trophy} />

          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 mb-2 mt-6">HR</div>
          <Link href="/hr-portal">
            <Button variant="ghost" className="w-full justify-start font-medium">
              <Briefcase className="mr-2 h-4 w-4" /> HR Portal
            </Button>
          </Link>

          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 mb-2 mt-6">System</div>
          <SidebarItem id="permissions" label="Roles & Permissions" icon={ShieldCheck} superOnly={true} />
          <SidebarItem id="settings" label="Global Settings" icon={Settings} superOnly={true} />
        </nav>

        <div className="pt-6 border-t">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-slate-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                {isSuperAdmin ? "Super Admin" : "Admin"}
              </p>
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-primary hover:bg-slate-50 mb-2">
              <Home className="mr-2 h-4 w-4" /> Home
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 ml-64">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {activeTab === "dashboard" && "Platform Overview"}
              {activeTab === "permissions" && "Roles & Permissions"}
              {activeTab === "users" && "User Management"}
              {activeTab === "offers" && "Offers Management"}
              {activeTab === "leaderboard" && "Performance Leaderboard"}
              {activeTab === "vehicle-sos" && "Vehicle SOS Cases"}
              {activeTab === "requests" && "Emergency Cases"}
            </h1>
            <p className="text-sm text-muted-foreground">Welcome back to the command center.</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200 text-xs font-medium">
               <PhoneCall className="h-3 w-3" /> Support: +91 81437 52025
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-10 w-64 bg-white border-slate-200" placeholder="Search anything..." />
            </div>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <Card key={i} className="border-none shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                        <h3 className="text-2xl font-bold">{stat.value}</h3>
                      </div>
                      <div className={`p-3 rounded-xl bg-slate-50 ${stat.color}`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Recent Emergency Requests</CardTitle>
                  <Button variant="outline" size="sm">View All</Button>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-slate-100">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="py-4 flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                            <ShieldAlert className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">Hospital Admission: Patient RA-{742 + item}</p>
                            <p className="text-xs text-muted-foreground">Apollo Speciality • 2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Verifying</Badge>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Permission Quick-Look</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Super Admin</span>
                      <span className="text-green-600 font-bold">Full Access</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-full"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Admin</span>
                      <span className="text-blue-600 font-bold">Limited Access</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-3/4"></div>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">Admins cannot manage roles or system settings.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "offers" && <OffersManager canEdit={isAuthorized} />}
        {activeTab === "leaderboard" && <Leaderboard />}
        {activeTab === "vehicle-sos" && <VehicleSosCasesAdmin />}

        {activeTab === "permissions" && (
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 rounded-xl border border-primary/10 bg-primary/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                      <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Super Admin Role</h3>
                      <p className="text-sm text-muted-foreground">Highest authority. Can manage admins and global finance.</p>
                    </div>
                  </div>
                  <Badge className="bg-primary text-white">1 Active</Badge>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Standard Admin</h3>
                      <p className="text-sm text-muted-foreground">Operational access. Can verify cases and members.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">4 Active</Badge>
                    <Button variant="ghost" size="sm">Manage Permissions</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" /> Payment Gateway (Razorpay)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Razorpay Key ID</label>
                    <Input type="password" placeholder="rzp_live_xxxxx" disabled value="••••••••••••" />
                    <p className="text-xs text-muted-foreground">Set via RAZORPAY_KEY_ID environment variable</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Razorpay Secret</label>
                    <Input type="password" placeholder="••••••••" disabled value="••••••••••••" />
                    <p className="text-xs text-muted-foreground">Set via RAZORPAY_KEY_SECRET environment variable</p>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Payment gateway configured and active
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PhoneCall className="h-5 w-5" /> OTP Provider Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">OTP Provider</label>
                    <Input disabled value="Firebase Phone Auth" />
                    <p className="text-xs text-muted-foreground">Client-side Firebase OTP verification</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Status</label>
                    <Input disabled value="Production Ready" />
                    <p className="text-xs text-muted-foreground">Configure in Super Admin settings</p>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    Firebase Phone Authentication enabled. OTP is handled securely via Firebase SDK.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" /> Email Provider Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email Provider</label>
                    <Input disabled value="SendGrid / Resend" />
                    <p className="text-xs text-muted-foreground">Set SENDGRID_API_KEY or RESEND_API_KEY</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">From Email</label>
                    <Input disabled value="noreply@rakshaassist.com" />
                    <p className="text-xs text-muted-foreground">Sender email address</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600">
                    Configure environment variables to enable email notifications.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" /> SMS Gateway (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">SMS Provider</label>
                    <Input disabled placeholder="twilio / msg91 / textlocal" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">SMS API Key</label>
                    <Input type="password" disabled placeholder="Not configured" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Sender ID</label>
                    <Input disabled placeholder="RAKSHA" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Environment variables: SMS_PROVIDER, SMS_API_KEY, SMS_SENDER_ID
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hospital className="h-5 w-5" /> WhatsApp Business API (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">WhatsApp API Key</label>
                    <Input type="password" disabled placeholder="Not configured" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Business Phone</label>
                    <Input disabled placeholder="+91 XXXXXXXXXX" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Environment variables: WHATSAPP_API_KEY, WHATSAPP_BUSINESS_PHONE
                </p>
              </CardContent>
            </Card>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">How to Configure</h4>
              <p className="text-sm text-blue-800">
                All 3rd party integrations are configured via environment variables.
                Update the secrets and restart the server for changes to take effect.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}