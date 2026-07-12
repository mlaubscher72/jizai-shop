"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CartItem, Size } from "@/lib/types";

interface CartCtx {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (productId: string, size: Size) => void;
  setQty: (productId: string, size: Size, qty: number) => void;
  clear: () => void;
  count: number;
  totalRappen: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Ctx = createContext<CartCtx | null>(null);

const STORAGE_KEY = "jizai_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add: CartCtx["add"] = (item, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === item.productId && i.size === item.size
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: Math.min(next[idx].qty + qty, 10) };
        return next;
      }
      return [...prev, { ...item, qty }];
    });
    setOpen(true);
  };

  const remove: CartCtx["remove"] = (productId, size) =>
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));

  const setQty: CartCtx["setQty"] = (productId, size, qty) =>
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => !(i.productId === productId && i.size === size))
        : prev.map((i) =>
            i.productId === productId && i.size === size ? { ...i, qty: Math.min(qty, 10) } : i
          )
    );

  const clear = () => setItems([]);

  const { count, totalRappen } = useMemo(
    () => ({
      count: items.reduce((s, i) => s + i.qty, 0),
      totalRappen: items.reduce((s, i) => s + i.qty * i.priceRappen, 0),
    }),
    [items]
  );

  return (
    <Ctx.Provider value={{ items, add, remove, setQty, clear, count, totalRappen, open, setOpen }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart muss innerhalb von CartProvider verwendet werden");
  return ctx;
}
