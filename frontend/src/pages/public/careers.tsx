import React, { useState } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Users, 
  Heart, 
  Zap,
  CheckCircle2,
  Send,
  Building2,
  GraduationCap
} from "lucide-react";

const jobOpenings = [
  {
    id: "partner",
    title: "Business Partner (Agent)",
    department: "Sales",
    location: "Pan India",
    type: "Commission Based",
    description: "Join as a Raksha Assist Partner and help families get emergency medical support. Earn 15% commission on every membership sold.",
    requirements: ["Basic smartphone with internet", "Good communication skills", "Passion to help people", "Age 18+"]
  },
  {
    id: "employee",
    title: "Customer Support Executive",
    department: "Operations",
    location: "Bengaluru, KA",
    type: "Full Time",
    description: "Handle customer queries, assist with emergency cases, and ensure smooth member experience.",
    requirements: ["Graduate in any discipline", "Telugu & English fluency", "1+ year customer service experience", "Computer literacy"]
  },
  {
    id: "accountant",
    title: "Accounts Executive",
    department: "Finance",
    location: "Bengaluru, KA",
    type: "Full Time",
    description: "Manage financial transactions, GST filings, partner payouts, and revenue reporting.",
    requirements: ["B.Com / M.Com degree", "Tally & Excel proficiency", "2+ years accounting experience", "GST knowledge"]
  },
  {
    id: "marketing",
    title: "Digital Marketing Specialist",
    department: "Marketing",
    location: "Remote / Hybrid",
    type: "Full Time",
    description: "Drive brand awareness, manage social media, create campaigns, and grow our member base.",
    requirements: ["Marketing degree preferred", "Social media expertise", "Content creation skills", "Analytics experience"]
  }
];

const benefits = [
  { icon: Heart, title: "Health Benefits", description: "Free Raksha Assist membership for you and family" },
  { icon: Zap, title: "Fast Growth", description: "Performance-based promotions and incentives" },
  { icon: Users, title: "Great Team", description: "Work with passionate people making a difference" },
  { icon: GraduationCap, title: "Learning", description: "Continuous training and skill development" }
];

export default function Careers() {
  const { toast } = useToast();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    position: "",
    experience: "",
    currentLocation: "",
    education: "",
    resumeUrl: "",
    coverLetter: ""
  });

  const submitApplication = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit application");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you soon.",
      });
      setFormData({
        name: "",
        email: "",
        mobile: "",
        position: "",
        experience: "",
        currentLocation: "",
        education: "",
        resumeUrl: "",
        coverLetter: ""
      });
      setSelectedJob(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleApply = (jobId: string) => {
    setSelectedJob(jobId);
    const job = jobOpenings.find(j => j.id === jobId);
    if (job) {
      setFormData(prev => ({ ...prev, position: job.title }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.mobile || !formData.position) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    submitApplication.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-none">We're Hiring</Badge>
            <h1 className="text-4xl font-bold text-slate-900 mb-4 font-heading">Join Our Mission</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Help us transform emergency medical assistance in India. Be part of a team that saves lives every day.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {benefits.map((benefit, i) => (
              <Card key={i} className="border-none shadow-sm text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-6">Open Positions</h2>
          
          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            {jobOpenings.map((job) => (
              <Card key={job.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription className="flex flex-wrap gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs">
                          <Building2 className="h-3 w-3" /> {job.department}
                        </span>
                        <span className="flex items-center gap-1 text-xs">
                          <MapPin className="h-3 w-3" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1 text-xs">
                          <Clock className="h-3 w-3" /> {job.type}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">{job.department}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{job.description}</p>
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Requirements:</p>
                    <ul className="space-y-1">
                      {job.requirements.map((req, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleApply(job.id)}
                    variant={selectedJob === job.id ? "secondary" : "default"}
                  >
                    {selectedJob === job.id ? "Selected" : "Apply Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedJob && (
            <Card className="border-none shadow-lg" id="application-form">
              <CardHeader className="bg-primary text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Application Form
                </CardTitle>
                <CardDescription className="text-white/80">
                  Applying for: {formData.position}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile Number *</Label>
                      <Input
                        id="mobile"
                        value={formData.mobile}
                        onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                        placeholder="+91 XXXXXXXXXX"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Current Location *</Label>
                      <Input
                        id="location"
                        value={formData.currentLocation}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentLocation: e.target.value }))}
                        placeholder="City, State"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="education">Highest Education</Label>
                      <Select 
                        value={formData.education} 
                        onValueChange={(v) => setFormData(prev => ({ ...prev, education: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select education" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10th">10th Pass</SelectItem>
                          <SelectItem value="12th">12th Pass</SelectItem>
                          <SelectItem value="graduate">Graduate</SelectItem>
                          <SelectItem value="post_graduate">Post Graduate</SelectItem>
                          <SelectItem value="professional">Professional Degree</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Select 
                        value={formData.experience} 
                        onValueChange={(v) => setFormData(prev => ({ ...prev, experience: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fresher">Fresher</SelectItem>
                          <SelectItem value="1-2">1-2 Years</SelectItem>
                          <SelectItem value="2-5">2-5 Years</SelectItem>
                          <SelectItem value="5+">5+ Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="resumeUrl">Resume/CV Link (Google Drive, Dropbox, etc.)</Label>
                    <Input
                      id="resumeUrl"
                      value={formData.resumeUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, resumeUrl: e.target.value }))}
                      placeholder="https://drive.google.com/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">Why do you want to join Raksha Assist?</Label>
                    <Textarea
                      id="coverLetter"
                      value={formData.coverLetter}
                      onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
                      placeholder="Tell us about yourself and why you're interested in this role..."
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setSelectedJob(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={submitApplication.isPending}
                    >
                      {submitApplication.isPending ? (
                        "Submitting..."
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="mt-16 text-center p-8 bg-primary/5 rounded-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Don't see a role that fits?</h3>
            <p className="text-muted-foreground mb-4">
              We're always looking for talented people. Send your resume to careers@rakshaassist.com
            </p>
            <Button variant="outline">
              Contact HR Team
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
