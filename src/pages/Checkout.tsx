import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { useMetaTracking } from '../hooks/useMetaTracking';
import { AlertCircle, X, Copy, CheckCircle, Building2, Home, Truck, MapPin, Clock } from 'lucide-react';
import PaymentAndShipping from '../components/checkout/PaymentAndShipping';
import {
  getInitialOrderStatus,
  getInitialPaymentStatus,
  getInitialFulfillmentStatus,
} from '../lib/orderHelpers';
import { sendOrderConfirmationEmail } from '../lib/emailService';

interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  zip?: string;
  notes?: string;
}

interface Confetti {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  velocity: { x: number; y: number };
  rotationSpeed: number;
}

interface ConfirmedOrder {
  orderNumber: string;
  paymentMethod: string;
  amount: number;
  shippingCost: number;
  codFee: number;
  phone: string;
  shippingMethod: string;
}

// Key used to pass purchase data to PaymentOk for card payments
export const PURCHASE_SESSION_KEY = 'meta_pending_purchase';

export default function Checkout() {
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { trackInitiateCheckout, trackPurchase, trackAddPaymentInfo } = useMetaTracking();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const animationFrameRef = useRef<number>();

  const totalGrams = items.reduce((sum, item) => {
    const grams = parseInt(item.gramAmount.replace('g', ''));
    return sum + (grams * item.quantity);
  }, 0);

  useEffect(() => {
    if (confetti.length === 0) return;

    const animate = () => {
      setConfetti(prev => {
        const updated = prev.map(c => ({
          ...c,
          x: c.x + c.velocity.x,
          y: c.y + c.velocity.y,
          rotation: c.rotation + c.rotationSpeed,
          velocity: {
            x: c.velocity.x * 0.99,
            y: c.velocity.y + 0.5,
          },
        })).filter(c => c.y < window.innerHeight + 20);

        if (updated.length === 0 && animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          return [];
        }

        return updated;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [confirmedOrder]);

  useEffect(() => {
    if (items.length === 0 && !confirmedOrder) {
      navigate('/cart');
      return;
    }

    const priceMap: Record<string, number> = { '1g': 190, '3g': 490, '5g': 690, '10g': 1290 };
    
    trackInitiateCheckout({
      contentIds: items.map(item => (item.product.meta_catalog_id || item.product.id).toString()),
      value: totalPrice,
      numItems: items.reduce((sum, item) => sum + item.quantity, 0),
      currency: 'CZK',
      contents: items.map(item => ({
        id: (item.product.meta_catalog_id || item.product.id).toString(),
        quantity: item.quantity,
        item_price: priceMap[item.gramAmount] ?? item.product.price,
      })),
    });
  }, []);

  const handleCompleteOrder = async (paymentMethod: string, shippingMethod: string, customerData: CustomerData) => {
    setError('');
    setLoading(true);

    try {
      const priceMapPayment: Record<string, number> = { '1g': 190, '3g': 490, '5g': 690, '10g': 1290 };
      await trackAddPaymentInfo({
        contentIds: items.map(item => (item.product.meta_catalog_id || item.product.id).toString()),
        value: totalPrice,
        currency: 'CZK',
        paymentMethod,
        contents: items.map(item => ({
          id: (item.product.meta_catalog_id || item.product.id).toString(),
          quantity: item.quantity,
          item_price: priceMapPayment[item.gramAmount] ?? item.product.price,
        })),
        email: customerData.email,
        phone: customerData.phone,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        city: customerData.city,
        zip: customerData.zip,
        country: 'CZ',
      });

      for (const item of items) {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id, name')
          .eq('id', item.product.id)
          .maybeSingle();

        if (productError) {
          console.error('Product lookup error:', productError);
          if (productError.message.includes('CORS') || productError.message.includes('Failed to fetch')) {
            throw new Error('Nepodařilo se připojit k databázi. Zkontrolujte prosím připojení k internetu a zkuste to znovu.');
          }
          throw new Error(`Chyba při ověřování produktu: ${productError.message}`);
        }

        if (!product) {
          throw new Error(`Produkt ${item.product.name} již není v nabídce. Prosím odstraňte jej z košíku a zkuste znovu.`);
        }

        const { data: variant, error: variantError } = await supabase
          .from('product_variants')
          .select('stock, is_available')
          .eq('product_id', item.product.id)
          .eq('variant_name', item.gramAmount)
          .maybeSingle();

        if (variantError) {
          console.error('Variant lookup error:', variantError);
          if (variantError.message.includes('CORS') || variantError.message.includes('Failed to fetch')) {
            throw new Error('Nepodařilo se připojit k databázi. Zkontrolujte prosím připojení k internetu a zkuste to znovu.');
          }
          throw new Error(`Chyba při ověřování varianty ${item.gramAmount} produktu ${item.product.name}: ${variantError.message}`);
        }

        if (!variant) {
          throw new Error(`Varianta ${item.gramAmount} produktu ${item.product.name} nebyla nalezena. Zkuste produkt odebrat a přidat znovu do košíku.`);
        }

        if (!variant.is_available) {
          throw new Error(`Varianta ${item.gramAmount} produktu ${item.product.name} není momentálně dostupná`);
        }

        if ((variant.stock || 0) < item.quantity) {
          throw new Error(`Varianta ${item.gramAmount} produktu ${item.product.name} není na skladě v požadovaném množství (dostupné: ${variant.stock})`);
        }
      }

      const FREE_SHIPPING_THRESHOLD = 1000;
      const SHIPPING_COST = 79;
      const COD_FEE = 49;

      const isFreeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;
      const isPersonalPickup = shippingMethod === 'personal_pickup' || shippingMethod === 'personal_invoice';
      const shippingCost = isPersonalPickup ? 0 : (isFreeShipping ? 0 : SHIPPING_COST);
      const codFee = paymentMethod === 'cash_on_delivery' ? COD_FEE : 0;
      const finalTotal = totalPrice + shippingCost + codFee;

      const initialOrderStatus = getInitialOrderStatus(paymentMethod);
      const initialPaymentStatus = getInitialPaymentStatus(paymentMethod);
      const initialFulfillmentStatus = getInitialFulfillmentStatus();

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          customer_first_name: customerData.firstName,
          customer_last_name: customerData.lastName,
          customer_email: customerData.email,
          customer_phone: customerData.phone,
          shipping_address: null,
          customer_notes: customerData.notes || null,
          status: initialOrderStatus,
          payment_status: initialPaymentStatus,
          fulfillment_status: initialFulfillmentStatus,
          subtotal: totalPrice,
          shipping_cost: shippingCost,
          cod_fee: codFee,
          discount_amount: 0,
          total_amount: finalTotal,
          payment_method: paymentMethod,
          shipping_method: shippingMethod,
          confirmed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderError || !order) {
        console.error('Order error:', orderError);
        throw new Error('Chyba při vytváření objednávky');
      }

      const orderItems = await Promise.all(items.map(async (item) => {
        const { data: variant } = await supabase
          .from('product_variants')
          .select('id, price')
          .eq('product_id', item.product.id)
          .eq('variant_name', item.gramAmount)
          .maybeSingle();

        if (!variant) {
          throw new Error(`Variant ${item.gramAmount} not found for product ${item.product.name}`);
        }

        const unitPrice = variant.price;
        const lineTotal = unitPrice * item.quantity;

        return {
          order_id: order.id,
          product_id: item.product.id,
          variant_id: variant.id,
          product_name: item.product.name,
          variant_name: item.gramAmount,
          variant_weight_grams: parseInt(item.gramAmount.replace('g', '')),
          quantity: item.quantity,
          unit_price: unitPrice,
          total_price: lineTotal,
          line_total: lineTotal,
        };
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Items error:', itemsError);
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error('Chyba při vytváření položek objednávky');
      }

      for (const orderItem of orderItems) {
        try {
          await supabase.rpc('decrement_stock', {
            p_variant_id: orderItem.variant_id,
            p_quantity: orderItem.quantity,
          });
        } catch (stockError) {
          console.error('Stock update error:', stockError);
        }
      }

      // ── CARD PAYMENT (Mollie redirect) ─────────────────────────────
      // Save purchase data to sessionStorage BEFORE redirect so
      // PaymentOk.tsx can fire trackPurchase after returning from Mollie.
      if (paymentMethod === 'card') {
        sessionStorage.setItem(
          PURCHASE_SESSION_KEY,
          JSON.stringify({
            contentIds: items.map(item => (item.product.meta_catalog_id || item.product.id).toString()),
            value: finalTotal,
            numItems: items.reduce((sum, item) => sum + item.quantity, 0),
            currency: 'CZK',
            contents: items.map(item => ({
              id: (item.product.meta_catalog_id || item.product.id).toString(),
              quantity: item.quantity,
              item_price: orderItems.find(o => o.product_id === item.product.id)?.unit_price ?? item.product.price,
            })),
            orderId: order.order_number || order.payment_reference,
            paymentMethod,
            shippingMethod,
            email: customerData.email,
            phone: customerData.phone,
            firstName: customerData.firstName,
            lastName: customerData.lastName,
            city: customerData.city,
            zip: customerData.zip,
            country: 'CZ',
          })
        );

        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mollie-create-payment`;

        const { data: session } = await supabase.auth.getSession();
        const token = session?.session?.access_token;

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            orderId: order.id,
            amount: finalTotal,
            description: `Objednávka #${order.order_number || order.payment_reference}`,
            redirectUrl: `${window.location.origin}/paymentok`,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Nepodařilo se vytvořit platbu');
        }

        const paymentData = await response.json();

        clearCart();
        window.location.href = paymentData.checkoutUrl;
        return;
      }

      // ── NON-CARD PAYMENT (bank transfer / COD / personal pickup) ───
      // Fire Purchase immediately since there's no redirect.
      await trackPurchase({
        contentIds: items.map(item => (item.product.meta_catalog_id || item.product.id).toString()),
        value: finalTotal,
        numItems: items.reduce((sum, item) => sum + item.quantity, 0),
        currency: 'CZK',
        contents: items.map(item => ({
          id: (item.product.meta_catalog_id || item.product.id).toString(),
          quantity: item.quantity,
          item_price: orderItems.find(o => o.product_id === item.product.id)?.unit_price ?? item.product.price,
        })),
        orderId: order.order_number || order.payment_reference,
        paymentMethod,
        shippingMethod,
        email: customerData.email,
        phone: customerData.phone,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        city: customerData.city,
        zip: customerData.zip,
        country: 'CZ',
      });

      const emailData = {
        to: customerData.email,
        orderNumber: order.order_number || order.payment_reference,
        customerName: `${customerData.firstName} ${customerData.lastName}`,
        items: items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          variant: item.gramAmount,
        })),
        subtotal: totalPrice,
        shippingCost: shippingCost,
        codFee: codFee,
        totalAmount: finalTotal,
        paymentMethod: paymentMethod,
        shippingMethod: shippingMethod,
        bankAccount: '2001645045/2010',
        variableSymbol: order.order_number || order.payment_reference,
      };

      sendOrderConfirmationEmail(emailData).catch(err => {
        console.error('Failed to send confirmation email:', err);
      });

      clearCart();

      setConfirmedOrder({
        orderNumber: order.order_number || order.payment_reference,
        paymentMethod: paymentMethod,
        amount: finalTotal,
        shippingCost: shippingCost,
        codFee: codFee,
        phone: customerData.phone,
        shippingMethod: shippingMethod,
      });

      const confettiColors = ['#10b981', '#fbbf24', '#f3f4f6'];
      const newConfetti: Confetti[] = [];

      for (let i = 0; i < 50; i++) {
        const side = Math.random() > 0.5 ? 'left' : 'right';
        const x = side === 'left' ? -10 : window.innerWidth + 10;
        const y = window.innerHeight * (0.3 + Math.random() * 0.4);

        newConfetti.push({
          id: i,
          x,
          y,
          rotation: Math.random() * 360,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          velocity: {
            x: side === 'left' ? (3 + Math.random() * 4) : -(3 + Math.random() * 4),
            y: -8 - Math.random() * 6,
          },
          rotationSpeed: (Math.random() - 0.5) * 10,
        });
      }

      setConfetti(newConfetti);
      setLoading(false);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Chyba při vytváření objednávky');
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (confirmedOrder) {
    const totalAmount = confirmedOrder.amount;
    const bankDetails = {
      account: '2001645045/2010',
      amount: `${totalAmount.toFixed(2)} Kč`,
      variableSymbol: confirmedOrder.orderNumber,
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black py-20 px-4 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none z-50">
          {confetti.map(c => (
            <div
              key={c.id}
              className="absolute w-2.5 h-2.5 rounded-sm"
              style={{
                left: `${c.x}px`,
                top: `${c.y}px`,
                backgroundColor: c.color,
                transform: `rotate(${c.rotation}deg)`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8 text-center animate-fadeSlideIn">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-6 rounded-full border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-checkPulse">
                <CheckCircle className="w-16 h-16 text-emerald-400" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white mb-3 animate-zoomIn">
              Děkujeme za vaši objednávku!
            </h1>

            <p className="text-gray-300 text-lg mb-2">
              Pokud platba proběhla, brzy se vám ozveme.
            </p>

            <p className="text-gray-400 mb-8">
              Potvrzení jsme vám zaslali na e-mail.
            </p>

            <div className="inline-block bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-xl px-6 py-3 mb-8">
              <p className="text-sm text-gray-400 mb-1">Číslo objednávky</p>
              <p className="text-emerald-400 text-2xl font-bold">{confirmedOrder.orderNumber}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-6 border border-emerald-500/30 mb-6 text-left">
              <h3 className="text-lg font-bold text-white mb-4">Souhrn objednávky</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Číslo objednávky</span>
                  <span className="text-white font-semibold">{confirmedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Způsob platby</span>
                  <span className="text-white font-semibold">
                    {confirmedOrder.paymentMethod === 'card'
                      ? 'Platba kartou'
                      : confirmedOrder.paymentMethod === 'cash_on_delivery'
                      ? 'Dobírka'
                      : 'Bankovní převod'}
                  </span>
                </div>
                <div className="border-t border-emerald-500/20 pt-2.5 mt-2.5">
                  <div className="flex justify-between">
                    <span className="text-white font-bold">Celková částka</span>
                    <span className="text-emerald-400 font-bold text-xl">{totalAmount.toFixed(2)} Kč</span>
                  </div>
                </div>
              </div>
            </div>

            {confirmedOrder.paymentMethod === 'bank_transfer' && (
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-6 border border-emerald-500/30 mb-6 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-xl font-bold text-white">Platební instrukce</h2>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Údaje k platbě naleznete níže. Po připsání platby bude objednávka odeslána.
                </p>
                <div className="space-y-3">
                  {[
                    { label: 'Číslo účtu', value: bankDetails.account },
                    { label: 'Částka k úhradě', value: bankDetails.amount },
                    { label: 'Variabilní symbol', value: bankDetails.variableSymbol },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-1">{label}</p>
                      <div className="flex items-center justify-between bg-black/30 rounded-lg p-3 border border-emerald-500/20">
                        <span className="text-white font-semibold">{value}</span>
                        <button
                          onClick={() => copyToClipboard(value)}
                          className="p-2 hover:bg-white/10 rounded transition-colors"
                          title="Zkopírovat"
                        >
                          {copied ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-emerald-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {confirmedOrder.shippingMethod === 'personal_invoice' && (
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-6 border border-emerald-500/30 mb-8 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-xl font-bold text-white">Osobní vyzvednutí po uhrazení faktury</h2>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-400">
                    Vaše objednávka bude připravena k osobnímu vyzvednutí po uhrazení faktury obratem.
                  </p>
                  <div className="space-y-3">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-emerald-400" />
                        <h4 className="text-white font-semibold">Dostupnost</h4>
                      </div>
                      <p className="text-emerald-300 text-sm">Oblast Praha - Beroun, dostupnost 24/7</p>
                    </div>
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <h4 className="text-yellow-400 font-semibold mb-2">Další kroky:</h4>
                      <ol className="text-yellow-300 text-sm space-y-1 list-decimal list-inside">
                        <li>Proveďte platbu podle instrukcí výše (pošlete nám obrazek z mobilu po zaplacení)</li>
                        <li>Po ověření platby vám domlouváme místo předání v oblasti Praha - Beroun</li>
                        <li>Vyzvednutí je možné 24/7 dle vzájemné dohody</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {confirmedOrder.shippingMethod === 'personal_pickup' && (
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-6 border border-emerald-500/30 mb-8 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-xl font-bold text-white">Osobní převzetí</h2>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-400">
                    Vaše objednávka je připravena k osobnímu převzetí ještě dnes po zaplacení.
                  </p>
                  <div className="space-y-3">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-emerald-400" />
                        <h4 className="text-white font-semibold">Dostupnost</h4>
                      </div>
                      <p className="text-emerald-300 text-sm">K dispozici 24/7 - převzetí je možné kdykoli vám to vyhovuje</p>
                    </div>
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <h4 className="text-yellow-400 font-semibold mb-2">Další kroky:</h4>
                      <ol className="text-yellow-300 text-sm space-y-1 list-decimal list-inside">
                        <li>Proveďte platbu podle instrukcí výše</li>
                        <li>Po potvrzení platby vám zašleme přesnou adresu a kontaktní informace na e-mail</li>
                        <li>Převzít můžete kdykoli během 24 hodin od zaplacení</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 mt-8">
              <button
                onClick={() => navigate('/')}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-[1.02]"
              >
                Zpět do obchodu
              </button>
              <button
                onClick={() => navigate('/orders')}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-gray-300 hover:text-white text-sm transition-colors duration-300"
              >
                Zobrazit detail objednávky
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
                {error.includes('nebyla nalezena') && (
                  <button
                    onClick={() => {
                      clearCart();
                      navigate('/');
                    }}
                    className="ml-8 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg text-sm transition-colors"
                  >
                    Vyčistit košík a vrátit se na hlavní stránku
                  </button>
                )}
              </div>
            )}
            <PaymentAndShipping
              totalPrice={totalPrice}
              totalGrams={totalGrams}
              onComplete={handleCompleteOrder}
              loading={loading}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes checkPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(16, 185, 129, 0.3); }
          50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(16, 185, 129, 0.5); }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeSlideIn { animation: fadeSlideIn 0.6s ease-out; }
        .animate-checkPulse { animation: checkPulse 2s ease-in-out infinite; }
        .animate-zoomIn { animation: zoomIn 0.5s ease-out 0.2s both; }
      `}</style>
    </>
  );
}