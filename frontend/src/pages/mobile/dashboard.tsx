import { useState } from "react";
import { fetchWithCsrf, clearAuthToken } from "@/lib/csrf";
import { useQuery } from "@tanstack/react-query";
import { 
  Shield, Home, Bell, CreditCard, Activity, Plus, Users, UserPlus, Wallet,
  Bike, Car, Truck, Building2, Store, Plane, ChevronRight, Gift, Star, Phone,
  MapPin, CheckCircle, AlertCircle, Loader2, FileText, Clock, LogOut, User,
  History, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import logoImg from "@/assets/logo.png";

const PLAN_CATEGORIES = [
  { id: "medical", name: "Medical", icon: Activity, color: "bg-red-500" },
  { id: "two_wheeler", name: "Bike", icon: Bike, color: "bg-blue-500" },
  { id: "car", name: "Car", icon: Car, color: "bg-purple-500" },
  { id: "commercial_vehicle", name: "Fleet", icon: Truck, color: "bg-orange-500" },
  { id: "home", name: "Home", icon: Building2, color: "bg-green-500" },
  { id: "business", name: "Business", icon: Store, color: "bg-amber-500" },
  { id: "travel", name: "Travel", icon: Plane, color: "bg-cyan-500" },
];

export default function MobileDashboard() {
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "plans" | "addons" | "card" | "profile">("home");
  const { user, membership, isLoading: authLoading, isAuthenticated } = useAuth();

  const { data: plans = [] } = useQuery({
    queryKey: ["mobile-plans"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/plans");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const { data: addOns = [] } = useQuery({
    queryKey: ["mobile-addons"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/add-on-benefits");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const { data: myAddOns = [] } = useQuery({
    queryKey: ["myAddOns"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/user/my-add-ons");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: emergencyRequests = [] } = useQuery({
    queryKey: ["emergencyRequests"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/emergency-requests");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const featuredPlans = plans.filter((p: any) => p.isPopular || p.isFeatured).slice(0, 4);
  const featuredAddOns = addOns.filter((a: any) => a.isActive).slice(0, 4);

  const handleLogout = async () => {
    try {
      await fetchWithCsrf("/api/auth/logout", { method: "POST" });
    } catch {}
    clearAuthToken();
    window.location.href = "/login";
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-200 p-4">
      <div className="w-[375px] h-[812px] bg-white rounded-[40px] shadow-2xl overflow-hidden relative border-[8px] border-slate-900 flex flex-col">
        
        <div className="h-10 bg-white flex items-center justify-between px-8 pt-2">
          <span className="text-xs font-bold">9:41</span>
          <div className="flex gap-1.5 items-center">
            <div className="w-4 h-2.5 bg-slate-900 rounded-sm"></div>
            <div className="w-3 h-3 bg-slate-900 rounded-full"></div>
          </div>
        </div>

        <div className="px-6 py-4 flex items-center justify-between">
          <img src={logoImg} alt="Logo" className="h-8 w-auto" />
          <div className="flex gap-3 items-center">
            {isAuthenticated && user?.role === "agent" && (
              <div className="flex items-center gap-2">
                <Label htmlFor="mode-switch" className="text-[10px] font-bold text-slate-400">
                  {isAgentMode ? "AGENT" : "USER"}
                </Label>
                <Switch 
                  id="mode-switch" 
                  checked={isAgentMode} 
                  onCheckedChange={setIsAgentMode} 
                  className="scale-75"
                />
              </div>
            )}
            <div className="relative">
              <Bell className="h-6 w-6 text-slate-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-white"></span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-20">
          {authLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !isAuthenticated ? (
            <LoginPromptView />
          ) : isAgentMode && user?.role === "agent" ? (
            <AgentView />
          ) : (
            <>
              {activeTab === "home" && (
                <UserHomeView 
                  user={user}
                  membership={membership}
                  featuredPlans={featuredPlans} 
                  featuredAddOns={featuredAddOns}
                  myAddOns={myAddOns}
                  emergencyRequests={emergencyRequests}
                  onViewPlans={() => setActiveTab("plans")}
                  onViewAddOns={() => setActiveTab("addons")}
                />
              )}
              {activeTab === "plans" && <PlansView plans={plans} />}
              {activeTab === "addons" && <AddOnsView addOns={addOns} />}
              {activeTab === "card" && <CardView user={user} membership={membership} />}
              {activeTab === "profile" && <ProfileView user={user} membership={membership} onLogout={handleLogout} />}
            </>
          )}
        </div>

        {isAuthenticated && (
          <div className="h-20 bg-white border-t flex items-center justify-around px-4 pb-4">
            <button onClick={() => setActiveTab("home")} className="flex flex-col items-center gap-1">
              <Home className={`h-5 w-5 ${activeTab === "home" ? 'text-primary' : 'text-slate-300'}`} />
              <span className={`text-[10px] ${activeTab === "home" ? 'text-primary font-bold' : 'text-slate-400'}`}>Home</span>
            </button>
            <button onClick={() => setActiveTab("plans")} className="flex flex-col items-center gap-1">
              <Shield className={`h-5 w-5 ${activeTab === "plans" ? 'text-primary' : 'text-slate-300'}`} />
              <span className={`text-[10px] ${activeTab === "plans" ? 'text-primary font-bold' : 'text-slate-400'}`}>Plans</span>
            </button>
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg -mt-8 border-4 border-white ${isAgentMode ? 'bg-slate-900 shadow-slate-900/30' : 'bg-red-500 shadow-red-500/30'}`}>
              <Phone className="h-6 w-6" />
            </div>
            <button onClick={() => setActiveTab("addons")} className="flex flex-col items-center gap-1">
              <Gift className={`h-5 w-5 ${activeTab === "addons" ? 'text-primary' : 'text-slate-300'}`} />
              <span className={`text-[10px] ${activeTab === "addons" ? 'text-primary font-bold' : 'text-slate-400'}`}>Add-ons</span>
            </button>
            <button onClick={() => setActiveTab("profile")} className="flex flex-col items-center gap-1">
              <User className={`h-5 w-5 ${activeTab === "profile" ? 'text-primary' : 'text-slate-300'}`} />
              <span className={`text-[10px] ${activeTab === "profile" ? 'text-primary font-bold' : 'text-slate-400'}`}>Profile</span>
            </button>
          </div>
        )}

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900 rounded-full opacity-20"></div>
      </div>
    </div>
  );
}

function LoginPromptView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Shield className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">Welcome to Raksha Assist</h1>
      <p className="text-slate-400 text-sm mb-6">Login to access your membership and emergency services</p>
      <Button className="w-full" onClick={() => window.location.href = "/login"}>
        Login / Register
      </Button>
    </div>
  );
}

function UserHomeView({ user, membership, featuredPlans, featuredAddOns, myAddOns, emergencyRequests, onViewPlans, onViewAddOns }: any) {
  const planName = membership?.planType === "family" ? "Family Assist" : "Individual Assist";
  const coverageAmount = membership?.coverageAmount || 300000;
  const membershipNumber = membership?.membershipNumber || "Pending";
  const isActive = membership?.status === "active";
  const validUntil = membership?.expiryDate ? new Date(membership.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : "Dec 2026";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hello, {user?.name?.split(' ')[0] || "Member"}</h1>
        <p className="text-slate-400 text-sm">
          {isActive ? "Your protection is active" : "Complete your membership"}
        </p>
      </div>

      <div className={`${isActive ? 'bg-primary' : 'bg-slate-400'} rounded-3xl p-5 text-white relative overflow-hidden shadow-lg`}>
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Shield className="w-20 h-20" />
        </div>
        <div className="relative z-10">
          <Badge className="bg-white/20 text-white border-none mb-3 text-[10px]">{planName}</Badge>
          <div className="mb-4">
            <p className="text-white/60 text-[10px] uppercase tracking-widest mb-0.5">Membership ID</p>
            <p className="text-base font-bold">{membershipNumber}</p>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/60 text-[10px] mb-0.5">Coverage</p>
              <p className="text-lg font-bold">₹{(coverageAmount).toLocaleString()}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge className={`${isActive ? 'bg-green-400/20 text-green-300' : 'bg-amber-400/20 text-amber-300'} border-none text-[10px]`}>
                {isActive ? <><CheckCircle className="h-3 w-3 mr-1" /> Active</> : <><Clock className="h-3 w-3 mr-1" /> Pending</>}
              </Badge>
              <p className="text-white/60 text-[10px]">Valid: {validUntil}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border-none bg-red-50 active:bg-red-100 transition-colors cursor-pointer">
          <CardContent className="p-3 flex flex-col items-center justify-center text-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-200">
              <Phone className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-red-900">SOS Emergency</span>
          </CardContent>
        </Card>
        <Card className="border-none bg-blue-50 active:bg-blue-100 transition-colors cursor-pointer">
          <CardContent className="p-3 flex flex-col items-center justify-center text-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-primary">Find Hospital</span>
          </CardContent>
        </Card>
      </div>

      {emergencyRequests.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-900 text-sm">Recent Requests</h3>
          </div>
          <div className="space-y-2">
            {emergencyRequests.slice(0, 2).map((req: any) => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    req.status === 'pending' ? 'bg-amber-100' : 
                    req.status === 'approved' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <AlertCircle className={`h-4 w-4 ${
                      req.status === 'pending' ? 'text-amber-600' : 
                      req.status === 'approved' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{req.hospitalName || "Emergency Request"}</p>
                    <p className="text-[10px] text-slate-400">{req.caseType}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] capitalize">{req.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {myAddOns.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-900 text-sm">My Add-Ons</h3>
            <button onClick={onViewAddOns} className="text-[10px] text-primary font-bold flex items-center">
              View All <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {myAddOns.slice(0, 3).map((addon: any) => (
              <Card key={addon.id} className="min-w-[120px] border-none bg-green-50">
                <CardContent className="p-3">
                  <Gift className="h-4 w-4 text-green-600 mb-1" />
                  <p className="text-[10px] font-bold text-slate-900 line-clamp-1">{addon.benefit?.name}</p>
                  <p className="text-[8px] text-slate-400">{addon.usageCount}/{addon.usageLimit} used</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-slate-900 text-sm">Browse Categories</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {PLAN_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} className="flex flex-col items-center gap-1.5 min-w-[60px]">
                <div className={`w-12 h-12 rounded-2xl ${cat.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] text-slate-600 font-medium">{cat.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-slate-900 text-sm">Popular Plans</h3>
          <button onClick={onViewPlans} className="text-[10px] text-primary font-bold flex items-center">
            View All <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="space-y-2">
          {featuredPlans.slice(0, 3).map((plan: any) => (
            <div key={plan.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{plan.name}</p>
                  <p className="text-[10px] text-slate-400">₹{plan.coverageAmount?.toLocaleString()} coverage</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">₹{plan.price}</p>
                <p className="text-[10px] text-slate-400">/year</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-slate-900 text-sm">Add-on Benefits</h3>
          <button onClick={onViewAddOns} className="text-[10px] text-primary font-bold flex items-center">
            View All <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {featuredAddOns.map((addon: any) => (
            <Card key={addon.id} className="min-w-[140px] border-none bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-3">
                <Gift className="h-5 w-5 text-purple-500 mb-2" />
                <p className="text-xs font-bold text-slate-900 line-clamp-1">{addon.name}</p>
                <p className="text-[10px] text-slate-400 mb-2">{addon.benefitCode === 'THIRD_PARTY_ACCIDENT' ? `${addon.benefitAmount}% of fee` : `₹${addon.benefitAmount?.toLocaleString()}`}</p>
                <Badge className="text-[8px] bg-purple-100 text-purple-700 border-none">₹{addon.price}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlansView({ plans }: { plans: any[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const filteredPlans = selectedCategory 
    ? plans.filter((p: any) => p.planCategory === selectedCategory)
    : plans;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">All Plans</h1>
      
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        <Badge 
          variant={!selectedCategory ? "default" : "outline"}
          className="cursor-pointer whitespace-nowrap"
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Badge>
        {PLAN_CATEGORIES.map((cat) => (
          <Badge 
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </Badge>
        ))}
      </div>

      <div className="space-y-3">
        {filteredPlans.map((plan: any) => (
          <Card key={plan.id} className={`border-none ${plan.isPopular ? 'ring-2 ring-primary' : 'bg-slate-50'}`}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{plan.name}</h3>
                    {plan.isPopular && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                  </div>
                  <p className="text-[10px] text-slate-400">{plan.shortDescription}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">₹{plan.price}</p>
                  <p className="text-[10px] text-slate-400">/year</p>
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                <Badge variant="outline" className="text-[10px]">₹{(plan.coverageAmount/100000).toFixed(1)}L</Badge>
                {plan.maxMembers > 1 && (
                  <Badge variant="outline" className="text-[10px]">{plan.maxMembers} Members</Badge>
                )}
              </div>
              <Button size="sm" className="w-full text-xs h-8">Choose Plan</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AddOnsView({ addOns }: { addOns: any[] }) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Add-on Benefits</h1>
      <p className="text-xs text-slate-400">Enhance your coverage with additional benefits</p>
      
      <div className="space-y-3">
        {addOns.filter((a: any) => a.isActive).map((addon: any) => (
          <Card key={addon.id} className="border-none bg-gradient-to-r from-slate-50 to-purple-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Gift className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{addon.name}</h3>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{addon.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[10px]">{addon.benefitCode === 'THIRD_PARTY_ACCIDENT' ? `${addon.benefitAmount}% of fee` : `₹${addon.benefitAmount?.toLocaleString()}`}</Badge>
                  <Badge variant="outline" className="text-[10px]">{addon.usageLimit}x use</Badge>
                </div>
                <Button size="sm" variant="outline" className="text-xs h-7">
                  ₹{addon.price} - Add
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CardView({ user, membership }: { user: any; membership: any }) {
  const planName = membership?.planType === "family" ? "Family Assist Plan" : "Individual Assist Plan";
  const coverageAmount = membership?.coverageAmount || 300000;
  const membershipNumber = membership?.membershipNumber || "RA-XXXXXX";
  const validUntil = membership?.expiryDate ? new Date(membership.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : "Dec 2026";
  const isActive = membership?.status === "active";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Membership Card</h1>
      
      <div className={`${isActive ? 'bg-gradient-to-br from-primary via-primary to-blue-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'} rounded-3xl p-6 text-white relative overflow-hidden shadow-xl`}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/60 text-[10px] uppercase tracking-widest">Raksha Assist</p>
              <p className="text-lg font-bold">{planName}</p>
            </div>
            <Shield className="h-8 w-8 text-white/30" />
          </div>
          
          <div>
            <p className="text-white/60 text-[10px] uppercase tracking-widest mb-1">Member ID</p>
            <p className="text-2xl font-bold tracking-wider">{membershipNumber}</p>
          </div>

          <div>
            <p className="text-white/60 text-[10px] uppercase tracking-widest mb-1">Member Name</p>
            <p className="text-base font-bold">{user?.name || "Member"}</p>
          </div>
          
          <div className="flex justify-between">
            <div>
              <p className="text-white/60 text-[10px]">Coverage</p>
              <p className="font-bold">₹{coverageAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/60 text-[10px]">Valid Till</p>
              <p className="font-bold">{validUntil}</p>
            </div>
            <div>
              <p className="text-white/60 text-[10px]">Status</p>
              <Badge className={`${isActive ? 'bg-green-400/20 text-green-300' : 'bg-amber-400/20 text-amber-300'} border-none text-[10px]`}>
                {isActive ? "Active" : "Pending"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 text-sm">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-none bg-slate-50 cursor-pointer active:bg-slate-100">
            <CardContent className="p-4 text-center">
              <CreditCard className="h-6 w-6 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-medium">Download Card</p>
            </CardContent>
          </Card>
          <Card className="border-none bg-slate-50 cursor-pointer active:bg-slate-100">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-medium">Family Members</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-none bg-amber-50">
        <CardContent className="p-4 text-center">
          <p className="text-xs text-amber-800">
            <strong>Note:</strong> This is NOT an insurance policy. Raksha Assist provides financial assistance for emergencies.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileView({ user, membership, onLogout }: { user: any; membership: any; onLogout: () => void }) {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">My Profile</h1>
      
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900">{user?.name || "Member"}</p>
          <p className="text-sm text-slate-400">+91 {user?.mobile}</p>
          <Badge variant="outline" className="mt-1 text-[10px] capitalize">{user?.role || "member"}</Badge>
        </div>
      </div>

      <div className="space-y-2">
        {[
          { icon: CreditCard, label: "Membership Details", value: membership?.membershipNumber },
          { icon: History, label: "Usage History", value: "View all" },
          { icon: Gift, label: "My Add-ons", value: "Manage" },
          { icon: Users, label: "Family Members", value: "Add/Edit" },
          { icon: FileText, label: "Documents", value: "Upload" },
          { icon: Settings, label: "Settings", value: "" },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer active:bg-slate-100">
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5 text-slate-400" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.value && <span className="text-xs text-slate-400">{item.value}</span>}
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </div>
          </div>
        ))}
      </div>

      <Button variant="destructive" className="w-full" onClick={onLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>

      <p className="text-center text-[10px] text-slate-400">
        Raksha Assist v1.0.0 • Not an insurance product
      </p>
    </div>
  );
}

function AgentView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agent Console</h1>
        <p className="text-slate-400 text-sm">Zone: South Chennai • ID: 8821</p>
      </div>

      <div className="bg-slate-900 rounded-3xl p-5 text-white relative overflow-hidden shadow-lg shadow-slate-900/30">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Wallet className="w-20 h-20" />
        </div>
        <div className="relative z-10">
          <p className="text-white/60 text-[10px] uppercase tracking-widest mb-1">Total Commission</p>
          <p className="text-3xl font-bold mb-3">₹42,500</p>
          <div className="flex gap-2">
            <Badge className="bg-green-500/20 text-green-400 border-none text-[10px]">
              +12 This Month
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-none text-[10px]">
              ₹8,500 Pending
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border-none bg-primary/5 active:bg-primary/10 cursor-pointer">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <UserPlus className="h-6 w-6" />
            </div>
            <span className="text-sm font-bold text-primary">Register New</span>
          </CardContent>
        </Card>
        <Card className="border-none bg-orange-50 active:bg-orange-100 cursor-pointer">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-200">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-sm font-bold text-orange-700">My Members</span>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-slate-900 text-sm">Plan Categories to Sell</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {PLAN_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} className="flex flex-col items-center gap-1.5 min-w-[60px]">
                <div className={`w-12 h-12 rounded-2xl ${cat.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] text-slate-600 font-medium">{cat.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 text-sm">Recent Registrations</h3>
        {[
          { name: "Rahul Sharma", plan: "Car Premium", time: "2 hrs ago", amount: "+ ₹400" },
          { name: "Priya V", plan: "Two Wheeler", time: "5 hrs ago", amount: "+ ₹100" },
          { name: "Amit Kumar", plan: "Home Assist", time: "Yesterday", amount: "+ ₹175" }
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-slate-500 border">
                {item.name[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{item.name}</p>
                <p className="text-[10px] text-slate-400">{item.plan} • {item.time}</p>
              </div>
            </div>
            <span className="text-sm font-bold text-green-600">{item.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
