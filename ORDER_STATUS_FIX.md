# Order Status Check Constraint - Diagnostika a Oprava

## 1️⃣ DIAGNOSTIKA - Proč chyba vznikla

### Aktuální stav v databázi:
```sql
CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'))
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'))
```

### Co aplikace posílá:
```typescript
const orderStatus = paymentMethod === 'cash_on_delivery' ? 'paid' : 'awaiting_payment';
```

### ❌ PROBLÉM:
- Aplikace posílá: `'awaiting_payment'` nebo `'paid'`
- DB constraint povoluje: `'pending', 'processing', 'shipped', 'delivered', 'cancelled'`
- **'awaiting_payment' a 'paid' NEJSOU v constraintu → ERROR 23514**

### Root cause:
1. Starý constraint z původní migrace nebyl aktualizován
2. Nová migrace se pokusila přidat constraint, ale starý zůstal
3. Aplikační logika používá jiné hodnoty než DB

---

## 2️⃣ NÁVRH SPRÁVNÉHO STAVOVÉHO MODELU (BEST PRACTICE)

### ⚠️ KRITICKÉ PRINCIPY:

#### ❌ ŠPATNĚ (co se nesmí dělat):
```
orders.status = 'bank_transfer'     // ❌ platební metoda není status objednávky
orders.status = 'cash_on_delivery'  // ❌ platební metoda není status objednávky
orders.status = 'zasilkovna'        // ❌ dopravní metoda není status objednávky
orders.status = 'paid'              // ❌ payment status není order status
```

#### ✅ SPRÁVNĚ (oddělené koncepty):

```sql
orders.status              -- Životní cyklus OBJEDNÁVKY
orders.payment_status      -- Stav PLATBY
orders.fulfillment_status  -- Stav EXPEDICE
orders.payment_method      -- JAK zákazník platí (foreign key)
orders.shipping_method     -- JAK se posílá (foreign key)
```

### Správný model:

#### A) **orders.status** - Životní cyklus objednávky
```sql
'pending'           -- Čeká na dokončení/potvrzení
'confirmed'         -- Potvrzena zákazníkem
'processing'        -- Zpracovává se (balí se)
'shipped'           -- Odeslána
'delivered'         -- Doručena
'cancelled'         -- Zrušena
'failed'            -- Selhala (technická chyba, nedostatek skladu)
```

**Význam:**
- `pending` - Objednávka je vytvořena, ale není ještě definitivně potvrzena
- `confirmed` - Zákazník dokončil checkout, objednávka čeká na zpracování
- `processing` - Admin/systém připravuje objednávku k odeslání
- `shipped` - Objednávka je u přepravce
- `delivered` - Zákazník převzal
- `cancelled` - Zrušeno zákazníkem nebo adminkem
- `failed` - Technická chyba (nedostatek skladu, chyba platby)

#### B) **orders.payment_status** - Stav platby
```sql
'pending'                -- Čeká na platbu
'awaiting_confirmation'  -- Platba proběhla, čeká na potvrzení
'paid'                   -- Zaplaceno
'failed'                 -- Platba selhala
'refunded'               -- Vráceno
'partially_refunded'     -- Částečně vráceno
```

**Význam:**
- `pending` - Platba ještě neproběhla (převod, dobírka)
- `awaiting_confirmation` - Platba iniciována, čeká se na webhook/potvrzení
- `paid` - Peníze jsou na účtu
- `failed` - Platba nebyla úspěšná
- `refunded` - Vráceno zpět zákazníkovi
- `partially_refunded` - Vrácena část částky

#### C) **orders.fulfillment_status** - Stav expedice
```sql
'unfulfilled'  -- Neexpedováno
'partial'      -- Částečně expedováno
'fulfilled'    -- Plně expedováno
'returned'     -- Vráceno
```

**Význam:**
- `unfulfilled` - Objednávka ještě nebyla zabalena/odeslána
- `partial` - Část položek odeslána (u velkých objednávek)
- `fulfilled` - Vše odesláno
- `returned` - Zákazník vrátil

#### D) **payment_method** (foreign key → payment_methods.code)
```sql
'bank_transfer'      -- Bankovní převod
'card'               -- Platba kartou
'cash_on_delivery'   -- Dobírka
```

#### E) **shipping_method** (foreign key → shipping_methods.code)
```sql
'zasilkovna'       -- Zásilkovna/Packeta
'personal_pickup'  -- Osobní odběr
'courier'          -- Kurýr
```

---

## 3️⃣ CHECK CONSTRAINT / ENUM V DB

### Doporučení: CHECK constraint (flexibilnější než ENUM)

**Proč CHECK místo ENUM:**
- ✅ Jednodušší změna (ALTER TABLE vs. ALTER TYPE)
- ✅ Lepší chybové zprávy
- ✅ Funguje i s RLS policies
- ❌ ENUM je rigidní, těžko se mění

### Finální definice:

```sql
-- orders.status - Životní cyklus objednávky
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  status IN (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'failed'
  )
);

-- orders.payment_status - Stav platby
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check CHECK (
  payment_status IN (
    'pending',
    'awaiting_confirmation',
    'paid',
    'failed',
    'refunded',
    'partially_refunded'
  )
);

-- orders.fulfillment_status - Stav expedice
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_fulfillment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_fulfillment_status_check CHECK (
  fulfillment_status IN (
    'unfulfilled',
    'partial',
    'fulfilled',
    'returned'
  )
);
```

**Proč jsou tyto hodnoty správné:**
1. **Oddělené koncepty** - order status ≠ payment status ≠ fulfillment status
2. **Jasné semantiky** - každá hodnota má jednoznačný význam
3. **Pokrývá všechny případy** - od vytvoření po doručení/zrušení
4. **Rozšiřitelné** - lze přidat nové stavy bez refaktoringu

---

## 4️⃣ OPRAVA APLIKAČNÍ LOGIKY

### Co posílat do orders.status:

```typescript
// ✅ SPRÁVNĚ - podle platební metody určíme INITIAL status
const getInitialOrderStatus = (paymentMethodCode: string): string => {
  switch (paymentMethodCode) {
    case 'bank_transfer':
      // Bankovní převod: čeká se na platbu
      return 'confirmed';  // objednávka je potvrzena, ale čeká na platbu

    case 'cash_on_delivery':
      // Dobírka: objednávka je potvrzena, platba bude při převzetí
      return 'confirmed';

    case 'card':
      // Karta: po úspěšné platbě přes webhook
      return 'confirmed';  // nebo 'pending' pokud ještě neproběhl redirect

    default:
      return 'confirmed';
  }
};

const getInitialPaymentStatus = (paymentMethodCode: string): string => {
  switch (paymentMethodCode) {
    case 'bank_transfer':
      return 'pending';  // čeká se na platbu

    case 'cash_on_delivery':
      return 'pending';  // zaplatí při převzetí

    case 'card':
      return 'awaiting_confirmation';  // redirect na bránu, čeká se na webhook

    default:
      return 'pending';
  }
};
```

### ❌ Čemu se vyhnout:

```typescript
// ❌ NIKDY NEPIŠTE:
status: paymentMethod                     // ❌ platební metoda není status
status: paymentMethod === 'cod' ? 'paid' : 'awaiting_payment'  // ❌ 'paid' je payment_status, ne order status
status: shippingMethod                    // ❌ doprava není status
payment_status: 'cash_on_delivery'        // ❌ není platební status
```

---

## 5️⃣ UKÁZKA SPRÁVNÉHO FLOW

### A) Bankovní převod

```typescript
// 1. Vytvoření objednávky (Checkout.tsx)
await supabase.from('orders').insert({
  status: 'confirmed',              // ✅ objednávka potvrzena
  payment_status: 'pending',        // ✅ čeká na platbu
  fulfillment_status: 'unfulfilled',
  payment_method: 'bank_transfer',
});

// 2. Zákazník vidí platební instrukce
// (číslo účtu, variabilní symbol = payment_reference)

// 3. Admin označí platbu jako přijatou
await supabase.from('orders').update({
  payment_status: 'paid',           // ✅ zaplaceno
  paid_at: new Date().toISOString(),
}).eq('id', orderId);

// 4. Admin expeduje
await supabase.from('orders').update({
  status: 'processing',             // ✅ balí se
  fulfillment_status: 'partial',
});

// 5. Admin odešle
await supabase.from('orders').update({
  status: 'shipped',                // ✅ odesláno
  fulfillment_status: 'fulfilled',
  shipped_at: new Date().toISOString(),
});

// 6. Zákazník převezme
await supabase.from('orders').update({
  status: 'delivered',              // ✅ doručeno
  delivered_at: new Date().toISOString(),
});
```

### B) Dobírka

```typescript
// 1. Vytvoření objednávky
await supabase.from('orders').insert({
  status: 'confirmed',              // ✅ objednávka potvrzena
  payment_status: 'pending',        // ✅ zaplatí při převzetí
  fulfillment_status: 'unfulfilled',
  payment_method: 'cash_on_delivery',
});

// 2-5. Stejný flow jako u převodu (processing → shipped)

// 6. Zákazník převezme a zaplatí
await supabase.from('orders').update({
  status: 'delivered',              // ✅ doručeno
  payment_status: 'paid',           // ✅ TEPRVE TEĎ zaplaceno
  paid_at: new Date().toISOString(),
  delivered_at: new Date().toISOString(),
});
```

### C) Platba kartou (pays.cz) - připravená

```typescript
// 1. Vytvoření objednávky
await supabase.from('orders').insert({
  status: 'pending',                    // ✅ čeká na dokončení platby
  payment_status: 'awaiting_confirmation', // ✅ redirect na bránu
  fulfillment_status: 'unfulfilled',
  payment_method: 'card',
});

// 2. Redirect na pays.cz
window.location.href = checkoutUrl;

// 3. Webhook od pays.cz (event: payment.succeeded)
await supabase.from('orders').update({
  status: 'confirmed',              // ✅ teď potvrzena
  payment_status: 'paid',           // ✅ zaplaceno
  paid_at: new Date().toISOString(),
}).eq('payment_reference', orderId);

// 4-6. Stejný flow jako u převodu (processing → shipped → delivered)
```

### D) Selhání/Zrušení

```typescript
// Zákazník zruší objednávku
await supabase.from('orders').update({
  status: 'cancelled',
  cancelled_at: new Date().toISOString(),
  payment_status: payment_status === 'paid' ? 'refunded' : 'failed',
});

// Technická chyba (nedostatek skladu)
await supabase.from('orders').update({
  status: 'failed',
  payment_status: 'failed',
  internal_notes: 'Nedostatek skladu',
});
```

---

## 6️⃣ PREVENCE DO BUDOUCNA

### A) Shared Constants (TypeScript)

**Vytvoř: `src/lib/constants.ts`**

```typescript
// Order statuses
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  AWAITING_CONFIRMATION: 'awaiting_confirmation',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// Fulfillment statuses
export const FULFILLMENT_STATUS = {
  UNFULFILLED: 'unfulfilled',
  PARTIAL: 'partial',
  FULFILLED: 'fulfilled',
  RETURNED: 'returned',
} as const;

export type FulfillmentStatus = typeof FULFILLMENT_STATUS[keyof typeof FULFILLMENT_STATUS];

// Payment methods
export const PAYMENT_METHOD = {
  BANK_TRANSFER: 'bank_transfer',
  CARD: 'card',
  CASH_ON_DELIVERY: 'cash_on_delivery',
} as const;

export type PaymentMethod = typeof PAYMENT_METHOD[keyof typeof PAYMENT_METHOD];

// Shipping methods
export const SHIPPING_METHOD = {
  ZASILKOVNA: 'zasilkovna',
  PERSONAL_PICKUP: 'personal_pickup',
  PERSONAL_INVOICE: 'personal_invoice',
} as const;

export type ShippingMethod = typeof SHIPPING_METHOD[keyof typeof SHIPPING_METHOD];
```

**Použití:**

```typescript
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from '../lib/constants';

// ✅ Type-safe a synchronizované
await supabase.from('orders').insert({
  status: ORDER_STATUS.CONFIRMED,
  payment_status: PAYMENT_STATUS.PENDING,
  payment_method: PAYMENT_METHOD.BANK_TRANSFER,
});

// ✅ Autocomplete v IDE
if (order.status === ORDER_STATUS.DELIVERED) {
  // ...
}
```

### B) Validační funkce

```typescript
// src/lib/orderHelpers.ts
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from './constants';

export const getInitialOrderStatus = (paymentMethod: string): OrderStatus => {
  switch (paymentMethod) {
    case PAYMENT_METHOD.BANK_TRANSFER:
    case PAYMENT_METHOD.CASH_ON_DELIVERY:
      return ORDER_STATUS.CONFIRMED;
    case PAYMENT_METHOD.CARD:
      return ORDER_STATUS.PENDING;
    default:
      return ORDER_STATUS.CONFIRMED;
  }
};

export const getInitialPaymentStatus = (paymentMethod: string): PaymentStatus => {
  switch (paymentMethod) {
    case PAYMENT_METHOD.BANK_TRANSFER:
    case PAYMENT_METHOD.CASH_ON_DELIVERY:
      return PAYMENT_STATUS.PENDING;
    case PAYMENT_METHOD.CARD:
      return PAYMENT_STATUS.AWAITING_CONFIRMATION;
    default:
      return PAYMENT_STATUS.PENDING;
  }
};

export const canCancelOrder = (status: OrderStatus): boolean => {
  return [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
  ].includes(status);
};

export const canRefund = (paymentStatus: PaymentStatus): boolean => {
  return paymentStatus === PAYMENT_STATUS.PAID;
};
```

### C) Database Validation Function

```sql
-- Funkce pro validaci přechodů mezi stavy
CREATE OR REPLACE FUNCTION validate_order_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Nelze změnit status u zrušené objednávky
  IF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
    RAISE EXCEPTION 'Cannot change status of cancelled order';
  END IF;

  -- Nelze doručit neexpedovanou objednávku
  IF NEW.status = 'delivered' AND OLD.status NOT IN ('shipped') THEN
    RAISE EXCEPTION 'Cannot deliver order that has not been shipped';
  END IF;

  -- Nelze expedovat nezaplacenou objednávku (kromě dobírky)
  IF NEW.status = 'shipped'
     AND NEW.payment_status != 'paid'
     AND NEW.payment_method != 'cash_on_delivery' THEN
    RAISE EXCEPTION 'Cannot ship unpaid order (except COD)';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_order_status
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION validate_order_status_transition();
```

### D) TypeScript types from DB

```bash
# Generovat TypeScript types z Supabase schématu
npx supabase gen types typescript --local > src/lib/database.types.ts
```

Pak v kódu:

```typescript
import type { Database } from './database.types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderUpdate = Database['public']['Tables']['orders']['Update'];

// ✅ Type-safe přístup
const order: Order = {
  status: 'confirmed',  // ✅ Type-checked proti DB schématu
  // ...
};
```

### E) Automatické testy

```typescript
// __tests__/order-status.test.ts
import { getInitialOrderStatus, getInitialPaymentStatus } from '../lib/orderHelpers';
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from '../lib/constants';

describe('Order Status Logic', () => {
  test('bank transfer creates confirmed order with pending payment', () => {
    expect(getInitialOrderStatus(PAYMENT_METHOD.BANK_TRANSFER))
      .toBe(ORDER_STATUS.CONFIRMED);
    expect(getInitialPaymentStatus(PAYMENT_METHOD.BANK_TRANSFER))
      .toBe(PAYMENT_STATUS.PENDING);
  });

  test('cash on delivery creates confirmed order with pending payment', () => {
    expect(getInitialOrderStatus(PAYMENT_METHOD.CASH_ON_DELIVERY))
      .toBe(ORDER_STATUS.CONFIRMED);
    expect(getInitialPaymentStatus(PAYMENT_METHOD.CASH_ON_DELIVERY))
      .toBe(PAYMENT_STATUS.PENDING);
  });

  test('card payment creates pending order with awaiting confirmation', () => {
    expect(getInitialOrderStatus(PAYMENT_METHOD.CARD))
      .toBe(ORDER_STATUS.PENDING);
    expect(getInitialPaymentStatus(PAYMENT_METHOD.CARD))
      .toBe(PAYMENT_STATUS.AWAITING_CONFIRMATION);
  });
});
```

---

## SHRNUTÍ - Checklist pro prevenci

- [ ] Vytvořit `src/lib/constants.ts` se všemi enumy
- [ ] Vytvořit `src/lib/orderHelpers.ts` s helper funkcemi
- [ ] Použít konstanty místo magic strings
- [ ] Generovat TypeScript types z DB (`npx supabase gen types`)
- [ ] Přidat DB trigger pro validaci přechodů
- [ ] Napsat unit testy pro status logiku
- [ ] Dokumentovat stavový model v README
- [ ] Code review: kontrolovat použití konstant vs. magic strings

---

## FINÁLNÍ PRAVIDLA

### ✅ ALWAYS:
1. Používej konstanty z `constants.ts`, NIKDY magic strings
2. `orders.status` = životní cyklus objednávky
3. `orders.payment_status` = stav platby
4. `orders.payment_method` = foreign key na `payment_methods`
5. Odděluj pojmy: order ≠ payment ≠ fulfillment ≠ shipping

### ❌ NEVER:
1. `status = paymentMethod` nebo `status = shippingMethod`
2. `status = 'paid'` (to je payment_status)
3. Magic strings ('awaiting_payment', 'cash_on_delivery' jako status)
4. Míchání konceptů (order status a payment status)
5. Hardcodované hodnoty bez konstant

---

**Nyní následuje implementace opravy v databázi a aplikaci.**
