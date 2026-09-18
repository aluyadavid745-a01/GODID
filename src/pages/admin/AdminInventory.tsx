import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../../components/ui/DataTable";
import { Input } from "../../components/ui/Input";
import { adminApi } from "../../services/api";
import type { InventoryHistoryEntry, Product } from "../../types/domain";
import { useMeta } from "../../hooks/useMeta";
import { formatDate } from "../../utils/format";

interface InventoryRow { product: string; sku: string; variantId: string; variant: string; stock: number; threshold: number; }

export const AdminInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<InventoryHistoryEntry[]>([]);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  useMeta("Inventory Management | GODID", "Manage GODID product variant inventory.");
  const refresh = () => {
    adminApi.products().then(setProducts);
    adminApi.inventoryHistory().then(setHistory);
  };
  useEffect(() => { refresh(); }, []);
  const rows = useMemo<InventoryRow[]>(() => products.flatMap((product) => product.variants.map((variant) => ({ product: product.name, sku: variant.sku, variantId: variant.id, variant: `${variant.color} / ${variant.size}`, stock: variant.inventory, threshold: variant.lowStockThreshold }))), [products]);
  const filteredRows = rows.filter((row) => `${row.product} ${row.sku} ${row.variant}`.toLowerCase().includes(query.toLowerCase()));
  const saveInventory = async (row: InventoryRow, inventory: number, threshold = row.threshold) => {
    await adminApi.updateVariantInventory(row.variantId, inventory, threshold);
    setNotice(`${row.sku} inventory saved.`);
    refresh();
  };
  return (
    <div className="grid gap-6">
      <div><h2 className="font-display text-3xl font-semibold">Inventory</h2><p className="text-muted">Variant-level stock control with low-stock and out-of-stock visibility.</p></div>
      {notice ? <div className="border border-palm bg-white p-3 text-sm font-semibold text-palm">{notice}</div> : null}
      <section className="border border-line bg-white p-5"><Input label="Search inventory" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Product, SKU or variant" /></section>
      <DataTable<InventoryRow> rows={filteredRows} columns={[
        { key: "product", header: "Product", render: (row) => row.product },
        { key: "sku", header: "SKU", render: (row) => row.sku },
        { key: "variant", header: "Variant", render: (row) => row.variant },
        { key: "stock", header: "Stock", render: (row) => <Input aria-label={`Stock for ${row.sku}`} label="" type="number" defaultValue={row.stock} className="w-24 py-2" onBlur={(event) => saveInventory(row, Number(event.target.value))} /> },
        { key: "threshold", header: "Low alert", render: (row) => <Input aria-label={`Low stock threshold for ${row.sku}`} label="" type="number" defaultValue={row.threshold} className="w-24 py-2" onBlur={(event) => saveInventory(row, row.stock, Number(event.target.value))} /> },
        { key: "status", header: "Status", render: (row) => row.stock === 0 ? <span className="text-red-700">Out of stock</span> : row.stock <= row.threshold ? <span className="text-clay">Low stock</span> : <span className="text-palm">In stock</span> },
      ]} />
      <section>
        <h3 className="mb-4 font-display text-xl font-semibold">Inventory history</h3>
        <DataTable<InventoryHistoryEntry> rows={history.slice(0, 12)} empty="No inventory changes yet." columns={[
          { key: "sku", header: "SKU", render: (row) => row.sku },
          { key: "change", header: "Change", render: (row) => `${row.previousStock} -> ${row.nextStock}` },
          { key: "reason", header: "Reason", render: (row) => row.reason },
          { key: "date", header: "Date", render: (row) => formatDate(row.createdAt) },
        ]} />
      </section>
    </div>
  );
};
