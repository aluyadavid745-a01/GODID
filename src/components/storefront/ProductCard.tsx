import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../../types/domain";
import { formatNaira } from "../../utils/format";
import { useCart } from "../../state/CartContext";
import { Button } from "../ui/Button";

export const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const [wishlisted, setWishlisted] = useState(() => {
    try { return (JSON.parse(localStorage.getItem("godid-wishlist") ?? "[]") as string[]).includes(product.id); }
    catch { return false; }
  });
  const firstAvailable = product.variants.find((variant) => variant.inventory > 0);
  const toggleWishlist = () => {
    let saved: string[] = [];
    try { saved = JSON.parse(localStorage.getItem("godid-wishlist") ?? "[]") as string[]; }
    catch { /* Recover from invalid browser data. */ }
    const next = saved.includes(product.id) ? saved.filter((id) => id !== product.id) : [...saved, product.id];
    localStorage.setItem("godid-wishlist", JSON.stringify(next));
    setWishlisted(next.includes(product.id));
  };
  return (
    <article className="group relative min-w-0">
      <Link to={`/product/${product.slug}`} className="block overflow-hidden bg-line">
        <div className="relative aspect-[4/5]">
          <img className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 group-hover:opacity-0" src={product.images[0]} alt={product.name} />
          {product.hoverImage ? <img className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-700 group-hover:scale-105 group-hover:opacity-100" src={product.hoverImage} alt={`${product.name} alternate view`} /> : null}
          {product.salePrice ? <span className="absolute bottom-3 left-3 bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">Sale</span> : null}
        </div>
      </Link>
      <button type="button" onClick={toggleWishlist} className={`focus-ring absolute right-3 top-3 grid h-10 w-10 place-items-center bg-white/95 transition hover:bg-ink hover:text-white ${wishlisted ? "text-accent" : "text-ink"}`} aria-label={`${wishlisted ? "Remove" : "Add"} ${product.name} ${wishlisted ? "from" : "to"} wishlist`} aria-pressed={wishlisted}>
        <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
      </button>
      <div className="mt-3 grid gap-3 sm:mt-4 sm:flex sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <Link to={`/product/${product.slug}`} className="block text-sm font-semibold leading-snug hover:text-accent sm:text-base">{product.name}</Link>
          <div className="mt-1 flex items-center gap-2 text-sm">
            {product.salePrice ? <span className="font-semibold text-clay">{formatNaira(product.salePrice)}</span> : null}
            <span className={product.salePrice ? "text-muted line-through" : "font-semibold"}>{formatNaira(product.price)}</span>
          </div>
          <div className="mt-3 flex gap-1.5">
            {product.colors.map((color) => <span key={color.name} className="h-3.5 w-3.5 rounded-full border border-line ring-1 ring-white" style={{ background: color.hex }} title={color.name} />)}
          </div>
        </div>
        <Button
          variant="secondary"
          className="h-10 min-h-10 w-full px-3 sm:w-auto"
          disabled={!firstAvailable}
          onClick={() => firstAvailable && addItem({ productId: product.id, variantId: firstAvailable.id, quantity: 1 })}
          aria-label={`Quick add ${product.name}`}
        >
          <ShoppingBag size={16} />
        </Button>
      </div>
    </article>
  );
};
