import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { initSecurityMeasures } from "./lib/security";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/auth/ProtectedRoute";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { RakshaChatbot } from "@/components/chatbot/RakshaChatbot";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Register from "@/pages/auth/register";
import UserDashboard from "@/pages/dashboard/user-dashboard";
import MembershipCard from "@/pages/dashboard/membership-card";
import AdminDashboard from "@/pages/admin/dashboard";
import MobileDashboard from "@/pages/mobile/dashboard";

import Login from "@/pages/auth/login";
import OTPLogin from "@/pages/auth/otp-login";
import SuperAdminLogin from "@/pages/auth/superadmin-login";
import FranchiseLogin from "@/pages/auth/franchise-login";
import ForgotPassword from "@/pages/auth/forgot-password";
import ResetPassword from "@/pages/auth/reset-password";
import Profile from "@/pages/dashboard/profile";

import AgentDashboard from "@/pages/agent/dashboard";
import AgentRegisterMember from "@/pages/agent/register-member";
import EmployeeDashboard from "@/pages/employee/dashboard";
import SuperAdminDashboard from "@/pages/dashboard/super-admin-dashboard";
import PaymentCheckout from "@/pages/payment/checkout";
import TestPayment from "@/pages/payment/test-payment";
import ReportsDashboard from "@/pages/dashboard/reports-dashboard";
import CompanyPortal from "@/pages/public/company-portal";
import AllPlansPage from "@/pages/public/all-plans";
import AccountantDashboard from "@/pages/accountant/dashboard";
import ContactPage from "@/pages/public/contact";
import PrivacyPolicy from "@/pages/public/privacy-policy";
import TermsConditions from "@/pages/public/terms-conditions";
import AgentTerms from "@/pages/public/agent-terms";
import FranchiseTerms from "@/pages/public/franchise-terms";
import AboutUs from "@/pages/public/about-us";
import Careers from "@/pages/public/careers";
import HRPortal from "@/pages/public/hr-portal";
import FAQPage from "@/pages/public/faq-page";
import FranchiseDashboard from "@/pages/dashboard/franchise-dashboard";
import HowItWorksPage from "@/pages/public/how-it-works";
import HospitalsPage from "@/pages/public/hospitals";
import PaymentHistory from "@/pages/dashboard/payment-history";
import ShowroomLogin from "@/pages/showroom/login";
import ShowroomRegister from "@/pages/showroom/register";
import ShowroomDashboard from "@/pages/showroom/dashboard";
import ShowroomRegisterMember from "@/pages/showroom/register-member";
import ShowroomFileSOS from "@/pages/showroom/file-sos";
import MembershipAgreement from "@/pages/public/membership-agreement";

function Router() {
  useAnalytics();
  
  return (
    <Switch>
      {/* Public pages - accessible to everyone */}
      <Route path="/" component={Home} />
      <Route path="/about-us" component={AboutUs} />
      <Route path="/careers" component={Careers} />
      <Route path="/plans" component={AllPlansPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-conditions" component={TermsConditions} />
      <Route path="/agent-terms" component={AgentTerms} />
      <Route path="/franchise-terms" component={FranchiseTerms} />
      <Route path="/hr-portal" component={HRPortal} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/company-portal" component={CompanyPortal} />
      <Route path="/how-it-works" component={HowItWorksPage} />
      <Route path="/hospitals" component={HospitalsPage} />
      <Route path="/membership-agreement" component={MembershipAgreement} />
      
      {/* Auth pages - redirect to dashboard if already logged in */}
      <Route path="/register">
        <PublicOnlyRoute allowAuthenticated>
          <Register />
        </PublicOnlyRoute>
      </Route>
      <Route path="/login">
        <PublicOnlyRoute allowAuthenticated>
          <Login />
        </PublicOnlyRoute>
      </Route>
      <Route path="/otp-login">
        <PublicOnlyRoute allowAuthenticated>
          <OTPLogin />
        </PublicOnlyRoute>
      </Route>
      <Route path="/forgot-password">
        <PublicOnlyRoute allowAuthenticated>
          <ForgotPassword />
        </PublicOnlyRoute>
      </Route>
      <Route path="/reset-password">
        <PublicOnlyRoute allowAuthenticated>
          <ResetPassword />
        </PublicOnlyRoute>
      </Route>
      <Route path="/auth/admin">
        <PublicOnlyRoute>
          <SuperAdminLogin />
        </PublicOnlyRoute>
      </Route>
      <Route path="/franchise-login">
        <PublicOnlyRoute redirectTo="/franchise">
          <FranchiseLogin />
        </PublicOnlyRoute>
      </Route>

      {/* Protected: User Dashboard - any authenticated user */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <UserDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/membership-card">
        <ProtectedRoute>
          <MembershipCard />
        </ProtectedRoute>
      </Route>
      <Route path="/payment-history">
        <ProtectedRoute>
          <PaymentHistory />
        </ProtectedRoute>
      </Route>
      <Route path="/payment">
        <ProtectedRoute>
          <PaymentCheckout />
        </ProtectedRoute>
      </Route>
      <Route path="/mobile">
        <ProtectedRoute>
          <MobileDashboard />
        </ProtectedRoute>
      </Route>

      {/* Protected: Super Admin - only super_admin role */}
      <Route path="/super-admin">
        <ProtectedRoute allowedRoles={["super_admin"]} redirectTo="/auth/admin">
          <SuperAdminDashboard />
        </ProtectedRoute>
      </Route>

      {/* Protected: Admin - admin and super_admin */}
      <Route path="/admin">
        <ProtectedRoute allowedRoles={["admin", "super_admin"]} redirectTo="/login">
          <AdminDashboard />
        </ProtectedRoute>
      </Route>

      {/* Protected: Agent - agent role */}
      <Route path="/agent">
        <ProtectedRoute allowedRoles={["agent"]} redirectTo="/login">
          <AgentDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/agent/register-member">
        <ProtectedRoute allowedRoles={["agent"]} redirectTo="/login">
          <AgentRegisterMember />
        </ProtectedRoute>
      </Route>

      {/* Protected: Employee - employee role */}
      <Route path="/employee">
        <ProtectedRoute allowedRoles={["employee", "support", "marketing"]} redirectTo="/login">
          <EmployeeDashboard />
        </ProtectedRoute>
      </Route>

      {/* Protected: Accountant - accountant role */}
      <Route path="/accountant">
        <ProtectedRoute allowedRoles={["accountant", "super_admin"]} redirectTo="/login">
          <AccountantDashboard />
        </ProtectedRoute>
      </Route>

      {/* Protected: Franchise - franchise roles */}
      <Route path="/franchise">
        <ProtectedRoute allowedRoles={["zone_franchise", "state_franchise", "district_franchise", "city_franchise", "super_admin"]} redirectTo="/franchise-login">
          <FranchiseDashboard />
        </ProtectedRoute>
      </Route>

      {/* Protected: Reports - admin roles */}
      <Route path="/reports">
        <ProtectedRoute allowedRoles={["admin", "super_admin"]} redirectTo="/login">
          <ReportsDashboard />
        </ProtectedRoute>
      </Route>

      {/* Test payment - development only */}
      <Route path="/test-payment">
        <ProtectedRoute allowedRoles={["super_admin"]} redirectTo="/login">
          <TestPayment />
        </ProtectedRoute>
      </Route>

      {/* Showroom Portal - B2B Vehicle Dealership Portal */}
      <Route path="/showroom/login">
        <PublicOnlyRoute redirectTo="/showroom/dashboard">
          <ShowroomLogin />
        </PublicOnlyRoute>
      </Route>
      <Route path="/showroom/register">
        <PublicOnlyRoute redirectTo="/showroom/dashboard">
          <ShowroomRegister />
        </PublicOnlyRoute>
      </Route>
      <Route path="/showroom/dashboard">
        <ProtectedRoute allowedRoles={["showroom"]} redirectTo="/showroom/login">
          <ShowroomDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/showroom/register-member">
        <ProtectedRoute allowedRoles={["showroom"]} redirectTo="/showroom/login">
          <ShowroomRegisterMember />
        </ProtectedRoute>
      </Route>
      <Route path="/showroom/file-sos">
        <ProtectedRoute allowedRoles={["showroom"]} redirectTo="/showroom/login">
          <ShowroomFileSOS />
        </ProtectedRoute>
      </Route>

      {/* 404 fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    initGA();
    initSecurityMeasures();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <PWAInstallPrompt />
        <RakshaChatbot />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
