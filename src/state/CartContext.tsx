import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem } from "../types/domain";

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  clearCart: () => void;
  count: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "godid-cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as CartItem[]) : [];
  });

  const commit = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: (item) => {
        const existing = items.find((entry) => entry.productId === item.productId && entry.variantId === item.variantId);
        const next = existing
          ? items.map((entry) => (entry === existing ? { ...entry, quantity: entry.quantity + item.quantity } : entry))
          : [...items, item];
        commit(next);
        setIsOpen(true);
      },
      updateQuantity: (productId, variantId, quantity) => {
        commit(items.map((item) => (item.productId === productId && item.variantId === variantId ? { ...item, quantity } : item)).filter((item) => item.quantity > 0));
      },
      removeItem: (productId, variantId) => commit(items.filter((item) => item.productId !== productId || item.variantId !== variantId)),
      clearCart: () => commit([]),
      count: items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    [isOpen, items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
};
