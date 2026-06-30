import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, AlertTriangle, Car, Building2, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import logoImg from "@/assets/logo.png";

const VEHICLE_TYPES = [
  { value: "bike", label: "Bike / Two Wheeler" },
  { value: "car", label: "Car" },
  { value: "auto", label: "Auto Rickshaw" },
  { value: "lorry", label: "Lorry" },
  { value: "truck", label: "Truck" },
  { value: "bus", label: "Bus" },
  { value: "tractor", label: "Tractor" },
  { value: "other", label: "Other" },
];

interface Member {
  id: string;
  name: string;
  mobile: string;
  membership: {
    id: string;
    planType: string;
    coverageAmount: number;
  };
}

export default function FileSOS() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [success, setSuccess] = useState<{ caseNumber: string } | null>(null);

  const [formData, setFormData] = useState({
    userId: "",
    membershipId: "",
    vehicleType: "",
    vehicleNumber: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    accidentDate: "",
    accidentLocation: "",
    accidentDescription: "",
    hospitalName: "",
    hospitalAddress: "",
    estimatedAmount: "",
    firNumber: "",
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const res = await api.showroom.getMembers();
      setMembers(res.members || []);
    } catch (error) {
      console.error("Failed to load members:", error);
    }
  };

  const selectedMember = members.find(m => m.id === formData.userId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await api.showroom.createVehicleSosCase({
        userId: formData.userId,
        membershipId: selectedMember?.membership?.id,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        vehicleYear: formData.vehicleYear,
        accidentDate: formData.accidentDate,
        accidentLocation: formData.accidentLocation,
        accidentDescription: formData.accidentDescription,
        hospitalName: formData.hospitalName,
        hospitalAddress: formData.hospitalAddress || undefined,
        estimatedAmount: parseFloat(formData.estimatedAmount) || 0,
        firNumber: formData.firNumber || undefined,
      });

      setSuccess({ caseNumber: result.case.caseNumber });

      toast({
        title: "SOS Case Filed",
        description: "Emergency case has been submitted for review!",
      });
    } catch (error: any) {
      toast({
        title: "Failed to File Case",
        description: error.message || "Failed to create SOS case",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">SOS Case Filed Successfully!</h2>
              <p className="text-slate-600 mb-6">The case has been submitted for verification and approval</p>

              <div className="bg-slate-50 rounded-lg p-4 text-left mb-6">
                <p className="text-sm text-slate-500">Case Number</p>
                <p className="font-mono font-medium text-lg">{success.caseNumber}</p>
                <p className="text-xs text-slate-500 mt-2">You can track the case status in your dashboard</p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSuccess(null);
                    setFormData({
                      userId: "",
                      membershipId: "",
                      vehicleType: "",
                      vehicleNumber: "",
                      vehicleMake: "",
                      vehicleModel: "",
                      vehicleYear: "",
                      accidentDate: "",
                      accidentLocation: "",
                      accidentDescription: "",
                      hospitalName: "",
                      hospitalAddress: "",
                      estimatedAmount: "",
                      firNumber: "",
                    });
                  }}
                >
                  File Another Case
                </Button>
                <Link href="/showroom/dashboard">
                  <Button className="bg-gradient-to-r from-teal-500 to-emerald-500">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/showroom/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Raksha Assist" className="h-8" />
            <span className="font-semibold text-slate-800">File Vehicle SOS Case</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Emergency Assistance Request</p>
            <p className="text-sm text-red-700">This form is for reporting vehicle accidents requiring financial support. Please provide accurate information.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              SOS Case Details
            </CardTitle>
            <CardDescription>File an emergency case for a registered member</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="userId">Select Member *</Label>
                <Select
                  value={formData.userId}
                  onValueChange={(value) => {
                    const member = members.find(m => m.id === value);
                    setFormData({
                      ...formData,
                      userId: value,
                      membershipId: member?.membership?.id || "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a registered member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} - {member.mobile}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {members.length === 0 && (
                  <p className="text-sm text-slate-500">No members registered yet. <Link href="/showroom/register-member" className="text-teal-600">Register a member first</Link></p>
                )}
              </div>

              {selectedMember && (
                <div className="bg-teal-50 rounded-lg p-4">
                  <p className="font-medium text-teal-800">{selectedMember.name}</p>
                  <p className="text-sm text-teal-600">Plan: {selectedMember.membership.planType}</p>
                  <p className="text-sm text-teal-600">Support Limit: Rs.{selectedMember.membership.coverageAmount?.toLocaleString()}</p>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="font-medium flex items-center gap-2 mb-4">
                  <Car className="h-5 w-5" />
                  Vehicle Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Vehicle Type *</Label>
                    <Select
                      value={formData.vehicleType}
                      onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        {VEHICLE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                    <Input
                      id="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                      placeholder="AP 01 AB 1234"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleMake">Vehicle Make *</Label>
                    <Input
                      id="vehicleMake"
                      value={formData.vehicleMake}
                      onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                      placeholder="Honda, Maruti, etc."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleModel">Vehicle Model *</Label>
                    <Input
                      id="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                      placeholder="Activa, Swift, etc."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleYear">Manufacturing Year *</Label>
                    <Input
                      id="vehicleYear"
                      value={formData.vehicleYear}
                      onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      placeholder="2023"
                      required
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Accident Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accidentDate">Accident Date *</Label>
                    <Input
                      id="accidentDate"
                      type="date"
                      value={formData.accidentDate}
                      onChange={(e) => setFormData({ ...formData, accidentDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firNumber">FIR Number (Optional)</Label>
                    <Input
                      id="firNumber"
                      value={formData.firNumber}
                      onChange={(e) => setFormData({ ...formData, firNumber: e.target.value })}
                      placeholder="FIR number if available"
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="accidentLocation">Accident Location *</Label>
                  <Input
                    id="accidentLocation"
                    value={formData.accidentLocation}
                    onChange={(e) => setFormData({ ...formData, accidentLocation: e.target.value })}
                    placeholder="Location where accident occurred"
                    required
                  />
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="accidentDescription">Accident Description *</Label>
                  <Textarea
                    id="accidentDescription"
                    value={formData.accidentDescription}
                    onChange={(e) => setFormData({ ...formData, accidentDescription: e.target.value })}
                    placeholder="Describe what happened..."
                    required
                    rows={3}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5" />
                  Hospital Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hospitalName">Hospital Name *</Label>
                    <Input
                      id="hospitalName"
                      value={formData.hospitalName}
                      onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                      placeholder="Hospital where treatment is done"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedAmount">Estimated Amount (Rs.) *</Label>
                    <Input
                      id="estimatedAmount"
                      type="number"
                      value={formData.estimatedAmount}
                      onChange={(e) => setFormData({ ...formData, estimatedAmount: e.target.value })}
                      placeholder="50000"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="hospitalAddress">Hospital Address (Optional)</Label>
                  <Input
                    id="hospitalAddress"
                    value={formData.hospitalAddress}
                    onChange={(e) => setFormData({ ...formData, hospitalAddress: e.target.value })}
                    placeholder="Hospital address"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                disabled={loading || !formData.userId}
              >
                {loading ? "Submitting..." : "Submit SOS Case"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
