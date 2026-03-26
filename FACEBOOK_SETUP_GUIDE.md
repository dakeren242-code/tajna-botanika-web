# Facebook Conversion API & Catalog Setup Guide

This guide will help you configure Facebook Conversion API (CAPI) and Facebook Catalog for your e-commerce application.

## Overview

Your application includes:
- **Facebook Pixel** (client-side tracking)
- **Facebook Conversion API** (server-side tracking)
- **Facebook Catalog** (product catalog sync)
- **Automatic deduplication** between Pixel and CAPI

## Prerequisites

Before you begin, you'll need:
1. A Facebook Business Manager account
2. A Facebook Pixel created
3. A Facebook Catalog created
4. Admin access to your Supabase project

---

## Step 1: Get Your Facebook Pixel ID

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager/)
2. Select your Pixel or create a new one
3. Click on **Settings**
4. Copy your **Pixel ID** (e.g., `1639184183758857`)

### Update your `.env` file:
```env
VITE_FB_PIXEL_ID=YOUR_PIXEL_ID_HERE
```

---

## Step 2: Generate Facebook Access Token

You need a **System User Access Token** with the following permissions:
- `ads_management`
- `catalog_management`
- `business_management`

### Option A: Using Facebook Business Settings (Recommended)

1. Go to [Facebook Business Settings](https://business.facebook.com/settings/)
2. Click **Users** → **System Users**
3. Click **Add** to create a new system user
4. Name it (e.g., "Botanika API Access")
5. Select **Admin** role
6. Click **Add Assets**
7. Add your:
   - **Pixel** (with full control)
   - **Catalog** (with full control)
8. Click **Generate New Token**
9. Select the following permissions:
   - `ads_management`
   - `catalog_management`
   - `business_management`
10. Copy the generated token (starts with `EAA...`)

### Option B: Using Graph API Explorer

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app
3. Click **Generate Access Token**
4. Select these permissions:
   - `ads_management`
   - `catalog_management`
   - `business_management`
5. Click **Generate Access Token**
6. Copy the token

**IMPORTANT:** This token will expire! For production, use a System User token (Option A).

---

## Step 3: Get Your Facebook Catalog ID

1. Go to [Facebook Commerce Manager](https://business.facebook.com/commerce/)
2. Select your catalog or create a new one
3. Click **Settings**
4. Copy your **Catalog ID** (numeric value)

---

## Step 4: Configure Supabase Edge Function Secrets

You need to set these environment variables in your Supabase Edge Functions:

### Required Secrets:
```
FACEBOOK_PIXEL_ID=your_pixel_id
FACEBOOK_ACCESS_TOKEN=your_access_token
FACEBOOK_CATALOG_ID=your_catalog_id
```

### Optional Secrets:
```
SITE_URL=https://yourdomain.com
```

### How to Set Secrets:

**The system handles this automatically when you deploy edge functions.**

Secrets are already configured in your Supabase project and will be available to all edge functions.

---

## Step 5: Update Your Local `.env` File

Update your `.env` file with all the credentials:

```env
# Supabase (already configured)
VITE_SUPABASE_URL=https://qdzssmzywyvunifpjxxq.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Facebook Pixel (for client-side tracking)
VITE_FB_PIXEL_ID=your_pixel_id
```

**Note:** The `FACEBOOK_ACCESS_TOKEN` and `FACEBOOK_CATALOG_ID` should NOT be in your `.env` file as they are server-side only secrets managed by Supabase.

---

## Step 6: Sync Products to Facebook Catalog

### Using the Admin Dashboard:

1. Login to your admin account
2. Navigate to **Admin Dashboard**
3. Click the **Facebook Catalog** tab
4. Click **Sync to Facebook** button

This will:
- Upload all products from your database to Facebook Catalog
- Set catalog IDs for tracking
- Make products available for Dynamic Ads

### Using the API directly:

```bash
curl -X POST \
  https://qdzssmzywyvunifpjxxq.supabase.co/functions/v1/facebook-catalog-sync \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "sync"}'
```

### Available Actions:

- **`sync`**: Upload/update all products to Facebook Catalog
- **`fetch`**: Download catalog IDs from Facebook and update database
- **`delete`**: Remove all products from Facebook Catalog (database unchanged)

---

## Step 7: Verify Setup

### 1. Test Facebook Pixel

1. Install [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/) Chrome extension
2. Visit your website
3. Check that the Pixel Helper shows your pixel firing
4. Verify `PageView` event is tracked

### 2. Test Conversion API

1. Add a product to cart
2. Check browser Network tab
3. Look for request to `/functions/v1/facebook-capi`
4. Verify it returns `{"success": true}`

### 3. Check Events in Facebook

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager/)
2. Select your Pixel
3. Click **Test Events**
4. Perform actions on your site
5. Events should appear within 1-2 minutes

### 4. Verify Catalog Sync

1. Go to [Facebook Commerce Manager](https://business.facebook.com/commerce/)
2. Select your catalog
3. Click **Items**
4. You should see all your products listed

---

## Event Tracking

Your application automatically tracks these events:

| Event | Trigger | Data Sent |
|-------|---------|-----------|
| `PageView` | Every page load | URL |
| `ViewContent` | Product detail page | Product ID, name, price |
| `AddToCart` | Add to cart button | Product ID, name, price, quantity |
| `InitiateCheckout` | Checkout page | Cart total, items |
| `Purchase` | Payment success | Order ID, total, items |
| `Lead` | Newsletter signup | Email (hashed) |

---

## Catalog Product Format

Products are synced to Facebook in this format:

```json
{
  "id": "product_id_or_meta_catalog_id",
  "title": "Product Name",
  "description": "Product description",
  "availability": "in stock",
  "condition": "new",
  "price": "1990 CZK",
  "link": "https://yourdomain.com/products/product_id",
  "image_link": "https://yourdomain.com/images/product.jpg",
  "brand": "Botanika",
  "google_product_category": "Health & Beauty > Personal Care > Cosmetics"
}
```

---

## Best Practices

### 1. Use Catalog IDs for Tracking

The system automatically uses `meta_catalog_id` from your database if available. Otherwise, it falls back to the product's database ID.

To set catalog IDs:
1. Sync products to Facebook first
2. Products will automatically get their catalog IDs stored
3. All tracking events will use these IDs

### 2. Keep Products in Sync

Set up automatic syncing:
- Sync after adding new products
- Sync after updating product details
- Sync after changing prices or availability

### 3. Monitor Event Quality

Check these metrics in Facebook Events Manager:
- **Event Match Quality**: Should be 70%+
- **Deduplication Rate**: Pixel + CAPI events should be matched
- **Event Volume**: Ensure events are being received

### 4. GDPR Compliance

The system:
- Hashes all personal data (emails) before sending
- Uses Facebook's standard privacy controls
- Supports user consent management

Make sure you:
- Display a cookie consent banner
- Update your privacy policy
- Provide opt-out mechanisms

---

## Troubleshooting

### Events not appearing in Facebook

**Check:**
1. Pixel ID is correct in `.env`
2. Access token is valid and has correct permissions
3. Browser console shows tracking logs
4. Network requests to CAPI function succeed (200 status)
5. Edge function logs in Supabase (check for errors)

### Catalog sync failing

**Check:**
1. `FACEBOOK_CATALOG_ID` is correct
2. `FACEBOOK_ACCESS_TOKEN` has `catalog_management` permission
3. Products have valid data (name, price, image)
4. Check edge function logs for specific errors

### Low Event Match Quality

**Improve by:**
1. Collecting customer email during checkout
2. Ensuring Facebook cookies aren't blocked
3. Using HTTPS (not HTTP)
4. Sending consistent user data

### Access Token Expired

System user tokens don't expire, but if you used Graph API Explorer:
1. Generate a new token (see Step 2)
2. Update in Supabase edge function secrets
3. Token will be automatically available

---

## Security Notes

1. **Never** commit `FACEBOOK_ACCESS_TOKEN` to git
2. **Never** expose access token in client-side code
3. All sensitive operations happen server-side via edge functions
4. Personal data is hashed before transmission
5. Use System User tokens (they don't expire)

---

## Support

If you need help:
1. Check Supabase Edge Function logs
2. Check browser console for tracking errors
3. Use Facebook's [Test Events](https://business.facebook.com/events_manager/) tool
4. Review Facebook's [Conversions API documentation](https://developers.facebook.com/docs/marketing-api/conversions-api)

---

## Summary

Once configured, your system will:
- ✅ Track all user interactions with both Pixel and CAPI
- ✅ Automatically deduplicate events
- ✅ Sync products to Facebook Catalog
- ✅ Use catalog IDs for perfect attribution
- ✅ Hash personal data for privacy
- ✅ Provide accurate data for ad optimization

You can now run effective Facebook ad campaigns with:
- Dynamic Product Ads (using your catalog)
- Conversion campaigns (using Purchase events)
- Retargeting campaigns (using ViewContent, AddToCart events)
- Lookalike audiences (using your conversion data)
