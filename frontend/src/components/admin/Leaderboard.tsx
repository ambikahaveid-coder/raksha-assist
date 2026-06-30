import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, TrendingUp, Medal, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const defaultAgents = [
  { id: 1, name: "Rahul Sharma", totalPolicies: 145, totalRevenue: 435000, rank: 1, trend: "up" },
  { id: 2, name: "Priya Singh", totalPolicies: 120, totalRevenue: 360000, rank: 2, trend: "up" },
  { id: 3, name: "Amit Kumar", totalPolicies: 98, totalRevenue: 294000, rank: 3, trend: "down" },
  { id: 4, name: "Sneha Gupta", totalPolicies: 85, totalRevenue: 255000, rank: 4, trend: "up" },
  { id: 5, name: "Vikram Malhotra", totalPolicies: 72, totalRevenue: 216000, rank: 5, trend: "same" },
];

interface AgentLeaderboardEntry {
  id: string;
  name: string;
  totalPolicies: number;
  totalRevenue: number;
  rank?: number;
}

export function Leaderboard() {
  const { data: apiAgents, isLoading } = useQuery<AgentLeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: () => api.agents.getLeaderboard(),
  });

  const agents = (apiAgents && apiAgents.length > 0) ? apiAgents.map((a: AgentLeaderboardEntry, i: number) => ({
    ...a,
    rank: i + 1,
    trend: "up",
    totalPolicies: a.totalPolicies || 0,
    totalRevenue: a.totalRevenue || 0,
  })) : defaultAgents;
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const topAgent = agents[0];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Top Performer Card */}
      <Card className="col-span-full md:col-span-2 lg:col-span-1 bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-orange-700 flex items-center gap-2">
            <Trophy className="h-5 w-5 fill-orange-500 text-orange-600" />
            Top Performer
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center py-6">
          <div className="relative mb-4">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${topAgent?.name}`} />
              <AvatarFallback>{topAgent?.name?.substring(0, 2) || 'RA'}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded-full text-xs shadow-sm border border-white">
              #1
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900">{topAgent?.name || 'Top Agent'}</h3>
          <p className="text-sm text-slate-500 mb-4">Elite Agent</p>
          <div className="grid grid-cols-2 gap-4 w-full bg-white/50 p-4 rounded-xl border border-orange-100">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Policies</p>
              <p className="text-lg font-bold text-slate-900">{topAgent?.totalPolicies || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Revenue</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(topAgent?.totalRevenue || 0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Leaderboard List */}
      <Card className="col-span-full md:col-span-2 border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Agent Leaderboard</span>
            <Badge variant="outline" className="bg-slate-50">This Month</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.map((agent, index) => (
              <div key={agent.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${index === 0 ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${index === 1 ? 'bg-slate-100 text-slate-700' : ''}
                    ${index === 2 ? 'bg-amber-100 text-amber-800' : ''}
                    ${index > 2 ? 'bg-transparent text-slate-400' : ''}
                  `}>
                    {agent.rank}
                  </div>
                  <Avatar className="h-10 w-10 border border-slate-100">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`} />
                    <AvatarFallback>{agent.name?.substring(0, 2) || 'AG'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-slate-900">{agent.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{agent.totalPolicies} Policies</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{formatCurrency(agent.totalRevenue)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {agent.trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {agent.rank <= 3 && <Medal className="h-4 w-4 text-primary/40" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
