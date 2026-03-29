import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Cart, cartApi } from '../api/client';

const USER_ID = 'guest-user'; // simplified: single user for demo
const CART_ID_KEY = 'uniblox_cart_id';

interface CartContextValue {
  cart: Cart | null;
  subtotal: number;
  itemCount: number;
  loading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  userId: string;
  cartId: string | null;
  resetCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cartId, setCartId] = useState<string | null>(
    () => localStorage.getItem(CART_ID_KEY)
  );

  const initCart = useCallback(async (existingCartId?: string) => {
    const c = await cartApi.create(USER_ID, existingCartId || undefined);
    setCart(c);
    setCartId(c.id);
    localStorage.setItem(CART_ID_KEY, c.id);
    return c;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (cartId) {
          const data = await cartApi.get(cartId);
          setCart(data.cart);
          setSubtotal(data.subtotal);
        } else {
          await initCart();
        }
      } catch {
        // Cart may have been cleared after checkout; create a fresh one
        await initCart();
      }
    })();
  }, []);

  const refreshCart = useCallback(async () => {
    if (!cartId) return;
    const data = await cartApi.get(cartId);
    setCart(data.cart);
    setSubtotal(data.subtotal);
  }, [cartId]);

  const addItem = useCallback(async (productId: string, quantity = 1) => {
    setLoading(true);
    try {
      let id = cartId;
      if (!id) {
        const c = await initCart();
        id = c.id;
      }
      const data = await cartApi.addItem(id!, productId, quantity);
      setCart(data.cart);
      setSubtotal(data.subtotal);
    } finally {
      setLoading(false);
    }
  }, [cartId, initCart]);

  const updateItem = useCallback(async (productId: string, quantity: number) => {
    if (!cartId) return;
    setLoading(true);
    try {
      const data = await cartApi.updateItem(cartId, productId, quantity);
      setCart(data.cart);
      setSubtotal(data.subtotal);
    } finally {
      setLoading(false);
    }
  }, [cartId]);

  const removeItem = useCallback(async (productId: string) => {
    if (!cartId) return;
    setLoading(true);
    try {
      const data = await cartApi.removeItem(cartId, productId);
      setCart(data.cart);
      setSubtotal(data.subtotal);
    } finally {
      setLoading(false);
    }
  }, [cartId]);

  const resetCart = useCallback(async () => {
    localStorage.removeItem(CART_ID_KEY);
    setCartId(null);
    const c = await initCart();
    setSubtotal(0);
    setCart(c);
  }, [initCart]);

  const itemCount = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{
      cart, subtotal, itemCount, loading,
      addItem, updateItem, removeItem, refreshCart,
      userId: USER_ID, cartId, resetCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
