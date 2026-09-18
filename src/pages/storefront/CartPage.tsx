import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { commerceApi, catalogApi } from "../../services/api";
import { useCart } from "../../state/CartContext";
import { formatNaira } from "../../utils/format";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useMeta } from "../../hooks/useMeta";
import type { Discount, Product } from "../../types/domain";

export const CartPage = () => {
  const { items, updateQuantity, removeItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState<Discount | undefined>();
  const [promoMessage, setPromoMessage] = useState("");
  useMeta("Cart | GODID", "Review your GODID cart before checkout.");
  useEffect(() => { catalogApi.listProducts().then(setProducts); }, []);
  const subtotal = items.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return sum + (product ? (product.salePrice ?? product.price) * item.quantity : 0);
  }, 0);
  const discountValue = discount ? (discount.type === "percentage" ? Math.round(subtotal * (discount.value / 100)) : discount.value) : 0;
  const applyPromo = async () => {
    const applied = await commerceApi.applyDiscount(promo, subtotal);
    setDiscount(applied);
    setPromoMessage(applied ? `${applied.code} applied.` : "That promo code is not valid for this cart.");
  };
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      <h1 className="font-display text-5xl font-semibold">Cart</h1>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="grid gap-4">
          {items.length ? items.map((item) => {
            const product = products.find((entry) => entry.id === item.productId);
            const variant = product?.variants.find((entry) => entry.id === item.variantId);
            if (!product || !variant) return null;
            return (
              <article key={`${item.productId}-${item.variantId}`} className="grid gap-4 border border-line bg-porcelain p-4 sm:grid-cols-[120px_1fr_auto]">
                <img src={product.images[0]} alt={product.name} className="aspect-[4/5] object-cover" />
                <div>
                  <Link to={`/product/${product.slug}`} className="font-display text-xl font-semibold">{product.name}</Link>
                  <p className="mt-2 text-sm text-muted">{variant.color} / {variant.size}</p>
                  <button className="mt-5 text-sm font-semibold underline" onClick={() => removeItem(item.productId, item.variantId)}>Remove</button>
                </div>
                <div className="flex items-center justify-between gap-6 sm:block sm:text-right">
                  <div className="inline-flex border border-line bg-white">
                    <button className="px-3 py-1" onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}>-</button>
                    <span className="min-w-8 px-2 py-1 text-center">{item.quantity}</span>
                    <button className="px-3 py-1" onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}>+</button>
                  </div>
                  <p className="mt-4 font-semibold">{formatNaira((product.salePrice ?? product.price) * item.quantity)}</p>
                </div>
              </article>
            );
          }) : <div className="border border-line bg-white p-10 text-center text-muted">Your cart is empty.</div>}
        </section>
        <aside className="h-fit border border-line bg-white p-5">
          <h2 className="font-display text-2xl font-semibold">Order summary</h2>
          <div className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <Input label="Promo code" value={promo} onChange={(event) => setPromo(event.target.value.toUpperCase())} placeholder="WELCOME10" />
              <Button variant="secondary" onClick={applyPromo} disabled={!items.length || !promo}>Apply code</Button>
              {promoMessage ? <p className={`text-sm font-semibold ${discount ? "text-palm" : "text-clay"}`}>{promoMessage}</p> : null}
            </div>
            <div className="flex justify-between"><span>Subtotal</span><span>{formatNaira(subtotal)}</span></div>
            {discount ? <div className="flex justify-between text-palm"><span>Discount</span><span>-{formatNaira(discountValue)}</span></div> : null}
            <div className="flex justify-between text-muted"><span>Shipping</span><span>Calculated at checkout</span></div>
            <div className="border-t border-line pt-4 flex justify-between font-semibold"><span>Total</span><span>{formatNaira(Math.max(0, subtotal - discountValue))}</span></div>
            <Button to={discount ? `/checkout?discount=${discount.code}` : "/checkout"} disabled={!items.length}>
              <MessageCircle size={18} /> Complete on WhatsApp
            </Button>
          </div>
        </aside>
      </div>
    </main>
  );
};
