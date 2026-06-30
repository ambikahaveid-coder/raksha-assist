import { useQuery } from "@tanstack/react-query";

export interface PublicIntegrations {
  analytics?: {
    enabled: boolean;
    measurementId: string | null;
  };
  firebase?: {
    enabled: boolean;
    apiKey: string | null;
    authDomain: string | null;
    projectId: string | null;
    storageBucket: string | null;
    messagingSenderId: string | null;
    appId: string | null;
  };
  razorpay?: {
    enabled: boolean;
    keyId: string | null;
  };
}

export function usePublicIntegrations() {
  return useQuery<PublicIntegrations>({
    queryKey: ["/api/public/integrations"],
    queryFn: async () => {
      const response = await fetch("/api/public/integrations");
      if (!response.ok) {
        return {};
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

let razorpayLoaded = false;

export async function loadRazorpayScript(): Promise<boolean> {
  // Already loaded and Razorpay is available
  if (razorpayLoaded && window.Razorpay) return true;
  
  // If Razorpay is already on window (script loaded previously)
  if (window.Razorpay) {
    razorpayLoaded = true;
    return true;
  }
  
  return new Promise((resolve) => {
    // Check if script tag exists
    const existingScript = document.querySelector('script[src*="razorpay"]');
    
    if (existingScript) {
      // Script exists but Razorpay not yet available - wait for it
      const checkInterval = setInterval(() => {
        if (window.Razorpay) {
          clearInterval(checkInterval);
          razorpayLoaded = true;
          resolve(true);
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.Razorpay) {
          console.error("[Razorpay] Script exists but Razorpay not available after timeout");
          resolve(false);
        }
      }, 10000);
      return;
    }
    
    // Create and append script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      // Wait a bit for Razorpay to initialize
      const checkInterval = setInterval(() => {
        if (window.Razorpay) {
          clearInterval(checkInterval);
          razorpayLoaded = true;
          resolve(true);
        }
      }, 50);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.Razorpay) {
          console.error("[Razorpay] Script loaded but Razorpay not available");
          resolve(false);
        }
      }, 5000);
    };
    script.onerror = () => {
      console.error("[Razorpay] Script failed to load");
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

declare global {
  interface Window {
    Razorpay: any;
  }
}
