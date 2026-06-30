import React from 'react';
import { Shield, Target, Heart, Users, Award, Building, Phone, Mail, MapPin } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-center">
          <p className="text-amber-800 text-sm font-medium">
            <strong>Important Notice:</strong> Raksha Assist is a membership-based emergency assistance and coordination platform. 
            This is NOT an insurance product, TPA service, or financial guarantee program.
          </p>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 font-heading">About Raksha Assist</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Emergency assistance, coordination, and guidance during critical situations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-primary">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              To provide emergency support, coordination, and guidance during medical or critical situations. We connect members with partner hospitals and assist in emergency coordination on a best-effort basis.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-primary">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Emergency Coordination</p>
                  <p className="text-xs text-muted-foreground">We coordinate with partner hospitals to facilitate emergency assistance for our members.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Transparent Membership</p>
                  <p className="text-xs text-muted-foreground">Clear service contract under Indian Contract Act, 1872 with defined scope and limitations.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">What We Are</h2>
            <p className="text-muted-foreground mb-4">
              Raksha Assist is a technology-driven emergency assistance and coordination platform operated by Mindwhile IT Solutions Pvt Ltd. 
              We provide membership-based access to emergency assistance services only.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <p className="text-red-800 text-sm font-medium mb-2">What We Are NOT:</p>
              <ul className="text-red-700 text-xs space-y-1">
                <li>- NOT an insurance company or product</li>
                <li>- NOT a Third Party Administrator (TPA)</li>
                <li>- NOT a financial guarantee or compensation provider</li>
                <li>- Does NOT replace hospitals, emergency services, or insurance</li>
              </ul>
            </div>
            <p className="text-muted-foreground mt-4 text-sm">
              Our network spans 500+ partner hospitals. All services are provided on a best-effort basis and subject to terms and conditions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
            <p className="text-3xl font-bold text-primary mb-1">500+</p>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Hospitals</p>
          </div>
          <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
            <p className="text-3xl font-bold text-primary mb-1">10k+</p>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Members</p>
          </div>
          <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
            <p className="text-3xl font-bold text-primary mb-1">24/7</p>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Support</p>
          </div>
          <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
            <p className="text-3xl font-bold text-primary mb-1">Instant</p>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Approval</p>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;
