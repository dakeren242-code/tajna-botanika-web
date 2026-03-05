/**
 * PŘÍKLADY INTEGRACE META TRACKING DO REACT KOMPONENT
 *
 * Tyto příklady ukazují, jak správně integrovat Meta Pixel + CAPI tracking
 * do jednotlivých částí vaší aplikace.
 */

import { useEffect } from 'react';
import { useMetaTracking } from './hooks/useMetaTracking';
import { useParams } from 'react-router-dom';

// ============================================================================
// 1. TRACKING ZOBRAZENÍ PRODUKTU (ViewContent)
// ============================================================================

export function ProductDetailExample() {
  const { slug } = useParams();
  const { trackViewContent } = useMetaTracking();

  useEffect(() => {
    async function loadProduct() {
      // Načtěte produkt z databáze
      const product = await fetchProduct(slug);

      if (product) {
        // Okamžitě trackujte zobrazení
        await trackViewContent({
          contentId: product.id,
          contentName: product.name,
          contentCategory: 'botanical-samples',
          contentType: 'product',
          value: product.price,
          currency: 'CZK'
        });
      }
    }

    loadProduct();
  }, [slug, trackViewContent]);

  return <div>Product Detail...</div>;
}

// ============================================================================
// 2. TRACKING PŘIDÁNÍ DO KOŠÍKU (AddToCart)
// ============================================================================

export function AddToCartButtonExample({ product }: { product: any }) {
  const { trackAddToCart } = useMetaTracking();
  const { addItem } = useCart();

  const handleAddToCart = async () => {
    // Přidejte do košíku
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      quantity: quantity
    });

    // Trackujte událost
    await trackAddToCart({
      contentId: product.id,
      contentName: product.name,
      value: product.price * quantity,
      quantity: quantity,
      currency: 'CZK'
    });
  };

  return (
    <button onClick={handleAddToCart}>
      Přidat do košíku
    </button>
  );
}

// ============================================================================
// 3. TRACKING ZAHÁJENÍ CHECKOUTU (InitiateCheckout)
// ============================================================================

export function CheckoutPageExample() {
  const { items } = useCart();
  const { trackInitiateCheckout } = useMetaTracking();

  useEffect(() => {
    if (items.length > 0) {
      const contentIds = items.map(item => item.productId);
      const totalValue = items.reduce((sum, item) =>
        sum + (item.price * item.quantity), 0
      );
      const totalItems = items.reduce((sum, item) =>
        sum + item.quantity, 0
      );

      trackInitiateCheckout({
        contentIds,
        value: totalValue,
        numItems: totalItems,
        currency: 'CZK'
      });
    }
  }, [items, trackInitiateCheckout]);

  return <div>Checkout Form...</div>;
}

// ============================================================================
// 4. TRACKING NÁKUPU (Purchase) - NEJDŮLEŽITĚJŠÍ!
// ============================================================================

export function OrderSuccessPageExample() {
  const { trackPurchase } = useMetaTracking();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    async function loadOrder() {
      const orderData = await fetchOrder(orderId);
      setOrder(orderData);

      if (orderData) {
        // Trackujte nákup s kompletními daty
        await trackPurchase({
          contentIds: orderData.items.map(item => item.product_id),
          value: orderData.total_amount,
          numItems: orderData.items.reduce((sum, item) => sum + item.quantity, 0),
          currency: 'CZK',
          contents: orderData.items.map(item => ({
            id: item.product_id,
            quantity: item.quantity,
            item_price: item.price
          })),
          // Důležité: posílejte customer data pro lepší matching
          email: orderData.customer_email,
          phone: orderData.customer_phone,
          firstName: orderData.customer_first_name,
          lastName: orderData.customer_last_name,
          city: orderData.shipping_city,
          zip: orderData.shipping_zip,
          country: 'CZ'
        });
      }
    }

    loadOrder();
  }, [orderId, trackPurchase]);

  return <div>Order Success...</div>;
}

// ============================================================================
// 5. TRACKING REGISTRACE (CompleteRegistration)
// ============================================================================

export function SignupFormExample() {
  const { trackCompleteRegistration } = useMetaTracking();
  const [formData, setFormData] = useState({ email: '', firstName: '', lastName: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vytvořte uživatele
    const user = await createUser(formData);

    if (user) {
      // Trackujte dokončení registrace
      await trackCompleteRegistration({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields... */}
    </form>
  );
}

// ============================================================================
// 6. TRACKING LEADU (Lead) - Newsletter, Kontaktní formulář
// ============================================================================

export function NewsletterFormExample() {
  const { trackLead } = useMetaTracking();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Uložte email do databáze
    await subscribeToNewsletter(email);

    // Trackujte lead
    await trackLead({ email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Váš email"
      />
      <button type="submit">Odebírat</button>
    </form>
  );
}

// ============================================================================
// 7. TRACKING VYHLEDÁVÁNÍ (Search)
// ============================================================================

export function SearchBarExample() {
  const { trackSearch } = useMetaTracking();
  const [query, setQuery] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (query.trim()) {
      // Trackujte vyhledávání
      await trackSearch(query);

      // Proveďte vyhledávání
      const results = await searchProducts(query);
      // ...
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Hledat produkty..."
      />
      <button type="submit">Hledat</button>
    </form>
  );
}

// ============================================================================
// 8. GLOBÁLNÍ TRACKING PAGEVIEW V APP.TSX
// ============================================================================

export function AppWithTrackingExample() {
  const location = useLocation();
  const { trackPageView } = useMetaTracking();

  useEffect(() => {
    // Trackujte každou změnu stránky
    trackPageView();
  }, [location.pathname, trackPageView]);

  return (
    <Routes>
      {/* Your routes... */}
    </Routes>
  );
}

// ============================================================================
// HELPER FUNKCE (placeholder)
// ============================================================================

async function fetchProduct(slug: string) {
  // Implementace načtení produktu
  return null;
}

async function fetchOrder(orderId: string) {
  // Implementace načtení objednávky
  return null;
}

async function createUser(data: any) {
  // Implementace vytvoření uživatele
  return null;
}

async function subscribeToNewsletter(email: string) {
  // Implementace přihlášení k newsletteru
  return null;
}

async function searchProducts(query: string) {
  // Implementace vyhledávání
  return null;
}

function useCart() {
  // Placeholder pro cart context
  return {
    items: [],
    addItem: (item: any) => {}
  };
}
