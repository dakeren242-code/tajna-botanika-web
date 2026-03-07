import { v4 as uuidv4 } from 'uuid';

/**
 * =========================
 * ENV VARIABLES REQUIRED
 * =========================
 * VITE_META_PIXEL_ID
 * VITE_SUPABASE_URL
 * VITE_META_CAPI_KEY     ← your INTERNAL_API_KEY
 */

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

export interface MetaEventData {
  event_name: string;
  event_id: string;
  event_time: number;
  event_source_url: string;
  action_source: 'website';
  user_data: {
    em?: string[];
    ph?: string[];
    fn?: string;
    ln?: string;
    ct?: string;
    st?: string;
    zp?: string;
    country?: string;
    external_id?: string;
    fbp?: string;
    fbc?: string;
    client_ip_address?: string;
    client_user_agent?: string;
  };
  custom_data?: {
    currency?: string;
    value?: number;
    content_ids?: string[];
    content_type?: string;
    content_name?: string;
    content_category?: string;
    contents?: Array<{
      id: string;
      quantity: number;
      item_price: number;
    }>;
    num_items?: number;
    order_id?: string;
    payment_method?: string;
    shipping_method?: string;
    session_id?: string;
    scroll_depth?: number;
    time_on_page?: number;
    search_string?: string;
    registration_method?: string;
    [key: string]: unknown;
  };
}

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────

export const MetaEvents = {
  PageView: 'PageView',
  ViewContent: 'ViewContent',
  AddToCart: 'AddToCart',
  InitiateCheckout: 'InitiateCheckout',
  AddPaymentInfo: 'AddPaymentInfo',
  Purchase: 'Purchase',
  Lead: 'Lead',
  CompleteRegistration: 'CompleteRegistration',
  Search: 'Search',
  // Custom events
  ViewCart: 'ViewCart',
  ScrollDepth: 'ScrollDepth',
  TimeOnPage: 'TimeOnPage',
} as const;

export const DEFAULT_CURRENCY = 'CZK';

// ─────────────────────────────────────────
// SESSION ID
// ─────────────────────────────────────────

function getSessionId(): string {
  const key = '_meta_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = uuidv4();
    sessionStorage.setItem(key, id);
  }
  return id;
}

// ─────────────────────────────────────────
// ANONYMOUS EXTERNAL ID
// Perzistentní UUID pro anonymní uživatele — uloženo v localStorage.
// Zajišťuje konzistentní external_id přes všechny eventy i relace.
// ─────────────────────────────────────────

export function getAnonymousId(): string {
  const key = '_meta_anon_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(key, id);
  }
  return id;
}

// ─────────────────────────────────────────
// HASHING
// ─────────────────────────────────────────

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function isHashed(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}

export async function sha256(value: string): Promise<string> {
  if (isHashed(value)) return value;

  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    throw new Error('crypto.subtle is not available — cannot hash PII safely');
  }

  const encoded = new TextEncoder().encode(normalize(value));
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─────────────────────────────────────────
// COOKIE HELPERS
// ─────────────────────────────────────────

const FBC_COOKIE = '_fbc';
const FBC_BACKUP_KEY = '_meta_fbc_backup';
const FBC_MAX_AGE = 60 * 60 * 24 * 90; // 90 dní

function setFbcCookie(value: string): void {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${FBC_COOKIE}=${value}; path=/; max-age=${FBC_MAX_AGE}; SameSite=Lax${secure}`;
}

function readFbcCookie(): string | undefined {
  const match = document.cookie.match(/(?:^|;)\s*_fbc=([^;]+)/);
  return match ? match[1] : undefined;
}

function saveFbcBackup(value: string): void {
  try { localStorage.setItem(FBC_BACKUP_KEY, value); } catch {}
}

function readFbcBackup(): string | undefined {
  try { return localStorage.getItem(FBC_BACKUP_KEY) || undefined; } catch { return undefined; }
}

/**
 * Inicializace fbc persistence — volat při každé změně URL (route change + hard load).
 * 1. Pokud URL obsahuje fbclid → vytvoří cookie _fbc + zálohu v localStorage.
 * 2. Pokud cookie chybí, ale záloha existuje → obnoví cookie z localStorage.
 * Tím fbc přežije jakýkoli redirect (platební brána, SPA navigation, page refresh).
 */
export function initFbcPersistence(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const fbclid = new URLSearchParams(window.location.search).get('fbclid');

  if (fbclid) {
    const fbc = `fb.1.${Date.now()}.${fbclid}`;
    setFbcCookie(fbc);
    saveFbcBackup(fbc);
    return;
  }

  // Cookie chybí, ale záloha existuje → obnov
  const cookie = readFbcCookie();
  if (!cookie) {
    const backup = readFbcBackup();
    if (backup) {
      setFbcCookie(backup);
    }
  }
}

export function getFbp(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(?:^|;)\s*_fbp=([^;]+)/);
  return match ? match[1] : undefined;
}

export function getFbc(): string | undefined {
  if (typeof document === 'undefined') return undefined;

  // 1. Cookie _fbc (primární, nastavuje Meta Pixel i my)
  const cookie = readFbcCookie();
  if (cookie) return cookie;

  // 2. Záloha z localStorage (přežije redirect bez fbclid v URL)
  const backup = readFbcBackup();
  if (backup) {
    // Obnov cookie pro případ, že mezitím expirovala
    setFbcCookie(backup);
    return backup;
  }

  return undefined;
}

// ─────────────────────────────────────────
// EVENT ID
// ─────────────────────────────────────────

export function generateEventId(): string {
  return uuidv4();
}

// ─────────────────────────────────────────
// USER DATA PREPARATION
// ─────────────────────────────────────────

export async function prepareUserData(userData?: {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  externalId?: string;
}): Promise<MetaEventData['user_data']> {
  const fbcValue = getFbc();
  const user_data: MetaEventData['user_data'] = {
    fbp: getFbp(),
    ...(fbcValue ? { fbc: fbcValue } : {}),
    client_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  };

  // Vždy posílat external_id — buď user.id nebo perzistentní anonymous_id
  const effectiveExternalId = userData?.externalId || getAnonymousId();
  user_data.external_id = await sha256(normalize(effectiveExternalId));

  if (!userData) return user_data;

  try {
    if (userData.email) {
      user_data.em = [await sha256(normalize(userData.email))];
    }

    if (userData.phone) {
      user_data.ph = [await sha256(userData.phone.replace(/\D/g, ''))];
    }

    if (userData.firstName) {
      user_data.fn = await sha256(normalize(userData.firstName));
    }

    if (userData.lastName) {
      user_data.ln = await sha256(normalize(userData.lastName));
    }

    if (userData.city) {
      user_data.ct = await sha256(normalize(userData.city));
    }

    if (userData.state) {
      user_data.st = await sha256(normalize(userData.state));
    }

    if (userData.zip) {
      user_data.zp = await sha256(userData.zip.replace(/\s/g, ''));
    }

    if (userData.country) {
      user_data.country = await sha256(normalize(userData.country));
    }

  } catch (error) {
    console.error('Failed to hash user data:', error);
  }

  return user_data;
}

// ─────────────────────────────────────────
// PIXEL LOADER (internal)
// ─────────────────────────────────────────

function loadPixelScript(): void {
  if ((window as any).fbq) return;

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
}

// ─────────────────────────────────────────
// PIXEL INIT (basic — no user data)
// ─────────────────────────────────────────

export function initMetaPixel(pixelId: string): void {
  if (typeof window === 'undefined') return;

  if (!pixelId) {
    if (import.meta.env.DEV) {
      console.error(
        '[Meta Pixel] CHYBA: VITE_META_PIXEL_ID není nastaveno. ' +
        'Pixel nebude inicializován a žádné eventy se nebudou odesílat. ' +
        'Nastav VITE_META_PIXEL_ID=1323004113206297 v .env souboru.'
      );
    }
    return;
  }

  if ((window as any)._fbqInitialized) return;

  loadPixelScript();
  (window as any).fbq('init', pixelId);
  (window as any)._fbqInitialized = true;

  if (import.meta.env.DEV) {
    console.log('[Meta Pixel] Inicializován bez advanced matching');
  }
}

// ─────────────────────────────────────────
// PIXEL INIT WITH ADVANCED MATCHING
// Volej jakmile máš k dispozici uživatelská data (login, checkout, registrace).
// Přereinicializuje pixel s hashovnými PII pro vyšší EMQ skóre.
// ─────────────────────────────────────────

export async function initMetaPixelWithAdvancedMatching(
  pixelId: string,
  userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    zip?: string;
    country?: string;
    externalId?: string;
    state?: string;
  }
): Promise<void> {
  if (typeof window === 'undefined' || !pixelId) return;

  loadPixelScript();

  const advancedMatching: Record<string, string> = {};

  try {
    if (userData.email) {
      advancedMatching.em = await sha256(normalize(userData.email));
    }
    if (userData.phone) {
      advancedMatching.ph = await sha256(userData.phone.replace(/\D/g, ''));
    }
    if (userData.firstName) {
      advancedMatching.fn = await sha256(normalize(userData.firstName));
    }
    if (userData.lastName) {
      advancedMatching.ln = await sha256(normalize(userData.lastName));
    }
    if (userData.city) {
      advancedMatching.ct = await sha256(normalize(userData.city));
    }
    if (userData.zip) {
      advancedMatching.zp = await sha256(userData.zip.replace(/\s/g, ''));
    }
    if (userData.country) {
      advancedMatching.country = await sha256(normalize(userData.country));
    }
    if (userData.state) {
      advancedMatching.st = await sha256(normalize(userData.state));
    }
    if (userData.externalId) {
      advancedMatching.external_id = await sha256(normalize(userData.externalId));
    }
  } catch (error) {
    console.error('[Meta Pixel] Advanced matching hashing failed:', error);
    return;
  }

  (window as any).fbq('init', pixelId, advancedMatching);
  (window as any)._fbqInitialized = true;

  if (import.meta.env.DEV) {
    console.log('[Meta Pixel] Reinicializován s advanced matching. Parametry:', Object.keys(advancedMatching));
  }
}

// ─────────────────────────────────────────
// TRACK EVENT (core)
// ─────────────────────────────────────────

export async function trackMetaEvent(
  eventName: string,
  customData?: MetaEventData['custom_data'],
  userData?: Parameters<typeof prepareUserData>[0]
): Promise<string> {
  const eventId = generateEventId();
  
  const isStandardEvent = Object.values(MetaEvents).includes(eventName as any) &&
    !['ViewCart', 'ScrollDepth', 'TimeOnPage'].includes(eventName);

  const enrichedCustomData: MetaEventData['custom_data'] = {
    ...customData,
    session_id: getSessionId(),
  };

  // 1. Fire browser Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    if (isStandardEvent) {
      (window as any).fbq('track', eventName, enrichedCustomData, { eventID: eventId });
    } else {
      (window as any).fbq('trackCustom', eventName, enrichedCustomData, { eventID: eventId });
    }
  }

  // The CAPI (server-side) event has been removed to prevent duplication.
  // We'll address server-side tracking separately.
  
  if (import.meta.env.DEV) {
    console.log('[Meta Pixel] Event fired:', { eventName, eventId, customData });
  }

  return eventId;
}
