# Price Variants Implementation Guide

## Přehled implementace

Systém nyní podporuje více cenových variant pro každý produkt (1g, 3g, 5g, 10g). Build byl úspěšný a všechny chyby byly opraveny.

## Jak to funguje

### 1. Produktové karty (ProductCard)

Každá produktová karta nyní obsahuje:

- **Výběr gramáže:** 4 tlačítka (1g, 3g, 5g, 10g)
- **Dynamické ceny:** Cena se přepočítává podle vybraného množství
- **Vizuální feedback:** Vybraná varianta je zvýrazněna zeleným gradientem

**Cenové multiplikátory:**
- 1g: 1× základní cena
- 3g: 2.9× základní cena (úspora ~3%)
- 5g: 4.7× základní cena (úspora ~6%)
- 10g: 8.9× základní cena (úspora ~11%)

Příklad: Produkt za 190 Kč/1g:
- 1g = 190 Kč
- 3g = 551 Kč (190 × 2.9)
- 5g = 893 Kč (190 × 4.7)
- 10g = 1,691 Kč (190 × 8.9)

### 2. Nákupní košík (Cart)

Košík zobrazuje:
- **Název produktu** s vybranou gramáží
- **Badge s gramáží** (zelený odznak)
- **Správnou cenu** podle varianty
- **Možnost změnit množství** každé položky samostatně

Uživatel může mít stejný produkt v košíku vícekrát s různými gramážemi (např. 1× 1g a 1× 5g stejného produktu).

### 3. CartContext

Context byl upraven pro podporu variant:

```typescript
interface CartItem {
  product: Product;
  quantity: number;
  gramAmount: string;  // Nové pole
}

// Funkce byly aktualizovány
addToCart(product, gramAmount, quantity)
removeFromCart(productId, gramAmount)
updateQuantity(productId, gramAmount, quantity)
```

### 4. Stripe integrace

#### Databáze
- `products.stripe_product_id` - ID produktu v Stripe
- `products.stripe_prices` - JSONB objekt s Price IDs pro každou gramáž
- `order_items.gram_amount` - Zaznamená vybranou variantu v objednávce

#### Edge Functions

**create-checkout-session:**
- Přijímá položky košíku s gramáží
- Načte správné Price IDs z databáze
- Vytvoří Stripe Checkout Session s těmito cenami

**stripe-webhook:**
- Zpracuje potvrzení platby
- Vytvoří objednávku v databázi
- Uloží vybranou gramáž do order_items

## Nastavení Stripe

### Krok 1: Vytvoření produktu v Stripe

Pro každou odrůdu květu:

1. Přihlaste se do [Stripe Dashboard](https://dashboard.stripe.com)
2. Jděte do "Products" → "Add product"
3. Vyplňte název a popis
4. Přidejte obrázek

### Krok 2: Přidání cen

Pro každý produkt vytvořte 4 ceny:

1. **1g varianta:**
   - Model: "One time"
   - Price: Základní cena (např. 190 Kč)
   - Description: "1g"
   - Zkopírujte Price ID (např. `price_1ABC123`)

2. **3g varianta:**
   - Price: Základní cena × 2.9 (např. 551 Kč)
   - Description: "3g"
   - Zkopírujte Price ID

3. **5g varianta:**
   - Price: Základní cena × 4.7 (např. 893 Kč)
   - Description: "5g"
   - Zkopírujte Price ID

4. **10g varianta:**
   - Price: Základní cena × 8.9 (např. 1,691 Kč)
   - Description: "10g"
   - Zkopírujte Price ID

### Krok 3: Aktualizace databáze

Pro každý produkt spusťte SQL:

```sql
UPDATE products
SET
  stripe_product_id = 'prod_xxxxxxxxxxxxx',
  stripe_prices = '{
    "1g": "price_xxxxx1g",
    "3g": "price_xxxxx3g",
    "5g": "price_xxxxx5g",
    "10g": "price_xxxxx10g"
  }'::jsonb
WHERE slug = 'nazev-produktu';
```

### Příklad s reálnými daty

```sql
-- Produkt: THC-X Květy Gelato (190 Kč/1g)
UPDATE products
SET
  stripe_product_id = 'prod_RKxyz123456',
  stripe_prices = '{
    "1g": "price_1QABCDefgh1234",
    "3g": "price_1QABCDefgh5678",
    "5g": "price_1QABCDefgh9012",
    "10g": "price_1QABCDefgh3456"
  }'::jsonb
WHERE slug = 'thc-x-kvety-gelato';
```

### Krok 4: Testování

1. **Otevřete aplikaci** a přejděte na produkty
2. **Vyberte gramáž** (např. 3g)
3. **Přidejte do košíku**
4. **Zkontrolujte cenu** v košíku
5. **Přejděte k pokladně**
6. **Použijte testovací kartu:**
   - Číslo: `4242 4242 4242 4242`
   - Datum: Jakékoliv budoucí datum
   - CVC: `123`
   - ZIP: `12345`

7. **Ověřte v Stripe Dashboard:**
   - Payments → najděte platbu
   - Zkontrolujte správnou částku

8. **Ověřte v databázi:**
   ```sql
   SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM order_items WHERE order_id = 'posledni-order-id';
   ```

## Často kladené otázky

### Q: Můžu změnit multiplikátory?

Ano, multiplikátory jsou definovány na třech místech:

1. **ProductCard.tsx** (řádek 21-26):
```typescript
const priceMultipliers: Record<string, number> = {
  '1g': 1,
  '3g': 2.9,
  '5g': 4.7,
  '10g': 8.9,
};
```

2. **CartContext.tsx** (řádek 82-87):
```typescript
const prices: Record<string, number> = {
  '1g': item.product.price,
  '3g': item.product.price * 2.9,
  '5g': item.product.price * 4.7,
  '10g': item.product.price * 8.9,
};
```

3. **Cart.tsx** (řádek 64-69):
```typescript
const priceMultipliers: Record<string, number> = {
  '1g': 1,
  '3g': 2.9,
  '5g': 4.7,
  '10g': 8.9,
};
```

### Q: Co když chci přidat novou variantu (např. 20g)?

1. Přidejte novou cenu v Stripe Dashboard
2. Aktualizujte `stripe_prices` v databázi
3. Přidejte '20g' do `gramOptions` v ProductCard.tsx
4. Přidejte multiplikátor do všech tří objektů výše

### Q: Můžu mít různé gramáže pro různé produkty?

Ano, ale budete muset upravit kód, aby gramové varianty byly dynamické pro každý produkt. Aktuálně jsou všechny varianty globální.

### Q: Jak funguje identifikace položek v košíku?

Každá položka je identifikována kombinací `productId + gramAmount`. To znamená, že stejný produkt s různou gramáží jsou považovány za samostatné položky.

### Q: Co se stane, když není v Stripe nastavená cena pro vybranou gramáž?

Edge function `create-checkout-session` vrátí chybu: "Price not found for {product} - {gramAmount}". Uživatel uvidí error message a platba se nespustí.

## Řešení problémů

### Produkt nemá stripe_prices

**Chyba:** Price not found

**Řešení:**
```sql
-- Zkontrolujte, zda produkt má stripe_prices
SELECT id, name, stripe_product_id, stripe_prices
FROM products
WHERE slug = 'nazev-produktu';

-- Pokud je NULL nebo prázdné, aktualizujte:
UPDATE products
SET stripe_prices = '{...}'::jsonb
WHERE slug = 'nazev-produktu';
```

### Ceny se nezobrazují správně

**Příčina:** Špatné multiplikátory nebo chybějící gramAmount

**Řešení:**
1. Zkontrolujte konzoli prohlížeče
2. Ověřte, že `item.gramAmount` existuje v CartContext
3. Zkontrolujte, že multiplikátory jsou stejné ve všech souborech

### Checkout session selže

**Příčina:** Chybějící nebo neplatné Price IDs

**Řešení:**
1. Ověřte Price IDs v Stripe Dashboard
2. Zkontrolujte formát JSONB v databázi (klíče v uvozovkách)
3. Zkontrolujte logy Edge Function v Supabase

## Bezpečnostní poznámky

- Všechny ceny jsou validované na serveru (Edge Functions)
- Price IDs jsou uložené v databázi, ne na frontendu
- Stripe API klíče jsou v Supabase Secrets
- Webhook používá signature verification

## Hotovo!

Systém je plně funkční a připravený k použití. Build byl úspěšný a všechny komponenty jsou propojené správně.
