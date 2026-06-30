import { storage } from "../storage";

interface EmailOptions {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  templateId?: string;
}

interface EmailResult {
  success: boolean;
  providerId?: string;
  error?: string;
  simulated?: boolean;
}

const EMAIL_TIMEOUT_MS = 10000;

const BRAND_COLORS = {
  primary: "#1E40AF",
  secondary: "#F97316",
  dark: "#0B1F3A",
  teal: "#179299",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  lightBg: "#F8FAFC",
  border: "#E2E8F0"
};

const COMPANY_INFO = {
  name: "Raksha Assist",
  tagline: "Emergency Medical & Accident Assistance",
  cin: "U72900TG2024PTC184818",
  registeredOffice: "2nd & 3rd Floor, 3rd Block, 12th Main, Bashyam Circle, Rajajinagar, Bengaluru - 560 010, India",
  helpline: "+91 81437 52025",
  email: "support@rakshaassist.com",
  website: "https://rakshaassist.com",
  logoUrl: "https://rakshaassist.com/logo.png"
};

function getEmailHeader(title: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${BRAND_COLORS.lightBg}; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .email-header { background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.dark} 100%); padding: 30px; text-align: center; }
        .logo-container { margin-bottom: 15px; }
        .logo { width: 60px; height: 60px; }
        .company-name { color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: 1px; }
        .tagline { color: ${BRAND_COLORS.secondary}; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px; }
        .email-body { padding: 40px 30px; color: #333333; line-height: 1.8; }
        .email-footer { background: ${BRAND_COLORS.dark}; color: #ffffff; padding: 30px; text-align: center; font-size: 12px; }
        .footer-divider { border-top: 1px solid rgba(255,255,255,0.2); margin: 20px 0; }
        .social-links { margin: 15px 0; }
        .social-link { color: ${BRAND_COLORS.secondary}; text-decoration: none; margin: 0 10px; }
        .disclaimer { background: #FEF3C7; padding: 15px; border-left: 4px solid ${BRAND_COLORS.warning}; margin: 20px 0; font-size: 11px; color: #92400E; }
        .btn-primary { display: inline-block; background: ${BRAND_COLORS.primary}; color: #ffffff !important; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .btn-secondary { display: inline-block; background: ${BRAND_COLORS.secondary}; color: #ffffff !important; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .info-box { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .success-box { background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .amount-display { font-size: 36px; font-weight: 700; color: ${BRAND_COLORS.primary}; }
        .receipt-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .receipt-table th, .receipt-table td { padding: 12px; text-align: left; border-bottom: 1px solid ${BRAND_COLORS.border}; }
        .receipt-table th { background: ${BRAND_COLORS.lightBg}; font-weight: 600; color: ${BRAND_COLORS.dark}; }
        .highlight { color: ${BRAND_COLORS.primary}; font-weight: 600; }
        .helpline { background: ${BRAND_COLORS.secondary}; color: #ffffff; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .helpline-number { font-size: 24px; font-weight: 700; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <div class="logo-container">
            <img src="${COMPANY_INFO.logoUrl}" alt="Raksha Assist" class="logo" style="width: 60px; height: auto;">
          </div>
          <h1 class="company-name">Raksha Assist</h1>
          <p class="tagline">${COMPANY_INFO.tagline}</p>
        </div>
        <div class="email-body">
  `;
}

function getEmailFooter(): string {
  return `
        </div>
        <div class="email-footer">
          <p style="font-size: 14px; margin-bottom: 5px;"><strong>24/7 Emergency Helpline</strong></p>
          <p style="font-size: 20px; color: ${BRAND_COLORS.secondary}; margin: 0;">${COMPANY_INFO.helpline}</p>
          
          <div class="footer-divider"></div>
          
          <p style="margin: 5px 0;"><strong>Mindwhile IT Solutions Pvt. Ltd.</strong></p>
          <p style="margin: 5px 0; font-size: 11px;">CIN: ${COMPANY_INFO.cin}</p>
          <p style="margin: 5px 0; font-size: 11px;">${COMPANY_INFO.registeredOffice}</p>
          
          <div class="footer-divider"></div>
          
          <p style="font-size: 10px; color: #94A3B8; line-height: 1.6;">
            <strong>DISCLAIMER:</strong> Raksha Assist is a membership-based assistance program and is NOT an insurance product. 
            This is not a health insurance policy and does not provide any health insurance benefits. 
            All disputes are subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka, India.
          </p>
          
          <div class="footer-divider"></div>
          
          <p style="font-size: 10px; color: #64748B;">
            © ${new Date().getFullYear()} Mindwhile IT Solutions Pvt. Ltd. All Rights Reserved.<br>
            <a href="${COMPANY_INFO.website}" style="color: ${BRAND_COLORS.secondary};">www.rakshaassist.com</a> | 
            <a href="${COMPANY_INFO.website}/privacy-policy" style="color: ${BRAND_COLORS.secondary};">Privacy Policy</a> | 
            <a href="${COMPANY_INFO.website}/terms" style="color: ${BRAND_COLORS.secondary};">Terms of Service</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

class EmailService {
  private async getEmailConfig(): Promise<{ provider: string; apiKey?: string; fromEmail?: string; fromName?: string } | null> {
    const providerSetting = await storage.getIntegrationSettingByProvider("resend");
    if (providerSetting?.isActive) {
      try {
        const config = providerSetting.config ? JSON.parse(providerSetting.config) : {};
        return {
          provider: "resend",
          apiKey: config.apiKey || process.env.RESEND_API_KEY,
          fromEmail: config.fromEmail || "noreply@rakshaassist.com",
          fromName: config.fromName || "Raksha Assist"
        };
      } catch {
        return null;
      }
    }

    const sendgridSetting = await storage.getIntegrationSettingByProvider("sendgrid");
    if (sendgridSetting?.isActive) {
      try {
        const config = sendgridSetting.config ? JSON.parse(sendgridSetting.config) : {};
        return {
          provider: "sendgrid",
          apiKey: config.apiKey || process.env.SENDGRID_API_KEY,
          fromEmail: config.fromEmail || "noreply@rakshaassist.com",
          fromName: config.fromName || "Raksha Assist"
        };
      } catch {
        return null;
      }
    }

    if (process.env.RESEND_API_KEY) {
      return {
        provider: "resend",
        apiKey: process.env.RESEND_API_KEY,
        fromEmail: "noreply@rakshaassist.com",
        fromName: "Raksha Assist"
      };
    }

    return null;
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    const emailLog = await storage.createEmailLog({
      templateId: options.templateId,
      recipientEmail: options.to,
      recipientName: options.toName,
      subject: options.subject,
      status: "queued"
    });

    const config = await this.getEmailConfig();
    if (!config || !config.apiKey) {
      console.warn("[Email] No email provider configured - email simulated:", options.subject, "to:", options.to);
      await storage.updateEmailLog(emailLog.id, {
        status: "simulated",
        metadata: JSON.stringify({ reason: "No email provider configured", subject: options.subject, recipient: options.to })
      });
      return { success: true, providerId: "simulated", simulated: true };
    }

    try {
      let result: EmailResult;

      if (config.provider === "resend") {
        result = await this.sendViaResend(options, config);
      } else if (config.provider === "sendgrid") {
        result = await this.sendViaSendGrid(options, config);
      } else {
        result = { success: false, error: "Unknown provider" };
      }

      await storage.updateEmailLog(emailLog.id, {
        status: result.success ? "sent" : "failed",
        providerId: result.providerId,
        errorMessage: result.error,
        sentAt: result.success ? new Date() : undefined
      });

      return result;
    } catch (error: any) {
      await storage.updateEmailLog(emailLog.id, {
        status: "failed",
        errorMessage: error.message
      });
      return { success: false, error: error.message };
    }
  }

  private async sendViaResend(options: EmailOptions, config: any): Promise<EmailResult> {
    const response = await fetchWithTimeout(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: `${config.fromName} <${config.fromEmail}>`,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text
        })
      },
      EMAIL_TIMEOUT_MS
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || "Failed to send email via Resend");
    }

    const data = await response.json();
    return { success: true, providerId: data.id };
  }

  private async sendViaSendGrid(options: EmailOptions, config: any): Promise<EmailResult> {
    const response = await fetchWithTimeout(
      "https://api.sendgrid.com/v3/mail/send",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: options.to, name: options.toName }] }],
          from: { email: config.fromEmail, name: config.fromName },
          subject: options.subject,
          content: [
            { type: "text/plain", value: options.text || options.html.replace(/<[^>]*>/g, '') },
            { type: "text/html", value: options.html }
          ]
        })
      },
      EMAIL_TIMEOUT_MS
    );

    if (!response.ok) {
      const error = await response.text().catch(() => "Unknown error");
      throw new Error(error || "Failed to send email via SendGrid");
    }

    const messageId = response.headers.get("X-Message-Id") || `sg-${Date.now()}`;
    return { success: true, providerId: messageId };
  }

  async sendWelcomeEmail(email: string, name: string): Promise<EmailResult> {
    const html = getEmailHeader("Welcome to Raksha Assist") + `
      <h2 style="color: ${BRAND_COLORS.dark}; margin-bottom: 20px;">Welcome to Raksha Assist, ${name}!</h2>
      
      <p>Thank you for joining India's most trusted emergency medical assistance program. Your account has been successfully created.</p>
      
      <div class="info-box">
        <p style="margin: 0; font-weight: 600; color: ${BRAND_COLORS.dark};">What You Get with Raksha Assist:</p>
        <ul style="margin-top: 10px;">
          <li><strong>24/7 Emergency Assistance</strong> - Round-the-clock support when you need it most</li>
          <li><strong>Hospital-Direct Financial Support</strong> - Direct payments to hospitals, no reimbursement hassles</li>
          <li><strong>5000+ Network Hospitals</strong> - Access to our extensive hospital network across India</li>
          <li><strong>Quick SOS Response</strong> - Immediate assistance at the touch of a button</li>
          <li><strong>Cashless Treatment</strong> - No upfront payments at partner hospitals</li>
        </ul>
      </div>
      
      <p style="text-align: center;">
        <a href="${COMPANY_INFO.website}/dashboard" class="btn-primary">Go to Your Dashboard</a>
      </p>
      
      <div class="helpline">
        <p style="margin: 0; font-size: 12px;">Need Assistance? Call Our 24/7 Helpline</p>
        <p class="helpline-number" style="margin: 5px 0 0 0;">${COMPANY_INFO.helpline}</p>
      </div>
      
      <p>Stay protected,<br><strong>Team Raksha Assist</strong></p>
      
      <div class="disclaimer">
        <strong>Important:</strong> Raksha Assist is a membership-based assistance program and is NOT an insurance product. 
        Please review our terms and conditions at <a href="${COMPANY_INFO.website}/terms">${COMPANY_INFO.website}/terms</a>
      </div>
    ` + getEmailFooter();

    return this.sendEmail({
      to: email,
      toName: name,
      subject: "Welcome to Raksha Assist - Your Emergency Protection Starts Now!",
      html,
      templateId: "welcome"
    });
  }

  async sendPaymentReceiptEmail(
    email: string,
    name: string,
    paymentDetails: {
      amount: number;
      planName: string;
      membershipNumber: string;
      transactionId: string;
      paymentDate: Date;
      validityStart: Date;
      validityEnd: Date;
      coverage: number;
    }
  ): Promise<EmailResult> {
    const formatCurrency = (amount: number) => 
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    
    const formatDate = (date: Date) => 
      new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    const html = getEmailHeader("Payment Receipt") + `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background: ${BRAND_COLORS.success}; color: white; display: inline-block; padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: 600;">
          ✓ PAYMENT SUCCESSFUL
        </div>
      </div>
      
      <h2 style="color: ${BRAND_COLORS.dark}; margin-bottom: 5px;">Payment Receipt</h2>
      <p style="color: #666; margin-top: 0;">Receipt No: ${paymentDetails.transactionId}</p>
      
      <div class="success-box" style="text-align: center;">
        <p style="margin: 0; color: #666; font-size: 12px;">Amount Paid</p>
        <p class="amount-display" style="margin: 5px 0;">${formatCurrency(paymentDetails.amount)}</p>
        <p style="margin: 0; color: ${BRAND_COLORS.success}; font-weight: 600;">Payment Successful</p>
      </div>
      
      <table class="receipt-table">
        <tr>
          <th colspan="2" style="background: ${BRAND_COLORS.primary}; color: white;">Payment Details</th>
        </tr>
        <tr>
          <td><strong>Member Name</strong></td>
          <td>${name}</td>
        </tr>
        <tr>
          <td><strong>Membership Number</strong></td>
          <td style="color: ${BRAND_COLORS.primary}; font-weight: 600;">${paymentDetails.membershipNumber}</td>
        </tr>
        <tr>
          <td><strong>Plan</strong></td>
          <td>${paymentDetails.planName}</td>
        </tr>
        <tr>
          <td><strong>Coverage Amount</strong></td>
          <td>${formatCurrency(paymentDetails.coverage)}</td>
        </tr>
        <tr>
          <td><strong>Transaction ID</strong></td>
          <td style="font-family: monospace;">${paymentDetails.transactionId}</td>
        </tr>
        <tr>
          <td><strong>Payment Date</strong></td>
          <td>${formatDate(paymentDetails.paymentDate)}</td>
        </tr>
        <tr>
          <td><strong>Validity Period</strong></td>
          <td>${formatDate(paymentDetails.validityStart)} - ${formatDate(paymentDetails.validityEnd)}</td>
        </tr>
      </table>
      
      <div class="info-box">
        <p style="margin: 0 0 10px 0; font-weight: 600; color: ${BRAND_COLORS.dark};">Your Coverage Includes:</p>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Accident & Emergency Medical Assistance up to ${formatCurrency(paymentDetails.coverage)}</li>
          <li>Hospital-Direct Payments - No Reimbursement Required</li>
          <li>24/7 Emergency Helpline Support</li>
          <li>Access to 5000+ Network Hospitals</li>
        </ul>
      </div>
      
      <p style="text-align: center;">
        <a href="${COMPANY_INFO.website}/dashboard" class="btn-primary">View Your Membership</a>
        <a href="${COMPANY_INFO.website}/payment-history" class="btn-secondary" style="margin-left: 10px;">Payment History</a>
      </p>
      
      <div class="helpline">
        <p style="margin: 0; font-size: 12px;">24/7 Emergency Helpline</p>
        <p class="helpline-number" style="margin: 5px 0 0 0;">${COMPANY_INFO.helpline}</p>
      </div>
      
      <p style="font-size: 12px; color: #666; text-align: center;">
        This is an electronically generated receipt and does not require a signature.<br>
        For any queries, contact us at ${COMPANY_INFO.email}
      </p>
      
      <div class="disclaimer">
        <strong>Tax Information:</strong> GST @ 18% is included in the total amount. 
        GSTIN: 37XXXXX1234X1ZX. This receipt serves as a valid tax document.
      </div>
    ` + getEmailFooter();

    return this.sendEmail({
      to: email,
      toName: name,
      subject: `Payment Receipt - ${formatCurrency(paymentDetails.amount)} - Raksha Assist`,
      html,
      templateId: "payment_receipt"
    });
  }

  async sendRenewalReminderEmail(
    email: string,
    name: string,
    details: {
      planName: string;
      expiryDate: Date;
      daysLeft: number;
      renewalAmount: number;
    }
  ): Promise<EmailResult> {
    const formatCurrency = (amount: number) => 
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    
    const formatDate = (date: Date) => 
      new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    const urgency = details.daysLeft <= 2 ? "URGENT" : details.daysLeft <= 7 ? "IMPORTANT" : "REMINDER";
    const urgencyColor = details.daysLeft <= 2 ? BRAND_COLORS.error : details.daysLeft <= 7 ? BRAND_COLORS.warning : BRAND_COLORS.primary;

    const html = getEmailHeader("Renewal Reminder") + `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background: ${urgencyColor}; color: white; display: inline-block; padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: 600;">
          ⚠ ${urgency}: PLAN RENEWAL
        </div>
      </div>
      
      <h2 style="color: ${BRAND_COLORS.dark};">Dear ${name},</h2>
      
      <p>Your Raksha Assist membership is ${details.daysLeft > 0 ? `expiring in <strong>${details.daysLeft} days</strong>` : details.daysLeft === 0 ? '<strong>expiring today</strong>' : '<strong>already expired</strong>'}.</p>
      
      <div class="info-box" style="border-color: ${urgencyColor}; background: ${details.daysLeft <= 2 ? '#FEF2F2' : '#EFF6FF'};">
        <table style="width: 100%; border: none;">
          <tr>
            <td><strong>Current Plan:</strong></td>
            <td>${details.planName}</td>
          </tr>
          <tr>
            <td><strong>Expiry Date:</strong></td>
            <td style="color: ${urgencyColor}; font-weight: 600;">${formatDate(details.expiryDate)}</td>
          </tr>
          <tr>
            <td><strong>Renewal Amount:</strong></td>
            <td style="font-size: 18px; font-weight: 600; color: ${BRAND_COLORS.primary};">${formatCurrency(details.renewalAmount)}</td>
          </tr>
        </table>
      </div>
      
      <p><strong>Don't lose your protection!</strong> Renew now to ensure continuous coverage for you and your family.</p>
      
      <p style="text-align: center;">
        <a href="${COMPANY_INFO.website}/plans" class="btn-primary" style="background: ${urgencyColor};">Renew Now</a>
      </p>
      
      <div class="helpline">
        <p style="margin: 0; font-size: 12px;">Questions? Call Our 24/7 Helpline</p>
        <p class="helpline-number" style="margin: 5px 0 0 0;">${COMPANY_INFO.helpline}</p>
      </div>
      
      <p>Best regards,<br><strong>Team Raksha Assist</strong></p>
    ` + getEmailFooter();

    return this.sendEmail({
      to: email,
      toName: name,
      subject: `${urgency}: Your Raksha Assist Plan ${details.daysLeft > 0 ? `Expires in ${details.daysLeft} Days` : details.daysLeft === 0 ? 'Expires Today' : 'Has Expired'}`,
      html,
      templateId: "renewal_reminder"
    });
  }

  async sendPromotionalEmail(
    email: string,
    name: string,
    campaign: {
      title: string;
      message: string;
      offerDetails?: string;
      discountPercent?: number;
      validUntil?: Date;
      ctaText?: string;
      ctaLink?: string;
    }
  ): Promise<EmailResult> {
    const formatDate = (date: Date) => 
      new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    const html = getEmailHeader(campaign.title) + `
      <h2 style="color: ${BRAND_COLORS.dark}; text-align: center;">${campaign.title}</h2>
      
      ${campaign.discountPercent ? `
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: linear-gradient(135deg, ${BRAND_COLORS.secondary} 0%, ${BRAND_COLORS.primary} 100%); color: white; display: inline-block; padding: 20px 40px; border-radius: 10px;">
            <p style="margin: 0; font-size: 14px;">SPECIAL OFFER</p>
            <p style="margin: 5px 0; font-size: 48px; font-weight: 700;">${campaign.discountPercent}% OFF</p>
            ${campaign.validUntil ? `<p style="margin: 0; font-size: 12px;">Valid until ${formatDate(campaign.validUntil)}</p>` : ''}
          </div>
        </div>
      ` : ''}
      
      <p>Dear ${name},</p>
      
      <p>${campaign.message}</p>
      
      ${campaign.offerDetails ? `
        <div class="info-box">
          <p style="margin: 0; font-weight: 600; color: ${BRAND_COLORS.dark};">Offer Details:</p>
          <p style="margin: 10px 0 0 0;">${campaign.offerDetails}</p>
        </div>
      ` : ''}
      
      <p style="text-align: center;">
        <a href="${campaign.ctaLink || COMPANY_INFO.website + '/plans'}" class="btn-secondary">${campaign.ctaText || 'Avail Offer'}</a>
      </p>
      
      <div class="helpline">
        <p style="margin: 0; font-size: 12px;">Have Questions? We're Here 24/7</p>
        <p class="helpline-number" style="margin: 5px 0 0 0;">${COMPANY_INFO.helpline}</p>
      </div>
      
      <p>Best regards,<br><strong>Team Raksha Assist</strong></p>
      
      <p style="font-size: 11px; color: #666; text-align: center; margin-top: 30px;">
        You're receiving this email because you're a valued member of Raksha Assist.<br>
        <a href="${COMPANY_INFO.website}/unsubscribe" style="color: #666;">Unsubscribe</a> from promotional emails
      </p>
    ` + getEmailFooter();

    return this.sendEmail({
      to: email,
      toName: name,
      subject: campaign.title,
      html,
      templateId: "promotional"
    });
  }

  async sendCompanyWelcomeEmail(email: string, companyName: string, loginEmail: string): Promise<EmailResult> {
    const html = getEmailHeader("Corporate Account Activated") + `
      <h2 style="color: ${BRAND_COLORS.dark};">Welcome to Raksha Assist Corporate</h2>
      
      <p>Dear ${companyName} Team,</p>
      
      <p>Congratulations! Your corporate account has been approved and activated. You can now protect your employees with India's leading emergency medical assistance program.</p>
      
      <div class="success-box">
        <p style="margin: 0 0 10px 0; font-weight: 600; color: ${BRAND_COLORS.dark};">Account Details:</p>
        <table style="width: 100%;">
          <tr><td><strong>Company:</strong></td><td>${companyName}</td></tr>
          <tr><td><strong>Portal:</strong></td><td><a href="${COMPANY_INFO.website}/company-portal">${COMPANY_INFO.website}/company-portal</a></td></tr>
          <tr><td><strong>Login Email:</strong></td><td>${loginEmail}</td></tr>
        </table>
      </div>
      
      <div class="info-box">
        <p style="margin: 0 0 10px 0; font-weight: 600;">Through the Corporate Portal, you can:</p>
        <ul style="margin: 0;">
          <li>Add and manage employee coverage</li>
          <li>View real-time coverage status for all employees</li>
          <li>Access billing and payment information</li>
          <li>Generate comprehensive coverage reports</li>
          <li>Download bulk membership certificates</li>
        </ul>
      </div>
      
      <p style="text-align: center;">
        <a href="${COMPANY_INFO.website}/company-portal" class="btn-primary">Access Corporate Portal</a>
      </p>
      
      <div class="helpline">
        <p style="margin: 0; font-size: 12px;">Corporate Support Team</p>
        <p class="helpline-number" style="margin: 5px 0 0 0;">${COMPANY_INFO.helpline}</p>
      </div>
      
      <p>Best regards,<br><strong>Raksha Assist Corporate Team</strong></p>
    ` + getEmailFooter();

    return this.sendEmail({
      to: email,
      toName: companyName,
      subject: `${companyName} - Raksha Assist Corporate Account Activated`,
      html,
      templateId: "company_welcome"
    });
  }

  async sendEmployeeInviteEmail(email: string, employeeName: string, companyName: string, inviteToken: string): Promise<EmailResult> {
    const inviteLink = `${COMPANY_INFO.website}/employee-invite?token=${inviteToken}`;
    
    const html = getEmailHeader("You're Covered!") + `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background: ${BRAND_COLORS.success}; color: white; display: inline-block; padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: 600;">
          ✓ COVERAGE ACTIVATED
        </div>
      </div>
      
      <h2 style="color: ${BRAND_COLORS.dark}; text-align: center;">You're Now Protected!</h2>
      
      <p>Dear ${employeeName},</p>
      
      <p>Great news! <strong>${companyName}</strong> has enrolled you in the Raksha Assist emergency medical assistance program as part of your employee benefits.</p>
      
      <div class="success-box">
        <p style="margin: 0; font-weight: 600; color: ${BRAND_COLORS.dark};">Your Coverage Includes:</p>
        <ul style="margin: 10px 0 0 0;">
          <li>24/7 Emergency Assistance Support</li>
          <li>Hospital-Direct Financial Assistance</li>
          <li>Cashless Treatment at 5000+ Partner Hospitals</li>
          <li>Quick SOS Emergency Response</li>
        </ul>
      </div>
      
      <p>To activate your coverage and access your membership card, click the button below:</p>
      
      <p style="text-align: center;">
        <a href="${inviteLink}" class="btn-primary">Activate Your Coverage</a>
      </p>
      
      <div class="helpline">
        <p style="margin: 0; font-size: 12px;">24/7 Emergency Helpline</p>
        <p class="helpline-number" style="margin: 5px 0 0 0;">${COMPANY_INFO.helpline}</p>
      </div>
      
      <p>Stay safe,<br><strong>Team Raksha Assist</strong></p>
    ` + getEmailFooter();

    return this.sendEmail({
      to: email,
      toName: employeeName,
      subject: `${companyName} has enrolled you in Raksha Assist Coverage`,
      html,
      templateId: "employee_invite"
    });
  }

  async sendHospitalPaymentNotification(hospitalEmail: string, hospitalName: string, amount: number, transactionId: string): Promise<EmailResult> {
    const formatCurrency = (amt: number) => 
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);

    const html = getEmailHeader("Payment Processed") + `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background: ${BRAND_COLORS.success}; color: white; display: inline-block; padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: 600;">
          ✓ PAYMENT PROCESSED
        </div>
      </div>
      
      <h2 style="color: ${BRAND_COLORS.dark};">Payment Confirmation</h2>
      
      <p>Dear ${hospitalName},</p>
      
      <p>A payment has been processed to your account from Raksha Assist for member treatment services.</p>
      
      <div class="success-box" style="text-align: center;">
        <p style="margin: 0; color: #666; font-size: 12px;">Amount Credited</p>
        <p class="amount-display" style="margin: 5px 0; color: ${BRAND_COLORS.success};">${formatCurrency(amount)}</p>
        <p style="margin: 0; font-size: 12px; color: #666;">Transaction ID: ${transactionId}</p>
      </div>
      
      <div class="info-box">
        <p style="margin: 0;"><strong>Payment Details:</strong></p>
        <ul style="margin: 10px 0 0 0;">
          <li>The amount should reflect in your bank account within 2-3 business days</li>
          <li>Please retain this email for your records</li>
          <li>For any discrepancies, contact our accounts team</li>
        </ul>
      </div>
      
      <p>Thank you for being a valued partner in our hospital network.</p>
      
      <div class="helpline">
        <p style="margin: 0; font-size: 12px;">Hospital Partner Support</p>
        <p class="helpline-number" style="margin: 5px 0 0 0;">${COMPANY_INFO.helpline}</p>
      </div>
      
      <p>Best regards,<br><strong>Raksha Assist Accounts Team</strong></p>
    ` + getEmailFooter();

    return this.sendEmail({
      to: hospitalEmail,
      toName: hospitalName,
      subject: `Payment Processed - ${formatCurrency(amount)} - Raksha Assist`,
      html,
      templateId: "hospital_payment"
    });
  }
}

export const emailService = new EmailService();
