import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../types/domain";
import { formatNaira } from "../../utils/format";
import { useCart } from "../../state/CartContext";
import { Button } from "../ui/Button";

export const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const firstAvailable = product.variants.find((variant) => variant.inventory > 0);
  return (
    <article className="group relative">
      <Link to={`/product/${product.slug}`} className="block overflow-hidden bg-line">
        <div className="relative aspect-[4/5]">
          <img className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:opacity-0 group-hover:scale-105" src={product.images[0]} alt={product.name} />
          <img className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-700 group-hover:opacity-100 group-hover:scale-105" src={product.hoverImage} alt={`${product.name} alternate view`} />
        </div>
      </Link>
      <button className="focus-ring absolute right-3 top-3 grid h-10 w-10 place-items-center bg-white/90 text-ink transition hover:bg-ink hover:text-white" aria-label={`Add ${product.name} to wishlist`}>
        <Heart size={18} />
      </button>
      <div className="mt-3 grid gap-3 sm:mt-4 sm:flex sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <Link to={`/product/${product.slug}`} className="block text-sm font-semibold leading-snug hover:text-palm sm:text-base">{product.name}</Link>
          <div className="mt-1 flex items-center gap-2 text-sm">
            {product.salePrice ? <span className="font-semibold text-clay">{formatNaira(product.salePrice)}</span> : null}
            <span className={product.salePrice ? "text-muted line-through" : "font-semibold"}>{formatNaira(product.price)}</span>
          </div>
          <div className="mt-3 flex gap-1.5">
            {product.colors.map((color) => <span key={color.name} className="h-4 w-4 border border-line" style={{ background: color.hex }} title={color.name} />)}
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
