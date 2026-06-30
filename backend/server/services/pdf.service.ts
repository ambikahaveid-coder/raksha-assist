import PDFDocument from "pdfkit";
import { storage } from "../storage";
import path from "path";
import fs from "fs";

interface ReportData {
  title: string;
  subtitle?: string;
  generatedAt: Date;
  generatedBy?: string;
  sections: ReportSection[];
}

interface ReportSection {
  title: string;
  type: "summary" | "table" | "text";
  data: any;
}

function getLogoPath(): string | null {
  const possiblePaths = [
    path.join(process.cwd(), "frontend", "public", "logo.png"),
    path.resolve(process.cwd(), "../frontend/public/logo.png"),
    path.resolve(__dirname, "../../../frontend/public/logo.png"),
    path.join(process.cwd(), "frontend", "dist", "logo.png"),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function maskAadhaar(aadhaar: string): string {
  if (!aadhaar || aadhaar.length < 4) return "XXXX-XXXX-XXXX";
  const last4 = aadhaar.replace(/\s/g, "").slice(-4);
  return `XXXX-XXXX-${last4}`;
}

function addPdfHeader(doc: PDFKit.PDFDocument, title?: string) {
  const logoPath = getLogoPath();
  
  if (logoPath) {
    try {
      doc.image(logoPath, 220, 30, { width: 60, height: 60 });
      doc.fontSize(22).fillColor("#0B1F3A").font("Helvetica-Bold")
        .text("RAKSHA ASSIST", 0, 95, { align: "center" });
    } catch {
      doc.fontSize(24).fillColor("#0B1F3A").font("Helvetica-Bold")
        .text("RAKSHA ASSIST", 0, 50, { align: "center" });
    }
  } else {
    doc.fontSize(24).fillColor("#0B1F3A").font("Helvetica-Bold")
      .text("RAKSHA ASSIST", 0, 50, { align: "center" });
  }
  
  doc.fontSize(9).fillColor("#179299").font("Helvetica")
    .text("EMERGENCY MEDICAL ASSISTANCE PROGRAM", 0, doc.y + 2, { align: "center" });
  doc.fontSize(7).fillColor("#666").font("Helvetica")
    .text("Operated by Mindwhile IT Solutions Pvt. Ltd.", 0, doc.y + 2, { align: "center" });
  doc.fontSize(7).fillColor("#666")
    .text("www.rakshaassist.com | +91 81437 52025 | support@rakshaassist.com", 0, doc.y + 2, { align: "center" });
  
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(2).stroke("#0B1F3A");
  doc.moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).lineWidth(0.5).stroke("#179299");
  doc.moveDown(1);
  
  if (title) {
    doc.fontSize(16).fillColor("#0B1F3A").font("Helvetica-Bold")
      .text(title, { align: "center" });
    doc.moveDown(1);
  }
}

function addPdfFooter(doc: PDFKit.PDFDocument, pageNum?: number, totalPages?: number) {
  const y = 770;
  doc.moveTo(50, y).lineTo(545, y).lineWidth(0.5).stroke("#e0e0e0");
  doc.fontSize(7).fillColor("#179299").font("Helvetica-Bold")
    .text("RAKSHA ASSIST - Mindwhile IT Solutions Pvt. Ltd.", 50, y + 5, { width: 495, align: "center" });
  doc.fontSize(6).fillColor("#999").font("Helvetica")
    .text("CIN: U72900TG2024PTC184818 | GSTIN: 36AAKCM2849P1Z3 | Bengaluru, Karnataka, India", 50, y + 15, { width: 495, align: "center" });
  if (pageNum && totalPages) {
    doc.fontSize(6).fillColor("#999")
      .text(`Page ${pageNum} of ${totalPages}`, 450, y + 5, { width: 95, align: "right" });
  }
}

export async function generateSummaryReport(): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  return new Promise(async (resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const allUsers = await storage.getAllUsers();
    const memberships = await storage.getAllMemberships();
    const emergencyRequests = await storage.getEmergencyRequests();
    const hospitals = await storage.getHospitals();

    addPdfHeader(doc, "SUMMARY REPORT");
    
    doc.fontSize(9).fillColor("#666").text(`Generated: ${formatDate(new Date())}`, { align: "center" });
    doc.moveDown(2);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#e0e0e0");
    doc.moveDown();

    doc.fontSize(14).fillColor("#0B1F3A").font("Helvetica-Bold").text("Overview Statistics");
    doc.moveDown(0.5);

    const stats = [
      { label: "Total Users", value: allUsers.filter(u => u.role === "user").length },
      { label: "Active Memberships", value: memberships.filter(m => m.status === "active").length },
      { label: "Total Agents", value: allUsers.filter(u => u.role === "agent").length },
      { label: "Network Hospitals", value: hospitals.length },
      { label: "Pending SOS Requests", value: emergencyRequests.filter(r => r.status === "pending").length },
      { label: "Approved Requests", value: emergencyRequests.filter(r => r.status === "approved").length },
    ];

    stats.forEach((stat) => {
      doc.fontSize(11).fillColor("#333").font("Helvetica").text(`${stat.label}: `, { continued: true });
      doc.fillColor("#179299").text(stat.value.toString());
    });

    doc.moveDown(2);

    doc.fontSize(14).fillColor("#0B1F3A").font("Helvetica-Bold").text("Membership Distribution");
    doc.moveDown(0.5);

    const planCounts: Record<string, number> = {};
    memberships.filter(m => m.status === "active").forEach((m) => {
      planCounts[m.planType] = (planCounts[m.planType] || 0) + 1;
    });

    Object.entries(planCounts).forEach(([plan, count]) => {
      doc.fontSize(11).fillColor("#333").font("Helvetica").text(`${plan}: ${count} members`);
    });

    doc.moveDown(2);

    doc.fontSize(14).fillColor("#0B1F3A").font("Helvetica-Bold").text("SOS Request Summary");
    doc.moveDown(0.5);

    const sosStats = [
      { label: "Pending", value: emergencyRequests.filter(r => r.status === "pending").length },
      { label: "Under Verification", value: emergencyRequests.filter(r => r.status === "under_verification").length },
      { label: "Approved", value: emergencyRequests.filter(r => r.status === "approved").length },
      { label: "Rejected", value: emergencyRequests.filter(r => r.status === "rejected").length },
    ];

    sosStats.forEach((stat) => {
      doc.fontSize(11).fillColor("#333").font("Helvetica").text(`${stat.label}: ${stat.value}`);
    });

    addPdfFooter(doc);
    doc.end();
  });
}

export async function generateFinancialReport(): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  return new Promise(async (resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const memberships = await storage.getAllMemberships();
    const allPayments: any[] = [];

    for (const m of memberships) {
      const payments = await storage.getPaymentsByMembership(m.id);
      allPayments.push(...payments);
    }

    const totalRevenue = allPayments
      .filter((p) => p.status === "succeeded")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const pendingPayouts = await storage.getPendingPayouts();
    const totalPendingPayouts = pendingPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);

    addPdfHeader(doc, "FINANCIAL REPORT");
    
    doc.fontSize(9).fillColor("#666").text(`Generated: ${formatDate(new Date())}`, { align: "center" });
    doc.moveDown(2);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#e0e0e0");
    doc.moveDown();

    doc.fontSize(14).fillColor("#0B1F3A").font("Helvetica-Bold").text("Revenue Summary");
    doc.moveDown(0.5);

    doc.fontSize(11).fillColor("#333").font("Helvetica")
      .text(`Total Revenue: ${formatCurrency(totalRevenue)}`)
      .text(`Successful Payments: ${allPayments.filter(p => p.status === "succeeded").length}`)
      .text(`Pending Payments: ${allPayments.filter(p => p.status === "created" || p.status === "processing").length}`)
      .text(`Failed Payments: ${allPayments.filter(p => p.status === "failed").length}`);

    doc.moveDown(2);

    doc.fontSize(14).fillColor("#0B1F3A").font("Helvetica-Bold").text("Commission & Payouts");
    doc.moveDown(0.5);

    doc.fontSize(11).fillColor("#333").font("Helvetica")
      .text(`Pending Agent Payouts: ${pendingPayouts.length}`)
      .text(`Total Pending Amount: ${formatCurrency(totalPendingPayouts)}`);

    doc.moveDown(2);

    doc.fontSize(14).fillColor("#0B1F3A").font("Helvetica-Bold").text("GST Summary (18%)");
    doc.moveDown(0.5);

    const gstAmount = Math.round(totalRevenue * 0.18);
    const netRevenue = totalRevenue - gstAmount;

    doc.fontSize(11).fillColor("#333").font("Helvetica")
      .text(`Gross Revenue: ${formatCurrency(totalRevenue)}`)
      .text(`GST (18%): ${formatCurrency(gstAmount)}`)
      .text(`Net Revenue: ${formatCurrency(netRevenue)}`);

    addPdfFooter(doc);
    doc.end();
  });
}

export async function generateMembershipReport(): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  return new Promise(async (resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const memberships = await storage.getAllMemberships();
    const activeMemberships = memberships.filter(m => m.status === "active");

    addPdfHeader(doc, "MEMBERSHIP REPORT");
    
    doc.fontSize(9).fillColor("#666").text(`Generated: ${formatDate(new Date())}`, { align: "center" });
    doc.moveDown(2);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#e0e0e0");
    doc.moveDown();

    doc.fontSize(14).fillColor("#0B1F3A").font("Helvetica-Bold").text("Membership Overview");
    doc.moveDown(0.5);

    doc.fontSize(11).fillColor("#333").font("Helvetica")
      .text(`Total Memberships: ${memberships.length}`)
      .text(`Active: ${activeMemberships.length}`)
      .text(`Pending: ${memberships.filter(m => m.status === "pending").length}`)
      .text(`Expired: ${memberships.filter(m => m.status === "expired").length}`);

    doc.moveDown(2);

    doc.fontSize(14).fillColor("#0B1F3A").font("Helvetica-Bold").text("Plan Distribution");
    doc.moveDown(0.5);

    const planCounts: Record<string, number> = {};
    activeMemberships.forEach((m) => {
      planCounts[m.planType] = (planCounts[m.planType] || 0) + 1;
    });

    Object.entries(planCounts).forEach(([plan, count]) => {
      const percentage = activeMemberships.length > 0 ? ((count / activeMemberships.length) * 100).toFixed(1) : "0";
      doc.fontSize(11).fillColor("#333").font("Helvetica").text(`${plan}: ${count} (${percentage}%)`);
    });

    doc.moveDown(2);

    doc.fontSize(14).fillColor("#0B1F3A").font("Helvetica-Bold").text("Recent Memberships (Last 10)");
    doc.moveDown(0.5);

    const recentMemberships = memberships
      .sort((a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime())
      .slice(0, 10);

    doc.fontSize(10).fillColor("#666").font("Helvetica");
    recentMemberships.forEach((m) => {
      doc.text(`${m.membershipNumber} - ${m.planType} - ${m.status} - ${formatDate(m.startDate || new Date())}`);
    });

    addPdfFooter(doc);
    doc.end();
  });
}

export async function generateSOSReport(): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  return new Promise(async (resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const emergencyRequests = await storage.getEmergencyRequests();

    addPdfHeader(doc, "SOS & EMERGENCY REPORT");
    
    doc.fontSize(9).fillColor("#666").text(`Generated: ${formatDate(new Date())}`, { align: "center" });
    doc.moveDown(2);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#e0e0e0");
    doc.moveDown();

    doc.fontSize(14).fillColor("#0B1F3A").font("Helvetica-Bold").text("Emergency Request Summary");
    doc.moveDown(0.5);

    const statusCounts = {
      pending: emergencyRequests.filter(r => r.status === "pending").length,
      under_verification: emergencyRequests.filter(r => r.status === "under_verification").length,
      approved: emergencyRequests.filter(r => r.status === "approved").length,
      rejected: emergencyRequests.filter(r => r.status === "rejected").length,
      completed: emergencyRequests.filter(r => r.status === "completed").length,
    };

    doc.fontSize(11).fillColor("#333").font("Helvetica")
      .text(`Total Requests: ${emergencyRequests.length}`)
      .text(`Pending: ${statusCounts.pending}`)
      .text(`Under Verification: ${statusCounts.under_verification}`)
      .text(`Approved: ${statusCounts.approved}`)
      .text(`Completed: ${statusCounts.completed}`)
      .text(`Rejected: ${statusCounts.rejected}`);

    doc.moveDown(2);

    const totalAmountRequested = emergencyRequests.reduce((sum, r) => sum + (r.amountRequested || 0), 0);
    const totalAmountApproved = emergencyRequests
      .filter(r => r.status === "approved" || r.status === "completed")
      .reduce((sum, r) => sum + (r.amountRequested || 0), 0);

    doc.fontSize(14).fillColor("#0B1F3A").font("Helvetica-Bold").text("Financial Impact");
    doc.moveDown(0.5);

    doc.fontSize(11).fillColor("#333").font("Helvetica")
      .text(`Total Amount Requested: ${formatCurrency(totalAmountRequested)}`)
      .text(`Total Amount Approved: ${formatCurrency(totalAmountApproved)}`);

    doc.moveDown(2);

    doc.fontSize(14).fillColor("#0B1F3A").font("Helvetica-Bold").text("Recent Emergency Requests");
    doc.moveDown(0.5);

    const recentRequests = emergencyRequests
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    doc.fontSize(10).fillColor("#666").font("Helvetica");
    recentRequests.forEach((r) => {
      doc.text(`${r.caseType} - ${r.status} - ${formatCurrency(r.amountRequested || 0)} - ${formatDate(r.createdAt)}`);
    });

    addPdfFooter(doc);
    doc.end();
  });
}

export async function generateMembershipCertificate(membershipId: string): Promise<Buffer> {
  const doc = new PDFDocument({ 
    size: "A4",
    margin: 50,
    layout: "portrait"
  });
  const chunks: Buffer[] = [];

  return new Promise(async (resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const membership = await storage.getMembershipById(membershipId);
    if (!membership) {
      doc.fontSize(16).text("Membership not found", { align: "center" });
      doc.end();
      return;
    }

    const user = await storage.getUserById(membership.userId);
    const plan = membership.planType ? await storage.getPlanByCode(membership.planType) : null;
    const familyMembers = await storage.getFamilyMembers(membership.id);
    
    let addOns: any[] = [];
    try {
      addOns = await storage.getMembershipAddOns(membership.id);
    } catch {}

    doc.rect(40, 40, 515, 760).lineWidth(2).stroke("#0B1F3A");
    doc.rect(44, 44, 507, 752).lineWidth(1).stroke("#179299");
    doc.rect(48, 48, 499, 744).lineWidth(0.5).stroke("#F6A60B");

    const logoPath = getLogoPath();
    let headerY = 60;
    if (logoPath) {
      try {
        doc.image(logoPath, 247, headerY, { width: 50, height: 50 });
        headerY += 55;
      } catch {
        headerY += 5;
      }
    }

    doc.fontSize(24).fillColor("#0B1F3A").font("Helvetica-Bold")
      .text("RAKSHA ASSIST", 0, headerY, { align: "center" });
    doc.fontSize(9).fillColor("#179299").font("Helvetica")
      .text("EMERGENCY MEDICAL ASSISTANCE PROGRAM", 0, headerY + 28, { align: "center" });
    doc.fontSize(7).fillColor("#666")
      .text("Operated by Mindwhile IT Solutions Pvt. Ltd.", 0, headerY + 40, { align: "center" });

    const titleY = headerY + 58;
    doc.moveTo(100, titleY).lineTo(495, titleY).lineWidth(2).stroke("#179299");
    doc.fontSize(20).fillColor("#F6A60B").font("Helvetica-Bold")
      .text("MEMBERSHIP CERTIFICATE", 0, titleY + 8, { align: "center" });
    doc.moveTo(150, titleY + 33).lineTo(445, titleY + 33).lineWidth(1).stroke("#F6A60B");

    doc.fontSize(9).fillColor("#666").font("Helvetica")
      .text(`Certificate No: ${membership.membershipNumber}`, 0, titleY + 42, { align: "center" });
    doc.fontSize(8).fillColor("#999")
      .text(`Date of Issue: ${membership.startDate ? formatDate(membership.startDate) : "N/A"}`, 0, titleY + 54, { align: "center" });

    const certTextY = titleY + 72;
    doc.fontSize(11).fillColor("#333").font("Helvetica")
      .text("This is to certify that", 0, certTextY, { align: "center" });

    doc.fontSize(18).fillColor("#0B1F3A").font("Helvetica-Bold")
      .text(user?.name?.toUpperCase() || "MEMBER", 0, certTextY + 18, { align: "center" });

    if (user?.aadhar) {
      doc.fontSize(9).fillColor("#666").font("Helvetica")
        .text(`Aadhaar: ${maskAadhaar(user.aadhar)}`, 0, certTextY + 40, { align: "center" });
    }

    doc.fontSize(10).fillColor("#333").font("Helvetica")
      .text("is a registered member of Raksha Assist Emergency Assistance Program", 0, certTextY + 55, { align: "center" });

    const boxY = certTextY + 75;
    doc.rect(70, boxY, 455, 95).fillAndStroke("#f0f7ff", "#d0e0f0");
    
    doc.fontSize(12).fillColor("#0B1F3A").font("Helvetica-Bold")
      .text("MEMBERSHIP DETAILS", 0, boxY + 8, { align: "center" });

    doc.fontSize(9).fillColor("#333").font("Helvetica");
    const col1 = 85;
    const col2 = 310;
    let detY = boxY + 26;
    
    doc.font("Helvetica-Bold").text("Plan:", col1, detY, { continued: true }).font("Helvetica").text(` ${plan?.name || membership.planType}`);
    doc.font("Helvetica-Bold").text("Member ID:", col2, detY, { continued: true }).font("Helvetica").text(` ${user?.mobile || "N/A"}`);
    detY += 15;
    doc.font("Helvetica-Bold").text("Support Limit:", col1, detY, { continued: true }).font("Helvetica").text(` ${formatCurrency(membership.coverageAmount || 0)}`);
    const statusText = membership.status?.toUpperCase() || "INACTIVE";
    const statusColor = membership.status === "active" ? "#179299" : "#dc2626";
    doc.font("Helvetica-Bold").text("Status:", col2, detY, { continued: true }).font("Helvetica").fillColor(statusColor).text(` ${statusText}`).fillColor("#333");
    detY += 15;
    doc.font("Helvetica-Bold").text("Valid From:", col1, detY, { continued: true }).font("Helvetica").text(` ${membership.startDate ? formatDate(membership.startDate) : "N/A"}`);
    doc.font("Helvetica-Bold").text("Valid Until:", col2, detY, { continued: true }).font("Helvetica").text(` ${membership.expiryDate ? formatDate(membership.expiryDate) : "N/A"}`);
    detY += 15;
    if (user?.dateOfBirth) {
      doc.font("Helvetica-Bold").text("Date of Birth:", col1, detY, { continued: true }).font("Helvetica").text(` ${user.dateOfBirth}`);
    }
    if (user?.bloodGroup) {
      doc.font("Helvetica-Bold").text("Blood Group:", col2, detY, { continued: true }).font("Helvetica").text(` ${user.bloodGroup}`);
    }

    let currentY = boxY + 105;

    if (familyMembers && familyMembers.length > 0) {
      doc.fontSize(11).fillColor("#0B1F3A").font("Helvetica-Bold")
        .text("COVERED FAMILY MEMBERS", 0, currentY, { align: "center" });
      currentY += 16;
      
      doc.rect(70, currentY, 455, 14).fill("#0B1F3A");
      doc.fontSize(8).fillColor("#FFFFFF").font("Helvetica-Bold");
      doc.text("S.No", 78, currentY + 3);
      doc.text("Name", 110, currentY + 3);
      doc.text("Relation", 260, currentY + 3);
      doc.text("Gender", 350, currentY + 3);
      doc.text("Date of Birth", 420, currentY + 3);
      currentY += 14;

      familyMembers.forEach((fm, i) => {
        const bgColor = i % 2 === 0 ? "#f8fafc" : "#ffffff";
        doc.rect(70, currentY, 455, 14).fill(bgColor);
        doc.fontSize(8).fillColor("#333").font("Helvetica");
        doc.text(`${i + 1}`, 78, currentY + 3);
        doc.text(fm.name || "N/A", 110, currentY + 3);
        doc.text(fm.relation || "N/A", 260, currentY + 3);
        doc.text(fm.gender || "N/A", 350, currentY + 3);
        doc.text(fm.dob || "N/A", 420, currentY + 3);
        currentY += 14;
      });
      currentY += 8;
    }

    if (addOns && addOns.length > 0) {
      doc.fontSize(11).fillColor("#0B1F3A").font("Helvetica-Bold")
        .text("ADD-ON BENEFITS", 0, currentY, { align: "center" });
      currentY += 16;
      addOns.forEach((addon) => {
        doc.fontSize(8).fillColor("#179299").font("Helvetica")
          .text(`✓ ${addon.name || addon.addOnId}`, 0, currentY, { align: "center" });
        currentY += 12;
      });
      currentY += 5;
    }

    if (currentY < 560) {
      doc.fontSize(11).fillColor("#0B1F3A").font("Helvetica-Bold")
        .text("ENTITLED BENEFITS", 0, currentY, { align: "center" });
      currentY += 16;

      const planFeatures = plan?.features ? 
        (typeof plan.features === 'string' ? plan.features.split(',').map((f: string) => f.trim()) : plan.features) : [];
      
      const defaultBenefits = [
        "24/7 Emergency SOS Support",
        "Hospital-Direct Financial Assistance",
        "Cashless Support at Network Hospitals",
        "Pan-India Hospital Network Access"
      ];
      
      const benefits = planFeatures.length > 0 ? planFeatures.slice(0, 6) : defaultBenefits;
      
      benefits.forEach((benefit: string) => {
        if (currentY < 680) {
          doc.fontSize(9).fillColor("#333").font("Helvetica")
            .text(`✓ ${benefit}`, 0, currentY, { align: "center" });
          currentY += 13;
        }
      });
    }

    const noticeY = Math.max(currentY + 10, 680);
    doc.fontSize(8).fillColor("#666").font("Helvetica-Oblique")
      .text("This certificate is subject to the terms and conditions of the Raksha Assist Membership Agreement.", 
        70, noticeY, { width: 455, align: "center" });
    doc.fontSize(7).fillColor("#999")
      .text("This is a computer-generated document and does not require a physical signature.", 
        70, noticeY + 12, { width: 455, align: "center" });

    const sigY = noticeY + 30;
    doc.moveTo(80, sigY).lineTo(240, sigY).stroke("#333");
    doc.moveTo(355, sigY).lineTo(515, sigY).stroke("#333");

    doc.fontSize(8).fillColor("#333").font("Helvetica")
      .text("Member Signature", 80, sigY + 5, { width: 160, align: "center" })
      .text("Authorized Signatory", 355, sigY + 5, { width: 160, align: "center" });

    doc.fontSize(7).fillColor("#179299").font("Helvetica-Bold")
      .text("RAKSHA ASSIST - Mindwhile IT Solutions Pvt. Ltd.", 0, 760, { align: "center" });
    doc.fontSize(6).fillColor("#666").font("Helvetica")
      .text("24/7 Emergency Support: +91 81437 52025 | support@rakshaassist.com | www.rakshaassist.com", 0, 770, { align: "center" });

    doc.end();
  });
}

export async function generatePolicyDocument(policyType: string): Promise<Buffer> {
  const doc = new PDFDocument({ 
    size: "A4",
    margin: 60,
    bufferPages: true
  });
  const chunks: Buffer[] = [];

  return new Promise(async (resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const { db } = await import("../db");
    const { policies } = await import("../../shared/schema");
    const { eq } = await import("drizzle-orm");

    const [policy] = await db.select().from(policies).where(eq(policies.type, policyType));
    
    if (!policy) {
      doc.fontSize(16).text("Policy document not found", { align: "center" });
      doc.end();
      return;
    }

    const logoPath = getLogoPath();
    if (logoPath) {
      try {
        doc.image(logoPath, 247, 30, { width: 50, height: 50 });
        doc.fontSize(20).fillColor("#0B1F3A").font("Helvetica-Bold")
          .text("RAKSHA ASSIST", 0, 85, { align: "center" });
      } catch {
        doc.fontSize(22).fillColor("#0B1F3A").font("Helvetica-Bold")
          .text("RAKSHA ASSIST", { align: "center" });
      }
    } else {
      doc.fontSize(22).fillColor("#0B1F3A").font("Helvetica-Bold")
        .text("RAKSHA ASSIST", { align: "center" });
    }
    
    doc.fontSize(9).fillColor("#179299").font("Helvetica")
      .text("EMERGENCY MEDICAL ASSISTANCE PROGRAM", { align: "center" });
    doc.fontSize(7).fillColor("#666")
      .text("Operated by Mindwhile IT Solutions Pvt. Ltd.", { align: "center" });
    doc.moveDown(0.5);
    doc.moveTo(60, doc.y).lineTo(535, doc.y).lineWidth(2).stroke("#0B1F3A");
    doc.moveDown(1);

    doc.fontSize(16).fillColor("#0B1F3A").font("Helvetica-Bold")
      .text(policy.title.toUpperCase(), { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(9).fillColor("#666").font("Helvetica")
      .text(`Version: ${policy.version} | Last Updated: ${formatDate(policy.updatedAt)}`, { align: "center" });
    doc.moveDown(2);

    const content = policy.content || "";
    const lines = content.split("\n");

    for (const line of lines) {
      if (line.startsWith("# ")) {
        doc.moveDown(0.5);
        doc.fontSize(14).fillColor("#0B1F3A").font("Helvetica-Bold")
          .text(line.substring(2));
        doc.moveDown(0.3);
      } else if (line.startsWith("## ")) {
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor("#179299").font("Helvetica-Bold")
          .text(line.substring(3));
        doc.moveDown(0.3);
      } else if (line.startsWith("### ")) {
        doc.moveDown(0.3);
        doc.fontSize(11).fillColor("#333").font("Helvetica-Bold")
          .text(line.substring(4));
        doc.moveDown(0.2);
      } else if (line.startsWith("**") && line.endsWith("**")) {
        doc.fontSize(10).fillColor("#333").font("Helvetica-Bold")
          .text(line.replace(/\*\*/g, ""));
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        doc.fontSize(10).fillColor("#333").font("Helvetica")
          .text("  • " + line.substring(2));
      } else if (line.startsWith("|")) {
        doc.fontSize(9).fillColor("#333").font("Helvetica")
          .text(line.replace(/\|/g, "  |  ").trim());
      } else if (line.startsWith("---")) {
        doc.moveTo(60, doc.y).lineTo(535, doc.y).stroke("#e0e0e0");
        doc.moveDown(0.5);
      } else if (line.trim()) {
        doc.fontSize(10).fillColor("#333").font("Helvetica")
          .text(line.replace(/\*\*/g, "").replace(/\*/g, ""), { align: "justify" });
      } else {
        doc.moveDown(0.3);
      }

      if (doc.y > 740) {
        doc.addPage();
      }
    }

    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(7).fillColor("#179299").font("Helvetica-Bold")
        .text("RAKSHA ASSIST - Mindwhile IT Solutions Pvt. Ltd.", 60, 770, { width: 475, align: "center" });
      doc.fontSize(6).fillColor("#999").font("Helvetica")
        .text(
          `${policy.title} | Page ${i + 1} of ${pageCount} | www.rakshaassist.com`,
          60, 780, { align: "center", width: 475 }
        );
    }

    doc.end();
  });
}

export async function generateMembershipAgreement(membershipId: string): Promise<Buffer> {
  const doc = new PDFDocument({ 
    size: "A4",
    margin: 60,
    bufferPages: true
  });
  const chunks: Buffer[] = [];

  return new Promise(async (resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const membership = await storage.getMembershipById(membershipId);
    if (!membership) {
      doc.fontSize(16).text("Membership not found", { align: "center" });
      doc.end();
      return;
    }

    const user = await storage.getUserById(membership.userId);
    const plan = membership.planType ? await storage.getPlanByCode(membership.planType) : null;
    const familyMembers = await storage.getFamilyMembers(membership.id);
    
    let addOns: any[] = [];
    try {
      addOns = await storage.getMembershipAddOns(membership.id);
    } catch {}

    const logoPath = getLogoPath();
    if (logoPath) {
      try {
        doc.image(logoPath, 247, 25, { width: 50, height: 50 });
        doc.fontSize(20).fillColor("#0B1F3A").font("Helvetica-Bold")
          .text("RAKSHA ASSIST", 0, 80, { align: "center" });
      } catch {
        doc.fontSize(22).fillColor("#0B1F3A").font("Helvetica-Bold")
          .text("RAKSHA ASSIST", { align: "center" });
      }
    } else {
      doc.fontSize(22).fillColor("#0B1F3A").font("Helvetica-Bold")
        .text("RAKSHA ASSIST", { align: "center" });
    }
    
    doc.fontSize(9).fillColor("#179299")
      .text("EMERGENCY MEDICAL ASSISTANCE PROGRAM", { align: "center" });
    doc.fontSize(7).fillColor("#666")
      .text("Operated by Mindwhile IT Solutions Pvt. Ltd.", { align: "center" });
    doc.moveDown(0.5);
    doc.moveTo(60, doc.y).lineTo(535, doc.y).lineWidth(2).stroke("#0B1F3A");
    doc.moveDown(1);

    doc.fontSize(16).fillColor("#0B1F3A").font("Helvetica-Bold")
      .text("MEMBERSHIP AGREEMENT", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(8).fillColor("#666").font("Helvetica")
      .text(`Agreement No: ${membership.membershipNumber} | Date: ${formatDate(membership.startDate)}`, { align: "center" });
    doc.moveDown(1.5);

    const memberBoxH = user?.aadhar ? 105 : 88;
    doc.rect(60, doc.y, 475, memberBoxH).fillAndStroke("#f0f7ff", "#d0e0f0");
    const boxY = doc.y + 10;
    
    doc.fontSize(10).fillColor("#0B1F3A").font("Helvetica-Bold")
      .text("MEMBER INFORMATION", 80, boxY);
    
    let infoY = boxY + 16;
    doc.fontSize(9).fillColor("#333").font("Helvetica");
    
    doc.font("Helvetica-Bold").text("Full Name:", 80, infoY, { continued: true }).font("Helvetica").text(` ${user?.name || "N/A"}`);
    doc.font("Helvetica-Bold").text("Membership No:", 330, infoY, { continued: true }).font("Helvetica").text(` ${membership.membershipNumber}`);
    infoY += 14;
    doc.font("Helvetica-Bold").text("Mobile:", 80, infoY, { continued: true }).font("Helvetica").text(` ${user?.mobile || "N/A"}`);
    doc.font("Helvetica-Bold").text("Email:", 330, infoY, { continued: true }).font("Helvetica").text(` ${user?.email || "N/A"}`);
    infoY += 14;
    if (user?.dateOfBirth) {
      doc.font("Helvetica-Bold").text("Date of Birth:", 80, infoY, { continued: true }).font("Helvetica").text(` ${user.dateOfBirth}`);
    }
    if (user?.bloodGroup) {
      doc.font("Helvetica-Bold").text("Blood Group:", 330, infoY, { continued: true }).font("Helvetica").text(` ${user.bloodGroup}`);
    }
    if (user?.dateOfBirth || user?.bloodGroup) infoY += 14;
    if (user?.aadhar) {
      doc.font("Helvetica-Bold").text("Aadhaar:", 80, infoY, { continued: true }).font("Helvetica").text(` ${maskAadhaar(user.aadhar)}`);
      doc.font("Helvetica-Bold").text("Verified:", 330, infoY, { continued: true })
        .font("Helvetica").fillColor(user?.aadharVerified ? "#179299" : "#999").text(` ${user?.aadharVerified ? "Yes" : "Pending"}`).fillColor("#333");
      infoY += 14;
    }

    doc.y = boxY + memberBoxH + 10;

    doc.rect(60, doc.y, 475, 72).fillAndStroke("#f8faf0", "#d0e0c0");
    const planBoxY = doc.y + 10;
    
    doc.fontSize(10).fillColor("#0B1F3A").font("Helvetica-Bold")
      .text("PLAN DETAILS", 80, planBoxY);
    
    let planInfoY = planBoxY + 16;
    doc.fontSize(9).fillColor("#333").font("Helvetica");
    doc.font("Helvetica-Bold").text("Plan:", 80, planInfoY, { continued: true }).font("Helvetica").text(` ${plan?.name || membership.planType}`);
    doc.font("Helvetica-Bold").text("Category:", 330, planInfoY, { continued: true }).font("Helvetica").text(` ${plan?.planCategory || "Individual"}`);
    planInfoY += 14;
    doc.font("Helvetica-Bold").text("Support Limit:", 80, planInfoY, { continued: true }).font("Helvetica").text(` ${formatCurrency(membership.coverageAmount || 0)}`);
    doc.font("Helvetica-Bold").text("Amount Paid:", 330, planInfoY, { continued: true }).font("Helvetica").text(` ${formatCurrency(membership.planAmount || 0)}`);
    planInfoY += 14;
    doc.font("Helvetica-Bold").text("Valid From:", 80, planInfoY, { continued: true }).font("Helvetica").text(` ${formatDate(membership.startDate || new Date())}`);
    doc.font("Helvetica-Bold").text("Valid Until:", 330, planInfoY, { continued: true }).font("Helvetica").text(` ${formatDate(membership.expiryDate || new Date())}`);

    doc.y = planBoxY + 72 + 15;

    if (familyMembers && familyMembers.length > 0) {
      doc.fontSize(11).fillColor("#0B1F3A").font("Helvetica-Bold")
        .text("COVERED FAMILY MEMBERS");
      doc.moveDown(0.5);
      
      doc.rect(60, doc.y, 475, 14).fill("#0B1F3A");
      let tableY = doc.y;
      doc.fontSize(8).fillColor("#FFFFFF").font("Helvetica-Bold");
      doc.text("S.No", 68, tableY + 3);
      doc.text("Full Name", 100, tableY + 3);
      doc.text("Relation", 250, tableY + 3);
      doc.text("Gender", 340, tableY + 3);
      doc.text("Date of Birth", 420, tableY + 3);
      tableY += 14;

      familyMembers.forEach((fm, i) => {
        const bgColor = i % 2 === 0 ? "#f8fafc" : "#ffffff";
        doc.rect(60, tableY, 475, 14).fill(bgColor);
        doc.fontSize(8).fillColor("#333").font("Helvetica");
        doc.text(`${i + 1}`, 68, tableY + 3);
        doc.text(fm.name || "N/A", 100, tableY + 3);
        doc.text(fm.relation || "N/A", 250, tableY + 3);
        doc.text(fm.gender || "N/A", 340, tableY + 3);
        doc.text(fm.dob || "N/A", 420, tableY + 3);
        tableY += 14;
      });
      doc.y = tableY + 10;
    }

    if (addOns && addOns.length > 0) {
      doc.fontSize(11).fillColor("#0B1F3A").font("Helvetica-Bold")
        .text("ADD-ON BENEFITS PURCHASED");
      doc.moveDown(0.5);
      addOns.forEach((addon) => {
        doc.fontSize(9).fillColor("#179299").font("Helvetica")
          .text(`  ✓ ${addon.name || addon.addOnId} - ${formatCurrency(addon.purchasePrice || 0)}`);
      });
      doc.moveDown(1);
    }

    if (doc.y > 500) doc.addPage();

    doc.fontSize(12).fillColor("#0B1F3A").font("Helvetica-Bold")
      .text("TERMS OF MEMBERSHIP");
    doc.moveDown(0.5);

    const terms = [
      "1. SCOPE OF SERVICES: Raksha Assist shall provide emergency financial assistance directly to network hospitals during covered medical emergencies and accidents, subject to the terms of the selected membership plan.",
      "2. MEMBER OBLIGATIONS: The Member agrees to provide accurate personal and medical information, maintain updated contact details, and use the SOS services only for genuine emergencies.",
      "3. SUPPORT LIMITS: Financial assistance is subject to the Support Limit specified in the membership plan. Co-pay contributions may apply as per plan terms.",
      "4. WAITING PERIOD: Certain benefits are subject to a waiting period as specified in the plan terms. No assistance shall be provided for conditions that manifest during the waiting period.",
      "5. EXCLUSIONS: Pre-existing conditions (during waiting period), self-inflicted injuries, cosmetic procedures, and cases arising from illegal activities are not covered.",
      "6. RENEWAL: Membership must be renewed before expiry to maintain continuous coverage. Lapsed memberships may require fresh enrollment.",
      "7. TERMINATION: Either party may terminate this agreement with written notice. Refunds are subject to the Refund & Cancellation Policy.",
      "8. DISPUTE RESOLUTION: Any disputes arising from this agreement shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka.",
      "9. GOVERNING LAW: This agreement shall be governed by and construed in accordance with the laws of India.",
      "10. AMENDMENTS: Raksha Assist reserves the right to amend terms with 30 days prior notice to members."
    ];

    doc.fontSize(8).fillColor("#333").font("Helvetica");
    terms.forEach(term => {
      doc.text(term, { align: "justify" });
      doc.moveDown(0.3);
      if (doc.y > 720) doc.addPage();
    });

    doc.moveDown(1);
    doc.fontSize(10).fillColor("#0B1F3A").font("Helvetica-Bold")
      .text("MEMBER DECLARATION");
    doc.moveDown(0.5);
    doc.fontSize(8).fillColor("#333").font("Helvetica")
      .text("I hereby declare that the information provided during enrollment is true and accurate. I have read, understood, and agree to abide by the terms and conditions of the Raksha Assist Membership Program.", { align: "justify" });

    doc.moveDown(2);
    doc.moveTo(60, doc.y).lineTo(250, doc.y).stroke("#333");
    doc.moveTo(345, doc.y).lineTo(535, doc.y).stroke("#333");
    doc.moveDown(0.3);
    doc.fontSize(8).fillColor("#333")
      .text("Member Signature", 60, doc.y, { width: 190, align: "center" });
    doc.text("For Raksha Assist Pvt. Ltd.", 345, doc.y - 10, { width: 190, align: "center" });

    doc.moveDown(1);
    doc.fontSize(8).fillColor("#333")
      .text(`Name: ${user?.name || "_________________"}`, 60)
      .text(`Date: ${formatDate(new Date())}`, 60);

    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(7).fillColor("#179299").font("Helvetica-Bold")
        .text("RAKSHA ASSIST - Mindwhile IT Solutions Pvt. Ltd.", 60, 770, { width: 475, align: "center" });
      doc.fontSize(6).fillColor("#999").font("Helvetica")
        .text(
          `Membership Agreement | ${membership.membershipNumber} | Page ${i + 1} of ${pageCount}`,
          60, 780, { align: "center", width: 475 }
        );
    }

    doc.end();
  });
}
