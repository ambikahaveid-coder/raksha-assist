import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2, MapPin, Phone, Mail, Globe, Search, Star,
  CheckCircle, Shield, Filter, Loader2
} from "lucide-react";

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email?: string;
  website?: string;
  specialties: string[];
  tier: string;
  isNetworkHospital: boolean;
  isActive: boolean;
}

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  tier1: { label: "Tier 1 – Premium", color: "text-purple-700", bg: "bg-purple-100" },
  tier2: { label: "Tier 2 – Standard", color: "text-blue-700", bg: "bg-blue-100" },
  tier3: { label: "Tier 3 – Basic", color: "text-green-700", bg: "bg-green-100" },
};

export default function HospitalsPage() {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");

  const { data: hospitals = [], isLoading } = useQuery<Hospital[]>({
    queryKey: ["public-hospitals"],
    queryFn: async () => {
      const res = await fetch("/api/hospitals");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const activeHospitals = hospitals.filter(h => h.isActive);

  const states = [...new Set(activeHospitals.map(h => h.state).filter(Boolean))].sort();

  const filtered = activeHospitals.filter(h => {
    const matchSearch =
      !search ||
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase()) ||
      h.state.toLowerCase().includes(search.toLowerCase()) ||
      h.specialties?.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchTier = tierFilter === "all" || h.tier === tierFilter;
    const matchState = stateFilter === "all" || h.state === stateFilter;
    return matchSearch && matchTier && matchState;
  });

  const networkCount = activeHospitals.filter(h => h.isNetworkHospital).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        {/* Hero */}
        <div className="bg-gradient-to-r from-primary to-teal-700 text-white py-14">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-3">Hospital Network</h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Access cashless treatment at our {networkCount}+ partner hospitals across India
            </p>
            <div className="flex justify-center gap-8 mt-8">
              <div className="text-center">
                <p className="text-3xl font-bold">{activeHospitals.length}</p>
                <p className="text-white/70 text-sm">Total Hospitals</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{networkCount}</p>
                <p className="text-white/70 text-sm">Cashless Network</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{states.length}</p>
                <p className="text-white/70 text-sm">States Covered</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-8">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by hospital name, city, state, or specialty..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="tier1">Tier 1 – Premium</SelectItem>
                <SelectItem value="tier2">Tier 2 – Standard</SelectItem>
                <SelectItem value="tier3">Tier 3 – Basic</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(search || tierFilter !== "all" || stateFilter !== "all") && (
              <Button variant="outline" onClick={() => { setSearch(""); setTierFilter("all"); setStateFilter("all"); }}>
                Clear Filters
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-slate-900">{filtered.length}</span> hospitals
            </p>
            <div className="flex items-center gap-2 text-sm text-teal-700">
              <CheckCircle className="h-4 w-4" />
              <span>Green badge = Cashless Network</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-700">No hospitals found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map(hospital => {
                const tier = TIER_CONFIG[hospital.tier] || TIER_CONFIG.tier2;
                return (
                  <Card key={hospital.id} className="hover:shadow-md transition-shadow border-slate-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                            <Building2 className="h-5 w-5 text-teal-600" />
                          </div>
                          <CardTitle className="text-base leading-snug">{hospital.name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{hospital.address}, {hospital.city}, {hospital.state} – {hospital.pincode}</span>
                      </div>

                      {hospital.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 shrink-0" />
                          <a href={`tel:${hospital.phone}`} className="hover:text-primary">{hospital.phone}</a>
                        </div>
                      )}

                      {hospital.website && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-4 w-4 shrink-0" />
                          <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate">
                            {hospital.website.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1">
                        <Badge className={`${tier.bg} ${tier.color} border-0 text-xs`}>
                          <Star className="h-3 w-3 mr-1" />
                          {tier.label}
                        </Badge>
                        {hospital.isNetworkHospital && (
                          <Badge variant="outline" className="border-teal-500 text-teal-700 bg-teal-50 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Cashless
                          </Badge>
                        )}
                      </div>

                      {hospital.specialties?.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {hospital.specialties.slice(0, 4).map((s, i) => (
                            <Badge key={i} variant="secondary" className="text-xs font-normal">{s}</Badge>
                          ))}
                          {hospital.specialties.length > 4 && (
                            <Badge variant="secondary" className="text-xs">+{hospital.specialties.length - 4} more</Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Info Banner */}
          <div className="mt-10 bg-teal-50 border border-teal-200 rounded-xl p-6 flex flex-col md:flex-row items-center gap-4">
            <div className="h-12 w-12 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
              <Shield className="h-6 w-6 text-teal-700" />
            </div>
            <div>
              <h3 className="font-semibold text-teal-900 mb-1">How to use your membership at network hospitals</h3>
              <p className="text-sm text-teal-800">
                Show your Raksha Assist membership card at any cashless (network) hospital. The hospital will
                directly settle bills as per your plan limits. For non-network hospitals, pay first and submit
                a reimbursement claim within 30 days.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
