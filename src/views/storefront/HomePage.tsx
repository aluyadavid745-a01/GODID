'use client'
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageGodSection } from "../../components/storefront/MessageGodSection";
import { ProductGrid } from "../../components/storefront/ProductGrid";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { catalogApi, newsletterApi } from "../../services/api";
import type { Category, Collection, HomepageContent, Product } from "../../types/domain";
import { useMeta } from "../../hooks/useMeta";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import storefrontLogo from "../../assets/storefront-logo.jpeg";

export const HomePage = () => {
  const pathname = usePathname();
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  useMeta("GODID | God in Every Design", "Shop GODID clothing with delivery nationwide across Nigeria.");
  useScrollReveal("[data-reveal]", Boolean(content));

  useEffect(() => {
    Promise.all([catalogApi.getHomepage(), catalogApi.listProducts({ sort: "newest" }), catalogApi.listCategories(), catalogApi.listCollections()]).then(([home, products, cats, cols]) => {
      setContent(home);
      setFeatured(products.filter((product) => home.featuredProductIds.includes(product.id)));
      setNewArrivals(products.slice(0, 4));
      setCategories(cats);
      setCollections(cols);
    });
  }, []);

  useEffect(() => {
    if (content && typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" }));
    }
  }, [content, pathname]);

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
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-[1440px] lg:min-h-[690px] lg:grid-cols-[0.88fr_1.12fr]">
          <motion.div className="order-2 flex flex-col justify-center px-5 py-14 sm:px-10 sm:py-20 lg:order-1 lg:px-12 xl:px-20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted"><span className="h-px w-8 bg-accent" />The GODID Studio</p>
            <h1 className="mt-7 max-w-[680px]">
              <span className="sr-only">{content.heroHeadline}</span>
              <img
                src={content.heroLogo || storefrontLogo.src}
                alt=""
                className="block h-auto w-full max-w-[520px] rounded-sm object-contain"
              />
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-muted sm:text-lg">{content.heroDescription}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button to="/shop" className="border-ink bg-ink px-7 text-white hover:border-accent hover:bg-accent">{content.primaryCta}<ArrowRight size={16} /></Button>
              <Button to="/#story" variant="secondary" className="px-7 hover:border-ink">{content.secondaryCta}</Button>
            </div>
            <div className="mt-12 flex items-center gap-3 border-t border-line pt-5 text-xs font-semibold uppercase tracking-[0.12em] text-muted"><span className="h-2 w-2 rounded-full bg-accent" />Designed with purpose · Delivered nationwide</div>
          </motion.div>
          <div className="relative order-1 min-h-[360px] overflow-hidden bg-bone sm:min-h-[500px] lg:order-2 lg:min-h-full">
            <img src={content.heroImage} alt="GODID editorial fashion campaign" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-ink/60 to-transparent px-5 pb-5 pt-20 text-white sm:px-8 sm:pb-8">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em]">God in Every Design</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em]">01 / GODID</span>
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-line bg-porcelain">
        <div className="mx-auto grid max-w-7xl divide-y divide-line px-4 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-ink sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8">
          <span className="py-5">Original design</span>
          <span className="py-5">Delivery nationwide</span>
          <span className="py-5">WhatsApp order completion</span>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-24 lg:px-8">
        <div data-reveal className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">01 / The edit</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] md:text-5xl">Selected for you</h2>
          </div>
          <Button to="/shop" variant="secondary" className="hidden sm:inline-flex">Shop all</Button>
        </div>
        <ProductGrid products={featured} />
      </section>

      <section className="border-y border-line bg-porcelain py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div data-reveal className="mb-10">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">02 / Just landed</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] md:text-5xl">New arrivals</h2>
          </div>
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-24 lg:px-8">
        <div data-reveal className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">03 / Find your fit</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] md:text-5xl">Shop by category</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link data-reveal key={category.id} href={`/shop/${category.slug}`} className="group relative block overflow-hidden bg-line focus-ring">
              <img src={category.image} alt={category.name} className="aspect-[4/5] h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <div className="mb-4 h-0.5 w-8 bg-accent transition-all duration-300 group-hover:w-16" />
                <h3 className="font-display text-2xl font-semibold">{category.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-white/75">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="story" className="scroll-mt-32 border-y-4 border-accent bg-ink text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div data-reveal>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/60">04 / Our point of view</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Original patterns. Intentional craft. Nigerian point of view.</h2>
          </div>
          <div data-reveal className="grid content-end gap-6">
            <p className="text-xl leading-relaxed text-white/80">{content.brandStory}</p>
            <p className="text-white/60">Every piece begins as a design decision, not a catalog import. The studio owns the fit, the fabric conversation, the sample revisions, and the production quality so the philosophy is visible in the finished garment.</p>
          </div>
        </div>
      </section>

      <MessageGodSection />

      <section id="lookbook" className="mx-auto max-w-7xl scroll-mt-32 px-4 py-16 sm:py-24 lg:px-8">
        <div data-reveal className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">05 / Editorial</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] md:text-5xl">Ways to wear the season</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {content.lookbookImages.map((image, index) => <figure data-reveal key={image} className="relative overflow-hidden bg-line"><img src={image} alt={`GODID lookbook outfit ${index + 1}`} className="aspect-[3/4] w-full object-cover" loading="lazy" /><figcaption className="absolute bottom-0 left-0 bg-white px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink">GODID / {String(index + 1).padStart(2, "0")}</figcaption></figure>)}
        </div>
      </section>

      <section className="bg-porcelain py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-[1fr_1fr] lg:px-8">
          <div data-reveal>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">06 / Collections</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] md:text-5xl">Explore the collections</h2>
          </div>
          <div className="grid gap-4">
            {collections.slice(0, 3).map((collection) => (
              <Link data-reveal key={collection.id} href={`/collection/${collection.slug}`} className="grid grid-cols-[80px_1fr_auto] items-center gap-4 border-b border-line py-3 transition hover:border-accent sm:grid-cols-[96px_1fr_auto]">
                <img src={collection.image} alt={collection.name} className="aspect-square object-cover" />
                <div className="self-center">
                  <h3 className="font-display text-xl font-semibold">{collection.name}</h3>
                  <p className="mt-1 text-sm text-muted">{collection.description}</p>
                </div>
                <ArrowRight size={18} className="text-accent" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">The studio list</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] md:text-5xl">{content.newsletterTitle}</h2>
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
