import { fetchWithCsrf, setAuthToken } from "./csrf";

function storeTokenIfPresent(result: any) {
  if (result?.token) {
    setAuthToken(result.token);
  }
  return result;
}

export const api = {
  auth: {
    mobileLogin: async (mobile: string, password: string) => {
      const res = await fetchWithCsrf("/api/auth/mobile-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, password }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Login failed" }));
        throw new Error(error.error || "Login failed");
      }
      const result = await res.json();
      return storeTokenIfPresent(result);
    },

    mobileRegister: async (data: { mobile: string; password: string; name: string; email?: string }) => {
      const res = await fetchWithCsrf("/api/auth/mobile-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Registration failed" }));
        throw new Error(error.error || "Registration failed");
      }
      const result = await res.json();
      return storeTokenIfPresent(result);
    },

    emailLogin: async (email: string, password: string) => {
      const res = await fetchWithCsrf("/api/auth/email-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Login failed" }));
        throw new Error(error.error || "Login failed");
      }
      const result = await res.json();
      return storeTokenIfPresent(result);
    },

    // Forgot Password - send reset link to email
    forgotPassword: async (mobile: string) => {
      const res = await fetchWithCsrf("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(error.error || "Request failed");
      }
      return res.json();
    },

    // Reset Password - using token from email
    resetPassword: async (token: string, password: string) => {
      const res = await fetchWithCsrf("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Reset failed" }));
        throw new Error(error.error || "Reset failed");
      }
      return res.json();
    },

    verifyFirebaseToken: async (idToken: string, mobile: string) => {
      const res = await fetchWithCsrf("/api/auth/firebase-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, mobile }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Verification failed" }));
        throw new Error(error.error || "Verification failed");
      }
      const result = await res.json();
      return storeTokenIfPresent(result);
    },

    sendOtp: async (mobile: string): Promise<{ success: boolean; message: string }> => {
      const res = await fetchWithCsrf("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    
    verifyOtp: async (mobile: string, otp: string) => {
      const res = await fetchWithCsrf("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      return storeTokenIfPresent(result);
    },
    
    register: async (data: {
      mobile: string;
      name: string;
      email?: string;
      aadhar?: string;
      planType: "individual" | "family";
      familyMembers?: Array<{ name: string; relation: string; dob?: string }>;
    }) => {
      const res = await fetchWithCsrf("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      return storeTokenIfPresent(result);
    },
    
    getMe: async () => {
      const res = await fetchWithCsrf("/api/auth/me");
      if (!res.ok) {
        if (res.status === 401) return null;
        throw new Error(await res.text());
      }
      return res.json();
    },
    
    logout: async () => {
      const res = await fetchWithCsrf("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },
  
  offers: {
    getAll: async () => {
      const res = await fetchWithCsrf("/api/offers");
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    
    create: async (data: {
      title: string;
      code: string;
      discount: string;
      validTill: string;
      targetAudience: string;
    }) => {
      const res = await fetchWithCsrf("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },
  
  agents: {
    getLeaderboard: async (limit = 10) => {
      const res = await fetchWithCsrf(`/api/agents/leaderboard?limit=${limit}`);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },
  
  emergencyRequests: {
    create: async (data: {
      hospitalName: string;
      caseType: string;
      amountRequested?: number;
    }) => {
      const res = await fetchWithCsrf("/api/emergency-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    
    getAll: async () => {
      const res = await fetchWithCsrf("/api/emergency-requests");
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },
  
  admin: {
    getUsers: async (role?: string) => {
      const url = role ? `/api/admin/users?role=${role}` : "/api/admin/users";
      const res = await fetchWithCsrf(url);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    
    blockUser: async (id: string, blocked: boolean) => {
      const res = await fetchWithCsrf(`/api/admin/users/${id}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    
    updateUserRole: async (id: string, role: string) => {
      const res = await fetchWithCsrf(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    
    getStats: async () => {
      const res = await fetchWithCsrf("/api/admin/stats");
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    
    getHospitals: async () => {
      const res = await fetchWithCsrf("/api/admin/hospitals");
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    
    createHospital: async (data: {
      name: string;
      address: string;
      city: string;
      state: string;
      pincode?: string;
      phone?: string;
      email?: string;
    }) => {
      const res = await fetchWithCsrf("/api/admin/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    
    deleteHospital: async (id: string) => {
      const res = await fetchWithCsrf(`/api/admin/hospitals/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },

  showroom: {
    register: async (data: {
      name: string;
      ownerName: string;
      vehicleTypes: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      phone: string;
      email: string;
      gstNumber?: string;
      panNumber?: string;
      password: string;
    }) => {
      const res = await fetchWithCsrf("/api/showroom/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Registration failed" }));
        throw new Error(error.error || "Registration failed");
      }
      return res.json();
    },

    getProfile: async () => {
      const res = await fetchWithCsrf("/api/showroom/profile");
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },

    getDashboardStats: async () => {
      const res = await fetchWithCsrf("/api/showroom/dashboard-stats");
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },

    getMembers: async () => {
      const res = await fetchWithCsrf("/api/showroom/members");
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },

    registerMember: async (data: {
      name: string;
      mobile: string;
      email?: string;
      vehicleType: string;
      vehicleNumber: string;
      vehicleMake: string;
      vehicleModel: string;
      vehicleYear: string;
      planId: string;
    }) => {
      const res = await fetchWithCsrf("/api/showroom/register-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Registration failed" }));
        throw new Error(error.error || "Registration failed");
      }
      return res.json();
    },

    getVehicleSosCases: async () => {
      const res = await fetchWithCsrf("/api/showroom/vehicle-sos-cases");
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },

    createVehicleSosCase: async (data: {
      membershipId?: string;
      userId: string;
      vehicleType: string;
      vehicleNumber: string;
      vehicleMake: string;
      vehicleModel: string;
      vehicleYear: string;
      accidentDate: string;
      accidentLocation: string;
      accidentDescription: string;
      hospitalName: string;
      hospitalAddress?: string;
      estimatedAmount: number;
      firNumber?: string;
    }) => {
      const res = await fetchWithCsrf("/api/showroom/vehicle-sos-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to create SOS case" }));
        throw new Error(error.error || "Failed to create SOS case");
      }
      return res.json();
    },
  },
};
