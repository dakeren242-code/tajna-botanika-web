# Order Status - Quick Reference

## ✅ OPRAVENO

### Problém:
```
ERROR 23514: new row for relation "orders" violates check constraint "orders_status_check"
```

**Příčina:**
- Aplikace posílala: `'awaiting_payment'`, `'paid'`
- DB constraint povoloval: `'pending'`, `'processing'`, `'shipped'`, `'delivered'`, `'cancelled'`
- `'awaiting_payment'` a `'paid'` nebyly v constraintu → ERROR

### Řešení:
1. ✅ Opraven DB constraint
2. ✅ Vytvořeny constants (`src/lib/constants.ts`)
3. ✅ Vytvořeny helper funkce (`src/lib/orderHelpers.ts`)
4. ✅ Opraven Checkout.tsx

---

## 📋 NOVÉ KONSTANTY (src/lib/constants.ts)

### orders.status (životní cyklus objednávky)
```typescript
'pending'     // Čeká na potvrzení
'confirmed'   // Potvrzena zákazníkem
'processing'  // Zpracovává se
'shipped'     // Odesláno
'delivered'   // Doručeno
'cancelled'   // Zrušeno
'failed'      // Selhalo
```

### orders.payment_status (stav platby)
```typescript
'pending'                 // Čeká na platbu
'awaiting_confirmation'   // Čeká na potvrzení
'paid'                    // Zaplaceno
'failed'                  // Selhalo
'refunded'                // Vráceno
'partially_refunded'      // Částečně vráceno
```

### orders.fulfillment_status (stav expedice)
```typescript
'unfulfilled'  // Neexpedováno
'partial'      // Částečně
'fulfilled'    // Expedováno
'returned'     // Vráceno
```

---

## 🔧 JAK POUŽÍVAT

### ✅ SPRÁVNĚ:
```typescript
import { ORDER_STATUS, PAYMENT_STATUS } from '../lib/constants';
import { getInitialOrderStatus, getInitialPaymentStatus } from '../lib/orderHelpers';

// Použij helper funkce
const orderStatus = getInitialOrderStatus(paymentMethod);
const paymentStatus = getInitialPaymentStatus(paymentMethod);

await supabase.from('orders').insert({
  status: orderStatus,              // ✅
  payment_status: paymentStatus,    // ✅
  payment_method: 'bank_transfer',  // ✅
});

// Porovnávání
if (order.status === ORDER_STATUS.DELIVERED) {  // ✅
  // ...
}
```

### ❌ ŠPATNĚ:
```typescript
// ❌ NIKDY:
status: 'awaiting_payment'           // není v constraintu
status: 'paid'                       // to je payment_status
status: paymentMethod                // není status
status: 'bank_transfer'              // to je payment_method
payment_status: 'cash_on_delivery'   // to je payment_method

// ❌ Magic strings:
if (order.status === 'delivered') {  // ❌ místo konstant
  // ...
}
```

---

## 🎯 FLOW PODLE PLATEBNÍ METODY

### Bankovní převod:
```typescript
status: 'confirmed'           // objednávka potvrzena
payment_status: 'pending'     // čeká na platbu
→ admin označí jako zaplaceno
→ payment_status: 'paid'
→ expedice
```

### Dobírka:
```typescript
status: 'confirmed'           // objednávka potvrzena
payment_status: 'pending'     // zaplatí při převzetí
→ expedice
→ při doručení: payment_status: 'paid'
```

### Karta (připravená):
```typescript
status: 'pending'                        // čeká na platbu
payment_status: 'awaiting_confirmation'  // redirect na bránu
→ webhook od pays.cz
→ status: 'confirmed'
→ payment_status: 'paid'
→ expedice
```

---

## 📚 DOKUMENTACE

- **Kompletní dokumentace**: `ECOMMERCE_ARCHITECTURE.md`
- **Detailní analýza**: `ORDER_STATUS_FIX.md`
- **Konstanty**: `src/lib/constants.ts`
- **Helper funkce**: `src/lib/orderHelpers.ts`

---

## ⚠️ DŮLEŽITÉ PRAVIDLA

1. **Odděluj koncepty:**
   - `orders.status` = lifecycle objednávky
   - `orders.payment_status` = stav platby
   - `orders.payment_method` = JAK platí (foreign key)

2. **Používej konstanty:**
   ```typescript
   import { ORDER_STATUS } from '../lib/constants';
   // NIKDY magic strings!
   ```

3. **Používej helper funkce:**
   ```typescript
   import { getInitialOrderStatus } from '../lib/orderHelpers';
   ```

4. **Testuj:**
   - Všechny změny statusů testuj
   - Kontroluj DB constraints
   - Generuj types: `npx supabase gen types`

---

**Status:** ✅ Opraveno a hotovo!
