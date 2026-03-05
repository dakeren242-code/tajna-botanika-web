import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  initMetaPixel,
  initMetaPixelWithAdvancedMatching,
  trackMetaEvent,
  MetaEvents,
  DEFAULT_CURRENCY
} from '../lib/metaTracking';

const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '';
const META_CAPI_KEY = import.meta.env.VITE_META_CAPI_KEY || '';

if (import.meta.env.DEV) {
  console.log('[Meta] META PIXEL OK');
  console.log('[Meta] CAPI KEY PRESENT', META_CAPI_KEY.length >= 48 ? 'true' : 'false');
}

export function useMetaTracking() {
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!META_PIXEL_ID) return;

    if (user?.email) {
      const nameParts = profile?.full_name?.trim().split(/\s+/) ?? [];
      initMetaPixelWithAdvancedMatching(META_PIXEL_ID, {
        email: user.email,
        phone: profile?.phone || undefined,
        firstName: nameParts[0] || undefined,
        lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined,
        externalId: user.id,
      });
    } else {
      initMetaPixel(META_PIXEL_ID);
    }
  }, [user?.id, profile?.full_name, profile?.phone]);

  const getLoggedInUserData = () => {
    if (!user?.email) return undefined;
    const nameParts = profile?.full_name?.trim().split(/\s+/) ?? [];
    return {
      email: user.email,
      phone: profile?.phone || undefined,
      firstName: nameParts[0] || undefined,
      lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined,
      externalId: user.id,
    };
  };

  // ─────────────────────────────────────────
  // PAGE VIEW
  // ─────────────────────────────────────────

  const trackPageView = async () => {
    if (!META_PIXEL_ID) return;

    await trackMetaEvent(
      MetaEvents.PageView,
      { content_name: document.title },
      getLoggedInUserData()
    );
  };

  // ─────────────────────────────────────────
  // VIEW CONTENT
  // ─────────────────────────────────────────

  const trackViewContent = async (params: {
    contentId: string;
    contentName: string;
    contentCategory?: string;
    contentType?: string;
    value?: number;
    currency?: string;
  }) => {
    if (!META_PIXEL_ID) return;

    await trackMetaEvent(
      MetaEvents.ViewContent,
      {
        content_ids: [params.contentId],
        content_name: params.contentName,
        content_category: params.contentCategory,
        content_type: params.contentType || 'product',
        value: params.value,
        currency: params.currency || DEFAULT_CURRENCY,
      },
      getLoggedInUserData()
    );
  };

  // ─────────────────────────────────────────
  // ADD TO CART
  // ─────────────────────────────────────────

  const trackAddToCart = async (params: {
    contentId: string;
    contentName: string;
    value: number;
    quantity?: number;
    currency?: string;
  }) => {
    if (!META_PIXEL_ID) return;

    await trackMetaEvent(
      MetaEvents.AddToCart,
      {
        content_ids: [params.contentId],
        content_name: params.contentName,
        content_type: 'product',
        value: params.value,
        currency: params.currency || DEFAULT_CURRENCY,
        contents: [{
          id: params.contentId,
          quantity: params.quantity || 1,
          item_price: params.value,
        }],
      },
      getLoggedInUserData()
    );
  };

  // ─────────────────────────────────────────
  // VIEW CART (custom)
  // ─────────────────────────────────────────

  const trackViewCart = async (params: {
    contentIds: string[];
    value: number;
    numItems: number;
    currency?: string;
    contents: Array<{ id: string; quantity: number; item_price: number }>;
  }) => {
    if (!META_PIXEL_ID) return;

    await trackMetaEvent(
      MetaEvents.ViewCart,
      {
        content_ids: params.contentIds,
        content_type: 'product',
        value: params.value,
        currency: params.currency || DEFAULT_CURRENCY,
        num_items: params.numItems,
        contents: params.contents,
      },
      getLoggedInUserData()
    );
  };

  // ─────────────────────────────────────────
  // INITIATE CHECKOUT
  // ─────────────────────────────────────────

  const trackInitiateCheckout = async (params: {
    contentIds: string[];
    value: number;
    numItems: number;
    currency?: string;
    contents?: Array<{ id: string; quantity: number; item_price: number }>;
  }) => {
    if (!META_PIXEL_ID) return;

    await trackMetaEvent(
      MetaEvents.InitiateCheckout,
      {
        content_ids: params.contentIds,
        content_type: 'product',
        value: params.value,
        currency: params.currency || DEFAULT_CURRENCY,
        num_items: params.numItems,
        ...(params.contents ? { contents: params.contents } : {}),
      },
      getLoggedInUserData()
    );
  };

  // ─────────────────────────────────────────
  // ADD PAYMENT INFO
  // ─────────────────────────────────────────

  const trackAddPaymentInfo = async (params: {
    contentIds: string[];
    value: number;
    currency?: string;
    paymentMethod: string;
    contents?: Array<{ id: string; quantity: number; item_price: number }>;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    zip?: string;
    country?: string;
  }) => {
    if (!META_PIXEL_ID) return;

    await trackMetaEvent(
      MetaEvents.AddPaymentInfo,
      {
        content_ids: params.contentIds,
        content_type: 'product',
        value: params.value,
        currency: params.currency || DEFAULT_CURRENCY,
        payment_method: params.paymentMethod,
        ...(params.contents ? { contents: params.contents } : {}),
      },
      {
        email: params.email || user?.email,
        phone: params.phone,
        firstName: params.firstName,
        lastName: params.lastName,
        city: params.city,
        zip: params.zip,
        country: params.country || 'CZ',
        externalId: user?.id,
      }
    );
  };

  // ─────────────────────────────────────────
  // PURCHASE
  // ─────────────────────────────────────────

  const trackPurchase = async (params: {
    contentIds: string[];
    value: number;
    numItems: number;
    currency?: string;
    contents: Array<{
      id: string;
      quantity: number;
      item_price: number;
    }>;
    orderId?: string;
    paymentMethod?: string;
    shippingMethod?: string;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    zip?: string;
    country?: string;
  }) => {
    if (!META_PIXEL_ID) return;

    await trackMetaEvent(
      MetaEvents.Purchase,
      {
        content_ids: params.contentIds,
        content_type: 'product',
        value: params.value,
        currency: params.currency || DEFAULT_CURRENCY,
        num_items: params.numItems,
        contents: params.contents,
        order_id: params.orderId,
        payment_method: params.paymentMethod,
        shipping_method: params.shippingMethod,
      },
      {
        email: params.email || user?.email,
        phone: params.phone,
        firstName: params.firstName,
        lastName: params.lastName,
        city: params.city,
        zip: params.zip,
        country: params.country || 'CZ',
        externalId: user?.id,
      }
    );
  };

  // ─────────────────────────────────────────
  // COMPLETE REGISTRATION
  // ─────────────────────────────────────────

  const trackCompleteRegistration = async (params?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    registrationMethod?: string;
  }) => {
    if (!META_PIXEL_ID) return;

    await trackMetaEvent(
      MetaEvents.CompleteRegistration,
      {
        content_name: 'registration',
        currency: DEFAULT_CURRENCY,
        value: 0,
        registration_method: params?.registrationMethod || 'email',
      },
      {
        email: params?.email || user?.email,
        firstName: params?.firstName,
        lastName: params?.lastName,
        externalId: user?.id,
      }
    );
  };

  // ─────────────────────────────────────────
  // LEAD
  // ─────────────────────────────────────────

  const trackLead = async (params?: {
    email?: string;
    phone?: string;
    contentName?: string;
  }) => {
    if (!META_PIXEL_ID) return;

    await trackMetaEvent(
      MetaEvents.Lead,
      {
        content_name: params?.contentName || 'lead',
        currency: DEFAULT_CURRENCY,
        value: 0,
      },
      {
        email: params?.email || user?.email,
        phone: params?.phone,
        externalId: user?.id,
      }
    );
  };

  // ─────────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────────

  const trackSearch = async (searchQuery: string) => {
    if (!META_PIXEL_ID) return;

    await trackMetaEvent(
      MetaEvents.Search,
      {
        search_string: searchQuery,
        content_category: 'product_search',
        content_name: searchQuery,
      },
      getLoggedInUserData()
    );
  };

  // ─────────────────────────────────────────
  // SCROLL DEPTH (custom)
  // ─────────────────────────────────────────

  const trackScrollDepth = async (depth: number) => {
    if (!META_PIXEL_ID) return;

    await trackMetaEvent(
      MetaEvents.ScrollDepth,
      {
        scroll_depth: depth,
        content_name: document.title,
      },
      getLoggedInUserData()
    );
  };

  // ─────────────────────────────────────────
  // TIME ON PAGE (custom)
  // ─────────────────────────────────────────

  const trackTimeOnPage = async (seconds: number) => {
    if (!META_PIXEL_ID) return;

    await trackMetaEvent(
      MetaEvents.TimeOnPage,
      {
        time_on_page: seconds,
        content_name: document.title,
      },
      getLoggedInUserData()
    );
  };

  return {
    trackPageView,
    trackViewContent,
    trackAddToCart,
    trackViewCart,
    trackInitiateCheckout,
    trackAddPaymentInfo,
    trackPurchase,
    trackCompleteRegistration,
    trackLead,
    trackSearch,
    trackScrollDepth,
    trackTimeOnPage,
  };
}

// ─────────────────────────────────────────
// SCROLL DEPTH HOOK
// Fires at 25%, 50%, 75%, 90% thresholds — once per session per page.
// ─────────────────────────────────────────

export function useScrollDepthTracking() {
  const { trackScrollDepth } = useMetaTracking();
  const firedThresholds = useRef<Set<number>>(new Set());

  useEffect(() => {
    const thresholds = [25, 50, 75, 90];

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      for (const threshold of thresholds) {
        if (scrollPercent >= threshold && !firedThresholds.current.has(threshold)) {
          firedThresholds.current.add(threshold);
          trackScrollDepth(threshold);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

// ─────────────────────────────────────────
// TIME ON PAGE HOOK
// Fires at 30s, 60s, 120s milestones.
// ─────────────────────────────────────────

export function useTimeOnPageTracking() {
  const { trackTimeOnPage } = useMetaTracking();
  const firedMilestones = useRef<Set<number>>(new Set());
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    const milestones = [30, 60, 120];

    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTime.current) / 1000);

      for (const milestone of milestones) {
        if (seconds >= milestone && !firedMilestones.current.has(milestone)) {
          firedMilestones.current.add(milestone);
          trackTimeOnPage(milestone);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);
}
