import { storage } from "../storage";
import { randomInt } from "crypto";

export type OTPProvider = 'firebase';

export interface OTPConfig {
  provider: OTPProvider;
  firebaseProjectId?: string;
}

export class OTPService {
  private config: OTPConfig;
  private productionMisconfigured = false;
  
  constructor() {
    this.config = {
      provider: 'firebase',
    };
    
    if (process.env.NODE_ENV === 'production') {
      console.log('[OTP] Production mode: Firebase OTP required');
    }
  }

  async loadConfigFromDB(): Promise<void> {
    try {
      const firebaseSetting = await storage.getSystemSetting('config_firebase');

      if (firebaseSetting?.value) {
        try {
          const fbConfig = JSON.parse(firebaseSetting.value);
          if (fbConfig.projectId && fbConfig.enabled) {
            this.config.firebaseProjectId = fbConfig.projectId;
            console.log('[OTP] Firebase config loaded from database');
          }
        } catch (parseError) {
          console.log('[OTP] Failed to parse Firebase config from database');
        }
      }
    } catch (error) {
      console.log('[OTP] Using default config, database settings not available');
    }
  }

  generateOTP(): string {
    return randomInt(100000, 999999).toString();
  }

  async sendOTP(mobile: string, otp: string): Promise<{ success: boolean; message: string }> {
    await this.loadConfigFromDB();

    console.log(`[OTP] Provider: firebase for mobile: ${mobile}`);
    console.log(`[OTP Firebase] OTP handled client-side via Firebase SDK`);
    return { success: true, message: 'Firebase OTP is handled client-side. Backend only verifies the token.' };
  }

  getProvider(): OTPProvider {
    return this.config.provider;
  }

  isDemoMode(): boolean {
    return false;
  }
  
  async isConfigured(): Promise<boolean> {
    await this.loadConfigFromDB();
    
    const firebaseSetting = await storage.getSystemSetting('config_firebase');
    if (firebaseSetting?.value) {
      try {
        const config = JSON.parse(firebaseSetting.value);
        return config.enabled && config.projectId && config.apiKey;
      } catch {
        return false;
      }
    }
    return false;
  }
  
  async isProductionReady(): Promise<boolean> {
    return await this.isConfigured();
  }

  async getStatus(): Promise<{ provider: string; configured: boolean; productionReady: boolean }> {
    const configured = await this.isConfigured();
    const productionReady = await this.isProductionReady();
    
    return {
      provider: this.config.provider,
      configured,
      productionReady,
    };
  }
}

export const otpService = new OTPService();
