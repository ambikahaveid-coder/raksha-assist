import webpush from 'web-push';
import { storage } from '../storage';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@rakshaassist.com';

let isConfigured = false;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    isConfigured = true;
    console.log('[Push] Web Push configured with VAPID keys');
  } catch (error) {
    console.error('[Push] Failed to configure VAPID:', error);
  }
} else {
  console.log('[Push] VAPID keys not configured - push notifications disabled');
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

export async function sendPushNotification(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  if (!isConfigured) {
    console.log('[Push] Skipping push - not configured');
    return { sent: 0, failed: 0 };
  }

  const subscriptions = await storage.getPushSubscriptionsByUser(userId);
  
  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/badge-72.png',
    url: payload.url || '/dashboard',
    tag: payload.tag || 'raksha-notification'
  });

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        },
        pushPayload,
        {
          TTL: 86400,
          urgency: 'high'
        }
      );
      sent++;
    } catch (error: any) {
      failed++;
      console.error('[Push] Failed to send notification:', error?.message);
      
      if (error?.statusCode === 410 || error?.statusCode === 404) {
        await storage.deletePushSubscription(userId, sub.endpoint);
        console.log('[Push] Removed expired subscription');
      }
    }
  }

  return { sent, failed };
}

export async function sendNotificationToUser(
  userId: string,
  title: string,
  message: string,
  options?: {
    type?: string;
    category?: string;
    link?: string;
    metadata?: any;
    sendPush?: boolean;
  }
): Promise<void> {
  const notification = await storage.createNotification({
    userId,
    title,
    message,
    type: options?.type || 'info',
    category: options?.category,
    link: options?.link,
    metadata: options?.metadata ? JSON.stringify(options.metadata) : undefined
  });

  if (options?.sendPush !== false) {
    const result = await sendPushNotification(userId, {
      title,
      body: message,
      url: options?.link || '/dashboard'
    });

    if (result.sent > 0) {
      await storage.updateNotificationPushStatus(notification.id, true);
    }
  }
}

export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}

export function isPushConfigured(): boolean {
  return isConfigured;
}

export async function generateVapidKeys(): Promise<{ publicKey: string; privateKey: string }> {
  return webpush.generateVAPIDKeys();
}
