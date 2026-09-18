import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProductGrid } from "../../components/storefront/ProductGrid";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { catalogApi, newsletterApi } from "../../services/api";
import type { Category, Collection, HomepageContent, Product } from "../../types/domain";
import { useMeta } from "../../hooks/useMeta";
import { useScrollReveal } from "../../hooks/useScrollReveal";

export const HomePage = () => {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  useMeta("GODID | God in Every Design", "Premium Nigerian clothing designed and manufactured with God in Every Design.");
  useScrollReveal();

  useEffect(() => {
    Promise.all([catalogApi.getHomepage(), catalogApi.listProducts({ sort: "newest" }), catalogApi.listCategories(), catalogApi.listCollections()]).then(([home, products, cats, cols]) => {
      setContent(home);
      setFeatured(products.filter((product) => home.featuredProductIds.includes(product.id)));
      setNewArrivals(products.slice(0, 4));
      setCategories(cats);
      setCollections(cols);
    });
  }, []);

  if (!content) return <main className="min-h-screen" />;

  const subscribe = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterMessage("Enter a valid email address.");
      return;
    }
    newsletterApi.subscribe(email).then(() => {
      setNewsletterMessage("You are on the GODID list.");
      setEmail("");
    }).catch((error) => setNewsletterMessage(error instanceof Error ? error.message : "Could not subscribe right now."));
  };

  return (
    <main>
      <section className="relative min-h-[calc(100svh-73px)] overflow-hidden">
        <img src={content.heroImage} alt="GODID editorial fashion campaign" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/20 to-transparent" />
        <div className="relative mx-auto flex min-h-[calc(100svh-73px)] max-w-7xl items-end px-4 pb-16 pt-24 lg:px-8">
          <motion.div className="max-w-3xl text-white" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-white/70">Premium Nigerian fashion</p>
            <h1 className="font-display text-5xl font-semibold leading-[0.98] md:text-7xl">{content.heroHeadline}</h1>
            <p className="mt-6 max-w-xl text-lg text-white/80">{content.heroDescription}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/shop" className="bg-white text-ink hover:bg-bone">{content.primaryCta}</Button>
              <Button to="#story" variant="ghost" className="border-white/40 text-white hover:bg-white hover:text-ink">{content.secondaryCta}<ArrowRight size={16} /></Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div data-reveal className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Selected by the studio</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl">Featured Collection</h2>
          </div>
          <Button to="/shop" variant="secondary" className="hidden sm:inline-flex">Shop all</Button>
        </div>
        <ProductGrid products={featured} />
      </section>

      <section className="border-y border-line bg-porcelain py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div data-reveal className="mb-10">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Latest from production</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl">New Arrivals</h2>
          </div>
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div data-reveal className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Dynamic categories</p>
          <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl">Shop By Category</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link data-reveal key={category.id} to={`/shop/${category.slug}`} className="group relative block overflow-hidden bg-line">
              <img src={category.image} alt={category.name} className="aspect-[4/5] h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
              <div className="absolute bottom-0 p-5 text-white">
                <h3 className="font-display text-2xl font-semibold">{category.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-white/75">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="story" className="border-y border-line bg-ink text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div data-reveal>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/50">Brand Story</p>
            <h2 className="mt-3 font-display text-4xl font-semibold md:text-6xl">Original patterns. Intentional craft. Nigerian point of view.</h2>
          </div>
          <div data-reveal className="grid content-end gap-6">
            <p className="text-xl leading-relaxed text-white/80">{content.brandStory}</p>
            <p className="text-white/60">Every piece begins as a design decision, not a catalog import. The studio owns the fit, the fabric conversation, the sample revisions, and the production quality so the philosophy is visible in the finished garment.</p>
          </div>
        </div>
      </section>

      <section id="lookbook" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div data-reveal className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Editorial lookbook</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl">Ways to wear the season</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {content.lookbookImages.map((image, index) => <img data-reveal key={image} src={image} alt={`GODID lookbook outfit ${index + 1}`} className="aspect-[3/4] w-full object-cover" />)}
        </div>
      </section>

      <section className="bg-porcelain py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-[1fr_1fr] lg:px-8">
          <div data-reveal>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Collections</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl">Fashion drops with a point of view</h2>
          </div>
          <div className="grid gap-4">
            {collections.slice(0, 3).map((collection) => (
              <Link data-reveal key={collection.id} to={`/collection/${collection.slug}`} className="grid grid-cols-[96px_1fr] gap-4 border border-line bg-white p-3 transition hover:border-ink">
                <img src={collection.image} alt={collection.name} className="aspect-square object-cover" />
                <div className="self-center">
                  <h3 className="font-display text-xl font-semibold">{collection.name}</h3>
                  <p className="mt-1 text-sm text-muted">{collection.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 text-center lg:px-8">
        <h2 className="font-display text-3xl font-semibold md:text-5xl">{content.newsletterTitle}</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted">{content.newsletterText}</p>
        <form className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={(event) => { event.preventDefault(); subscribe(); }}>
          <Input label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          <Button className="self-end">Subscribe</Button>
        </form>
        {newsletterMessage ? <p className="mt-4 text-sm font-semibold text-palm">{newsletterMessage}</p> : null}
      </section>
    </main>
  );
};
