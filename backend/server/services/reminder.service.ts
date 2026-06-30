import { storage } from "../storage";
import type { Membership, User } from "../../shared/schema";

interface ReminderConfig {
  planType: string;
  daysBeforeExpiry: number[];
  reminderMessages: { [days: number]: string };
}

const REMINDER_CONFIGS: ReminderConfig[] = [
  {
    planType: "monthly",
    daysBeforeExpiry: [15, 7, 2, 0, -1, -3],
    reminderMessages: {
      15: "Your Raksha Assist monthly plan expires in 15 days. Plan your renewal now to continue membership benefits.",
      7: "Your Raksha Assist monthly plan expires in 7 days. Renew now to continue your membership.",
      2: "URGENT: Your monthly plan expires in 2 days! Renew immediately to avoid membership lapse.",
      0: "Your monthly plan expires today! Renew immediately to continue protection.",
      "-1": "Your plan has expired! Renew now to restore your membership immediately.",
      "-3": "Final Notice: Your plan expired 3 days ago. Renew urgently to avoid losing benefits."
    }
  },
  {
    planType: "quarterly",
    daysBeforeExpiry: [30, 15, 7, 2, 0, -1, -3],
    reminderMessages: {
      30: "Your Raksha Assist 3-month plan expires in 30 days. Plan your renewal now.",
      15: "Your 3-month plan expires in 15 days. Renew soon to continue your membership.",
      7: "Your 3-month plan expires in 7 days. Renew to continue your membership.",
      2: "URGENT: Your 3-month plan expires in 2 days! Renew now to avoid membership lapse.",
      0: "Your 3-month plan expires today! Renew immediately.",
      "-1": "Your plan has expired! Renew now to restore membership.",
      "-3": "Final Notice: Your plan expired 3 days ago. Renew urgently."
    }
  },
  {
    planType: "half_yearly",
    daysBeforeExpiry: [30, 15, 7, 2, 0, -1, -3],
    reminderMessages: {
      30: "Your Raksha Assist 6-month plan expires in 30 days. Plan your renewal.",
      15: "Your 6-month plan expires in 15 days. Renew to continue membership benefits.",
      7: "Your 6-month plan expires in 7 days. Renew soon.",
      2: "URGENT: Your 6-month plan expires in 2 days! Renew immediately.",
      0: "Your 6-month plan expires today! Renew immediately.",
      "-1": "Your plan has expired! Renew now to restore membership.",
      "-3": "Final Notice: Your plan expired 3 days ago. Renew urgently."
    }
  },
  {
    planType: "yearly",
    daysBeforeExpiry: [30, 15, 7, 2, 0, -1, -3],
    reminderMessages: {
      30: "Your Raksha Assist annual plan expires in 30 days. Plan your renewal to continue membership benefits.",
      15: "Your annual plan expires in 15 days. Renew soon to avoid any membership lapse.",
      7: "Your annual plan expires in 7 days. Renew now.",
      2: "URGENT: Your annual plan expires in 2 days! Renew immediately to avoid losing benefits.",
      0: "Your annual plan expires today! Renew immediately.",
      "-1": "Your plan has expired! Renew now to restore membership immediately.",
      "-3": "Final Notice: Your plan expired 3 days ago. Renew urgently to avoid losing all benefits."
    }
  }
];

function getPlanCategory(planType: string): string {
  const lowerPlan = planType.toLowerCase();
  if (lowerPlan.includes("monthly") || lowerPlan.includes("1_month")) return "monthly";
  if (lowerPlan.includes("quarterly") || lowerPlan.includes("3_month")) return "quarterly";
  if (lowerPlan.includes("half") || lowerPlan.includes("6_month")) return "half_yearly";
  if (lowerPlan.includes("yearly") || lowerPlan.includes("annual") || lowerPlan.includes("12_month")) return "yearly";
  return "monthly";
}

function getReminderConfig(planType: string): ReminderConfig {
  const category = getPlanCategory(planType);
  return REMINDER_CONFIGS.find(c => c.planType === category) || REMINDER_CONFIGS[0];
}

function getDaysUntilExpiry(expiryDate: Date): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export async function checkAndSendPaymentReminders(): Promise<{ sent: number; errors: number }> {
  let sent = 0;
  let errors = 0;

  try {
    const memberships = await storage.getAllMemberships();
    const activeMemberships = memberships.filter(m => m.status === "active" && m.expiryDate);

    for (const membership of activeMemberships) {
      try {
        const daysLeft = getDaysUntilExpiry(membership.expiryDate!);
        const config = getReminderConfig(membership.planType);
        
        if (config.daysBeforeExpiry.includes(daysLeft)) {
          const message = config.reminderMessages[daysLeft] || 
            `Your plan expires in ${daysLeft} days. Please renew.`;
          
          const notificationKey = `reminder_${membership.id}_${daysLeft}`;
          const existingNotifications = await storage.getNotificationsByUser(membership.userId, 100);
          const alreadySent = existingNotifications.some(n => {
            if (!n.metadata) return false;
            try {
              const parsed = JSON.parse(n.metadata);
              return parsed.key === notificationKey;
            } catch {
              return n.metadata.includes(notificationKey);
            }
          });

          if (!alreadySent) {
            await storage.createNotification({
              userId: membership.userId,
              title: daysLeft >= 0 ? "Payment Reminder" : "Plan Expired",
              message: message,
              type: daysLeft >= 0 ? "warning" : "error",
              category: "payment",
              link: "/plans",
              metadata: JSON.stringify({ key: notificationKey, daysLeft, planType: membership.planType })
            });
            sent++;
            console.log(`[Reminder] Sent ${daysLeft}-day reminder to user ${membership.userId}`);
          }
        }
      } catch (err) {
        console.error(`[Reminder] Error processing membership ${membership.id}:`, err);
        errors++;
      }
    }
  } catch (err) {
    console.error("[Reminder] Error in checkAndSendPaymentReminders:", err);
    errors++;
  }

  return { sent, errors };
}

export async function sendPaymentReceipt(
  userId: string, 
  paymentDetails: {
    amount: number;
    planType: string;
    transactionId: string;
    paymentDate: Date;
    membershipNumber: string;
  }
): Promise<void> {
  const user = await storage.getUserById(userId);
  if (!user) return;

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(paymentDetails.amount);

  const message = `Payment Received! ${formattedAmount} for ${paymentDetails.planType} plan. 
Transaction ID: ${paymentDetails.transactionId}
Membership: ${paymentDetails.membershipNumber}
Thank you for choosing Raksha Assist!`;

  await storage.createNotification({
    userId,
    title: "Payment Receipt",
    message,
    type: "success",
    category: "payment",
    link: "/dashboard/payment-history",
    metadata: JSON.stringify({
      type: "receipt",
      amount: paymentDetails.amount,
      transactionId: paymentDetails.transactionId,
      planType: paymentDetails.planType,
      paymentDate: paymentDetails.paymentDate.toISOString()
    })
  });

  console.log(`[Receipt] Payment receipt notification sent to user ${userId}`);
}

let reminderInterval: NodeJS.Timeout | null = null;

export function startReminderScheduler(): void {
  if (reminderInterval) {
    clearInterval(reminderInterval);
  }

  console.log("[Reminder] Starting payment reminder scheduler (runs every 1 hour)");
  
  checkAndSendPaymentReminders().then(result => {
    console.log(`[Reminder] Initial check: ${result.sent} reminders sent, ${result.errors} errors`);
  });

  reminderInterval = setInterval(async () => {
    console.log("[Reminder] Running scheduled payment reminder check...");
    const result = await checkAndSendPaymentReminders();
    console.log(`[Reminder] Check complete: ${result.sent} reminders sent, ${result.errors} errors`);
  }, 1 * 60 * 60 * 1000);
}

export function stopReminderScheduler(): void {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
    console.log("[Reminder] Payment reminder scheduler stopped");
  }
}
