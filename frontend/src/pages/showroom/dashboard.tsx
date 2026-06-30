import { useState, useEffect } from "react";
import { fetchWithCsrf, clearAuthToken } from "@/lib/csrf";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Car, Users, AlertTriangle, TrendingUp, IndianRupee, 
  LogOut, FileText, Plus, Building2, CheckCircle2, Clock, XCircle,
  Phone, Mail, MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import logoImg from "@/assets/logo.png";

interface DashboardStats {
  totalSales: number;
  totalCommission: number;
  commissionRate: number;
  totalSosCases: number;
  pendingCases: number;
  approvedCases: number;
  settledCases: number;
  isVerified: boolean;
}

interface ShowroomProfile {
  id: string;
  name: string;
  ownerName: string;
  vehicleTypes: string;
  city: string;
  state: string;
}

interface VehicleSosCase {
  id: string;
  caseNumber: string;
  vehicleType: string;
  vehicleNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  accidentDate: string;
  accidentLocation: string;
  hospitalName: string;
  estimatedAmount: number;
  approvedAmount: number | null;
  settledAmount: number | null;
  status: string;
  createdAt: string;
  memberName: string;
  memberMobile: string;
}

interface Member {
  id: string;
  name: string;
  mobile: string;
  email: string;
  createdAt: string;
  membership: {
    id: string;
    status: string;
    startDate: string;
    expiryDate: string;
    planType: string;
    coverageAmount: number;
  };
}

export default function ShowroomDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profile, setProfile] = useState<ShowroomProfile | null>(null);
  const [sosCases, setSosCases] = useState<VehicleSosCase[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [profileRes, statsRes, casesRes, membersRes] = await Promise.all([
        api.showroom.getProfile(),
        api.showroom.getDashboardStats(),
        api.showroom.getVehicleSosCases(),
        api.showroom.getMembers(),
      ]);
      setProfile(profileRes.showroom);
      setStats(statsRes);
      setSosCases(casesRes.cases || []);
      setMembers(membersRes.members || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load dashboard data",
        variant: "destructive",
      });
      if (error?.message?.includes("Unauthorized")) {
        setLocation("/showroom/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetchWithCsrf("/api/auth/logout", { method: "POST" });
    } catch {}
    clearAuthToken();
    window.location.href = "/showroom/login";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "under_verification":
        return <Badge className="bg-blue-100 text-blue-800"><FileText className="h-3 w-3 mr-1" /> Under Verification</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case "settled":
        return <Badge className="bg-emerald-100 text-emerald-800"><IndianRupee className="h-3 w-3 mr-1" /> Settled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatVehicleTypes = (types: string) => {
    return types.split(",").map(t => t.trim().charAt(0).toUpperCase() + t.trim().slice(1)).join(", ");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Raksha Assist" className="h-10" />
            <div>
              <span className="text-lg font-semibold text-slate-800">Raksha Assist</span>
              <p className="text-xs text-slate-500">Showroom Partner Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {profile && (
              <div className="text-right hidden md:block">
                <p className="font-medium text-slate-800">{profile.name}</p>
                <p className="text-sm text-slate-500">{profile.city}, {profile.state}</p>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!stats?.isVerified && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Verification Pending</p>
              <p className="text-sm text-yellow-700">Your showroom is under verification. Some features may be limited.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-teal-500 to-emerald-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm">Total Memberships Sold</p>
                  <p className="text-3xl font-bold mt-1">{stats?.totalSales || 0}</p>
                </div>
                <Users className="h-10 w-10 text-teal-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-yellow-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Total Commission Earned</p>
                  <p className="text-3xl font-bold mt-1">₹{(stats?.totalCommission || 0).toLocaleString()}</p>
                </div>
                <IndianRupee className="h-10 w-10 text-amber-200" />
              </div>
              <p className="text-amber-100 text-xs mt-2">Commission Rate: {stats?.commissionRate || 10}%</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total SOS Cases Filed</p>
                  <p className="text-3xl font-bold mt-1">{stats?.totalSosCases || 0}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Cases Settled</p>
                  <p className="text-3xl font-bold mt-1">{stats?.settledCases || 0}</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-200" />
              </div>
              <div className="flex gap-2 mt-2 text-xs">
                <span className="bg-white/20 px-2 py-0.5 rounded">Pending: {stats?.pendingCases || 0}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded">Approved: {stats?.approvedCases || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-8">
          <Link href="/showroom/register-member">
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600">
              <Plus className="h-4 w-4 mr-2" />
              Register New Member
            </Button>
          </Link>
          <Link href="/showroom/file-sos">
            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
              <AlertTriangle className="h-4 w-4 mr-2" />
              File SOS Case
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="sos-cases" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              SOS Cases
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Showroom Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Registered Members</CardTitle>
                <CardDescription>Members registered through your showroom</CardDescription>
              </CardHeader>
              <CardContent>
                {members.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No members registered yet</p>
                    <Link href="/showroom/register-member">
                      <Button className="mt-4">Register First Member</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-slate-600">Member</th>
                          <th className="text-left py-3 px-4 font-medium text-slate-600">Contact</th>
                          <th className="text-left py-3 px-4 font-medium text-slate-600">Plan</th>
                          <th className="text-left py-3 px-4 font-medium text-slate-600">Support Limit</th>
                          <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member) => (
                          <tr key={member.id} className="border-b hover:bg-slate-50">
                            <td className="py-3 px-4">
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-slate-500">{new Date(member.createdAt).toLocaleDateString()}</p>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3" />
                                {member.mobile}
                              </div>
                              {member.email && (
                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                  <Mail className="h-3 w-3" />
                                  {member.email}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-medium">{member.membership.planType}</p>
                            </td>
                            <td className="py-3 px-4">
                              ₹{(member.membership.coverageAmount || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              {getStatusBadge(member.membership.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sos-cases">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle SOS Cases</CardTitle>
                <CardDescription>Accident cases filed for your members</CardDescription>
              </CardHeader>
              <CardContent>
                {sosCases.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No SOS cases filed yet</p>
                    <Link href="/showroom/file-sos">
                      <Button className="mt-4" variant="outline">File SOS Case</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sosCases.map((sosCase) => (
                      <div key={sosCase.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono text-sm bg-slate-100 px-2 py-0.5 rounded">{sosCase.caseNumber}</span>
                              {getStatusBadge(sosCase.status)}
                            </div>
                            <p className="font-medium">{sosCase.memberName}</p>
                            <p className="text-sm text-slate-500">{sosCase.memberMobile}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold">₹{(sosCase.estimatedAmount || 0).toLocaleString()}</p>
                            <p className="text-xs text-slate-500">Estimated Amount</p>
                            {sosCase.approvedAmount && (
                              <p className="text-sm text-green-600">Approved: ₹{sosCase.approvedAmount.toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">Vehicle</p>
                            <p className="font-medium">{sosCase.vehicleMake} {sosCase.vehicleModel}</p>
                            <p className="text-slate-500">{sosCase.vehicleNumber}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Vehicle Type</p>
                            <p className="font-medium capitalize">{sosCase.vehicleType}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Hospital</p>
                            <p className="font-medium">{sosCase.hospitalName}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Accident Date</p>
                            <p className="font-medium">{new Date(sosCase.accidentDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Showroom Profile</CardTitle>
                <CardDescription>Your showroom details and verification status</CardDescription>
              </CardHeader>
              <CardContent>
                {profile && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-500">Showroom Name</p>
                        <p className="font-medium text-lg">{profile.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Owner Name</p>
                        <p className="font-medium">{profile.ownerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Vehicle Types</p>
                        <p className="font-medium">{formatVehicleTypes(profile.vehicleTypes)}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-500">Location</p>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <p className="font-medium">{profile.city}, {profile.state}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Verification Status</p>
                        {stats?.isVerified ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" /> Pending Verification
                          </Badge>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Commission Rate</p>
                        <p className="font-medium text-teal-600">{stats?.commissionRate || 10}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
