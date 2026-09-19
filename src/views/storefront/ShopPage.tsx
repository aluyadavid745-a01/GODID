'use client'
import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ProductGrid } from "../../components/storefront/ProductGrid";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { catalogApi, type ProductFilters } from "../../services/api";
import type { Category, Collection, Product } from "../../types/domain";
import { useMeta } from "../../hooks/useMeta";

export const ShopPage = () => {
  const params = useParams();
  const categorySlug = params?.categorySlug as string | undefined;
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [filters, setFilters] = useState<ProductFilters>({ sort: "newest" });
  const routeCategoryId = useMemo(() => categories.find((category) => category.slug === categorySlug)?.id, [categories, categorySlug]);
  useMeta("Shop GODID | Nationwide Delivery", "Shop GODID t-shirts, hoodies, shirts, trousers, jackets, dresses and accessories with delivery nationwide.");

  useEffect(() => {
    Promise.all([catalogApi.listCategories(), catalogApi.listCollections(), catalogApi.listProducts()]).then(([cats, cols, items]) => {
      setCategories(cats);
      setCollections(cols);
      setAllProducts(items);
      const matched = cats.find((category) => category.slug === categorySlug);
      setFilters((value) => ({ ...value, category: matched?.id }));
    });
  }, [categorySlug]);

  useEffect(() => {
    catalogApi.listProducts(filters).then(setProducts);
  }, [filters]);

  const colors = useMemo(() => [...new Set(allProducts.flatMap((product) => product.colors.map((color) => color.name)))], [allProducts]);
  const sizes = useMemo(() => [...new Set(allProducts.flatMap((product) => product.sizes))], [allProducts]);
  const hasActiveFilters = Boolean(filters.search || (filters.category && filters.category !== routeCategoryId) || filters.collection || filters.size || filters.color || filters.minPrice || filters.maxPrice || filters.sort !== "newest");
  const clearFilters = () => setFilters({ sort: "newest", category: routeCategoryId });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12 lg:px-8">
      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">GODID · Nationwide delivery</p>
          <h1 className="mt-3 font-display text-4xl font-semibold md:text-6xl">Shop</h1>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm text-muted md:justify-end">
          <span className="flex items-center gap-2"><SlidersHorizontal size={18} /> Filter refined product runs</span>
          <span className="font-semibold text-ink">{products.length} items</span>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="-mx-4 h-fit border-y border-line bg-white/95 p-4 sm:mx-0 sm:border lg:sticky lg:top-24 lg:bg-porcelain">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink">Filters</p>
            {hasActiveFilters ? <button type="button" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted hover:text-ink" onClick={clearFilters}>Reset</button> : null}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1 lg:gap-4">
            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
              <Input label="Search" className="w-full" value={filters.search ?? ""} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search products" />
            </div>
            <Select label="Category" value={filters.category ?? ""} onChange={(event) => setFilters({ ...filters, category: event.target.value || undefined })} options={[{ label: "All categories", value: "" }, ...categories.map((item) => ({ label: item.name, value: item.id }))]} />
            <Select label="Collection" value={filters.collection ?? ""} onChange={(event) => setFilters({ ...filters, collection: event.target.value || undefined })} options={[{ label: "All collections", value: "" }, ...collections.map((item) => ({ label: item.name, value: item.id }))]} />
            <Select label="Size" value={filters.size ?? ""} onChange={(event) => setFilters({ ...filters, size: event.target.value || undefined })} options={[{ label: "All sizes", value: "" }, ...sizes.map((item) => ({ label: item, value: item }))]} />
            <Select label="Color" value={filters.color ?? ""} onChange={(event) => setFilters({ ...filters, color: event.target.value || undefined })} options={[{ label: "All colors", value: "" }, ...colors.map((item) => ({ label: item, value: item }))]} />
            <div className="col-span-2 grid grid-cols-2 gap-3 sm:col-span-1 lg:col-span-1">
              <Input label="Min ₦" type="number" value={filters.minPrice ?? ""} onChange={(event) => setFilters({ ...filters, minPrice: Number(event.target.value) || undefined })} />
              <Input label="Max ₦" type="number" value={filters.maxPrice ?? ""} onChange={(event) => setFilters({ ...filters, maxPrice: Number(event.target.value) || undefined })} />
            </div>
            <Select label="Sort by" value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value as ProductFilters["sort"] })} options={[
              { label: "Newest", value: "newest" },
              { label: "Price low to high", value: "price-asc" },
              { label: "Price high to low", value: "price-desc" },
              { label: "Popular", value: "popular" },
              { label: "Featured", value: "featured" },
            ]} />
          </div>
        </aside>
        <ProductGrid products={products} />
      </div>
    </main>
  );
};
