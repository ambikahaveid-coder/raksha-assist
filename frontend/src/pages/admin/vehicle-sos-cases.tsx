import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  Car, AlertTriangle, CheckCircle2, Clock, XCircle, IndianRupee, 
  Building2, Phone, MapPin, FileText, Eye, RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchWithCsrf } from "@/lib/csrf";

interface VehicleSosCase {
  id: string;
  caseNumber: string;
  vehicleType: string;
  vehicleNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear?: string;
  accidentDate: string;
  accidentLocation: string;
  accidentDescription: string;
  hospitalName: string;
  hospitalAddress: string | null;
  estimatedAmount: number;
  approvedAmount: number | null;
  settledAmount: number | null;
  firNumber: string | null;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  memberName: string;
  memberMobile: string;
  showroomName?: string;
  showroomCity?: string;
}

export default function VehicleSosCasesAdmin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<VehicleSosCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<VehicleSosCase | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: string; case: VehicleSosCase | null }>({
    open: false,
    action: "",
    case: null,
  });
  const [actionData, setActionData] = useState({
    approvedAmount: "",
    settledAmount: "",
    rejectionReason: "",
  });

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const res = await fetchWithCsrf("/api/showroom/admin/vehicle-sos-cases");
      if (!res.ok) throw new Error("Failed to load cases");
      const data = await res.json();
      setCases(data.cases || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load cases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isActionValid = () => {
    if (actionDialog.action === "approve") {
      const amount = parseFloat(actionData.approvedAmount);
      return !isNaN(amount) && isFinite(amount) && amount > 0;
    }
    if (actionDialog.action === "settle") {
      const amount = parseFloat(actionData.settledAmount);
      return !isNaN(amount) && isFinite(amount) && amount > 0;
    }
    return true;
  };

  const handleAction = async () => {
    if (!actionDialog.case) return;
    
    if (!isActionValid()) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid positive amount",
        variant: "destructive",
      });
      return;
    }
    
    setActionLoading(true);
    try {
      const body: any = { action: actionDialog.action };
      
      if (actionDialog.action === "approve") {
        body.approvedAmount = parseFloat(actionData.approvedAmount);
      } else if (actionDialog.action === "settle") {
        body.settledAmount = parseFloat(actionData.settledAmount);
      } else if (actionDialog.action === "reject") {
        body.rejectionReason = actionData.rejectionReason;
      }

      const res = await fetchWithCsrf(`/api/showroom/admin/vehicle-sos-cases/${actionDialog.case.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Action failed");
      }

      toast({
        title: "Success",
        description: `Case ${actionDialog.action}d successfully`,
      });

      setActionDialog({ open: false, action: "", case: null });
      setActionData({ approvedAmount: "", settledAmount: "", rejectionReason: "" });
      loadCases();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Action failed",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
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

  const pendingCases = cases.filter(c => c.status === "pending");
  const verificationCases = cases.filter(c => c.status === "under_verification");
  const approvedCases = cases.filter(c => c.status === "approved");
  const settledCases = cases.filter(c => c.status === "settled");
  const rejectedCases = cases.filter(c => c.status === "rejected");

  const CaseCard = ({ sosCase }: { sosCase: VehicleSosCase }) => (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm bg-slate-100 px-2 py-0.5 rounded">{sosCase.caseNumber}</span>
            {getStatusBadge(sosCase.status)}
          </div>
          <p className="font-medium">{sosCase.memberName}</p>
          <p className="text-sm text-slate-500">{sosCase.memberMobile}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">Rs.{(sosCase.estimatedAmount || 0).toLocaleString()}</p>
          <p className="text-xs text-slate-500">Estimated</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
        <div>
          <p className="text-slate-500">Vehicle</p>
          <p className="font-medium">{sosCase.vehicleMake} {sosCase.vehicleModel}</p>
          <p className="text-slate-500 text-xs">{sosCase.vehicleNumber}</p>
        </div>
        <div>
          <p className="text-slate-500">Type</p>
          <p className="font-medium capitalize">{sosCase.vehicleType}</p>
        </div>
        <div>
          <p className="text-slate-500">Hospital</p>
          <p className="font-medium">{sosCase.hospitalName}</p>
        </div>
        {sosCase.showroomName && (
        <div>
          <p className="text-slate-500">Showroom</p>
          <p className="font-medium">{sosCase.showroomName}</p>
          <p className="text-slate-500 text-xs">{sosCase.showroomCity}</p>
        </div>
        )}
      </div>

      {sosCase.approvedAmount && (
        <div className="text-sm text-green-600 mb-2">
          Approved Amount: Rs.{sosCase.approvedAmount.toLocaleString()}
        </div>
      )}
      {sosCase.settledAmount && (
        <div className="text-sm text-emerald-600 mb-2">
          Settled Amount: Rs.{sosCase.settledAmount.toLocaleString()}
        </div>
      )}
      {sosCase.rejectionReason && (
        <div className="text-sm text-red-600 mb-2">
          Rejection Reason: {sosCase.rejectionReason}
        </div>
      )}

      <div className="flex gap-2 mt-3 pt-3 border-t">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setSelectedCase(sosCase)}
        >
          <Eye className="h-4 w-4 mr-1" /> View Details
        </Button>

        {sosCase.status === "pending" && (
          <>
            <Button 
              size="sm"
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => {
                setActionDialog({ open: true, action: "verify", case: sosCase });
              }}
            >
              Start Verification
            </Button>
            <Button 
              size="sm"
              className="bg-green-500 hover:bg-green-600"
              onClick={() => {
                setActionData({ ...actionData, approvedAmount: sosCase.estimatedAmount.toString() });
                setActionDialog({ open: true, action: "approve", case: sosCase });
              }}
            >
              Approve
            </Button>
            <Button 
              size="sm"
              variant="destructive"
              onClick={() => {
                setActionDialog({ open: true, action: "reject", case: sosCase });
              }}
            >
              Reject
            </Button>
          </>
        )}

        {sosCase.status === "under_verification" && (
          <>
            <Button 
              size="sm"
              className="bg-green-500 hover:bg-green-600"
              onClick={() => {
                setActionData({ ...actionData, approvedAmount: sosCase.estimatedAmount.toString() });
                setActionDialog({ open: true, action: "approve", case: sosCase });
              }}
            >
              Approve
            </Button>
            <Button 
              size="sm"
              variant="destructive"
              onClick={() => {
                setActionDialog({ open: true, action: "reject", case: sosCase });
              }}
            >
              Reject
            </Button>
          </>
        )}

        {sosCase.status === "approved" && (
          <Button 
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600"
            onClick={() => {
              setActionData({ ...actionData, settledAmount: (sosCase.approvedAmount || sosCase.estimatedAmount).toString() });
              setActionDialog({ open: true, action: "settle", case: sosCase });
            }}
          >
            <IndianRupee className="h-4 w-4 mr-1" /> Settle Case
          </Button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Vehicle SOS Cases</h2>
          <p className="text-slate-600">Manage emergency assistance requests from showroom partners</p>
        </div>
        <Button onClick={loadCases} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCases.length}</p>
                <p className="text-sm text-slate-500">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verificationCases.length}</p>
                <p className="text-sm text-slate-500">Verifying</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedCases.length}</p>
                <p className="text-sm text-slate-500">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <IndianRupee className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{settledCases.length}</p>
                <p className="text-sm text-slate-500">Settled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rejectedCases.length}</p>
                <p className="text-sm text-slate-500">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Pending ({pendingCases.length})
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Verification ({verificationCases.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" />
            Approved ({approvedCases.length})
          </TabsTrigger>
          <TabsTrigger value="settled" className="flex items-center gap-1">
            <IndianRupee className="h-4 w-4" />
            Settled ({settledCases.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-1">
            <XCircle className="h-4 w-4" />
            Rejected ({rejectedCases.length})
          </TabsTrigger>
          <TabsTrigger value="all">All ({cases.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingCases.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-slate-500">No pending cases</CardContent></Card>
          ) : (
            pendingCases.map(c => <CaseCard key={c.id} sosCase={c} />)
          )}
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          {verificationCases.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-slate-500">No cases under verification</CardContent></Card>
          ) : (
            verificationCases.map(c => <CaseCard key={c.id} sosCase={c} />)
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedCases.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-slate-500">No approved cases</CardContent></Card>
          ) : (
            approvedCases.map(c => <CaseCard key={c.id} sosCase={c} />)
          )}
        </TabsContent>

        <TabsContent value="settled" className="space-y-4">
          {settledCases.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-slate-500">No settled cases</CardContent></Card>
          ) : (
            settledCases.map(c => <CaseCard key={c.id} sosCase={c} />)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedCases.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-slate-500">No rejected cases</CardContent></Card>
          ) : (
            rejectedCases.map(c => <CaseCard key={c.id} sosCase={c} />)
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {cases.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-slate-500">No cases found</CardContent></Card>
          ) : (
            cases.map(c => <CaseCard key={c.id} sosCase={c} />)
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, action: "", case: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">
              {actionDialog.action === "verify" && "Start Verification"}
              {actionDialog.action === "approve" && "Approve Case"}
              {actionDialog.action === "reject" && "Reject Case"}
              {actionDialog.action === "settle" && "Settle Case"}
            </DialogTitle>
            <DialogDescription>
              Case: {actionDialog.case?.caseNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionDialog.action === "verify" && (
              <p>This will mark the case as under verification. Continue?</p>
            )}

            {actionDialog.action === "approve" && (
              <div className="space-y-2">
                <Label>Approved Amount (Rs.)</Label>
                <Input
                  type="number"
                  value={actionData.approvedAmount}
                  onChange={(e) => setActionData({ ...actionData, approvedAmount: e.target.value })}
                  placeholder="Enter approved amount"
                />
                <p className="text-sm text-slate-500">
                  Estimated: Rs.{actionDialog.case?.estimatedAmount.toLocaleString()}
                </p>
              </div>
            )}

            {actionDialog.action === "reject" && (
              <div className="space-y-2">
                <Label>Rejection Reason</Label>
                <Textarea
                  value={actionData.rejectionReason}
                  onChange={(e) => setActionData({ ...actionData, rejectionReason: e.target.value })}
                  placeholder="Enter reason for rejection"
                  rows={3}
                />
              </div>
            )}

            {actionDialog.action === "settle" && (
              <div className="space-y-2">
                <Label>Settlement Amount (Rs.)</Label>
                <Input
                  type="number"
                  value={actionData.settledAmount}
                  onChange={(e) => setActionData({ ...actionData, settledAmount: e.target.value })}
                  placeholder="Enter settled amount"
                />
                <p className="text-sm text-slate-500">
                  Approved: Rs.{actionDialog.case?.approvedAmount?.toLocaleString() || actionDialog.case?.estimatedAmount.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, action: "", case: null })}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={actionLoading || ((actionDialog.action === "approve" || actionDialog.action === "settle") && !isActionValid())}
              className={
                actionDialog.action === "reject" ? "bg-red-500 hover:bg-red-600" :
                actionDialog.action === "approve" ? "bg-green-500 hover:bg-green-600" :
                actionDialog.action === "settle" ? "bg-emerald-500 hover:bg-emerald-600" :
                ""
              }
            >
              {actionLoading ? "Processing..." : `Confirm ${actionDialog.action}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedCase} onOpenChange={(open) => !open && setSelectedCase(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Case Details: {selectedCase?.caseNumber}</DialogTitle>
          </DialogHeader>

          {selectedCase && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedCase.status)}
                <span className="text-slate-500 text-sm">
                  Filed on {new Date(selectedCase.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Member Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {selectedCase.memberName}</p>
                    <p><strong>Mobile:</strong> {selectedCase.memberMobile}</p>
                  </div>
                </div>

                {selectedCase.showroomName && (
                <div>
                  <h4 className="font-medium mb-2">Showroom Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {selectedCase.showroomName}</p>
                    <p><strong>City:</strong> {selectedCase.showroomCity}</p>
                  </div>
                </div>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Vehicle Details</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <p><strong>Type:</strong> <span className="capitalize">{selectedCase.vehicleType}</span></p>
                  <p><strong>Number:</strong> {selectedCase.vehicleNumber}</p>
                  <p><strong>Make/Model:</strong> {selectedCase.vehicleMake} {selectedCase.vehicleModel}</p>
                  <p><strong>Year:</strong> {selectedCase.vehicleYear}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Accident Details</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Date:</strong> {new Date(selectedCase.accidentDate).toLocaleDateString()}</p>
                  <p><strong>Location:</strong> {selectedCase.accidentLocation}</p>
                  <p><strong>Description:</strong> {selectedCase.accidentDescription}</p>
                  {selectedCase.firNumber && <p><strong>FIR Number:</strong> {selectedCase.firNumber}</p>}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Hospital & Amount</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Hospital:</strong> {selectedCase.hospitalName}</p>
                  {selectedCase.hospitalAddress && <p><strong>Address:</strong> {selectedCase.hospitalAddress}</p>}
                  <p><strong>Estimated Amount:</strong> Rs.{selectedCase.estimatedAmount.toLocaleString()}</p>
                  {selectedCase.approvedAmount && (
                    <p className="text-green-600"><strong>Approved Amount:</strong> Rs.{selectedCase.approvedAmount.toLocaleString()}</p>
                  )}
                  {selectedCase.settledAmount && (
                    <p className="text-emerald-600"><strong>Settled Amount:</strong> Rs.{selectedCase.settledAmount.toLocaleString()}</p>
                  )}
                </div>
              </div>

              {selectedCase.rejectionReason && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-red-800"><strong>Rejection Reason:</strong> {selectedCase.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
