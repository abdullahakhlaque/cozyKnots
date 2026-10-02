import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "./data";
import { useAuth } from "./auth";

type WishlistCtx = {
  items: Product[];
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (p: Product) => void;
  remove: (id: string) => void;
  count: number;
};

const Ctx = createContext<WishlistCtx | null>(null);
const KEY = "ck_wishlist_v1";

function getApiBaseUrl(): string {
  if (typeof window !== "undefined" && window.location?.hostname) {
    const host = window.location.hostname;
    return `http://${host}:5000`;
  }
  return "http://localhost:5000";
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const { user } = useAuth();
  const userEmail = user?.email || "guest";

  // Load from localStorage & sync from MongoDB on mount or when user changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storageKey = `${KEY}_${userEmail}`;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setItems(JSON.parse(raw));
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    }

    // Try syncing from MongoDB backend
    fetch(`${getApiBaseUrl()}/api/wishlist?email=${encodeURIComponent(userEmail)}`)
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const apiProducts: Product[] = data
            .map((item: { product: Product }) => item.product)
            .filter((p: Product) => p && p.id);
          if (apiProducts.length > 0) {
            setItems((prev) => {
              // Merge API items into local state without duplicates
              const map = new Map<string, Product>();
              prev.forEach((p) => map.set(p.id, p));
              apiProducts.forEach((p) => map.set(p.id, p));
              return Array.from(map.values());
            });
          }
        }
      })
      .catch(() => {
        // Ignore offline errors
      });
  }, [userEmail]);

  // Persist to localStorage whenever items change for current user
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storageKey = `${KEY}_${userEmail}`;
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, userEmail]);

  const value = useMemo<WishlistCtx>(() => {
    const isInWishlist = (id: string) => items.some((p) => p.id === id);

    const toggleWishlist = (p: Product) => {
      const exists = items.some((item) => item.id === p.id);
      if (exists) {
        setItems((prev) => prev.filter((item) => item.id !== p.id));
        fetch(`${getApiBaseUrl()}/api/wishlist/${encodeURIComponent(userEmail)}/${encodeURIComponent(p.id)}`, {
          method: "DELETE",
        }).catch(() => {});
      } else {
        setItems((prev) => {
          if (prev.some((i) => i.id === p.id)) return prev;
          return [...prev, p];
        });
        fetch(`${getApiBaseUrl()}/api/wishlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail, productId: p.id, product: p }),
        }).catch(() => {});
      }
    };

    const remove = (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      fetch(`${getApiBaseUrl()}/api/wishlist/${encodeURIComponent(userEmail)}/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }).catch(() => {});
    };

    return {
      items,
      isInWishlist,
      toggleWishlist,
      remove,
      count: items.length,
    };
  }, [items, userEmail]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWishlist() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useWishlist must be used within WishlistProvider");
  return c;
}
