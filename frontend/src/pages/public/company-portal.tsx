import { useState } from "react";
import { fetchWithCsrf } from "@/lib/csrf";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  Building2,
  Users,
  Shield,
  FileText,
  Phone,
  Mail,
  Loader2,
  LogOut,
  AlertCircle,
  CheckCircle,
  IndianRupee,
  Calendar,
  User,
  Lock,
  Plus,
  Upload,
  Home,
  Trash2,
  Edit,
  Bike,
  TrendingUp,
  Clock,
  MapPin
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";

interface CorporateEmployee {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
  employeeCode?: string;
  department?: string;
  designation?: string;
  coverageStatus: string;
  isActive: boolean;
  createdAt: string;
}

export default function CompanyPortal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    mobile: "",
    employeeCode: "",
    department: "",
    designation: ""
  });

  const { data: company, refetch: refetchCompany, isLoading: companyLoading } = useQuery({
    queryKey: ["company", "me"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/company/me");
      if (!res.ok) {
        setIsLoggedIn(false);
        throw new Error("Not authenticated");
      }
      setIsLoggedIn(true);
      return res.json();
    },
    retry: false
  });

  const { data: employees = [], refetch: refetchEmployees } = useQuery<CorporateEmployee[]>({
    queryKey: ["company", "employees"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/company/employees");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isLoggedIn
  });

  const addEmployeeMutation = useMutation({
    mutationFn: async (data: typeof newEmployee) => {
      const res = await fetchWithCsrf("/api/company/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add employee");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Employee added successfully" });
      setShowAddEmployee(false);
      setNewEmployee({ name: "", email: "", mobile: "", employeeCode: "", department: "", designation: "" });
      refetchEmployees();
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    }
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithCsrf(`/api/company/employees/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Employee removed" });
      refetchEmployees();
    }
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetchWithCsrf("/api/company/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (res.ok) {
        setIsLoggedIn(true);
        refetchCompany();
        refetchEmployees();
        toast({ title: "Login successful" });
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetchWithCsrf("/api/company/logout", { method: "POST" });
      setIsLoggedIn(false);
      queryClient.invalidateQueries({ queryKey: ["company"] });
      toast({ title: "Logged out successfully" });
    } catch {
      toast({ title: "Logout failed", variant: "destructive" });
    }
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name.trim()) {
      toast({ title: "Employee name is required", variant: "destructive" });
      return;
    }
    addEmployeeMutation.mutate(newEmployee);
  };

  if (companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-none">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Corporate Portal</CardTitle>
            <CardDescription>Login to manage your company's employee protection</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="hr@company.com"
                    value={loginData.email}
                    onChange={e => setLoginData({...loginData, email: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={loginData.password}
                    onChange={e => setLoginData({...loginData, password: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Login
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" /> Back to Home
                </Button>
              </Link>
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800 text-center">
                <strong>Note:</strong> This is a membership-based assistance program, NOT an insurance product.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    totalEmployees: employees.length,
    coveredEmployees: employees.filter(e => e.coverageStatus === "active").length,
    pendingEmployees: employees.filter(e => e.coverageStatus === "pending").length,
    activeMembers: employees.filter(e => e.isActive).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">{company?.name || "Corporate Portal"}</h1>
              <p className="text-sm text-muted-foreground">HR Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {company?.status === "approved" ? "Approved" : company?.status}
            </Badge>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 mr-2" /> Home
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-destructive/5 border border-destructive/20 p-6 rounded-2xl mb-8">
              <h3 className="font-bold text-destructive mb-2 uppercase tracking-wide text-xs text-center">Legal Disclaimer & Jurisdiction</h3>
              <p className="text-[10px] text-muted-foreground mb-1 leading-relaxed text-center">
                Raksha Assist is a membership-based assistance program and NOT an insurance product. All assistance is discretionary and subject to strict verification and fund availability.
              </p>
              <p className="text-[10px] font-bold text-primary text-center">
                Exclusive Jurisdiction: Courts of Bengaluru, Karnataka, India.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-50 border-none">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700">{stats.totalEmployees}</p>
                  <p className="text-sm text-blue-600">Total Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-none">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">{stats.coveredEmployees}</p>
                  <p className="text-sm text-green-600">Covered</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-none">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-700">{stats.pendingEmployees}</p>
                  <p className="text-sm text-yellow-600">Pending Activation</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-none">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700">{stats.activeMembers}</p>
                  <p className="text-sm text-purple-600">Active Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="company">Company Details</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Employee Management</CardTitle>
                  <CardDescription>Add and manage employee protection</CardDescription>
                </div>
                <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" /> Add Employee
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Employee</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddEmployee} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Full Name *</Label>
                          <Input
                            value={newEmployee.name}
                            onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Employee Code</Label>
                          <Input
                            value={newEmployee.employeeCode}
                            onChange={e => setNewEmployee({...newEmployee, employeeCode: e.target.value})}
                            placeholder="EMP001"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={newEmployee.email}
                            onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                            placeholder="john@company.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Mobile</Label>
                          <Input
                            value={newEmployee.mobile}
                            onChange={e => setNewEmployee({...newEmployee, mobile: e.target.value})}
                            placeholder="+91 9876543210"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Department</Label>
                          <Input
                            value={newEmployee.department}
                            onChange={e => setNewEmployee({...newEmployee, department: e.target.value})}
                            placeholder="Engineering"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Designation</Label>
                          <Input
                            value={newEmployee.designation}
                            onChange={e => setNewEmployee({...newEmployee, designation: e.target.value})}
                            placeholder="Software Engineer"
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={addEmployeeMutation.isPending}>
                        {addEmployeeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Add Employee
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {employees.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No employees added yet</p>
                    <p className="text-sm">Add employees to provide them protection</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {employees.map((employee) => (
                      <div key={employee.id} className="flex items-center justify-between p-4 rounded-xl border bg-white hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold">{employee.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {employee.employeeCode && <span>{employee.employeeCode}</span>}
                              {employee.department && <span>| {employee.department}</span>}
                              {employee.designation && <span>| {employee.designation}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={employee.coverageStatus === "active" ? "default" : "secondary"}>
                            {employee.coverageStatus}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (confirm("Remove this employee?")) {
                                deleteEmployeeMutation.mutate(employee.id);
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Your registered company details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Company Name</Label>
                      <p className="font-medium">{company?.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Registered Name</Label>
                      <p className="font-medium">{company?.registeredName || company?.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Industry</Label>
                      <p className="font-medium">{company?.industry || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">GST Number</Label>
                      <p className="font-medium">{company?.gstNumber || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">PAN Number</Label>
                      <p className="font-medium">{company?.panNumber || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Address</Label>
                      <p className="font-medium">{company?.address || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Location</Label>
                      <p className="font-medium">
                        {company?.city ? `${company.city}, ${company.state} - ${company.pincode}` : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">HR Contact</Label>
                      <p className="font-medium">{company?.hrContactName || "Not assigned"}</p>
                      {company?.hrContactEmail && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <Mail className="h-3 w-3" /> {company.hrContactEmail}
                        </p>
                      )}
                      {company?.hrContactPhone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="h-3 w-3" /> {company.hrContactPhone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Billing & Payment</CardTitle>
                <CardDescription>Your billing information and payment history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <Label className="text-blue-600">Billing Cycle</Label>
                    <p className="font-bold text-lg capitalize">{company?.billingCycle || "Monthly"}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl">
                    <Label className="text-green-600">Contract Period</Label>
                    <p className="font-bold text-lg">
                      {company?.contractStartDate ? new Date(company.contractStartDate).toLocaleDateString() : "N/A"} - {company?.contractEndDate ? new Date(company.contractEndDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="text-center py-8 text-muted-foreground border-t">
                  <IndianRupee className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Payment history coming soon</p>
                  <p className="text-sm">For billing inquiries, contact support</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
