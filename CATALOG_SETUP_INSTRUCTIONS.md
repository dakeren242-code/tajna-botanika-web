# Facebook Catalog Setup - Final Steps

## Current Status

Your Facebook Catalog sync system is fully configured and ready to use. However, the catalog sync is currently failing with this error:

```
Object with ID '1574574398001610' does not exist, cannot be loaded due to missing permissions, or does not support this operation.
```

This means one of the following:

1. The `FACEBOOK_CATALOG_ID` environment variable is not set correctly
2. The access token doesn't have permission to access this catalog
3. The catalog ID doesn't exist

## How to Fix

### Step 1: Verify Your Catalog ID

1. Go to [Facebook Commerce Manager](https://business.facebook.com/commerce/)
2. Click on your catalog
3. Look at the URL - it should be something like: `https://business.facebook.com/commerce/CATALOG_ID`
4. Copy the numeric `CATALOG_ID` from the URL

### Step 2: Verify Access Token Permissions

Your access token needs these permissions:
- `catalog_management`
- `business_management`

To generate a proper token:

1. Go to [Facebook Business Settings](https://business.facebook.com/settings/)
2. Click **Users** → **System Users**
3. Create or select a system user
4. Click **Add Assets**
5. Add your **Catalog** with **Full Control**
6. Generate a new token with these permissions:
   - `catalog_management`
   - `business_management`

### Step 3: Update Environment Variables

The catalog ID is already configured in your Supabase edge functions. To verify or update it:

1. The `FACEBOOK_CATALOG_ID` secret should contain your catalog ID
2. The `FACEBOOK_ACCESS_TOKEN` should be your system user token

These are automatically configured when you set them up.

### Step 4: Test the Sync

Once you've verified the catalog ID and access token are correct, you can sync products in two ways:

#### Option A: Using the Admin Dashboard
1. Login to your admin account
2. Go to Admin Dashboard
3. Click the **Facebook Catalog** tab
4. Click **Sync to Facebook**

#### Option B: Using the API
Run this command:
```bash
node sync-catalog.js
```

## Expected Result

When successful, you should see:
```
✅ Catalog sync completed!

📊 Results:
  - Total products: 6
  - Successfully synced: 6
  - Failed: 0

📦 Synced products:
  - ID: product-id-1 → Catalog ID: fb-handle-1
  - ID: product-id-2 → Catalog ID: fb-handle-2
  ...
```

## Troubleshooting

### Error: "Object does not exist or missing permissions"

**Solution:**
- Double-check your catalog ID is correct
- Verify the access token has `catalog_management` permission
- Ensure the token is from a System User with access to the catalog

### Error: "Invalid access token"

**Solution:**
- Generate a new System User access token (they don't expire)
- Ensure you're using the correct token in the environment variables

### Products Not Showing in Catalog

**Solution:**
- Check that the sync completed successfully (0 failed)
- Go to Facebook Commerce Manager and refresh
- Check the catalog settings to ensure products are approved

## After Successful Sync

Once products are synced:

1. **Products appear in Facebook Catalog**: You can view them in Commerce Manager
2. **Catalog IDs are stored**: The `meta_catalog_id` field in your database will be populated
3. **Tracking uses Catalog IDs**: All Facebook Pixel events will use these IDs
4. **Dynamic Ads work**: You can now create Dynamic Product Ads in Facebook Ads Manager

## Next Steps

After successful sync, you can:
1. Create Dynamic Product Ad campaigns
2. Use catalog for retargeting
3. Enable Facebook Shop (if eligible)
4. Track conversions with accurate product attribution

## Need Help?

If you're still having issues:
1. Verify the catalog ID in Commerce Manager
2. Check the access token has the right permissions
3. Review the error messages in the sync results
4. Check Supabase edge function logs for detailed errors
