import { useRef, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { 
  Download, 
  Share2, 
  ShieldCheck, 
  User, 
  CreditCard, 
  Calendar, 
  Phone, 
  MapPin,
  HeartPulse,
  Loader2,
  FileText,
  ChevronDown
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import logoImg from "@/assets/logo.png";

export default function MembershipCard() {
  const [, setLocation] = useLocation();
  const cardRef = useRef<HTMLDivElement>(null);
  const { user, membership, isLoading, isAuthenticated } = useAuth();
  
  if (!membership || membership.paymentStatus !== "completed") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <AuthNavbar />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <Card className="max-w-md border-none shadow-lg">
            <CardContent className="p-8 text-center">
              <CreditCard className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <h2 className="text-xl font-bold mb-2">No Active Membership</h2>
              <p className="text-muted-foreground mb-6">
                Complete your payment to activate your membership and get your digital card.
              </p>
              <Button onClick={() => setLocation("/payment")} className="w-full" data-testid="button-get-membership">
                Get Membership Now
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const memberData = {
    name: user?.name || "Member",
    id: membership.membershipNumber,
    cardNumber: `${membership.membershipNumber.replace("RA-", "4829 10")} 3847`,
    plan: `${membership.planType?.charAt(0).toUpperCase()}${membership.planType?.slice(1)} Care`,
    validUntil: membership.expiryDate ? new Date(membership.expiryDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A",
    coverage: membership.coverageAmount || 300000,
    bloodGroup: user?.bloodGroup || "Not Set",
    emergencyContact: user?.emergencyContactPhone || user?.mobile || "Not Set",
    status: membership.status?.toUpperCase() || "ACTIVE"
  };

  const handleDownload = () => {
    // Compact, clean & professional PDF - fits perfectly on one A4 page
    const startDate = membership.startDate ? new Date(membership.startDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A";
    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Raksha Assist - Membership Certificate</title>
  <style>
    @page { size: A4; margin: 8mm; }
    @media print { body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9px; line-height: 1.4; color: #1e293b; background: white; }
    
    .page { max-width: 194mm; margin: 0 auto; }
    
    /* Header */
    .header { background: linear-gradient(135deg, #1e40af 0%, #172554 100%); color: white; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-radius: 6px 6px 0 0; }
    .logo-section { display: flex; align-items: center; gap: 8px; }
    .logo-box { width: 32px; height: 32px; background: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
    .logo-box svg { width: 24px; height: 24px; }
    .brand-name { font-size: 18px; font-weight: 700; }
    .brand-name .orange { color: #f97316; }
    .brand-tagline { font-size: 8px; color: rgba(255,255,255,0.7); letter-spacing: 1px; text-transform: uppercase; }
    .doc-title { font-size: 12px; font-weight: 700; color: #f97316; }
    .doc-number { font-size: 9px; color: rgba(255,255,255,0.8); }
    
    /* Company Bar */
    .company-bar { background: #0f172a; padding: 6px 16px; font-size: 8px; color: #94a3b8; border-bottom: 2px solid #f97316; }
    .company-bar strong { color: #f97316; }
    
    /* Main Grid Layout */
    .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 12px 16px; }
    
    /* Member Card */
    .member-card { background: linear-gradient(135deg, #1e40af 0%, #172554 100%); border-radius: 10px; padding: 14px; color: white; position: relative; overflow: hidden; }
    .member-card::after { content: ''; position: absolute; bottom: -30px; left: -30px; width: 80px; height: 80px; background: #f97316; border-radius: 50%; filter: blur(40px); opacity: 0.3; }
    .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; position: relative; z-index: 1; }
    .card-brand { font-size: 14px; font-weight: 700; }
    .card-brand .orange { color: #f97316; }
    .status-badge { background: rgba(34,197,94,0.9); padding: 3px 8px; border-radius: 10px; font-size: 8px; font-weight: 700; }
    .card-name { font-size: 16px; font-weight: 700; margin-bottom: 8px; position: relative; z-index: 1; }
    .card-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; position: relative; z-index: 1; }
    .card-field-label { font-size: 7px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px; }
    .card-field-value { font-size: 10px; font-weight: 600; }
    .card-bottom { margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2); display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
    .card-number { font-size: 11px; font-family: monospace; letter-spacing: 2px; }
    .card-plan { background: #f97316; padding: 3px 8px; border-radius: 4px; font-size: 8px; font-weight: 700; }
    
    /* Coverage Box */
    .coverage-box { background: #0f172a; border-radius: 10px; padding: 14px; color: white; display: flex; flex-direction: column; justify-content: center; }
    .coverage-label { font-size: 8px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .coverage-amount { font-size: 28px; font-weight: 800; color: #f97316; margin-bottom: 10px; }
    .validity-row { display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); }
    .validity-item { }
    .validity-label { font-size: 7px; color: #64748b; }
    .validity-value { font-size: 10px; font-weight: 600; color: white; }
    
    /* Benefits Row */
    .benefits-row { grid-column: span 2; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .benefit-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; text-align: center; }
    .benefit-icon { font-size: 16px; margin-bottom: 2px; }
    .benefit-value { font-size: 12px; font-weight: 700; color: #0f172a; }
    .benefit-label { font-size: 7px; color: #64748b; }
    
    /* Sections */
    .section-row { grid-column: span 2; }
    .section-title { font-size: 10px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; padding-left: 8px; border-left: 3px solid #f97316; }
    
    /* Coverage List */
    .coverage-list { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
    .coverage-item { display: flex; align-items: center; gap: 4px; font-size: 8px; padding: 4px 6px; background: #f8fafc; border-radius: 4px; }
    .coverage-item.yes { border-left: 2px solid #22c55e; }
    .coverage-item.no { border-left: 2px solid #ef4444; }
    
    /* Emergency */
    .emergency-row { grid-column: span 2; background: linear-gradient(90deg, #fef2f2, #fee2e2); border: 1px solid #fca5a5; border-radius: 8px; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; }
    .emergency-left { display: flex; align-items: center; gap: 10px; }
    .emergency-icon { font-size: 20px; }
    .emergency-text { }
    .emergency-label { font-size: 8px; color: #991b1b; font-weight: 600; }
    .emergency-number { font-size: 18px; font-weight: 800; color: #dc2626; }
    .emergency-note { font-size: 8px; color: #7f1d1d; max-width: 200px; }
    
    /* Claim Steps */
    .claim-row { grid-column: span 2; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .claim-step { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; text-align: center; }
    .step-num { width: 20px; height: 20px; background: #1e40af; color: #f97316; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 10px; margin-bottom: 4px; }
    .step-title { font-size: 9px; font-weight: 600; color: #0f172a; }
    .step-desc { font-size: 7px; color: #64748b; }
    
    /* Terms Grid */
    .terms-row { grid-column: span 2; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .terms-box { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 6px; padding: 8px; }
    .terms-title { font-size: 9px; font-weight: 700; color: #92400e; margin-bottom: 6px; }
    .terms-list { font-size: 7px; color: #78350f; padding-left: 12px; margin: 0; }
    .terms-list li { margin-bottom: 2px; }
    .privacy-box { background: #f0f9ff; border: 1px solid #7dd3fc; border-radius: 6px; padding: 8px; }
    .privacy-title { font-size: 9px; font-weight: 700; color: #0369a1; margin-bottom: 4px; }
    .privacy-text { font-size: 7px; color: #0c4a6e; }
    
    /* Disclaimer */
    .disclaimer-row { grid-column: span 2; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 8px; text-align: center; }
    .disclaimer-text { font-size: 8px; color: #92400e; font-weight: 600; }
    
    /* Footer */
    .footer { background: #0f172a; color: white; padding: 10px 16px; border-radius: 0 0 6px 6px; display: flex; justify-content: space-between; align-items: center; }
    .footer-col { }
    .footer-title { color: #f97316; font-weight: 700; font-size: 7px; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 3px; }
    .footer-text { font-size: 7px; color: rgba(255,255,255,0.7); line-height: 1.5; }
    .footer-center { text-align: center; font-size: 7px; color: rgba(255,255,255,0.5); }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo-section">
        <div class="logo-box">
          <svg viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1e40af"/><stop offset="100%" style="stop-color:#f97316"/></linearGradient></defs><path d="M50 5 L90 20 L90 45 C90 70 70 90 50 95 C30 90 10 70 10 45 L10 20 Z" fill="url(#g)"/><path d="M50 25 L65 35 L65 50 C65 62 58 72 50 75 C42 72 35 62 35 50 L35 35 Z" fill="white"/><circle cx="50" cy="48" r="8" fill="#f97316"/></svg>
        </div>
        <div><div class="brand-name">Raksha<span class="orange">Assist</span></div><div class="brand-tagline">Emergency Medical Assistance</div></div>
      </div>
      <div style="text-align:right"><div class="doc-title">MEMBERSHIP CERTIFICATE</div><div class="doc-number">No: ${memberData.id}</div></div>
    </div>
    
    <div class="company-bar"><strong>Mindwhile IT Solutions Pvt. Ltd.</strong> | CIN: U72900TG2024PTC189456 | 2nd & 3rd Floor, 3rd Block, 12th Main, Bashyam Circle, Rajajinagar, Bengaluru - 560 010 | support@rakshaassist.com | www.rakshaassist.com</div>
    
    <div class="main-grid">
      <div class="member-card">
        <div class="card-top"><div class="card-brand">Raksha<span class="orange">Assist</span></div><div class="status-badge">${memberData.status}</div></div>
        <div class="card-name">${memberData.name}</div>
        <div class="card-info">
          <div><div class="card-field-label">Member ID</div><div class="card-field-value">${memberData.id}</div></div>
          <div><div class="card-field-label">Valid Until</div><div class="card-field-value">${memberData.validUntil}</div></div>
        </div>
        <div class="card-bottom"><div class="card-number">${memberData.cardNumber}</div><div class="card-plan">${memberData.plan}</div></div>
      </div>
      
      <div class="coverage-box">
        <div class="coverage-label">Maximum Support</div>
        <div class="coverage-amount">₹${memberData.coverage.toLocaleString()}</div>
        <div class="validity-row">
          <div class="validity-item"><div class="validity-label">From</div><div class="validity-value">${startDate}</div></div>
          <div class="validity-item"><div class="validity-label">To</div><div class="validity-value">${memberData.validUntil}</div></div>
        </div>
      </div>
      
      <div class="benefits-row">
        <div class="benefit-item"><div class="benefit-icon">🏥</div><div class="benefit-value">500+</div><div class="benefit-label">Hospitals</div></div>
        <div class="benefit-item"><div class="benefit-icon">⏰</div><div class="benefit-value">24 Hrs</div><div class="benefit-label">Activation</div></div>
        <div class="benefit-item"><div class="benefit-icon">♾️</div><div class="benefit-value">Unlimited</div><div class="benefit-label">Claims</div></div>
        <div class="benefit-item"><div class="benefit-icon">🚑</div><div class="benefit-value">24/7</div><div class="benefit-label">Support</div></div>
      </div>
      
      <div class="section-row">
        <div class="section-title">Support Details</div>
        <div class="coverage-list">
          <div class="coverage-item yes">✅ Road Accidents</div>
          <div class="coverage-item yes">✅ Emergency Hospital</div>
          <div class="coverage-item yes">✅ ICU Care</div>
          <div class="coverage-item yes">✅ Surgery</div>
          <div class="coverage-item yes">✅ Ambulance</div>
          <div class="coverage-item yes">✅ Burns</div>
          <div class="coverage-item no">❌ Pre-existing</div>
          <div class="coverage-item no">❌ Planned Surgery</div>
          <div class="coverage-item no">❌ Cosmetic</div>
          <div class="coverage-item no">❌ Self-inflicted</div>
          <div class="coverage-item no">❌ Alcohol/Drugs</div>
          <div class="coverage-item no">❌ War/Terror</div>
        </div>
      </div>
      
      <div class="emergency-row">
        <div class="emergency-left">
          <div class="emergency-icon">🚨</div>
          <div class="emergency-text"><div class="emergency-label">24/7 EMERGENCY HELPLINE</div><div class="emergency-number">+91 81437 52025</div></div>
        </div>
        <div class="emergency-note">Call immediately in emergency. We'll guide you to nearest network hospital.</div>
      </div>
      
      <div class="section-row"><div class="section-title">How to Claim</div></div>
      <div class="claim-row">
        <div class="claim-step"><div class="step-num">1</div><div class="step-title">Call Helpline</div><div class="step-desc">24/7 available</div></div>
        <div class="claim-step"><div class="step-num">2</div><div class="step-title">Go to Hospital</div><div class="step-desc">Network hospital</div></div>
        <div class="claim-step"><div class="step-num">3</div><div class="step-title">Show Card</div><div class="step-desc">Present this card</div></div>
        <div class="claim-step"><div class="step-num">4</div><div class="step-title">Get Treatment</div><div class="step-desc">Cashless care</div></div>
      </div>
      
      <div class="terms-row">
        <div class="terms-box">
          <div class="terms-title">⚠️ Terms & Conditions</div>
          <ol class="terms-list">
            <li>Membership program, NOT insurance</li>
            <li>Network hospitals only</li>
            <li>Starts 24 hrs after activation</li>
            <li>Call helpline within 24 hrs</li>
            <li>Subject to verification</li>
            <li>Limited to plan amount</li>
            <li>Fraud = termination</li>
            <li>Renew before expiry</li>
          </ol>
        </div>
        <div class="privacy-box">
          <div class="privacy-title">🔒 Privacy & Disclaimer</div>
          <div class="privacy-text" style="margin-bottom:6px">Your data is encrypted and protected under our Privacy Policy. Visit www.rakshaassist.com/privacy</div>
          <div class="privacy-text" style="background:#fef3c7;padding:4px;border-radius:3px;color:#92400e;font-weight:600">⚠️ This is NOT an insurance product. Raksha Assist is an emergency medical assistance program by Mindwhile IT Solutions Pvt. Ltd. Not regulated by IRDAI.</div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-col"><div class="footer-title">Office</div><div class="footer-text">2nd & 3rd Floor, 3rd Block, Rajajinagar, Bengaluru - 560 010</div></div>
      <div class="footer-center">© ${new Date().getFullYear()} Mindwhile IT Solutions Pvt. Ltd. | CIN: U72900TG2024PTC189456<br>Generated: ${new Date().toLocaleDateString('en-IN')}</div>
      <div class="footer-col" style="text-align:right"><div class="footer-title">Contact</div><div class="footer-text">+91 81437 52025 | support@rakshaassist.com</div></div>
    </div>
  </div>
</body>
</html>`;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      alert('Please allow popups to download your membership card as PDF');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Raksha Assist Membership',
      text: `My Raksha Assist Membership\nMember ID: ${memberData.id}\nPlan: ${memberData.plan}\nSupport: ₹${memberData.coverage.toLocaleString()}`,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed - copy to clipboard as fallback
        try {
          await navigator.clipboard.writeText(shareData.text);
          alert('Share cancelled. Details copied to clipboard.');
        } catch { /* ignore */ }
      }
    } else {
      navigator.clipboard.writeText(shareData.text);
      alert('Membership details copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AuthNavbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Digital Membership Card</h1>
              <p className="text-muted-foreground">Carry your protection everywhere you go.</p>
            </div>
            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="shadow-lg shadow-primary/20" data-testid="button-download-pdf">
                    <Download className="mr-2 h-4 w-4" />
                    Download Documents
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Membership Documents</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Digital Card (Quick Print)
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => window.open(`/api/memberships/${membership.id}/certificate-pdf`, '_blank')}
                    className="cursor-pointer"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Membership Certificate (PDF)
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => window.open(`/api/memberships/${membership.id}/agreement-pdf`, '_blank')}
                    className="cursor-pointer"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Membership Agreement (PDF)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Policy Documents</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => window.open('/api/policies/plan_terms/pdf', '_blank')}
                    className="cursor-pointer"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Plan Terms & Conditions
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => window.open('/api/policies/addon_terms/pdf', '_blank')}
                    className="cursor-pointer"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Add-On Benefits Terms
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => window.open('/api/policies/refund_policy/pdf', '_blank')}
                    className="cursor-pointer"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Refund & Cancellation Policy
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={handleShare} data-testid="button-share">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div 
                ref={cardRef}
                className="aspect-[1.586/1] w-full bg-gradient-to-br from-primary via-primary to-[#002B70] rounded-[24px] p-6 text-white relative overflow-hidden shadow-2xl shadow-primary/40 ring-1 ring-white/20"
                data-testid="membership-card-visual"
              >
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <ShieldCheck className="w-48 h-48" />
                </div>
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-secondary rounded-full blur-3xl opacity-20"></div>
                
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <img src={logoImg} alt="Logo" className="h-10 w-10 rounded-md object-contain bg-white/90 p-1" />
                      <span className="font-heading font-bold text-lg tracking-tight">RakshaAssist</span>
                    </div>
                    <Badge className="bg-white/20 text-white border-none backdrop-blur-md" data-testid="badge-status">
                      {memberData.status}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] mb-1">Card Holder</p>
                    <h2 className="text-2xl font-bold tracking-tight mb-4" data-testid="text-card-name">{memberData.name}</h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/60 text-[8px] uppercase tracking-[0.2em] mb-0.5">Member ID</p>
                        <p className="text-sm font-mono font-bold" data-testid="text-member-id">{memberData.id}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-[8px] uppercase tracking-[0.2em] mb-0.5">Valid Until</p>
                        <p className="text-sm font-bold" data-testid="text-valid-until">{memberData.validUntil}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <p className="text-lg font-mono tracking-widest text-white/90">
                      {memberData.cardNumber}
                    </p>
                    <div className="text-[10px] font-bold px-2 py-0.5 bg-secondary rounded text-white" data-testid="text-plan-type">
                      {memberData.plan}
                    </div>
                  </div>
                </div>
              </div>

              <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-50 p-3 rounded-xl">
                      <HeartPulse className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Emergency Info</h4>
                      <p className="text-sm text-muted-foreground mb-3">Keep this information updated for faster assistance.</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-xs text-muted-foreground block">Blood Group</span>
                          <span className="font-bold">{memberData.bloodGroup}</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-xs text-muted-foreground block">Contact</span>
                          <span className="font-bold">{memberData.emergencyContact}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-slate-900 text-white">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-slate-200">Important Notice:</strong> This digital card is valid proof of membership. 
                    Present this at any network hospital for cashless assistance. This is NOT an insurance product. 
                    Support subject to plan terms. All disputes subject to Bengaluru, Karnataka jurisdiction. 
                    For emergencies: +91 81437 52025 | support@rakshaassist.com
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Member Information</CardTitle>
                <CardDescription>Detailed membership and personal records</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <DetailItem icon={User} label="Member Name" value={memberData.name} testId="detail-name" />
                  <DetailItem icon={CreditCard} label="Member ID" value={memberData.id} testId="detail-id" />
                  <DetailItem icon={ShieldCheck} label="Membership Plan" value={memberData.plan} testId="detail-plan" />
                  <DetailItem icon={Calendar} label="Support Amount" value={`₹${memberData.coverage.toLocaleString()}`} testId="detail-coverage" />
                  <DetailItem icon={Calendar} label="Valid Until" value={memberData.validUntil} testId="detail-validity" />
                  <DetailItem icon={Phone} label="Emergency Contact" value={memberData.emergencyContact} testId="detail-contact" />
                  <DetailItem icon={MapPin} label="Region" value="All India Network" testId="detail-region" />
                </div>
                
                <div className="pt-6 border-t mt-6">
                  <h4 className="font-bold text-slate-900 mb-4">Membership Benefits</h4>
                  <ul className="space-y-3">
                    {[
                      "Hospital Direct Payment Enabled",
                      "24/7 Emergency Support Access",
                      `${memberData.plan} Benefits`,
                      "Priority Hospital Network Access",
                      "Cashless Treatment at Network Hospitals",
                      "Legal Assistance Support"
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600" data-testid={`benefit-${i}`}>
                        <div className="h-1.5 w-1.5 bg-secondary rounded-full"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full" data-testid="button-back-dashboard">
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

function DetailItem({ icon: Icon, label, value, testId }: any) {
  return (
    <div className="flex items-center gap-4" data-testid={testId}>
      <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <p className="text-slate-900 font-bold">{value}</p>
      </div>
    </div>
  );
}
