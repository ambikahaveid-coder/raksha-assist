import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Star, Phone, Calendar, User, Users, Download, RotateCcw, AlertTriangle, Info } from "lucide-react";
import logo from "@/assets/logo.png";
import html2canvas from "html2canvas";

interface FamilyMember {
  name: string;
  relation: string;
  dob?: string;
  gender?: string;
  age?: number;
}

interface DigitalHealthCardProps {
  memberName: string;
  memberPhone: string;
  memberDob?: string;
  membershipNumber: string;
  planType: string;
  planAmount: number;
  coverageAmount: number;
  activationDate: string;
  expiryDate: string;
  familyMembers?: FamilyMember[];
  status: string;
}

export function DigitalHealthCard({
  memberName,
  memberPhone,
  memberDob,
  membershipNumber,
  planType,
  planAmount,
  coverageAmount,
  activationDate,
  expiryDate,
  familyMembers = [],
  status
}: DigitalHealthCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const link = document.createElement('a');
      link.download = `RakshaAssist-${membershipNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };
  
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const calculateAge = (dob: string) => {
    try {
      const today = new Date();
      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  const isFamilyPlan = planType.toLowerCase().includes('family') || planType.toLowerCase().includes('gold') || planType.toLowerCase().includes('platinum');

  return (
    <div className="w-full max-w-md mx-auto perspective-1000">
      <div 
        ref={cardRef}
        className={`relative w-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
        onClick={() => isFamilyPlan && familyMembers.length > 0 && setIsFlipped(!isFlipped)}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <Card 
          className={`w-full aspect-[1.6/1] rounded-2xl overflow-hidden shadow-2xl border-0 ${isFlipped ? 'invisible' : 'visible'}`}
          style={{ 
            background: 'linear-gradient(135deg, #0B1F3A 0%, #1a3a5c 50%, #0B1F3A 100%)',
            backfaceVisibility: 'hidden'
          }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          </div>
          
          <div className="relative h-full p-5 flex flex-col justify-between text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl p-1.5 shadow-lg">
                  <img src={logo} alt="Raksha Assist" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-wide">RAKSHA ASSIST</h2>
                  <p className="text-[10px] text-teal-300 font-medium">Emergency Medical Assistance</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] px-2 py-0.5 flex items-center gap-1 border-0">
                  <Star className="h-3 w-3 fill-current" />
                  Digital Card
                </Badge>
                <Badge className={`text-[10px] px-2 py-0.5 border-0 ${status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`}>
                  {status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Member Name</p>
                <p className="text-xl font-bold tracking-wide">{memberName || 'Member Name'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Raksha ID</p>
                  <p className="text-sm font-semibold font-mono">{membershipNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Plan Type</p>
                  <p className="text-sm font-semibold">{planType}</p>
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div className="grid grid-cols-3 gap-4 flex-1">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Mobile
                  </p>
                  <p className="text-xs font-medium">{memberPhone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Valid From
                  </p>
                  <p className="text-xs font-medium">{formatDate(activationDate)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Valid Till
                  </p>
                  <p className="text-xs font-medium">{formatDate(expiryDate)}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Support</p>
                <p className="text-lg font-bold text-teal-400">₹{coverageAmount.toLocaleString()}</p>
              </div>
            </div>

            {isFamilyPlan && familyMembers.length > 0 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[10px] text-gray-400">
                <RotateCcw className="h-3 w-3" />
                <span>Tap to see family members</span>
              </div>
            )}
          </div>
        </Card>

        {isFamilyPlan && familyMembers.length > 0 && (
          <Card 
            className={`w-full aspect-[1.6/1] rounded-2xl overflow-hidden shadow-2xl border-0 absolute top-0 left-0 ${isFlipped ? 'visible' : 'invisible'}`}
            style={{ 
              background: 'linear-gradient(135deg, #1a3a5c 0%, #0B1F3A 50%, #1a3a5c 100%)',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="relative h-full p-5 flex flex-col text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal-400" />
                  <h3 className="text-sm font-bold">Family Members</h3>
                </div>
                <Badge className="bg-teal-600 text-white text-[10px] border-0">
                  {familyMembers.length + 1} Members
                </Badge>
              </div>

              <div className="flex-1 space-y-2 overflow-auto">
                <div className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      P
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{memberName}</p>
                      <p className="text-[10px] text-gray-400">Primary • {memberDob ? calculateAge(memberDob) + ' yrs' : 'Self'}</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-400 text-[10px] border-0">Primary</Badge>
                </div>

                {familyMembers.slice(0, 3).map((member, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${member.gender === 'female' ? 'bg-pink-500' : 'bg-blue-500'} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{member.name}</p>
                        <p className="text-[10px] text-gray-400">
                          {member.relation} • {member.age || (member.dob && calculateAge(member.dob)) || 'N/A'} yrs • {member.gender === 'female' ? 'F' : 'M'}
                        </p>
                      </div>
                    </div>
                    {member.dob && (
                      <span className="text-[10px] text-gray-400">{formatDate(member.dob)}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[10px] text-gray-400">
                <RotateCcw className="h-3 w-3" />
                <span>Tap to flip back</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="mt-4 text-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          disabled={isDownloading}
        >
          <Download className="h-4 w-4" />
          {isDownloading ? 'Downloading...' : 'Download Card'}
        </Button>
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-amber-50 rounded-lg border border-red-200">
        <div className="flex items-center gap-2 mb-2">
          <Phone className="h-4 w-4 text-red-600" />
          <span className="text-sm font-bold text-red-700">24/7 Emergency Helpline</span>
        </div>
        <p className="text-lg font-bold text-red-800 mb-1">+91 81437 52025</p>
        <p className="text-xs text-slate-600">WhatsApp: +91 81437 52025</p>
      </div>

      <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-teal-600" />
          <span className="text-xs font-semibold text-slate-700">Mindwhile IT Solutions Pvt. Ltd.</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Email: support@rakshaassist.com
          <br />
          Registered Office: 2nd & 3rd Floor, 3rd Block, 12th Main, Bashyam Circle, Rajajinagar, Bengaluru - 560 010
          <br />
          Jurisdiction: Courts of Bengaluru, Karnataka
        </p>
      </div>

      <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-semibold text-blue-700">Important Instructions</span>
        </div>
        <ul className="text-[10px] text-slate-600 space-y-1 list-disc list-inside">
          <li>Call emergency helpline immediately during any medical emergency</li>
          <li>Keep this digital card accessible on your phone at all times</li>
          <li>Share card details with hospital staff for cashless treatment</li>
          <li>Report any suspicious activity to prevent fraud</li>
          <li>Membership benefits are non-transferable</li>
        </ul>
      </div>

      <div className="mt-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-semibold text-amber-700">Fraud Alert</span>
        </div>
        <p className="text-[10px] text-slate-600 leading-relaxed">
          Raksha Assist never asks for OTP, passwords, or payment details via calls/SMS. 
          Report suspicious activities immediately to our helpline. Do not share your 
          membership details with unauthorized persons.
        </p>
      </div>
    </div>
  );
}
