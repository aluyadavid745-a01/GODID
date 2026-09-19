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
import type { Category, Collection, Product, ProductStatus, ProductVariant } from "../../types/domain";
import { formatNaira } from "../../utils/format";
import { useMeta } from "../../hooks/useMeta";

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

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
  colors: [],
  sizes: [],
  variants: [],
  materials: "",
  care: "",
  details: [],
  featured: false,
  popular: false,
  status: "draft",
  createdAt: new Date().toISOString(),
});

const makeVariant = (color: string, colorHex: string, size: string): ProductVariant => ({
  id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  sku: "",
  color,
  colorHex,
  size,
  inventory: 0,
  lowStockThreshold: 5,
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

  // new-color/size inputs
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#111111");
  const [newSize, setNewSize] = useState("");

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

  const openEdit = (product: Product) => {
    setNewColorName("");
    setNewColorHex("#111111");
    setNewSize("");
    setEditing(product);
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    await adminApi.saveProduct(editing);
    setEditing(null);
    setNotice("Product saved and synced to the storefront.");
    refresh();
  };

  const upd = <K extends keyof Product>(key: K, value: Product[K]) =>
    setEditing((p) => p ? { ...p, [key]: value } : p);

  const deleteProduct = async (product: Product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    await adminApi.deleteProduct(product.id);
    setNotice("Product deleted.");
    refresh();
  };

  // ── Color helpers ────────────────────────────────────────────────────────────
  const addColor = () => {
    if (!editing || !newColorName.trim()) return;
    const name = newColorName.trim();
    const hex = newColorHex;
    if (editing.colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) return;
    const newVariants = editing.sizes.map((size) => makeVariant(name, hex, size));
    setEditing((p) => p ? { ...p, colors: [...p.colors, { name, hex }], variants: [...p.variants, ...newVariants] } : p);
    setNewColorName("");
  };

  const removeColor = (name: string) =>
    setEditing((p) => p ? { ...p, colors: p.colors.filter((c) => c.name !== name), variants: p.variants.filter((v) => v.color !== name) } : p);

  // ── Size helpers ─────────────────────────────────────────────────────────────
  const addSize = (raw: string) => {
    if (!editing) return;
    const size = raw.trim().toUpperCase();
    if (!size || editing.sizes.includes(size)) return;
    const newVariants = editing.colors.map((c) => makeVariant(c.name, c.hex, size));
    setEditing((p) => p ? { ...p, sizes: [...p.sizes, size], variants: [...p.variants, ...newVariants] } : p);
    setNewSize("");
  };

  const removeSize = (size: string) =>
    setEditing((p) => p ? { ...p, sizes: p.sizes.filter((s) => s !== size), variants: p.variants.filter((v) => v.size !== size) } : p);

  // ── Variant helpers ──────────────────────────────────────────────────────────
  const updVariant = (id: string, field: keyof ProductVariant, value: string | number) =>
    setEditing((p) => p ? { ...p, variants: p.variants.map((v) => v.id === id ? { ...v, [field]: value } : v) } : p);

  const deleteVariant = (id: string) =>
    setEditing((p) => p ? { ...p, variants: p.variants.filter((v) => v.id !== id) } : p);

  const generateMissing = () => {
    if (!editing) return;
    const existing = new Set(editing.variants.map((v) => `${v.color}::${v.size}`));
    const missing = editing.colors.flatMap((c) =>
      editing.sizes.filter((s) => !existing.has(`${c.name}::${s}`)).map((s) => makeVariant(c.name, c.hex, s))
    );
    setEditing((p) => p ? { ...p, variants: [...p.variants, ...missing] } : p);
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 className="font-display text-3xl font-semibold">Product Management</h2><p className="text-muted">Products, variants, pricing, images, materials and care instructions.</p></div>
        <Button onClick={() => openEdit(blankProduct(categories))}><Plus size={16} /> Create product</Button>
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
        { key: "actions", header: "Actions", render: (row) => <div className="flex gap-2"><a aria-label="View" href={`/product/${row.slug}`} className="p-2"><Eye size={16} /></a><button aria-label="Edit" className="p-2" onClick={() => openEdit(row)}><Edit size={16} /></button><button aria-label="Delete" className="p-2 text-red-700" onClick={() => deleteProduct(row)}><Trash2 size={16} /></button></div> },
      ]} />

      <Modal open={Boolean(editing)} title={editing?.name || "Create product"} onClose={() => setEditing(null)}>
        {editing ? (
          <form className="grid gap-5 overflow-y-auto pr-1" onSubmit={saveProduct}>

            {/* ── Basic info ─────────────────────────────────────────────── */}
            <Input label="Product name" value={editing.name} required onChange={(e) => upd("name", e.target.value)} />
            <Input label="Slug" value={editing.slug} placeholder="auto-generated if empty" onChange={(e) => upd("slug", e.target.value)} />
            <Input label="Description" value={editing.description} required onChange={(e) => upd("description", e.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Price (₦)" type="number" value={editing.price || ""} required onChange={(e) => upd("price", Number(e.target.value))} />
              <Input label="Sale price (₦)" type="number" value={editing.salePrice ?? ""} onChange={(e) => upd("salePrice", e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Category" value={editing.categoryId} onChange={(e) => upd("categoryId", e.target.value)} options={categories.map((c) => ({ label: c.name, value: c.id }))} />
              <Select label="Status" value={editing.status} onChange={(e) => upd("status", e.target.value as ProductStatus)} options={[{ label: "Published", value: "published" }, { label: "Draft", value: "draft" }]} />
            </div>
            <Select label="Collection" value={editing.collectionIds[0] ?? ""} onChange={(e) => upd("collectionIds", e.target.value ? [e.target.value] : [])} options={[{ label: "No collection", value: "" }, ...collections.map((c) => ({ label: c.name, value: c.id }))]} />

            {/* ── Images ─────────────────────────────────────────────────── */}
            <ImageUpload label="Main image" value={editing.images[0] ?? ""} uploadFn={(file) => uploadImage(`products/${editing.id}`, file)} onChange={(url) => upd("images", [url, ...editing.images.slice(1)])} />
            <ImageUpload label="Hover image" value={editing.hoverImage} uploadFn={(file) => uploadImage(`products/${editing.id}/hover`, file)} onChange={(url) => upd("hoverImage", url)} />

            {/* ── Details ────────────────────────────────────────────────── */}
            <Input label="Materials" value={editing.materials} onChange={(e) => upd("materials", e.target.value)} />
            <Input label="Care" value={editing.care} onChange={(e) => upd("care", e.target.value)} />
            <Input label="Details" value={editing.details.join(", ")} onChange={(e) => upd("details", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} hint="Separate with commas." />

            {/* ── Colors ─────────────────────────────────────────────────── */}
            <div className="grid gap-3 border border-line p-4">
              <p className="text-sm font-semibold text-ink">Colors</p>
              {editing.colors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {editing.colors.map((c) => (
                    <span key={c.name} className="flex items-center gap-1.5 border border-line bg-bone px-2.5 py-1 text-xs font-semibold">
                      <span className="h-3 w-3 rounded-full border border-line/50 shrink-0" style={{ background: c.hex }} />
                      {c.name}
                      <button type="button" onClick={() => removeColor(c.name)} className="ml-0.5 text-muted hover:text-red-700"><X size={11} /></button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input label="Color name" value={newColorName} onChange={(e) => setNewColorName(e.target.value)} placeholder="e.g. Black" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addColor(); } }} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted">Hex</label>
                  <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} className="h-10 w-12 cursor-pointer border border-line bg-white p-0.5" />
                </div>
                <Button type="button" className="self-end shrink-0" onClick={addColor}><Plus size={14} /> Add</Button>
              </div>
            </div>

            {/* ── Sizes ──────────────────────────────────────────────────── */}
            <div className="grid gap-3 border border-line p-4">
              <p className="text-sm font-semibold text-ink">Sizes</p>
              {editing.sizes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {editing.sizes.map((s) => (
                    <span key={s} className="flex items-center gap-1.5 border border-line bg-bone px-2.5 py-1 text-xs font-semibold">
                      {s}
                      <button type="button" onClick={() => removeSize(s)} className="ml-0.5 text-muted hover:text-red-700"><X size={11} /></button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SIZES.filter((s) => !editing.sizes.includes(s)).map((s) => (
                  <button key={s} type="button" onClick={() => addSize(s)} className="border border-dashed border-line px-2.5 py-1 text-xs text-muted hover:border-ink hover:text-ink transition-colors">
                    + {s}
                  </button>
                ))}
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input label="Custom size" value={newSize} onChange={(e) => setNewSize(e.target.value)} placeholder="e.g. 32 or One Size" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSize(newSize); } }} />
                </div>
                <Button type="button" className="self-end shrink-0" onClick={() => addSize(newSize)}><Plus size={14} /> Add</Button>
              </div>
            </div>

            {/* ── Variants ───────────────────────────────────────────────── */}
            <div className="grid gap-3 border border-line p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-ink">Variants <span className="font-normal text-muted">({editing.variants.length})</span></p>
                {editing.colors.length > 0 && editing.sizes.length > 0 && (
                  <button type="button" onClick={generateMissing} className="text-xs text-accent underline-offset-4 hover:underline">
                    Generate missing
                  </button>
                )}
              </div>

              {editing.variants.length === 0 && (
                <p className="text-xs text-muted">Add colors and sizes above — variants are created automatically.</p>
              )}

              {editing.variants.length > 0 && (
                <div className="grid gap-2">
                  <div className="hidden grid-cols-[160px_1fr_80px_32px] gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted sm:grid">
                    <span>Color / Size</span><span>SKU</span><span>Stock</span><span />
                  </div>
                  {editing.variants.map((v) => (
                    <div key={v.id} className="grid grid-cols-1 gap-2 border-b border-line pb-2 sm:grid-cols-[160px_1fr_80px_32px] sm:items-center">
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <span className="h-3 w-3 shrink-0 rounded-full border border-line/50" style={{ background: v.colorHex }} />
                        <span className="truncate">{v.color} / {v.size}</span>
                      </div>
                      <input
                        value={v.sku}
                        onChange={(e) => updVariant(v.id, "sku", e.target.value)}
                        placeholder="SKU"
                        className="border border-line bg-bone px-3 py-1.5 text-xs font-mono focus:border-ink focus:outline-none"
                      />
                      <input
                        type="number"
                        min={0}
                        value={v.inventory}
                        onChange={(e) => updVariant(v.id, "inventory", Number(e.target.value))}
                        className="border border-line bg-bone px-3 py-1.5 text-xs focus:border-ink focus:outline-none"
                      />
                      <button type="button" onClick={() => deleteVariant(v.id)} className="grid place-items-center text-muted hover:text-red-700">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Actions ────────────────────────────────────────────────── */}
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
