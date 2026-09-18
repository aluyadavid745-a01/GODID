import { Heart, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ProductGallery } from "../../components/storefront/ProductGallery";
import { ProductGrid } from "../../components/storefront/ProductGrid";
import { Button } from "../../components/ui/Button";
import { catalogApi, inventoryService } from "../../services/api";
import { useCart } from "../../state/CartContext";
import type { Product } from "../../types/domain";
import { formatNaira } from "../../utils/format";
import { useMeta } from "../../hooks/useMeta";

export const ProductPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (!slug) return;
    catalogApi.getProductBySlug(slug).then((item) => {
      if (!item) return;
      setProduct(item);
      setColor(item.colors[0].name);
      setSize(item.sizes[0]);
      const saved = JSON.parse(localStorage.getItem("godid-wishlist") ?? "[]") as string[];
      setWishlisted(saved.includes(item.id));
      catalogApi.listProducts({ category: item.categoryId }).then((items) => setRelated(items.filter((entry) => entry.id !== item.id).slice(0, 4)));
    });
  }, [slug]);

  useMeta(product ? `${product.name} | GODID` : "Product | GODID", product?.description ?? "Premium GODID product details.");

  const variant = useMemo(() => product?.variants.find((item) => item.color === color && item.size === size), [color, product, size]);
  const available = Boolean(product && variant && inventoryService.isVariantAvailable(product, variant.id, quantity));

  if (!product) return <main className="min-h-screen px-4 py-20">Product not found.</main>;

  const toggleWishlist = () => {
    const saved = JSON.parse(localStorage.getItem("godid-wishlist") ?? "[]") as string[];
    const next = saved.includes(product.id) ? saved.filter((id) => id !== product.id) : [...saved, product.id];
    localStorage.setItem("godid-wishlist", JSON.stringify(next));
    setWishlisted(next.includes(product.id));
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <ProductGallery product={product} />
        <section className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">GODID garment</p>
          <h1 className="mt-3 font-display text-4xl font-semibold md:text-6xl">{product.name}</h1>
          <div className="mt-5 flex items-center gap-3 text-xl">
            {product.salePrice ? <span className="font-semibold text-clay">{formatNaira(product.salePrice)}</span> : null}
            <span className={product.salePrice ? "text-muted line-through" : "font-semibold"}>{formatNaira(product.price)}</span>
          </div>
          <p className="mt-6 text-lg leading-relaxed text-muted">{product.description}</p>
          <div className="mt-8 grid gap-6 border-y border-line py-6">
            <div>
              <div className="mb-3 flex justify-between text-sm font-semibold"><span>Color</span><span>{color}</span></div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((item) => {
                  const disabled = !product.variants.some((variant) => variant.color === item.name && variant.size === size && variant.inventory > 0);
                  return <button key={item.name} disabled={disabled} className={`focus-ring h-11 w-11 border ${color === item.name ? "border-ink" : "border-line"} disabled:opacity-30`} style={{ background: item.hex }} onClick={() => setColor(item.name)} aria-label={item.name} />;
                })}
              </div>
            </div>
            <div>
              <div className="mb-3 flex justify-between text-sm font-semibold"><span>Size</span><button className="underline">Size guide</button></div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((item) => {
                  const disabled = !product.variants.some((variant) => variant.size === item && variant.color === color && variant.inventory > 0);
                  return <button key={item} disabled={disabled} className={`focus-ring h-11 min-w-12 border px-4 font-semibold ${size === item ? "border-ink bg-ink text-white" : "border-line bg-white"} disabled:cursor-not-allowed disabled:opacity-30`} onClick={() => setSize(item)}>{item}</button>;
                })}
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold">Quantity</span>
              <div className="flex border border-line bg-white">
                <button className="px-4 py-2" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span className="min-w-10 px-3 py-2 text-center">{quantity}</span>
                <button className="px-4 py-2" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <Button disabled={!available} onClick={() => variant && addItem({ productId: product.id, variantId: variant.id, quantity })}>Add to Cart</Button>
            <Button disabled={!available} to="/checkout" variant="secondary" onClick={() => variant && addItem({ productId: product.id, variantId: variant.id, quantity })}>Buy Now</Button>
            <Button variant="ghost" aria-label="Add to wishlist" onClick={toggleWishlist} className={wishlisted ? "bg-white text-accent" : ""}><Heart size={18} />{wishlisted ? "Saved" : ""}</Button>
          </div>
          <div className="mt-6 grid gap-4 text-sm text-muted">
            <p className={available ? "text-palm" : "text-clay"}>{available ? `${variant?.inventory} units available` : "Selected variant is unavailable"}</p>
            <p className="flex gap-2"><Truck size={18} /> Nationwide delivery calculated at checkout by state and shipping zone.</p>
            <p>Returns accepted within 7 days for unworn garments with tags intact.</p>
          </div>
          <div className="mt-8 grid gap-5 border-t border-line pt-6">
            <Info title="Product details" items={product.details} />
            <Info title="Materials" items={[product.materials]} />
            <Info title="Care instructions" items={[product.care]} />
          </div>
        </section>
      </div>
      <section className="py-20">
        <h2 className="mb-8 font-display text-3xl font-semibold">Related products</h2>
        <ProductGrid products={related} />
      </section>
    </main>
  );
};

const Info = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <h3 className="font-semibold">{title}</h3>
    <ul className="mt-2 grid gap-1 text-sm text-muted">{items.map((item) => <li key={item}>{item}</li>)}</ul>
  </div>
);
