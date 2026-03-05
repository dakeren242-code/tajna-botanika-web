# E-Commerce Architecture - Production Ready

## 1. SOUČASNÉ PROBLÉMY A JEJICH PŘÍČINY

### Identifikované chyby:
```
PGRST204: Could not find the 'product_price' column of 'order_items'
```

**Proč vznikla:**
- V kódu (Checkout.tsx:130) se používá `product_price`, ale DB má `unit_price` a `total_price`
- Ceny jsou hardcodované na 3 místech (Checkout.tsx, CartContext.tsx)
- Neexistuje jednotná tabulka pro ceníky variant produktů
- Chybí validace FE ↔ DB konzistence

### Architektonické problémy:
1. **Nekonzistentní cenová logika** - ceny v kódu vs. DB
2. **Chybějící varianty produktů** - gram_options jsou jen JSON, ne tabulka
3. **Nedostatečný košík** - pouze localStorage, bez DB synchronizace
4. **Neúplný stavový model** - chybí stavy pro konkrétní platby
5. **Chybějící referenční kódy** - pro párování bankovních plateb
6. **Rigidní platební systém** - těžko rozšiřitelný

---

## 2. DATOVÝ MODEL - POSTGRESQL/SUPABASE

### 2.1 Produktové entity

#### `products` - Základní informace o produktech
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  sku TEXT UNIQUE,                    -- skladové číslo
  category TEXT,                      -- květy, edibles, oils

  -- Cannabis specifika
  thc_percentage NUMERIC(5,2),
  cbd_percentage NUMERIC(5,2),
  cbg_percentage NUMERIC(5,2),
  flavor_profile TEXT,
  effects TEXT,

  -- Vizuální
  image_url TEXT,
  color_accent TEXT DEFAULT '#FFD700',
  glow_color TEXT DEFAULT '#FFD700',

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,

  -- Skladová dostupnost (celková, detail je ve variants)
  total_stock INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Proč takto:**
- `sku` pro externí systémy (účetnictví, warehouse management)
- `is_active` umožňuje skrýt produkt bez smazání
- `total_stock` je agregovaný, skutečný stock je ve variants

#### `product_variants` - Varianty produktů (1g, 3g, 5g, 10g)
```sql
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- Varianta
  variant_name TEXT NOT NULL,         -- "1g", "3g", "5g", "10g"
  variant_type TEXT NOT NULL,         -- "weight" (budoucí: "bundle", "subscription")
  weight_grams INTEGER NOT NULL,      -- 1, 3, 5, 10

  -- Cena
  price NUMERIC(10,2) NOT NULL,       -- aktuální prodejní cena
  compare_at_price NUMERIC(10,2),     -- původní cena (pro slevy)
  cost_price NUMERIC(10,2),           -- nákupní cena (pro marži)

  -- Skladová dostupnost
  stock INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,

  -- Metadata
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,       -- pořadí zobrazení

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(product_id, variant_name)
);
```

**Proč takto:**
- **Historická cena v order_items** - když se cena změní, stará objednávka zůstane správná
- `compare_at_price` - pro zobrazení "dříve 500 Kč, nyní 390 Kč"
- `cost_price` - pro reporty ziskovosti
- `variant_type` - připraveno na bundle/předplatné
- `UNIQUE(product_id, variant_name)` - prevence duplicit

---

### 2.2 Košík

#### `carts` - Hlavní košíkové entity
```sql
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vlastník košíku
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULL pro guesty
  session_id TEXT,                    -- pro nepřihlášené (localStorage ID)

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,             -- košíky guestů vyprší po 30 dnech

  -- Jen jeden aktivní košík na uživatele/session
  UNIQUE(user_id),
  UNIQUE(session_id)
);

CREATE INDEX idx_carts_session ON carts(session_id) WHERE user_id IS NULL;
CREATE INDEX idx_carts_expires ON carts(expires_at) WHERE expires_at IS NOT NULL;
```

#### `cart_items` - Položky v košíku
```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,

  -- Produkt a varianta
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,

  -- Množství
  quantity INTEGER NOT NULL CHECK (quantity > 0),

  -- Časová razítka
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Jeden produkt ve variantě může být v košíku jen jednou
  UNIQUE(cart_id, product_id, variant_id)
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
```

**Proč takto:**
- **Guest košíky** - `session_id` pro nepřihlášené (generovaný UUID v localStorage)
- **Merge logika** - když se guest přihlásí, spojíme košíky přes `user_id`
- **Expirační politika** - guest košíky vyprší po 30 dnech (cron job)
- **Referenční integrita** - variant_id je explicitní, není složen z product+string

---

### 2.3 Objednávky

#### `orders` - Hlavní objednávková entita
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Zákazník
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- NULL pro guesty

  -- Identifikátory
  order_number TEXT UNIQUE NOT NULL,  -- lidsky čitelné (např. "ORD-2026-0001")
  payment_reference TEXT UNIQUE,      -- pro párování bankovních plateb

  -- Kontaktní údaje (denormalizované pro guesty)
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,

  -- Adresy (JSONB pro flexibilitu)
  shipping_address JSONB,             -- {street, city, zip, country}
  billing_address JSONB,              -- NULL = stejná jako shipping

  -- Finanční údaje
  subtotal NUMERIC(10,2) NOT NULL,    -- součet items
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  cod_fee NUMERIC(10,2) NOT NULL DEFAULT 0,  -- dobírka poplatek
  discount_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CZK',

  -- Stavy (viz state machine níže)
  status TEXT NOT NULL DEFAULT 'draft',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled',

  -- Metody
  payment_method_id UUID REFERENCES payment_methods(id),
  shipping_method_id UUID REFERENCES shipping_methods(id),

  -- Poznámky
  customer_notes TEXT,
  internal_notes TEXT,                -- pouze pro adminy

  -- Časová razítka
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ,           -- kdy zákazník dokončil checkout
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Externí reference (pro budoucí integraci)
  packeta_packet_id TEXT,             -- ID zásilky u Packety
  packeta_point_id TEXT,              -- ID výdejního místa
  packeta_point_name TEXT,
  pays_transaction_id TEXT,           -- ID transakce u pays.cz

  CONSTRAINT valid_status CHECK (
    status IN ('draft', 'awaiting_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'failed')
  ),
  CONSTRAINT valid_payment_status CHECK (
    payment_status IN ('pending', 'awaiting_confirmation', 'paid', 'failed', 'refunded', 'partially_refunded')
  ),
  CONSTRAINT valid_fulfillment_status CHECK (
    fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled', 'returned')
  )
);

CREATE INDEX idx_orders_user ON orders(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_payment_ref ON orders(payment_reference) WHERE payment_reference IS NOT NULL;
CREATE INDEX idx_orders_status ON orders(status, payment_status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
```

**Proč takto:**
- **Trojitý stavový model** - `status` (objednávka), `payment_status` (platba), `fulfillment_status` (expedice)
- **payment_reference** - UNIKÁTNÍ referenční kód pro párování bankovních plateb
- **Denormalizace kontaktů** - pro guesty ukládáme přímo, ne přes foreign keys
- **JSONB adresy** - flexibilní, není potřeba foreign key na addresses (guest může mít jakoukoliv adresu)
- **Indexy** - rychlé dotazy podle uživatele, emailu, reference, stavů

#### `order_items` - Položky objednávky (HISTORICKÁ DATA)
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Produkt (reference)
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,  -- může být smazán
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,

  -- HISTORICKÁ DATA (jak to bylo v době objednávky)
  product_name TEXT NOT NULL,
  product_sku TEXT,
  variant_name TEXT NOT NULL,         -- "3g"
  variant_weight_grams INTEGER NOT NULL,  -- 3

  -- Ceny (JAK BYLY V DOBĚ OBJEDNÁVKY)
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(10,2) NOT NULL,  -- unit_price * quantity

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
```

**Proč takto:**
- **KRITICKÉ**: Ukládáme `unit_price` jak byla v době objednávky, ne referenci na aktuální cenu
- **Denormalizace produktových dat** - kdyby byl produkt smazán, objednávka zůstane validní
- `ON DELETE SET NULL` - product_id/variant_id mohou být NULL, ale `product_name` zůstává
- **line_total** - pre-počítané, aby změny DPH/zaokrouhlování neměnily historické objednávky

---

### 2.4 Platební metody

#### `payment_methods` - Definice platebních metod
```sql
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifikace
  code TEXT UNIQUE NOT NULL,          -- 'bank_transfer', 'card', 'cash_on_delivery'
  name_cs TEXT NOT NULL,              -- 'Bankovní převod'
  name_en TEXT,
  description_cs TEXT,
  description_en TEXT,

  -- Typ
  method_type TEXT NOT NULL,          -- 'manual', 'gateway', 'offline'

  -- Nastavení
  is_active BOOLEAN DEFAULT false,    -- DŮLEŽITÉ: neaktivní metody se nezobrazí
  requires_online_payment BOOLEAN DEFAULT false,
  adds_fee BOOLEAN DEFAULT false,
  fee_amount NUMERIC(10,2) DEFAULT 0,
  fee_percentage NUMERIC(5,2) DEFAULT 0,

  -- Konfigurace (pro gateway)
  gateway_config JSONB,               -- {api_key, merchant_id, ...}

  -- Zobrazení
  icon_url TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT valid_method_type CHECK (
    method_type IN ('manual', 'gateway', 'offline')
  )
);

-- Předvyplnění dat
INSERT INTO payment_methods (code, name_cs, method_type, is_active, requires_online_payment, adds_fee, fee_amount) VALUES
  ('bank_transfer', 'Bankovní převod', 'manual', true, false, false, 0),
  ('cash_on_delivery', 'Dobírka', 'offline', true, false, true, 30),
  ('card', 'Platba kartou (pays.cz)', 'gateway', false, true, false, 0);  -- VYPNUTO
```

**Proč takto:**
- **is_active** - klíčový přepínač, platební metody lze zapínat/vypínat bez změny kódu
- **method_type**:
  - `manual` - převod (čeká se na potvrzení administrátorem)
  - `gateway` - online platba (pays.cz, Stripe, ...)
  - `offline` - dobírka (platba při převzetí)
- **fee_amount/fee_percentage** - pro různé poplatky (COD, karta)
- **gateway_config JSONB** - flexibilní ukládání API klíčů, endpoint URL, ...

#### `shipping_methods` - Definice dopravních metod
```sql
CREATE TABLE shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifikace
  code TEXT UNIQUE NOT NULL,          -- 'zasilkovna', 'personal_pickup', 'personal_invoice'
  name_cs TEXT NOT NULL,
  name_en TEXT,
  description_cs TEXT,

  -- Typ dopravy
  carrier_type TEXT NOT NULL,         -- 'packeta', 'personal', 'courier'

  -- Nastavení
  is_active BOOLEAN DEFAULT true,
  requires_address BOOLEAN DEFAULT true,
  requires_packeta_point BOOLEAN DEFAULT false,

  -- Cena
  base_price NUMERIC(10,2) NOT NULL,
  free_shipping_threshold NUMERIC(10,2),  -- nad 1000 Kč zdarma

  -- Konfigurace (pro Packetu apod.)
  carrier_config JSONB,               -- {api_key, sender_id, ...}

  -- Zobrazení
  icon_url TEXT,
  estimated_days TEXT,                -- "1-2 dny"
  sort_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT valid_carrier_type CHECK (
    carrier_type IN ('packeta', 'personal', 'courier', 'post')
  )
);

-- Předvyplnění dat
INSERT INTO shipping_methods (code, name_cs, carrier_type, is_active, requires_address, requires_packeta_point, base_price, free_shipping_threshold, estimated_days) VALUES
  ('zasilkovna', 'Zásilkovna', 'packeta', true, false, true, 79, 1000, '1-2 dny'),
  ('personal_pickup', 'Osobní odběr - Praha', 'personal', true, false, false, 0, NULL, 'ihned'),
  ('personal_invoice', 'Osobní odběr - Fakturace', 'personal', true, false, false, 0, NULL, 'ihned');
```

**Proč takto:**
- **requires_packeta_point** - FE podle toho zobrazí Packeta widget
- **free_shipping_threshold** - nad 1000 Kč doprava zdarma
- **carrier_config JSONB** - až bude Packeta aktivní, uložíme API key sem
- **carrier_type** - umožňuje rozšíření (DPD, PPL, ...)

---

### 2.5 Platební transakce

#### `payment_transactions` - Historie plateb
```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method_id UUID REFERENCES payment_methods(id),

  -- Částka
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CZK',

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',

  -- Reference
  transaction_reference TEXT,         -- od banky, pays.cz, apod.
  gateway_transaction_id TEXT,        -- ID z platební brány

  -- Metadata
  gateway_response JSONB,             -- surová odpověď z brány
  customer_ip TEXT,
  user_agent TEXT,

  -- Časová razítka
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,

  CONSTRAINT valid_transaction_status CHECK (
    status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')
  )
);

CREATE INDEX idx_payment_transactions_order ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_reference ON payment_transactions(transaction_reference) WHERE transaction_reference IS NOT NULL;
```

**Proč takto:**
- **Historie všech pokusů o platbu** - i neúspěšné pokusy se zaznamenávají
- **gateway_response JSONB** - pro debugging a audit
- **transaction_reference** - pro párování s bankovním výpisem

---

## 3. STAVOVÝ MODEL OBJEDNÁVKY

### 3.1 State Machine

```
[DRAFT]
   ↓ (checkout dokončen)
[AWAITING_PAYMENT] ← (bank_transfer)
   ↓ (zaplaceno)
[PAID]
   ↓ (admin zahájí expedici)
[PROCESSING]
   ↓ (odesláno)
[SHIPPED]
   ↓ (doručeno)
[DELIVERED]

ALTERNATIVNÍ FLOW:
[DRAFT]
   ↓ (cash_on_delivery)
[PAID] (okamžitě, payment_status='pending')
   ↓
[PROCESSING]
   → [SHIPPED]
   → [DELIVERED]
   → payment_status='paid' (po potvrzení přijetí platby)

CARD (BUDOUCNOST):
[DRAFT]
   ↓ (redirect na pays.cz)
[AWAITING_PAYMENT]
   ↓ (webhook: zaplaceno)
[PAID]
   → ...

CANCEL:
kdykoliv → [CANCELLED]
```

### 3.2 Popis stavů

| Status | Popis | Payment Status | Fulfillment Status |
|--------|-------|----------------|-------------------|
| `draft` | Košík, checkout nezahá jen | `pending` | `unfulfilled` |
| `awaiting_payment` | Čeká se na platbu (převod, karta) | `pending` | `unfulfilled` |
| `paid` | Zaplaceno | `paid` | `unfulfilled` |
| `processing` | Balí se | `paid` nebo `pending` (COD) | `partial` |
| `shipped` | Odesláno | `paid` nebo `pending` (COD) | `fulfilled` |
| `delivered` | Doručeno | `paid` | `fulfilled` |
| `cancelled` | Zrušeno | `failed` nebo `refunded` | `unfulfilled` |
| `failed` | Selhalo | `failed` | `unfulfilled` |

### 3.3 Přechody podle platební metody

#### **Bankovní převod:**
1. Checkout dokončen → `awaiting_payment`, `payment_status=pending`
2. Admin označí platbu jako přijatou → `paid`, `payment_status=paid`
3. Admin expeduje → `processing` → `shipped` → `delivered`

#### **Dobírka:**
1. Checkout dokončen → `paid`, `payment_status=pending`
   - PROČ PAID: objednávka je potvrzena, jen platba bude později
2. Admin expeduje → `processing` → `shipped`
3. Kuřír potvrdí přijetí platby → `payment_status=paid`, `delivered`

#### **Karta (pays.cz) - budoucí:**
1. Checkout dokončen → redirect na pays.cz → `awaiting_payment`
2. Webhook od pays.cz → `paid`, `payment_status=paid`
3. Admin expeduje → `processing` → `shipped` → `delivered`

---

## 4. PLATEBNÍ METODY - DETAILNĚ

### 4.1 Bankovní převod (AKTIVNÍ)

#### Flow:
```
1. Uživatel vybere "Bankovní převod"
2. Vloží kontaktní údaje, potvrdí
3. Backend vytvoří objednávku:
   - status = 'awaiting_payment'
   - payment_status = 'pending'
   - payment_reference = generovaný kód (např. "2026001")
4. FE zobrazí platební instrukce:
   - číslo účtu: 2001645045/2010
   - částka: 489.00 Kč
   - variabilní symbol: 2026001
   - zpráva: "Objednávka 2026001"
5. Uživatel provede platbu v bance
6. Admin v admin panelu:
   - importuje bankovní výpis (CSV)
   - nebo ručně označí platbu jako přijatou
   - párování přes payment_reference (variabilní symbol)
7. Backend:
   - UPDATE orders SET status='paid', payment_status='paid', paid_at=now()
   - INSERT INTO payment_transactions (...)
8. Email: "Platba přijata, brzy expedujeme"
```

#### Generování payment_reference:
```sql
-- Funkce pro generování referenčního kódu
CREATE OR REPLACE FUNCTION generate_payment_reference()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  sequence_num INTEGER;
  reference TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(payment_reference FROM '^\d{4}(\d+)$') AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM orders
  WHERE payment_reference ~ ('^' || year);

  reference := year || LPAD(sequence_num::TEXT, 6, '0');
  RETURN reference;
END;
$$ LANGUAGE plpgsql;

-- Trigger při vytvoření objednávky
CREATE TRIGGER set_payment_reference
BEFORE INSERT ON orders
FOR EACH ROW
WHEN (NEW.payment_reference IS NULL)
EXECUTE FUNCTION trigger_set_payment_reference();
```

**Proč takto:**
- Formát: `YYYYNNNNNN` (rok + pořadové číslo)
- Příklad: `2026000001`, `2026000002`, ...
- Unikátní, lidsky čitelné, sekvenční

#### Párování plateb:
Admin panel bude mít:
- Import CSV z banky (Fio banka API)
- Automatické párování přes variabilní symbol = payment_reference
- Ruční přiřazení pro nestandardní platby

---

### 4.2 Dobírka (AKTIVNÍ)

#### Flow:
```
1. Uživatel vybere "Dobírka"
2. Vybere způsob dopravy (ne "osobní odběr")
3. Backend přidá COD fee (+30 Kč) pokud není osobní odběr
4. Backend vytvoří objednávku:
   - status = 'paid'  ← DŮLEŽITÉ: je "paid" protože je potvrzena
   - payment_status = 'pending'  ← platba bude až při doručení
   - payment_method = 'cash_on_delivery'
5. Admin expeduje jako normální objednávku
6. Kurýr/Packeta potvrdí doručení + přijetí platby
7. Admin označí:
   - UPDATE orders SET payment_status='paid', paid_at=now(), status='delivered'
```

**Proč status='paid' hned:**
- Objednávka je POTVRZENÁ a bude expedována
- `payment_status='pending'` indikuje, že peníze ještě nejsou na účtu
- Umožňuje normální flow expedice bez speciálního kódu

---

### 4.3 Platba kartou - pays.cz (VYPNUTÁ, PŘIPRAVENÁ)

#### Architektura:

```
[Frontend]
   ↓ POST /api/create-checkout
[Edge Function: create-pays-checkout]
   ↓ API call
[pays.cz]
   ← vrátí checkout URL
[Frontend]
   ← redirect uživatele na pays.cz
[uživatel zaplatí]
   ↓ webhook
[Edge Function: pays-webhook]
   ↓ UPDATE orders
[Database]
```

#### Database preparations:
```sql
-- payment_methods už má záznam s is_active=false
UPDATE payment_methods
SET is_active = true
WHERE code = 'card';

-- gateway_config obsahuje:
{
  "api_key": "...",
  "merchant_id": "...",
  "webhook_secret": "...",
  "environment": "sandbox" | "production"
}
```

#### Edge Function: create-pays-checkout (připraveno, nefunkční)
```typescript
// supabase/functions/create-pays-checkout/index.ts
Deno.serve(async (req) => {
  const { orderId, returnUrl, cancelUrl } = await req.json();

  // 1. Načíst objednávku
  const { data: order } = await supabase
    .from('orders')
    .select('*, payment_method:payment_methods(*)')
    .eq('id', orderId)
    .single();

  // 2. Načíst gateway config
  const config = order.payment_method.gateway_config;

  // 3. Zavolat pays.cz API
  const response = await fetch('https://api.pays.cz/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.api_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(order.total_amount * 100), // v haléřích
      currency: 'CZK',
      order_id: order.order_number,
      success_url: returnUrl,
      cancel_url: cancelUrl,
      webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/pays-webhook`,
    }),
  });

  const checkoutData = await response.json();

  // 4. Uložit transaction
  await supabase.from('payment_transactions').insert({
    order_id: orderId,
    payment_method_id: order.payment_method_id,
    amount: order.total_amount,
    status: 'pending',
    gateway_transaction_id: checkoutData.session_id,
  });

  return Response.json({
    checkoutUrl: checkoutData.url,
  });
});
```

#### Edge Function: pays-webhook (již existuje)
```typescript
// supabase/functions/pays-webhook/index.ts
Deno.serve(async (req) => {
  const payload = await req.json();
  const signature = req.headers.get('pays-signature');

  // 1. Ověřit webhook signature
  // TODO: implementovat

  // 2. Zpracovat podle event type
  if (payload.event === 'payment.succeeded') {
    const { orderId, transactionId } = payload.data;

    // Update objednávky
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        pays_transaction_id: transactionId,
      })
      .eq('order_number', orderId);

    // Update transakce
    await supabase
      .from('payment_transactions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        gateway_response: payload,
      })
      .eq('gateway_transaction_id', transactionId);

    // TODO: poslat email
  }

  return Response.json({ received: true });
});
```

**Jak aktivovat později:**
1. V admin panelu: Settings → Payment Methods → Card → Enable
2. Vyplnit gateway_config (API key, merchant ID)
3. Nastavit webhook URL v pays.cz dashboardu
4. Deploy edge functions (jsou připravené)
5. Otestovat na sandboxu

**Proč takto:**
- Edge Functions jsou připravené, ale neaktivní
- Frontend kontroluje `payment_methods.is_active` a nezobrazí kartu
- Aktivace = změna 1 řádku v DB + deploy funkcí
- Žádná změna kódu FE/BE

---

### 4.4 Prevence duplicitních objednávek

```typescript
// Frontend: Checkout.tsx
const [submitting, setSubmitting] = useState(false);

const handleCheckout = async () => {
  if (submitting) return; // prevence dvojkliku
  setSubmitting(true);

  try {
    // vytvoření objednávky
  } finally {
    setSubmitting(false);
  }
};
```

```sql
-- Backend: Unique constraint na payment_reference
ALTER TABLE orders ADD CONSTRAINT unique_payment_reference
UNIQUE (payment_reference);

-- Idempotency check v Edge Function
CREATE TABLE idempotency_keys (
  key TEXT PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours')
);

CREATE INDEX idx_idempotency_expires ON idempotency_keys(expires_at);
```

---

## 5. PACKETA INTEGRACE (PŘIPRAVENÁ, NEVYPNUTÁ)

### 5.1 Architektura

```
[Frontend: Checkout]
   ↓ user vybere "Zásilkovna"
[Packeta Widget]  ← načte se z CDN
   ↓ uživatel vybere výdejní místo
[Frontend]
   ↓ uloží packeta_point_id, packeta_point_name
[Backend]
   ↓ vytvoří objednávku
[Database: orders.packeta_point_id]

--- PO EXPEDICI ---

[Admin Dashboard]
   ↓ admin klikne "Expedovat"
[Edge Function: create-packeta-packet]
   ↓ API call
[Packeta API]
   ← vrátí packet_id, tracking_number
[Database: orders.packeta_packet_id]
   ↓
[Email: tracking link]
```

### 5.2 Database preparations

```sql
-- orders už má sloupce:
-- packeta_point_id TEXT
-- packeta_point_name TEXT
-- packeta_packet_id TEXT (vyplní se po vytvoření zásilky)

-- shipping_methods už má záznam
SELECT * FROM shipping_methods WHERE code='zasilkovna';
-- {
--   "code": "zasilkovna",
--   "carrier_config": {
--     "api_key": null,  ← vyplní se při aktivaci
--     "sender_id": null
--   }
-- }
```

### 5.3 Edge Function: create-packeta-packet (připraveno, nedeploynuté)

```typescript
// supabase/functions/create-packeta-packet/index.ts
Deno.serve(async (req) => {
  const { orderId } = await req.json();

  // 1. Načíst objednávku
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      shipping_method:shipping_methods(*),
      order_items(*)
    `)
    .eq('id', orderId)
    .single();

  const config = order.shipping_method.carrier_config;

  // 2. Zavolat Packeta API
  const response = await fetch('https://api.packeta.com/v1/packets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.api_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender_id: config.sender_id,
      recipient: {
        name: `${order.customer_first_name} ${order.customer_last_name}`,
        email: order.customer_email,
        phone: order.customer_phone,
      },
      point_id: order.packeta_point_id,
      cod: order.payment_method_code === 'cash_on_delivery' ? order.total_amount : 0,
      value: order.subtotal,
      weight: calculateWeight(order.order_items), // gramy
      items: order.order_items.map(item => ({
        name: item.product_name,
        quantity: item.quantity,
      })),
    }),
  });

  const packetData = await response.json();

  // 3. Update objednávky
  await supabase
    .from('orders')
    .update({
      packeta_packet_id: packetData.id,
      status: 'shipped',
      shipped_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  // 4. TODO: poslat email s tracking linkem

  return Response.json({
    packetId: packetData.id,
    trackingNumber: packetData.tracking_number,
    trackingUrl: `https://tracking.packeta.com/${packetData.tracking_number}`,
  });
});
```

**Jak aktivovat později:**
1. Získat API key od Packety
2. Update shipping_method:
   ```sql
   UPDATE shipping_methods
   SET carrier_config = '{"api_key": "...", "sender_id": "..."}'
   WHERE code = 'zasilkovna';
   ```
3. Deploy edge function `create-packeta-packet`
4. V admin dashboardu se objeví tlačítko "Vytvořit zásilku"

**Proč takto:**
- Edge Function je připravená, ale nezavolaná
- Frontend již zobrazuje Packetu jako možnost
- Aktivace = vyplnění API key + deploy funkce
- Žádná změna kódu

---

## 6. KOŠÍK - GUEST + AUTHENTICATED

### 6.1 LocalStorage (současný stav)

```typescript
// CartContext.tsx (současný)
localStorage.setItem('cart', JSON.stringify(items));
```

**Problémy:**
- Není synchronizováno mezi zařízeními
- Při přihlášení se nemerge s DB košíkem
- Nelze obnovit opuštěný košík (email marketing)

### 6.2 Nový hybrid approach

```typescript
// lib/cart.ts
export class CartService {
  private sessionId: string;

  constructor() {
    // Generovat session ID pro guesty
    this.sessionId = localStorage.getItem('cart_session_id') ||
      this.generateSessionId();
  }

  private generateSessionId(): string {
    const id = crypto.randomUUID();
    localStorage.setItem('cart_session_id', id);
    return id;
  }

  async getCart(userId?: string): Promise<Cart> {
    if (userId) {
      // Přihlášený: načti z DB
      const { data } = await supabase
        .from('carts')
        .select('*, cart_items(*, product:products(*), variant:product_variants(*))')
        .eq('user_id', userId)
        .maybeSingle();

      return data || await this.createCart(userId);
    } else {
      // Guest: načti z DB podle session_id
      const { data } = await supabase
        .from('carts')
        .select('*, cart_items(*, product:products(*), variant:product_variants(*))')
        .eq('session_id', this.sessionId)
        .maybeSingle();

      return data || await this.createGuestCart();
    }
  }

  async addItem(variantId: string, quantity: number, userId?: string) {
    const cart = await this.getCart(userId);

    // Upsert item
    await supabase
      .from('cart_items')
      .upsert({
        cart_id: cart.id,
        variant_id: variantId,
        quantity,
      }, {
        onConflict: 'cart_id,variant_id',
      });
  }

  async mergeOnLogin(userId: string) {
    // Najdi guest košík
    const { data: guestCart } = await supabase
      .from('carts')
      .select('*, cart_items(*)')
      .eq('session_id', this.sessionId)
      .maybeSingle();

    if (!guestCart) return;

    // Najdi user košík
    let { data: userCart } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!userCart) {
      // Převeď guest cart na user cart
      await supabase
        .from('carts')
        .update({
          user_id: userId,
          session_id: null,
        })
        .eq('id', guestCart.id);
    } else {
      // Merge items
      for (const item of guestCart.cart_items) {
        await supabase
          .from('cart_items')
          .upsert({
            cart_id: userCart.id,
            variant_id: item.variant_id,
            quantity: item.quantity,
          }, {
            onConflict: 'cart_id,variant_id',
            // Sečti quantity pokud už existuje
          });
      }

      // Smazat guest cart
      await supabase
        .from('carts')
        .delete()
        .eq('id', guestCart.id);
    }
  }
}
```

**Proč takto:**
- **Guest košíky v DB** - umožňuje abandoned cart emaily
- **Session ID** - UUID v localStorage, perzistentní napříč relacemi
- **Merge logika** - při přihlášení se košíky spojí
- **Fallback na localStorage** - pokud DB selže, košík zůstane v localStorage

### 6.3 Validace cen při checkoutu

```typescript
// Checkout flow
async function validateCart(cartItems: CartItem[]) {
  const errors: string[] = [];

  for (const item of cartItems) {
    // Načti aktuální cenu z DB
    const { data: variant } = await supabase
      .from('product_variants')
      .select('price, stock, is_available, product:products(is_active)')
      .eq('id', item.variant_id)
      .single();

    // Kontrola dostupnosti
    if (!variant.product.is_active || !variant.is_available) {
      errors.push(`${item.product_name} již není dostupný`);
    }

    // Kontrola skladu
    if (variant.stock < item.quantity) {
      errors.push(`${item.product_name} má na skladě pouze ${variant.stock} ks`);
    }

    // DŮLEŽITÉ: Aktualizovat cenu před vytvořením objednávky
    item.current_price = variant.price;
  }

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  return cartItems;
}
```

---

## 7. FRONTEND FLOW

### 7.1 Přidání do košíku

```
[ProductCard]
  ↓ user vybere "3g", klikne "Do košíku"
[CartService.addItem(variant_id, quantity)]
  ↓ if (user) → DB, else → DB with session_id
  ↓ also update localStorage (cache)
[Toast notification: "Přidáno do košíku"]
[Header: košík counter++]
```

### 7.2 Checkout - Guest

```
[Cart page]
  ↓ "Pokračovat k pokladně"
[Checkout page]
  ↓ formulář:
     - Email*
     - Jméno*, Příjmení*
     - Telefon*
     - Způsob dopravy* (radio)
       → pokud Zásilkovna: zobrazit Packeta widget
     - Způsob platby* (radio)
       → pokud Dobírka && !osobní_odběr: +30 Kč
     - Poznámka
  ↓ "Dokončit objednávku" (disabled pokud !formValid)
[Backend: createOrder]
  ↓ validovat cart (ceny, sklad)
  ↓ vytvořit order (status='awaiting_payment' nebo 'paid')
  ↓ vytvořit order_items (s aktuálními cenami)
  ↓ aktualizovat stock
  ↓ smazat cart
[Frontend: redirect]
  → pokud bank_transfer: zobrazit modal s platebními údaji
  → pokud cash_on_delivery: /success
  → pokud card: redirect na pays.cz (budoucí)
```

### 7.3 Checkout - Authenticated

```
Stejný flow, ale:
- Email, jméno, telefon předvyplněné z user_profiles
- Po objednávce: order.user_id = user.id
- Uživatel může vidět historii v "Moje objednávky"
```

### 7.4 Success page

```
/success?order=2026001&payment=bank_transfer&amount=489

[SuccessPage]
  ↓ if payment=bank_transfer:
     - zobrazit platební instrukce
     - účet, VS, částka
     - tlačítko "Kopírovat VS"
  ↓ if payment=cash_on_delivery:
     - "Objednávka přijata, zaplatíte při převzetí"
  ↓ if payment=card:
     - "Platba proběhla úspěšně"

  ↓ společné:
     - číslo objednávky
     - tracking objednávky (link na /orders/{id})
     - email potvrzení odeslán
```

---

## 8. BACKEND API (Edge Functions)

### 8.1 create-order

```typescript
// supabase/functions/create-order/index.ts
Deno.serve(async (req) => {
  const {
    cartId,
    customerData,
    paymentMethodId,
    shippingMethodId,
    packetaPointId,
  } = await req.json();

  // 1. Načíst a validovat košík
  const cart = await validateCart(cartId);

  // 2. Spočítat ceny
  const subtotal = cart.items.reduce((sum, item) =>
    sum + item.variant.price * item.quantity, 0);

  const shippingCost = calculateShipping(subtotal, shippingMethodId);
  const codFee = calculateCodFee(paymentMethodId, shippingMethodId);
  const total = subtotal + shippingCost + codFee;

  // 3. Vytvořit objednávku
  const paymentReference = await generatePaymentReference();

  const { data: order } = await supabase
    .from('orders')
    .insert({
      user_id: customerData.userId || null,
      payment_reference: paymentReference,
      customer_email: customerData.email,
      customer_phone: customerData.phone,
      customer_first_name: customerData.firstName,
      customer_last_name: customerData.lastName,
      shipping_address: customerData.shippingAddress,
      subtotal,
      shipping_cost: shippingCost,
      cod_fee: codFee,
      total_amount: total,
      status: paymentMethodId === 'cash_on_delivery' ? 'paid' : 'awaiting_payment',
      payment_status: 'pending',
      payment_method_id: paymentMethodId,
      shipping_method_id: shippingMethodId,
      packeta_point_id: packetaPointId,
    })
    .select()
    .single();

  // 4. Vytvořit order items
  const orderItems = cart.items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    product_name: item.product.name,
    variant_name: item.variant.variant_name,
    variant_weight_grams: item.variant.weight_grams,
    unit_price: item.variant.price,  // ← AKTUÁLNÍ CENA
    quantity: item.quantity,
    line_total: item.variant.price * item.quantity,
  }));

  await supabase.from('order_items').insert(orderItems);

  // 5. Aktualizovat stock
  for (const item of cart.items) {
    await supabase.rpc('decrement_stock', {
      variant_id: item.variant_id,
      quantity: item.quantity,
    });
  }

  // 6. Smazat košík
  await supabase.from('carts').delete().eq('id', cartId);

  // 7. Poslat email
  await sendOrderConfirmationEmail(order);

  return Response.json({ order });
});
```

---

## 9. PREVENCE CHYB

### 9.1 Proč vznikla chyba PGRST204

```typescript
// ŠPATNĚ (Checkout.tsx:130):
const orderItems = items.map(item => ({
  product_price: price,  // ← sloupec neexistuje!
  variant: item.gramAmount,
}));

// SPRÁVNĚ:
const orderItems = items.map(item => ({
  unit_price: price,     // ← sloupec existuje
  variant_name: item.gramAmount,
}));
```

**Root cause:**
1. Hardcodované ceny v kódu (priceMap)
2. Chybějící tabulka product_variants
3. Nekonzistence mezi FE a DB schématem

### 9.2 Jak se jí vyhneš

1. **TypeScript types from DB:**
   ```bash
   npx supabase gen types typescript --local > src/lib/database.types.ts
   ```

2. **Validace na FE:**
   ```typescript
   const { error } = await supabase
     .from('order_items')
     .insert(orderItems);

   if (error) {
     console.error('DB error:', error);
     // Zobrazit user-friendly chybu
   }
   ```

3. **Centralizovaný ceník:**
   ```typescript
   // lib/pricing.ts
   export async function getVariantPrice(variantId: string): Promise<number> {
     const { data } = await supabase
       .from('product_variants')
       .select('price')
       .eq('id', variantId)
       .single();

     return data.price;
   }

   // NIKDY hardcoded priceMap!
   ```

4. **DB constraints:**
   ```sql
   -- Zabránit záporným cenám
   ALTER TABLE product_variants
   ADD CONSTRAINT positive_price CHECK (price >= 0);

   -- Zabránit záporným stockům
   CREATE OR REPLACE FUNCTION decrement_stock(
     variant_id UUID,
     quantity INTEGER
   ) RETURNS VOID AS $$
   BEGIN
     UPDATE product_variants
     SET stock = stock - quantity
     WHERE id = variant_id
     AND stock >= quantity;  -- fail pokud není dost

     IF NOT FOUND THEN
       RAISE EXCEPTION 'Insufficient stock';
     END IF;
   END;
   $$ LANGUAGE plpgsql;
   ```

5. **Idempotence:**
   ```typescript
   // Frontend: prevence dvojkliku
   const [submitting, setSubmitting] = useState(false);

   // Backend: idempotency key
   const idempotencyKey = req.headers.get('idempotency-key');
   ```

---

## 10. MIGRACE Z SOUČASNÉHO STAVU

### 10.1 Migrační stratégia

```sql
-- 1. Vytvořit nové tabulky (product_variants, carts, ...)
-- 2. Migrovat data z products do product_variants
INSERT INTO product_variants (product_id, variant_name, weight_grams, price)
SELECT
  id,
  '1g',
  1,
  190
FROM products
UNION ALL
SELECT id, '3g', 3, 490 FROM products
UNION ALL
SELECT id, '5g', 5, 690 FROM products
UNION ALL
SELECT id, '10g', 10, 1290 FROM products;

-- 3. Aktualizovat order_items (přidat variant_id, opravit sloupce)
ALTER TABLE order_items ADD COLUMN variant_id UUID;
ALTER TABLE order_items RENAME COLUMN product_price TO unit_price;

-- 4. Updatovat existující objednávky
UPDATE order_items oi
SET variant_id = pv.id
FROM product_variants pv
WHERE oi.product_id = pv.product_id
AND oi.gram_amount = pv.variant_name;

-- 5. Vytvořit payment_methods, shipping_methods
-- 6. Updatovat orders (přidat foreign keys)
```

### 10.2 Zpětná kompatibilita

```typescript
// Pro existující objednávky, které nemají variant_id:
const { data: orderItems } = await supabase
  .from('order_items')
  .select(`
    *,
    product:products(*),
    variant:product_variants(*)
  `)
  .eq('order_id', orderId);

// Fallback pro staré objednávky
const displayName = item.variant
  ? `${item.product.name} (${item.variant.variant_name})`
  : `${item.product_name} (${item.gram_amount})`;
```

---

## 11. SHRNUTÍ ARCHITEKTURY

### ✅ Co je nové a proč

| Komponenta | Současný stav | Nový stav | Benefit |
|-----------|---------------|-----------|---------|
| **Ceny** | Hardcodované v kódu | `product_variants` tabulka | Historická konzistence, snadná správa |
| **Košík** | Pouze localStorage | Hybrid DB + localStorage | Synchronizace, abandoned cart, merge |
| **Platby** | Rigidní if/else | `payment_methods` tabulka | Zapínaní/vypínání bez kódu |
| **Doprava** | Rigidní if/else | `shipping_methods` tabulka | Rozšiřitelnost (Packeta, DPD, ...) |
| **Stavy objednávky** | 2 pole (status, payment_status) | 3 pole + state machine | Jasný flow, nezávislá expedice/platba |
| **Párování plateb** | Chybí | `payment_reference` + import CSV | Automatizace, audit trail |
| **Packeta** | Chybí | Připravená architektura | Aktivace bez refaktoringu |
| **Platba kartou** | Chybí | Připravené Edge Functions | Aktivace nastavením v DB |
| **Prevence chyb** | Ad-hoc | Constraints, validace, types | Robustnost, prevence |

### 🎯 Klíčové principy

1. **Separation of Concerns** - platby, doprava, ceník jsou oddělené entity
2. **Configuration over Code** - aktivace funkcí v DB, ne v kódu
3. **Historical Data Integrity** - ceny v order_items jsou snapshot, ne reference
4. **Extensibility** - snadné přidání nové platby/dopravy
5. **Guest-first** - checkout bez registrace, data uložená pro audit
6. **State Machine** - jasné přechody mezi stavy
7. **Idempotence** - prevence duplicit

### 📦 Deployment checklist (budoucí aktivace)

#### Aktivace platby kartou (pays.cz):
- [ ] Získat API key od pays.cz
- [ ] `UPDATE payment_methods SET is_active=true, gateway_config='{"api_key":"..."}' WHERE code='card'`
- [ ] Deploy edge functions: `create-pays-checkout`, `pays-webhook`
- [ ] Nastavit webhook URL v pays.cz dashboardu
- [ ] Otestovat na sandboxu

#### Aktivace Packety:
- [ ] Získat API key od Packety
- [ ] `UPDATE shipping_methods SET carrier_config='{"api_key":"...","sender_id":"..."}' WHERE code='zasilkovna'`
- [ ] Deploy edge function: `create-packeta-packet`
- [ ] Otestovat vytvoření zásilky

---

## 12. NEXT STEPS (implementační plán)

### Fáze 1: Database (AKTUÁLNÍ)
1. ✅ Vytvořit novou DB strukturu (migration)
2. ✅ Migrovat existující data
3. ✅ Vytvořit RLS policies
4. ✅ Seed data (payment_methods, shipping_methods)

### Fáze 2: Backend Services
1. Vytvořit CartService (DB + localStorage hybrid)
2. Vytvořit PricingService (načítání cen z DB)
3. Vytvořit OrderService (vytváření objednávek)
4. Vytvořit Edge Function: create-order
5. Vytvořit Edge Function: create-pays-checkout (připravená)
6. Vytvořit Edge Function: create-packeta-packet (připravená)

### Fáze 3: Frontend Refactor
1. Aktualizovat CartContext (použít CartService)
2. Aktualizovat Checkout flow
3. Přidat Packeta widget (když je vybraná Zásilkovna)
4. Success page s platebními instrukcemi
5. Order history page

### Fáze 4: Admin Panel
1. Payment management (označit jako zaplaceno)
2. Order fulfillment (expedice)
3. CSV import (bankovní výpis)
4. Packeta integrace (vytvoř it zásilku)

### Fáze 5: Testing & Polish
1. E2E testy (guest checkout, auth checkout)
2. Validace všech flows
3. Email notifikace
4. Performance optimalizace

---

**Konec architektury. Nyní následuje implementace.**
