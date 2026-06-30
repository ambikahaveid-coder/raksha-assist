import { initializeApp, FirebaseApp, getApps } from "firebase/app";
import { 
  getAuth, 
  Auth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  PhoneAuthProvider,
  signInWithCredential
} from "firebase/auth";

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export function initializeFirebase(config: FirebaseConfig): boolean {
  try {
    if (getApps().length > 0) {
      firebaseApp = getApps()[0];
    } else {
      firebaseApp = initializeApp(config);
    }
    auth = getAuth(firebaseApp);
    console.log("[Firebase] Initialized successfully");
    return true;
  } catch (error) {
    console.error("[Firebase] Initialization failed:", error);
    return false;
  }
}

export function getFirebaseAuth(): Auth | null {
  return auth;
}

export function isFirebaseInitialized(): boolean {
  return firebaseApp !== null && auth !== null;
}

export function setupRecaptcha(containerId: string): RecaptchaVerifier | null {
  if (!auth) {
    console.error("[Firebase] Auth not initialized");
    return null;
  }

  try {
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
    }

    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {
        console.log("[Firebase] reCAPTCHA verified");
      },
      "expired-callback": () => {
        console.log("[Firebase] reCAPTCHA expired");
      }
    });

    return recaptchaVerifier;
  } catch (error) {
    console.error("[Firebase] Failed to setup reCAPTCHA:", error);
    return null;
  }
}

export async function sendOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
  if (!auth) {
    return { success: false, message: "Firebase not initialized. Please contact support." };
  }

  try {
    let formattedPhone = phoneNumber.replace(/\s/g, "");
    if (!formattedPhone.startsWith("+")) {
      if (formattedPhone.startsWith("91") && formattedPhone.length === 12) {
        formattedPhone = "+" + formattedPhone;
      } else if (formattedPhone.length === 10) {
        formattedPhone = "+91" + formattedPhone;
      } else {
        formattedPhone = "+" + formattedPhone;
      }
    }

    if (!recaptchaVerifier) {
      return { success: false, message: "reCAPTCHA not initialized. Please refresh the page." };
    }

    confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    console.log("[Firebase] OTP sent successfully");
    
    return { success: true, message: "OTP sent successfully" };
  } catch (error: any) {
    console.error("[Firebase] Failed to send OTP:", error);
    
    if (error.code === "auth/invalid-phone-number") {
      return { success: false, message: "Invalid phone number format" };
    }
    if (error.code === "auth/too-many-requests") {
      return { success: false, message: "Too many attempts. Please try again later." };
    }
    if (error.code === "auth/captcha-check-failed") {
      return { success: false, message: "reCAPTCHA verification failed. Please refresh and try again." };
    }
    
    return { success: false, message: error.message || "Failed to send OTP" };
  }
}

export async function verifyOTP(otp: string): Promise<{ success: boolean; idToken?: string; message: string }> {
  if (!confirmationResult) {
    return { success: false, message: "No OTP session found. Please request a new OTP." };
  }

  try {
    const result = await confirmationResult.confirm(otp);
    const idToken = await result.user.getIdToken();
    
    console.log("[Firebase] OTP verified successfully");
    
    return { 
      success: true, 
      idToken,
      message: "Phone verified successfully" 
    };
  } catch (error: any) {
    console.error("[Firebase] OTP verification failed:", error);
    
    if (error.code === "auth/invalid-verification-code") {
      return { success: false, message: "Invalid OTP. Please check and try again." };
    }
    if (error.code === "auth/code-expired") {
      return { success: false, message: "OTP has expired. Please request a new one." };
    }
    
    return { success: false, message: error.message || "Failed to verify OTP" };
  }
}

export function clearConfirmation(): void {
  confirmationResult = null;
}

export async function signOut(): Promise<void> {
  if (auth) {
    await auth.signOut();
  }
  confirmationResult = null;
}
