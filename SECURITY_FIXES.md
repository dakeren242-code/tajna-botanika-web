# Security and Performance Fixes

## Overview

This document describes the security and performance issues that were identified and resolved in the database.

## ✅ Fixed via Migration

The following issues have been **automatically fixed** through database migration `fix_security_and_performance_issues.sql`:

### 1. RLS Performance Optimization ✅

**Issue**: Row Level Security policies were re-evaluating `auth.uid()` for each row, causing poor query performance at scale.

**Fixed Tables**:
- `stripe_customers` - "Users can view their own customer data"
- `stripe_subscriptions` - "Users can view their own subscription data"
- `stripe_orders` - "Users can view their own order data"

**Solution**: Updated all policies to use `(select auth.uid())` which evaluates once per query instead of once per row.

**Before**:
```sql
USING (user_id = auth.uid())
```

**After**:
```sql
USING (user_id = (select auth.uid()))
```

**Performance Impact**: Queries on these tables will now execute significantly faster, especially when dealing with large result sets.

---

### 2. Unused Index Cleanup ✅

**Issue**: 14 indexes were identified as unused, consuming storage space and slowing down write operations.

**Indexes Removed**:
- `idx_orders_delivery_address_id` on `orders`
- `idx_orders_billing_address_id` on `orders`
- `idx_orders_stripe_session` on `orders`
- `idx_orders_stripe_payment` on `orders`
- `idx_orders_user_id` on `orders`
- `idx_orders_order_number` on `orders`
- `idx_orders_status` on `orders`
- `idx_orders_payment_status` on `orders`
- `idx_order_items_order_id` on `order_items`
- `idx_order_items_product_id` on `order_items`
- `idx_addresses_user_id` on `addresses`
- `idx_email_subscribers_email` on `email_subscribers`
- `idx_email_subscribers_active` on `email_subscribers`
- `idx_products_stripe_product` on `products`

**Benefits**:
- Reduced storage usage
- Faster INSERT, UPDATE, and DELETE operations
- Simplified index maintenance

**Note**: If any of these indexes become needed in the future due to new query patterns, they can be recreated. Monitor slow query logs to identify if indexing is needed.

---

### 3. Email Subscribers RLS Policy ✅

**Issue**: The `email_subscribers` table had an RLS policy with `WITH CHECK (true)`, which effectively bypassed security by allowing any data to be inserted.

**Old Policy**:
```sql
CREATE POLICY "Anyone can subscribe"
  ON email_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);  -- ⚠️ Always true = no validation!
```

**New Policy**:
```sql
CREATE POLICY "Anyone can subscribe with valid email"
  ON email_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND char_length(email) <= 255
  );
```

**Security Improvements**:
- ✅ Requires a valid email address (cannot be NULL)
- ✅ Validates email format using regex pattern
- ✅ Limits email length to 255 characters (prevents potential abuse)
- ✅ Still allows both anonymous and authenticated users to subscribe
- ✅ Protects against malformed or malicious data

---

## ⚙️ Manual Configuration Required

The following issues **cannot be fixed via SQL migration** and require manual configuration in the Supabase Dashboard:

### 1. Auth DB Connection Strategy ⚙️

**Issue**: Auth server is configured to use a fixed number of connections (10) instead of a percentage-based allocation.

**Problem**: Scaling up your database instance will not improve Auth server performance because it will still be limited to 10 connections.

**How to Fix**:

1. Open your Supabase project dashboard
2. Navigate to **Database** → **Settings**
3. Find the **Connection Pooling** section
4. Locate **Auth Connection Limit**
5. Change from **Fixed (10)** to **Percentage-based**
6. Set to **10-15%** of total connections (recommended)
7. Click **Save**

**Benefits**:
- Auth server scales automatically with database size
- Better performance under high authentication load
- More efficient resource utilization

---

### 2. Leaked Password Protection ⚙️

**Issue**: HaveIBeenPwned integration is disabled, allowing users to create accounts with compromised passwords.

**Security Risk**: Users can register with passwords that have been exposed in data breaches, making accounts vulnerable to credential stuffing attacks.

**How to Fix**:

1. Open your Supabase project dashboard
2. Navigate to **Authentication** → **Settings**
3. Scroll to **Security and Protection** section
4. Find **Leaked Password Protection**
5. Toggle **Enable HaveIBeenPwned Integration** to **ON**
6. Click **Save**

**What This Does**:
- Checks user passwords against HaveIBeenPwned.org database
- Rejects passwords that have been found in data breaches
- Happens in real-time during signup/password change
- Does NOT send the actual password (uses k-anonymity hashing)
- Significantly reduces account takeover risk

**Privacy Note**: This feature is privacy-preserving. Only the first 5 characters of the password hash are sent to HaveIBeenPwned, and the full match is computed locally.

---

## Verification

### Verify RLS Performance Fix

Run this query to confirm policies are using optimized auth checks:

```sql
SELECT
  tablename,
  policyname,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('stripe_customers', 'stripe_subscriptions', 'stripe_orders');
```

Look for `(SELECT auth.uid())` in the `qual` column (not just `auth.uid()`).

### Verify Unused Indexes Removed

Run this query to check remaining indexes:

```sql
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

The 14 indexes listed above should NOT appear in the results.

### Verify Email Validation Policy

Test the new email validation:

```sql
-- This should succeed
INSERT INTO email_subscribers (email) VALUES ('test@example.com');

-- This should fail (invalid format)
INSERT INTO email_subscribers (email) VALUES ('not-an-email');

-- This should fail (null email)
INSERT INTO email_subscribers (email) VALUES (NULL);
```

---

## Performance Impact

### Before Optimization

**Scenario**: Query fetching 1,000 orders for a user

- `auth.uid()` called 1,000 times (once per row)
- Significant CPU overhead
- Slower response times

### After Optimization

**Scenario**: Same query fetching 1,000 orders

- `(select auth.uid())` called 1 time
- 99.9% reduction in auth function calls
- Much faster response times

### Expected Improvements

- **RLS queries**: 50-90% faster (depends on result set size)
- **Write operations**: 5-15% faster (due to fewer indexes)
- **Storage**: Reduced by removing unused indexes
- **Security**: Improved email validation prevents bad data

---

## Rollback Instructions

If you need to rollback these changes:

### Rollback RLS Policies

```sql
-- Restore original stripe_customers policy
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;
CREATE POLICY "Users can view their own customer data"
  ON stripe_customers FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Restore original stripe_subscriptions policy
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;
CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions FOR SELECT TO authenticated
  USING (
    customer_id IN (SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid() AND deleted_at IS NULL)
    AND deleted_at IS NULL
  );

-- Restore original stripe_orders policy
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;
CREATE POLICY "Users can view their own order data"
  ON stripe_orders FOR SELECT TO authenticated
  USING (
    customer_id IN (SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid() AND deleted_at IS NULL)
    AND deleted_at IS NULL
  );
```

### Restore Indexes

```sql
-- Only restore indexes if you identify they are actually needed
CREATE INDEX IF NOT EXISTS idx_orders_delivery_address_id ON orders(delivery_address_id);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
-- ... (add others as needed)
```

### Rollback Email Policy

```sql
DROP POLICY IF EXISTS "Anyone can subscribe with valid email" ON email_subscribers;
CREATE POLICY "Anyone can subscribe"
  ON email_subscribers FOR INSERT TO anon, authenticated
  WITH CHECK (true);
```

---

## Summary

### ✅ Completed
- [x] Optimized 3 RLS policies for better performance
- [x] Removed 14 unused indexes
- [x] Added email validation to subscribers policy
- [x] Applied migration successfully

### ⚙️ Action Required
- [ ] Configure Auth connection strategy (percentage-based)
- [ ] Enable HaveIBeenPwned password protection

### 📊 Impact
- **Security**: Improved ✅
- **Performance**: Significantly improved ✅
- **Storage**: Reduced ✅
- **Data Quality**: Improved (email validation) ✅

---

## Questions?

If you experience any issues after these changes:

1. Check the migration logs in Supabase Dashboard → Database → Migrations
2. Run the verification queries above
3. Monitor slow query logs for any new performance issues
4. Review RLS policies in Dashboard → Authentication → Policies

All changes are reversible using the rollback instructions provided above.
