declare module 'web-push' {
  interface VapidKeys {
    publicKey: string;
    privateKey: string;
  }

  interface PushSubscription {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }

  interface RequestOptions {
    TTL?: number;
    headers?: Record<string, string>;
    topic?: string;
    urgency?: 'very-low' | 'low' | 'normal' | 'high';
  }

  function setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
  function generateVAPIDKeys(): VapidKeys;
  function sendNotification(
    subscription: PushSubscription,
    payload?: string | Buffer,
    options?: RequestOptions
  ): Promise<{ statusCode: number; body: string; headers: Record<string, string> }>;

  export { setVapidDetails, generateVAPIDKeys, sendNotification, VapidKeys, PushSubscription, RequestOptions };
  export default { setVapidDetails, generateVAPIDKeys, sendNotification };
}
