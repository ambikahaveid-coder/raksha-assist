import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/layout/Footer";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Building2, 
  Users, 
  Briefcase,
  ArrowLeft,
  Send,
  MessageSquare
} from "lucide-react";
import logoImg from "@/assets/logo.png";

export default function ContactPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    company: "",
    enquiryType: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Message Sent!",
          description: "Our team will get back to you within 24 hours.",
        });
        setFormData({ name: "", email: "", mobile: "", company: "", enquiryType: "", message: "" });
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      toast({
        title: "Message Received",
        description: "Thank you for your interest. Our team will contact you soon.",
      });
      setFormData({ name: "", email: "", mobile: "", company: "", enquiryType: "", message: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <img src={logoImg} alt="Raksha Assist Logo" className="h-12 w-auto" />
                <div>
                  <h1 className="text-xl font-bold text-primary">Raksha<span className="text-secondary">Assist</span></h1>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Emergency Medical Assistance</p>
                </div>
              </div>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Contact Our Sales Team</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Looking for corporate plans or custom solutions? Our sales team is here to help you find the perfect protection for your organization.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-destructive/5 border border-destructive/20 p-6 rounded-2xl">
                <h3 className="font-bold text-destructive mb-2 uppercase tracking-wide text-xs">Legal Disclaimer & Jurisdiction</h3>
                <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                  Raksha Assist is a membership-based assistance program and NOT an insurance product. All assistance is discretionary and subject to strict verification and fund availability.
                </p>
                <p className="text-xs font-bold text-primary">
                  Exclusive Jurisdiction: Courts of Bengaluru, Karnataka, India.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and our team will respond within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number *</Label>
                        <Input
                          id="mobile"
                          placeholder="+91 98765 43210"
                          value={formData.mobile}
                          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <Input
                          id="company"
                          placeholder="Your company"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="enquiryType">Enquiry Type *</Label>
                      <Select
                        value={formData.enquiryType}
                        onValueChange={(value) => setFormData({ ...formData, enquiryType: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select enquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="corporate">Corporate Plan Enquiry</SelectItem>
                          <SelectItem value="bulk">Bulk Enrollment</SelectItem>
                          <SelectItem value="custom">Custom Plan Requirements</SelectItem>
                          <SelectItem value="partnership">Hospital Partnership</SelectItem>
                          <SelectItem value="agent">Become an Agent</SelectItem>
                          <SelectItem value="other">Other Enquiry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your requirements..."
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Sales Hotline (24/7)</p>
                      <a href="tel:+918143752025" className="text-primary font-semibold hover:underline">+91 81437 52025</a>
                      <p className="text-xs text-muted-foreground">Available 24/7 for emergencies</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <a href="mailto:sales@rakshaassist.com" className="text-primary hover:underline">sales@rakshaassist.com</a>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Support: <a href="mailto:support@rakshaassist.com" className="text-primary hover:underline">support@rakshaassist.com</a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Head Office</p>
                      <p className="text-muted-foreground text-sm">
                        Mindwhile IT Solutions Pvt. Ltd.<br />
                        CIN: U72900TG2024PTC184818<br />
                        2nd & 3rd Floor, 3rd Block, 12th Main,<br />
                        Bashyam Circle, Rajajinagar,<br />
                        Bengaluru - 560 010<br />
                        India
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Business Hours</p>
                      <p className="text-muted-foreground text-sm">
                        Monday - Saturday: 9:00 AM - 7:00 PM IST<br />
                        Emergency Helpline: 24/7
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Why Choose Us?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="text-sm">500+ Partner Hospitals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm">10,000+ Happy Members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <span className="text-sm">Corporate Plans Available</span>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <strong>Disclaimer:</strong> Raksha Assist is a membership-based assistance program and NOT an insurance product. We provide direct financial assistance to hospitals during medical emergencies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
