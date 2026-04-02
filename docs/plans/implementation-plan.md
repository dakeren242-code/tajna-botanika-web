# Tajna Botanika — Implementation Plan

## Overview

Five tasks to complete, in dependency order:

1. Connect Supabase + populate 9 products
2. Set up Meta Pixel (client-side)
3. Configure Conversion API for EMQ 7+
4. GDPR cookie consent banner
5. Meta product catalog (URLs fix — last)

---

## Task 1: Connect Supabase + Populate 9 Products

### Current State
- New Supabase project: `https://qgwdvktfoscmscjzdrbe.supabase.co`
- `.env` has URL + publishable key
- Database is **empty** — no tables exist
- Old project had 8 products (missing 1 to reach 9)
- 44 migration files exist in `supabase/migrations/`

### Step 1.1: Create Database Schema

Run migrations against the new Supabase project. Two options:

**Option A — Supabase CLI (preferred):**
```bash
supabase link --project-ref qgwdvktfoscmscjzdrbe
supabase db push
```

**Option B — Manual SQL via Dashboard:**
Execute the key migration files in order via Supabase SQL Editor:
1. `20260326082210_setup_complete_schema_v2.sql` — creates all core tables (products, orders, order_items, cart_items, payment_methods, shipping_methods, payment_transactions, email_subscribers, admin_users, product_variants)
2. `20260326184412_add_missing_product_columns.sql` — adds thc_percent, cbd_percent, cbg_percent, thc_x_percent, flavor_profile, gram_options columns
3. `20260129101902_create_ecommerce_schema_fixed.sql` — user_profiles, addresses
4. `20260201180639_create_live_chat_system.sql` — chat tables (if needed)

### Step 1.2: Insert 9 Products

The existing products from the old database were hemp/CBD flower products. Insert 9 products with all required fields:

**Required fields per product:**
- `name` (text) — product name
- `description` (text) — product description
- `price` (decimal) — base price per gram (190 CZK standard)
- `stock` (integer) — stock count
- `category` (text) — e.g., 'flower'
- `image_url` (text) — product image
- `thc_percent`, `cbd_percent`, `cbg_percent`, `thc_x_percent` (numeric) — cannabinoid profiles
- `effects` (text[]) — array of effects like 'relaxation', 'focus', 'energy'
- `flavor_profile` (text) — flavor description
- `featured` (boolean) — show on homepage
- `gram_options` (integer[]) — default `{1,3,5,10}`
- `color_accent`, `glow_color` (text) — UI styling colors
- `is_popular` (boolean) — shows badge

**9 Products to insert** (matching old DB + 1 new):
1. Golden Nugget
2. Amnesia
3. Pineapple Zkittlez
4. Gelato
5. Lemon Cherry Gelato
6. Bubble Gum
7. Forbidden Fruit
8. Wedding Cake
9. **(NEW — 9th product TBD)** — confirm name/details with client

### Step 1.3: Seed Payment & Shipping Methods

Insert into `payment_methods`:
- `bank_transfer` (enabled: true)
- `card` (enabled: false — Mollie not implemented)
- `cash_on_delivery` (enabled: true)

Insert into `shipping_methods`:
- `zasilkovna` — 79 CZK
- `personal_pickup` — 0 CZK
- `personal_invoice` — 0 CZK

### Step 1.4: Verify Connection

- Run the app locally (`npm run dev`)
- Confirm products load on homepage
- Confirm product detail pages work
- Confirm cart add/remove works

### Acceptance Criteria
- [ ] All tables created in new Supabase project
- [ ] 9 products visible on the website
- [ ] Payment and shipping methods seeded
- [ ] Cart functionality works end-to-end

---

## Task 2: Set Up Meta Pixel (Client-Side)

### Current State
- `VITE_FB_PIXEL_ID=1256545223325119` is in `.env`
- Pixel initialization code exists in `src/hooks/useTracking.ts`
- `useTracking()` is called in `App.tsx`
- Events tracked: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase, Search, Lead

### Step 2.1: Verify Pixel Fires

- Run the app locally
- Open browser DevTools → Network tab
- Filter for `facebook.net` requests
- Confirm `fbevents.js` loads
- Confirm `PageView` event fires on page load

### Step 2.2: Verify Event Tracking

Test each event:

| Event | How to trigger | What to check |
|-------|---------------|---------------|
| PageView | Load any page | Auto-fires on init |
| ViewContent | Open a product detail page | content_ids, content_name, value |
| AddToCart | Click "Add to Cart" | content_ids, value, quantity |
| InitiateCheckout | Go to checkout page | value, num_items, contents |
| Purchase | Complete an order | transaction_id, value, contents |

### Step 2.3: Test with Meta Pixel Helper

- Install [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/) Chrome extension
- Browse the site and verify all events appear green (no errors)

### Acceptance Criteria
- [ ] Pixel loads on every page
- [ ] All 5 core events fire correctly
- [ ] No duplicate events (5s dedup working)
- [ ] Meta Pixel Helper shows no errors

---

## Task 3: Configure Conversion API for EMQ 7+

### Current State
- Edge function exists at `supabase/functions/facebook-capi/index.ts`
- Currently sends: `client_ip_address`, `client_user_agent`, `fbp`, `fbc`
- **Estimated current EMQ score: 3-4** (only IP + UA + cookies)
- Missing: hashed email, phone, name, city, zip, country, external_id

### EMQ Scoring Reference

Each matched parameter adds to the score:
| Parameter | EMQ Points | Status |
|-----------|-----------|--------|
| `client_ip_address` | +1 | Done |
| `client_user_agent` | +1 | Done |
| `fbp` (pixel cookie) | +1 | Done |
| `fbc` (click cookie) | +0.5 | Done |
| `em` (hashed email) | +1 | **Missing** |
| `ph` (hashed phone) | +1 | **Missing** |
| `fn` (hashed first name) | +0.5 | **Missing** |
| `ln` (hashed last name) | +0.5 | **Missing** |
| `external_id` | +0.5 | **Missing** |
| `ct` (hashed city) | +0.25 | **Missing** |
| `zp` (hashed zip) | +0.25 | **Missing** |
| `country` (hashed) | +0.25 | **Missing** |

**Target: 7+** requires adding em, ph, fn, ln, external_id, and address fields.

### Step 3.1: Update Client-Side Tracking (`src/hooks/useTracking.ts`)

Modify `sendToFacebookCAPI()` to accept and pass user data:

```typescript
// Add to TrackingEvent interface:
user_email?: string;
user_phone?: string;
user_first_name?: string;
user_last_name?: string;
user_city?: string;
user_zip?: string;
user_country?: string;
user_id?: string;
```

Update `sendToFacebookCAPI()` payload:
```typescript
user_data: {
  fbp: getCookie('_fbp'),
  fbc: getCookie('_fbc'),
  em: data?.user_email,        // plain text — hashed server-side
  ph: data?.user_phone,
  fn: data?.user_first_name,
  ln: data?.user_last_name,
  ct: data?.user_city,
  zp: data?.user_zip,
  country: data?.user_country,
  external_id: data?.user_id,
},
```

### Step 3.2: Pass User Data from Checkout (`src/pages/Checkout.tsx`)

The checkout already collects: `firstName`, `lastName`, `email`, `phone`, `city`, `zip`.

Update the `trackEvent('Purchase', ...)` call to include user data:
```typescript
trackEvent('Purchase', {
  transaction_id: order.id,
  value: finalTotal,
  currency: 'CZK',
  contents: items.map(item => ({ id: item.product.id, quantity: item.quantity })),
  // ADD these fields:
  user_email: customerData.email,
  user_phone: customerData.phone,
  user_first_name: customerData.firstName,
  user_last_name: customerData.lastName,
  user_city: customerData.city,
  user_zip: customerData.zip,
  user_country: 'cz',
  user_id: user?.id,
});
```

Also update `trackEvent('InitiateCheckout', ...)` similarly when customer data is available.

### Step 3.3: Pass User Data from Auth Context

For logged-in users, enrich all events with user data. Update `trackEvent()` to auto-attach user info when available:

```typescript
// In useTracking.ts, import and use auth context
// Or accept a getUserData callback that components can set
```

Option: Create a `setTrackingUserData()` function that components call when user logs in or enters checkout info. This data persists in memory and is auto-attached to all subsequent CAPI calls.

### Step 3.4: Upgrade Edge Function — Server-Side Hashing

**File:** `supabase/functions/facebook-capi/index.ts`

Facebook requires SHA-256 hashing of all PII. Update the edge function:

```typescript
// Add hashing function using Deno's built-in crypto
async function hashValue(value: string): Promise<string> {
  const normalized = value.trim().toLowerCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

Update the event builder to hash all PII fields:
```typescript
const fbEvent: FacebookEvent = {
  event_name,
  event_time: eventTime,
  event_source_url,
  action_source: 'website',
  user_data: {
    client_ip_address: req.headers.get('x-forwarded-for') || undefined,
    client_user_agent: req.headers.get('user-agent') || undefined,
    fbp: user_data?.fbp,
    fbc: user_data?.fbc,
    // Hash all PII server-side:
    em: user_data?.em ? [await hashValue(user_data.em)] : undefined,
    ph: user_data?.ph ? [await hashValue(user_data.ph)] : undefined,
    fn: user_data?.fn ? [await hashValue(user_data.fn)] : undefined,
    ln: user_data?.ln ? [await hashValue(user_data.ln)] : undefined,
    ct: user_data?.ct ? [await hashValue(user_data.ct)] : undefined,
    zp: user_data?.zp ? [await hashValue(user_data.zp)] : undefined,
    country: user_data?.country ? [await hashValue(user_data.country)] : undefined,
    external_id: user_data?.external_id ? [await hashValue(user_data.external_id)] : undefined,
  },
  custom_data: custom_data || {},
};
```

### Step 3.5: Add Event Deduplication ID

Add `event_id` to both client pixel and server CAPI to prevent Meta from double-counting:

```typescript
// In useTracking.ts — generate unique event_id
const eventId = `${eventName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Send same eventId to both pixel and CAPI
window.fbq('track', eventName, data, { eventID: eventId });
sendToFacebookCAPI(eventName, data, eventId);
```

```typescript
// In edge function — include event_id in payload
const fbEvent = {
  event_name,
  event_time: eventTime,
  event_id: eventId,  // ADD THIS
  // ...rest
};
```

### Step 3.6: Deploy Edge Function Secrets

```bash
supabase secrets set FACEBOOK_PIXEL_ID=1256545223325119
supabase secrets set FACEBOOK_ACCESS_TOKEN=EAAucZAkCCUj4BRJlcICZCfn6HRD8AVSi6BJ4s8ouyJzOTwRtQeZAgfOvL9Ai3NoSkzMtqdkGevv1nl4GnEwfJeqaBLLLBN3TOEhMf60HrkdrFme2iIjCKiIFP0WNk2sTqjLYCsPcU02eZAoEDgjuvXXmMeESy8xxw4uZAtUZCQHkprc8kByfW3TBZBNwH6nqwZDZD
supabase secrets set FACEBOOK_CATALOG_ID=1574574398001610
```

### Step 3.7: Deploy & Verify

```bash
supabase functions deploy facebook-capi
```

Verify in Meta Events Manager:
- Go to **Test Events** tab
- Browse the site, add to cart, complete a test purchase
- Check that server events appear with matched parameters
- Verify **Event Match Quality** score shows 7+

### Acceptance Criteria
- [ ] CAPI sends hashed em, ph, fn, ln, ct, zp, country, external_id
- [ ] Event deduplication IDs match between pixel and CAPI
- [ ] EMQ score is 7+ in Meta Events Manager
- [ ] All user data is hashed SHA-256 server-side (never sent in plain text to Meta)
- [ ] Edge function secrets are deployed

---

## Task 4: GDPR Cookie Consent Banner

### Current State
- No consent mechanism exists
- Pixels fire immediately on page load (non-compliant in EU/Czech Republic)
- Czech Republic follows EU GDPR — requires opt-in consent for tracking cookies

### Step 4.1: Create Consent Context (`src/contexts/ConsentContext.tsx`)

Manage consent state across the app:

```typescript
interface ConsentState {
  necessary: boolean;    // Always true (session, cart)
  analytics: boolean;    // Google Analytics
  marketing: boolean;    // Facebook Pixel, TikTok, CAPI
}

// Default: all false except necessary
// Persist to localStorage key: 'cookie_consent'
// Provide: consentState, updateConsent(), hasConsented (boolean)
```

### Step 4.2: Create Cookie Banner Component (`src/components/CookieBanner.tsx`)

A bottom-fixed banner with:
- Brief text explaining cookie usage (in Czech)
- Three buttons:
  - **"Přijmout vše"** (Accept all) — enables all categories
  - **"Pouze nezbytné"** (Necessary only) — rejects analytics + marketing
  - **"Nastavení"** (Settings) — opens detail panel to toggle categories
- Detail panel shows:
  - Nezbytné (Necessary) — always on, non-toggleable
  - Analytické (Analytics) — toggle for GA
  - Marketingové (Marketing) — toggle for FB Pixel, TikTok, CAPI
- Banner disappears after choice, shows again only if consent not stored
- Small "Cookie settings" link in Footer to re-open preferences

### Step 4.3: Gate Pixel Loading on Consent

Modify `src/hooks/useTracking.ts`:

```typescript
export function initializeTracking(consent: ConsentState) {
  // Only load FB Pixel if marketing consent given
  if (consent.marketing && fbPixelId && !window.fbq) {
    // ... load pixel
  }

  // Only load GA if analytics consent given
  if (consent.analytics && gaId && !window.gtag) {
    // ... load GA
  }

  // Only load TikTok if marketing consent given
  if (consent.marketing && tiktokPixelId && !window.ttq) {
    // ... load TikTok
  }
}

export function trackEvent(eventName: string, data?: TrackingEvent) {
  // Check consent before each event
  const consent = getConsentState();

  if (consent.marketing && window.fbq) {
    window.fbq('track', eventName, data);
  }

  if (consent.analytics && window.gtag) {
    window.gtag('event', eventName, data);
  }

  if (consent.marketing && window.ttq) {
    window.ttq.track(eventName, data);
  }

  // Only send CAPI if marketing consent
  if (consent.marketing && import.meta.env.VITE_FB_PIXEL_ID) {
    sendToFacebookCAPI(eventName, data);
  }
}
```

### Step 4.4: Integrate in App.tsx

```typescript
// Wrap app with ConsentProvider
<ConsentProvider>
  <AuthProvider>
    <CartProvider>
      {/* ... */}
      <CookieBanner />
    </CartProvider>
  </AuthProvider>
</ConsentProvider>
```

### Step 4.5: Styling

- Semi-transparent dark background matching site theme
- Emerald/teal accent buttons matching brand
- Fixed to bottom of viewport
- Mobile responsive
- Z-index above all content but below modals
- Smooth slide-up animation

### Acceptance Criteria
- [ ] Banner appears on first visit
- [ ] No tracking pixels load until consent is given
- [ ] "Accept all" enables all tracking
- [ ] "Necessary only" blocks all tracking pixels
- [ ] Preference persists in localStorage across sessions
- [ ] Footer link allows changing preferences
- [ ] Banner does not appear once choice is saved
- [ ] Banner text is in Czech

---

## Task 5: Meta Product Catalog (URLs Fix)

### Current State
- Catalog ID: `1574574398001610`
- Sync code exists in `supabase/functions/facebook-catalog-sync/index.ts`
- Admin UI exists in `src/components/admin/FacebookCatalogManager.tsx`
- Product URLs use format: `${SITE_URL}/products/${product.id}`
- Site is not fully live yet — URLs return 404

### Step 5.1: Set Edge Function Secrets

```bash
supabase secrets set FACEBOOK_CATALOG_ID=1574574398001610
supabase secrets set SITE_URL=https://your-production-domain.com
```

### Step 5.2: Verify Product URL Route

Current route is `/product/:slug` (singular) but catalog sync uses `/products/${product.id}` (plural + UUID).

**Fix:** Update catalog sync to match actual route:
```typescript
// In facebook-catalog-sync/index.ts, change:
url: `${SITE_URL}/products/${product.id}`
// To:
url: `${SITE_URL}/product/${product.id}`
```

Or better, use a slug-based URL if products have slugs.

### Step 5.3: Deploy When Site Goes Live

1. Set `SITE_URL` to the production domain
2. Deploy the edge function: `supabase functions deploy facebook-catalog-sync`
3. Go to Admin Dashboard → Facebook Catalog tab
4. Click "Sync Products" to push all 9 products
5. Verify in Meta Commerce Manager that products appear with working URLs

### Step 5.4: Verify in Commerce Manager

- Products have correct names, prices (CZK), images
- Product URLs open correctly
- Availability status matches stock
- No rejected items

### Acceptance Criteria
- [ ] All 9 products synced to Meta catalog
- [ ] Product URLs resolve to correct pages
- [ ] Prices display correctly in CZK
- [ ] Images load properly
- [ ] No rejected items in Commerce Manager

---

## Task 6: Update `.bolt/prompt` for Bolt.new Compatibility

### Current State
- Project uses Bolt.new for development (`.bolt/config.json` template: `bolt-vite-react-ts`)
- Current `.bolt/prompt` only has basic styling instructions
- Bolt.new has no awareness of GDPR consent, CAPI, tracking gating, or edge functions
- Risk: Bolt could break consent gating, re-add ungated pixel calls, or modify tracking without understanding the architecture

### Step 6.1: Update `.bolt/prompt`

Add the following context to `.bolt/prompt` so Bolt understands the new systems:

```
## Tracking & GDPR Consent

This project has a GDPR cookie consent system. All tracking pixels (Facebook, Google Analytics, TikTok) are gated behind user consent via ConsentContext.

CRITICAL RULES:
- NEVER load or fire tracking pixels without checking consent state first
- NEVER call window.fbq, window.gtag, or window.ttq directly — always use trackEvent() from src/hooks/useTracking.ts
- The useTracking hook checks ConsentContext before firing any event
- Facebook Conversion API (CAPI) is sent server-side via Supabase edge function (supabase/functions/facebook-capi/) — do not bypass this

## Supabase Edge Functions

Three edge functions exist in supabase/functions/:
- facebook-capi — server-side Facebook event tracking with SHA-256 hashed PII
- facebook-catalog-sync — syncs products to Facebook Commerce catalog
- pays-webhook — payment gateway webhook with HMAC-MD5 verification

Do not modify edge functions unless explicitly asked.

## Cookie Consent Components
- src/contexts/ConsentContext.tsx — manages consent state (necessary/analytics/marketing)
- src/components/CookieBanner.tsx — GDPR banner UI
- Consent is persisted in localStorage key 'cookie_consent'
- Footer contains a link to re-open cookie preferences
```

### Step 6.2: Verify Bolt Picks Up Changes

After pushing to Git:
1. Open the project in Bolt.new
2. Ask Bolt to describe the tracking system — it should reference consent gating
3. Ask Bolt to add a new tracking event — it should use `trackEvent()` and respect consent

### Acceptance Criteria
- [ ] `.bolt/prompt` updated with consent, tracking, and edge function context
- [ ] Bolt.new correctly respects consent gating when modifying tracking code
- [ ] Bolt.new does not bypass `trackEvent()` for direct pixel calls

---

## Execution Order & Dependencies

```
Task 1 (Database + Products)
  └── Task 2 (Meta Pixel) — needs products to test events
       └── Task 3 (CAPI EMQ 7+) — needs pixel working first
            └── Task 4 (GDPR Consent) — gates pixel/CAPI firing
                 ├── Task 5 (Catalog URLs) — last, needs live site
                 └── Task 6 (Bolt.new prompt) — after all features are built
```

## Files to Create/Modify

| File | Action | Task |
|------|--------|------|
| `src/contexts/ConsentContext.tsx` | **Create** | 4 |
| `src/components/CookieBanner.tsx` | **Create** | 4 |
| `src/hooks/useTracking.ts` | **Modify** | 2, 3, 4 |
| `src/App.tsx` | **Modify** | 4 |
| `src/components/Footer.tsx` | **Modify** | 4 |
| `src/pages/Checkout.tsx` | **Modify** | 3 |
| `supabase/functions/facebook-capi/index.ts` | **Modify** | 3 |
| `supabase/functions/facebook-catalog-sync/index.ts` | **Modify** | 5 |
| `.env` | **Modify** | 1, 2 |
| `.bolt/prompt` | **Modify** | 6 |

---

## Appendix A: Edge Functions

Three Supabase Edge Functions exist in `supabase/functions/`:

### 1. `facebook-capi` — Facebook Conversion API
- **Purpose:** Send server-side events to Facebook Graph API v18.0
- **Trigger:** Called from client via `POST /functions/v1/facebook-capi`
- **Auth:** Bearer token (Supabase anon key)
- **Secrets needed:** `FACEBOOK_PIXEL_ID`, `FACEBOOK_ACCESS_TOKEN`
- **Events handled:** PageView, ViewContent, AddToCart, InitiateCheckout, Purchase, Search, Lead
- **Validation:** Blocks test/dummy data, invalid content_ids, zero values, missing Purchase value
- **Modified in:** Task 3 (add SHA-256 hashing, user data fields, event_id dedup)

### 2. `facebook-catalog-sync` — Facebook Product Catalog Sync
- **Purpose:** Sync products from Supabase to Facebook Commerce catalog
- **Trigger:** Called from Admin Dashboard via `POST /functions/v1/facebook-catalog-sync`
- **Auth:** Bearer token (Supabase anon key)
- **Secrets needed:** `FACEBOOK_CATALOG_ID`, `FACEBOOK_ACCESS_TOKEN`, `SITE_URL`
- **Actions:**
  - `sync` / `create` — Upload all products to Facebook (batch API, 50 per batch)
  - `fetch` — Pull catalog items and update `meta_catalog_id` in products table
  - `delete` — Remove all products from catalog
- **Data mapping:** name, description, price (CZK cents), availability, image_url, product URL
- **Modified in:** Task 5 (fix URL path from `/products/` to `/product/`)

### 3. `pays-webhook` — Pays Payment Gateway Webhook
- **Purpose:** Receive payment status updates from Pays gateway
- **Trigger:** Called by Pays payment gateway (external webhook)
- **Auth:** HMAC-MD5 signature verification
- **Secrets needed:** `PAYS_API_PASSWORD`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **Flow:**
  1. Receives POST with PaymentOrderID, MerchantOrderNumber, PaymentOrderStatusID, Signature
  2. Validates HMAC-MD5 signature against `PAYS_API_PASSWORD`
  3. If PaymentOrderStatusID = `"3"` → sets order `payment_status: 'paid'`, `status: 'processing'`, records `paid_at`
  4. Otherwise → sets `payment_status: 'failed'`
- **Not modified** in this plan

---

## Appendix B: Database Functions & Triggers

These PostgreSQL functions and triggers are created by migrations and must exist in the new Supabase project:

### Functions

| Function | Purpose | Migration |
|----------|---------|-----------|
| `generate_order_number()` | Generates unique order numbers (format: `TB-XXXXXXXX`) | `20260129101902` |
| `set_order_number()` | Trigger function that auto-sets order_number on INSERT | `20260129101902` |
| `update_updated_at_column()` | Sets `updated_at = now()` on row update | `20260129101902` |
| `is_admin()` | Returns true if current user is in `admin_users` table — used in RLS policies | `20260201152847` |
| `decrement_stock(p_variant_id uuid, p_quantity integer)` | Atomically decreases variant stock, raises exception if insufficient | `20260201152847` |
| `update_cart_timestamp()` | Updates cart `updated_at` when cart_items change | `20260201152847` |
| `generate_payment_reference()` | Generates unique payment reference string | `20260201144655` |
| `update_conversation_timestamp()` | Updates chat conversation `updated_at` when new message arrives | `20260201180639` |

### Triggers

| Trigger | Table | Event | Function Called |
|---------|-------|-------|-----------------|
| `trigger_set_order_number` | `orders` | BEFORE INSERT | `set_order_number()` — auto-generates order number |
| `update_user_profiles_updated_at` | `user_profiles` | BEFORE UPDATE | `update_updated_at_column()` |
| `update_addresses_updated_at` | `addresses` | BEFORE UPDATE | `update_updated_at_column()` |
| `update_orders_updated_at` | `orders` | BEFORE UPDATE | `update_updated_at_column()` |
| `cart_items_update_cart_timestamp` | `cart_items` | AFTER INSERT/UPDATE/DELETE | `update_cart_timestamp()` |
| `update_conversation_on_message` | `chat_messages` | AFTER INSERT | `update_conversation_timestamp()` |

### RLS Helper

The `is_admin()` function is critical — it's used in RLS policies across multiple tables to allow admin users full access:
```sql
CREATE POLICY "admin_full_access" ON products
  FOR ALL USING (is_admin());
```

---

## Environment Variables Checklist

### `.env` (client-side)
- [x] `VITE_SUPABASE_URL`
- [x] `VITE_SUPABASE_ANON_KEY`
- [x] `VITE_FB_PIXEL_ID`
- [x] `VITE_FB_CATALOG_ID`
- [ ] `VITE_GA_MEASUREMENT_ID` (optional — need from client)
- [ ] `VITE_TIKTOK_PIXEL_ID` (optional — need from client)

### Supabase Edge Function Secrets
- [ ] `FACEBOOK_PIXEL_ID` = `1256545223325119`
- [ ] `FACEBOOK_ACCESS_TOKEN` = `EAAucZAkCCUj4...`
- [ ] `FACEBOOK_CATALOG_ID` = `1574574398001610`
- [ ] `SITE_URL` = production domain
- [ ] `PAYS_API_PASSWORD` (for payment webhooks)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (auto-set by Supabase)
