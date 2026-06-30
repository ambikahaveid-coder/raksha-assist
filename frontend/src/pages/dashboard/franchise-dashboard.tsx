import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { fetchWithCsrf } from "@/lib/csrf";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, MapPin, Users, IndianRupee, TrendingUp, 
  Plus, ChevronRight, Network, Globe, Building, Home,
  Percent, FileText, CreditCard, BarChart3, MoreVertical,
  Power, PowerOff, Ban, Trash2, Edit, CheckCircle, XCircle,
  Download, Printer, ChevronUp, ChevronDown
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Zone {
  id: string;
  zoneCode: string;
  name: string;
  states: string[];
  ownerName: string;
  ownerMobile: string;
  totalAgents: number;
  totalMembers: number;
  achievedRevenue: number;
  commissionRate: number;
  status: string;
}

interface State {
  id: string;
  stateCode: string;
  name: string;
  stateName: string;
  zoneId: string;
  ownerName: string;
  totalAgents: number;
  totalMembers: number;
  commissionRate: number;
  status: string;
}

interface District {
  id: string;
  districtCode: string;
  name: string;
  districtName: string;
  stateId: string;
  ownerName: string;
  totalAgents: number;
  totalMembers: number;
  commissionRate: number;
  status: string;
}

interface City {
  id: string;
  cityCode: string;
  name: string;
  cityName: string;
  districtId: string;
  ownerName: string;
  totalAgents: number;
  totalMembers: number;
  commissionRate: number;
  status: string;
}

interface DashboardStats {
  zones: number;
  states: number;
  districts: number;
  cities: number;
  totalAgents: number;
  totalMembers: number;
  totalRevenue: number;
  commissionDistribution: {
    agent: number;
    city: number;
    district: number;
    state: number;
    zone: number;
    superAdmin: number;
  };
}

export default function FranchiseDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const franchiseRoles = ["super_admin", "admin", "zone_franchise", "state_franchise", "district_franchise", "city_franchise"];
  
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<"zone" | "state" | "district" | "city">("zone");
  const [formData, setFormData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editItem, setEditItem] = useState<{ type: string; item: any } | null>(null);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const invalidateAllFranchiseQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/franchise/zones"] });
    queryClient.invalidateQueries({ queryKey: ["/api/franchise/states"] });
    queryClient.invalidateQueries({ queryKey: ["/api/franchise/districts"] });
    queryClient.invalidateQueries({ queryKey: ["/api/franchise/cities"] });
    queryClient.invalidateQueries({ queryKey: ["/api/franchise/hierarchy"] });
    queryClient.invalidateQueries({ queryKey: ["/api/franchise/dashboard/stats"] });
  };

  const statusMutation = useMutation({
    mutationFn: async (data: { type: string; id: string; status: string }) => {
      const res = await fetchWithCsrf(`/api/franchise/${data.type}s/${data.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: data.status }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      invalidateAllFranchiseQueries();
      toast({ title: "Status updated successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (data: { type: string; id: string }) => {
      const res = await fetchWithCsrf(`/api/franchise/${data.type}s/${data.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      invalidateAllFranchiseQueries();
      toast({ title: "Franchise deleted successfully" });
      setDeleteConfirm(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleStatusChange = (type: string, id: string, status: string) => {
    statusMutation.mutate({ type, id, status });
  };

  const handleDelete = (type: string, id: string) => {
    deleteMutation.mutate({ type, id });
  };

  const bulkMutation = useMutation({
    mutationFn: async (data: { type: string; ids: string[]; action: "delete" | "block" | "unblock" }) => {
      const res = await fetchWithCsrf(`/api/franchise/${data.type}s/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: data.ids, action: data.action }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (_, variables) => {
      invalidateAllFranchiseQueries();
      toast({ title: `Bulk ${variables.action} completed for ${variables.ids.length} items` });
      clearSelection(variables.type);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleBulkAction = (type: string, action: "delete" | "block" | "unblock") => {
    const selected = type === "zone" ? selectedZones : type === "state" ? selectedStates : type === "district" ? selectedDistricts : selectedCities;
    if (selected.length === 0) {
      toast({ title: "No items selected", variant: "destructive" });
      return;
    }
    bulkMutation.mutate({ type, ids: selected, action });
  };

  const updateMutation = useMutation({
    mutationFn: async (data: { type: string; id: string; payload: any }) => {
      const res = await fetchWithCsrf(`/api/franchise/${data.type}s/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.payload),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      invalidateAllFranchiseQueries();
      toast({ title: "Updated successfully" });
      setEditMode(false);
      setEditItem(null);
      setFormData({});
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const openEditDialog = (type: string, item: any) => {
    setEditItem({ type, item });
    setEditMode(true);
    setCreateType(type as any);
    setFormData({
      code: item[`${type}Code`] || item.code,
      name: item.name,
      regionName: item[`${type}Name`] || item.name,
      description: item.description || "",
      ownerName: item.ownerName || "",
      ownerMobile: item.ownerMobile || "",
      ownerEmail: item.ownerEmail || "",
      commissionRate: item.commissionRate?.toString() || getDefaultRate(type).toString(),
      zoneId: item.zoneId || "",
      stateId: item.stateId || "",
      districtId: item.districtId || ""
    });
    setIsCreateDialogOpen(true);
  };

  const clearSelection = (type: string) => {
    if (type === "zone") setSelectedZones([]);
    else if (type === "state") setSelectedStates([]);
    else if (type === "district") setSelectedDistricts([]);
    else if (type === "city") setSelectedCities([]);
  };

  const toggleSelection = (type: string, id: string) => {
    const setFn = type === "zone" ? setSelectedZones : type === "state" ? setSelectedStates : type === "district" ? setSelectedDistricts : setSelectedCities;
    const current = type === "zone" ? selectedZones : type === "state" ? selectedStates : type === "district" ? selectedDistricts : selectedCities;
    setFn(current.includes(id) ? current.filter(i => i !== id) : [...current, id]);
  };

  const selectAll = (type: string, items: any[]) => {
    const ids = items.map(i => i.id);
    if (type === "zone") setSelectedZones(ids);
    else if (type === "state") setSelectedStates(ids);
    else if (type === "district") setSelectedDistricts(ids);
    else setSelectedCities(ids);
  };

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(","),
      ...data.map(item => headers.map(h => JSON.stringify(item[h] ?? "")).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortData = <T extends Record<string, any>>(data: T[]): T[] => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      const cmp = aVal < bVal ? -1 : 1;
      return sortDir === "asc" ? cmp : -cmp;
    });
  };

  const handleUpdate = () => {
    if (!editItem) return;
    const { type, item } = editItem;
    const codeField = `${type}Code`;
    const nameField = `${type}Name`;
    
    const payload = {
      [codeField]: formData.code,
      name: formData.name,
      [nameField]: formData.regionName || formData.name,
      description: formData.description,
      ownerName: formData.ownerName,
      ownerMobile: formData.ownerMobile,
      ownerEmail: formData.ownerEmail,
      commissionRate: parseInt(formData.commissionRate) || getDefaultRate(type),
    };

    updateMutation.mutate({ type, id: item.id, payload });
  };

  const BulkActionsBar = ({ type, selectedCount, items, onSelectAll, onClear, onBulk }: { type: string; selectedCount: number; items: any[]; onSelectAll: () => void; onClear: () => void; onBulk: (action: "delete" | "block" | "unblock") => void }) => {
    if (items.length === 0) return null;
    return (
      <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg border">
        <Checkbox
          checked={selectedCount === items.length && items.length > 0}
          onCheckedChange={(checked) => checked ? onSelectAll() : onClear()}
        />
        <span className="text-sm text-muted-foreground">
          {selectedCount > 0 ? `${selectedCount} selected` : "Select all"}
        </span>
        {selectedCount > 0 && (
          <>
            <Button variant="outline" size="sm" onClick={() => onBulk("block")} className="gap-1 text-orange-600">
              <Ban className="h-3 w-3" /> Block
            </Button>
            <Button variant="outline" size="sm" onClick={() => onBulk("unblock")} className="gap-1 text-green-600">
              <Power className="h-3 w-3" /> Unblock
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onBulk("delete")} className="gap-1">
              <Trash2 className="h-3 w-3" /> Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={onClear}>Clear</Button>
          </>
        )}
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={() => exportToCSV(items, `${type}s`, Object.keys(items[0] || {}))} className="gap-1">
            <Download className="h-3 w-3" /> Export
          </Button>
        </div>
      </div>
    );
  };

  const FranchiseActions = ({ type, item }: { type: string; item: any }) => {
    if (item.status === "deleted") {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-600">Deleted</Badge>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => openEditDialog(type, item)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {item.status === "active" ? (
            <DropdownMenuItem onClick={() => handleStatusChange(type, item.id, "inactive")}>
              <PowerOff className="mr-2 h-4 w-4" />
              Deactivate
            </DropdownMenuItem>
          ) : item.status !== "blocked" && item.status !== "suspended" ? (
            <DropdownMenuItem onClick={() => handleStatusChange(type, item.id, "active")}>
              <Power className="mr-2 h-4 w-4" />
              Activate
            </DropdownMenuItem>
          ) : null}
          {item.status === "blocked" ? (
            <DropdownMenuItem onClick={() => handleStatusChange(type, item.id, "active")}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Unblock
            </DropdownMenuItem>
          ) : item.status !== "suspended" ? (
            <DropdownMenuItem onClick={() => handleStatusChange(type, item.id, "blocked")} className="text-orange-600">
              <Ban className="mr-2 h-4 w-4" />
              Block
            </DropdownMenuItem>
          ) : null}
          {item.status === "suspended" && (
            <DropdownMenuItem onClick={() => handleStatusChange(type, item.id, "active")}>
              <Power className="mr-2 h-4 w-4" />
              Unsuspend
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setDeleteConfirm({ type, id: item.id, name: item.name })}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/franchise/dashboard/stats"],
  });

  const { data: zones = [] } = useQuery<Zone[]>({
    queryKey: ["/api/franchise/zones"],
  });

  const { data: states = [] } = useQuery<State[]>({
    queryKey: ["/api/franchise/states"],
  });

  const { data: districts = [] } = useQuery<District[]>({
    queryKey: ["/api/franchise/districts"],
  });

  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ["/api/franchise/cities"],
  });

  const { data: hierarchy = [] } = useQuery<any[]>({
    queryKey: ["/api/franchise/hierarchy"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { type: string; payload: any }) => {
      const res = await fetchWithCsrf(`/api/franchise/${data.type}s`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.payload),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      invalidateAllFranchiseQueries();
      toast({ title: "Created successfully" });
      setIsCreateDialogOpen(false);
      setFormData({});
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleCreate = () => {
    const codeField = `${createType}Code`;
    const nameField = `${createType}Name`;
    
    const payload = {
      [codeField]: formData.code,
      name: formData.name,
      [nameField]: formData.regionName || formData.name,
      description: formData.description,
      ownerName: formData.ownerName,
      ownerMobile: formData.ownerMobile,
      ownerEmail: formData.ownerEmail,
      commissionRate: parseInt(formData.commissionRate) || getDefaultRate(createType),
    };

    if (createType === "state" && formData.zoneId) {
      (payload as any).zoneId = formData.zoneId;
    }
    if (createType === "district" && formData.stateId) {
      (payload as any).stateId = formData.stateId;
    }
    if (createType === "city" && formData.districtId) {
      (payload as any).districtId = formData.districtId;
    }

    createMutation.mutate({ type: createType, payload });
  };

  const getDefaultRate = (type: string) => {
    const rates: Record<string, number> = { zone: 3, state: 4, district: 5, city: 6 };
    return rates[type] || 5;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      inactive: "secondary",
      suspended: "destructive",
      blocked: "destructive",
      deleted: "destructive",
      pending_approval: "outline",
    };
    const colors: Record<string, string> = {
      blocked: "bg-orange-100 text-orange-700 border-orange-200",
      deleted: "bg-red-100 text-red-700 border-red-200",
    };
    return (
      <Badge 
        variant={variants[status] || "outline"} 
        className={colors[status] || ""}
      >
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Franchise Management</h1>
          <p className="text-muted-foreground">Multi-tier franchise network administration</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { 
          setIsCreateDialogOpen(open); 
          if (!open) { setEditMode(false); setEditItem(null); setFormData({}); }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Franchise
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editMode ? "Edit Franchise" : "Create New Franchise"}</DialogTitle>
              <DialogDescription>{editMode ? "Update franchise details" : "Add a new franchise to the network"}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Franchise Type</Label>
                <Select value={createType} onValueChange={(v: any) => setCreateType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zone">Zone (Regional)</SelectItem>
                    <SelectItem value="state">State</SelectItem>
                    <SelectItem value="district">District</SelectItem>
                    <SelectItem value="city">City</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {createType === "state" && (
                <div>
                  <Label>Parent Zone</Label>
                  <Select value={formData.zoneId || ""} onValueChange={(v) => setFormData({ ...formData, zoneId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((z) => (
                        <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {createType === "district" && (
                <div>
                  <Label>Parent State</Label>
                  <Select value={formData.stateId || ""} onValueChange={(v) => setFormData({ ...formData, stateId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {createType === "city" && (
                <div>
                  <Label>Parent District</Label>
                  <Select value={formData.districtId || ""} onValueChange={(v) => setFormData({ ...formData, districtId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Code</Label>
                  <Input 
                    placeholder={`e.g., ${createType.toUpperCase()}_SOUTH`}
                    value={formData.code || ""}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Franchise Name</Label>
                  <Input 
                    placeholder="Display name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Region/Area Name</Label>
                  <Input 
                    placeholder={`${createType} name`}
                    value={formData.regionName || ""}
                    onChange={(e) => setFormData({ ...formData, regionName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Commission Rate (%)</Label>
                  <Input 
                    type="number"
                    placeholder={`${getDefaultRate(createType)}%`}
                    value={formData.commissionRate || ""}
                    onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Owner Name</Label>
                  <Input 
                    placeholder="Franchise owner"
                    value={formData.ownerName || ""}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Owner Mobile</Label>
                  <Input 
                    placeholder="+91 XXXXXXXXXX"
                    value={formData.ownerMobile || ""}
                    onChange={(e) => setFormData({ ...formData, ownerMobile: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Owner Email</Label>
                <Input 
                  type="email"
                  placeholder="owner@email.com"
                  value={formData.ownerEmail || ""}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input 
                  placeholder="Brief description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <Button 
                onClick={editMode ? handleUpdate : handleCreate} 
                className="w-full"
                disabled={editMode ? updateMutation.isPending : createMutation.isPending}
              >
                {editMode 
                  ? (updateMutation.isPending ? "Updating..." : "Update Franchise")
                  : (createMutation.isPending ? "Creating..." : "Create Franchise")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Zones</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.zones || zones.length}</div>
            <p className="text-xs text-muted-foreground">Regional franchises</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">States</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.states || states.length}</div>
            <p className="text-xs text-muted-foreground">State franchises</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Districts</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.districts || districts.length}</div>
            <p className="text-xs text-muted-foreground">District franchises</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cities</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.cities || cities.length}</div>
            <p className="text-xs text-muted-foreground">City franchises</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAgents || 0}</div>
            <p className="text-xs text-muted-foreground">Across all franchises</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMembers || 0}</div>
            <p className="text-xs text-muted-foreground">Active memberships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{((stats?.totalRevenue || 0) / 100).toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Commission Distribution Structure
          </CardTitle>
          <CardDescription>
            How each sale is distributed across the franchise network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {stats?.commissionDistribution?.agent || 15}%
              </div>
              <div className="text-sm text-green-600">Agent</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">
                {stats?.commissionDistribution?.city || 6}%
              </div>
              <div className="text-sm text-blue-600">City Franchise</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">
                {stats?.commissionDistribution?.district || 5}%
              </div>
              <div className="text-sm text-purple-600">District Franchise</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">
                {stats?.commissionDistribution?.state || 4}%
              </div>
              <div className="text-sm text-orange-600">State Franchise</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-700">
                {stats?.commissionDistribution?.zone || 3}%
              </div>
              <div className="text-sm text-red-600">Zone Franchise</div>
            </div>
            <div className="text-center p-4 bg-slate-100 rounded-lg border border-slate-300">
              <div className="text-2xl font-bold text-slate-700">
                {stats?.commissionDistribution?.superAdmin || 67}%
              </div>
              <div className="text-sm text-slate-600">Super Admin</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="zones">Zones</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
          <TabsTrigger value="districts">Districts</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Franchise Network Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hierarchy.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No franchises created yet. Click "Add Franchise" to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {hierarchy.map((zone: any) => (
                    <div key={zone.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-5 w-5 text-primary" />
                        <span className="font-semibold">{zone.name}</span>
                        {getStatusBadge(zone.status)}
                        <span className="text-sm text-muted-foreground ml-auto">
                          {zone.commissionRate}% commission
                        </span>
                      </div>
                      {zone.children?.map((state: any) => (
                        <div key={state.id} className="ml-6 mt-2 border-l-2 pl-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="h-4 w-4 text-blue-500" />
                            <span>{state.name}</span>
                            <span className="text-sm text-muted-foreground ml-auto">
                              {state.commissionRate}%
                            </span>
                          </div>
                          {state.children?.map((district: any) => (
                            <div key={district.id} className="ml-6 mt-1 border-l pl-4">
                              <div className="flex items-center gap-2 mb-1">
                                <Building className="h-4 w-4 text-purple-500" />
                                <span className="text-sm">{district.name}</span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {district.commissionRate}%
                                </span>
                              </div>
                              {district.children?.map((city: any) => (
                                <div key={city.id} className="ml-6 mt-1 border-l pl-4">
                                  <div className="flex items-center gap-2">
                                    <Home className="h-3 w-3 text-orange-500" />
                                    <span className="text-sm">{city.name}</span>
                                    <span className="text-xs text-muted-foreground ml-auto">
                                      {city.commissionRate}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones">
          <Card>
            <CardHeader>
              <CardTitle>Zone Franchises</CardTitle>
              <CardDescription>Regional franchise partners (Top level)</CardDescription>
            </CardHeader>
            <CardContent>
              <BulkActionsBar
                type="zone"
                selectedCount={selectedZones.length}
                items={zones}
                onSelectAll={() => selectAll("zone", zones)}
                onClear={() => clearSelection("zone")}
                onBulk={(action) => handleBulkAction("zone", action)}
              />
              <div className="space-y-4">
                {zones.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No zones created yet</p>
                ) : (
                  zones.map((zone) => (
                    <div key={zone.id} className="flex items-center gap-3 p-4 border rounded-lg">
                      <Checkbox
                        checked={selectedZones.includes(zone.id)}
                        onCheckedChange={() => toggleSelection("zone", zone.id)}
                      />
                      <div className="flex-1">
                        <div className="font-semibold">{zone.name}</div>
                        <div className="text-sm text-muted-foreground">Code: {zone.zoneCode}</div>
                        <div className="text-sm">Owner: {zone.ownerName || "Not assigned"}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          {getStatusBadge(zone.status)}
                          <div className="text-sm text-muted-foreground mt-1">
                            {zone.commissionRate}% commission
                          </div>
                          <div className="text-sm">
                            {zone.totalAgents || 0} agents | {zone.totalMembers || 0} members
                          </div>
                        </div>
                        <FranchiseActions type="zone" item={zone} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="states">
          <Card>
            <CardHeader>
              <CardTitle>State Franchises</CardTitle>
              <CardDescription>State-level franchise partners</CardDescription>
            </CardHeader>
            <CardContent>
              <BulkActionsBar
                type="state"
                selectedCount={selectedStates.length}
                items={states}
                onSelectAll={() => selectAll("state", states)}
                onClear={() => clearSelection("state")}
                onBulk={(action) => handleBulkAction("state", action)}
              />
              <div className="space-y-4">
                {states.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No states created yet</p>
                ) : (
                  states.map((state) => (
                    <div key={state.id} className="flex items-center gap-3 p-4 border rounded-lg">
                      <Checkbox
                        checked={selectedStates.includes(state.id)}
                        onCheckedChange={() => toggleSelection("state", state.id)}
                      />
                      <div className="flex-1">
                        <div className="font-semibold">{state.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Code: {state.stateCode} | State: {state.stateName}
                        </div>
                        <div className="text-sm">Owner: {state.ownerName || "Not assigned"}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          {getStatusBadge(state.status)}
                          <div className="text-sm text-muted-foreground mt-1">
                            {state.commissionRate}% commission
                          </div>
                        </div>
                        <FranchiseActions type="state" item={state} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="districts">
          <Card>
            <CardHeader>
              <CardTitle>District Franchises</CardTitle>
              <CardDescription>District-level franchise partners</CardDescription>
            </CardHeader>
            <CardContent>
              <BulkActionsBar
                type="district"
                selectedCount={selectedDistricts.length}
                items={districts}
                onSelectAll={() => selectAll("district", districts)}
                onClear={() => clearSelection("district")}
                onBulk={(action) => handleBulkAction("district", action)}
              />
              <div className="space-y-4">
                {districts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No districts created yet</p>
                ) : (
                  districts.map((district) => (
                    <div key={district.id} className="flex items-center gap-3 p-4 border rounded-lg">
                      <Checkbox
                        checked={selectedDistricts.includes(district.id)}
                        onCheckedChange={() => toggleSelection("district", district.id)}
                      />
                      <div className="flex-1">
                        <div className="font-semibold">{district.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Code: {district.districtCode} | District: {district.districtName}
                        </div>
                        <div className="text-sm">Owner: {district.ownerName || "Not assigned"}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          {getStatusBadge(district.status)}
                          <div className="text-sm text-muted-foreground mt-1">
                            {district.commissionRate}% commission
                          </div>
                        </div>
                        <FranchiseActions type="district" item={district} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cities">
          <Card>
            <CardHeader>
              <CardTitle>City Franchises</CardTitle>
              <CardDescription>City-level franchise partners (Ground level)</CardDescription>
            </CardHeader>
            <CardContent>
              <BulkActionsBar
                type="city"
                selectedCount={selectedCities.length}
                items={cities}
                onSelectAll={() => selectAll("city", cities)}
                onClear={() => clearSelection("city")}
                onBulk={(action) => handleBulkAction("city", action)}
              />
              <div className="space-y-4">
                {cities.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No cities created yet</p>
                ) : (
                  cities.map((city) => (
                    <div key={city.id} className="flex items-center gap-3 p-4 border rounded-lg">
                      <Checkbox
                        checked={selectedCities.includes(city.id)}
                        onCheckedChange={() => toggleSelection("city", city.id)}
                      />
                      <div className="flex-1">
                        <div className="font-semibold">{city.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Code: {city.cityCode} | City: {city.cityName}
                        </div>
                        <div className="text-sm">Owner: {city.ownerName || "Not assigned"}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          {getStatusBadge(city.status)}
                          <div className="text-sm text-muted-foreground mt-1">
                            {city.commissionRate}% commission
                          </div>
                        </div>
                        <FranchiseActions type="city" item={city} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Franchise Policies & Guidelines
              </CardTitle>
              <CardDescription>Operating policies, commission rules, and compliance guidelines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-blue-800">Commission Policy</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-blue-700 space-y-2">
                      <p><strong>Agent:</strong> 15% of membership fee</p>
                      <p><strong>City Franchise:</strong> 6% of membership fee</p>
                      <p><strong>District Franchise:</strong> 5% of membership fee</p>
                      <p><strong>State Franchise:</strong> 4% of membership fee</p>
                      <p><strong>Zone Franchise:</strong> 3% of membership fee</p>
                      <p><strong>Super Admin:</strong> 67% of membership fee</p>
                      <div className="pt-2 border-t border-blue-300 mt-2">
                        <strong>Total: 100%</strong>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-green-800">Payout Policy</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-green-700 space-y-2">
                      <p><strong>Payout Cycle:</strong> Monthly (1st to 5th)</p>
                      <p><strong>Minimum Payout:</strong> ₹500</p>
                      <p><strong>Payment Mode:</strong> Bank Transfer (NEFT/IMPS)</p>
                      <p><strong>TDS Deduction:</strong> As per Income Tax rules</p>
                      <p><strong>Invoice Required:</strong> Yes, for amounts above ₹10,000</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-purple-800">Franchise Eligibility</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-purple-700 space-y-2">
                      <p><strong>Age:</strong> 21 years and above</p>
                      <p><strong>ID Proof:</strong> Aadhar Card, PAN Card mandatory</p>
                      <p><strong>Bank Account:</strong> Active savings/current account</p>
                      <p><strong>Background Check:</strong> Required for all levels</p>
                      <p><strong>Security Deposit:</strong> As per franchise level</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-orange-50 border-orange-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-orange-800">Termination Policy</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-orange-700 space-y-2">
                      <p><strong>Notice Period:</strong> 30 days written notice</p>
                      <p><strong>Settlement:</strong> Within 45 days of termination</p>
                      <p><strong>Data Handover:</strong> All member data to be transferred</p>
                      <p><strong>Non-Compete:</strong> 6 months in same geography</p>
                      <p><strong>Disputes:</strong> Subject to Bengaluru, Karnataka jurisdiction</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-50 border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-slate-800">Compliance Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-700">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="font-semibold mb-2">Monthly Requirements</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Minimum 5 new members</li>
                          <li>Member retention &gt; 80%</li>
                          <li>Timely report submission</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold mb-2">Documentation</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>GST registration (if applicable)</li>
                          <li>Updated KYC documents</li>
                          <li>Valid PAN card</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold mb-2">Prohibited Activities</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>False claims to members</li>
                          <li>Unauthorized discounts</li>
                          <li>Data sharing with third parties</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-teal-50 border-teal-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-teal-800 flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Download Policy Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-teal-700">
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        variant="outline"
                        className="border-teal-300 text-teal-700 hover:bg-teal-100"
                        onClick={() => window.open('/franchise-terms', '_blank')}
                      >
                        <FileText className="mr-2 h-4 w-4" /> View Franchise Terms
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-teal-300 text-teal-700 hover:bg-teal-100"
                        onClick={() => window.open('/api/policies/franchise_terms/pdf', '_blank')}
                      >
                        <Download className="mr-2 h-4 w-4" /> Download Franchise Terms PDF
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-teal-300 text-teal-700 hover:bg-teal-100"
                        onClick={() => window.open('/agent-terms', '_blank')}
                      >
                        <FileText className="mr-2 h-4 w-4" /> View Agent Terms
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-teal-300 text-teal-700 hover:bg-teal-100"
                        onClick={() => window.open('/api/policies/agent_terms/pdf', '_blank')}
                      >
                        <Download className="mr-2 h-4 w-4" /> Download Agent Terms PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Franchise</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
              The franchise will be marked as deleted and won't appear in active listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteConfirm && handleDelete(deleteConfirm.type, deleteConfirm.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </div>
      </main>
      <Footer />
    </div>
  );
}
