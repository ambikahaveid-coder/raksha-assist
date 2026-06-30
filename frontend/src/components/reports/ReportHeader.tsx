import { Shield, Phone, Mail, MapPin, Calendar } from "lucide-react";
import logo from "@/assets/logo.png";

interface ReportHeaderProps {
  title: string;
  subtitle?: string;
  dateRange?: string;
}

export function ReportHeader({ title, subtitle, dateRange }: ReportHeaderProps) {
  return (
    <div className="bg-white border-b-2 border-teal-600 pb-4 mb-6 print:mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl p-2 shadow-lg print:shadow-none">
            <img src={logo} alt="Raksha Assist" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">RAKSHA ASSIST</h1>
            <p className="text-sm text-teal-600 font-medium">Emergency Medical Assistance Platform</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> +91 81437 52025
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> support@rakshaassist.com
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg mb-2">
            <Shield className="h-4 w-4 text-teal-600" />
            <span className="text-xs font-medium text-slate-700">Official Report</span>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1 justify-end">
            <Calendar className="h-3 w-3" />
            Generated: {new Date().toLocaleDateString('en-IN', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          {dateRange && (
            <p className="text-xs text-slate-500 mt-1">Period: {dateRange}</p>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
