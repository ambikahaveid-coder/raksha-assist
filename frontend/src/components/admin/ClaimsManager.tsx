import { useState } from "react";
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
  ClipboardList, Search, Eye, IndianRupee, Clock, CheckCircle, 
  XCircle, FileText, Building2, User, Calendar
} from "lucide-react";

interface AssistanceRequest {
  id: string;
  membershipId?: string;
  userId: string;
  userName?: string;
  userMobile?: string;
  emergencyType: string;
  requestType?: string;
  amount?: number;
  sanctionedAmount?: number;
  hospitalName?: string;
  hospitalId?: string;
  description: string;
  status: string;
  approvedAmount?: number;
  rejectionReason?: string;
  documents?: string[];
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  sanctioned: "bg-blue-100 text-blue-800",
  under_review: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  completed: "bg-emerald-100 text-emerald-800",
  partially_approved: "bg-amber-100 text-amber-800",
  rejected: "bg-red-100 text-red-800",
  paid: "bg-emerald-100 text-emerald-800"
};

export function AssistanceRequestsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<AssistanceRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: requests = [], isLoading } = useQuery<AssistanceRequest[]>({
    queryKey: ["admin-assistance-requests"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/sos-cases", { });
      if (!res.ok) throw new Error("Failed to fetch assistance requests");
      const data = await res.json();
      return data.filter((c: any) => c.sanctionedAmount > 0 || c.status === "sanctioned" || c.status === "completed" || c.status === "approved");
    }
  });

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
      queryClient.invalidateQueries({ queryKey: ["admin-assistance-requests"] });
      toast({ title: "Request updated successfully" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });

  const filteredRequests = requests.filter(c => {
    const matchesSearch = c.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.userMobile?.includes(searchQuery) ||
                         c.hospitalName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openDetails = (request: AssistanceRequest) => {
    setSelectedRequest(request);
    setApprovedAmount(request.approvedAmount?.toString() || request.sanctionedAmount?.toString() || "");
    setIsDetailsOpen(true);
  };

  const handleApprove = () => {
    if (selectedRequest) {
      updateMutation.mutate({
        id: selectedRequest.id,
        data: { status: "approved", approvedAmount: Number(approvedAmount) }
      });
      setIsDetailsOpen(false);
    }
  };

  const handleReject = () => {
    if (selectedRequest && rejectionReason) {
      updateMutation.mutate({
        id: selectedRequest.id,
        data: { status: "rejected", rejectionReason }
      });
      setIsDetailsOpen(false);
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(c => c.status === "pending" || c.status === "sanctioned").length,
    approved: requests.filter(c => c.status === "approved" || c.status === "completed").length,
    rejected: requests.filter(c => c.status === "rejected").length,
    totalAmount: requests.reduce((sum, c) => sum + (c.sanctionedAmount || c.amount || 0), 0),
    approvedAmount: requests.filter(c => c.status === "approved" || c.status === "completed")
                          .reduce((sum, c) => sum + (c.approvedAmount || c.sanctionedAmount || 0), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Assistance Requests</h2>
          <Badge variant="secondary">{stats.pending} pending review</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">₹{stats.totalAmount.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Total Requested</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-600">₹{stats.approvedAmount.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Total Approved</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search by name, mobile, hospital..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="sanctioned">Sanctioned</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-24" /></Card>)}</div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No assistance requests found</CardContent></Card>
          ) : (
            filteredRequests.map(request => (
              <Card key={request.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetails(request)}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-blue-100">
                        <ClipboardList className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{request.userName || "Unknown"}</span>
                          <Badge className={statusColors[request.status] || statusColors.pending}>{request.status.replace("_", " ")}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" /> {request.userMobile || "N/A"}</span>
                          {request.hospitalName && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {request.hospitalName}</span>}
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold">₹{(request.sanctionedAmount || request.amount || 0).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{request.emergencyType || "Emergency"}</p>
                      </div>
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
              <ClipboardList className="h-5 w-5 text-primary" />
              Assistance Request Details
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Member</Label>
                  <p className="font-medium">{selectedRequest.userName || "Unknown"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Mobile</Label>
                  <p className="font-medium">{selectedRequest.userMobile || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Request Type</Label>
                  <p className="font-medium">{selectedRequest.emergencyType || selectedRequest.requestType || "Emergency"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-medium text-lg">₹{(selectedRequest.sanctionedAmount || selectedRequest.amount || 0).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Hospital</Label>
                  <p className="font-medium">{selectedRequest.hospitalName || "Not specified"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={statusColors[selectedRequest.status]}>{selectedRequest.status.replace("_", " ")}</Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Submitted</Label>
                  <p className="font-medium">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedRequest.description && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="p-3 bg-gray-50 rounded-lg">{selectedRequest.description}</p>
                </div>
              )}

              <div className="border-t pt-4 space-y-4">
                <div>
                  <Label>Approved Amount (₹)</Label>
                  <Input 
                    type="number" 
                    placeholder="Enter approved amount" 
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Rejection Reason (if rejecting)</Label>
                  <Textarea 
                    placeholder="Enter reason for rejection..." 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-between border-t pt-4">
                <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason || updateMutation.isPending}>
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Cancel</Button>
                  <Button onClick={handleApprove} disabled={!approvedAmount || updateMutation.isPending}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Approve
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
