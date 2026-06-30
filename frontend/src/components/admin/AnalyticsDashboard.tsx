import { useQuery } from "@tanstack/react-query";
import { fetchWithCsrf } from "@/lib/csrf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, TrendingUp, Users, IndianRupee, AlertTriangle,
  PieChart, Activity, Eye, Pointer
} from "lucide-react";

interface AnalyticsData {
  membershipTrends: { date: string; count: number }[];
  revenueTrends: { date: string; amount: number }[];
  planDistribution: { planName: string; count: number }[];
  roleDistribution: { role: string; count: number }[];
  visitorStats?: {
    totalVisitors30Days: number;
    totalPageViews30Days: number;
    avgVisitorsPerDay: number;
    todayVisitors: number;
    todayPageViews: number;
    dailyStats: Array<{ date: string; visitors: number; pageViews: number }>;
  };
  summary: {
    recentSOS: number;
    newMembers: number;
    monthlyRevenue: number;
    todayVisitors?: number;
  };
}

export function AnalyticsDashboard() {
  const { data: analytics, isLoading, isError, refetch } = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/admin/analytics", { });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-24" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-red-800">Failed to load analytics</p>
              <p className="text-sm text-red-600">There was an error fetching analytics data. Please try again.</p>
            </div>
            <button 
              onClick={() => refetch()} 
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxMemberCount = Math.max(...(analytics?.membershipTrends.map(t => t.count) || [1]), 1);
  const maxRevenueAmount = Math.max(...(analytics?.revenueTrends.map(t => t.amount) || [1]), 1);
  const totalPlanMembers = analytics?.planDistribution.reduce((sum, p) => sum + p.count, 0) || 1;

  const roleColors: Record<string, string> = {
    user: "bg-blue-500",
    agent: "bg-green-500",
    employee: "bg-purple-500",
    admin: "bg-orange-500",
    super_admin: "bg-red-500",
    accountant: "bg-yellow-500",
    marketing: "bg-pink-500"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-bold">Analytics Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New Members (7 days)</p>
                <p className="text-2xl font-bold">{analytics?.summary.newMembers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <IndianRupee className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue (30 days)</p>
                <p className="text-2xl font-bold">₹{(analytics?.summary.monthlyRevenue || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SOS Cases (7 days)</p>
                <p className="text-2xl font-bold">{analytics?.summary.recentSOS || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visitor Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today Visitors</p>
                <p className="text-2xl font-bold">{analytics?.summary.todayVisitors || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-full">
                <Pointer className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Daily Visitors</p>
                <p className="text-2xl font-bold">{analytics?.visitorStats?.avgVisitorsPerDay || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-100 rounded-full">
                <Activity className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Visitors (30d)</p>
                <p className="text-2xl font-bold">{analytics?.visitorStats?.totalVisitors30Days || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Page Views (30d)</p>
                <p className="text-2xl font-bold">{analytics?.visitorStats?.totalPageViews30Days || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Membership Trends (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end gap-1">
              {analytics?.membershipTrends.length === 0 ? (
                <p className="text-muted-foreground text-sm w-full text-center">No data available</p>
              ) : (
                analytics?.membershipTrends.map((trend, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                      style={{ height: `${(trend.count / maxMemberCount) * 100}%`, minHeight: trend.count > 0 ? '8px' : '0' }}
                      title={`${new Date(trend.date).toLocaleDateString()}: ${trend.count} members`}
                    />
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Revenue Trends (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end gap-1">
              {analytics?.revenueTrends.length === 0 ? (
                <p className="text-muted-foreground text-sm w-full text-center">No data available</p>
              ) : (
                analytics?.revenueTrends.map((trend, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                      style={{ height: `${(trend.amount / maxRevenueAmount) * 100}%`, minHeight: trend.amount > 0 ? '8px' : '0' }}
                      title={`${new Date(trend.date).toLocaleDateString()}: ₹${trend.amount.toLocaleString()}`}
                    />
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Plan Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.planDistribution.length === 0 ? (
                <p className="text-muted-foreground text-sm">No active memberships</p>
              ) : (
                analytics?.planDistribution.map((plan, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{plan.planName || "Unknown"}</span>
                      <span className="font-medium">{plan.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(plan.count / totalPlanMembers) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              User Role Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics?.roleDistribution.map((role, i) => (
                <Badge key={i} variant="outline" className="py-2 px-3">
                  <div className={`w-3 h-3 rounded-full mr-2 ${roleColors[role.role] || 'bg-gray-500'}`} />
                  <span className="capitalize">{role.role.replace('_', ' ')}</span>
                  <span className="ml-2 font-bold">{role.count}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
