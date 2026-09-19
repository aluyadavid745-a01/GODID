'use client'
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { products } from "../../data/mockData";
import { useCart } from "../../state/CartContext";
import { formatNaira } from "../../utils/format";
import { Button } from "../ui/Button";

export const CartDrawer = () => {
  const { isOpen, closeCart, items, updateQuantity, removeItem } = useCart();
  const subtotal = items.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return sum + (product ? (product.salePrice ?? product.price) * item.quantity : 0);
  }, 0);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside className="fixed inset-0 z-50 flex justify-end bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="flex h-full w-full max-w-md flex-col bg-porcelain shadow-soft" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 260, damping: 30 }}>
            <header className="flex items-center justify-between border-b border-line p-5">
              <h2 className="font-display text-xl font-semibold">Cart</h2>
              <button className="focus-ring p-2" onClick={closeCart} aria-label="Close cart"><X size={20} /></button>
            </header>
            <div className="flex-1 overflow-y-auto p-5">
              {items.length ? items.map((item) => {
                const product = products.find((entry) => entry.id === item.productId);
                const variant = product?.variants.find((entry) => entry.id === item.variantId);
                if (!product || !variant) return null;
                return (
                  <div key={`${item.productId}-${item.variantId}`} className="mb-5 grid grid-cols-[88px_1fr] gap-4 border-b border-line pb-5">
                    <img src={product.images[0]} alt={product.name} className="aspect-[4/5] object-cover" />
                    <div>
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-muted">{variant.color} / {variant.size}</p>
                        </div>
                        <button className="text-sm text-muted underline" onClick={() => removeItem(item.productId, item.variantId)}>Remove</button>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex border border-line">
                          <button className="px-3 py-1" onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}>-</button>
                          <span className="min-w-8 px-2 py-1 text-center">{item.quantity}</span>
                          <button className="px-3 py-1" onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}>+</button>
                        </div>
                        <span className="font-semibold">{formatNaira((product.salePrice ?? product.price) * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                );
              }) : <p className="text-muted">Your cart is empty.</p>}
            </div>
            <footer className="border-t border-line p-5">
              <div className="mb-4 flex items-center justify-between font-semibold"><span>Subtotal</span><span>{formatNaira(subtotal)}</span></div>
              <div className="grid gap-3">
                <Button to="/checkout" onClick={closeCart}><MessageCircle size={18} /> WhatsApp Checkout</Button>
                <Link href="/cart" onClick={closeCart} className="text-center text-sm font-semibold underline">View full cart</Link>
              </div>
            </footer>
          </motion.div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
};
