import { storage } from "./storage";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface EmailConfig {
  provider: "resend" | "sendgrid" | "smtp" | "unconfigured";
  apiKey?: string;
  fromEmail?: string;
  fromName?: string;
}

async function getEmailConfig(): Promise<EmailConfig> {
  // First check for environment variable (takes priority)
  if (process.env.RESEND_API_KEY) {
    return {
      provider: "resend",
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: "noreply@rakshaassist.com", // Production email (requires domain verification in Resend)
      fromName: "Raksha Assist"
    };
  }
  
  const settings = await storage.getIntegrationSettings();
  const emailSetting = settings.find(s => s.category === "email" && s.isActive);
  
  if (!emailSetting || !emailSetting.config) {
    return {
      provider: "unconfigured",
      fromEmail: "noreply@rakshaassist.com",
      fromName: "Raksha Assist"
    };
  }

  try {
    const config = JSON.parse(emailSetting.config);
    const validProviders = ["resend", "sendgrid", "smtp"] as const;
    const provider = validProviders.includes(emailSetting.provider as any) 
      ? emailSetting.provider as "resend" | "sendgrid" | "smtp"
      : "unconfigured";
    
    return {
      provider,
      apiKey: config.apiKey,
      fromEmail: config.fromEmail || "noreply@rakshaassist.com",
      fromName: config.fromName || "Raksha Assist"
    };
  } catch {
    return {
      provider: "unconfigured",
      fromEmail: "noreply@rakshaassist.com",
      fromName: "Raksha Assist"
    };
  }
}

async function sendWithResend(options: EmailOptions, config: EmailConfig): Promise<boolean> {
  if (!config.apiKey) {
    console.log("[Email] Resend API key not configured");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: options.from || `${config.fromName} <${config.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Email] Resend error:", error);
      return false;
    }

    console.log("[Email] Sent successfully via Resend to:", options.to);
    return true;
  } catch (error) {
    console.error("[Email] Resend error:", error);
    return false;
  }
}

async function sendWithSendGrid(options: EmailOptions, config: EmailConfig): Promise<boolean> {
  if (!config.apiKey) {
    console.log("[Email] SendGrid API key not configured");
    return false;
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: options.to }] }],
        from: { email: config.fromEmail, name: config.fromName },
        subject: options.subject,
        content: [{ type: "text/html", value: options.html }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Email] SendGrid error:", error);
      return false;
    }

    console.log("[Email] Sent successfully via SendGrid to:", options.to);
    return true;
  } catch (error) {
    console.error("[Email] SendGrid error:", error);
    return false;
  }
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const config = await getEmailConfig();

  switch (config.provider) {
    case "resend":
      return sendWithResend(options, config);
    case "sendgrid":
      return sendWithSendGrid(options, config);
    case "unconfigured":
    default:
      // SECURITY: Email must be configured - no silent fallback
      console.error("[Email] ERROR: Email provider not configured. Please set up Resend, SendGrid, or SMTP in admin settings.");
      return false;
  }
}

export function generateOtpEmailTemplate(otp: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f5f5f5;">
  <div style="max-width:500px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#0d6efd,#0a58ca);padding:30px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">🛡️ Raksha Assist</h1>
      <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Your Emergency Partner</p>
    </div>
    <div style="padding:40px 30px;text-align:center;">
      <h2 style="color:#333;margin:0 0 10px;font-size:20px;">Verification Code</h2>
      <p style="color:#666;margin:0 0 30px;font-size:14px;">Use this code to verify your identity</p>
      <div style="background:#f8f9fa;border:2px dashed #0d6efd;border-radius:10px;padding:20px;margin:0 auto;display:inline-block;">
        <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#0d6efd;">${otp}</span>
      </div>
      <p style="color:#999;font-size:12px;margin:30px 0 0;">This code expires in 3 minutes</p>
    </div>
    <div style="background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #eee;">
      <p style="color:#999;font-size:11px;margin:0;">© 2026 All Rights Reserved Mindwhile It Solutions Pvt Ltd</p>
    </div>
  </div>
</body>
</html>`;
}

export function generatePaymentReceiptTemplate(data: {
  memberName: string;
  membershipNumber: string;
  planName: string;
  amount: number;
  gst: number;
  total: number;
  paymentId: string;
  paymentDate: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f5f5f5;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#0d6efd,#0a58ca);padding:30px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">🛡️ Raksha Assist</h1>
      <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Payment Receipt</p>
    </div>
    <div style="padding:30px;">
      <div style="background:#d4edda;border-radius:8px;padding:15px;text-align:center;margin-bottom:25px;">
        <span style="color:#155724;font-size:16px;font-weight:600;">✓ Payment Successful</span>
      </div>
      
      <table style="width:100%;border-collapse:collapse;margin-bottom:25px;">
        <tr>
          <td style="padding:10px 0;color:#666;font-size:14px;">Member Name</td>
          <td style="padding:10px 0;color:#333;font-size:14px;text-align:right;font-weight:600;">${data.memberName}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#666;font-size:14px;border-top:1px solid #eee;">Membership No.</td>
          <td style="padding:10px 0;color:#0d6efd;font-size:14px;text-align:right;font-weight:600;border-top:1px solid #eee;">${data.membershipNumber}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#666;font-size:14px;border-top:1px solid #eee;">Plan</td>
          <td style="padding:10px 0;color:#333;font-size:14px;text-align:right;font-weight:600;border-top:1px solid #eee;">${data.planName}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#666;font-size:14px;border-top:1px solid #eee;">Payment ID</td>
          <td style="padding:10px 0;color:#333;font-size:12px;text-align:right;border-top:1px solid #eee;">${data.paymentId}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#666;font-size:14px;border-top:1px solid #eee;">Date</td>
          <td style="padding:10px 0;color:#333;font-size:14px;text-align:right;border-top:1px solid #eee;">${data.paymentDate}</td>
        </tr>
      </table>
      
      <div style="background:#f8f9fa;border-radius:8px;padding:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#666;font-size:14px;">Plan Amount</td>
            <td style="padding:8px 0;color:#333;font-size:14px;text-align:right;">₹${data.amount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#666;font-size:14px;">GST (18%)</td>
            <td style="padding:8px 0;color:#333;font-size:14px;text-align:right;">₹${data.gst.toLocaleString()}</td>
          </tr>
          <tr style="border-top:2px solid #0d6efd;">
            <td style="padding:12px 0;color:#333;font-size:16px;font-weight:700;">Total Paid</td>
            <td style="padding:12px 0;color:#0d6efd;font-size:18px;text-align:right;font-weight:700;">₹${data.total.toLocaleString()}</td>
          </tr>
        </table>
      </div>
    </div>
    <div style="background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #eee;">
      <p style="color:#666;font-size:12px;margin:0 0 5px;">For support: +91 81437 52025 | support@rakshaassist.com</p>
      <p style="color:#999;font-size:10px;margin:0 0 5px;font-style:italic;">Raksha Assist is a membership-based assistance program, NOT an insurance product.</p>
      <p style="color:#999;font-size:11px;margin:0;">© 2026 All Rights Reserved Mindwhile It Solutions Pvt Ltd</p>
    </div>
  </div>
</body>
</html>`;
}

export function generateWelcomeEmailTemplate(name: string, membershipNumber: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f5f5f5;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#0d6efd,#0a58ca);padding:40px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;">🎉 Welcome to Raksha Assist!</h1>
      <p style="color:rgba(255,255,255,0.9);margin:12px 0 0;font-size:16px;">Your emergency protection is now active</p>
    </div>
    <div style="padding:40px 30px;">
      <p style="color:#333;font-size:16px;margin:0 0 20px;">Dear <strong>${name}</strong>,</p>
      <p style="color:#666;font-size:14px;line-height:1.6;margin:0 0 25px;">
        Thank you for joining Raksha Assist! Your membership is now active and you're protected against medical emergencies.
      </p>
      
      <div style="background:linear-gradient(135deg,#0d6efd,#0a58ca);border-radius:12px;padding:25px;text-align:center;margin:25px 0;">
        <p style="color:rgba(255,255,255,0.9);font-size:12px;margin:0 0 8px;">YOUR MEMBERSHIP NUMBER</p>
        <p style="color:#fff;font-size:24px;font-weight:700;letter-spacing:2px;margin:0;">${membershipNumber}</p>
      </div>
      
      <h3 style="color:#333;font-size:16px;margin:25px 0 15px;">What's Next?</h3>
      <ul style="color:#666;font-size:14px;line-height:1.8;padding-left:20px;margin:0;">
        <li>Download your digital membership card from the app</li>
        <li>Save our emergency helpline: <strong>+91 81437 52025</strong></li>
        <li>Add family members (if applicable)</li>
        <li>Explore network hospitals near you</li>
      </ul>
    </div>
    <div style="background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #eee;">
      <p style="color:#666;font-size:12px;margin:0 0 5px;">24/7 Emergency Helpline: +91 81437 52025</p>
      <p style="color:#999;font-size:10px;margin:0 0 5px;font-style:italic;">Raksha Assist is a membership-based assistance program, NOT an insurance product.</p>
      <p style="color:#999;font-size:11px;margin:0;">© 2026 All Rights Reserved Mindwhile It Solutions Pvt Ltd</p>
    </div>
  </div>
</body>
</html>`;
}

export function generateMembershipCardEmailTemplate(name: string, membershipNumber: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f5f5f5;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#0d6efd,#0a58ca);padding:30px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">🛡️ Raksha Assist</h1>
      <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Your Digital Membership Card</p>
    </div>
    <div style="padding:30px;text-align:center;">
      <p style="color:#333;font-size:16px;margin:0 0 20px;">Dear <strong>${name}</strong>,</p>
      <p style="color:#666;font-size:14px;line-height:1.6;margin:0 0 25px;">
        Your digital membership card is attached to this email as a PDF. Please save it for easy access during emergencies.
      </p>
      
      <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:25px 0;">
        <p style="color:#666;font-size:12px;margin:0 0 8px;">MEMBERSHIP NUMBER</p>
        <p style="color:#0d6efd;font-size:20px;font-weight:700;letter-spacing:2px;margin:0;">${membershipNumber}</p>
      </div>
      
      <p style="color:#999;font-size:12px;margin:0;">
        📎 PDF Membership Card attached
      </p>
    </div>
    <div style="background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #eee;">
      <p style="color:#666;font-size:12px;margin:0 0 5px;">Emergency Helpline: +91 81437 52025</p>
      <p style="color:#999;font-size:11px;margin:0;">© 2026 All Rights Reserved Mindwhile It Solutions Pvt Ltd</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "Your Raksha Assist Verification Code",
    html: generateOtpEmailTemplate(otp)
  });
}

export async function sendPaymentReceiptEmail(email: string, data: {
  memberName: string;
  membershipNumber: string;
  planName: string;
  amount: number;
  gst: number;
  total: number;
  paymentId: string;
  paymentDate: string;
}): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Payment Receipt - ${data.membershipNumber}`,
    html: generatePaymentReceiptTemplate(data)
  });
}

export async function sendWelcomeEmail(email: string, name: string, membershipNumber: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "Welcome to Raksha Assist - Your Protection Starts Now!",
    html: generateWelcomeEmailTemplate(name, membershipNumber)
  });
}

export async function sendMembershipCardEmail(email: string, name: string, membershipNumber: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Your Raksha Assist Membership Card - ${membershipNumber}`,
    html: generateMembershipCardEmailTemplate(name, membershipNumber)
  });
}
