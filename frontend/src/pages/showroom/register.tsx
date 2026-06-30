import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Car, Building2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import logoImg from "@/assets/logo.png";

const VEHICLE_TYPES = [
  { id: "bike", label: "Bikes / Two-Wheelers" },
  { id: "car", label: "Cars" },
  { id: "auto", label: "Auto Rickshaw" },
  { id: "lorry", label: "Lorry" },
  { id: "truck", label: "Trucks" },
  { id: "bus", label: "Buses" },
  { id: "tractor", label: "Tractors" },
  { id: "other", label: "Other Vehicles" },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function ShowroomRegister() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    showroomName: "",
    ownerName: "",
    vehicleTypes: [] as string[],
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    gstNumber: "",
    panNumber: "",
    password: "",
    confirmPassword: "",
  });

  const handleVehicleTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      vehicleTypes: prev.vehicleTypes.includes(type)
        ? prev.vehicleTypes.filter(t => t !== type)
        : [...prev.vehicleTypes, type]
    }));
  };

  const validateStep1 = () => {
    if (!formData.showroomName || !formData.ownerName || formData.vehicleTypes.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in showroom name, owner name, and select at least one vehicle type",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast({
        title: "Missing Information",
        description: "Please fill in complete address details",
        variant: "destructive",
      });
      return false;
    }
    if (formData.pincode.length !== 6) {
      toast({
        title: "Invalid Pincode",
        description: "Please enter a valid 6-digit pincode",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.phone || !formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in phone, email, and password",
        variant: "destructive",
      });
      return false;
    }
    if (formData.phone.length !== 10) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return false;
    }
    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    try {
      await api.showroom.register({
        name: formData.showroomName,
        ownerName: formData.ownerName,
        vehicleTypes: formData.vehicleTypes.join(","),
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        phone: formData.phone,
        email: formData.email,
        gstNumber: formData.gstNumber || undefined,
        panNumber: formData.panNumber || undefined,
        password: formData.password,
      });
      
      toast({
        title: "Registration Successful!",
        description: "Your showroom has been registered. You can now login.",
      });
      setLocation("/showroom/login");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error?.message || "Failed to register showroom",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/showroom/login" className="flex items-center gap-2 text-teal-600 hover:text-teal-700">
            <ArrowLeft className="h-5 w-5" />
            Back to Login
          </Link>
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Raksha Assist" className="h-10" />
            <div>
              <span className="text-lg font-semibold text-slate-800">Raksha Assist</span>
              <p className="text-xs text-slate-500">Showroom Partner Portal</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Register Your Showroom</h1>
            <p className="text-slate-600">Join our partner network and start earning commissions</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s 
                      ? "bg-teal-500 text-white" 
                      : "bg-slate-200 text-slate-500"
                  }`}>
                    {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`w-16 h-1 mx-2 ${step > s ? "bg-teal-500" : "bg-slate-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                {step === 1 && <><Building2 className="h-5 w-5" /> Business Details</>}
                {step === 2 && <><Building2 className="h-5 w-5" /> Location Details</>}
                {step === 3 && <><Car className="h-5 w-5" /> Account Setup</>}
              </CardTitle>
              <CardDescription className="text-teal-100">
                {step === 1 && "Tell us about your showroom"}
                {step === 2 && "Where is your showroom located?"}
                {step === 3 && "Set up your login credentials"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="showroomName">Showroom Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="showroomName"
                        placeholder="Enter showroom name"
                        value={formData.showroomName}
                        onChange={(e) => setFormData({ ...formData, showroomName: e.target.value })}
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ownerName">Owner Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="ownerName"
                        placeholder="Enter owner's full name"
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Vehicle Types Sold <span className="text-red-500">*</span></Label>
                      <p className="text-sm text-slate-500">Select all vehicle types your showroom deals with</p>
                      <div className="grid grid-cols-2 gap-3">
                        {VEHICLE_TYPES.map((type) => (
                          <div
                            key={type.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              formData.vehicleTypes.includes(type.id)
                                ? "border-teal-500 bg-teal-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                            onClick={() => handleVehicleTypeToggle(type.id)}
                          >
                            <Checkbox checked={formData.vehicleTypes.includes(type.id)} />
                            <span className="text-sm font-medium">{type.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="address">Full Address <span className="text-red-500">*</span></Label>
                      <Input
                        id="address"
                        placeholder="Street address, building name, etc."
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="h-12"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                        <Input
                          id="city"
                          placeholder="Enter city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode <span className="text-red-500">*</span></Label>
                        <Input
                          id="pincode"
                          placeholder="6-digit pincode"
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) => setFormData({ ...formData, state: value })}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDIAN_STATES.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                        <Input
                          id="gstNumber"
                          placeholder="Enter GST number"
                          value={formData.gstNumber}
                          onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="panNumber">PAN Number (Optional)</Label>
                        <Input
                          id="panNumber"
                          placeholder="Enter PAN number"
                          value={formData.panNumber}
                          onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase().slice(0, 10) })}
                          className="h-12"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Mobile Number <span className="text-red-500">*</span></Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-4 text-sm text-slate-500 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl font-medium">
                          +91
                        </span>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="98765 43210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          className="rounded-l-none h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="showroom@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Create Password <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min 6 characters"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="h-12 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="h-12"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mt-8">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      className="flex-1 h-12"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 h-12 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-12 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                    >
                      {loading ? "Registering..." : "Complete Registration"}
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-slate-500 mt-6">
            By registering, you agree to our{" "}
            <Link href="/terms" className="text-teal-600 hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-teal-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
