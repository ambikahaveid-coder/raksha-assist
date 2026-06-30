import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { fetchWithCsrf } from "@/lib/csrf";
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText, 
  Search, 
  Filter,
  ShieldAlert,
  Users,
  Activity,
  User,
  Phone,
  Mail,
  CreditCard,
  Eye,
  CheckCircle2,
  Loader2,
  XCircle,
  Gift,
  Plus
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EmployeeDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("members");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addOnDialogOpen, setAddOnDialogOpen] = useState(false);
  const [selectedAddOnId, setSelectedAddOnId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { user, isLoading: userLoading } = useAuth();

  const isAuthorized = !!user && ["employee", "support", "admin", "super_admin"].includes(user.role);

  const { data: membersResponse, isLoading: membersLoading } = useQuery({
    queryKey: ["support", "members", searchQuery],
    queryFn: async () => {
      const url = searchQuery
        ? `/api/support/members?search=${encodeURIComponent(searchQuery)}`
        : "/api/support/members";
      const res = await fetchWithCsrf(url);
      if (!res.ok) return { data: [], total: 0 };
      return res.json();
    },
    enabled: isAuthorized
  });
  const members = membersResponse?.data || [];

  const { data: pendingVerifications = [] } = useQuery({
    queryKey: ["support", "pending-verifications"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/support/pending-verifications");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthorized
  });

  const { data: sosCases = [] } = useQuery({
    queryKey: ["support", "sos-cases"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/support/sos-cases");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthorized
  });

  const { data: memberDetails } = useQuery({
    queryKey: ["support", "member", selectedMember?.id],
    queryFn: async () => {
      const res = await fetchWithCsrf(`/api/support/member/${selectedMember.id}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!selectedMember?.id && isAuthorized
  });

  const { data: addOnBenefits = [] } = useQuery({
    queryKey: ["admin", "add-on-benefits"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/add-on-benefits");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthorized
  });

  const { data: memberAddOns = [] } = useQuery({
    queryKey: ["member", "add-ons", selectedMember?.membershipId],
    queryFn: async () => {
      const res = await fetchWithCsrf(`/api/admin/memberships/${selectedMember.membershipId}/add-ons`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedMember?.membershipId && isAuthorized
  });

  const assignAddOnMutation = useMutation({
    mutationFn: async ({ membershipId, addOnId }: { membershipId: string; addOnId: string }) => {
      const res = await fetchWithCsrf(`/api/admin/memberships/${membershipId}/add-ons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addOnId })
      });
      if (!res.ok) throw new Error("Failed to assign add-on");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member", "add-ons", selectedMember?.membershipId] });
      setAddOnDialogOpen(false);
      setSelectedAddOnId("");
      toast({ title: "Success", description: "Add-on benefit assigned successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to assign add-on benefit", variant: "destructive" });
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetchWithCsrf(`/api/support/member/${userId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error("Failed to verify");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Member verified successfully" });
      queryClient.invalidateQueries({ queryKey: ["support"] });
      setDetailsOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to verify member", variant: "destructive" });
    }
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

  const viewMemberDetails = (member: any) => {
    setSelectedMember(member);
    setDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                  {user?.role === "support" ? "Support Staff" : "Operations Staff"}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                {user?.role === "support" ? "Support Dashboard" : "Employee Dashboard"}
              </h1>
              <p className="text-muted-foreground">Welcome, {user?.name || "Staff Member"}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-white rounded-lg border shadow-sm flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium">Online</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Members</p>
                <h3 className="text-3xl font-bold text-slate-900">{membersResponse?.total || 0}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Verifications</p>
                <h3 className="text-3xl font-bold text-orange-600">{pendingVerifications.length}</h3>
              </div>
              <div className="h-12 w-12 bg-orange-50 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active SOS Cases</p>
                <h3 className="text-3xl font-bold text-red-600">
                  {sosCases.filter((c: any) => !["closed", "spam"].includes(c.status)).length}
                </h3>
              </div>
              <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center">
                <ShieldAlert className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Verified Today</p>
                <h3 className="text-3xl font-bold text-green-600">
                  {members.filter((m: any) => m.verifiedAt && new Date(m.verifiedAt).toDateString() === new Date().toDateString()).length}
                </h3>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex mb-6">
              <TabsTrigger value="members" className="gap-2">
                <Users className="h-4 w-4" /> Members
              </TabsTrigger>
              <TabsTrigger value="verifications" className="gap-2">
                <FileText className="h-4 w-4" /> Verifications
                {pendingVerifications.length > 0 && (
                  <Badge className="ml-1 bg-orange-500">{pendingVerifications.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sos" className="gap-2">
                <ShieldAlert className="h-4 w-4" /> SOS Cases
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle className="text-lg">Member Directory</CardTitle>
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="Search by name, mobile, membership..." 
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {membersLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : members.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No members found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {members.slice(0, 20).map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{member.name}</p>
                              <p className="text-sm text-slate-500">{member.mobile} {member.membershipNumber && `• ${member.membershipNumber}`}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant="outline" 
                              className={
                                member.membershipStatus === "active" 
                                  ? "text-green-600 border-green-200 bg-green-50" 
                                  : member.membershipStatus === "pending_payment"
                                  ? "text-orange-600 border-orange-200 bg-orange-50"
                                  : "text-slate-600 border-slate-200 bg-slate-50"
                              }
                            >
                              {member.membershipStatus === "active" ? "Active" : 
                               member.membershipStatus === "pending_payment" ? "Pending Payment" : 
                               member.membershipStatus === "no_membership" ? "No Membership" : member.membershipStatus}
                            </Badge>
                            {member.verifiedAt ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : member.membershipStatus === "active" ? (
                              <AlertCircle className="h-5 w-5 text-orange-500" />
                            ) : null}
                            <Button size="sm" variant="outline" onClick={() => viewMemberDetails(member)}>
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="verifications">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Pending Verifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingVerifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                      <p>All members are verified!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingVerifications.map((item: any) => (
                        <div key={item.membershipId} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <Clock className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{item.userName}</p>
                              <p className="text-sm text-slate-500">{item.userMobile} • {item.membershipNumber}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-teal-600 border-teal-200 bg-teal-50">
                              {item.planType}
                            </Badge>
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setSelectedMember({ id: item.userId, name: item.userName });
                                setDetailsOpen(true);
                              }}
                            >
                              Verify Now
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sos">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">SOS Emergency Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  {sosCases.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShieldAlert className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                      <p>No SOS cases at the moment</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sosCases.map((sosCase: any) => (
                        <div key={sosCase.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              sosCase.status === "triggered" ? "bg-red-100" :
                              sosCase.status === "acknowledged" ? "bg-orange-100" :
                              sosCase.status === "in_progress" ? "bg-blue-100" :
                              sosCase.status === "closed" ? "bg-green-100" : "bg-slate-100"
                            }`}>
                              <ShieldAlert className={`h-5 w-5 ${
                                sosCase.status === "triggered" ? "text-red-600" :
                                sosCase.status === "acknowledged" ? "text-orange-600" :
                                sosCase.status === "in_progress" ? "text-blue-600" :
                                sosCase.status === "closed" ? "text-green-600" : "text-slate-600"
                              }`} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{sosCase.caseNumber}</p>
                              <p className="text-sm text-slate-500">{sosCase.userName} • {sosCase.userMobile}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant="outline" 
                              className={
                                sosCase.status === "triggered" ? "text-red-600 border-red-200 bg-red-50" :
                                sosCase.status === "acknowledged" ? "text-orange-600 border-orange-200 bg-orange-50" :
                                sosCase.status === "in_progress" ? "text-blue-600 border-blue-200 bg-blue-50" :
                                sosCase.status === "closed" ? "text-green-600 border-green-200 bg-green-50" :
                                "text-slate-600 border-slate-200 bg-slate-50"
                              }
                            >
                              {sosCase.status.replace("_", " ").toUpperCase()}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {new Date(sosCase.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription>
              View and verify member information
            </DialogDescription>
          </DialogHeader>
          
          {memberDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Name</label>
                  <p className="font-medium">{memberDetails.user.name || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Mobile</label>
                  <p className="font-medium">{memberDetails.user.mobile}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">{memberDetails.user.email || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Aadhar</label>
                  <p className="font-medium">{memberDetails.user.aadhar || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Blood Group</label>
                  <p className="font-medium">{memberDetails.user.bloodGroup || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Date of Birth</label>
                  <p className="font-medium">{memberDetails.user.dateOfBirth || "Not provided"}</p>
                </div>
              </div>

              {memberDetails.membership && (
                <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <h4 className="font-semibold text-teal-900 mb-2">Membership Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-teal-700">Number:</span> {memberDetails.membership.membershipNumber}
                    </div>
                    <div>
                      <span className="text-teal-700">Plan:</span> {memberDetails.membership.planType}
                    </div>
                    <div>
                      <span className="text-teal-700">Status:</span> {memberDetails.membership.status}
                    </div>
                    <div>
                      <span className="text-teal-700">Verified:</span> {memberDetails.membership.verifiedAt ? "Yes" : "No"}
                    </div>
                  </div>
                </div>
              )}

              {memberDetails.familyMembers?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Family Members ({memberDetails.familyMembers.length})</h4>
                  <div className="space-y-2">
                    {memberDetails.familyMembers.map((fm: any, i: number) => (
                      <div key={i} className="p-2 bg-slate-50 rounded text-sm">
                        {fm.name} • {fm.relation} • {fm.dateOfBirth}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {memberDetails.membership && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      Add-On Benefits
                    </h4>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setAddOnDialogOpen(true)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Assign
                    </Button>
                  </div>
                  {memberAddOns.length > 0 ? (
                    <div className="space-y-2">
                      {memberAddOns.map((addon: any) => (
                        <div key={addon.id} className="flex items-center justify-between p-2 bg-white rounded text-sm">
                          <div>
                            <span className="font-medium">{addon.benefit?.name || "Benefit"}</span>
                            <span className="text-muted-foreground ml-2">{addon.benefit?.benefitCode === 'THIRD_PARTY_ACCIDENT' ? `${addon.benefit?.benefitAmount}% of fee` : `₹${addon.benefit?.benefitAmount?.toLocaleString()}`}</span>
                          </div>
                          <Badge variant={addon.isExhausted ? "secondary" : "outline"} className="text-xs">
                            {addon.usageCount}/{addon.usageLimit} used
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-purple-700">No add-on benefits assigned</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
            {memberDetails?.membership && !memberDetails.membership.verifiedAt && (
              <Button 
                onClick={() => selectedMember && verifyMutation.mutate(selectedMember.id)}
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Verify Member
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add-On Assignment Dialog */}
      <Dialog open={addOnDialogOpen} onOpenChange={setAddOnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Assign Add-On Benefit
            </DialogTitle>
            <DialogDescription>
              Assign an add-on benefit to this member's coverage
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Add-On Benefit</label>
              <Select value={selectedAddOnId} onValueChange={setSelectedAddOnId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an add-on benefit" />
                </SelectTrigger>
                <SelectContent>
                  {addOnBenefits.filter((a: any) => a.isActive).map((addon: any) => (
                    <SelectItem key={addon.id} value={addon.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{addon.name}</span>
                        <span className="text-muted-foreground ml-2">₹{addon.price}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedAddOnId && (
              <div className="p-3 bg-slate-50 rounded-lg">
                {(() => {
                  const selected = addOnBenefits.find((a: any) => a.id === selectedAddOnId);
                  return selected ? (
                    <div className="space-y-1 text-sm">
                      <p><strong>{selected.name}</strong></p>
                      <p className="text-muted-foreground">{selected.description}</p>
                      <div className="flex gap-4 mt-2">
                        <span>Coverage: {selected.benefitCode === 'THIRD_PARTY_ACCIDENT' ? `${selected.benefitAmount}% of membership fee` : `₹${selected.benefitAmount?.toLocaleString()}`}</span>
                        <span>Validity: {selected.validityDays} days</span>
                        <span>Usage Limit: {selected.usageLimit}</span>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOnDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedMember?.membershipId && selectedAddOnId) {
                  assignAddOnMutation.mutate({ 
                    membershipId: selectedMember.membershipId, 
                    addOnId: selectedAddOnId 
                  });
                }
              }}
              disabled={!selectedAddOnId || assignAddOnMutation.isPending}
            >
              {assignAddOnMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Assign Add-On
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
