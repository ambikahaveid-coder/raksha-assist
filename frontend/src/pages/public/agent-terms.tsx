import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Users, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface Policy {
  id: string;
  title: string;
  type: string;
  content: string;
  version: string;
}

export default function AgentTerms() {
  const { data: policy, isLoading } = useQuery<Policy>({
    queryKey: ["/api/policies/agent_terms"],
    queryFn: async () => {
      const res = await fetch("/api/policies/agent_terms");
      if (!res.ok) return null;
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-sm border p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                {policy?.title || "Agent Terms & Conditions"}
              </h1>
              <p className="text-muted-foreground">Version {policy?.version || "1.0"}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.open('/api/policies/agent_terms/pdf', '_blank')}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : policy?.content ? (
              <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-table:text-sm">
                <ReactMarkdown>{policy.content}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Agent Terms & Conditions document not available. Please contact support.
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
