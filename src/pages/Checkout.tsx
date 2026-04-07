import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../hooks/useTracking';
import { AlertCircle } from 'lucide-react';
import PaymentAndShipping from '../components/checkout/PaymentAndShipping';

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

      const FREE_SHIPPING_THRESHOLD = 1000;
      const SHIPPING_COST = 79;
      const COD_FEE = 30;

      const discountAmount = discountPercent ? Math.round(totalPrice * discountPercent / 100) : 0;
      const discountedPrice = totalPrice - discountAmount;
      const isFreeShipping = discountedPrice >= FREE_SHIPPING_THRESHOLD;
      const isPersonalPickup = shippingMethod === 'personal_pickup' || shippingMethod === 'personal_invoice';
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
        const priceMap: Record<string, number> = {
          '1g': 190,
          '3g': 490,
          '5g': 690,
          '10g': 1290,
        };
        const price = priceMap[item.gramAmount] || 190;

        return {
          order_id: order.id,
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: price,
          total_price: price * item.quantity,
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
      });

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
