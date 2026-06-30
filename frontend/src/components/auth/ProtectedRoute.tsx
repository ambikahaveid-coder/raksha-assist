import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

type AllowedRole = 
  | "user" 
  | "agent" 
  | "employee" 
  | "support" 
  | "marketing" 
  | "accountant" 
  | "admin" 
  | "super_admin"
  | "zone_franchise"
  | "state_franchise"
  | "district_franchise"
  | "city_franchise"
  | "showroom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AllowedRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  redirectTo = "/login"
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Always show loading until auth check completes
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-slate-600 font-medium">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect immediately
  if (!isAuthenticated) {
    // Use setTimeout to avoid React state update warnings
    setTimeout(() => setLocation(redirectTo), 0);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-slate-600 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0 && user?.role) {
    const hasAccess = allowedRoles.includes(user.role as AllowedRole);
    if (!hasAccess) {
      const roleRedirect = getRoleBasedRedirect(user.role as AllowedRole);
      setTimeout(() => setLocation(roleRedirect), 0);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-slate-600 font-medium">Redirecting...</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

function getRoleBasedRedirect(role: AllowedRole): string {
  switch (role) {
    case "super_admin":
      return "/super-admin";
    case "admin":
      return "/admin";
    case "agent":
      return "/agent";
    case "employee":
      return "/employee";
    case "accountant":
      return "/accountant";
    case "zone_franchise":
    case "state_franchise":
    case "district_franchise":
    case "city_franchise":
      return "/franchise";
    case "showroom":
      return "/showroom/dashboard";
    default:
      return "/dashboard";
  }
}

export function PublicOnlyRoute({ 
  children,
  redirectTo,
  allowAuthenticated = false,
}: { 
  children: React.ReactNode;
  redirectTo?: string;
  allowAuthenticated?: boolean;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    
    if (!allowAuthenticated && isAuthenticated && user?.role) {
      const redirect = redirectTo || getRoleBasedRedirect(user.role as AllowedRole);
      setLocation(redirect);
    }
  }, [allowAuthenticated, isLoading, isAuthenticated, user?.role, setLocation, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!allowAuthenticated && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
