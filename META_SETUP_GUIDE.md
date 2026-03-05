# Meta Pixel + CAPI - Rychlý Setup Guide

## 🚀 5minutový Setup

### Krok 1: Získejte Meta Pixel ID

1. Přejděte na [Meta Events Manager](https://business.facebook.com/events_manager2)
2. Klikněte na **"Connect Data Sources"** → **"Web"**
3. Pojmenujte pixel (např. "TajnaBotanika")
4. Zkopírujte **Pixel ID** (15místné číslo)

```
Příklad: 123456789012345
```

### Krok 2: Vygenerujte Access Token

1. V Events Manageru vyberte váš pixel
2. **Settings** → **Conversions API** → **Generate Access Token**
3. Zkopírujte token (začíná `EAA...`)

```
Příklad: EAABsbCS1iHgBAOZC8xPZCM...
```

### Krok 3: (Volitelné) Test Event Code

1. V Events Manageru klikněte na **"Test Events"**
2. Vygenerujte **Test Event Code**
3. Zkopírujte kód (např. `TEST12345`)

### Krok 4: Nastavte Environment Variables

Vytvořte soubor `.env` v root složce projektu:

```bash
# Browser-side tracking
VITE_META_PIXEL_ID=123456789012345

# Pro Supabase secrets (nastavit v Supabase Dashboard)
META_PIXEL_ID=123456789012345
META_ACCESS_TOKEN=EAABsbCS1iHgBAOZC8xPZCM...
META_TEST_EVENT_CODE=TEST12345
```

### Krok 5: Nastavte Supabase Secrets

```bash
# Přejděte do Supabase Dashboard → Project Settings → Edge Functions

# Přidejte secrets:
META_PIXEL_ID=123456789012345
META_ACCESS_TOKEN=EAABsbCS1iHgBAOZC8xPZCM...
META_TEST_EVENT_CODE=TEST12345  # Volitelné
```

**Nebo pomocí Supabase CLI:**

```bash
supabase secrets set META_PIXEL_ID=123456789012345
supabase secrets set META_ACCESS_TOKEN=EAABsbCS1iHgBAOZC8xPZCM...
supabase secrets set META_TEST_EVENT_CODE=TEST12345
```

### Krok 6: Deploy Edge Function

Edge function `meta-conversions-api` je již nasazena! ✅

Ověřte v Supabase Dashboard → Edge Functions.

### Krok 7: Testování

#### Browser Test

Otevřete aplikaci a zkontrolujte browser console:

```javascript
// Mělo by vrátit funkci
typeof fbq
// → "function"

// Zkontrolujte fbp cookie
document.cookie.match(/(?:^|;)\s*_fbp=([^;]+)/)
// → ["_fbp=fb.1.1675348800.123456", "fb.1.1675348800.123456"]
```

#### Server Test

Zkontrolujte Supabase logs:

```
Settings → Edge Functions → meta-conversions-api → Logs
```

Měli byste vidět:

```
Sending to Meta CAPI: {
  event_name: 'PageView',
  event_id: 'f47ac10b-...',
  has_fbp: true
}

Meta CAPI success: {
  events_received: 1,
  fbtrace_id: 'AbCdEfGh...'
}
```

#### Meta Events Manager Test

1. Přejděte na [Events Manager](https://business.facebook.com/events_manager2)
2. Vyberte váš pixel
3. Klikněte na **"Test Events"**
4. Měli byste vidět real-time události ✅

---

## 🎯 Integrace do vaší aplikace

### Přidejte do App.tsx

```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMetaTracking } from './hooks/useMetaTracking';

function App() {
  const location = useLocation();
  const { trackPageView } = useMetaTracking();

  // Trackujte PageView při každé změně URL
  useEffect(() => {
    trackPageView();
  }, [location.pathname, trackPageView]);

  return (
    <Routes>
      {/* Vaše routes */}
    </Routes>
  );
}
```

### Sledujte Purchase událost

```typescript
// V Success/Thank You stránce
import { useEffect } from 'react';
import { useMetaTracking } from '../hooks/useMetaTracking';

function OrderSuccessPage() {
  const { trackPurchase } = useMetaTracking();

  useEffect(() => {
    async function trackOrder() {
      const order = await fetchOrder(orderId);

      await trackPurchase({
        contentIds: order.items.map(item => item.product_id),
        value: order.total_amount,
        numItems: order.items.length,
        currency: 'CZK',
        contents: order.items.map(item => ({
          id: item.product_id,
          quantity: item.quantity,
          item_price: item.price
        })),
        email: order.customer_email,
        phone: order.customer_phone,
        firstName: order.customer_first_name,
        lastName: order.customer_last_name
      });
    }

    trackOrder();
  }, [orderId]);

  return <div>Děkujeme za objednávku!</div>;
}
```

---

## ✅ Kontrolní Seznam

Po setupu zkontrolujte:

- [ ] Meta Pixel ID je v `.env`
- [ ] Meta Access Token je v Supabase secrets
- [ ] Edge Function `meta-conversions-api` je nasazená
- [ ] Browser console ukazuje `typeof fbq === "function"`
- [ ] Meta Events Manager ukazuje události v Test Events
- [ ] Purchase událost se zobrazuje s `value` a `currency`
- [ ] Event Match Quality (EMQ) je 6.0+
- [ ] Deduplication Rate je 75%+

---

## 🆘 Rychlá pomoc

### Pixel se nenačítá

```javascript
// Zkontrolujte:
console.log(import.meta.env.VITE_META_PIXEL_ID);
// Mělo by vrátit vaše Pixel ID
```

### CAPI události nechodí

```bash
# Zkontrolujte Edge Function logs
# Supabase Dashboard → Edge Functions → meta-conversions-api → Logs
```

### Nízká deduplikace

```typescript
// Zkontrolujte, že používáte eventID:
fbq('track', 'Purchase', data, {
  eventID: eventId  // ← Toto je KRITICKÉ!
});
```

---

## 📞 Podpora

Potřebujete pomoc? Dokumentace:

- **Hlavní dokumentace:** `META_TRACKING_DOCUMENTATION.md`
- **Příklady integrace:** `INTEGRATION_EXAMPLES.tsx`
- **Meta dokumentace:** [developers.facebook.com/docs/marketing-api/conversions-api](https://developers.facebook.com/docs/marketing-api/conversions-api)

---

**🎉 Hotovo! Váš tracking je nyní aktivní.**
