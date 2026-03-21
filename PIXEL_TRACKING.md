# Pixel Tracking Setup Guide

Comprehensive pixel tracking has been implemented for your website to track user behavior and conversions across Facebook, Google Analytics, and TikTok.

## Pixels Integrated

1. **Facebook Pixel** - Track conversions for Facebook Ads
2. **Google Analytics 4** - Track website analytics and user behavior
3. **TikTok Pixel** - Track conversions for TikTok Ads

## Setup Instructions

### 1. Get Your Pixel IDs

#### Facebook Pixel
1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager2)
2. Create a new Pixel or select an existing one
3. Copy your Pixel ID (it's a number like `123456789012345`)

**Note**: You have already configured the Facebook Pixel ID and Access Token in Supabase edge function secrets. The Facebook Conversions API (CAPI) is ready to use!

#### Google Analytics 4
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property or select an existing one
3. Go to Admin > Data Streams > Web
4. Copy your Measurement ID (starts with `G-`, like `G-XXXXXXXXXX`)

#### TikTok Pixel
1. Go to [TikTok Ads Manager](https://ads.tiktok.com/)
2. Navigate to Assets > Events
3. Create a new Pixel or select an existing one
4. Copy your Pixel ID (starts with letters, like `ABCDEFGHIJ12345`)

### 2. Add Pixel IDs to Your Environment Variables

Open your `.env` file and add your pixel IDs:

```env
# Pixel Tracking IDs
VITE_FB_PIXEL_ID=YOUR_FACEBOOK_PIXEL_ID
VITE_GA_MEASUREMENT_ID=YOUR_GOOGLE_ANALYTICS_ID
VITE_TIKTOK_PIXEL_ID=YOUR_TIKTOK_PIXEL_ID
```

Example:
```env
VITE_FB_PIXEL_ID=123456789012345
VITE_GA_MEASUREMENT_ID=G-ABC123XYZ
VITE_TIKTOK_PIXEL_ID=CDEFGH12345
```

**Important**: Replace `your_pixel_id_here` in the `.env` file with your actual Facebook Pixel ID to enable client-side tracking. The server-side tracking (CAPI) is already configured in Supabase.

### 3. Facebook Conversions API (CAPI)

Your Facebook tracking uses both client-side (Pixel) and server-side (CAPI) tracking for maximum accuracy:

**What's Already Configured:**
- CAPI edge function is deployed and running
- FACEBOOK_PIXEL_ID and FACEBOOK_ACCESS_TOKEN are configured in Supabase secrets
- Events are automatically sent to both Pixel and CAPI
- Facebook automatically deduplicates events from both sources

**How It Works:**
1. When a user performs an action (add to cart, purchase, etc.), the event is sent to:
   - Facebook Pixel (client-side in browser)
   - Facebook CAPI (server-side via Supabase edge function)
2. Facebook receives both events and deduplicates them using:
   - Event name and timestamp
   - Facebook cookies (fbp, fbc)
   - User data (hashed email if available)
3. This ensures accurate tracking even when browsers block the pixel

**Tracked Events via CAPI:**
- PageView
- ViewContent
- AddToCart
- InitiateCheckout
- Purchase
- Lead

### 4. Restart Your Development Server

After adding the pixel IDs, restart your development server to load the new environment variables.

## Events Being Tracked

The following events are automatically tracked throughout your website:

### Page Views
- **When**: Every page navigation
- **Platforms**: Facebook, Google Analytics, TikTok
- **Data**: Page URL and path

### View Content
- **When**: User views a product detail page
- **Platforms**: Facebook, Google Analytics, TikTok
- **Data**: Product name, ID, price, currency

### Add to Cart
- **When**: User adds a product to their cart
- **Platforms**: Facebook, Google Analytics, TikTok
- **Data**: Product name, ID, price, quantity, currency

### Initiate Checkout
- **When**: User navigates to the checkout page
- **Platforms**: Facebook, Google Analytics, TikTok
- **Data**: Total value, number of items, product IDs, currency

### Purchase
- **When**: User completes an order
- **Platforms**: Facebook, Google Analytics, TikTok
- **Data**: Order ID, total value, product IDs, quantities, currency

### Lead (Newsletter Signup)
- **When**: User subscribes to newsletter (if implemented)
- **Platforms**: Facebook, Google Analytics, TikTok
- **Data**: Content name

## Testing Your Pixels

### Facebook Pixel
1. Install the [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/) Chrome extension
2. Navigate through your website
3. The extension will show you which events are firing

### Google Analytics
1. Go to [Google Analytics](https://analytics.google.com/)
2. Navigate to Reports > Realtime
3. Perform actions on your site and watch them appear in real-time

### TikTok Pixel
1. Go to TikTok Ads Manager > Assets > Events
2. Click on your pixel
3. Click "Test Events" and perform actions on your site

## Development Mode

In development mode, all tracking events are logged to the browser console with the prefix `📊`. This helps you verify that events are firing correctly without affecting your production data.

Open your browser's developer console to see these logs:
```
📊 Tracking Event: PageView
📊 Tracking Event: ViewContent { content_name: "Product Name", ... }
📊 Tracking Event: AddToCart { value: 190, currency: "CZK", ... }
```

## Privacy Compliance

Make sure to:
1. Add a cookie consent banner to your website
2. Include tracking pixels in your privacy policy
3. Allow users to opt out of tracking if required by law (GDPR, CCPA, etc.)
4. Only track users who have given consent

## Troubleshooting

### Events not firing
- Check that your pixel IDs are correctly set in the `.env` file
- Restart your development server after changing `.env`
- Check browser console for any errors
- Verify your pixel IDs are correct in their respective platforms

### Console shows tracking events but platform doesn't
- Check that your pixel IDs don't have any extra spaces or characters
- Wait a few minutes - some platforms have a delay in reporting
- Verify your pixels are active in their respective platforms
- Check that you're using the correct test mode tools

### Build warnings about chunk size
This is normal and can be addressed later with code splitting if needed. The tracking library is small and won't significantly impact performance.

## Next Steps

Once your pixels are configured:
1. Set up conversion events in Facebook Ads Manager
2. Create conversion goals in Google Analytics
3. Set up conversion events in TikTok Ads Manager
4. Test your entire purchase flow to ensure all events fire correctly
5. Start running ads and track your ROI

## Support

For platform-specific help:
- [Facebook Pixel Documentation](https://developers.facebook.com/docs/facebook-pixel/)
- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/10089681)
- [TikTok Pixel Documentation](https://ads.tiktok.com/help/article?aid=10000357)
