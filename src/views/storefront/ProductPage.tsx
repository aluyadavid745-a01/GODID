'use client'
import { Heart, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ProductGallery } from "../../components/storefront/ProductGallery";
import { ProductGrid } from "../../components/storefront/ProductGrid";
import { StarRating } from "../../components/storefront/StarRating";
import { Button } from "../../components/ui/Button";
import { catalogApi, commerceApi, inventoryService } from "../../services/api";
import { useCart } from "../../state/CartContext";
import type { Product, Review } from "../../types/domain";
import { formatNaira } from "../../utils/format";
import { useMeta } from "../../hooks/useMeta";

export const ProductPage = () => {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    catalogApi.getProductBySlug(slug).then((item) => {
      setLoading(false);
      if (!item) return;
      setProduct(item);
      setColor(item.colors[0]?.name ?? "");
      setSize(item.sizes[0] ?? "");
      const saved = JSON.parse(typeof window !== "undefined" ? (localStorage.getItem("godid-wishlist") ?? "[]") : "[]") as string[];
      setWishlisted(saved.includes(item.id));
      catalogApi.listProducts({ category: item.categoryId }).then((items) => setRelated(items.filter((entry) => entry.id !== item.id).slice(0, 4)));
      catalogApi.getProductReviews(item.id).then(setReviews);
    });
  }, [slug]);

  useMeta(product ? `${product.name} | GODID` : "Product | GODID", product?.description ?? "Premium GODID product details.");

  const variant = useMemo(() => product?.variants.find((item) => item.color === color && item.size === size), [color, product, size]);
  const available = Boolean(product && variant && inventoryService.isVariantAvailable(product, variant.id, quantity));
  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  if (loading) return <main className="min-h-screen px-4 py-20"><div className="h-8 w-48 animate-pulse rounded bg-line" /></main>;
  if (!product) return <main className="min-h-screen px-4 py-20">Product not found.</main>;

  const toggleWishlist = () => {
    const saved = JSON.parse(typeof window !== "undefined" ? (localStorage.getItem("godid-wishlist") ?? "[]") : "[]") as string[];
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
          {reviews.length > 0 && (
            <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
              <StarRating value={avgRating} size={14} />
              <span>{avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
            </a>
          )}
          <div className="mt-5 flex items-center gap-3 text-xl">
            {product.salePrice ? <span className="font-semibold text-clay">{formatNaira(product.salePrice)}</span> : null}
            <span className={product.salePrice ? "text-muted line-through" : "font-semibold"}>{formatNaira(product.price)}</span>
          </div>
          {(product.bulkPricing ?? []).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {[...(product.bulkPricing ?? [])].sort((a, b) => a.minQty - b.minQty).map((tier) => (
                <span key={tier.minQty} className="border border-accent/40 bg-accent/5 px-2.5 py-1 text-xs font-semibold text-accent">
                  {tier.label ? `${tier.label}: ` : ""}{tier.minQty}+ units — {formatNaira(tier.price)} each
                </span>
              ))}
            </div>
          )}
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

      <section id="reviews" className="border-t border-line py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold">Reviews</h2>
            {reviews.length > 0 && (
              <div className="mt-2 flex items-center gap-3">
                <StarRating value={avgRating} size={18} />
                <span className="text-sm text-muted">{avgRating.toFixed(1)} out of 5 · {reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
        </div>
        {reviews.length > 0 ? (
          <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <div key={review.id} className="border border-line bg-white p-5">
                <StarRating value={review.rating} size={14} />
                <p className="mt-3 text-sm leading-relaxed">{review.body}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted">
                  <span className="font-semibold">{review.authorName}</span>
                  <span>{new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-12 text-muted">No reviews yet. Be the first to share your thoughts.</p>
        )}
        <ReviewForm product={product} onSubmitted={(r) => setReviews((prev) => [...prev, r])} />
      </section>

      <section className="py-20">
        <h2 className="mb-8 font-display text-3xl font-semibold">Related products</h2>
        <ProductGrid products={related} />
      </section>
    </main>
  );
};

const ReviewForm = ({ product, onSubmitted }: { product: Product; onSubmitted: (review: Review) => void }) => {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rating || !body.trim()) return;
    setSaving(true);
    try {
      const review = await commerceApi.submitReview({ productId: product.id, productName: product.name, authorName: name.trim(), rating: rating as 1 | 2 | 3 | 4 | 5, body: body.trim() });
      onSubmitted(review);
      setDone(true);
    } finally {
      setSaving(false);
    }
  };

  if (done) return (
    <div className="border border-palm bg-palm/5 p-6 text-palm">
      <p className="font-semibold">Review submitted — thank you!</p>
      <p className="mt-1 text-sm">Your review is now live on this product.</p>
    </div>
  );

  return (
    <form onSubmit={submit} className="max-w-lg border border-line bg-white p-6">
      <h3 className="font-display text-xl font-semibold">Write a review</h3>
      <div className="mt-5 grid gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em]">Your rating</label>
          <StarRating value={rating} interactive onChange={setRating} size={24} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em]">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full border border-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em]">Review</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Share your experience with this product…" className="w-full resize-none border border-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
        </div>
        <Button type="submit" disabled={saving || !name.trim() || !rating || !body.trim()}>{saving ? "Submitting…" : "Submit review"}</Button>
      </div>
    </form>
  );
};

const Info = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <h3 className="font-semibold">{title}</h3>
    <ul className="mt-2 grid gap-1 text-sm text-muted">{items.map((item) => <li key={item}>{item}</li>)}</ul>
  </div>
);
