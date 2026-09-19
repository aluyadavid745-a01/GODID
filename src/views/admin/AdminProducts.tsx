'use client'
import { Edit, Eye, Plus, Save, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { adminApi } from "../../services/api";
import { ImageUpload } from "../../components/ui/ImageUpload";
import { uploadImage } from "../../services/firestoreStore";
import type { Category, Collection, Product, ProductStatus } from "../../types/domain";
import { formatNaira } from "../../utils/format";
import { useMeta } from "../../hooks/useMeta";

const blankProduct = (categories: Category[]): Product => ({
  id: `prod-${Date.now()}`,
  slug: "",
  name: "",
  description: "",
  price: 0,
  salePrice: undefined,
  categoryId: categories[0]?.id ?? "",
  collectionIds: [],
  images: ["https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&h=1500&q=82"],
  hoverImage: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&h=1500&q=82",
  colors: [{ name: "Black", hex: "#111111" }],
  sizes: ["M"],
  variants: [{ id: `var-${Date.now()}`, sku: `GOD-${Date.now().toString().slice(-5)}`, color: "Black", colorHex: "#111111", size: "M", inventory: 10, lowStockThreshold: 5 }],
  materials: "",
  care: "",
  details: [],
  featured: false,
  popular: false,
  status: "draft",
  createdAt: new Date().toISOString(),
});

export const AdminProducts = () => {
  const [rows, setRows] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [notice, setNotice] = useState("");
  useMeta("Product Management | GODID", "Create, edit, publish and manage GODID products.");

  const refresh = () => adminApi.products().then(setRows);
  useEffect(() => {
    refresh();
    adminApi.categories().then(setCategories);
    adminApi.collections().then(setCollections);
  }, []);

  const filteredRows = useMemo(() => rows.filter((product) => {
    const haystack = `${product.name} ${product.slug} ${product.description}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (!status || product.status === status) && (!categoryId || product.categoryId === categoryId);
  }), [categoryId, query, rows, status]);

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    await adminApi.saveProduct(editing);
    setEditing(null);
    setNotice("Product saved and synced to the storefront.");
    refresh();
  };

  const updateEditing = <K extends keyof Product>(key: K, value: Product[K]) => {
    setEditing((current) => current ? { ...current, [key]: value } : current);
  };

  const deleteProduct = async (product: Product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    await adminApi.deleteProduct(product.id);
    setNotice("Product deleted.");
    refresh();
  };


  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 className="font-display text-3xl font-semibold">Product Management</h2><p className="text-muted">Products, variants, pricing, images, materials and care instructions.</p></div>
        <Button onClick={() => setEditing(blankProduct(categories))}><Plus size={16} /> Create product</Button>
      </div>
      {notice ? <div className="border border-palm bg-white p-3 text-sm font-semibold text-palm">{notice}</div> : null}
      <section className="grid gap-4 border border-line bg-white p-5 lg:grid-cols-3">
        <Input label="Search products" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, slug or description" />
        <Select label="Category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} options={[{ label: "All categories", value: "" }, ...categories.map((category) => ({ label: category.name, value: category.id }))]} />
        <Select label="Status" value={status} onChange={(event) => setStatus(event.target.value)} options={[{ label: "All statuses", value: "" }, { label: "Published", value: "published" }, { label: "Draft", value: "draft" }]} />
      </section>
      <DataTable<Product> rows={filteredRows} columns={[
        { key: "product", header: "Product", render: (row) => <div className="flex gap-3"><img src={row.images[0]} alt={row.name} className="h-14 w-11 object-cover" /><div><p className="font-semibold">{row.name}</p><p className="text-xs text-muted">{row.slug}</p></div></div> },
        { key: "price", header: "Price", render: (row) => formatNaira(row.salePrice ?? row.price) },
        { key: "sku", header: "Variants", render: (row) => row.variants.length },
        { key: "stock", header: "Inventory", render: (row) => row.variants.reduce((sum, variant) => sum + variant.inventory, 0) },
        { key: "featured", header: "Featured", render: (row) => <input type="checkbox" checked={row.featured} onChange={async (event) => { await adminApi.saveProduct({ ...row, featured: event.target.checked }); refresh(); }} /> },
        { key: "status", header: "Status", render: (row) => <Select label="" value={row.status} onChange={async (event) => { await adminApi.updateProductStatus(row.id, event.target.value as ProductStatus); refresh(); }} className="py-2" options={[{ label: "Published", value: "published" }, { label: "Draft", value: "draft" }]} /> },
        { key: "actions", header: "Actions", render: (row) => <div className="flex gap-2"><a aria-label="View" href={`/product/${row.slug}`} className="p-2"><Eye size={16} /></a><button aria-label="Edit" className="p-2" onClick={() => setEditing(row)}><Edit size={16} /></button><button aria-label="Delete" className="p-2 text-red-700" onClick={() => deleteProduct(row)}><Trash2 size={16} /></button></div> },
      ]} />
      <Modal open={Boolean(editing)} title={editing?.name || "Create product"} onClose={() => setEditing(null)}>
        {editing ? (
          <form className="grid max-h-[72vh] gap-4 overflow-y-auto pr-1" onSubmit={saveProduct}>
            <Input label="Product name" value={editing.name} required onChange={(event) => updateEditing("name", event.target.value)} />
            <Input label="Slug" value={editing.slug} placeholder="auto-generated if empty" onChange={(event) => updateEditing("slug", event.target.value)} />
            <Input label="Description" value={editing.description} required onChange={(event) => updateEditing("description", event.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Price" type="number" value={editing.price || ""} required onChange={(event) => updateEditing("price", Number(event.target.value))} />
              <Input label="Sale price" type="number" value={editing.salePrice ?? ""} onChange={(event) => updateEditing("salePrice", event.target.value ? Number(event.target.value) : undefined)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Category" value={editing.categoryId} onChange={(event) => updateEditing("categoryId", event.target.value)} options={categories.map((category) => ({ label: category.name, value: category.id }))} />
              <Select label="Status" value={editing.status} onChange={(event) => updateEditing("status", event.target.value as ProductStatus)} options={[{ label: "Published", value: "published" }, { label: "Draft", value: "draft" }]} />
            </div>
            <ImageUpload
              label="Main image"
              value={editing.images[0] ?? ""}
              uploadFn={(file) => uploadImage(`products/${editing.id}`, file)}
              onChange={(url) => updateEditing("images", [url, ...editing.images.slice(1)])}
            />
            <ImageUpload
              label="Hover image"
              value={editing.hoverImage}
              uploadFn={(file) => uploadImage(`products/${editing.id}/hover`, file)}
              onChange={(url) => updateEditing("hoverImage", url)}
            />
            <Input label="Materials" value={editing.materials} onChange={(event) => updateEditing("materials", event.target.value)} />
            <Input label="Care" value={editing.care} onChange={(event) => updateEditing("care", event.target.value)} />
            <Input label="Details" value={editing.details.join(", ")} onChange={(event) => updateEditing("details", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} hint="Separate details with commas." />
            <Select label="Featured collection" value={editing.collectionIds[0] ?? ""} onChange={(event) => updateEditing("collectionIds", event.target.value ? [event.target.value] : [])} options={[{ label: "No collection", value: "" }, ...collections.map((collection) => ({ label: collection.name, value: collection.id }))]} />
            <div className="grid gap-3 border border-line bg-white p-4">
              <p className="text-sm font-semibold">Default variant</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="SKU" value={editing.variants[0]?.sku ?? ""} onChange={(event) => updateEditing("variants", [{ ...editing.variants[0], sku: event.target.value }])} />
                <Input label="Stock" type="number" value={editing.variants[0]?.inventory ?? 0} onChange={(event) => updateEditing("variants", [{ ...editing.variants[0], inventory: Number(event.target.value) }])} />
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:justify-between">
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}><X size={16} /> Cancel</Button>
              <Button type="submit"><Save size={16} /> Save product</Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
};
