import { Edit, Plus, Save, Trash2, X } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { adminApi } from "../../services/api";
import type { Category, Collection } from "../../types/domain";
import { useMeta } from "../../hooks/useMeta";

export const AdminCollections = () => {
  const [rows, setRows] = useState<Collection[]>([]);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [notice, setNotice] = useState("");
  useMeta("Collection Management | GODID", "Manage GODID fashion collections.");
  const refresh = () => adminApi.collections().then(setRows);
  useEffect(() => { refresh(); }, []);
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    await adminApi.saveCollection(editing);
    setEditing(null);
    setNotice("Collection saved and synced to the storefront.");
    refresh();
  };
  return <Management title="Collections" description="Create collections, upload images, add products and publish seasonal drops." rows={rows} columns={[
    { key: "image", header: "Image", render: (row: Collection) => <img src={row.image} alt={row.name} className="h-14 w-20 object-cover" /> },
    { key: "name", header: "Name", render: (row: Collection) => row.name },
    { key: "products", header: "Products", render: (row: Collection) => row.productIds.length },
    { key: "published", header: "Published", render: (row: Collection) => row.published ? "Yes" : "No" },
  ]} onCreate={() => setEditing({ id: `col-${Date.now()}`, name: "", slug: "", description: "", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&h=1000&q=82", published: true, productIds: [] })} onEdit={setEditing} onDelete={async (row) => { if (window.confirm(`Delete ${row.name}?`)) { await adminApi.deleteCollection(row.id); setNotice("Collection deleted."); refresh(); } }} notice={notice}>
    <Editor open={Boolean(editing)} title={editing?.name || "Create collection"} onClose={() => setEditing(null)} onSubmit={save}>
      {editing ? <SharedFields item={editing} onChange={setEditing} /> : null}
    </Editor>
  </Management>;
};

export const AdminCategories = () => {
  const [rows, setRows] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [notice, setNotice] = useState("");
  useMeta("Category Management | GODID", "Manage dynamic GODID product categories.");
  const refresh = () => adminApi.categories().then(setRows);
  useEffect(() => { refresh(); }, []);
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    await adminApi.saveCategory(editing);
    setEditing(null);
    setNotice("Category saved and synced to the storefront.");
    refresh();
  };
  return <Management title="Categories" description="Manage storefront categories such as T-Shirts, Hoodies, Pants, Jackets and Accessories." rows={rows} columns={[
    { key: "image", header: "Image", render: (row: Category) => <img src={row.image} alt={row.name} className="h-14 w-20 object-cover" /> },
    { key: "name", header: "Name", render: (row: Category) => row.name },
    { key: "slug", header: "Slug", render: (row: Category) => row.slug },
    { key: "published", header: "Published", render: (row: Category) => row.published ? "Yes" : "No" },
  ]} onCreate={() => setEditing({ id: `cat-${Date.now()}`, name: "", slug: "", description: "", image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1400&h=1000&q=82", published: true })} onEdit={setEditing} onDelete={async (row) => { if (window.confirm(`Delete ${row.name}?`)) { await adminApi.deleteCategory(row.id); setNotice("Category deleted."); refresh(); } }} notice={notice}>
    <Editor open={Boolean(editing)} title={editing?.name || "Create category"} onClose={() => setEditing(null)} onSubmit={save}>
      {editing ? <SharedFields item={editing} onChange={setEditing} /> : null}
    </Editor>
  </Management>;
};

const Management = <T extends { id: string; name: string; description: string }>({ title, description, rows, columns, children, onCreate, onEdit, onDelete, notice }: { title: string; description: string; rows: T[]; columns: Array<{ key: string; header: string; render: (row: T) => ReactNode }>; children: ReactNode; onCreate: () => void; onEdit: (row: T) => void; onDelete: (row: T) => void; notice: string }) => (
  <div className="grid gap-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-display text-3xl font-semibold">{title}</h2><p className="text-muted">{description}</p></div><Button onClick={onCreate}><Plus size={16} /> Create {title.slice(0, -1)}</Button></div>
    {notice ? <div className="border border-palm bg-white p-3 text-sm font-semibold text-palm">{notice}</div> : null}
    <DataTable<T> rows={rows} columns={[...columns, { key: "actions", header: "Actions", render: (row) => <div className="flex gap-2"><button className="p-2" aria-label={`Edit ${row.name}`} onClick={() => onEdit(row)}><Edit size={16} /></button><button className="p-2 text-red-700" aria-label={`Delete ${row.name}`} onClick={() => onDelete(row)}><Trash2 size={16} /></button></div> }]} />
    {children}
  </div>
);

const Editor = ({ open, title, children, onClose, onSubmit }: { open: boolean; title: string; children: ReactNode; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) => (
  <Modal open={open} title={title} onClose={onClose}>
    <form className="grid gap-4" onSubmit={onSubmit}>
      {children}
      <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:justify-between">
        <Button type="button" variant="secondary" onClick={onClose}><X size={16} /> Cancel</Button>
        <Button type="submit"><Save size={16} /> Save</Button>
      </div>
    </form>
  </Modal>
);

const SharedFields = <T extends Category | Collection>({ item, onChange }: { item: T; onChange: (item: T) => void }) => (
  <>
    <Input label="Name" value={item.name} required onChange={(event) => onChange({ ...item, name: event.target.value })} />
    <Input label="Slug" value={item.slug} placeholder="auto-generated if empty" onChange={(event) => onChange({ ...item, slug: event.target.value })} />
    <Input label="Description" value={item.description} required onChange={(event) => onChange({ ...item, description: event.target.value })} />
    <Input label="Image URL" value={item.image} required onChange={(event) => onChange({ ...item, image: event.target.value })} />
    <Select label="Published" value={item.published ? "true" : "false"} onChange={(event) => onChange({ ...item, published: event.target.value === "true" })} options={[{ label: "Published", value: "true" }, { label: "Hidden", value: "false" }]} />
  </>
);
