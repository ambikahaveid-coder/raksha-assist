import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithCsrf } from "@/lib/csrf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, Plus, Search, Edit, Trash2, MapPin, Phone, 
  Globe, CheckCircle, XCircle, IndianRupee, Star
} from "lucide-react";

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website?: string;
  specialties: string[];
  tier: string;
  isNetworkHospital: boolean;
  isActive: boolean;
  createdAt: string;
}

export function HospitalsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [formData, setFormData] = useState({
    name: "", address: "", city: "", state: "", pincode: "",
    phone: "", email: "", website: "", specialties: "", tier: "tier2", isNetworkHospital: true
  });

  const { data: hospitals = [], isLoading } = useQuery<Hospital[]>({
    queryKey: ["admin-hospitals"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/hospitals");
      if (!res.ok) throw new Error("Failed to fetch hospitals");
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetchWithCsrf("/api/admin/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          specialties: data.specialties.split(",").map((s: string) => s.trim()).filter(Boolean)
        })
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hospitals"] });
      toast({ title: "Hospital added successfully" });
      resetForm();
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetchWithCsrf(`/api/admin/hospitals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          specialties: typeof data.specialties === "string" 
            ? data.specialties.split(",").map((s: string) => s.trim()).filter(Boolean)
            : data.specialties
        })
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hospitals"] });
      toast({ title: "Hospital updated successfully" });
      resetForm();
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithCsrf(`/api/admin/hospitals/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hospitals"] });
      toast({ title: "Hospital removed successfully" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });

  const resetForm = () => {
    setFormData({ name: "", address: "", city: "", state: "", pincode: "", phone: "", email: "", website: "", specialties: "", tier: "tier2", isNetworkHospital: true });
    setEditingHospital(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setFormData({
      name: hospital.name,
      address: hospital.address,
      city: hospital.city,
      state: hospital.state,
      pincode: hospital.pincode,
      phone: hospital.phone,
      email: hospital.email || "",
      website: hospital.website || "",
      specialties: hospital.specialties?.join(", ") || "",
      tier: hospital.tier || "tier2",
      isNetworkHospital: hospital.isNetworkHospital
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingHospital) {
      updateMutation.mutate({ id: editingHospital.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredHospitals = hospitals.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tierColors: Record<string, string> = {
    tier1: "bg-purple-100 text-purple-800",
    tier2: "bg-blue-100 text-blue-800",
    tier3: "bg-green-100 text-green-800"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Hospital Network</h2>
          <Badge variant="secondary">{hospitals.length} hospitals</Badge>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Hospital
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search hospitals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-48" /></Card>)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredHospitals.map(hospital => (
            <Card key={hospital.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{hospital.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(hospital)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(hospital.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{hospital.city}, {hospital.state}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{hospital.phone}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={tierColors[hospital.tier] || tierColors.tier2}>
                    <Star className="h-3 w-3 mr-1" />
                    {hospital.tier?.toUpperCase() || "TIER2"}
                  </Badge>
                  {hospital.isNetworkHospital && (
                    <Badge variant="outline" className="border-green-500 text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" /> Network
                    </Badge>
                  )}
                  {!hospital.isActive && (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" /> Inactive
                    </Badge>
                  )}
                </div>
                {hospital.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {hospital.specialties.slice(0, 3).map((s, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                    {hospital.specialties.length > 3 && (
                      <Badge variant="secondary" className="text-xs">+{hospital.specialties.length - 3}</Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingHospital ? "Edit Hospital" : "Add New Hospital"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hospital Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address *</Label>
              <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Pincode *</Label>
                <Input value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select value={formData.tier} onValueChange={(v) => setFormData({ ...formData, tier: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tier1">Tier 1 (Premium)</SelectItem>
                    <SelectItem value="tier2">Tier 2 (Standard)</SelectItem>
                    <SelectItem value="tier3">Tier 3 (Basic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Network Status</Label>
                <Select value={formData.isNetworkHospital ? "yes" : "no"} onValueChange={(v) => setFormData({ ...formData, isNetworkHospital: v === "yes" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Network Hospital</SelectItem>
                    <SelectItem value="no">Non-Network</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Specialties (comma-separated)</Label>
              <Input placeholder="Cardiology, Orthopedics, Neurology..." value={formData.specialties} onChange={(e) => setFormData({ ...formData, specialties: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {editingHospital ? "Update" : "Add"} Hospital
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
