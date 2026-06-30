import PDFDocument from 'pdfkit';
import { storage } from './storage';
import path from 'path';
import fs from 'fs';

interface BrochureOptions {
  planCode: string;
  includeConditions?: boolean;
  memberName?: string;
  membershipNumber?: string;
  membershipDetails?: {
    vehicleNumber?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    propertyAddress?: string;
    businessName?: string;
    startDate?: Date;
    expiryDate?: Date;
  };
}

function getBrochureLogoPath(): string | null {
  const possiblePaths = [
    path.join(process.cwd(), "dist", "public", "logo.png"),
    path.join(process.cwd(), "public", "logo.png"),
    path.join(process.cwd(), "frontend", "public", "logo.png"),
    path.join(process.cwd(), "frontend", "dist", "logo.png"),
    path.resolve(process.cwd(), "..", "frontend", "dist", "logo.png"),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const CATEGORY_CONFIG: Record<string, { title: string; icon: string; exclusions: string[]; color: string }> = {
  individual: {
    title: 'Medical Emergency Assistance',
    icon: '🏥',
    color: '#179299',
    exclusions: [
      'Pre-existing conditions (detailed list below)',
      'Cosmetic & elective procedures',
      'Self-inflicted injuries',
      'Routine health check-ups',
      'Dental treatments (except emergency)',
      'Outpatient/OPD treatments',
      'Substance abuse injuries',
      'Alternative medicine',
      'Pregnancy (except complications)',
      'War & terrorism incidents'
    ]
  },
  family: {
    title: 'Family Medical Assistance',
    icon: '👨‍👩‍👧‍👦',
    color: '#7c3aed',
    exclusions: [
      'Pre-existing conditions (detailed list below)',
      'Cosmetic & elective procedures',
      'Self-inflicted injuries',
      'Routine health check-ups',
      'Non-emergency dental treatments',
      'Outpatient/OPD treatments',
      'Substance abuse injuries',
      'Infertility treatments',
      'Congenital conditions',
      'War & terrorism incidents'
    ]
  },
  senior: {
    title: 'Senior Citizen Care Assistance',
    icon: '👴',
    color: '#059669',
    exclusions: [
      'Pre-existing conditions (detailed list below)',
      'Conditions before enrollment',
      'Elective procedures',
      'Dental treatments',
      'Hearing aids & spectacles',
      'Routine check-ups',
      'Cosmetic treatments',
      'Self-inflicted injuries',
      'Substance abuse',
      'War & terrorism incidents'
    ]
  },
  maternity: {
    title: 'Maternity Care Assistance',
    icon: '🤰',
    color: '#db2777',
    exclusions: [
      'First 9 months waiting period',
      'Infertility treatments',
      'Cosmetic procedures',
      'Voluntary termination',
      'Pre-existing complications',
      'Surrogacy expenses',
      'Adoption related expenses',
      'Routine vitamins/supplements',
      'Birth control procedures',
      'Self-inflicted injuries'
    ]
  },
  two_wheeler: {
    title: 'Two Wheeler Roadside Assistance',
    icon: '🏍️',
    color: '#ea580c',
    exclusions: [
      'Racing or competition damage',
      'Commercial use damage',
      'Intentional damage',
      'Unlicensed rider incidents',
      'Drink driving incidents',
      'War & riots damage',
      'Nuclear incidents',
      'Wear and tear',
      'Pre-existing damage',
      'Theft without FIR'
    ]
  },
  car: {
    title: 'Car Roadside Assistance',
    icon: '🚗',
    color: '#2563eb',
    exclusions: [
      'Racing or competition damage',
      'Commercial taxi use',
      'Intentional damage',
      'Unlicensed driver incidents',
      'Drink driving incidents',
      'War & riots damage',
      'Nuclear incidents',
      'Normal wear and tear',
      'Pre-existing damage',
      'Theft without police report'
    ]
  },
  commercial_vehicle: {
    title: 'Commercial Vehicle Assistance',
    icon: '🚛',
    color: '#4f46e5',
    exclusions: [
      'Overloading damage',
      'Unlicensed driver incidents',
      'Intentional damage',
      'Pre-existing damage',
      'Consequential losses',
      'Cargo value claims',
      'War & riots damage',
      'Nuclear incidents',
      'Normal maintenance',
      'Theft without FIR'
    ]
  },
  home: {
    title: 'Home Emergency Assistance',
    icon: '🏠',
    color: '#0891b2',
    exclusions: [
      'Pre-existing damage',
      'Intentional damage',
      'War & riots damage',
      'Nuclear incidents',
      'Pest infestation',
      'Routine maintenance',
      'Wear and tear',
      'Illegal constructions',
      'Unoccupied property (>30 days)',
      'Landscaping damage'
    ]
  },
  business: {
    title: 'Business Emergency Assistance',
    icon: '🏢',
    color: '#7c2d12',
    exclusions: [
      'Pre-existing issues',
      'Intentional acts by owner',
      'War & terrorism',
      'Nuclear incidents',
      'Consequential losses',
      'Stock/inventory losses',
      'Cyber ransom payments',
      'Employee theft',
      'Business interruption losses',
      'Illegal business activities'
    ]
  },
  travel: {
    title: 'Travel Assistance Program',
    icon: '✈️',
    color: '#0d9488',
    exclusions: [
      'Pre-existing conditions',
      'Adventure sports (without add-on)',
      'War zones travel',
      'Intentional self-harm',
      'Alcohol/drug related',
      'Pregnancy complications',
      'Mental health conditions',
      'Pre-booked events cancellation',
      'Visa rejection',
      'Travel against medical advice'
    ]
  }
};

export async function generatePlanBrochure(options: BrochureOptions): Promise<Buffer> {
  const { planCode, includeConditions = true, memberName, membershipNumber, membershipDetails } = options;
  
  const plan = await storage.getPlanByCode(planCode);
  if (!plan) {
    throw new Error(`Plan not found: ${planCode}`);
  }

  const conditions = await storage.getPlanConditionsByType(planCode.toLowerCase());
  const category = (plan as any).planCategory || 'individual';
  const categoryConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.individual;

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const primaryColor = '#0B1F3A';
    const secondaryColor = categoryConfig.color;
    const accentColor = '#F6A60B';
    const lightBg = '#f8fafc';

    doc.rect(0, 0, 595.28, 100).fill(primaryColor);
    doc.rect(0, 100, 595.28, 6).fill(accentColor);

    const brochureLogo = getBrochureLogoPath();
    if (brochureLogo) {
      doc.image(brochureLogo, 40, 20, { width: 60 });
    }

    doc.fillColor('white').fontSize(26).font('Helvetica-Bold')
       .text('RAKSHA ASSIST', 110, 28);
    doc.fontSize(11).font('Helvetica')
       .text(categoryConfig.title, 110, 58);
    doc.fontSize(9).fillColor('#a0d2db')
       .text('24/7 Helpline: +91 81437 52025', 110, 75);

    doc.rect(40, 130, 515, 50).fillAndStroke(secondaryColor, secondaryColor);
    doc.fillColor('white').fontSize(22).font('Helvetica-Bold')
       .text(`${categoryConfig.icon} ${plan.name.toUpperCase()}`, 50, 145, { align: 'center', width: 495 });

    doc.fillColor('#555').fontSize(11).font('Helvetica')
       .text(plan.description || plan.shortDescription || '', 50, 195, { align: 'center', width: 495 });

    let startY = 230;
    if (memberName && membershipNumber) {
      doc.rect(40, startY, 515, 80).fillAndStroke(lightBg, '#e2e8f0');
      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold')
         .text('MEMBERSHIP DETAILS', 55, startY + 12);
      doc.fillColor('#333').fontSize(10).font('Helvetica')
         .text(`Member: ${memberName}`, 55, startY + 30)
         .text(`ID: ${membershipNumber}`, 200, startY + 30);
      
      if (membershipDetails?.startDate) {
        doc.text(`Valid From: ${membershipDetails.startDate.toLocaleDateString('en-IN')}`, 350, startY + 30);
      }
      if (membershipDetails?.expiryDate) {
        doc.text(`Valid Till: ${membershipDetails.expiryDate.toLocaleDateString('en-IN')}`, 350, startY + 45);
      }

      if (['two_wheeler', 'car', 'commercial_vehicle'].includes(category) && membershipDetails?.vehicleNumber) {
        doc.text(`Vehicle: ${membershipDetails.vehicleMake || ''} ${membershipDetails.vehicleModel || ''}`, 55, startY + 50);
        doc.text(`Reg No: ${membershipDetails.vehicleNumber}`, 55, startY + 65);
      }
      if (category === 'home' && membershipDetails?.propertyAddress) {
        doc.text(`Property: ${membershipDetails.propertyAddress}`, 55, startY + 50, { width: 450 });
      }
      if (category === 'business' && membershipDetails?.businessName) {
        doc.text(`Business: ${membershipDetails.businessName}`, 55, startY + 50);
      }
      startY += 95;
    }

    doc.rect(40, startY, 515, 90).fillAndStroke(lightBg, '#e2e8f0');
    
    const col1X = 70, col2X = 220, col3X = 380;
    const row1Y = startY + 15, row2Y = startY + 55;
    
    doc.fillColor(secondaryColor).fontSize(9).font('Helvetica')
       .text('YEARLY PRICE', col1X, row1Y);
    doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold')
       .text(`₹${plan.price.toLocaleString()}`, col1X, row1Y + 12);

    doc.fillColor(secondaryColor).fontSize(9).font('Helvetica')
       .text('SUPPORT LIMIT', col2X, row1Y);
    const coverageText = (plan.coverageAmount || 0) >= 100000 
      ? `₹${((plan.coverageAmount || 0) / 100000).toFixed(1)} Lakh` 
      : `₹${((plan.coverageAmount || 0) / 1000).toFixed(0)}K`;
    doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold')
       .text(coverageText, col2X, row1Y + 12);

    doc.fillColor(secondaryColor).fontSize(9).font('Helvetica')
       .text('MEMBERS/ASSETS', col3X, row1Y);
    doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold')
       .text(`${plan.maxMembers || 1}`, col3X, row1Y + 12);

    doc.fillColor(secondaryColor).fontSize(9).font('Helvetica')
       .text('VALIDITY', col1X, row2Y);
    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold')
       .text(`${plan.validityDays || 365} Days`, col1X, row2Y + 10);

    doc.fillColor(secondaryColor).fontSize(9).font('Helvetica')
       .text('WAITING PERIOD', col2X, row2Y);
    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold')
       .text(`${plan.waitingPeriodDays || 0} Days`, col2X, row2Y + 10);

    doc.fillColor(secondaryColor).fontSize(9).font('Helvetica')
       .text('CO-PAY', col3X, row2Y);
    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold')
       .text(`${plan.coPay || 0}%`, col3X, row2Y + 10);

    let currentY = startY + 110;

    let features: string[] = [];
    try {
      features = plan.features ? JSON.parse(plan.features) : [];
    } catch (e) {
      features = [];
    }

    if (features.length > 0) {
      doc.rect(40, currentY, 250, 20).fill(secondaryColor);
      doc.fillColor('white').fontSize(11).font('Helvetica-Bold')
         .text('PLAN BENEFITS', 50, currentY + 5);
      currentY += 30;

      features.forEach((feature) => {
        doc.fillColor(accentColor).fontSize(12).font('Helvetica-Bold')
           .text('✓', 50, currentY);
        doc.fillColor('#333').fontSize(10).font('Helvetica')
           .text(feature, 70, currentY);
        currentY += 18;
      });
      currentY += 10;
    }

    doc.rect(40, currentY, 515, 20).fill('#dc2626');
    doc.fillColor('white').fontSize(11).font('Helvetica-Bold')
       .text('WHAT IS NOT COVERED (EXCLUSIONS)', 50, currentY + 5);
    currentY += 30;

    const exclusions = categoryConfig.exclusions;
    const col1 = exclusions.slice(0, 5);
    const col2 = exclusions.slice(5);
    
    col1.forEach((item, i) => {
      doc.fillColor('#dc2626').fontSize(10).font('Helvetica')
         .text('✗', 50, currentY + (i * 14));
      doc.fillColor('#555').fontSize(8).font('Helvetica')
         .text(item, 65, currentY + (i * 14));
    });
    
    col2.forEach((item, i) => {
      doc.fillColor('#dc2626').fontSize(10).font('Helvetica')
         .text('✗', 300, currentY + (i * 14));
      doc.fillColor('#555').fontSize(8).font('Helvetica')
         .text(item, 315, currentY + (i * 14));
    });
    currentY += 80;

    if (['individual', 'family', 'senior'].includes(category)) {
      doc.rect(40, currentY, 515, 18).fill('#991b1b');
      doc.fillColor('white').fontSize(9).font('Helvetica-Bold')
         .text('PRE-EXISTING CONDITIONS NOT COVERED', 50, currentY + 4);
      currentY += 25;

      const preExistingConditions = {
        'Heart': 'Heart disease, BP, Angina, Heart failure',
        'Metabolic': 'Diabetes, Thyroid, Obesity-related',
        'Respiratory': 'Asthma, COPD, Bronchitis',
        'Neurological': 'Epilepsy, Stroke, Parkinsons',
        'Bone/Joint': 'Arthritis, Back pain, Disc issues',
        'Kidney/Liver': 'Kidney disease, Cirrhosis, Hepatitis',
        'Cancer': 'Any cancer history or tumors',
        'Mental': 'Depression, Anxiety, Bipolar'
      };

      let condY = currentY;
      Object.entries(preExistingConditions).forEach(([cat, conds], i) => {
        const xPos = i % 2 === 0 ? 50 : 300;
        const yOffset = Math.floor(i / 2) * 24;
        doc.fillColor('#7f1d1d').fontSize(7).font('Helvetica-Bold')
           .text(`${cat}:`, xPos, condY + yOffset);
        doc.fillColor('#666').fontSize(6).font('Helvetica')
           .text(conds, xPos, condY + yOffset + 9, { width: 240 });
      });
      currentY = condY + 110;
    }

    if (includeConditions && conditions.length > 0) {
      currentY += 10;
      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold')
         .text('Terms & Conditions', 40, currentY);
      currentY += 18;

      const visibleConditions = conditions.filter((c: any) => !c.isHidden);
      visibleConditions.slice(0, 5).forEach((condition: any) => {
        doc.fillColor('#444').fontSize(9).font('Helvetica-Bold')
           .text(`• ${condition.title}`, 50, currentY);
        currentY += 12;
      });
    }

    const pageHeight = 841.89;
    const footerY = pageHeight - 100;
    
    doc.rect(40, footerY - 40, 515, 35).fillAndStroke('#fef3c7', '#f59e0b');
    doc.fillColor('#92400e').fontSize(9).font('Helvetica-Bold')
       .text('IMPORTANT NOTICE', 50, footerY - 35);
    doc.fillColor('#78350f').fontSize(8).font('Helvetica')
       .text('This is NOT an insurance policy. Raksha Assist is a membership-based emergency assistance program. All assistance is subject to verification, fund availability, and terms & conditions.', 
             50, footerY - 22, { width: 495 });
    
    doc.rect(0, footerY, 595.28, 100).fill(primaryColor);
    
    doc.fillColor('white').fontSize(10).font('Helvetica-Bold')
       .text('Need Help? We\'re Here 24/7', 50, footerY + 15, { align: 'center', width: 495 });
    
    doc.fillColor('#a0d2db').fontSize(12).font('Helvetica')
       .text('+91 81437 52025  |  support@rakshaassist.com  |  www.rakshaassist.com', 
             50, footerY + 35, { align: 'center', width: 495 });

    doc.fillColor('#64748b').fontSize(8).font('Helvetica')
       .text('Jurisdiction: All disputes subject to exclusive jurisdiction of courts in Bengaluru, Karnataka, India.', 
             50, footerY + 60, { align: 'center', width: 495 });

    doc.fillColor('#475569').fontSize(7)
       .text(`Document generated on ${new Date().toLocaleDateString('en-IN')} | Ref: RA-${Date.now()}`, 
             50, footerY + 75, { align: 'center', width: 495 });

    doc.fillColor('#94a3b8').fontSize(6)
       .text('Raksha Assist | Mindwhile IT Solutions Pvt. Ltd. | CIN: U72900TG2024PTC184818', 
             50, footerY + 88, { align: 'center', width: 495 });

    const addPageHeader = (title: string) => {
      doc.addPage();
      doc.rect(0, 0, 595.28, 70).fill(primaryColor);
      doc.rect(0, 70, 595.28, 4).fill(accentColor);
      const headerLogo = getBrochureLogoPath();
      if (headerLogo) {
        doc.image(headerLogo, 40, 12, { width: 45 });
      }
      doc.fillColor('white').fontSize(18).font('Helvetica-Bold')
         .text('RAKSHA ASSIST', 95, 18);
      doc.fontSize(9).font('Helvetica').fillColor('#a0d2db')
         .text('Membership-Based Assistance Program', 95, 40);
      doc.fillColor('#cbd5e1').fontSize(8)
         .text('24/7 Helpline: +91 81437 52025', 95, 53);
      doc.rect(40, 85, 515, 32).fill(secondaryColor);
      doc.fillColor('white').fontSize(14).font('Helvetica-Bold')
         .text(title, 50, 93, { align: 'center', width: 495 });
      return 135;
    };

    const addPageFooter = (pageNum: number, totalPages: number) => {
      const fY = 841.89 - 40;
      doc.rect(0, fY - 5, 595.28, 45).fill(primaryColor);
      doc.fillColor('#94a3b8').fontSize(7).font('Helvetica')
         .text('Raksha Assist | Mindwhile IT Solutions Pvt. Ltd. | CIN: U72900TG2024PTC184818', 
               50, fY + 2, { align: 'center', width: 495 });
      doc.fillColor('#64748b').fontSize(6)
         .text(`Page ${pageNum} of ${totalPages}`, 50, fY + 15, { align: 'center', width: 495 });
      doc.fillColor('#475569').fontSize(6)
         .text('www.rakshaassist.com | support@rakshaassist.com | +91 81437 52025', 
               50, fY + 25, { align: 'center', width: 495 });
    };

    const totalPages = 5;

    const COVERAGE_ITEMS: Record<string, string[]> = {
      individual: [
        'Accidental injuries (from Day 1)',
        'Medical emergencies (after 30-day waiting period)',
        'Hospitalization expenses (Room, ICU, OT charges)',
        'Doctor consultation fees during hospitalization',
        'Diagnostic tests & procedures',
        'Medicines during hospitalization',
        'Ambulance charges (up to \u20B93,000)',
        'Pre-hospitalization expenses (30 days before admission)',
        'Post-hospitalization expenses (60 days after discharge)',
        'Day care procedures (listed procedures)',
        'Organ donor expenses',
        'Emergency dental (accident only)'
      ],
      family: [
        'Accidental injuries (from Day 1)',
        'Medical emergencies (after 30-day waiting period)',
        'Hospitalization expenses (Room, ICU, OT charges)',
        'Doctor consultation fees during hospitalization',
        'Diagnostic tests & procedures',
        'Medicines during hospitalization',
        'Ambulance charges (up to \u20B93,000)',
        'Pre-hospitalization expenses (30 days before admission)',
        'Post-hospitalization expenses (60 days after discharge)',
        'Day care procedures (listed procedures)',
        'Organ donor expenses',
        'Emergency dental (accident only)'
      ],
      senior: [
        'Accidental injuries (from Day 1)',
        'Medical emergencies (after 30-day waiting period)',
        'Hospitalization expenses (Room, ICU, OT charges)',
        'Doctor consultation fees during hospitalization',
        'Diagnostic tests & procedures',
        'Medicines during hospitalization',
        'Ambulance charges (up to \u20B93,000)',
        'Pre-hospitalization expenses (30 days before admission)',
        'Post-hospitalization expenses (60 days after discharge)',
        'Day care procedures (listed procedures)',
        'Organ donor expenses',
        'Emergency dental (accident only)'
      ],
      maternity: [
        'Normal delivery expenses',
        'Cesarean section expenses',
        'Pre-natal check-ups & tests',
        'Post-natal care (up to 60 days)',
        'Newborn baby cover (first 90 days)',
        'Hospitalization for delivery complications',
        'Ambulance charges for delivery emergencies',
        'Doctor consultation during pregnancy',
        'Prescribed medicines during pregnancy',
        'Diagnostic tests during pregnancy',
        'Emergency procedures related to pregnancy',
        'Lactation consultation'
      ],
      two_wheeler: [
        'Accidental damage repair',
        'Third-party injury support',
        'Emergency towing (up to 50 km)',
        'On-road breakdown assistance',
        'Flat tire & battery jump-start',
        'Emergency fuel delivery',
        'Key lockout assistance',
        'Hospital expenses for vehicle accident injuries'
      ],
      car: [
        'Accidental damage repair',
        'Third-party injury support',
        'Emergency towing (up to 50 km)',
        'On-road breakdown assistance',
        'Flat tire & battery jump-start',
        'Emergency fuel delivery',
        'Key lockout assistance',
        'Hospital expenses for vehicle accident injuries'
      ],
      commercial_vehicle: [
        'Accidental damage repair',
        'Third-party injury support',
        'Emergency towing (up to 50 km)',
        'On-road breakdown assistance',
        'Flat tire & battery jump-start',
        'Emergency fuel delivery',
        'Key lockout assistance',
        'Hospital expenses for vehicle accident injuries'
      ],
      home: [
        'Fire & explosion damage assistance',
        'Natural disaster damage (flood, earthquake, storm)',
        'Burglary & theft assistance',
        'Plumbing emergency assistance',
        'Electrical emergency assistance',
        'Lock & key replacement assistance',
        'Structural damage assessment',
        'Water damage restoration',
        'Emergency temporary accommodation',
        'Home security assessment'
      ],
      business: [
        'Fire & explosion damage assistance',
        'Natural disaster damage assistance',
        'Burglary & theft assistance',
        'Electrical & plumbing emergencies',
        'IT infrastructure emergency support',
        'Employee accident assistance',
        'Business premises security assessment',
        'Emergency equipment repair coordination',
        'Data recovery assistance',
        'Legal consultation for emergencies'
      ],
      travel: [
        'Medical emergency during travel',
        'Emergency medical evacuation',
        'Trip cancellation assistance',
        'Lost baggage assistance',
        'Passport & document loss assistance',
        'Emergency cash advance coordination',
        'Hotel extension for medical reasons',
        'Emergency return home assistance',
        'Legal assistance during travel',
        'Travel delay compensation coordination'
      ]
    };

    let pgY = addPageHeader('WHAT IS COVERED');
    addPageFooter(2, totalPages);

    const coverageItems = COVERAGE_ITEMS[category] || COVERAGE_ITEMS.individual;

    doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold')
       .text(`Coverage Details - ${categoryConfig.title}`, 50, pgY);
    pgY += 20;

    doc.fillColor('#555').fontSize(9).font('Helvetica')
       .text('The following assistance and support services are included in your membership plan:', 50, pgY, { width: 495 });
    pgY += 25;

    coverageItems.forEach((item, idx) => {
      doc.rect(50, pgY - 2, 495, 22).fill(idx % 2 === 0 ? '#f0fdf4' : '#ffffff');
      doc.fillColor('#16a34a').fontSize(12).font('Helvetica-Bold')
         .text('\u2713', 60, pgY + 2);
      doc.fillColor('#1e293b').fontSize(10).font('Helvetica')
         .text(item, 80, pgY + 3);
      pgY += 22;
    });

    pgY += 15;
    doc.rect(50, pgY, 495, 50).fillAndStroke('#eff6ff', '#93c5fd');
    doc.fillColor('#1e40af').fontSize(9).font('Helvetica-Bold')
       .text('NOTE:', 60, pgY + 8);
    doc.fillColor('#1e40af').fontSize(8).font('Helvetica')
       .text('All assistance is subject to plan limits, verification, and membership terms. Coverage amounts are as per the selected plan. Waiting periods apply as specified in the Terms & Conditions section.', 
             60, pgY + 22, { width: 475 });

    pgY = addPageHeader('WHAT IS NOT COVERED (EXCLUSIONS)');
    addPageFooter(3, totalPages);

    doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold')
       .text('Category-Specific Exclusions', 50, pgY);
    pgY += 20;

    doc.fillColor('#555').fontSize(9).font('Helvetica')
       .text('The following situations, conditions, and circumstances are NOT covered under this membership plan:', 50, pgY, { width: 495 });
    pgY += 25;

    const allExclusions = [...categoryConfig.exclusions];
    const commonExclusions = [
      'Pre-existing conditions (first 36 months)',
      'Cosmetic & elective procedures',
      'Self-inflicted injuries',
      'Substance/alcohol abuse',
      'War, terrorism, nuclear incidents',
      'Outpatient/OPD treatments',
      'Routine health check-ups'
    ];
    commonExclusions.forEach(exc => {
      if (!allExclusions.some(e => e.toLowerCase().includes(exc.split('(')[0].trim().toLowerCase().substring(0, 10)))) {
        allExclusions.push(exc);
      }
    });

    doc.rect(50, pgY - 5, 495, 22).fill('#fef2f2');
    doc.fillColor('#991b1b').fontSize(10).font('Helvetica-Bold')
       .text('IMPORTANT: Please read all exclusions carefully', 60, pgY);
    pgY += 25;

    allExclusions.forEach((item, idx) => {
      doc.rect(50, pgY - 2, 495, 20).fill(idx % 2 === 0 ? '#fff1f2' : '#ffffff');
      doc.fillColor('#dc2626').fontSize(11).font('Helvetica-Bold')
         .text('\u2717', 60, pgY + 1);
      doc.fillColor('#374151').fontSize(9).font('Helvetica')
         .text(`${idx + 1}. ${item}`, 80, pgY + 3);
      pgY += 20;
    });

    if (['individual', 'family', 'senior'].includes(category)) {
      pgY += 15;
      doc.rect(50, pgY, 495, 22).fill('#7f1d1d');
      doc.fillColor('white').fontSize(10).font('Helvetica-Bold')
         .text('PRE-EXISTING CONDITIONS NOT COVERED (First 36 Months)', 60, pgY + 5);
      pgY += 30;

      const preExConditions = [
        { category: 'Cardiovascular', items: 'Heart disease, Hypertension, Angina, Heart failure, Coronary artery disease' },
        { category: 'Metabolic', items: 'Diabetes (Type 1 & 2), Thyroid disorders, Obesity-related conditions' },
        { category: 'Respiratory', items: 'Asthma, COPD, Chronic bronchitis, Sleep apnea' },
        { category: 'Neurological', items: 'Epilepsy, Stroke history, Parkinson\'s disease, Multiple sclerosis' },
        { category: 'Musculoskeletal', items: 'Arthritis, Chronic back pain, Disc disorders, Joint replacements' },
        { category: 'Renal & Hepatic', items: 'Chronic kidney disease, Liver cirrhosis, Hepatitis B/C' },
        { category: 'Oncology', items: 'Any cancer history, Tumors, Lymphoma, Leukemia' },
        { category: 'Mental Health', items: 'Clinical depression, Anxiety disorders, Bipolar disorder' }
      ];

      preExConditions.forEach((cond, idx) => {
        doc.rect(50, pgY, 495, 28).fill(idx % 2 === 0 ? '#fef2f2' : '#ffffff');
        doc.fillColor('#991b1b').fontSize(8).font('Helvetica-Bold')
           .text(cond.category, 60, pgY + 4);
        doc.fillColor('#555').fontSize(7).font('Helvetica')
           .text(cond.items, 60, pgY + 15, { width: 475 });
        pgY += 28;
      });
    }

    pgY += 15;
    doc.rect(50, pgY, 495, 40).fillAndStroke('#fef3c7', '#f59e0b');
    doc.fillColor('#92400e').fontSize(8).font('Helvetica-Bold')
       .text('DISCLAIMER:', 60, pgY + 5);
    doc.fillColor('#78350f').fontSize(7).font('Helvetica')
       .text('The above exclusion list is indicative and not exhaustive. Raksha Assist reserves the right to deny assistance for any situation not explicitly covered under the membership terms. Please refer to the complete membership agreement for full details.', 
             60, pgY + 16, { width: 475 });

    pgY = addPageHeader('TERMS & CONDITIONS');
    addPageFooter(4, totalPages);

    doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold')
       .text('Membership Terms & Conditions', 50, pgY);
    pgY += 5;
    doc.fillColor('#555').fontSize(8).font('Helvetica')
       .text('Please read these terms carefully. By purchasing a membership, you agree to be bound by these terms.', 50, pgY + 12, { width: 495 });
    pgY += 35;

    const termsAndConditions = [
      {
        title: '1. Membership Activation',
        content: 'Membership becomes active upon successful payment verification. The activation date is the date of payment confirmation. A digital membership ID card will be issued within 24 hours of activation. The membership is valid for the period specified in the plan details.'
      },
      {
        title: '2. Waiting Periods',
        content: 'No waiting period for accidental injuries - assistance available from Day 1. 30-day waiting period for medical emergencies and general illnesses. 24-month waiting period for specific conditions including hernia, cataract, joint replacement, and ENT disorders. 36-month waiting period for pre-existing conditions as declared at the time of enrollment.'
      },
      {
        title: '3. Renewal Policy',
        content: 'Membership must be renewed before the expiry date to maintain continuous coverage. A 15-day grace period is provided after expiry for renewal. No assistance will be provided during the grace period. Failure to renew within the grace period will result in lapse of membership and loss of accumulated benefits.'
      },
      {
        title: '4. Cancellation & Refund',
        content: '15-day free look period from the date of activation. Full refund (minus processing charges) available during the free look period. Pro-rata refund available after 15 days, subject to deduction of assistance already availed. No refund will be provided after availing any assistance under the membership.'
      },
      {
        title: '5. Maximum Assistance Limit',
        content: 'Assistance is limited to the plan\'s maximum support limit per incident and as annual aggregate. Any expenses exceeding the plan limit shall be borne by the member. Co-payment percentage as specified in the plan will be applicable. Sub-limits may apply for specific categories of assistance.'
      },
      {
        title: '6. Documentation Requirements',
        content: 'Valid Membership ID card must be presented at the time of seeking assistance. Aadhaar Card or Government-issued photo ID is mandatory. Hospital admission records, discharge summary, and treatment details are required. Doctor\'s prescription and diagnostic reports must be submitted. FIR copy is mandatory for accident-related claims. Original bills and receipts are required for reimbursement.'
      },
      {
        title: '7. False Information & Fraud',
        content: 'Providing false or misleading information at the time of enrollment or while seeking assistance will result in immediate cancellation of membership without any refund. Raksha Assist reserves the right to take legal action in cases of fraud or misrepresentation.'
      },
      {
        title: '8. Non-Transferable',
        content: 'Membership is non-transferable and cannot be assigned to another person. The benefits of the membership can only be availed by the enrolled member(s) as specified in the plan. Any attempt to transfer or misuse the membership will result in cancellation.'
      },
      {
        title: '9. Governing Law & Jurisdiction',
        content: 'This membership agreement shall be governed by and construed in accordance with the Indian Contract Act, 1872 and other applicable Indian laws. Any disputes arising out of or in connection with this membership shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka, India.'
      }
    ];

    termsAndConditions.forEach((term, idx) => {
      if (pgY > 700) {
        addPageFooter(4, totalPages);
        doc.addPage();
        doc.rect(0, 0, 595.28, 30).fill(primaryColor);
        doc.fillColor('white').fontSize(9).font('Helvetica-Bold')
           .text('RAKSHA ASSIST - Terms & Conditions (continued)', 50, 10);
        pgY = 50;
      }
      doc.rect(50, pgY - 3, 495, 3).fill(secondaryColor);
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold')
         .text(term.title, 50, pgY + 5);
      pgY += 18;
      doc.fillColor('#374151').fontSize(8).font('Helvetica')
         .text(term.content, 60, pgY, { width: 475 });
      pgY += doc.heightOfString(term.content, { width: 475 }) + 15;
    });

    pgY = addPageHeader('CLAIMS / ASSISTANCE PROCESS');
    addPageFooter(5, totalPages);

    doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold')
       .text('How to Get Assistance', 50, pgY);
    pgY += 5;
    doc.fillColor('#555').fontSize(9).font('Helvetica')
       .text('Follow the steps below to avail emergency assistance under your Raksha Assist membership:', 50, pgY + 12, { width: 495 });
    pgY += 35;

    doc.rect(50, pgY, 495, 25).fill('#059669');
    doc.fillColor('white').fontSize(11).font('Helvetica-Bold')
       .text('EMERGENCY ASSISTANCE (24/7)', 60, pgY + 6);
    pgY += 35;

    const emergencySteps = [
      { step: '1', title: 'Call Emergency Helpline', desc: '+91 81437 52025 (Available 24 hours, 7 days a week, 365 days)' },
      { step: '2', title: 'Provide Membership Details', desc: 'Share your Membership ID number and describe the emergency situation' },
      { step: '3', title: 'Team Coordination', desc: 'Our assistance team coordinates with the nearest network hospital/service provider' },
      { step: '4', title: 'Direct Settlement', desc: 'Raksha Assist arranges direct payment to the hospital/provider within 24-48 hours' },
      { step: '5', title: 'Hassle-Free Process', desc: 'No claim forms or paperwork required from the member for cashless assistance' }
    ];

    emergencySteps.forEach((step) => {
      doc.circle(65, pgY + 8, 10).fill(secondaryColor);
      doc.fillColor('white').fontSize(10).font('Helvetica-Bold')
         .text(step.step, 60, pgY + 3);
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold')
         .text(step.title, 85, pgY);
      doc.fillColor('#555').fontSize(8).font('Helvetica')
         .text(step.desc, 85, pgY + 14, { width: 450 });
      pgY += 35;
    });

    pgY += 10;
    doc.rect(50, pgY, 495, 25).fill('#2563eb');
    doc.fillColor('white').fontSize(11).font('Helvetica-Bold')
       .text('PLANNED HOSPITALIZATION', 60, pgY + 6);
    pgY += 35;

    const plannedSteps = [
      { step: '1', title: 'Inform in Advance', desc: 'Notify Raksha Assist at least 48 hours before planned hospital admission' },
      { step: '2', title: 'Get Pre-Authorization', desc: 'Obtain pre-authorization approval from Raksha Assist before admission' },
      { step: '3', title: 'Share Details', desc: 'Provide hospital name, doctor details, expected treatment, and estimated costs' }
    ];

    plannedSteps.forEach((step) => {
      doc.circle(65, pgY + 8, 10).fill(secondaryColor);
      doc.fillColor('white').fontSize(10).font('Helvetica-Bold')
         .text(step.step, 60, pgY + 3);
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold')
         .text(step.title, 85, pgY);
      doc.fillColor('#555').fontSize(8).font('Helvetica')
         .text(step.desc, 85, pgY + 14, { width: 450 });
      pgY += 35;
    });

    pgY += 10;
    doc.rect(50, pgY, 495, 25).fill('#7c3aed');
    doc.fillColor('white').fontSize(11).font('Helvetica-Bold')
       .text('REQUIRED DOCUMENTS', 60, pgY + 6);
    pgY += 35;

    const requiredDocs = [
      'Valid Membership ID card',
      'Aadhaar Card / Government ID',
      'Hospital admission & discharge summary',
      'Doctor\'s prescription & treatment records',
      'FIR copy (for accident cases)',
      'Bills and receipts'
    ];

    requiredDocs.forEach((docItem, idx) => {
      doc.rect(50, pgY - 2, 495, 20).fill(idx % 2 === 0 ? '#f5f3ff' : '#ffffff');
      doc.fillColor('#7c3aed').fontSize(10).font('Helvetica-Bold')
         .text('\u25C6', 60, pgY + 1);
      doc.fillColor('#1e293b').fontSize(9).font('Helvetica')
         .text(docItem, 80, pgY + 2);
      pgY += 20;
    });

    pgY += 20;
    doc.rect(50, pgY, 495, 60).fillAndStroke('#fef3c7', '#f59e0b');
    doc.fillColor('#92400e').fontSize(9).font('Helvetica-Bold')
       .text('FINAL DISCLAIMER', 60, pgY + 8);
    doc.fillColor('#78350f').fontSize(8).font('Helvetica')
       .text('This document is for informational purposes. Raksha Assist is a membership-based assistance program, NOT insurance. All assistance is discretionary and subject to membership terms. The benefits, limits, and exclusions mentioned in this document are subject to the complete membership agreement. Raksha Assist reserves the right to modify terms with prior notice to members.', 
             60, pgY + 22, { width: 475 });

    doc.end();
  });
}

export async function generateMembershipBrochure(membershipId: string): Promise<Buffer> {
  const membership = await storage.getMembershipById(membershipId);
  if (!membership) {
    throw new Error('Membership not found');
  }

  const user = await storage.getUserById(membership.userId);
  
  return generatePlanBrochure({
    planCode: membership.planType.toUpperCase(),
    includeConditions: true,
    memberName: user?.name || 'Member',
    membershipNumber: membership.membershipNumber,
    membershipDetails: {
      vehicleNumber: (membership as any).vehicleNumber,
      vehicleMake: (membership as any).vehicleMake,
      vehicleModel: (membership as any).vehicleModel,
      propertyAddress: (membership as any).propertyAddress,
      businessName: (membership as any).businessName,
      startDate: membership.startDate,
      expiryDate: membership.expiryDate || undefined
    }
  });
}

export async function generateAllPlansBrochure(): Promise<Buffer> {
  const plans = await storage.getPlans();
  
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const primaryColor = '#0B1F3A';
    const secondaryColor = '#179299';
    const accentColor = '#F6A60B';

    doc.rect(0, 0, 595.28, 841.89).fill(primaryColor);
    
    const coverLogo = getBrochureLogoPath();
    if (coverLogo) {
      doc.image(coverLogo, 220, 150, { width: 150 });
    }

    doc.fillColor('white').fontSize(36).font('Helvetica-Bold')
       .text('RAKSHA ASSIST', 50, 320, { align: 'center', width: 495 });
    
    doc.fillColor(accentColor).fontSize(18).font('Helvetica')
       .text('Complete Membership Plans Guide', 50, 370, { align: 'center', width: 495 });

    doc.fillColor('#a0d2db').fontSize(12)
       .text('Emergency Assistance Programs', 50, 410, { align: 'center', width: 495 });

    doc.fillColor('white').fontSize(10)
       .text('24/7 Helpline: +91 81437 52025', 50, 500, { align: 'center', width: 495 });

    const categories = ['individual', 'family', 'senior', 'maternity', 'two_wheeler', 'car', 'commercial_vehicle', 'home', 'business', 'travel'];
    const categoryNames: Record<string, string> = {
      individual: 'Medical',
      family: 'Family',
      senior: 'Senior Citizen',
      maternity: 'Maternity',
      two_wheeler: 'Two Wheeler',
      car: 'Car',
      commercial_vehicle: 'Commercial Vehicle',
      home: 'Home',
      business: 'Business',
      travel: 'Travel'
    };

    const plansByCategory = plans.reduce((acc: Record<string, any[]>, plan: any) => {
      const cat = plan.planCategory || 'individual';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(plan);
      return acc;
    }, {});

    categories.forEach(category => {
      const categoryPlans = plansByCategory[category] || [];
      if (categoryPlans.length === 0) return;

      const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.individual;

      doc.addPage();
      
      doc.rect(0, 0, 595.28, 80).fill(primaryColor);
      const categoryLogo = getBrochureLogoPath();
      if (categoryLogo) {
        doc.image(categoryLogo, 40, 15, { width: 50 });
      }
      doc.fillColor('white').fontSize(20).font('Helvetica-Bold')
         .text('RAKSHA ASSIST', 100, 30);
      doc.fontSize(9).font('Helvetica')
         .text(config.title, 100, 55);

      doc.rect(40, 100, 515, 35).fill(config.color);
      doc.fillColor('white').fontSize(16).font('Helvetica-Bold')
         .text(`${config.icon} ${categoryNames[category].toUpperCase()} PLANS`, 50, 110, { align: 'center', width: 495 });

      let y = 155;

      categoryPlans.sort((a, b) => a.price - b.price).forEach((plan) => {
        doc.rect(45, y, 505, 80).fillAndStroke('#f8fafc', '#e2e8f0');
        
        doc.fillColor(config.color).fontSize(14).font('Helvetica-Bold')
           .text(plan.name, 55, y + 10);
        
        doc.fillColor('#666').fontSize(9).font('Helvetica')
           .text(plan.shortDescription || plan.description || '', 55, y + 28, { width: 350 });

        doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold')
           .text(`₹${plan.price}/yr`, 420, y + 10);
        
        const coverText = plan.coverageAmount >= 100000 
          ? `₹${(plan.coverageAmount / 100000).toFixed(1)}L Support` 
          : `₹${(plan.coverageAmount / 1000).toFixed(0)}K Support`;
        doc.fillColor('#059669').fontSize(9).font('Helvetica')
           .text(coverText, 420, y + 28);

        doc.fillColor('#888').fontSize(8)
           .text(`${plan.maxMembers || 1} ${['two_wheeler', 'car', 'commercial_vehicle'].includes(category) ? 'Vehicle' : (category === 'home' || category === 'business' ? 'Property' : 'Members')}`, 420, y + 42);

        let features: string[] = [];
        try { features = plan.features ? JSON.parse(plan.features) : []; } catch (e) { features = []; }
        
        doc.fillColor('#444').fontSize(7).font('Helvetica')
           .text(features.slice(0, 3).join(' | '), 55, y + 60, { width: 480 });

        y += 90;
        if (y > 720) {
          doc.addPage();
          y = 60;
        }
      });
    });

    doc.end();
  });
}
