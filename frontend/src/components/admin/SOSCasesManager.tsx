import { useState, useEffect, useRef } from "react";
import { fetchWithCsrf } from "@/lib/csrf";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, Search, Eye, UserCheck, IndianRupee, 
  Clock, CheckCircle, XCircle, MapPin, Phone, MessageSquare,
  Ban, FileText, Bell, Volume2, VolumeX, RefreshCw, User
} from "lucide-react";

interface SOSCase {
  id: string;
  caseNumber: string;
  userId: string;
  membershipId?: string;
  userName?: string;
  userMobile?: string;
  emergencyType: string;
  description: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  hospitalName?: string;
  patientName?: string;
  patientRelation?: string;
  status: string;
  priority: string;
  assignedTo?: string;
  assignedToName?: string;
  sanctionAmount?: number;
  sanctionedAmount?: number;
  sanctionStatus?: string;
  sanctionNotes?: string;
  isSpam?: boolean;
  createdAt: string;
  updatedAt?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  sanctioned: "bg-green-100 text-green-800",
  completed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  spam: "bg-gray-100 text-gray-800"
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700"
};

export function SOSCasesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCase, setSelectedCase] = useState<SOSCase | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [sanctionAmount, setSanctionAmount] = useState("");
  const [sanctionNotes, setSanctionNotes] = useState("");
  const [note, setNote] = useState("");
  const [assignUserId, setAssignUserId] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastCaseCountRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: sosCases = [], isLoading, refetch } = useQuery<SOSCase[]>({
    queryKey: ["admin-sos-cases"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/sos-cases", { });
      if (!res.ok) throw new Error("Failed to fetch SOS cases");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const { data: staffUsers = [] } = useQuery<any[]>({
    queryKey: ["staff-users-for-assign"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/users", { });
      if (!res.ok) return [];
      const data = await res.json();
      return (Array.isArray(data) ? data : data.users || []).filter((u: any) => 
        ["admin", "super_admin", "employee", "support"].includes(u.role)
      );
    },
  });

  useEffect(() => {
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleOX/QYiYl3N0maOqoXVhUWBwkpubjoZxXVVfcYiVlZGGd2ZbY3GEkpWTioJzZGNqfIqVl5OShnlwb3WBi5OWl5aMgnp1d32GjpOWl5aNhX55eX2DipCTlZeWkIiBfXx+g4iNkJOWl5SSioN/fH2AhIiLj5KVl5eVjogB");
  }, []);

  useEffect(() => {
    const pendingCount = sosCases.filter(c => c.status === "pending").length;
    
    if (lastCaseCountRef.current !== null && pendingCount > lastCaseCountRef.current && soundEnabled) {
      const newCases = pendingCount - lastCaseCountRef.current;
      audioRef.current?.play().catch(() => {});
      toast({
        title: "🚨 New SOS Alert!",
        description: `${newCases} new emergency case(s) require attention!`,
        variant: "destructive",
      });
    }
    
    lastCaseCountRef.current = pendingCount;
  }, [sosCases, soundEnabled, toast]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetchWithCsrf(`/api/admin/sos-cases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sos-cases"] });
      toast({ title: "Case updated successfully" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });

  const assignMutation = useMutation({
    mutationFn: async ({ id, assignTo }: { id: string; assignTo: string }) => {
      const res = await fetchWithCsrf(`/api/admin/sos-cases/${id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ assignTo })
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sos-cases"] });
      toast({ title: "Case assigned successfully" });
      setAssignUserId("");
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });

  const sanctionMutation = useMutation({
    mutationFn: async ({ id, amount, notes }: { id: string; amount: number; notes?: string }) => {
      const res = await fetchWithCsrf(`/api/admin/sos-cases/${id}/sanction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sanctionAmount: amount, sanctionStatus: "approved", sanctionNotes: notes })
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sos-cases"] });
      toast({ title: "Amount sanctioned successfully" });
      setSanctionAmount("");
      setSanctionNotes("");
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });

  const markSpamMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithCsrf(`/api/admin/sos-cases/${id}/mark-spam`, {
        method: "POST",
        credentials: "include"
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-sos-cases"] });
      const msg = data.userBlocked 
        ? `Case marked as spam. User has been BLOCKED (${data.spamCount} strikes).` 
        : `Case marked as spam (Strike ${data.spamCount}/3).`;
      toast({ title: msg });
      setIsDetailsOpen(false);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const res = await fetchWithCsrf(`/api/admin/sos-cases/${id}/add-note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ note })
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sos-cases"] });
      toast({ title: "Note added successfully" });
      setNote("");
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });

  const filteredCases = sosCases.filter(c => {
    const matchesSearch = c.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.userMobile?.includes(searchQuery) ||
                         c.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.emergencyType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openDetails = (sosCase: SOSCase) => {
    setSelectedCase(sosCase);
    setIsDetailsOpen(true);
    setSanctionAmount("");
    setSanctionNotes("");
    setNote("");
    setAssignUserId("");
  };

  const getAmount = (c: SOSCase) => c.sanctionedAmount || c.sanctionAmount || 0;

  const stats = {
    total: sosCases.length,
    pending: sosCases.filter(c => c.status === "pending").length,
    inProgress: sosCases.filter(c => ["assigned", "in_progress"].includes(c.status)).length,
    completed: sosCases.filter(c => c.status === "completed").length,
    totalSanctioned: sosCases.reduce((sum, c) => sum + getAmount(c), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            {stats.pending > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping" />
            )}
          </div>
          <h2 className="text-xl font-bold">SOS Emergency Cases</h2>
          {stats.pending > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              🚨 {stats.pending} PENDING
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={soundEnabled ? "text-green-600" : "text-gray-400"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {soundEnabled ? "Sound ON" : "Sound OFF"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
      
      {stats.pending > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 animate-pulse">
          <Bell className="h-6 w-6 text-red-500" />
          <div>
            <p className="font-semibold text-red-700">Active Emergency Alerts</p>
            <p className="text-red-600 text-sm">{stats.pending} case(s) require immediate attention!</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Cases</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">₹{stats.totalSanctioned.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Total Sanctioned</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search by name, mobile, case #, type..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="sanctioned">Sanctioned</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-24" /></Card>)}</div>
      ) : (
        <div className="space-y-3">
          {filteredCases.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No SOS cases found</CardContent></Card>
          ) : (
            filteredCases.map(sosCase => (
              <Card key={sosCase.id} className={`hover:shadow-md transition-shadow cursor-pointer ${sosCase.status === "pending" ? "border-red-200 bg-red-50/30" : ""}`} onClick={() => openDetails(sosCase)}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${sosCase.status === "pending" ? "bg-red-100 animate-pulse" : "bg-red-100"}`}>
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{sosCase.userName || "Unknown"}</span>
                          <span className="text-xs text-muted-foreground">#{sosCase.caseNumber}</span>
                          <Badge className={priorityColors[sosCase.priority] || priorityColors.medium}>{sosCase.priority}</Badge>
                          <Badge className={statusColors[sosCase.status] || statusColors.pending}>{sosCase.status.replace("_", " ")}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {sosCase.userMobile || "N/A"}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(sosCase.createdAt).toLocaleString()}</span>
                          <span className="font-medium text-primary">{sosCase.emergencyType}</span>
                          {sosCase.assignedToName && (
                            <span className="flex items-center gap-1 text-blue-600"><UserCheck className="h-3 w-3" /> {sosCase.assignedToName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getAmount(sosCase) > 0 && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">₹{getAmount(sosCase).toLocaleString()}</div>
                          <p className="text-xs text-muted-foreground">Sanctioned</p>
                        </div>
                      )}
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              SOS Case #{selectedCase?.caseNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedCase && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Member</Label>
                  <p className="font-medium">{selectedCase.userName || "Unknown"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Mobile</Label>
                  <p className="font-medium">{selectedCase.userMobile || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Emergency Type</Label>
                  <p className="font-medium">{selectedCase.emergencyType}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Priority</Label>
                  <Badge className={priorityColors[selectedCase.priority]}>{selectedCase.priority}</Badge>
                </div>
                {selectedCase.patientName && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Patient Name</Label>
                    <p className="font-medium">{selectedCase.patientName}</p>
                  </div>
                )}
                {selectedCase.patientRelation && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Relation to Member</Label>
                    <p className="font-medium">{selectedCase.patientRelation}</p>
                  </div>
                )}
                {selectedCase.hospitalName && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Hospital</Label>
                    <p className="font-medium">{selectedCase.hospitalName}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Status</Label>
                  <Select 
                    value={selectedCase.status} 
                    onValueChange={(v) => {
                      updateMutation.mutate({ id: selectedCase.id, data: { status: v } });
                      setSelectedCase({ ...selectedCase, status: v });
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="sanctioned">Sanctioned</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Created</Label>
                  <p className="font-medium">{new Date(selectedCase.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedCase.description && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="p-3 bg-gray-50 rounded-lg">{selectedCase.description}</p>
                </div>
              )}

              {selectedCase.location && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {selectedCase.location}</p>
                  {selectedCase.latitude && selectedCase.longitude && (
                    <a 
                      href={`https://maps.google.com/?q=${selectedCase.latitude},${selectedCase.longitude}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Open in Google Maps
                    </a>
                  )}
                </div>
              )}

              {getAmount(selectedCase) > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Label className="text-green-700">Sanctioned Amount</Label>
                  <p className="text-xl font-bold text-green-700">₹{getAmount(selectedCase).toLocaleString()}</p>
                  {selectedCase.sanctionNotes && (
                    <p className="text-sm text-green-600 mt-1">{selectedCase.sanctionNotes}</p>
                  )}
                </div>
              )}

              <div className="border-t pt-4 space-y-4">
                <div>
                  <Label className="flex items-center gap-1 mb-2"><UserCheck className="h-4 w-4" /> Assign To Staff</Label>
                  <div className="flex gap-2">
                    <Select value={assignUserId} onValueChange={setAssignUserId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select staff member..." />
                      </SelectTrigger>
                      <SelectContent>
                        {staffUsers.map((u: any) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name || u.email} ({u.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={() => assignMutation.mutate({ id: selectedCase.id, assignTo: assignUserId })}
                      disabled={!assignUserId || assignMutation.isPending}
                    >
                      <UserCheck className="h-4 w-4 mr-1" /> Assign
                    </Button>
                  </div>
                  {selectedCase.assignedToName && (
                    <p className="text-sm text-blue-600 mt-1">Currently assigned to: {selectedCase.assignedToName}</p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-1 mb-2"><IndianRupee className="h-4 w-4" /> Sanction Amount (₹)</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="Enter amount in rupees" 
                      value={sanctionAmount}
                      onChange={(e) => setSanctionAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => sanctionMutation.mutate({ 
                        id: selectedCase.id, 
                        amount: Number(sanctionAmount),
                        notes: sanctionNotes || undefined
                      })}
                      disabled={!sanctionAmount || sanctionMutation.isPending}
                    >
                      <IndianRupee className="h-4 w-4 mr-1" /> Sanction
                    </Button>
                  </div>
                  <Textarea 
                    placeholder="Sanction notes (optional)..." 
                    value={sanctionNotes}
                    onChange={(e) => setSanctionNotes(e.target.value)}
                    className="mt-2"
                    rows={2}
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-1 mb-2"><MessageSquare className="h-4 w-4" /> Add Note</Label>
                  <Textarea 
                    placeholder="Add a note to this case..." 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                  />
                  <Button 
                    className="mt-2"
                    variant="outline"
                    onClick={() => addNoteMutation.mutate({ id: selectedCase.id, note })}
                    disabled={!note || addNoteMutation.isPending}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" /> Add Note
                  </Button>
                </div>
              </div>

              <div className="flex justify-between border-t pt-4">
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    if (confirm("Are you sure you want to mark this as spam? This will count as a strike against the user.")) {
                      markSpamMutation.mutate(selectedCase.id);
                    }
                  }}
                  disabled={markSpamMutation.isPending || selectedCase.isSpam}
                >
                  <Ban className="h-4 w-4 mr-1" /> {selectedCase.isSpam ? "Already Spam" : "Mark as Spam"}
                </Button>
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
