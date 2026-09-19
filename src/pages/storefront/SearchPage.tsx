'use client'
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductGrid } from "../../components/storefront/ProductGrid";
import { Input } from "../../components/ui/Input";
import { catalogApi } from "../../services/api";
import type { Product } from "../../types/domain";
import { useMeta } from "../../hooks/useMeta";

export const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  useMeta("Search | GODID", "Search GODID products, collections, and garments.");

  useEffect(() => {
    catalogApi.listProducts({ search: query, sort: "newest" }).then(setResults);
  }, [query]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Find garments</p>
          <h1 className="mt-3 font-display text-5xl font-semibold">Search</h1>
        </div>
        <Search className="hidden text-muted sm:block" size={34} />
      </div>
      <section className="mb-10 border border-line bg-porcelain p-5">
        <Input label="Search GODID" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try hoodie, trouser, jacket, linen" />
      </section>
      <ProductGrid products={results} />
    </main>
  );
};
