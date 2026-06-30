declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

let gaInitialized = false;
let currentMeasurementId: string | null = null;

export const initGA = async () => {
  if (gaInitialized) return;
  
  try {
    const response = await fetch('/api/public/integrations');
    if (!response.ok) return;
    
    const settings = await response.json();
    const measurementId = settings?.analytics?.measurementId;
    
    if (!measurementId || !settings?.analytics?.enabled) {
      return;
    }
    
    currentMeasurementId = measurementId;
    
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}');
    `;
    document.head.appendChild(script2);
    
    gaInitialized = true;
  } catch (error) {
    console.warn('Failed to initialize Google Analytics:', error);
  }
};

export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag || !currentMeasurementId) return;
  
  window.gtag('config', currentMeasurementId, {
    page_path: url
  });
};

export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

export const trackPlanView = (planName: string, planPrice: number) => {
  trackEvent('view_item', 'plans', planName, planPrice);
};

export const trackRegistration = (method: string) => {
  trackEvent('sign_up', 'engagement', method);
};

export const trackLogin = (method: string) => {
  trackEvent('login', 'engagement', method);
};

export const trackPurchase = (planName: string, amount: number, transactionId: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: amount / 100,
    currency: 'INR',
    items: [{
      item_name: planName,
      price: amount / 100,
      quantity: 1
    }]
  });
};

export const trackSOSRequest = () => {
  trackEvent('sos_request', 'emergency', 'sos_button');
};

export const trackContactForm = () => {
  trackEvent('contact_form_submit', 'engagement', 'contact_page');
};
