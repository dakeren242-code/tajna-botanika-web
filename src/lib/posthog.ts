// PostHog Analytics — Tajná Botanika
// Proper analytics: funnels, retention, session recording, feature flags
// Setup: Create account at posthog.com → get API key → add VITE_POSTHOG_KEY to .env

import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || '';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.posthog.com';

let initialized = false;

export function initPostHog() {
  if (initialized || !POSTHOG_KEY) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: false, // we handle manually
    capture_pageleave: true,
    session_recording: {
      maskAllInputs: true,      // GDPR: mask form inputs
      maskInputOptions: { password: true, email: true },
    },
    autocapture: false,         // manual events only — cleaner data
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.opt_out_capturing(); // no tracking in dev
    },
  });

  initialized = true;
}

export function phIdentify(userId: string, email?: string, name?: string) {
  if (!initialized) return;
  posthog.identify(userId, {
    email,
    name,
    project: 'tajna-botanika',
  });
}

export function phTrack(event: string, properties?: Record<string, any>) {
  if (!initialized) return;
  posthog.capture(event, properties);
}

export function phPage(path: string) {
  if (!initialized) return;
  posthog.capture('$pageview', { $current_url: path });
}

export function phReset() {
  if (!initialized) return;
  posthog.reset();
}

// Key events to track:
// phTrack('product_viewed', { product: 'gelato', variant: '5g' })
// phTrack('add_to_cart', { product, value })
// phTrack('checkout_started', { value, items })
// phTrack('order_completed', { value, order_id, payment_method })
// phTrack('support_chat_opened')
// phTrack('discount_applied', { code })
