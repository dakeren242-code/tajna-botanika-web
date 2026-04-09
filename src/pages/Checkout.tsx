import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../hooks/useTracking';
import { AlertCircle, ArrowLeft, ShoppingCart, Truck, CreditCard, CheckCircle } from 'lucide-react';
import { getPrice, FREE_SHIPPING_THRESHOLD, SHIPPING_COST, COD_FEE } from '../lib/prices';
import PaymentAndShipping from '../components/checkout/PaymentAndShipping';

const CHECKOUT_STEPS = [
  { label: 'Kosik', icon: ShoppingCart },
  { label: 'Doruceni', icon: Truck },
  { label: 'Platba', icon: CreditCard },
  { label: 'Hotovo', icon: CheckCircle },
] as const;

function CheckoutProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {CHECKOUT_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentStep;
          const isCurrent = index === currentStep;
          return (
            <div key={step.label} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCurrent
                      ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                      : isActive
                        ? 'bg-emerald-600/80 border-emerald-500/60'
                        : 'bg-white/5 border-gray-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <span className={`mt-2 text-xs font-medium ${
                  isCurrent ? 'text-emerald-400' : isActive ? 'text-emerald-500/70' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < CHECKOUT_STEPS.length - 1 && (
                <div className="flex-1 mx-2 mb-5">
                  <div className={`h-0.5 rounded-full transition-all duration-300 ${
                    index < currentStep ? 'bg-emerald-500' : 'bg-gray-700'
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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

export default function Checkout() {
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalGrams = items.reduce((sum, item) => {
    const grams = parseInt(item.gramAmount.replace('g', ''));
    return sum + (grams * item.quantity);
  }, 0);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCompleteOrder = async (paymentMethod: string, shippingMethod: string, customerData: CustomerData, discountCode?: string, discountPercent?: number) => {
    setError('');
    setLoading(true);

    // Fire InitiateCheckout here (not on mount) so we have full customerData
    // for all users — guests and logged-in — improving CAPI match quality.
    trackEvent('InitiateCheckout', {
      value: totalPrice,
      currency: 'CZK',
      num_items: items.reduce((sum, item) => sum + item.quantity, 0),
      contents: items.map(item => ({
        id: item.product.id,
        quantity: item.quantity,
      })),
      user_id: user?.id,
      user_email: customerData.email,
      user_phone: customerData.phone,
      user_first_name: customerData.firstName,
      user_last_name: customerData.lastName,
      user_city: customerData.city,
      user_zip: customerData.zip,
      user_country: 'cz',
    });

    try {
      for (const item of items) {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product.id)
          .maybeSingle();

        if (product && (product.stock || 0) < item.quantity) {
          throw new Error(`Produkt ${item.product.name} není na skladě v požadovaném množství`);
        }
      }

      const discountAmount = discountPercent ? Math.round(totalPrice * discountPercent / 100) : 0;
      const discountedPrice = totalPrice - discountAmount;
      const isFreeShipping = discountedPrice >= FREE_SHIPPING_THRESHOLD;
      const isPersonalPickup = shippingMethod === 'personal' || shippingMethod === 'personal_pickup' || shippingMethod === 'personal_invoice';
      const shippingCost = isPersonalPickup ? 0 : (isFreeShipping ? 0 : SHIPPING_COST);
      const codFee = paymentMethod === 'cash_on_delivery' && !isPersonalPickup ? COD_FEE : 0;
      const finalTotal = discountedPrice + shippingCost + codFee;

      const shippingAddress = shippingMethod === 'zasilkovna' && customerData.address ? {
        street: customerData.address,
        city: customerData.city,
        zip: customerData.zip,
      } : null;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          email: customerData.email,
          phone: customerData.phone,
          customer_first_name: customerData.firstName,
          customer_last_name: customerData.lastName,
          customer_email: customerData.email,
          customer_phone: customerData.phone,
          subtotal: totalPrice,
          shipping_cost: shippingCost,
          cod_fee: codFee,
          discount_amount: discountAmount,
          shipping_address: shippingAddress,
          notes: customerData.notes || null,
          status: 'pending',
          total_amount: finalTotal,
          payment_status: 'pending',
          payment_method: paymentMethod,
          shipping_method: shippingMethod,
        })
        .select()
        .single();

      if (orderError || !order) {
        console.error('Order error:', orderError);
        throw new Error('Chyba při vytváření objednávky');
      }

      const orderItems = items.map((item) => {
        const price = getPrice(item.gramAmount);

        return {
          order_id: order.id,
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: price,
          total_price: price * item.quantity,
          gram_amount: item.gramAmount,
          variant_name: item.gramAmount,
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Items error:', itemsError);
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error('Chyba při vytváření položek objednávky');
      }

      for (const item of items) {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product.id)
          .maybeSingle();

        if (product) {
          await supabase
            .from('products')
            .update({ stock: (product.stock || 0) - item.quantity })
            .eq('id', item.product.id);
        }
      }

      // Mark discount code as used
      if (discountCode) {
        await supabase
          .from('discount_codes')
          .update({ is_used: true, used_at: new Date().toISOString(), used_order_id: order.id })
          .eq('code', discountCode);
      }

      const priceMap: Record<string, number> = { '1g': 190, '3g': 490, '5g': 690, '10g': 1290 };
      trackEvent('Purchase', {
        transaction_id: order.id,
        value: finalTotal,
        currency: 'CZK',
        content_ids: items.map(item => item.product.id),
        content_type: 'product',
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
        contents: items.map(item => ({
          id: item.product.id,
          quantity: item.quantity,
          item_price: priceMap[item.gramAmount] || 190,
        })),
        user_email: customerData.email,
        user_phone: customerData.phone,
        user_first_name: customerData.firstName,
        user_last_name: customerData.lastName,
        user_city: customerData.city,
        user_zip: customerData.zip,
        user_country: 'cz',
        user_id: user?.id,
        // fbclid for Meta EMQ — captured from landing URL param
        fbc: sessionStorage.getItem('tb_fbc') || undefined,
        fbclid: sessionStorage.getItem('tb_fbclid') || undefined,
      });

      // Send admin notification (fire-and-forget, don't block checkout)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      fetch(`${supabaseUrl}/functions/v1/order-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.order_number,
          customerName: `${customerData.firstName} ${customerData.lastName}`,
          customerEmail: customerData.email,
          customerPhone: customerData.phone,
          totalAmount: finalTotal,
          paymentMethod,
          shippingMethod,
          items: items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            gramAmount: item.gramAmount,
            price: getPrice(item.gramAmount) * item.quantity,
          })),
        }),
      }).catch(() => {}); // Silent fail - notification is not critical

      clearCart();

      navigate(`/success?order=${order.order_number}&payment=${paymentMethod}&amount=${finalTotal}&shipping=${shippingCost}&cod=${codFee}&phone=${encodeURIComponent(customerData.phone)}&shippingMethod=${shippingMethod}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Chyba při vytváření objednávky');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <CheckoutProgressBar currentStep={1} />
        <Link to="/cart" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-4">
          <ArrowLeft className="w-4 h-4" />Zpět do košíku
        </Link>
        <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
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
  );
}
