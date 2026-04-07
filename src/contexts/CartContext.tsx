import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback, useRef } from 'react';
import { CartItem, Product, supabase } from '../lib/supabase';
import { trackEvent } from '../hooks/useTracking';
import { getPrice } from '../lib/prices';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, gramAmount: string, quantity?: number) => void;
  removeFromCart: (productId: string, gramAmount: string) => void;
  updateQuantity: (productId: string, gramAmount: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Persist to localStorage (always, as fallback)
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Sync cart to Supabase for logged-in users (debounced)
  useEffect(() => {
    if (!user) return;
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        // Upsert cart
        const { data: cart } = await supabase
          .from('carts')
          .upsert({ user_id: user.id, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
          .select('id')
          .single();
        if (!cart) return;

        // Clear old items and insert current
        await supabase.from('cart_items').delete().eq('cart_id', cart.id);
        if (items.length > 0) {
          await supabase.from('cart_items').insert(
            items.map(item => ({
              cart_id: cart.id,
              product_id: item.product.id,
              quantity: item.quantity,
              user_id: user.id,
              session_id: null,
              variant_id: null,
            }))
          );
        }
      } catch { /* silent — localStorage is the primary store */ }
    }, 2000);
    return () => { if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current); };
  }, [items, user]);

  const addToCart = useCallback((product: Product, gramAmount: string, quantity: number = 1) => {
    const itemPrice = getPrice(gramAmount);
    const totalValue = itemPrice * quantity;

    trackEvent('AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: totalValue,
      currency: 'CZK',
      contents: [{ id: product.id, quantity }],
    });

    setItems((current) => {
      const existingItem = current.find(
        (item) => item.product.id === product.id && item.gramAmount === gramAmount
      );

      if (existingItem) {
        return current.map((item) =>
          item.product.id === product.id && item.gramAmount === gramAmount
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...current, { product, quantity, gramAmount }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, gramAmount: string) => {
    setItems((current) =>
      current.filter((item) => !(item.product.id === productId && item.gramAmount === gramAmount))
    );
  }, []);

  const updateQuantity = useCallback((productId: string, gramAmount: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, gramAmount);
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.product.id === productId && item.gramAmount === gramAmount ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(() =>
    items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(() =>
    items.reduce((sum, item) => sum + getPrice(item.gramAmount) * item.quantity, 0),
    [items]
  );

  const value = useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  }), [items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
