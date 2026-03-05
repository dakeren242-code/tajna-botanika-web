import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { CartItem, Product } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, gramAmount: string, quantity?: number) => void;
  removeFromCart: (productId: string, gramAmount: string) => void;
  updateQuantity: (productId: string, gramAmount: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
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
  const [loading, setLoading] = useState(false);
  const [variantPrices, setVariantPrices] = useState<Record<string, number>>({});
  const [validationDone, setValidationDone] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Validate and refresh cart items on mount
  useEffect(() => {
    const validateCart = async () => {
      if (items.length === 0 || validationDone) return;

      try {
        const validatedItems: CartItem[] = [];
        let hasChanges = false;

        for (const item of items) {
          // Check if product still exists and refresh its data
          const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', item.product.id)
            .maybeSingle();

          if (error) {
            console.error('Error validating product:', error);
            // Don't remove items on network/CORS errors - keep the cart as is
            if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
              break; // Exit validation loop, keep cart intact
            }
            // Only remove on actual database errors
            hasChanges = true;
            continue;
          }

          if (!product) {
            hasChanges = true;
            continue;
          }

          // Check if variant exists
          const { data: variant, error: variantError } = await supabase
            .from('product_variants')
            .select('id, is_available')
            .eq('product_id', product.id)
            .eq('variant_name', item.gramAmount)
            .maybeSingle();

          if (variantError) {
            console.error('Variant lookup error:', variantError);
            if (!variantError.message.includes('CORS') && !variantError.message.includes('Failed to fetch')) {
              hasChanges = true;
              continue;
            }
          }

          if (!variant || !variant.is_available) {
            hasChanges = true;
            continue;
          }

          // Add item with refreshed product data
          validatedItems.push({
            ...item,
            product: product
          });
        }

        if (hasChanges) {
          setItems(validatedItems);
        }
      } catch (error) {
        console.error('Error validating cart:', error);
      } finally {
        setValidationDone(true);
      }
    };

    validateCart();
  }, [validationDone]); // Run once on mount

  // Load variant prices from database
  useEffect(() => {
    const loadPrices = async () => {
      if (items.length === 0) return;

      setLoading(true);
      try {
        // Get unique product-variant combinations
        const variantKeys = items.map(item => ({
          productId: item.product.id,
          variantName: item.gramAmount
        }));

        // Load prices from database
        const pricesMap: Record<string, number> = {};

        for (const { productId, variantName } of variantKeys) {
          const key = `${productId}-${variantName}`;
          if (pricesMap[key]) continue; // Already loaded

          const { data: variant } = await supabase
            .from('product_variants')
            .select('price')
            .eq('product_id', productId)
            .eq('variant_name', variantName)
            .maybeSingle();

          if (variant) {
            pricesMap[key] = variant.price;
          } else {
            // Fallback to hardcoded prices if variant not found
            const fallbackPrices: Record<string, number> = {
              '1g': 190,
              '3g': 490,
              '5g': 690,
              '10g': 1290,
            };
            pricesMap[key] = fallbackPrices[variantName] || 190;
          }
        }

        setVariantPrices(pricesMap);
      } catch (error) {
        console.error('Error loading variant prices:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPrices();
  }, [items.map(i => `${i.product.id}-${i.gramAmount}`).join(',')]);

  const addToCart = useCallback(async (product: Product, gramAmount: string, quantity: number = 1) => {
    // Load price from database
    const { data: variant } = await supabase
      .from('product_variants')
      .select('price')
      .eq('product_id', product.id)
      .eq('variant_name', gramAmount)
      .maybeSingle();

    const itemPrice = variant?.price || 190;
    const totalValue = itemPrice * quantity;

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
      const key = `${item.product.id}-${item.gramAmount}`;
      const price = variantPrices[key] || 0;
      return sum + price * item.quantity;
    }, 0),
    [items, variantPrices]
  );

  const value = useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    loading,
  }), [items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, loading]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
