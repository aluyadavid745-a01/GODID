import { Plus, Save, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { adminApi } from "../../services/api";
import type { ContentPage, Discount, DiscountType, HomepageContent, ShippingZone, StoreSettings } from "../../types/domain";
import { formatDate, formatNaira, titleCase } from "../../utils/format";
import { useMeta } from "../../hooks/useMeta";

export const AdminDiscounts = () => {
  const [rows, setRows] = useState<Discount[]>([]);
  const [notice, setNotice] = useState("");
  const newDiscount = (): Discount => ({ id: `disc-${Date.now()}`, code: "", type: "percentage", value: 10, minimumOrderValue: 0, expiresAt: "2026-12-31", usageLimit: 100, used: 0, active: true });
  const [form, setForm] = useState<Discount>(() => newDiscount());
  useMeta("Discount Management | GODID", "Create percentage and fixed Naira discounts.");
  const refresh = () => adminApi.discounts().then(setRows);
  useEffect(() => { refresh(); }, []);
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await adminApi.saveDiscount(form);
    setNotice(`${form.code.toUpperCase()} saved.`);
    setForm(newDiscount());
    refresh();
  };
  return (
    <div className="grid gap-6">
      <div><h2 className="font-display text-3xl font-semibold">Discounts</h2><p className="text-muted">Coupon codes, expiry dates, minimum order values and usage limits.</p></div>
      {notice ? <div className="border border-palm bg-white p-3 text-sm font-semibold text-palm">{notice}</div> : null}
      <form className="grid gap-4 border border-line bg-white p-5 md:grid-cols-4" onSubmit={save}>
        <Input label="Code" value={form.code} required onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} placeholder="WELCOME10" />
        <Select label="Type" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as DiscountType })} options={[{ label: "Percentage", value: "percentage" }, { label: "Fixed amount", value: "fixed" }]} />
        <Input label="Value" type="number" value={form.value} onChange={(event) => setForm({ ...form, value: Number(event.target.value) })} />
        <Input label="Minimum order" type="number" value={form.minimumOrderValue} onChange={(event) => setForm({ ...form, minimumOrderValue: Number(event.target.value) })} />
        <Input label="Expires" type="date" value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} />
        <Input label="Usage limit" type="number" value={form.usageLimit} onChange={(event) => setForm({ ...form, usageLimit: Number(event.target.value) })} />
        <Select label="Active" value={form.active ? "true" : "false"} onChange={(event) => setForm({ ...form, active: event.target.value === "true" })} options={[{ label: "Active", value: "true" }, { label: "Paused", value: "false" }]} />
        <Button type="submit" className="self-end"><Plus size={16} /> Save discount</Button>
      </form>
      <DataTable<Discount> rows={rows} columns={[
        { key: "code", header: "Code", render: (row) => <button className="font-semibold underline-offset-4 hover:underline" onClick={() => setForm(row)}>{row.code}</button> },
        { key: "type", header: "Type", render: (row) => titleCase(row.type) },
        { key: "value", header: "Value", render: (row) => row.type === "fixed" ? formatNaira(row.value) : `${row.value}% OFF` },
        { key: "minimum", header: "Minimum", render: (row) => formatNaira(row.minimumOrderValue) },
        { key: "expires", header: "Expires", render: (row) => formatDate(row.expiresAt) },
        { key: "usage", header: "Usage", render: (row) => `${row.used}/${row.usageLimit}` },
        { key: "active", header: "Active", render: (row) => row.active ? "Yes" : "No" },
        { key: "actions", header: "Actions", render: (row) => <button aria-label={`Delete ${row.code}`} className="p-2 text-red-700" onClick={async () => { await adminApi.deleteDiscount(row.id); setNotice("Discount deleted."); refresh(); }}><Trash2 size={16} /></button> },
      ]} />
    </div>
  );
};

export const AdminContent = () => {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("about");
  const [notice, setNotice] = useState("");
  useMeta("Homepage Content | GODID", "Manage GODID homepage and storefront content.");
  useEffect(() => {
    adminApi.homepage().then(setContent);
    adminApi.contentPages().then(setPages);
  }, []);
  const selectedPage = pages.find((page) => page.slug === selectedSlug);
  const save = async () => {
    if (!content) return;
    await adminApi.updateHomepage(content);
    setNotice("Homepage content saved and synced to the storefront.");
  };
  const savePage = async () => {
    if (!selectedPage) return;
    await adminApi.updateContentPage(selectedPage);
    setNotice(`${selectedPage.title} saved.`);
  };
  const updatePage = (next: ContentPage) => setPages((current) => current.map((page) => page.slug === next.slug ? next : page));
  if (!content) return null;
  return (
    <div className="grid gap-6">
      <div><h2 className="font-display text-3xl font-semibold">Homepage Content</h2><p className="text-muted">Control hero banner, featured products, promotional banners, lookbook, brand story and newsletter copy without code changes.</p></div>
      {notice ? <div className="border border-palm bg-white p-3 text-sm font-semibold text-palm">{notice}</div> : null}
      <section className="grid gap-5 border border-line bg-white p-5">
        <Input label="Hero headline" value={content.heroHeadline} onChange={(event) => setContent({ ...content, heroHeadline: event.target.value })} />
        <Input label="Hero description" value={content.heroDescription} onChange={(event) => setContent({ ...content, heroDescription: event.target.value })} />
        <Input label="Hero image URL" value={content.heroImage} onChange={(event) => setContent({ ...content, heroImage: event.target.value })} />
        <Input label="Hero primary button" value={content.primaryCta} onChange={(event) => setContent({ ...content, primaryCta: event.target.value })} />
        <Input label="Hero secondary button" value={content.secondaryCta} onChange={(event) => setContent({ ...content, secondaryCta: event.target.value })} />
        <Input label="Brand story" value={content.brandStory} onChange={(event) => setContent({ ...content, brandStory: event.target.value })} />
        <Input label="Newsletter title" value={content.newsletterTitle} onChange={(event) => setContent({ ...content, newsletterTitle: event.target.value })} />
        <Input label="Newsletter text" value={content.newsletterText} onChange={(event) => setContent({ ...content, newsletterText: event.target.value })} />
        <Button className="w-fit" onClick={save}><Save size={16} /> Save content</Button>
      </section>
      <section className="grid gap-5 border border-line bg-white p-5">
        <div>
          <h3 className="font-display text-2xl font-semibold">Store pages</h3>
          <p className="mt-1 text-sm text-muted">Edit footer pages such as About, FAQ, Shipping, Returns, Privacy, and Terms.</p>
        </div>
        <Select label="Page" value={selectedSlug} onChange={(event) => setSelectedSlug(event.target.value)} options={pages.map((page) => ({ label: page.title, value: page.slug }))} />
        {selectedPage ? (
          <>
            <Input label="Title" value={selectedPage.title} onChange={(event) => updatePage({ ...selectedPage, title: event.target.value })} />
            <Input label="Intro" value={selectedPage.intro} onChange={(event) => updatePage({ ...selectedPage, intro: event.target.value })} />
            <Input label="Section one heading" value={selectedPage.sections[0]?.heading ?? ""} onChange={(event) => updatePage({ ...selectedPage, sections: [{ ...(selectedPage.sections[0] ?? { body: "" }), heading: event.target.value }, ...selectedPage.sections.slice(1)] })} />
            <Input label="Section one body" value={selectedPage.sections[0]?.body ?? ""} onChange={(event) => updatePage({ ...selectedPage, sections: [{ ...(selectedPage.sections[0] ?? { heading: "" }), body: event.target.value }, ...selectedPage.sections.slice(1)] })} />
            <Input label="Section two heading" value={selectedPage.sections[1]?.heading ?? ""} onChange={(event) => updatePage({ ...selectedPage, sections: [selectedPage.sections[0] ?? { heading: "", body: "" }, { ...(selectedPage.sections[1] ?? { body: "" }), heading: event.target.value }, ...selectedPage.sections.slice(2)] })} />
            <Input label="Section two body" value={selectedPage.sections[1]?.body ?? ""} onChange={(event) => updatePage({ ...selectedPage, sections: [selectedPage.sections[0] ?? { heading: "", body: "" }, { ...(selectedPage.sections[1] ?? { heading: "" }), body: event.target.value }, ...selectedPage.sections.slice(2)] })} />
            <Button className="w-fit" onClick={savePage}><Save size={16} /> Save page</Button>
          </>
        ) : null}
      </section>
    </div>
  );
};

export const AdminShipping = () => {
  const [rows, setRows] = useState<ShippingZone[]>([]);
  const [notice, setNotice] = useState("");
  useMeta("Shipping Zones | GODID", "Configure Nigerian shipping zones and prices.");
  const refresh = () => adminApi.shippingZones().then(setRows);
  useEffect(() => { refresh(); }, []);
  const saveZone = async (zone: ShippingZone) => {
    await adminApi.saveShippingZone(zone);
    setNotice(`${zone.name} shipping saved.`);
    refresh();
  };
  return (
    <div className="grid gap-6">
      <div><h2 className="font-display text-3xl font-semibold">Shipping Zones</h2><p className="text-muted">Configure Lagos, South West, South East, South South, North Central, North East, North West and other states.</p></div>
      {notice ? <div className="border border-palm bg-white p-3 text-sm font-semibold text-palm">{notice}</div> : null}
      <DataTable<ShippingZone> rows={rows} columns={[
        { key: "name", header: "Zone", render: (row) => row.name },
        { key: "states", header: "States", render: (row) => row.states.length ? row.states.join(", ") : "Fallback configurable states" },
        { key: "price", header: "Price", render: (row) => <Input label="" type="number" defaultValue={row.price} onBlur={(event) => saveZone({ ...row, price: Number(event.target.value) })} /> },
        { key: "active", header: "Active", render: (row) => <Select label="" value={row.active ? "true" : "false"} onChange={(event) => saveZone({ ...row, active: event.target.value === "true" })} options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} /> },
      ]} />
    </div>
  );
};

export const AdminSettings = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [notice, setNotice] = useState("");
  useMeta("Admin Settings | GODID", "Manage GODID store settings, WhatsApp order completion, email and security.");
  useEffect(() => { adminApi.settings().then(setSettings); }, []);
  const save = async () => {
    if (!settings) return;
    await adminApi.updateSettings(settings);
    setNotice("Settings saved.");
  };
  const reset = async () => {
    if (!window.confirm("Reset products, orders, content, shipping and settings to demo data?")) return;
    await adminApi.resetDemoStore();
    adminApi.settings().then(setSettings);
    setNotice("Demo data restored.");
  };
  if (!settings) return null;
  return (
    <div className="grid gap-6">
      <div><h2 className="font-display text-3xl font-semibold">Settings</h2><p className="text-muted">Store information, currency, WhatsApp order completion, email settings, social media, admin users and security.</p></div>
      {notice ? <div className="border border-palm bg-white p-3 text-sm font-semibold text-palm">{notice}</div> : null}
      <section className="grid gap-4 border border-line bg-white p-5 md:grid-cols-2">
        <Input label="Store name" value={settings.storeName} onChange={(event) => setSettings({ ...settings, storeName: event.target.value })} />
        <Input label="Currency" defaultValue="NGN / ₦ Nigerian Naira" disabled />
        <Select label="Order completion channel" value={settings.paymentProviders[0] ?? "whatsapp"} onChange={() => setSettings({ ...settings, paymentProviders: ["whatsapp"] })} options={[{ label: "WhatsApp", value: "whatsapp" }]} />
        <Input label="Order email sender" value={settings.emailFrom} onChange={(event) => setSettings({ ...settings, emailFrom: event.target.value })} />
        <Input label="Instagram" value={settings.social.instagram} onChange={(event) => setSettings({ ...settings, social: { ...settings.social, instagram: event.target.value } })} />
        <Input label="TikTok" value={settings.social.tiktok} onChange={(event) => setSettings({ ...settings, social: { ...settings.social, tiktok: event.target.value } })} />
        <Input label="Security" defaultValue="Backend role validation, secure sessions, manual WhatsApp payment confirmation" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="w-fit" onClick={save}><Save size={16} /> Save settings</Button>
          <Button type="button" variant="secondary" className="w-fit" onClick={reset}>Reset demo data</Button>
        </div>
      </section>
    </div>
  );
};
