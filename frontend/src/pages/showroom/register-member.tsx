import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Car, User, IndianRupee, CheckCircle } from "lucide-react";
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

interface Plan {
  id: string;
  planCode: string;
  name: string;
  price: number;
  coverageAmount: number;
  planCategory: string;
}

export default function RegisterMember() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [success, setSuccess] = useState<{ memberId: string; membershipNumber: string; tempPassword: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    vehicleType: "",
    vehicleNumber: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    planId: "",
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const res = await fetch("/api/showroom/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error("Failed to load plans:", error);
    }
  };

  const selectedPlan = plans.find(p => p.id === formData.planId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await api.showroom.registerMember({
        ...formData,
        planType: selectedPlan?.name || formData.planId,
        planAmount: selectedPlan?.price || 0,
        coverageAmount: selectedPlan?.coverageAmount || 300000,
      } as any);

      setSuccess({
        memberId: result.memberId,
        membershipNumber: result.membershipNumber,
        tempPassword: result.tempPassword,
      });

      toast({
        title: "Member Registered",
        description: "Customer has been registered successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register member",
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
              <h2 className="text-xl font-semibold mb-2">Member Registered Successfully!</h2>
              <p className="text-slate-600 mb-6">Share the login credentials with the customer</p>

              <div className="bg-slate-50 rounded-lg p-4 text-left space-y-3 mb-6">
                <div>
                  <p className="text-sm text-slate-500">Membership Number</p>
                  <p className="font-mono font-medium">{success.membershipNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Temporary Password</p>
                  <p className="font-mono font-medium text-teal-600">{success.tempPassword}</p>
                </div>
                <p className="text-xs text-slate-500">Customer should change password after first login</p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSuccess(null);
                    setFormData({
                      name: "",
                      mobile: "",
                      email: "",
                      vehicleType: "",
                      vehicleNumber: "",
                      vehicleMake: "",
                      vehicleModel: "",
                      vehicleYear: "",
                      planId: "",
                    });
                  }}
                >
                  Register Another
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
            <span className="font-semibold text-slate-800">Register New Member</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Details
            </CardTitle>
            <CardDescription>Register a new customer with vehicle membership</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Customer Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    placeholder="10-digit mobile"
                    required
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@email.com"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium flex items-center gap-2 mb-4">
                  <Car className="h-5 w-5" />
                  Vehicle Information
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
                  <IndianRupee className="h-5 w-5" />
                  Select Membership Plan
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="planId">Plan *</Label>
                  <Select
                    value={formData.planId}
                    onValueChange={(value) => setFormData({ ...formData, planId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - Rs.{plan.price.toLocaleString()} (Support: Rs.{plan.coverageAmount.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPlan && (
                  <div className="mt-4 bg-teal-50 rounded-lg p-4">
                    <p className="font-medium text-teal-800">{selectedPlan.name}</p>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-teal-600">Membership Fee:</span>
                      <span className="font-medium">Rs.{selectedPlan.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-teal-600">Support Limit:</span>
                      <span className="font-medium">Rs.{selectedPlan.coverageAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                disabled={loading || !formData.planId}
              >
                {loading ? "Registering..." : "Register Member"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
