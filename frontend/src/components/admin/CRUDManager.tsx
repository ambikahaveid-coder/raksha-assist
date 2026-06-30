import { useState, useEffect } from "react";
import { fetchWithCsrf } from "@/lib/csrf";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Pencil,
  Trash2,
  Ban,
  CheckCircle,
  Loader2,
  FileText,
  IndianRupee,
  Users,
  Building2,
  Shield,
  Settings,
  X,
  Search,
  Filter,
  MoreVertical,
  Download,
  Copy,
  History,
  Mail,
  CheckSquare
} from "lucide-react";

export function PlansManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkActionMode, setBulkActionMode] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    planCode: "",
    planCategory: "individual",
    price: "",
    originalPrice: "",
    coverageAmount: "",
    validityDays: "365",
    maxMembers: "1",
    waitingPeriodDays: "30",
    coPay: "0",
    annualUsageLimit: "2",
    features: "",
    description: "",
    shortDescription: "",
    subscriptionPeriod: "yearly",
    isActive: true,
    isPopular: false
  });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["admin", "plans"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/plans");
      if (!res.ok) throw new Error("Failed to fetch plans");
      return res.json();
    }
  });

  const savePlanMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editMode ? `/api/admin/plans/${selectedPlan.id}` : "/api/admin/plans";
      const res = await fetchWithCsrf(url, {
        method: editMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to save plan");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: `Plan ${editMode ? "updated" : "created"} successfully` });
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: error.message, variant: "destructive" });
    }
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetchWithCsrf(`/api/admin/plans/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete plan");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Plan deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    }
  });

  const togglePlanStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await fetchWithCsrf(`/api/admin/plans/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive })
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({ title: variables.isActive ? "Plan activated" : "Plan blocked" });
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    }
  });

  const duplicatePlanMutation = useMutation({
    mutationFn: async (plan: any) => {
      const newPlan = { ...plan, name: `${plan.name} (Copy)`, id: undefined };
      const res = await fetchWithCsrf("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlan)
      });
      if (!res.ok) throw new Error("Failed to duplicate plan");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Plan duplicated successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await fetchWithCsrf("/api/admin/plans/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids })
      });
      if (!res.ok) throw new Error("Failed to delete plans");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: `${selectedIds.length} plans deleted` });
      setSelectedIds([]);
      setBulkActionMode(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    }
  });

  const bulkBlockMutation = useMutation({
    mutationFn: async ({ ids, isActive }: { ids: number[]; isActive: boolean }) => {
      const res = await fetchWithCsrf("/api/admin/plans/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, isActive })
      });
      if (!res.ok) throw new Error("Failed to update plans");
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({ title: `${selectedIds.length} plans ${variables.isActive ? "activated" : "blocked"}` });
      setSelectedIds([]);
      setBulkActionMode(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    }
  });

  const exportToCSV = () => {
    const headers = ["Name", "Plan Code", "Category", "Price", "Original Price", "Coverage", "Validity Days", "Max Members", "Waiting Period", "Co-Pay", "Usage Limit", "Status"];
    const rows = filteredPlans.map((p: any) => [
      p.name, p.planCode || "", p.planCategory || "", p.price, p.originalPrice || 0, p.coverageAmount || 0, p.validityDays || 365, p.maxMembers || 1, p.waitingPeriodDays || 0, p.coPay || 0, p.annualUsageLimit || 1, p.isActive !== false ? "Active" : "Blocked"
    ]);
    const csv = [headers.join(","), ...rows.map((r: any[]) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plans_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast({ title: "Plans exported to CSV" });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPlans.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPlans.map((p: any) => p.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      planCode: "",
      planCategory: "individual",
      price: "",
      originalPrice: "",
      coverageAmount: "",
      validityDays: "365",
      maxMembers: "1",
      waitingPeriodDays: "30",
      coPay: "0",
      annualUsageLimit: "2",
      features: "",
      description: "",
      shortDescription: "",
      subscriptionPeriod: "yearly",
      isActive: true,
      isPopular: false
    });
    setEditMode(false);
    setSelectedPlan(null);
    setDialogOpen(false);
  };

  const openEditDialog = (plan: any) => {
    setEditMode(true);
    setSelectedPlan(plan);
    const featuresStr = (() => {
      if (!plan.features) return "";
      if (Array.isArray(plan.features)) return plan.features.join("\n");
      try { const parsed = JSON.parse(plan.features); return Array.isArray(parsed) ? parsed.join("\n") : plan.features; } catch { return plan.features; }
    })();
    setFormData({
      name: plan.name || "",
      planCode: plan.planCode || "",
      planCategory: plan.planCategory || "individual",
      price: plan.price?.toString() || "",
      originalPrice: plan.originalPrice?.toString() || "",
      coverageAmount: plan.coverageAmount?.toString() || "",
      validityDays: plan.validityDays?.toString() || "365",
      maxMembers: plan.maxMembers?.toString() || "1",
      waitingPeriodDays: plan.waitingPeriodDays?.toString() || "30",
      coPay: plan.coPay?.toString() || "0",
      annualUsageLimit: plan.annualUsageLimit?.toString() || "2",
      features: featuresStr,
      description: plan.description || "",
      shortDescription: plan.shortDescription || "",
      subscriptionPeriod: plan.subscriptionPeriod || "yearly",
      isActive: plan.isActive !== false,
      isPopular: plan.isPopular === true
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.coverageAmount) {
      toast({ title: "Name, price, and coverage amount are required", variant: "destructive" });
      return;
    }
    const planCode = formData.planCode || formData.name.toUpperCase().replace(/[^A-Z0-9]/g, "_").replace(/_+/g, "_");
    const featuresArray = formData.features.split("\n").filter(Boolean);
    savePlanMutation.mutate({
      name: formData.name,
      planCode,
      planCategory: formData.planCategory,
      price: parseInt(formData.price),
      originalPrice: parseInt(formData.originalPrice) || parseInt(formData.price),
      coverageAmount: parseInt(formData.coverageAmount),
      validityDays: parseInt(formData.validityDays),
      maxMembers: parseInt(formData.maxMembers),
      waitingPeriodDays: parseInt(formData.waitingPeriodDays),
      coPay: parseInt(formData.coPay) || 0,
      annualUsageLimit: parseInt(formData.annualUsageLimit) || 1,
      features: JSON.stringify(featuresArray),
      description: formData.description,
      shortDescription: formData.shortDescription,
      subscriptionPeriod: formData.subscriptionPeriod,
      membershipType: "individual",
      isActive: formData.isActive,
      isPopular: formData.isPopular
    });
  };

  const filteredPlans = plans.filter((plan: any) => {
    const matchesSearch = plan.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || plan.planCategory === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "individual": return "bg-blue-100 text-blue-700";
      case "family": return "bg-green-100 text-green-700";
      case "senior": return "bg-orange-100 text-orange-700";
      case "maternity": return "bg-pink-100 text-pink-700";
      case "two_wheeler": return "bg-purple-100 text-purple-700";
      case "car": return "bg-indigo-100 text-indigo-700";
      case "commercial_vehicle": return "bg-amber-100 text-amber-700";
      case "travel": return "bg-cyan-100 text-cyan-700";
      case "home": return "bg-emerald-100 text-emerald-700";
      case "business": return "bg-rose-100 text-rose-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Plan Studio</h2>
          <p className="text-muted-foreground">Manage all membership plans - Add, Edit, Delete, Block</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-2" /> Add New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editMode ? "Edit Plan" : "Create New Plan"}</DialogTitle>
              <DialogDescription>Configure membership plan details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plan Name *</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Raksha Family Shield"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plan Code</Label>
                  <Input 
                    value={formData.planCode} 
                    onChange={(e) => setFormData({...formData, planCode: e.target.value.toUpperCase()})}
                    placeholder="e.g., FAMILY_SHIELD (auto-generated if empty)"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={formData.planCategory} onValueChange={(v) => setFormData({...formData, planCategory: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="senior">Senior Citizen (60+)</SelectItem>
                      <SelectItem value="maternity">Maternity</SelectItem>
                      <SelectItem value="two_wheeler">Two Wheeler</SelectItem>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="commercial_vehicle">Commercial Vehicle</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subscription Period</Label>
                  <Select value={formData.subscriptionPeriod} onValueChange={(v) => setFormData({...formData, subscriptionPeriod: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly (3 months)</SelectItem>
                      <SelectItem value="half_yearly">Half Yearly (6 months)</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Price (₹) *</Label>
                  <Input 
                    type="number"
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="2999"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Original Price (₹)</Label>
                  <Input 
                    type="number"
                    value={formData.originalPrice} 
                    onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                    placeholder="4999 (shown as strikethrough)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Coverage Amount (₹) *</Label>
                  <Input 
                    type="number"
                    value={formData.coverageAmount} 
                    onChange={(e) => setFormData({...formData, coverageAmount: e.target.value})}
                    placeholder="500000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Validity (days)</Label>
                  <Input 
                    type="number"
                    value={formData.validityDays} 
                    onChange={(e) => setFormData({...formData, validityDays: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Members</Label>
                  <Input 
                    type="number"
                    value={formData.maxMembers} 
                    onChange={(e) => setFormData({...formData, maxMembers: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Waiting Period (days)</Label>
                  <Input 
                    type="number"
                    value={formData.waitingPeriodDays} 
                    onChange={(e) => setFormData({...formData, waitingPeriodDays: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Co-Pay (%)</Label>
                  <Input 
                    type="number"
                    value={formData.coPay} 
                    onChange={(e) => setFormData({...formData, coPay: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Annual Usage Limit</Label>
                <Input 
                  type="number"
                  value={formData.annualUsageLimit} 
                  onChange={(e) => setFormData({...formData, annualUsageLimit: e.target.value})}
                  placeholder="Number of times plan can be used per year"
                />
              </div>
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Input 
                  value={formData.shortDescription} 
                  onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                  placeholder="Brief tagline for the plan"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  rows={2}
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Detailed description of the plan"
                />
              </div>
              <div className="space-y-2">
                <Label>Features (one per line)</Label>
                <Textarea 
                  rows={5}
                  value={formData.features} 
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  placeholder="Coverage up to ₹5 Lakh&#10;24/7 Emergency Helpline&#10;Cashless Treatment at 500+ Hospitals&#10;Free Ambulance Service"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={formData.isActive} 
                    onCheckedChange={(v) => setFormData({...formData, isActive: v})}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={formData.isPopular} 
                    onCheckedChange={(v) => setFormData({...formData, isPopular: v})}
                  />
                  <Label>Popular (show badge)</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={savePlanMutation.isPending}>
                {savePlanMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {editMode ? "Update Plan" : "Create Plan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search plans..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="family">Family</SelectItem>
            <SelectItem value="senior">Senior Citizen</SelectItem>
            <SelectItem value="maternity">Maternity</SelectItem>
            <SelectItem value="two_wheeler">Two Wheeler</SelectItem>
            <SelectItem value="car">Car</SelectItem>
            <SelectItem value="commercial_vehicle">Commercial Vehicle</SelectItem>
            <SelectItem value="travel">Travel</SelectItem>
            <SelectItem value="home">Home</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
        <Button 
          variant={bulkActionMode ? "default" : "outline"} 
          onClick={() => { setBulkActionMode(!bulkActionMode); setSelectedIds([]); }}
        >
          <CheckSquare className="h-4 w-4 mr-2" /> Bulk Actions
        </Button>
      </div>

      {bulkActionMode && selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-3 mb-4 bg-slate-100 rounded-xl">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <Button size="sm" variant="outline" onClick={() => bulkBlockMutation.mutate({ ids: selectedIds, isActive: false })}>
            <Ban className="h-4 w-4 mr-1" /> Block All
          </Button>
          <Button size="sm" variant="outline" onClick={() => bulkBlockMutation.mutate({ ids: selectedIds, isActive: true })}>
            <CheckCircle className="h-4 w-4 mr-1" /> Activate All
          </Button>
          <Button size="sm" variant="destructive" onClick={() => {
            if (confirm(`Delete ${selectedIds.length} plans? This cannot be undone.`)) {
              bulkDeleteMutation.mutate(selectedIds);
            }
          }}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete All
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>Clear</Button>
        </div>
      )}

      <Card className="rounded-2xl border-none shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No plans found. Create your first plan to get started.</p>
            </div>
          ) : (
            <div className="divide-y">
              {bulkActionMode && filteredPlans.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 border-b">
                  <Checkbox 
                    checked={selectedIds.length === filteredPlans.length && filteredPlans.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">Select All</span>
                </div>
              )}
              {filteredPlans.map((plan: any) => (
                <div key={plan.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {bulkActionMode && (
                      <Checkbox 
                        checked={selectedIds.includes(plan.id)}
                        onCheckedChange={() => toggleSelect(plan.id)}
                      />
                    )}
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${plan.isActive !== false ? 'bg-teal-100' : 'bg-slate-100'}`}>
                      <FileText className={`h-5 w-5 ${plan.isActive !== false ? 'text-teal-600' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{plan.name}</p>
                        <Badge className={`${getCategoryColor(plan.planCategory)} border-none text-[10px] font-bold uppercase`}>
                          {(plan.planCategory || "").replace(/_/g, " ")}
                        </Badge>
                        {plan.isPopular && (
                          <Badge className="bg-amber-100 text-amber-700 border-none text-[10px]">POPULAR</Badge>
                        )}
                        {plan.isActive === false && (
                          <Badge variant="outline" className="text-red-600 border-red-200 text-[10px]">BLOCKED</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ₹{plan.price?.toLocaleString()} • Coverage: ₹{(plan.coverageAmount || 0).toLocaleString()} • {plan.maxMembers || 1} member{(plan.maxMembers || 1) > 1 ? "s" : ""} • {plan.validityDays || 365} days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      onClick={() => duplicatePlanMutation.mutate(plan)}
                      title="Duplicate Plan"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => openEditDialog(plan)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={plan.isActive !== false ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                      onClick={() => togglePlanStatus.mutate({ id: plan.id, isActive: plan.isActive === false })}
                    >
                      {plan.isActive !== false ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm(`Delete "${plan.name}"? This cannot be undone.`)) {
                          deletePlanMutation.mutate(plan.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function StaffManagerEnhanced() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkActionMode, setBulkActionMode] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "employee" as string,
    isBlocked: false
  });

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ["admin", "staff-list"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/staff-list");
      if (!res.ok) throw new Error("Failed to fetch staff");
      return res.json();
    }
  });

  const saveStaffMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editMode ? `/api/admin/staff/${selectedStaff.id}` : "/api/admin/create-staff";
      const res = await fetchWithCsrf(url, {
        method: editMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to save staff");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: `Staff ${editMode ? "updated" : "created"} successfully` });
      queryClient.invalidateQueries({ queryKey: ["admin", "staff-list"] });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: error.message, variant: "destructive" });
    }
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetchWithCsrf(`/api/admin/staff/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete staff");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Staff deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin", "staff-list"] });
    }
  });

  const toggleBlockMutation = useMutation({
    mutationFn: async ({ id, isBlocked }: { id: number; isBlocked: boolean }) => {
      const res = await fetchWithCsrf(`/api/admin/staff/${id}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked })
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({ title: variables.isBlocked ? "Staff blocked" : "Staff unblocked" });
      queryClient.invalidateQueries({ queryKey: ["admin", "staff-list"] });
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await fetchWithCsrf("/api/admin/staff/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids })
      });
      if (!res.ok) throw new Error("Failed to delete staff");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: `${selectedIds.length} staff members deleted` });
      setSelectedIds([]);
      setBulkActionMode(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "staff-list"] });
    }
  });

  const bulkBlockMutation = useMutation({
    mutationFn: async ({ ids, isBlocked }: { ids: number[]; isBlocked: boolean }) => {
      const res = await fetchWithCsrf("/api/admin/staff/bulk-block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, isBlocked })
      });
      if (!res.ok) throw new Error("Failed to update staff");
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({ title: `${selectedIds.length} staff ${variables.isBlocked ? "blocked" : "unblocked"}` });
      setSelectedIds([]);
      setBulkActionMode(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "staff-list"] });
    }
  });

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Mobile", "Role", "Status"];
    const rows = filteredStaff.map((s: any) => [
      s.name || "", s.email || "", s.mobile || "", s.role || "", s.isBlocked ? "Blocked" : "Active"
    ]);
    const csv = [headers.join(","), ...rows.map((r: any[]) => r.map((c: any) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staff_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast({ title: "Staff exported to CSV" });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStaff.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStaff.map((s: any) => s.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", mobile: "", password: "", role: "employee", isBlocked: false });
    setEditMode(false);
    setSelectedStaff(null);
    setDialogOpen(false);
  };

  const openEditDialog = (staff: any) => {
    setEditMode(true);
    setSelectedStaff(staff);
    setFormData({
      name: staff.name || "",
      email: staff.email || "",
      mobile: staff.mobile || "",
      password: "",
      role: staff.role || "employee",
      isBlocked: staff.isBlocked || false
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.mobile) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    if (!editMode && !formData.password) {
      toast({ title: "Password is required for new staff", variant: "destructive" });
      return;
    }
    saveStaffMutation.mutate(formData);
  };

  const filteredStaff = staffList.filter((staff: any) => {
    const matchesSearch = staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          staff.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || staff.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-blue-100 text-blue-700";
      case "super_admin": return "bg-red-100 text-red-700";
      case "agent": return "bg-green-100 text-green-700";
      case "employee": return "bg-orange-100 text-orange-700";
      case "marketing": return "bg-purple-100 text-purple-700";
      case "accountant": return "bg-teal-100 text-teal-700";
      case "support": return "bg-pink-100 text-pink-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Staff Management</h2>
          <p className="text-muted-foreground">Manage employees, agents, and team members - Add, Edit, Delete, Block</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-2" /> Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editMode ? "Edit Staff Member" : "Add New Staff"}</DialogTitle>
              <DialogDescription>Configure staff details and role</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label required>Full Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label required>Email Address</Label>
                <Input 
                  type="email"
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label required>Mobile Number</Label>
                <Input 
                  value={formData.mobile} 
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  placeholder="10-digit mobile number"
                />
              </div>
              <div className="space-y-2">
                <Label required={!editMode}>Password {editMode && "(leave blank to keep current)"}</Label>
                <Input 
                  type="password"
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div className="space-y-2">
                <Label required>Role</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saveStaffMutation.isPending}>
                {saveStaffMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {editMode ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search staff..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="accountant">Accountant</SelectItem>
            <SelectItem value="support">Support</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
        <Button 
          variant={bulkActionMode ? "default" : "outline"} 
          onClick={() => { setBulkActionMode(!bulkActionMode); setSelectedIds([]); }}
        >
          <CheckSquare className="h-4 w-4 mr-2" /> Bulk Actions
        </Button>
      </div>

      {bulkActionMode && selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-3 mb-4 bg-slate-100 rounded-xl">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <Button size="sm" variant="outline" onClick={() => bulkBlockMutation.mutate({ ids: selectedIds, isBlocked: true })}>
            <Ban className="h-4 w-4 mr-1" /> Block All
          </Button>
          <Button size="sm" variant="outline" onClick={() => bulkBlockMutation.mutate({ ids: selectedIds, isBlocked: false })}>
            <CheckCircle className="h-4 w-4 mr-1" /> Unblock All
          </Button>
          <Button size="sm" variant="destructive" onClick={() => {
            if (confirm(`Delete ${selectedIds.length} staff members? This cannot be undone.`)) {
              bulkDeleteMutation.mutate(selectedIds);
            }
          }}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete All
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>Clear</Button>
        </div>
      )}

      <Card className="rounded-2xl border-none shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No staff members found.</p>
            </div>
          ) : (
            <div className="divide-y">
              {bulkActionMode && filteredStaff.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 border-b">
                  <Checkbox 
                    checked={selectedIds.length === filteredStaff.length && filteredStaff.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">Select All</span>
                </div>
              )}
              {filteredStaff.map((staff: any) => (
                <div key={staff.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {bulkActionMode && (
                      <Checkbox 
                        checked={selectedIds.includes(staff.id)}
                        onCheckedChange={() => toggleSelect(staff.id)}
                      />
                    )}
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${staff.isBlocked ? 'bg-slate-400' : 'bg-teal-500'}`}>
                      {staff.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{staff.name}</p>
                        <Badge className={`${getRoleBadgeColor(staff.role)} border-none text-[10px] font-bold uppercase`}>
                          {staff.role}
                        </Badge>
                        {staff.isBlocked && (
                          <Badge variant="outline" className="text-red-600 border-red-200 text-[10px]">BLOCKED</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{staff.email} • {staff.mobile}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => openEditDialog(staff)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={!staff.isBlocked ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                      onClick={() => toggleBlockMutation.mutate({ id: staff.id, isBlocked: !staff.isBlocked })}
                    >
                      {!staff.isBlocked ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm(`Delete "${staff.name}"? This cannot be undone.`)) {
                          deleteStaffMutation.mutate(staff.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function PoliciesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    type: "terms",
    content: "",
    isActive: true,
    version: "1.0"
  });

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ["admin", "policies"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/policies");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const savePolicyMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editMode ? `/api/admin/policies/${selectedPolicy.id}` : "/api/admin/policies";
      const res = await fetchWithCsrf(url, {
        method: editMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to save policy");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: `Policy ${editMode ? "updated" : "created"} successfully` });
      queryClient.invalidateQueries({ queryKey: ["admin", "policies"] });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: error.message, variant: "destructive" });
    }
  });

  const deletePolicyMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetchWithCsrf(`/api/admin/policies/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Policy deleted" });
      queryClient.invalidateQueries({ queryKey: ["admin", "policies"] });
    }
  });

  const togglePolicyStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await fetchWithCsrf(`/api/admin/policies/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive })
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({ title: variables.isActive ? "Policy activated" : "Policy deactivated" });
      queryClient.invalidateQueries({ queryKey: ["admin", "policies"] });
    }
  });

  const resetForm = () => {
    setFormData({ title: "", type: "terms", content: "", isActive: true, version: "1.0" });
    setEditMode(false);
    setSelectedPolicy(null);
    setDialogOpen(false);
  };

  const openEditDialog = (policy: any) => {
    setEditMode(true);
    setSelectedPolicy(policy);
    setFormData({
      title: policy.title || "",
      type: policy.type || "terms",
      content: policy.content || "",
      isActive: policy.isActive !== false,
      version: policy.version || "1.0"
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    savePolicyMutation.mutate(formData);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "terms": return "bg-blue-100 text-blue-700";
      case "privacy": return "bg-green-100 text-green-700";
      case "refund": return "bg-orange-100 text-orange-700";
      case "disclaimer": return "bg-purple-100 text-purple-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Policy Management</h2>
          <p className="text-muted-foreground">Manage terms, privacy, refund policies - Add, Edit, Delete, Block</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-2" /> Add Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editMode ? "Edit Policy" : "Create Policy"}</DialogTitle>
              <DialogDescription>Configure policy details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label required>Policy Title</Label>
                  <Input 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Terms and Conditions"
                  />
                </div>
                <div className="space-y-2">
                  <Label required>Policy Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="terms">Terms & Conditions</SelectItem>
                      <SelectItem value="privacy">Privacy Policy</SelectItem>
                      <SelectItem value="refund">Refund Policy</SelectItem>
                      <SelectItem value="disclaimer">Disclaimer</SelectItem>
                      <SelectItem value="cancellation">Cancellation Policy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Version</Label>
                <Input 
                  value={formData.version} 
                  onChange={(e) => setFormData({...formData, version: e.target.value})}
                  placeholder="1.0"
                />
              </div>
              <div className="space-y-2">
                <Label required>Content</Label>
                <Textarea 
                  rows={10}
                  value={formData.content} 
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Enter policy content..."
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.isActive} 
                  onCheckedChange={(v) => setFormData({...formData, isActive: v})}
                />
                <Label>Policy is Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={savePolicyMutation.isPending}>
                {savePolicyMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {editMode ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-none shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : policies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No policies found. Create your first policy.</p>
            </div>
          ) : (
            <div className="divide-y">
              {policies.map((policy: any) => (
                <div key={policy.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${policy.isActive !== false ? 'bg-teal-100' : 'bg-slate-100'}`}>
                      <Shield className={`h-5 w-5 ${policy.isActive !== false ? 'text-teal-600' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{policy.title}</p>
                        <Badge className={`${getTypeColor(policy.type)} border-none text-[10px] font-bold uppercase`}>
                          {policy.type}
                        </Badge>
                        {policy.isActive === false && (
                          <Badge variant="outline" className="text-red-600 border-red-200 text-[10px]">INACTIVE</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Version {policy.version || "1.0"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => openEditDialog(policy)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={policy.isActive !== false ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                      onClick={() => togglePolicyStatus.mutate({ id: policy.id, isActive: policy.isActive === false })}
                    >
                      {policy.isActive !== false ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm(`Delete "${policy.title}"?`)) {
                          deletePolicyMutation.mutate(policy.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function RolesPermissionsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  
  const roles = [
    { id: "admin", label: "Admin", description: "Full system access except super admin features" },
    { id: "employee", label: "Employee", description: "Handle member requests and support" },
    { id: "agent", label: "Agent", description: "Register new members and earn commissions" },
    { id: "marketing", label: "Marketing", description: "Manage campaigns and promotions" },
    { id: "accountant", label: "Accountant", description: "Financial reports and payment tracking" },
    { id: "support", label: "Support", description: "Customer support and ticket handling" }
  ];

  const permissions = [
    { key: "viewUsers", label: "View Users", category: "Users" },
    { key: "manageUsers", label: "Manage Users", category: "Users" },
    { key: "viewMemberships", label: "View Memberships", category: "Memberships" },
    { key: "manageMemberships", label: "Manage Memberships", category: "Memberships" },
    { key: "viewPayments", label: "View Payments", category: "Financial" },
    { key: "viewPaymentReports", label: "View Payment Reports", category: "Financial" },
    { key: "viewEmergencyRequests", label: "View Emergency Requests", category: "Operations" },
    { key: "manageEmergencyRequests", label: "Manage Emergency Requests", category: "Operations" },
    { key: "viewAgents", label: "View Agents", category: "Agents" },
    { key: "manageAgents", label: "Manage Agents", category: "Agents" },
    { key: "viewHospitals", label: "View Hospitals", category: "Hospitals" },
    { key: "manageHospitals", label: "Manage Hospitals", category: "Hospitals" },
    { key: "viewAuditLogs", label: "View Audit Logs", category: "System" },
    { key: "viewSystemSettings", label: "View System Settings", category: "System" }
  ];

  const { data: rolePermissions = {}, isLoading } = useQuery({
    queryKey: ["admin", "role-permissions", selectedRole],
    queryFn: async () => {
      const res = await fetchWithCsrf(`/api/admin/role-permissions/${selectedRole}`);
      if (!res.ok) return {};
      return res.json();
    }
  });

  const updatePermissionMutation = useMutation({
    mutationFn: async ({ permission, enabled }: { permission: string; enabled: boolean }) => {
      const res = await fetchWithCsrf(`/api/admin/role-permissions/${selectedRole}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permission, enabled })
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Permission updated" });
      queryClient.invalidateQueries({ queryKey: ["admin", "role-permissions", selectedRole] });
    }
  });

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof permissions>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Roles & Permissions</h2>
        <p className="text-muted-foreground">Configure what each role can access and modify</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 rounded-2xl border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Select Role</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${
                    selectedRole === role.id ? 'bg-teal-50 border-l-4 border-teal-500' : ''
                  }`}
                >
                  <p className="font-semibold text-slate-900">{role.label}</p>
                  <p className="text-xs text-muted-foreground">{role.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 rounded-2xl border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">
              Permissions for {roles.find(r => r.id === selectedRole)?.label}
            </CardTitle>
            <CardDescription>Toggle permissions on/off for this role</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category}>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {perms.map((perm) => (
                        <div key={perm.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <span className="text-sm font-medium">{perm.label}</span>
                          <Switch
                            checked={rolePermissions[perm.key] || false}
                            onCheckedChange={(enabled) => 
                              updatePermissionMutation.mutate({ permission: perm.key, enabled })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ActivityLogsViewer() {
  const [filterAction, setFilterAction] = useState("all");
  const [filterEntity, setFilterEntity] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["admin", "activity-logs", filterAction, filterEntity],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterAction !== "all") params.append("action", filterAction);
      if (filterEntity !== "all") params.append("entity", filterEntity);
      const res = await fetchWithCsrf(`/api/admin/activity-logs?${params}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    }
  });

  const filteredLogs = logs.filter((log: any) => 
    log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.performedBy?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action: string) => {
    switch (action) {
      case "create": return "bg-green-100 text-green-700";
      case "update": return "bg-blue-100 text-blue-700";
      case "delete": return "bg-red-100 text-red-700";
      case "block": return "bg-orange-100 text-orange-700";
      case "unblock": return "bg-teal-100 text-teal-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const exportLogs = () => {
    const headers = ["Date", "Action", "Entity", "Details", "Performed By", "IP Address"];
    const rows = filteredLogs.map((log: any) => [
      new Date(log.createdAt).toLocaleString(),
      log.action,
      log.entityType,
      log.details || "",
      log.performedBy || "",
      log.ipAddress || ""
    ]);
    const csv = [headers.join(","), ...rows.map((r: any[]) => r.map((c: any) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity_logs_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Activity Logs</h2>
          <p className="text-muted-foreground">Track all administrative actions and changes</p>
        </div>
        <Button variant="outline" onClick={exportLogs}>
          <Download className="h-4 w-4 mr-2" /> Export Logs
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search logs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="block">Block</SelectItem>
            <SelectItem value="unblock">Unblock</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterEntity} onValueChange={setFilterEntity}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Entities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            <SelectItem value="plan">Plans</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="franchise">Franchise</SelectItem>
            <SelectItem value="policy">Policies</SelectItem>
            <SelectItem value="permission">Permissions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="rounded-2xl border-none shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No activity logs found.</p>
            </div>
          ) : (
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {filteredLogs.map((log: any) => (
                <div key={log.id} className="flex items-start justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <History className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${getActionColor(log.action)} border-none text-[10px] font-bold uppercase`}>
                          {log.action}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{log.entityType}</Badge>
                      </div>
                      <p className="font-medium text-slate-900">{log.details}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        By: {log.performedBy || "System"} • {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
