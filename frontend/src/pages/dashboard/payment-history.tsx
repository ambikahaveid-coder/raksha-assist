import { useQuery } from "@tanstack/react-query";
import { fetchWithCsrf } from "@/lib/csrf";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CreditCard, CheckCircle, XCircle, Clock, Download, Receipt } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";

interface Payment {
  id: string;
  amount: number;
  status: string;
  planType: string;
  transactionId?: string;
  paymentMethod?: string;
  createdAt: string;
  processedAt?: string;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "succeeded":
    case "completed":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" /> Successful</Badge>;
    case "failed":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
    case "created":
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function formatPlanName(planType: string): string {
  if (!planType) return "N/A";
  return planType
    .replace(/_/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase());
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount / 100);
}

export default function PaymentHistory() {
  const [, setLocation] = useLocation();

  const { data: payments, isLoading, error } = useQuery<Payment[]>({
    queryKey: ["payment-history"],
    queryFn: async () => {
      const res = await fetchWithCsrf("/api/user/payment-history");
      if (!res.ok) throw new Error("Failed to fetch payment history");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => setLocation("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>View all your payment transactions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Failed to load payment history. Please try again.
              </div>
            ) : payments && payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-3 bg-blue-50 rounded-full">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900">
                          {formatPlanName(payment.planType)}
                        </p>
                        {getStatusBadge(payment.status)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(payment.createdAt), "dd MMM yyyy, hh:mm a")}
                      </p>
                      {payment.transactionId && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          TXN: {payment.transactionId}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatAmount(payment.amount)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {payment.paymentMethod || "Online"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Payments Yet</h3>
                <p className="text-gray-500 mt-1">
                  Your payment history will appear here once you make a payment.
                </p>
                <Button
                  onClick={() => setLocation("/plans")}
                  className="mt-4"
                >
                  View Plans
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>For any payment related queries, please contact support.</p>
        </div>
      </div>
    </div>
  );
}
