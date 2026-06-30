import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Eye,
  Briefcase,
  GraduationCap,
  Loader2,
  Search,
  Filter,
  UserCheck,
  UserX,
  MessageSquare
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  reviewing: { label: "Under Review", color: "bg-blue-100 text-blue-800", icon: Eye },
  shortlisted: { label: "Shortlisted", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  interviewed: { label: "Interviewed", color: "bg-purple-100 text-purple-800", icon: Users },
  hired: { label: "Hired", color: "bg-emerald-100 text-emerald-800", icon: UserCheck },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: UserX }
};

const EMAIL_TEMPLATES = {
  shortlisted: {
    subject: "Congratulations! You've been shortlisted - Raksha Assist",
    body: `Dear {name},

We are pleased to inform you that your application for the position of {position} at Raksha Assist has been shortlisted.

Our HR team was impressed with your profile and would like to proceed with the next steps of our recruitment process.

We will contact you shortly to schedule an interview. Please keep your phone available.

Best regards,
HR Team
Raksha Assist`
  },
  interviewed: {
    subject: "Interview Scheduled - Raksha Assist",
    body: `Dear {name},

Thank you for your interest in the {position} position at Raksha Assist.

We would like to invite you for an interview. Our team will contact you shortly with the exact date, time, and venue details.

Please ensure you have the following documents ready:
- Updated resume
- ID proof
- Educational certificates

Looking forward to meeting you.

Best regards,
HR Team
Raksha Assist`
  },
  hired: {
    subject: "Welcome to Raksha Assist! - Offer Letter",
    body: `Dear {name},

Congratulations! 🎉

We are thrilled to offer you the position of {position} at Raksha Assist.

Your skills and experience impressed our team, and we believe you will be a valuable addition to our family.

Our HR team will contact you with the formal offer letter and joining formalities.

Welcome aboard!

Best regards,
HR Team
Raksha Assist`
  },
  rejected: {
    subject: "Application Update - Raksha Assist",
    body: `Dear {name},

Thank you for your interest in the {position} position at Raksha Assist and for taking the time to apply.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current requirements.

We encourage you to apply for future openings that match your skills and experience. We wish you the best in your career journey.

Best regards,
HR Team
Raksha Assist`
  }
};

interface JobApplication {
  id: string;
  name: string;
  email: string;
  mobile: string;
  position: string;
  experience: string | null;
  currentLocation: string | null;
  education: string | null;
  resumeUrl: string | null;
  coverLetter: string | null;
  status: string;
  reviewNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export default function HRPortal() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [emailData, setEmailData] = useState({ subject: "", body: "", newStatus: "" });

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["jobApplications"],
    queryFn: async () => {
      const res = await fetch("/api/admin/job-applications");
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
    enabled: isAuthenticated && ["admin", "super_admin"].includes(user?.role || "")
  });

  const updateApplication = useMutation({
    mutationFn: async ({ id, status, reviewNotes }: { id: string; status: string; reviewNotes?: string }) => {
      const res = await fetch(`/api/admin/job-applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNotes })
      });
      if (!res.ok) throw new Error("Failed to update application");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
      toast({ title: "Application Updated", description: "Status has been updated successfully." });
    }
  });

  const sendEmail = useMutation({
    mutationFn: async ({ applicationId, subject, body, newStatus }: { applicationId: string; subject: string; body: string; newStatus: string }) => {
      const res = await fetch("/api/admin/job-applications/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, subject, body, newStatus })
      });
      if (!res.ok) throw new Error("Failed to send email");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
      toast({ title: "Email Sent", description: "Email has been sent to the candidate and status updated." });
      setEmailDialogOpen(false);
      setSelectedApplication(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to send email", description: error.message, variant: "destructive" });
    }
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !["admin", "super_admin"].includes(user?.role || ""))) {
      setLocation("/login");
    }
  }, [authLoading, isAuthenticated, user?.role, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !["admin", "super_admin"].includes(user?.role || "")) {
    return null;
  }

  const filteredApplications = applications.filter((app: JobApplication) => {
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesSearch = 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.position.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter((a: JobApplication) => a.status === "pending").length,
    shortlisted: applications.filter((a: JobApplication) => a.status === "shortlisted").length,
    hired: applications.filter((a: JobApplication) => a.status === "hired").length
  };

  const openEmailDialog = (app: JobApplication, templateKey: keyof typeof EMAIL_TEMPLATES) => {
    const template = EMAIL_TEMPLATES[templateKey];
    setSelectedApplication(app);
    setEmailData({
      subject: template.subject,
      body: template.body.replace(/{name}/g, app.name).replace(/{position}/g, app.position),
      newStatus: templateKey
    });
    setEmailDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">HR Portal</h1>
              <p className="text-muted-foreground">Manage job applications and recruitment</p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/admin")}>
              Back to Dashboard
            </Button>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Applications</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-100">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.shortlisted}</p>
                    <p className="text-sm text-muted-foreground">Shortlisted</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-emerald-100">
                    <UserCheck className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.hired}</p>
                    <p className="text-sm text-muted-foreground">Hired</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or position..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Applications</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="interviewed">Interviewed</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredApplications.length === 0 ? (
            <Card className="border-none shadow-sm">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all" 
                    ? "Try adjusting your filters" 
                    : "Applications will appear here when candidates apply"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app: JobApplication) => {
                const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                const StatusIcon = statusConfig.icon;
                
                return (
                  <Card key={app.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Briefcase className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-lg">{app.name}</h3>
                                <Badge className={statusConfig.color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusConfig.label}
                                </Badge>
                              </div>
                              <p className="text-primary font-medium">{app.position}</p>
                              <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" /> {app.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" /> {app.mobile}
                                </span>
                                {app.currentLocation && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {app.currentLocation}
                                  </span>
                                )}
                                {app.experience && (
                                  <span className="flex items-center gap-1">
                                    <GraduationCap className="h-3 w-3" /> {app.experience} exp
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Applied: {new Date(app.createdAt).toLocaleDateString('en-IN', { 
                                  day: 'numeric', month: 'short', year: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => { setSelectedApplication(app); setViewDialogOpen(true); }}
                          >
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                          
                          {app.status === "pending" && (
                            <>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => openEmailDialog(app, "shortlisted")}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" /> Shortlist
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => openEmailDialog(app, "rejected")}
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          
                          {app.status === "shortlisted" && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => openEmailDialog(app, "interviewed")}
                            >
                              <Calendar className="h-4 w-4 mr-1" /> Schedule Interview
                            </Button>
                          )}
                          
                          {app.status === "interviewed" && (
                            <>
                              <Button 
                                variant="default" 
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => openEmailDialog(app, "hired")}
                              >
                                <UserCheck className="h-4 w-4 mr-1" /> Hire
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => openEmailDialog(app, "rejected")}
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      
      <Footer />

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              {selectedApplication?.position} - Applied on {selectedApplication && new Date(selectedApplication.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{selectedApplication.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Position</Label>
                  <p className="font-medium">{selectedApplication.position}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedApplication.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Mobile</Label>
                  <p className="font-medium">{selectedApplication.mobile}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="font-medium">{selectedApplication.currentLocation || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Education</Label>
                  <p className="font-medium">{selectedApplication.education || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Experience</Label>
                  <p className="font-medium">{selectedApplication.experience || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={STATUS_CONFIG[selectedApplication.status]?.color}>
                    {STATUS_CONFIG[selectedApplication.status]?.label}
                  </Badge>
                </div>
              </div>
              
              {selectedApplication.resumeUrl && (
                <div>
                  <Label className="text-muted-foreground">Resume Link</Label>
                  <a 
                    href={selectedApplication.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline block"
                  >
                    {selectedApplication.resumeUrl}
                  </a>
                </div>
              )}
              
              {selectedApplication.coverLetter && (
                <div>
                  <Label className="text-muted-foreground">Cover Letter</Label>
                  <p className="mt-1 p-4 bg-slate-50 rounded-lg text-sm whitespace-pre-wrap">
                    {selectedApplication.coverLetter}
                  </p>
                </div>
              )}
              
              {selectedApplication.reviewNotes && (
                <div>
                  <Label className="text-muted-foreground">HR Notes</Label>
                  <p className="mt-1 p-4 bg-yellow-50 rounded-lg text-sm">
                    {selectedApplication.reviewNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Email to Candidate
            </DialogTitle>
            <DialogDescription>
              This will send an email to {selectedApplication?.email} and update the application status
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="emailSubject">Subject</Label>
              <Input
                id="emailSubject"
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="emailBody">Message</Label>
              <Textarea
                id="emailBody"
                value={emailData.body}
                onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
                rows={10}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedApplication) {
                  sendEmail.mutate({
                    applicationId: selectedApplication.id,
                    subject: emailData.subject,
                    body: emailData.body,
                    newStatus: emailData.newStatus
                  });
                }
              }}
              disabled={sendEmail.isPending}
            >
              {sendEmail.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email & Update Status
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
