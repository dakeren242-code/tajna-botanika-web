import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { CartItem, Product } from '../lib/supabase';
import { trackEvent } from '../hooks/useTracking';

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
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product: Product, gramAmount: string, quantity: number = 1) => {
    const priceMap: Record<string, number> = {
      '1g': 190,
      '3g': 490,
      '5g': 690,
      '10g': 1290,
    };

    const itemPrice = priceMap[gramAmount] || 190;
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
    items.reduce((sum, item) => {
      const priceMap: Record<string, number> = {
        '1g': 190,
        '3g': 490,
        '5g': 690,
        '10g': 1290,
      };
      const price = priceMap[item.gramAmount] || 190;
      return sum + price * item.quantity;
    }, 0),
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
