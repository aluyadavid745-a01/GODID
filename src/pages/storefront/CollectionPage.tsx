'use client'
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProductGrid } from "../../components/storefront/ProductGrid";
import { catalogApi } from "../../services/api";
import type { Collection, Product } from "../../types/domain";
import { useMeta } from "../../hooks/useMeta";

export const CollectionPage = () => {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    if (!slug) return;
    catalogApi.getCollectionBySlug(slug).then((item) => {
      setCollection(item ?? null);
      if (item) catalogApi.listProducts({ collection: item.id }).then(setProducts);
    });
  }, [slug]);
  useMeta(collection ? `${collection.name} | GODID` : "Collection | GODID", collection?.description ?? "Shop GODID fashion collections.");
  if (!collection) return <main className="min-h-screen px-4 py-20">Collection not found.</main>;
  return (
    <main>
      <section className="relative min-h-[55svh]">
        <img src={collection.image} alt={collection.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/45" />
        <div className="relative mx-auto flex min-h-[55svh] max-w-7xl items-end px-4 py-14 text-white lg:px-8">
          <div><p className="font-mono text-xs uppercase tracking-[0.18em] text-white/70">Collection</p><h1 className="mt-3 font-display text-5xl font-semibold md:text-7xl">{collection.name}</h1><p className="mt-4 max-w-xl text-white/80">{collection.description}</p></div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8"><ProductGrid products={products} /></section>
    </main>
  );
};
