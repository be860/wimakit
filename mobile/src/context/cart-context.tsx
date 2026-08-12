import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Produce, produceApi } from '../services/produce-api';
import { getStorageItem, setStorageItem, deleteStorageItem } from '../services/storage';

export interface CartItem {
  produce: Produce;
  quantity: number;
}

interface StoredCartLine {
  produceId: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  hydrating: boolean;
  addToCart: (produce: Produce, quantity?: number) => void;
  removeFromCart: (produceId: number) => void;
  updateQuantity: (produceId: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'wimakit_cart_items';

function persist(lines: StoredCartLine[]) {
  setStorageItem(CART_STORAGE_KEY, JSON.stringify(lines)).catch(() => {});
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrating, setHydrating] = useState(true);
  const hydratedRef = useRef(false);

  // On first mount, rehydrate the cart from the small {produceId, quantity}
  // list saved on-device, re-fetching each produce's current price/stock/
  // status from the API — never trusting stale cached produce data.
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    (async () => {
      try {
        const raw = await getStorageItem(CART_STORAGE_KEY);
        if (!raw) return;

        const lines: StoredCartLine[] = JSON.parse(raw);
        if (!Array.isArray(lines) || lines.length === 0) return;

        const results = await Promise.all(
          lines.map(async (line) => {
            try {
              const produce = await produceApi.getById(line.produceId);
              return { produce, quantity: Math.min(line.quantity, Math.max(produce.quantity, 1)) };
            } catch {
              return null;
            }
          })
        );

        const restored = results.filter((item): item is CartItem => item !== null);
        setCart(restored);
        persist(restored.map((c) => ({ produceId: c.produce.id, quantity: c.quantity })));
      } catch {
        // Corrupt or unreadable cart snapshot — start fresh rather than crash.
        await deleteStorageItem(CART_STORAGE_KEY);
      } finally {
        setHydrating(false);
      }
    })();
  }, []);

  const updateAndPersist = (updater: (prev: CartItem[]) => CartItem[]) => {
    setCart((prev) => {
      const next = updater(prev);
      persist(next.map((c) => ({ produceId: c.produce.id, quantity: c.quantity })));
      return next;
    });
  };

  const addToCart = (produce: Produce, quantity = 1) => {
    updateAndPersist((prev) => {
      const index = prev.findIndex((item) => item.produce.id === produce.id);
      const maxQty = Math.max(produce.quantity, 1);
      if (index > -1) {
        const next = [...prev];
        next[index] = {
          ...next[index],
          produce,
          quantity: Math.min(next[index].quantity + quantity, maxQty),
        };
        return next;
      }
      return [...prev, { produce, quantity: Math.min(quantity, maxQty) }];
    });
  };

  const removeFromCart = (produceId: number) => {
    updateAndPersist((prev) => prev.filter((item) => item.produce.id !== produceId));
  };

  const updateQuantity = (produceId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(produceId);
      return;
    }
    updateAndPersist((prev) =>
      prev.map((item) =>
        item.produce.id === produceId
          ? { ...item, quantity: Math.min(quantity, Math.max(item.produce.quantity, 1)) }
          : item
      )
    );
  };

  const clearCart = () => updateAndPersist(() => []);

  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + item.produce.price * item.quantity, 0),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        hydrating,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
