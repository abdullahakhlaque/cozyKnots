import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "./data";

export type CartItem = { product: Product; qty: number };

type CartCtx = {
  items: CartItem[];
  add: (p: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "ck_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Ignore malformed stored carts.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartCtx>(() => {
    const add = (p: Product, qty = 1) => {
      setItems((prev) => {
        const found = prev.find((i) => i.product.id === p.id);
        if (found) return prev.map((i) => (i.product.id === p.id ? { ...i, qty: i.qty + qty } : i));
        return [...prev, { product: p, qty }];
      });
    };
    const remove = (id: string) => setItems((prev) => prev.filter((i) => i.product.id !== id));
    const setQty = (id: string, qty: number) =>
      setItems((prev) =>
        prev.map((i) => (i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
      );
    const clear = () => setItems([]);
    const count = items.reduce((a, i) => a + i.qty, 0);
    const total = items.reduce((a, i) => a + i.qty * i.product.price, 0);
    return { items, add, remove, setQty, clear, count, total };
  }, [items]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
