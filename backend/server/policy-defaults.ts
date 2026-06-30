export function getDefaultPolicyContent(type: string): { title: string; content: string; version: string } | null {
  const policies: Record<string, { title: string; content: string; version: string }> = {
    terms_conditions: {
      title: "Terms & Conditions",
      version: "2.0",
      content: `# TERMS & CONDITIONS

**Raksha Assist — Emergency Medical Assistance Program**
Operated by Mindwhile IT Solutions Pvt. Ltd.
CIN: U72900TG2024PTC184818 | GSTIN: 36AAKCM2849P1Z3
Effective Date: February 2026 | Version 2.0

---

## IMPORTANT NOTICE

**RAKSHA ASSIST IS A MEMBERSHIP-BASED EMERGENCY ASSISTANCE COORDINATION PLATFORM. IT IS NOT AN INSURANCE PRODUCT, NOT A THIRD-PARTY ADMINISTRATOR (TPA), AND NOT A FINANCIAL GUARANTEE PROVIDER.** All assistance is discretionary, best-effort, and subject to verification, fund availability, and the terms contained herein. This program is governed exclusively under the Indian Contract Act, 1872.

---

## 1. DEFINITIONS & INTERPRETATION

- **"Company"** refers to Mindwhile IT Solutions Pvt. Ltd., operating the brand "Raksha Assist"
- **"Member"** refers to any individual who has purchased an active Raksha Assist membership plan
- **"Beneficiary"** refers to the Member and any covered family members listed under a family/group plan
- **"Membership Period"** refers to the duration from the start date to the expiry date of an active membership
- **"Assistance Limit"** refers to the maximum financial support amount as per the selected plan
- **"Network Hospital"** refers to any hospital empanelled with Raksha Assist for direct payment facility
- **"Emergency"** refers to any sudden, unforeseen medical condition or accidental injury requiring immediate hospitalization
- **"Waiting Period"** refers to the initial period after membership activation during which certain benefits are not available
- **"SOS Case"** refers to an emergency request submitted by a member through the platform
- **"Agent"** refers to an authorized representative who enrolls members on behalf of Raksha Assist
- **"Franchise Partner"** refers to an authorized business entity operating under Raksha Assist's franchise model

## 2. ELIGIBILITY CRITERIA

### 2.1 Individual Membership
- Indian residents aged 18 to 70 years
- Valid government-issued photo ID (Aadhaar, PAN, Voter ID, Passport)
- Active Indian mobile number for OTP verification
- No fraudulent history with Raksha Assist or its affiliates

### 2.2 Family Membership
- Primary member must meet individual eligibility criteria
- Spouse, children (up to 25 years), and dependent parents (up to 75 years) may be added
- Maximum 8 family members per family plan (including primary member)
- Each family member's details must be submitted at time of enrollment or within 30 days

### 2.3 Senior Citizen Plans
- Available for individuals aged 60 to 75 years
- May require additional health declaration
- Pre-existing condition coverage subject to extended waiting periods

### 2.4 Maternity Plans
- Available for female members aged 18 to 45 years
- Mandatory 9-month waiting period for maternity benefits
- Only applicable for first two live births during membership period
- Complications arising from pregnancy covered under emergency provisions

## 3. MEMBERSHIP ACTIVATION & DURATION

- Membership activates upon successful payment confirmation and KYC verification
- Annual plans are valid for 365 days from activation date
- Monthly plans are valid for 30 days from each payment date
- A unique Membership Number and Digital Membership Card will be issued upon activation
- Members can download their Membership Certificate from their dashboard at any time
- Membership is non-transferable to another person

## 4. WHAT IS COVERED (BENEFITS)

### 4.1 Accident Coverage (Day 1)
- Road traffic accidents
- Workplace injuries and industrial accidents
- Fall injuries and fractures
- Burns and fire-related injuries
- Assault/attack injuries (with FIR)
- Sports injuries requiring hospitalization
- Animal bites and attacks
- Drowning and near-drowning incidents

### 4.2 Medical Emergency Coverage (After Waiting Period)
- Heart attacks, cardiac arrests, and strokes
- Acute organ failure (kidney, liver, lung)
- Severe infections requiring ICU admission
- Appendicitis and emergency surgeries
- Poisoning (accidental)
- Severe allergic reactions (anaphylaxis)
- Seizures and epileptic emergencies

### 4.3 Hospitalization Benefits
- Hospital room and boarding charges (up to plan limit)
- ICU/ICCU charges
- Operation theatre and surgical charges
- Anaesthesia charges
- Cost of medicines, drugs, and consumables during hospitalization
- Diagnostic tests and pathology during hospitalization
- Doctor/surgeon/specialist consultation fees
- Ambulance charges (up to ₹3,000 per incident)

### 4.4 Pre & Post Hospitalization
- Pre-hospitalization expenses: Up to 30 days before admission
- Post-hospitalization expenses: Up to 60 days after discharge
- Follow-up consultations and prescribed medications

## 5. WHAT IS NOT COVERED (EXCLUSIONS)

### 5.1 General Exclusions
- Pre-existing diseases, illnesses, or conditions (unless covered after waiting period)
- Any treatment not requiring hospitalization (OPD/outpatient)
- Cosmetic, aesthetic, or plastic surgery
- Dental treatment (unless caused by accident)
- Vision correction, spectacles, contact lenses
- Hearing aids and cochlear implants
- Infertility treatment, IVF, surrogacy
- Weight management, obesity surgery
- Hair transplant or hair treatment
- Routine health check-ups and preventive care

### 5.2 Specific Exclusions
- Self-inflicted injuries or suicide attempts
- Injuries under influence of alcohol or drugs
- Injuries from participation in illegal activities
- War, terrorism, nuclear contamination
- Injuries during adventure sports without proper safety measures
- Treatment outside India
- Experimental or unproven medical treatments
- Alternative medicine (Ayurveda, Homeopathy, Unani) unless at network hospital
- Sexually transmitted diseases (unless contracted through blood transfusion)
- Congenital conditions or birth defects

### 5.3 Other Exclusions
- Expenses exceeding the plan assistance limit
- Treatment at non-network hospitals without prior approval
- Requests submitted after 48 hours of emergency without valid reason
- Misrepresentation or fraud in any form
- Condition arising from non-compliance with prescribed treatment

## 6. WAITING PERIODS

| Condition Type | Waiting Period |
|---|---|
| Accidents & Injuries | No waiting period (Day 1 coverage) |
| Medical Emergencies (general) | 30 days from activation |
| Specific Conditions (hernia, piles, fistula, sinusitis, tonsillitis, gallstones, kidney stones) | 24 months from activation |
| Pre-existing Conditions (diabetes, hypertension, thyroid, asthma) | 36 months from activation |
| Maternity Benefits | 9 months from activation |
| Joint Replacement | 24 months from activation |

**Note:** Waiting periods are calculated from the date of first activation. Renewal without break continues the waiting period credit.

## 7. ASSISTANCE PROCESS (HOW TO USE)

### Step 1: Emergency Occurs
- Call our 24/7 Helpline: **+91 81437 52025**
- Or press the SOS button in the Raksha Assist app/website
- Provide: Member ID, nature of emergency, hospital name, location

### Step 2: Verification
- Our team verifies membership status, plan coverage, and waiting period eligibility
- Hospital admission verification through network hospital or document submission
- KYC cross-verification of member identity

### Step 3: Hospital Coordination
- We contact the hospital directly for treatment details and cost estimate
- For network hospitals: Direct cashless coordination initiated
- For non-network hospitals: Reimbursement process initiated (pre-approval required)

### Step 4: Financial Assistance
- Direct payment to hospital within 24-48 hours of approval
- Payment is made up to the plan assistance limit
- Member is responsible for any amount exceeding the plan limit
- Co-payment applicable as per plan terms (if any)

### Step 5: Case Closure
- Final bill settlement and case documentation
- Member receives case summary via email/SMS
- Feedback collection for service improvement

## 8. PAYMENT TERMS

- All membership fees are payable in advance via authorized payment channels (Razorpay)
- GST at 18% is included in the displayed plan price
- Payment confirmation is instant via email and SMS
- Failed payments do not activate membership
- Members can view payment history and download receipts from their dashboard

## 9. RENEWAL POLICY

- Members will receive renewal reminders 30, 15, and 7 days before expiry via email/SMS
- A grace period of **15 days** is provided after expiry for renewal without loss of waiting period credit
- Renewal after the grace period is treated as a new membership (waiting periods restart)
- Auto-renewal is not enabled; members must manually renew
- Renewal price may differ from the original purchase price based on current plan rates

## 10. REFUND & CANCELLATION POLICY

### 10.1 Free Look Period
- New members have a **15-day free look period** from the date of activation
- Full refund (minus ₹500 processing fee) if cancelled within the free look period
- No refund if an SOS case has been filed during the free look period

### 10.2 Cancellation After Free Look Period
- Pro-rata refund based on unused membership period
- Processing fee of ₹500 will be deducted
- No refund if an SOS case has been filed and assistance provided
- Refund processed within 7-14 business days to original payment method

### 10.3 Company-Initiated Cancellation
- Raksha Assist reserves the right to cancel membership for:
  - Fraud, misrepresentation, or false declarations
  - Abusive behavior toward staff or hospital personnel
  - Violation of these Terms & Conditions
  - Non-payment of dues
- In case of company-initiated cancellation, pro-rata refund (minus deductions) will be processed

## 11. MEMBER OBLIGATIONS

- Provide accurate, truthful information during enrollment and SOS cases
- Notify Raksha Assist of any change in personal details within 15 days
- Cooperate fully during verification and documentation processes
- Not misuse or attempt to fraud the assistance system
- Present valid membership proof at the time of availing assistance
- Inform Raksha Assist within 24 hours of emergency hospitalization
- Follow prescribed treatment plans from attending physicians

## 12. LIMITATION OF LIABILITY

- Raksha Assist's total liability is limited to the plan assistance limit
- We do not guarantee availability of beds, doctors, or specific treatments at hospitals
- We are not liable for treatment outcomes, medical negligence, or hospital service quality
- We are not responsible for delays caused by force majeure events (natural disasters, pandemics, government orders)
- Hospital-direct payments are made in good faith based on available information
- We reserve the right to recover any excess payment made due to incorrect information

## 13. DATA PROTECTION & PRIVACY

- Member data is collected, stored, and processed in accordance with the Information Technology Act, 2000 and applicable Indian data protection laws
- Personal and medical data is encrypted using AES-256 encryption
- Data is shared only with network hospitals, payment processors, and as required by law
- Members have the right to access, correct, or request deletion of their personal data
- Detailed privacy practices are outlined in our separate Privacy Policy

## 14. INTELLECTUAL PROPERTY

- "Raksha Assist", its logo, branding, and all platform content are the intellectual property of Mindwhile IT Solutions Pvt. Ltd.
- Members may not use, reproduce, or distribute any Raksha Assist branding or content without prior written consent
- The Raksha Assist mobile app and website are proprietary software

## 15. DISPUTE RESOLUTION

### 15.1 Grievance Redressal
- Members may raise grievances through:
  - Email: support@rakshaassist.com
  - Phone: +91 81437 52025
  - Written letter to the registered office
- Grievances will be acknowledged within 48 hours
- Resolution within 15 working days of acknowledgment

### 15.2 Arbitration
- Any dispute not resolved through grievance redressal shall be referred to arbitration
- Arbitration shall be conducted under the Arbitration and Conciliation Act, 1996
- A sole arbitrator shall be appointed by mutual consent
- Seat of arbitration: Bengaluru, Karnataka
- Language of arbitration: English

### 15.3 Jurisdiction
- All matters are subject to the **exclusive jurisdiction of the courts of Bengaluru, Karnataka, India**
- This agreement is governed by the laws of India

## 16. MODIFICATIONS TO TERMS

- Raksha Assist reserves the right to modify these Terms & Conditions at any time
- Members will be notified of material changes via email and/or SMS at least 30 days in advance
- Continued use of the service after notification constitutes acceptance of modified terms
- The latest version of these Terms & Conditions is always available on our website

## 17. FORCE MAJEURE

Raksha Assist shall not be liable for any failure or delay in performance due to causes beyond its reasonable control, including but not limited to natural disasters, epidemics, pandemics, government actions, war, civil unrest, strikes, internet/telecommunications failures, or any other force majeure event.

## 18. SEVERABILITY

If any provision of these Terms & Conditions is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.

## 19. ENTIRE AGREEMENT

These Terms & Conditions, together with the Privacy Policy, Membership Agreement, and any plan-specific terms, constitute the entire agreement between the Member and Raksha Assist regarding the membership program.

## 20. CONTACT INFORMATION

**Mindwhile IT Solutions Pvt. Ltd.**
CIN: U72900TG2024PTC184818
GSTIN: 36AAKCM2849P1Z3
2nd & 3rd Floor, 3rd Block, 12th Main, Bashyam Circle, Rajajinagar, Bengaluru - 560 010, India

- **24/7 Emergency Helpline:** +91 81437 52025
- **Sales:** sales@rakshaassist.com
- **Support:** support@rakshaassist.com
- **Website:** www.rakshaassist.com

---

*This document is a computer-generated legal document and is valid without physical signature. Last updated: February 2026.*`
    },

    agent_terms: {
      title: "Agent Agreement — Terms & Conditions",
      version: "2.0",
      content: `# AGENT AGREEMENT — TERMS & CONDITIONS

**Raksha Assist — Emergency Medical Assistance Program**
Operated by Mindwhile IT Solutions Pvt. Ltd.
CIN: U72900TG2024PTC184818 | GSTIN: 36AAKCM2849P1Z3
Effective Date: February 2026 | Version 2.0

---

## IMPORTANT NOTICE

This Agent Agreement ("Agreement") is a legally binding contract between the Agent ("You/Agent") and Mindwhile IT Solutions Pvt. Ltd. ("Company/Raksha Assist"). By registering as a Raksha Assist Agent, you agree to all terms herein. Raksha Assist is a membership-based assistance program and is NOT insurance, NOT a TPA, and NOT a financial guarantee provider.

---

## 1. DEFINITIONS

- **"Agent"** — An individual authorized by Raksha Assist to enroll members and promote the membership program
- **"Commission"** — The percentage-based compensation paid to Agents for successful member enrollments
- **"Enrollment"** — A completed membership purchase attributed to the Agent's referral
- **"Portal"** — The Agent Dashboard on the Raksha Assist platform for tracking enrollments, commissions, and performance
- **"Territory"** — The geographic area assigned to the Agent for operation (if applicable)
- **"Active Membership"** — A membership that is currently valid and not expired, cancelled, or refunded

## 2. AGENT REGISTRATION & ELIGIBILITY

### 2.1 Eligibility Requirements
- Indian resident, minimum 18 years of age
- Valid government-issued photo ID (Aadhaar Card mandatory)
- Valid PAN Card (mandatory for commission payouts and TDS compliance)
- Active Indian bank account in the Agent's name
- Active Indian mobile number
- No criminal record or pending litigation related to fraud, misrepresentation, or financial crimes

### 2.2 Registration Process
- Submit Agent registration form with all required documents
- Complete KYC (Know Your Customer) verification
- Attend mandatory onboarding training (online or in-person)
- Pass the Agent Certification Assessment (minimum 70% score)
- Receive Agent ID and dashboard access upon approval

### 2.3 Approval & Rejection
- Raksha Assist reserves the right to approve or reject any Agent application without providing reasons
- Approval does not create an employer-employee relationship; Agents are independent contractors
- Agent status can be revoked at any time for non-compliance with these terms

## 3. COMMISSION STRUCTURE

### 3.1 Commission Rates

| Plan Category | Commission Rate | Bonus (10+ enrollments/month) |
|---|---|---|
| Individual Plans | 15% of membership fee | Additional 2% |
| Family Plans | 12% of membership fee | Additional 2% |
| Senior Citizen Plans | 12% of membership fee | Additional 2% |
| Maternity Plans | 10% of membership fee | Additional 2% |
| Vehicle Plans | 15% of membership fee | Additional 2% |
| Property Plans | 10% of membership fee | Additional 2% |
| Business/Corporate Plans | 8% of membership fee | Additional 3% |

### 3.2 Commission Calculation
- Commission is calculated on the net membership fee (excluding GST)
- Commission is earned only when payment is successfully received and verified
- No commission on refunded memberships (commission will be reversed)
- Renewal commissions: 50% of the original commission rate for member renewals

### 3.3 Payout Schedule
- Commission payouts are processed **monthly by the 10th** of the following month
- Minimum payout threshold: **₹500** (amounts below threshold carry forward to next month)
- Payment via direct bank transfer (NEFT/IMPS) to registered bank account
- Payout statement available on the Agent Dashboard

### 3.4 Tax Deductions
- TDS (Tax Deducted at Source) at **5%** as per Section 194H of the Income Tax Act, 1961
- TDS certificate (Form 16A) issued quarterly
- Agent is responsible for filing income tax returns and reporting commission income
- GST registration required if annual commission exceeds ₹20 lakhs

## 4. AGENT OBLIGATIONS & CODE OF CONDUCT

### 4.1 Mandatory Obligations
- Always carry and display valid Agent ID during field activities
- Accurately represent Raksha Assist's services, benefits, and limitations
- Ensure all member enrollments are voluntary and informed
- Collect complete and accurate member information
- Assist members with the enrollment process and answer queries
- Report any suspicious or fraudulent activities immediately
- Attend periodic training and knowledge update sessions
- Maintain minimum enrollment targets as communicated by the Company

### 4.2 Prohibited Activities (Strict Compliance Required)
- **NEVER use the words "insurance", "policy", "premium", "claim" or any insurance terminology** when describing Raksha Assist
- **NEVER guarantee** specific outcomes, hospital admissions, or treatment quality
- **NEVER collect cash** directly from members (all payments must go through the online payment system)
- **NEVER make false promises** about coverage, benefits, or assistance amounts
- **NEVER enroll** members who are clearly ineligible
- **NEVER forge** documents, signatures, or member information
- **NEVER share** your Agent credentials with anyone
- **NEVER engage** in any activity that damages Raksha Assist's reputation
- **NEVER solicit** members from competing organizations using unethical practices
- **NEVER provide** medical advice to members

### 4.3 Correct Language Guidelines

| WRONG (Never Say) | RIGHT (Always Say) |
|---|---|
| Insurance policy | Membership plan |
| Premium | Membership fee |
| Claim | Assistance request / SOS case |
| Coverage amount | Assistance limit / Support limit |
| Policy document | Membership certificate |
| Insured | Member / Beneficiary |
| Sum assured | Maximum assistance amount |
| Policyholder | Membership holder |

## 5. PERFORMANCE REQUIREMENTS

### 5.1 Minimum Targets
- Minimum **5 enrollments per month** to maintain active Agent status
- Agents failing to meet minimum targets for 3 consecutive months may be placed on review
- Consistent non-performance may result in suspension or termination

### 5.2 Performance Tiers

| Tier | Monthly Enrollments | Benefits |
|---|---|---|
| Bronze | 5-10 | Standard commission rates |
| Silver | 11-25 | +2% bonus commission |
| Gold | 26-50 | +4% bonus + priority support |
| Platinum | 50+ | +5% bonus + quarterly incentives + recognition |

### 5.3 Incentive Programs
- Quarterly performance bonuses for top-performing Agents
- Annual Agent Recognition Awards
- All-expense-paid training conferences for Platinum-tier Agents
- Special incentives during promotional campaigns

## 6. TRAINING & CERTIFICATION

- Mandatory initial onboarding training (8 hours online or in-person)
- Quarterly refresher training sessions (2 hours each)
- Annual recertification assessment required
- Training materials provided free of charge on the Agent Portal
- Agents must maintain up-to-date knowledge of all plans, benefits, and processes

## 7. TERRITORY & OPERATIONS

- Agents may operate in any geographic area unless a specific territory is assigned
- Territory exclusivity is not guaranteed unless explicitly provided in writing
- Agents must not interfere with enrollments in another Agent's assigned territory
- Cross-territory enrollments require prior approval from the Company

## 8. INTELLECTUAL PROPERTY & BRANDING

- Agent is granted a limited, non-exclusive, revocable license to use Raksha Assist branding for enrollment activities
- All marketing materials must be pre-approved by Raksha Assist
- Agent must not create independent marketing materials without approval
- All branding rights remain exclusively with Mindwhile IT Solutions Pvt. Ltd.
- Upon termination, Agent must cease all use of Raksha Assist branding immediately

## 9. CONFIDENTIALITY

- Agent must maintain strict confidentiality of:
  - Member personal and medical information
  - Commission structures and internal business information
  - Company strategies, processes, and proprietary systems
  - Agent portal credentials and access codes
- Confidentiality obligations survive termination of this Agreement
- Breach of confidentiality may result in legal action and financial penalties

## 10. TERMINATION

### 10.1 Agent-Initiated Termination
- Agent may resign by providing 30 days' written notice
- All pending commissions will be settled within 30 days of termination
- Agent must return all company-provided materials and cease branding use

### 10.2 Company-Initiated Termination
Raksha Assist may terminate this Agreement immediately for:
- Violation of any term in this Agreement
- Fraud, misrepresentation, or dishonest conduct
- Use of prohibited language (insurance terminology)
- Criminal conviction or pending investigation
- Failure to meet minimum targets for 3+ consecutive months
- Damage to Raksha Assist's reputation or brand
- Breach of confidentiality

### 10.3 Consequences of Termination
- All unpaid commissions earned before termination will be settled
- Commissions for memberships enrolled in the last 30 days may be held for verification
- Agent's dashboard access will be revoked
- No severance, compensation, or goodwill payment upon termination

## 11. INDEMNIFICATION

The Agent shall indemnify and hold harmless Raksha Assist, its officers, directors, and employees from and against any claims, damages, losses, costs, or liabilities arising from:
- Agent's misrepresentation to members
- Agent's violation of applicable laws
- Agent's breach of this Agreement
- Any unauthorized act or omission by the Agent

## 12. DISPUTE RESOLUTION

- All disputes shall first be attempted to be resolved through internal mediation
- If unresolved, disputes shall be referred to arbitration under the Arbitration and Conciliation Act, 1996
- Sole arbitrator appointed by mutual consent
- Seat of arbitration: Bengaluru, Karnataka
- Exclusive jurisdiction: Courts of Bengaluru, Karnataka, India

## 13. RELATIONSHIP CLARIFICATION

- This Agreement creates an **independent contractor** relationship, NOT an employer-employee relationship
- Agent is NOT entitled to employee benefits (PF, ESI, gratuity, leave, etc.)
- Agent is responsible for their own taxes, insurance, and statutory compliance
- Agent acts on their own behalf and not as an employee, partner, or joint venturer of Raksha Assist

## 14. GOVERNING LAW

This Agreement is governed by and construed in accordance with the laws of India, specifically:
- Indian Contract Act, 1872
- Information Technology Act, 2000
- Income Tax Act, 1961 (for TDS provisions)
- Arbitration and Conciliation Act, 1996
- Consumer Protection Act, 2019

## 15. CONTACT INFORMATION

**Mindwhile IT Solutions Pvt. Ltd.**
CIN: U72900TG2024PTC184818
2nd & 3rd Floor, 3rd Block, 12th Main, Bashyam Circle, Rajajinagar, Bengaluru - 560 010, India

- **Agent Support:** +91 81437 52025
- **Email:** sales@rakshaassist.com
- **Support:** support@rakshaassist.com
- **Website:** www.rakshaassist.com

---

*By registering as an Agent, you acknowledge that you have read, understood, and agree to be bound by all terms in this Agreement. This is a computer-generated document valid without physical signature. Last updated: February 2026.*`
    },

    franchise_terms: {
      title: "Franchise Agreement — Terms & Conditions",
      version: "2.0",
      content: `# FRANCHISE PARTNERSHIP AGREEMENT — TERMS & CONDITIONS

**Raksha Assist — Emergency Medical Assistance Program**
Operated by Mindwhile IT Solutions Pvt. Ltd.
CIN: U72900TG2024PTC184818 | GSTIN: 36AAKCM2849P1Z3
Effective Date: February 2026 | Version 2.0

---

## IMPORTANT LEGAL NOTICE

This Franchise Partnership Agreement ("Agreement") is a legally binding contract between the Franchise Partner ("Franchisee/Partner") and Mindwhile IT Solutions Pvt. Ltd. ("Franchisor/Company/Raksha Assist"). This Agreement is governed by the Indian Contract Act, 1872. Raksha Assist is a membership-based assistance coordination platform and is NOT an insurance company, TPA, or financial guarantee provider.

---

## 1. DEFINITIONS

- **"Franchisor"** — Mindwhile IT Solutions Pvt. Ltd., the owner and operator of Raksha Assist
- **"Franchisee/Partner"** — The individual or business entity granted franchise rights under this Agreement
- **"Franchise Fee"** — The one-time, non-refundable fee paid by the Franchisee to acquire franchise rights
- **"Territory"** — The exclusive geographic area assigned to the Franchisee for operations
- **"Commission"** — The percentage-based compensation paid on membership enrollments within the Territory
- **"Agent Network"** — The team of authorized Agents operating under the Franchisee's supervision
- **"Dashboard"** — The Franchise Admin Dashboard for managing operations, agents, and performance
- **"Performance Target"** — The minimum enrollment and revenue targets set for each franchise level

## 2. FRANCHISE LEVELS & INVESTMENT

### 2.1 Zone Franchise (Multi-State Operations)

| Parameter | Details |
|---|---|
| Territory | Multiple States (as assigned) |
| Franchise Fee | ₹10,00,000 - ₹25,00,000 (based on zone) |
| Commission Rate | 3% on all enrollments within the zone |
| Override Commission | 1% on all sub-franchise enrollments |
| Minimum Targets | 500 enrollments/month across the zone |
| Agent Network Capacity | Unlimited |
| Sub-Franchise Rights | Can appoint State, District, and City franchises |
| Support Level | Dedicated Account Manager + Priority Support |
| Agreement Duration | 5 years (renewable) |
| Security Deposit | ₹5,00,000 (refundable on termination) |

### 2.2 State Franchise

| Parameter | Details |
|---|---|
| Territory | Entire State (as assigned) |
| Franchise Fee | ₹5,00,000 - ₹10,00,000 (based on state) |
| Commission Rate | 4% on all enrollments within the state |
| Override Commission | 1% on District and City franchise enrollments |
| Minimum Targets | 200 enrollments/month |
| Agent Network Capacity | Up to 500 Agents |
| Sub-Franchise Rights | Can recommend District and City franchises |
| Support Level | Dedicated Support Executive |
| Agreement Duration | 5 years (renewable) |
| Security Deposit | ₹2,50,000 (refundable on termination) |

### 2.3 District Franchise

| Parameter | Details |
|---|---|
| Territory | Full District (as assigned) |
| Franchise Fee | ₹2,50,000 - ₹5,00,000 (based on district) |
| Commission Rate | 5% on all enrollments within the district |
| Override Commission | 0.5% on City franchise enrollments |
| Minimum Targets | 100 enrollments/month |
| Agent Network Capacity | Up to 200 Agents |
| Sub-Franchise Rights | Can recommend City franchises |
| Support Level | Regional Support |
| Agreement Duration | 3 years (renewable) |
| Security Deposit | ₹1,00,000 (refundable on termination) |

### 2.4 City Franchise

| Parameter | Details |
|---|---|
| Territory | City/Town Area (as assigned) |
| Franchise Fee | ₹1,00,000 - ₹2,50,000 (based on city) |
| Commission Rate | 6% on all enrollments within the city |
| Override Commission | None |
| Minimum Targets | 50 enrollments/month |
| Agent Network Capacity | Up to 50 Agents |
| Sub-Franchise Rights | None |
| Support Level | Standard Support |
| Agreement Duration | 3 years (renewable) |
| Security Deposit | ₹50,000 (refundable on termination) |

## 3. FRANCHISE FEE & PAYMENT TERMS

### 3.1 Fee Structure
- Franchise Fee is a **one-time, non-refundable** payment
- Security Deposit is **fully refundable** upon satisfactory termination (no pending dues, no violations)
- GST at 18% is applicable on the Franchise Fee
- Payment must be made via authorized payment channels (bank transfer, online payment)

### 3.2 Payment Schedule
- 50% of Franchise Fee payable at the time of signing the Agreement
- Remaining 50% payable within 30 days of signing
- Security Deposit payable in full before territory activation
- Failure to complete payment within 60 days results in automatic cancellation

### 3.3 No Hidden Charges
- No annual renewal fees (within the Agreement period)
- No technology or platform usage fees
- No mandatory marketing fund contributions (voluntary only)
- No royalty fees beyond the commission structure

## 4. TERRITORY RIGHTS & EXCLUSIVITY

### 4.1 Exclusive Territory
- Each Franchisee is assigned an exclusive geographic territory
- No other franchise of the same level will be appointed in the assigned territory
- Franchisee has the right to operate and recruit Agents within their territory

### 4.2 Territory Boundaries
- Territory boundaries are defined by government administrative divisions
- Zone: State boundaries | State: State boundaries | District: District boundaries | City: Municipal boundaries
- Any disputes regarding territory overlap will be resolved by the Company

### 4.3 Territory Restrictions
- Franchisee must not actively solicit members outside their assigned territory
- Online enrollments from within the territory are credited to the Franchisee
- Cross-territory member walk-ins are credited to the territory where enrollment is completed

## 5. FRANCHISEE OBLIGATIONS

### 5.1 Operational Requirements
- Maintain a registered office/workspace within the assigned territory
- Recruit, train, and manage a network of authorized Agents
- Ensure all Agents complete mandatory training and certification
- Conduct regular Agent meetings and performance reviews
- Maintain daily operation hours (minimum 6 days/week, 8 hours/day)
- Respond to member queries and escalations within 24 hours

### 5.2 Performance Requirements
- Meet minimum monthly enrollment targets consistently
- Franchisees failing targets for 3 consecutive months will receive a warning
- Continued non-performance for 6 months may result in territory reduction or termination
- Quarterly performance review meetings with the Company

### 5.3 Compliance Requirements
- Strictly adhere to Raksha Assist's branding and communication guidelines
- Never use insurance terminology (refer to Agent Terms Section 4.2 for prohibited language)
- Ensure all marketing activities and materials are pre-approved
- Comply with all applicable local, state, and central government laws
- Maintain accurate financial records and submit monthly reports
- Cooperate with Company audits and inspections

### 5.4 Agent Management
- Responsible for Agent recruitment, onboarding, and performance management
- Ensure Agents comply with the Agent Agreement Terms & Conditions
- Report Agent violations or misconduct to the Company immediately
- Handle first-level Agent grievances and escalate unresolved issues

## 6. COMPANY (FRANCHISOR) OBLIGATIONS

- Provide the technology platform (Dashboard, Agent Portal, Member Portal)
- Provide initial training and onboarding support (up to 5 days)
- Supply marketing materials and branding guidelines
- Process member enrollments and payments through the central platform
- Calculate and disburse commissions as per the agreed schedule
- Provide ongoing technical support and system updates
- Offer regional marketing support for campaigns and events

## 7. COMMISSION & PAYOUT

### 7.1 Commission Calculation
- Commission is calculated on the net membership fee (excluding GST) for all enrollments within the territory
- Override commission on sub-franchise enrollments is calculated separately
- Commission is earned only on verified, paid, and active memberships

### 7.2 Payout Schedule
- Monthly commission payout by the **15th of the following month**
- Detailed commission statement available on the Franchise Dashboard
- Minimum payout threshold: ₹2,000 (amounts below threshold carry forward)
- Payment via NEFT/RTGS to the registered bank account

### 7.3 Tax Implications
- TDS at 5% deducted as per Section 194H of the Income Tax Act
- TDS certificate (Form 16A) issued quarterly
- GST registration mandatory if annual commission exceeds ₹20 lakhs
- Franchisee is responsible for their own tax compliance and filing

## 8. MARKETING & BRANDING

### 8.1 Brand Usage
- Franchisee is granted a limited, non-exclusive, revocable license to use Raksha Assist branding
- All marketing materials, advertisements, and communications must be pre-approved
- Digital marketing campaigns must comply with Company guidelines
- Social media accounts must be approved and monitored

### 8.2 Marketing Support
- Company provides base marketing materials (brochures, banners, digital assets)
- Co-branded materials with Franchise Partner name are available on request
- Joint marketing campaigns may be organized with shared costs
- Company handles national/digital marketing; Franchisee handles local/ground marketing

### 8.3 Prohibited Marketing Activities
- Making false claims about coverage, benefits, or service levels
- Using insurance terminology in any form of communication
- Comparative advertising against insurance companies
- Unauthorized use of testimonials or celebrity endorsements
- Spamming or unsolicited bulk communications

## 9. CONFIDENTIALITY & NON-COMPETE

### 9.1 Confidentiality
- All business information, member data, commission structures, and operational details are confidential
- Franchisee must not disclose any confidential information to third parties
- Data security protocols must be followed as provided by the Company
- Breach of confidentiality is grounds for immediate termination and legal action

### 9.2 Non-Compete Clause
- During the Agreement period and for 12 months after termination, Franchisee must not:
  - Start or join a competing membership-based assistance program
  - Solicit Raksha Assist members, Agents, or employees
  - Use Raksha Assist's business model, processes, or proprietary information
- Non-compete is limited to the assigned territory

## 10. RENEWAL & TRANSFER

### 10.1 Renewal
- Franchise Agreement is renewable upon mutual consent
- Renewal application must be submitted 90 days before expiry
- Renewal is subject to satisfactory performance review and compliance
- Renewal fee: 25% of the original Franchise Fee
- Revised terms may apply upon renewal

### 10.2 Transfer
- Franchise rights are non-transferable without prior written consent of the Company
- Transfer requests are evaluated on a case-by-case basis
- Transfer fee: 15% of the original Franchise Fee
- New Franchisee must meet all eligibility criteria
- Company has the right of first refusal on any proposed transfer

## 11. TERMINATION

### 11.1 Franchisee-Initiated Termination
- 90 days' written notice required
- All pending commissions settled within 60 days
- Security deposit refunded after deduction of any outstanding dues
- Agent network transition plan required

### 11.2 Company-Initiated Termination
The Company may terminate immediately for:
- Material breach of this Agreement
- Fraud, misrepresentation, or criminal activity
- Persistent failure to meet performance targets (6+ months)
- Use of prohibited language or misleading marketing
- Damage to Raksha Assist brand reputation
- Breach of confidentiality or data security
- Insolvency, bankruptcy, or winding up of Franchisee's business

### 11.3 Post-Termination Obligations
- Cease all use of Raksha Assist branding within 7 days
- Return all company-provided materials, data, and equipment
- Settle all outstanding financial obligations
- Ensure smooth transition of Agent network and member services
- Confidentiality obligations survive termination

## 12. INDEMNIFICATION

The Franchisee shall indemnify and hold harmless Raksha Assist from any claims, damages, losses, or liabilities arising from:
- Franchisee's or their Agents' actions within the territory
- Misrepresentation to members or prospective members
- Violation of applicable laws and regulations
- Unauthorized marketing activities
- Any act or omission outside the scope of this Agreement

## 13. DISPUTE RESOLUTION

### 13.1 Internal Resolution
- Disputes shall first be escalated to the Company's Franchise Relations Department
- Written complaint with supporting documents required
- Company shall respond within 15 working days

### 13.2 Mediation
- If unresolved, disputes shall be referred to mediation
- Mediator appointed by mutual consent
- Mediation expenses shared equally

### 13.3 Arbitration
- If mediation fails, disputes shall be referred to arbitration under the Arbitration and Conciliation Act, 1996
- Sole arbitrator appointed by the Company
- Seat of arbitration: Bengaluru, Karnataka
- Arbitration proceedings in English

### 13.4 Jurisdiction
- All matters subject to the **exclusive jurisdiction of the courts of Bengaluru, Karnataka, India**

## 14. GOVERNING LAW

This Agreement is governed by:
- Indian Contract Act, 1872
- Information Technology Act, 2000
- Income Tax Act, 1961
- Arbitration and Conciliation Act, 1996
- Companies Act, 2013
- Consumer Protection Act, 2019
- All applicable state and local laws

## 15. GENERAL PROVISIONS

### 15.1 Entire Agreement
This Agreement constitutes the entire understanding between the parties and supersedes all prior agreements, whether oral or written.

### 15.2 Amendments
No amendment to this Agreement shall be valid unless made in writing and signed by both parties.

### 15.3 Waiver
Failure to enforce any provision shall not constitute a waiver of that provision or any future enforcement.

### 15.4 Severability
If any provision is held invalid, the remaining provisions shall continue in full force and effect.

### 15.5 Notices
All formal notices must be in writing and delivered via registered post or email to the registered addresses.

## 16. CONTACT INFORMATION

**Mindwhile IT Solutions Pvt. Ltd.**
CIN: U72900TG2024PTC184818
GSTIN: 36AAKCM2849P1Z3
2nd & 3rd Floor, 3rd Block, 12th Main, Bashyam Circle, Rajajinagar, Bengaluru - 560 010, India

- **Franchise Inquiries:** +91 81437 52025
- **Email:** sales@rakshaassist.com
- **Support:** support@rakshaassist.com
- **Website:** www.rakshaassist.com

---

*By entering into this Franchise Agreement, the Franchisee acknowledges that they have read, understood, and agree to be bound by all terms herein. This is a computer-generated document valid without physical signature. Last updated: February 2026.*`
    },

    privacy_policy: {
      title: "Privacy Policy",
      version: "2.0",
      content: `# PRIVACY POLICY

**Raksha Assist — Emergency Medical Assistance Program**
Operated by Mindwhile IT Solutions Pvt. Ltd.
CIN: U72900TG2024PTC184818 | GSTIN: 36AAKCM2849P1Z3
Effective Date: February 2026 | Version 2.0

---

## 1. INTRODUCTION

Mindwhile IT Solutions Pvt. Ltd. ("Company", "We", "Us") is committed to protecting the privacy and personal data of our Members, Agents, Franchise Partners, and website visitors. This Privacy Policy explains how we collect, use, store, share, and protect your information when you use the Raksha Assist platform (website, mobile app, and related services).

This policy complies with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and applicable Indian data protection laws.

## 2. INFORMATION WE COLLECT

### 2.1 Personal Information
- Full name, date of birth, gender, marital status
- Mobile number and email address
- Residential address and pincode
- Government-issued ID (Aadhaar number — stored encrypted)
- PAN Card number (for Agents and Franchise Partners)
- Photographs (for membership card generation)

### 2.2 Health & Medical Information
- Blood group
- Pre-existing medical conditions (self-declared)
- Known allergies
- Emergency medical history (collected during SOS cases)
- Hospital admission records and discharge summaries (during assistance process)

### 2.3 Financial Information
- Payment transaction details (processed through Razorpay — we do not store card numbers)
- Bank account details (for Agent/Franchise commission payouts)
- Membership fee payment history
- Refund processing records

### 2.4 Technical Information
- IP address and device information
- Browser type and version
- Login timestamps and session data
- App usage analytics
- Geolocation (only during SOS emergencies, with consent)

### 2.5 Communication Records
- Customer support tickets and chat history
- Email correspondence
- SOS case communications
- Chatbot interaction logs

## 3. HOW WE USE YOUR INFORMATION

| Purpose | Legal Basis |
|---|---|
| Membership registration and management | Contract performance |
| Emergency assistance coordination | Legitimate interest (life-saving) |
| Hospital-direct payment processing | Contract performance |
| Agent/Franchise commission calculations | Contract performance |
| Identity verification and KYC | Legal obligation |
| Fraud detection and prevention | Legitimate interest |
| Customer support and query resolution | Legitimate interest |
| Sending membership reminders and alerts | Consent |
| Platform improvement and analytics | Legitimate interest |
| Compliance with legal obligations | Legal obligation |
| Marketing and promotional communications | Consent (opt-in only) |

## 4. INFORMATION SHARING & DISCLOSURE

### 4.1 We Share Information With
- **Network Hospitals** — Member identity and plan details for treatment authorization
- **Razorpay** — Payment processing (PCI DSS compliant)
- **Franchise Partners** — Limited member data within their territory for support
- **Agents** — Limited data for enrollment management
- **Government/Law Enforcement** — When required by court order or applicable law
- **Professional Advisors** — Auditors, legal counsel (under confidentiality agreements)

### 4.2 We DO NOT
- Sell your personal data to any third party
- Share your medical records with employers or insurance companies
- Use your data for unsolicited telemarketing
- Transfer your data outside India without adequate protection

## 5. DATA SECURITY MEASURES

| Security Layer | Implementation |
|---|---|
| Data Encryption | AES-256 encryption for sensitive data at rest |
| Transfer Security | SSL/TLS encryption for all data in transit |
| Password Security | Bcrypt hashing (irreversible) |
| Session Security | Secure, HTTP-only cookies with expiration |
| Access Control | Role-based access control (RBAC) with audit trails |
| Infrastructure | CSRF protection, rate limiting, Helmet security headers |
| Aadhaar Protection | Encrypted storage, masked display (XXXX-XXXX-1234) |
| Monitoring | Regular security audits and vulnerability assessments |

## 6. DATA RETENTION

| Data Category | Retention Period |
|---|---|
| Active Member Data | Duration of membership + 7 years |
| Inactive/Expired Member Data | 5 years from expiry |
| Payment Transaction Records | 10 years (as per Income Tax Act) |
| SOS/Emergency Case Records | Permanent (for legal compliance) |
| Agent/Franchise Records | Duration of agreement + 5 years |
| Customer Support Logs | 2 years |
| Website Analytics | 1 year |
| Marketing Consent Records | Until withdrawal of consent |

## 7. YOUR RIGHTS

As a data subject, you have the following rights:

- **Right to Access** — Request a copy of all personal data we hold about you
- **Right to Correction** — Request correction of inaccurate or incomplete data
- **Right to Deletion** — Request deletion of your data (subject to legal retention requirements)
- **Right to Data Portability** — Request your data in a machine-readable format
- **Right to Opt-Out** — Withdraw consent for marketing communications at any time
- **Right to Complain** — File a complaint with our Data Protection Officer or relevant authority

To exercise any of these rights, contact: **privacy@rakshaassist.com**

## 8. COOKIES & TRACKING

| Cookie Type | Purpose | Required? |
|---|---|---|
| Essential Cookies | Login, authentication, security | Yes (mandatory) |
| Session Cookies | Maintaining user sessions | Yes (mandatory) |
| Analytics Cookies | Platform usage and performance | No (optional) |
| Preference Cookies | Language and display settings | No (optional) |

You can manage cookie preferences through your browser settings. Disabling essential cookies may prevent you from using the platform.

## 9. CHILDREN'S PRIVACY

- Raksha Assist services are intended for individuals aged 18 years and above
- We do not knowingly collect personal information from children under 18
- Family plan dependents under 18 are covered but their data is managed by the primary member
- If we discover we have collected data from a child without parental consent, we will delete it promptly

## 10. THIRD-PARTY LINKS

Our platform may contain links to third-party websites (hospitals, government portals, etc.). We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies before providing any information.

## 11. UPDATES TO THIS POLICY

- We may update this Privacy Policy from time to time
- Material changes will be notified via email and/or platform notification at least 30 days in advance
- Continued use of our services after notification constitutes acceptance
- The current version is always available on our website

## 12. GRIEVANCE OFFICER

In accordance with the Information Technology Act, 2000, the designated Grievance Officer for data protection matters is:

**Grievance Officer**
Mindwhile IT Solutions Pvt. Ltd.
2nd & 3rd Floor, 3rd Block, 12th Main, Bashyam Circle, Rajajinagar, Bengaluru - 560 010, India

- **Email:** privacy@rakshaassist.com
- **Phone:** +91 81437 52025
- **Response Time:** Within 48 hours of receipt

## 13. CONTACT US

**Mindwhile IT Solutions Pvt. Ltd.**
CIN: U72900TG2024PTC184818
2nd & 3rd Floor, 3rd Block, 12th Main, Bashyam Circle, Rajajinagar, Bengaluru - 560 010, India

- **Support:** support@rakshaassist.com
- **Privacy:** privacy@rakshaassist.com
- **Phone:** +91 81437 52025
- **Website:** www.rakshaassist.com

**Jurisdiction:** All matters related to this Privacy Policy are subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka, India.

---

*This is a computer-generated document valid without physical signature. Last updated: February 2026.*`
    },

    membership_agreement: {
      title: "Membership Agreement",
      version: "2.0",
      content: `# MEMBERSHIP AGREEMENT

**Raksha Assist — Emergency Medical Assistance Program**
Operated by Mindwhile IT Solutions Pvt. Ltd.
CIN: U72900TG2024PTC184818 | GSTIN: 36AAKCM2849P1Z3

---

## AGREEMENT OVERVIEW

This Membership Agreement ("Agreement") is entered into between the Member ("You") and Mindwhile IT Solutions Pvt. Ltd. ("Company/Raksha Assist"). By purchasing a Raksha Assist membership, you agree to all terms herein and in the Terms & Conditions.

## KEY TERMS

- **Service Type:** Membership-based emergency assistance coordination (NOT insurance)
- **Activation:** Upon successful payment and KYC verification
- **Duration:** As per selected plan (monthly/annual)
- **Assistance Limit:** Maximum financial support as per plan
- **Helpline:** +91 81437 52025 (24/7)
- **Jurisdiction:** Courts of Bengaluru, Karnataka, India

## MEMBER DECLARATION

By accepting this Agreement, you declare that:
1. All information provided is true, accurate, and complete
2. You understand this is NOT an insurance product
3. All assistance is discretionary and subject to verification
4. You have read and accepted the Terms & Conditions and Privacy Policy
5. You consent to the collection and processing of your personal and medical data
6. You understand the waiting periods applicable to your plan

## CONTACT

- **Helpline:** +91 81437 52025
- **Email:** support@rakshaassist.com
- **Website:** www.rakshaassist.com

---

*Computer-generated document. Valid without physical signature.*`
    },

    refund_policy: {
      title: "Refund & Cancellation Policy",
      version: "2.0",
      content: `# REFUND & CANCELLATION POLICY

**Raksha Assist — Emergency Medical Assistance Program**
Operated by Mindwhile IT Solutions Pvt. Ltd.
CIN: U72900TG2024PTC184818

---

## 1. FREE LOOK PERIOD

- All new members have a **15-day free look period** from the date of membership activation
- During this period, you may cancel your membership for any reason
- Full refund will be processed minus a ₹500 administrative/processing fee
- No refund under free look period if an SOS case has been filed

## 2. CANCELLATION AFTER FREE LOOK PERIOD

- Cancellation requests accepted via email to support@rakshaassist.com or through your dashboard
- Pro-rata refund calculated based on the unused portion of your membership
- Processing fee of ₹500 deducted from all refunds
- No refund if SOS assistance has been provided during the membership period
- No refund for monthly plans after the current billing cycle

## 3. REFUND PROCESSING

- Refund will be processed within **7-14 business days** of cancellation approval
- Refund will be credited to the original payment method
- For bank transfers, refund will be via NEFT to the registered bank account
- GST paid will be refunded proportionally

## 4. NON-REFUNDABLE ITEMS

- Membership add-on benefits once activated
- Memberships where SOS assistance has been used
- Processing/administrative fees
- Franchise fees and security deposits (separate terms apply)
- Agent registration fees (if any)

## 5. COMPANY-INITIATED REFUNDS

If Raksha Assist cancels a membership due to:
- System error or duplicate payment: Full refund within 7 days
- Company decision (without member fault): Pro-rata refund without processing fee deduction
- Fraud detection: No refund; matter referred to legal

## 6. CONTACT FOR REFUNDS

- **Email:** support@rakshaassist.com
- **Phone:** +91 81437 52025
- **Response Time:** 48 hours

---

*Last updated: February 2026. Subject to the Terms & Conditions of Raksha Assist.*`
    }
  };

  return policies[type] || null;
}
