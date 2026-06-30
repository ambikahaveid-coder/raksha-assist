import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Phone, MapPin, Shield, XCircle, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { fetchWithCsrf } from "@/lib/csrf";

interface SOSTriggerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasActiveMembership?: boolean;
}

export function SOSTrigger({ open, onOpenChange, hasActiveMembership = false }: SOSTriggerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"warning" | "instructions" | "form" | "confirmation" | "submitted">("warning");
  const [formData, setFormData] = useState({
    emergencyType: "accident",
    location: "",
    description: "",
    latitude: "",
    longitude: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [caseNumber, setCaseNumber] = useState("");

  const { data: abuseStatus } = useQuery({
    queryKey: ["sos", "abuse-status"],
    queryFn: async () => {
      const res = await fetch("/api/sos/abuse-status");
      if (!res.ok) return { isBlocked: false, spamCount: 0 };
      return res.json();
    },
    enabled: open
  });

  const resetAndClose = () => {
    setStep("warning");
    setFormData({ emergencyType: "accident", location: "", description: "", latitude: "", longitude: "" });
    onOpenChange(false);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
            location: `Lat: ${position.coords.latitude.toFixed(4)}, Lon: ${position.coords.longitude.toFixed(4)}`
          });
          toast({ title: "Location captured successfully" });
        },
        () => {
          toast({ title: "Could not get location", description: "Please enter your location manually", variant: "destructive" });
        }
      );
    }
  };

  const triggerSOS = async () => {
    setSubmitting(true);
    try {
      const res = await fetchWithCsrf("/api/sos/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setCaseNumber(data.caseNumber);
        setStep("submitted");
        queryClient.invalidateQueries({ queryKey: ["sos"] });
      } else {
        toast({ title: data.error || "Failed to trigger SOS", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to trigger SOS", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (abuseStatus?.isBlocked) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <DialogTitle className="text-center text-red-600">SOS Access Blocked</DialogTitle>
            <DialogDescription className="text-center">
              Your SOS access has been suspended due to multiple spam reports. 
              Please contact our support team to resolve this issue.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm font-medium">Contact Support</p>
            <p className="text-lg font-bold text-blue-600">+91 81437 52025</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetAndClose} className="w-full">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (!hasActiveMembership) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-amber-600" />
            </div>
            <DialogTitle className="text-center">Active Membership Required</DialogTitle>
            <DialogDescription className="text-center">
              SOS emergency assistance is available only for active members. 
              Purchase a membership plan to activate your SOS protection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
              <p className="text-sm font-medium text-blue-800">Contact Our Sales Team</p>
              <a href="tel:+918143752025" className="text-xl font-bold text-blue-600 hover:underline block mt-1">+91 81437 52025</a>
              <p className="text-xs text-blue-600 mt-1">Get help choosing the right plan</p>
            </div>
            <a href="/plans" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90">View Membership Plans</Button>
            </a>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetAndClose} className="w-full">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {step === "warning" && (
          <>
            <DialogHeader>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <DialogTitle className="text-center">Emergency SOS Alert</DialogTitle>
              <DialogDescription className="text-center">
                This feature is for genuine medical emergencies and accidents only.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800">Misuse Warning</p>
                  <p className="text-sm text-red-600">
                    False or spam alerts will result in your account being blocked. 
                    {abuseStatus?.spamCount > 0 && (
                      <span className="block mt-1 font-medium">
                        You have {abuseStatus.spamCount}/3 spam warnings.
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Shield className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-800">Assistance Applies</p>
                  <p className="text-sm text-blue-600">
                    Financial assistance is subject to your plan terms and conditions.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={resetAndClose} className="w-full sm:w-auto">Cancel</Button>
              <Button onClick={() => setStep("instructions")} className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
                I Have a Genuine Emergency
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "instructions" && (
          <>
            <DialogHeader>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <DialogTitle className="text-center">Emergency Instructions</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-green-600">1</span>
                </div>
                <div>
                  <p className="font-medium">Call Emergency Services First</p>
                  <p className="text-sm text-muted-foreground">Dial 108 (Ambulance) or 112 (All emergencies)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-green-600">2</span>
                </div>
                <div>
                  <p className="font-medium">Stay Calm & Safe</p>
                  <p className="text-sm text-muted-foreground">Move to a safe location if possible</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-green-600">3</span>
                </div>
                <div>
                  <p className="font-medium">Provide Details</p>
                  <p className="text-sm text-muted-foreground">Fill in the emergency form accurately</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
              <p className="font-medium text-yellow-800">Raksha Assist Helpline</p>
              <p className="text-2xl font-bold text-yellow-700">+91 81437 52025</p>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
              <Button variant="outline" onClick={() => setStep("warning")} className="w-full sm:w-auto">Back</Button>
              <Button onClick={() => setStep("form")} className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
                Proceed to Form
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "form" && (
          <>
            <DialogHeader>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <DialogTitle className="text-center">Emergency Details</DialogTitle>
              <DialogDescription className="text-center">
                Provide accurate information for quick assistance
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Emergency Type</Label>
                <Select value={formData.emergencyType} onValueChange={v => setFormData({...formData, emergencyType: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accident">Road Accident</SelectItem>
                    <SelectItem value="medical">Medical Emergency</SelectItem>
                    <SelectItem value="cardiac">Heart Attack / Cardiac</SelectItem>
                    <SelectItem value="injury">Serious Injury</SelectItem>
                    <SelectItem value="other">Other Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter location or use GPS" 
                    value={formData.location} 
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={getLocation}>
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Brief Description</Label>
                <Textarea 
                  placeholder="Describe the emergency situation..." 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setStep("instructions")} className="w-full sm:w-auto">Back</Button>
              <Button onClick={() => setStep("confirmation")} className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
                Review & Submit
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "confirmation" && (
          <>
            <DialogHeader>
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
              <DialogTitle className="text-center">Confirm Emergency Alert</DialogTitle>
              <DialogDescription className="text-center">
                Please verify the details before submitting
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Emergency Type</p>
                <p className="font-medium capitalize">{formData.emergencyType}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{formData.location || "Not specified"}</p>
              </div>
              {formData.description && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{formData.description}</p>
                </div>
              )}
            </div>

            <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
              <p className="text-sm text-red-700 font-medium">
                By submitting, you confirm this is a genuine emergency.
              </p>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
              <Button variant="outline" onClick={() => setStep("form")} className="w-full sm:w-auto">Edit</Button>
              <Button 
                onClick={triggerSOS} 
                disabled={submitting}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                TRIGGER SOS ALERT
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "submitted" && (
          <>
            <DialogHeader>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="text-center text-green-600">SOS Alert Sent</DialogTitle>
              <DialogDescription className="text-center">
                Our support team has been notified and will contact you shortly.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                <p className="text-sm text-green-700">Your Case Number</p>
                <p className="text-2xl font-bold text-green-800">{caseNumber}</p>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">If this is life-threatening, also call:</p>
                <p className="text-xl font-bold text-red-600">108</p>
                <p className="text-sm text-muted-foreground">for immediate ambulance</p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={resetAndClose} className="w-full">Close</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
