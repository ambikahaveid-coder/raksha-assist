import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Building2, 
  Loader2, 
  Download, 
  Shield, 
  MapPin, 
  IndianRupee, 
  Users, 
  FileText, 
  Scale,
  Phone,
  Mail,
  CheckCircle2,
  ArrowRight,
  Globe,
  Award,
  TrendingUp,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Policy {
  id: string;
  title: string;
  type: string;
  content: string;
  version: string;
}

const franchiseLevels = [
  {
    level: "Zone Franchise",
    icon: Globe,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    fee: "₹10,00,000",
    commission: "3%",
    coverage: "Multiple States",
    benefits: ["State-level oversight", "Premium support", "Exclusive territory rights"]
  },
  {
    level: "State Franchise",
    icon: Award,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    fee: "₹5,00,000",
    commission: "4%",
    coverage: "Entire State",
    benefits: ["District management", "State marketing support", "Training programs"]
  },
  {
    level: "District Franchise",
    icon: TrendingUp,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    fee: "₹2,50,000",
    commission: "5%",
    coverage: "Full District",
    benefits: ["City oversight", "Local branding", "Dedicated support"]
  },
  {
    level: "City Franchise",
    icon: Briefcase,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    fee: "₹1,00,000",
    commission: "6%",
    coverage: "City Area",
    benefits: ["Agent network", "Local operations", "Ground-level execution"]
  }
];

const tableOfContents = [
  { id: "definitions", title: "1. Definitions", icon: FileText },
  { id: "franchise-levels", title: "2. Franchise Levels", icon: Building2 },
  { id: "fees", title: "3. Fees & Commissions", icon: IndianRupee },
  { id: "territory", title: "4. Territory Rights", icon: MapPin },
  { id: "obligations", title: "5. Partner Obligations", icon: Users },
  { id: "legal", title: "6. Legal Framework", icon: Scale },
  { id: "contact", title: "7. Contact Us", icon: Phone }
];

export default function FranchiseTerms() {
  const { data: policy, isLoading } = useQuery<Policy>({
    queryKey: ["/api/policies/franchise_terms"],
    queryFn: async () => {
      const res = await fetch("/api/policies/franchise_terms");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Shield className="h-4 w-4 text-purple-300" />
                <span className="text-purple-200 text-sm font-medium">Official Legal Document</span>
              </div>
              
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-xl shadow-purple-500/30 mb-6">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Franchise Terms & Conditions
              </h1>
              <p className="text-purple-200 text-lg mb-2">
                Raksha Assist Private Limited - Franchise Partnership Agreement
              </p>
              <div className="flex items-center justify-center gap-4 mb-8">
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-4 py-1">
                  Version {policy?.version || "1.0"}
                </Badge>
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-4 py-1">
                  Effective: February 2026
                </Badge>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button 
                  size="lg"
                  className="bg-white text-purple-900 hover:bg-purple-50 shadow-lg"
                  onClick={() => window.open('/api/policies/franchise_terms/pdf', '_blank')}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download PDF
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  onClick={() => scrollToSection('contact')}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent"></div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-8">
              <aside className="lg:col-span-1">
                <div className="sticky top-24">
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                        Table of Contents
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <nav className="space-y-1">
                        {tableOfContents.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-left"
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            <span>{item.title}</span>
                          </button>
                        ))}
                      </nav>
                    </CardContent>
                  </Card>
                  
                  <Card className="mt-4 border-purple-200 bg-purple-50">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Phone className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-900">Need Help?</p>
                        <p className="text-xs text-slate-600 mb-3">Speak with our franchise team</p>
                        <a href="tel:+918143752025" className="text-purple-600 font-semibold text-sm hover:underline">
                          +91 81437 52025
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </aside>

              <div className="lg:col-span-3 space-y-8">
                <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Shield className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">Important Legal Notice</h3>
                        <p className="text-sm text-slate-600">
                          This is a legally binding franchise partnership agreement governed by the Indian Contract Act, 1872. 
                          Raksha Assist is a <strong>membership-based assistance coordination platform</strong> and is 
                          <strong> NOT an insurance company, TPA, or financial guarantee provider</strong>. 
                          Please read all terms carefully before proceeding.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <section id="franchise-levels">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Building2 className="h-5 w-5 text-purple-600" />
                    </div>
                    Franchise Levels & Investment
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {franchiseLevels.map((franchise) => (
                      <Card key={franchise.level} className={`${franchise.borderColor} ${franchise.bgColor} overflow-hidden`}>
                        <div className={`h-1 bg-gradient-to-r ${franchise.color}`}></div>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${franchise.color}`}>
                                <franchise.icon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-900">{franchise.level}</h3>
                                <p className="text-xs text-slate-500">{franchise.coverage}</p>
                              </div>
                            </div>
                            <Badge className={`bg-gradient-to-r ${franchise.color} text-white border-0`}>
                              {franchise.commission}
                            </Badge>
                          </div>
                          <div className="mb-4">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Investment</p>
                            <p className="text-2xl font-bold text-slate-900">{franchise.fee}</p>
                          </div>
                          <div className="space-y-2">
                            {franchise.benefits.map((benefit, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span>{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : policy?.content ? (
                  <Card id="definitions" className="border-slate-200">
                    <CardContent className="pt-8 pb-8">
                      <div className="prose prose-slate max-w-none 
                        prose-headings:text-slate-900 
                        prose-headings:font-bold
                        prose-h1:text-2xl 
                        prose-h1:border-b 
                        prose-h1:border-slate-200 
                        prose-h1:pb-4 
                        prose-h1:mb-6
                        prose-h2:text-xl 
                        prose-h2:mt-8
                        prose-h2:mb-4
                        prose-h2:flex
                        prose-h2:items-center
                        prose-h2:gap-3
                        prose-h3:text-lg 
                        prose-h3:text-slate-800
                        prose-p:text-slate-600
                        prose-p:leading-relaxed
                        prose-li:text-slate-600
                        prose-strong:text-slate-900
                        prose-table:text-sm
                        prose-table:border
                        prose-table:border-slate-200
                        prose-th:bg-slate-100
                        prose-th:font-semibold
                        prose-th:text-slate-900
                        prose-th:px-4
                        prose-th:py-3
                        prose-td:px-4
                        prose-td:py-3
                        prose-td:border-t
                        prose-td:border-slate-200
                        prose-a:text-purple-600
                        prose-a:no-underline
                        prose-a:hover:underline
                        prose-blockquote:border-l-purple-500
                        prose-blockquote:bg-purple-50
                        prose-blockquote:py-1
                        prose-blockquote:px-4
                        prose-blockquote:not-italic
                        prose-blockquote:text-slate-700
                        prose-hr:border-slate-200
                      ">
                        <div dangerouslySetInnerHTML={{ 
                          __html: policy.content
                            .replace(/^# .+\n/, '')
                            .replace(/^Raksha Assist Private Limited.+\n/, '')
                            .split('\n')
                            .map(line => {
                              // Escape HTML entities first to prevent XSS
                              line = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                              if (line.startsWith('## ')) {
                                return `<h2>${line.replace('## ', '')}</h2>`;
                              }
                              if (line.startsWith('### ')) {
                                return `<h3>${line.replace('### ', '')}</h3>`;
                              }
                              if (line.startsWith('- **') || line.startsWith('  - ')) {
                                return `<li>${line.replace(/^-\s*/, '').replace(/\*\*/g, '<strong>').replace(/\*\*/g, '</strong>')}</li>`;
                              }
                              if (line.startsWith('| ')) {
                                return line;
                              }
                              if (line.startsWith('---')) {
                                return '<hr />';
                              }
                              if (line.trim() === '') {
                                return '<br />';
                              }
                              return `<p>${line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</p>`;
                            })
                            .join('\n')
                        }} />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-slate-200">
                    <CardContent className="py-12 text-center">
                      <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">
                        Franchise Terms & Conditions document is being updated. Please contact support for details.
                      </p>
                    </CardContent>
                  </Card>
                )}

                <section id="contact">
                  <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white overflow-hidden">
                    <CardContent className="pt-8 pb-8">
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Become a Franchise Partner</h2>
                        <p className="text-slate-600">Ready to join our growing network? Get in touch with our franchise team.</p>
                      </div>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center p-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Phone className="h-5 w-5 text-purple-600" />
                          </div>
                          <p className="text-sm text-slate-500 mb-1">Call Us</p>
                          <a href="tel:+918143752025" className="font-semibold text-slate-900 hover:text-purple-600">
                            +91 81437 52025
                          </a>
                        </div>
                        <div className="text-center p-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Mail className="h-5 w-5 text-purple-600" />
                          </div>
                          <p className="text-sm text-slate-500 mb-1">Email Us</p>
                          <a href="mailto:franchise@rakshaassist.com" className="font-semibold text-slate-900 hover:text-purple-600">
                            franchise@rakshaassist.com
                          </a>
                        </div>
                        <div className="text-center p-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MapPin className="h-5 w-5 text-purple-600" />
                          </div>
                          <p className="text-sm text-slate-500 mb-1">Visit Us</p>
                          <p className="font-semibold text-slate-900 text-sm">
                            Bengaluru, Karnataka
                          </p>
                        </div>
                      </div>
                      <div className="mt-8 text-center">
                        <Button 
                          size="lg" 
                          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg"
                          onClick={() => window.location.href = '/contact'}
                        >
                          Apply for Franchise
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                <Card className="border-slate-300 bg-slate-50">
                  <CardContent className="py-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-6">
                        <span>CIN: U72900TG2024PTC184818</span>
                        <span>|</span>
                        <span>Document ID: FTC-2026-001</span>
                      </div>
                      <div>
                        <span>Last Updated: February 2026</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
