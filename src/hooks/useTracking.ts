import { useEffect } from 'react';
import { getConsentState, useConsent, type ConsentState } from '../contexts/ConsentContext';
import { supabase } from '../lib/supabase';

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
  user_email?: string;
  user_phone?: string;
  user_first_name?: string;
  user_last_name?: string;
  user_city?: string;
  user_zip?: string;
  user_country?: string;
  user_id?: string;
  [key: string]: any;
}

declare global {
  interface Window {
    fbq?: (action: string, event: string, data?: any, options?: any) => void;
    gtag?: (...args: any[]) => void;
    ttq?: {
      track: (event: string, data?: any) => void;
      page: () => void;
    };
    _trackingEventCache?: Set<string>;
  }
}

let cachedUserId: string | undefined;
let cachedUserEmail: string | undefined;
let cachedUserPhone: string | undefined;
let cachedUserFirstName: string | undefined;
let cachedUserLastName: string | undefined;
let cachedUserCity: string | undefined;
let cachedUserZip: string | undefined;
let cachedUserCountry: string | undefined;

async function cacheUserProfile(userId: string) {
  const { data } = await supabase
    .from('user_profiles')
    .select('full_name, phone')
    .eq('id', userId)
    .maybeSingle();

  if (data) {
    const nameParts = (data.full_name || '').trim().split(/\s+/);
    cachedUserFirstName = nameParts[0] || undefined;
    cachedUserLastName = nameParts.slice(1).join(' ') || undefined;
    cachedUserPhone = data.phone || undefined;
  }

  // Cache most recent shipping address for better EMQ on non-purchase events
  const { data: address } = await supabase
    .from('addresses')
    .select('city, postal_code, country')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (address) {
    cachedUserCity = address.city || undefined;
    cachedUserZip = address.postal_code || undefined;
    cachedUserCountry = address.country || undefined;
  }
}

// Eagerly load current session on module init to avoid race conditions
// where the user adds to cart before onAuthStateChange profile fetch completes
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session?.user) {
    cachedUserId = session.user.id;
    cachedUserEmail = session.user.email;
    cacheUserProfile(session.user.id);
  }
});

// Keep user data cached for EMQ enrichment
supabase.auth.onAuthStateChange(async (_event, session) => {
  cachedUserId = session?.user?.id;
  cachedUserEmail = session?.user?.email;

  if (session?.user?.id) {
    cacheUserProfile(session.user.id);
  } else {
    cachedUserPhone = undefined;
    cachedUserFirstName = undefined;
    cachedUserLastName = undefined;
    cachedUserCity = undefined;
    cachedUserZip = undefined;
    cachedUserCountry = undefined;
  }
});

const EVENT_DEDUP_WINDOW = 5000;
const eventTimestamps = new Map<string, number>();

function generateEventKey(eventName: string, data?: TrackingEvent): string {
  const key = JSON.stringify({
    event: eventName,
    id: data?.transaction_id || data?.content_ids?.[0] || '',
    value: data?.value,
    timestamp: Math.floor(Date.now() / EVENT_DEDUP_WINDOW)
  });
  return key;
}

function isDuplicate(eventName: string, data?: TrackingEvent): boolean {
  const key = generateEventKey(eventName, data);
  const now = Date.now();
  const lastSent = eventTimestamps.get(key);

  if (lastSent && (now - lastSent) < EVENT_DEDUP_WINDOW) {
    console.warn(`🚫 Blocked duplicate event: ${eventName}`, data);
    return true;
  }

  eventTimestamps.set(key, now);

  setTimeout(() => {
    eventTimestamps.delete(key);
  }, EVENT_DEDUP_WINDOW * 2);

  return false;
}

function isValidEventData(eventName: string, data?: TrackingEvent): boolean {
  if (!data) return true;

  if (data.content_ids) {
    const invalidIds = ['test', 'dummy', 'undefined', 'null', ''];
    for (const id of data.content_ids) {
      if (!id || invalidIds.includes(id.toLowerCase())) {
        console.warn(`🚫 Blocked event with invalid content_id: ${id}`, eventName);
        return false;
      }
      if (id.includes('test') || id.includes('dummy')) {
        console.warn(`🚫 Blocked event with test/dummy content_id: ${id}`, eventName);
        return false;
      }
    }
  }

  if (data.content_name) {
    const invalidNames = ['test', 'dummy', 'undefined', 'null'];
    if (invalidNames.includes(data.content_name.toLowerCase())) {
      console.warn(`🚫 Blocked event with invalid content_name: ${data.content_name}`, eventName);
      return false;
    }
  }

  if (data.value !== undefined) {
    if (data.value < 0 || !isFinite(data.value)) {
      console.warn(`🚫 Blocked event with invalid value: ${data.value}`, eventName);
      return false;
    }
  }

  if (data.transaction_id) {
    if (!data.transaction_id || data.transaction_id === 'undefined' || data.transaction_id === 'null') {
      console.warn(`🚫 Blocked event with invalid transaction_id: ${data.transaction_id}`, eventName);
      return false;
    }
  }

  if (data.contents && Array.isArray(data.contents)) {
    for (const item of data.contents) {
      if (!item.id || item.id === 'undefined' || item.id === 'null') {
        console.warn(`🚫 Blocked event with invalid content item id: ${item.id}`, eventName);
        return false;
      }
      if (item.quantity <= 0 || !isFinite(item.quantity)) {
        console.warn(`🚫 Blocked event with invalid quantity: ${item.quantity}`, eventName);
        return false;
      }
    }
  }

  return true;
}

const PRODUCTION_HOST = 'tajnabotanika.online';
const isProduction = typeof window !== 'undefined' && window.location.hostname === PRODUCTION_HOST;

export function initializeTracking(consent?: ConsentState) {
  const effectiveConsent = consent || getConsentState();
  const fbPixelId = import.meta.env.VITE_FB_PIXEL_ID;
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const tiktokPixelId = import.meta.env.VITE_TIKTOK_PIXEL_ID;

  // Always load FB pixel (even without consent) for better event coverage.
  // Without consent: Limited Data Use mode (no PII, no cookies stored by pixel).
  // With consent: full tracking with user matching.
  if (fbPixelId && !window.fbq && isProduction) {
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

    if (!effectiveConsent.marketing) {
      // Limited Data Use - no advanced matching, restricted data processing
      window.fbq!('dataProcessingOptions', ['LDU'], 0, 0);
    }
    // Init with noscript PageView disabled — we send our own PageView with eventID for deduplication
    window.fbq!('set', 'autoConfig', false, fbPixelId);
    window.fbq!('init', fbPixelId);
  }

  if (effectiveConsent.analytics && gaId && !window.gtag && isProduction) {
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

  if (effectiveConsent.marketing && tiktokPixelId && !window.ttq && isProduction) {
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

function generateEventId(eventName: string): string {
  return `${eventName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function sendToFacebookCAPI(eventName: string, data?: TrackingEvent, eventId?: string, hasConsent?: boolean) {
  try {
    // When no marketing consent: send with Limited Data Use flag and strip PII.
    // When consent given: send full event with user identifiers for better match quality.
    const withConsent = hasConsent ?? false;

    const payload: Record<string, any> = {
      event_name: eventName,
      event_id: eventId,
      event_source_url: window.location.href,
      custom_data: {
        currency: data?.currency || 'CZK',
        value: data?.value,
        content_ids: data?.content_ids,
        content_name: data?.content_name,
        content_type: data?.content_type,
        contents: data?.contents,
        num_items: data?.num_items,
        order_id: data?.transaction_id,
      },
      user_data: withConsent ? {
        fbp: getCookie('_fbp') || undefined,
        fbc: getFbc() || undefined,
        em: data?.user_email || undefined,
        ph: data?.user_phone || undefined,
        fn: data?.user_first_name || undefined,
        ln: data?.user_last_name || undefined,
        ct: data?.user_city || undefined,
        zp: data?.user_zip || undefined,
        country: data?.user_country || 'cz',
        external_id: data?.user_id || undefined,
      } : {
        // No PII without consent — only anonymous browser signals
        fbp: getCookie('_fbp') || undefined,
        fbc: getFbc() || undefined,
        country: 'cz',
      },
    };

    if (!withConsent) {
      payload.data_processing_options = ['LDU'];
      payload.data_processing_options_country = 1; // EU
      payload.data_processing_options_state = 1000; // EU (all states)
    }

    const capiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/facebook-capi`;
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

// Capture fbclid from the landing URL as a fallback for when the Meta Pixel
// hasn't initialized yet (no consent). Stored in memory only — we do NOT write
// to the _fbc cookie here, because the pixel will set its own _fbc with its own
// timestamp when it initializes. Overwriting it would cause the "modified fbclid"
// CAPI diagnostic error (pixel sends its fbc, CAPI sends ours with different timestamp).
let cachedFbc: string | undefined;

(function captureFbclid() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get('fbclid');
    if (fbclid) {
      cachedFbc = `fb.1.${Date.now()}.${fbclid}`;
    }
  } catch {
    // Non-browser environment, ignore
  }
})();

function getFbc(): string | undefined {
  // Always prefer the pixel's _fbc cookie — it's the canonical value the pixel
  // sends with its own events. Using this prevents the "modified fbclid" CAPI error.
  // Fall back to cachedFbc only for LDU events where the pixel hasn't loaded.
  return getCookie('_fbc') || cachedFbc;
}

export function trackEvent(eventName: string, data?: TrackingEvent) {
  const consent = getConsentState();

  if (isDuplicate(eventName, data)) {
    return;
  }

  if (!isValidEventData(eventName, data)) {
    return;
  }

  // Auto-enrich with logged-in user data for better EMQ
  const enrichedData = { ...data };
  if (!enrichedData.user_id && cachedUserId) enrichedData.user_id = cachedUserId;
  if (!enrichedData.user_email && cachedUserEmail) enrichedData.user_email = cachedUserEmail;
  if (!enrichedData.user_phone && cachedUserPhone) enrichedData.user_phone = cachedUserPhone;
  if (!enrichedData.user_first_name && cachedUserFirstName) enrichedData.user_first_name = cachedUserFirstName;
  if (!enrichedData.user_last_name && cachedUserLastName) enrichedData.user_last_name = cachedUserLastName;
  if (!enrichedData.user_city && cachedUserCity) enrichedData.user_city = cachedUserCity;
  if (!enrichedData.user_zip && cachedUserZip) enrichedData.user_zip = cachedUserZip;
  if (!enrichedData.user_country && cachedUserCountry) enrichedData.user_country = cachedUserCountry;

  const eventId = generateEventId(eventName);

  if (window.fbq) {
    window.fbq('track', eventName, data, { eventID: eventId });
  }

  if (consent.analytics && window.gtag) {
    window.gtag('event', eventName, data);
  }

  if (consent.marketing && window.ttq) {
    window.ttq.track(eventName, data);
  }

  if (import.meta.env.VITE_FB_PIXEL_ID && isProduction) {
    sendToFacebookCAPI(eventName, enrichedData, eventId, consent.marketing);
  }

  if (import.meta.env.DEV) {
    console.log('✅ Tracking Event:', eventName, data);
  }
}

export function trackPageView(pagePath?: string) {
  const consent = getConsentState();
  const eventId = generateEventId('PageView');

  if (window.fbq) {
    window.fbq('track', 'PageView', {}, { eventID: eventId });
  }

  if (import.meta.env.VITE_FB_PIXEL_ID && isProduction) {
    // Delay CAPI PageView slightly so _fbp cookie is set by Pixel first.
    // This improves fbp coverage from ~43% to ~100%.
    setTimeout(() => {
      const enriched: TrackingEvent = {};
      if (cachedUserId) enriched.user_id = cachedUserId;
      if (cachedUserEmail) enriched.user_email = cachedUserEmail;
      if (cachedUserPhone) enriched.user_phone = cachedUserPhone;
      if (cachedUserFirstName) enriched.user_first_name = cachedUserFirstName;
      if (cachedUserLastName) enriched.user_last_name = cachedUserLastName;
      sendToFacebookCAPI('PageView', enriched, eventId, consent.marketing);
    }, 1500);
  }

  if (consent.analytics && window.gtag && pagePath) {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
      page_path: pagePath,
    });
  }

  if (consent.marketing && window.ttq) {
    window.ttq.page();
  }

  if (import.meta.env.DEV) {
    console.log('📊 Page View:', pagePath);
  }
}

export function useTracking() {
  const { consent } = useConsent();

  useEffect(() => {
    initializeTracking(consent);
  }, [consent]);

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
        content_ids: contents.map(c => c.id),
        content_type: 'product',
        num_items: numItems,
        contents,
      });
    },
    trackPurchase: (orderId: string, value: number, contents: Array<{ id: string; quantity: number }>) => {
      trackEvent('Purchase', {
        value,
        currency: 'CZK',
        transaction_id: orderId,
        content_ids: contents.map(c => c.id),
        content_type: 'product',
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
        user_email: email,
      });
    },
  };
}
