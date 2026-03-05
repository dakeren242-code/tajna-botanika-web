# Facebook Pixel & Conversions API Integration

## Overview

The application now has complete Facebook tracking integration with both:
- **Facebook Pixel** (client-side tracking)
- **Facebook Conversions API (CAPI)** (server-side tracking)

This dual-tracking approach ensures maximum data accuracy and helps overcome iOS 14+ tracking limitations.

## Configuration

### Credentials Used

- **Meta Pixel ID**: `4296612473987786`
- **Conversions API Token**: `EAAieT7V4LBQ...` (stored in edge function)

These are configured in:
- `.env` file (Pixel ID)
- `supabase/functions/facebook-capi/index.ts` (CAPI token)

## How It Works

### 1. Facebook Pixel (Client-Side)

The pixel is automatically loaded on page load and tracks:
- **PageView**: Every page navigation
- **ViewContent**: Product detail views
- **AddToCart**: Items added to cart
- **InitiateCheckout**: Checkout page visits
- **Purchase**: Completed purchases (from success page)
- **Lead**: Newsletter signups

Location: `src/hooks/useTracking.ts`

### 2. Facebook CAPI (Server-Side)

For every tracked event, a duplicate event is sent server-side through the CAPI edge function. This provides:
- **Deduplication**: Facebook automatically merges client and server events
- **Better accuracy**: Works even when browsers block pixels
- **Enhanced data**: Includes hashed user data (email) for better matching

## Tracked Events

### PageView
Triggered on every page navigation.

### ViewContent
Triggered when viewing a product detail page.

**Data sent:**
```json
{
  "content_name": "Product Name",
  "content_ids": ["product_id"],
  "content_type": "product",
  "value": 190,
  "currency": "CZK"
}
```

### AddToCart
Triggered when adding items to cart.

**Data sent:**
```json
{
  "content_name": "Product Name",
  "content_ids": ["product_id"],
  "content_type": "product",
  "value": 551,
  "currency": "CZK",
  "contents": [
    {
      "id": "product_id",
      "quantity": 1
    }
  ]
}
```

Location: `src/contexts/CartContext.tsx` - tracks automatically when `addToCart` is called

### InitiateCheckout
Triggered when user visits the checkout page.

**Data sent:**
```json
{
  "value": 1500,
  "currency": "CZK",
  "num_items": 3,
  "contents": [
    {
      "id": "product_id_1",
      "quantity": 2
    },
    {
      "id": "product_id_2",
      "quantity": 1
    }
  ]
}
```

Location: `src/pages/Checkout.tsx`

### Purchase
Triggered when a payment is successfully completed.

**Data sent:**
```json
{
  "value": 1500,
  "currency": "CZK",
  "transaction_id": "order_id",
  "contents": [
    {
      "id": "product_id",
      "quantity": 2,
      "item_price": 551
    }
  ]
}
```

This event is sent from two places:
1. **Client-side**: Success page (`src/pages/Success.tsx`)
2. **Server-side**: Stripe webhook (`supabase/functions/stripe-webhook/index.ts`)

The server-side event includes:
- Hashed customer email for better user matching
- Complete line item details from Stripe
- Payment intent ID

### Lead
Triggered when user signs up for the newsletter.

**Data sent:**
```json
{
  "content_name": "Newsletter Signup"
}
```

## Edge Functions

### facebook-capi

**Location**: `supabase/functions/facebook-capi/index.ts`

**Purpose**: Receives tracking events from the frontend and Stripe webhook, then forwards them to Facebook's Conversions API.

**Endpoint**: `https://your-project.supabase.co/functions/v1/facebook-capi`

**Request Format**:
```json
{
  "event_name": "Purchase",
  "event_source_url": "https://botanika.com/checkout",
  "custom_data": {
    "currency": "CZK",
    "value": 1500,
    "content_ids": ["product_1"],
    "contents": [{ "id": "product_1", "quantity": 2 }]
  },
  "user_data": {
    "em": ["hashed_email"],
    "fbp": "_fbp_cookie_value",
    "fbc": "_fbc_cookie_value"
  }
}
```

**Features**:
- Automatically captures IP address and User Agent
- Includes Facebook browser cookies (fbp, fbc) for deduplication
- Hashes email addresses (SHA-256)
- Full error logging

### stripe-webhook (Updated)

**Location**: `supabase/functions/stripe-webhook/index.ts`

**Updates**: Now sends Purchase events to Facebook CAPI when payments complete.

**Process**:
1. Receives webhook from Stripe
2. Validates signature
3. Creates order in database
4. Fetches line items from Stripe
5. Sends Purchase event to Facebook CAPI with:
   - Transaction value
   - Product IDs and quantities
   - Hashed customer email
   - Order ID

## User Data & Privacy

### Hashed Data
All personally identifiable information (PII) is hashed using SHA-256 before sending to Facebook:

```typescript
async function hashEmail(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### Facebook Cookies
The integration automatically captures Facebook browser cookies:
- `_fbp`: Facebook Pixel cookie (identifies browser)
- `_fbc`: Facebook Click ID (from ad clicks)

These are used by Facebook for event deduplication between pixel and CAPI.

## Testing

### 1. Test Facebook Pixel

1. Open your website
2. Open browser console (F12)
3. Look for tracking logs: `📊 Tracking Event: ...`
4. Use Facebook Pixel Helper Chrome extension
5. Verify events appear in real-time

### 2. Test Facebook CAPI

**Test AddToCart**:
1. Add a product to cart
2. Check browser Network tab
3. Look for POST request to `/functions/v1/facebook-capi`
4. Verify 200 response

**Test Purchase**:
1. Complete a test purchase with Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: `123`
2. Check Supabase Edge Function logs:
   ```
   ✓ Successfully sent Facebook CAPI Purchase event
   ```

### 3. Verify in Facebook Events Manager

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager/)
2. Select your Pixel (4296612473987786)
3. Click "Test Events"
4. Perform actions on your site
5. Events should appear within 1-2 minutes

**What to check**:
- Event name matches (AddToCart, Purchase, etc.)
- Value and currency are correct
- Deduplication status shows "Matched" for duplicate events

### 4. Check Event Match Quality

1. In Events Manager, go to "Data Sources" → Your Pixel
2. Click "Settings" → "Event Match Quality"
3. Verify high match rate (70%+)

Higher match quality means:
- Better ad targeting
- More accurate attribution
- Better ROAS measurement

## Troubleshooting

### Events not appearing in Facebook

**Check:**
1. Pixel ID is correct in `.env`
2. CAPI token is valid
3. Browser console shows tracking logs
4. Network requests to CAPI function succeed
5. Edge function logs in Supabase

### Duplicate events

**This is normal!** Facebook automatically deduplicates events sent from both Pixel and CAPI using:
- Event name
- Event time (within 5 minutes)
- Facebook cookies (fbp, fbc)
- Hashed email

In Events Manager, deduplicated events show as "Matched".

### Low match quality

**Improve by**:
1. Collecting customer email during checkout
2. Ensuring Facebook cookies are not blocked
3. Sending consistent user data
4. Using https:// (not http://)

### CAPI function errors

**Check Supabase logs**:
```bash
# View logs in Supabase Dashboard:
Edge Functions → facebook-capi → Logs
```

**Common errors**:
- Invalid access token → Check token in function code
- Missing required fields → Check event payload structure
- Rate limiting → Add retry logic with exponential backoff

## Best Practices

### 1. Event Consistency
Always send the same parameters for the same event type across your site.

### 2. Value Format
Send values as numbers in the smallest currency unit (koruna, not haléře):
```typescript
value: 1500  // 1,500 Kč
```

### 3. Currency Code
Always include the correct 3-letter ISO currency code:
```typescript
currency: "CZK"
```

### 4. Product IDs
Use consistent product IDs across:
- Your database
- Facebook Product Catalog (if using)
- Tracking events

### 5. Email Hashing
Always:
- Lowercase the email
- Trim whitespace
- Hash with SHA-256
- Send as array: `["hashed_value"]`

### 6. Event Timing
Send events immediately when they occur, not in batches.

## Advanced Configuration

### Custom Events

To track custom events, use the `trackEvent` function:

```typescript
import { trackEvent } from './hooks/useTracking';

trackEvent('CustomEventName', {
  custom_param: 'value',
  value: 100,
  currency: 'CZK'
});
```

### Update CAPI Token

If you need to update the Conversions API token:

1. Generate new token in Facebook Business Settings
2. Update in `supabase/functions/facebook-capi/index.ts`
3. Redeploy the edge function:
   ```bash
   # Function is automatically redeployed when you save changes
   ```

### Update Pixel ID

If you need to change the Pixel ID:

1. Update in `.env`:
   ```
   VITE_FB_PIXEL_ID=new_pixel_id
   ```
2. Update in `supabase/functions/facebook-capi/index.ts`
3. Rebuild the app:
   ```bash
   npm run build
   ```

## Monitoring & Analytics

### Key Metrics to Track

1. **Event Volume**: Number of events per day
2. **Match Rate**: % of events matched with Facebook users
3. **Deduplication Rate**: % of events properly deduplicated
4. **Attribution**: Which ads drive purchases

### Where to Find Metrics

**Facebook Events Manager**:
- Real-time event stream
- Event match quality
- Deduplication status
- Attribution reports

**Supabase Logs**:
- CAPI function success/error rate
- Event payload inspection
- Performance monitoring

## Privacy & Compliance

### GDPR Compliance

The integration:
- Hashes all PII before transmission
- Only sends data users consent to
- Uses Facebook's data processing agreement
- Supports user data deletion requests

### User Consent

Make sure you:
1. Display cookie consent banner
2. Only load Pixel after consent
3. Provide opt-out mechanism
4. Update privacy policy

### Data Retention

Facebook stores event data for:
- 180 days for attribution
- 28 days for Pixel data

## Summary

Your Facebook tracking is now fully configured with:

✅ **Facebook Pixel** loaded and tracking all key events
✅ **Conversions API** sending server-side events
✅ **Automatic deduplication** between Pixel and CAPI
✅ **Purchase tracking** from Stripe webhooks
✅ **User data hashing** for privacy compliance
✅ **Complete event coverage** from view to purchase

The integration is production-ready and will provide accurate tracking data for your Facebook ad campaigns!
