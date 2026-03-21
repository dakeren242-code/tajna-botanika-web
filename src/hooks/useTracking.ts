import { useEffect } from 'react';

interface TrackingEvent {
  value?: number;
  currency?: string;
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  contents?: Array<{ id: string; quantity: number }>;
  num_items?: number;
  transaction_id?: string;
  search_string?: string;
  [key: string]: any;
}

declare global {
  interface Window {
    fbq?: (action: string, event: string, data?: any) => void;
    gtag?: (...args: any[]) => void;
    ttq?: {
      track: (event: string, data?: any) => void;
      page: () => void;
    };
  }
}

export function initializeTracking() {
  const fbPixelId = import.meta.env.VITE_FB_PIXEL_ID;
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const tiktokPixelId = import.meta.env.VITE_TIKTOK_PIXEL_ID;

  if (fbPixelId && !window.fbq) {
    (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq!('init', fbPixelId);
    window.fbq!('track', 'PageView');
  }

  if (gaId && !window.gtag) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.gtag = function() {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId);
  }

  if (tiktokPixelId && !window.ttq) {
    (function(w: any, d: any, t: any) {
      w.TiktokAnalyticsObject = t;
      const ttq = (w[t] = w[t] || []);
      ttq.methods = [
        'page',
        'track',
        'identify',
        'instances',
        'debug',
        'on',
        'off',
        'once',
        'ready',
        'alias',
        'group',
        'enableCookie',
        'disableCookie',
      ];
      ttq.setAndDefer = function(t: any, e: any) {
        t[e] = function() {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function(t: string) {
        const e = ttq._i[t] || [];
        for (let n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
        return e;
      };
      ttq.load = function(e: string, n?: any) {
        const i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {};
        ttq._i[e] = [];
        ttq._i[e]._u = i;
        ttq._t = ttq._t || {};
        ttq._t[e] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[e] = n || {};
        const o = document.createElement('script');
        o.type = 'text/javascript';
        o.async = true;
        o.src = i + '?sdkid=' + e + '&lib=' + t;
        const a = document.getElementsByTagName('script')[0];
        a.parentNode!.insertBefore(o, a);
      };

      ttq.load(tiktokPixelId);
      ttq.page();
    })(window, document, 'ttq');
  }
}

async function sendToFacebookCAPI(eventName: string, data?: TrackingEvent) {
  try {
    const capiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/facebook-capi`;

    const payload = {
      event_name: eventName,
      event_source_url: window.location.href,
      custom_data: {
        currency: data?.currency || 'CZK',
        value: data?.value,
        content_ids: data?.content_ids,
        content_name: data?.content_name,
        content_type: data?.content_type,
        contents: data?.contents,
        num_items: data?.num_items,
      },
      user_data: {
        fbp: getCookie('_fbp'),
        fbc: getCookie('_fbc'),
      },
    };

    await fetch(capiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Failed to send Facebook CAPI event:', error);
  }
}

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

export function trackEvent(eventName: string, data?: TrackingEvent) {
  if (window.fbq) {
    window.fbq('track', eventName, data);
  }

  if (window.gtag) {
    window.gtag('event', eventName, data);
  }

  if (window.ttq) {
    window.ttq.track(eventName, data);
  }

  if (import.meta.env.VITE_FB_PIXEL_ID) {
    sendToFacebookCAPI(eventName, data);
  }

  if (import.meta.env.DEV) {
    console.log('📊 Tracking Event:', eventName, data);
  }
}

export function trackPageView(pagePath?: string) {
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }

  if (window.gtag && pagePath) {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
      page_path: pagePath,
    });
  }

  if (window.ttq) {
    window.ttq.page();
  }

  if (import.meta.env.DEV) {
    console.log('📊 Page View:', pagePath);
  }
}

export function useTracking() {
  useEffect(() => {
    initializeTracking();
  }, []);

  return {
    trackEvent,
    trackPageView,
    trackViewContent: (contentName: string, contentId: string, value?: number) => {
      trackEvent('ViewContent', {
        content_name: contentName,
        content_ids: [contentId],
        content_type: 'product',
        value,
        currency: 'CZK',
      });
    },
    trackAddToCart: (contentName: string, contentId: string, value: number, quantity: number) => {
      trackEvent('AddToCart', {
        content_name: contentName,
        content_ids: [contentId],
        content_type: 'product',
        value,
        currency: 'CZK',
        contents: [{ id: contentId, quantity }],
      });
    },
    trackInitiateCheckout: (value: number, numItems: number, contents: Array<{ id: string; quantity: number }>) => {
      trackEvent('InitiateCheckout', {
        value,
        currency: 'CZK',
        num_items: numItems,
        contents,
      });
    },
    trackPurchase: (orderId: string, value: number, contents: Array<{ id: string; quantity: number }>) => {
      trackEvent('Purchase', {
        value,
        currency: 'CZK',
        transaction_id: orderId,
        contents,
      });
    },
    trackSearch: (searchTerm: string) => {
      trackEvent('Search', {
        search_string: searchTerm,
      });
    },
    trackLead: (email?: string) => {
      trackEvent('Lead', {
        content_name: 'Newsletter Signup',
      });
    },
  };
}
