import { useState, useCallback } from "react";
import { fetchWithCsrf } from "@/lib/csrf";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddressData {
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  village?: string;
  locality?: string;
}

interface AddressInputProps {
  value: AddressData;
  onChange: (data: AddressData) => void;
  showVillage?: boolean;
  showLocality?: boolean;
  required?: boolean;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
  "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep"
];

export function AddressInput({ value, onChange, showVillage = false, showLocality = false, required = false }: AddressInputProps) {
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const { toast } = useToast();

  const handlePincodeChange = async (pincode: string) => {
    onChange({ ...value, pincode });
    
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      setIsLoadingPincode(true);
      try {
        const res = await fetch(`/api/pincode/${pincode}`);
        const data = await res.json();
        
        if (data.success) {
          onChange({
            ...value,
            pincode,
            city: data.city || value.city,
            district: data.district || value.district,
            state: data.state || value.state
          });
          toast({ title: "Location Found", description: `${data.district}, ${data.state}` });
        }
      } catch (error) {
        console.error("Pincode lookup failed:", error);
      } finally {
        setIsLoadingPincode(false);
      }
    }
  };

  const handleAutoLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast({ title: "Error", description: "Geolocation not supported by your browser", variant: "destructive" });
      return;
    }

    setIsLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetchWithCsrf("/api/location/reverse-geocode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude })
          });
          const data = await res.json();
          
          if (data.success) {
            onChange({
              ...value,
              address: value.address || data.locality || "",
              city: data.city || value.city,
              district: data.district || value.district,
              state: data.state || value.state,
              pincode: data.pincode || value.pincode,
              village: data.village || value.village,
              locality: data.locality || value.locality
            });
            toast({ title: "Location Detected", description: `${data.city || data.district}, ${data.state}` });
          } else {
            toast({ title: "Error", description: "Could not get location details", variant: "destructive" });
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to get location", variant: "destructive" });
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast({ title: "Permission Denied", description: "Please allow location access", variant: "destructive" });
        } else {
          toast({ title: "Error", description: "Could not get your location", variant: "destructive" });
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [value, onChange, toast]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Address Details</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleAutoLocation}
          disabled={isLoadingLocation}
          className="gap-2"
        >
          {isLoadingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          Auto Location
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Address / Street {required && "*"}</Label>
          <Input
            value={value.address || ""}
            onChange={(e) => onChange({ ...value, address: e.target.value })}
            placeholder="House/Flat No, Street Name"
          />
        </div>

        {showLocality && (
          <div>
            <Label>Locality / Area</Label>
            <Input
              value={value.locality || ""}
              onChange={(e) => onChange({ ...value, locality: e.target.value })}
              placeholder="Locality or area name"
            />
          </div>
        )}

        {showVillage && (
          <div>
            <Label>Village / Town</Label>
            <Input
              value={value.village || ""}
              onChange={(e) => onChange({ ...value, village: e.target.value })}
              placeholder="Village or town name"
            />
          </div>
        )}

        <div>
          <Label>Pincode {required && "*"}</Label>
          <div className="relative">
            <Input
              value={value.pincode || ""}
              onChange={(e) => handlePincodeChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit pincode"
              maxLength={6}
              className={isLoadingPincode ? "pr-10" : ""}
            />
            {isLoadingPincode && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              </div>
            )}
          </div>
        </div>

        <div>
          <Label>City / District {required && "*"}</Label>
          <Input
            value={value.city || value.district || ""}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            placeholder="City or district"
          />
        </div>

        <div>
          <Label>District</Label>
          <Input
            value={value.district || ""}
            onChange={(e) => onChange({ ...value, district: e.target.value })}
            placeholder="District name"
          />
        </div>

        <div>
          <Label>State {required && "*"}</Label>
          <Select
            value={value.state || ""}
            onValueChange={(v) => onChange({ ...value, state: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_STATES.map((state) => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
