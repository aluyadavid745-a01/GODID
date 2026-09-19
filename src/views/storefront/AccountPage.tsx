'use client'
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { OrderStatus } from "../../components/storefront/OrderStatus";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { NIGERIAN_STATES } from "../../data/nigeria";
import { adminApi, catalogApi } from "../../services/api";
import { useAuth } from "../../state/AuthContext";
import type { Address, Order, Product } from "../../types/domain";
import { formatDate, formatNaira } from "../../utils/format";
import { useMeta } from "../../hooks/useMeta";

const profileKey = "godid-customer-profile";
const addressKey = "godid-customer-addresses";
const wishlistKey = "godid-wishlist";
const newAddress = (): Address => ({ id: `addr-${Date.now()}`, fullName: "", phone: "", state: "Lagos", city: "", street: "", apartment: "", instructions: "" });

interface AccountLayoutProps {
  children: React.ReactNode;
}

export const AccountLayout = ({ children }: AccountLayoutProps) => {
  const { user, logout } = useAuth();
  useMeta("Account | GODID", "Manage your GODID profile, orders, wishlist, and addresses.");
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-muted">Signed in as {user?.email}</p><h1 className="font-display text-5xl font-semibold">Account</h1></div>
        <Button variant="secondary" onClick={logout}>Logout</Button>
      </div>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <nav className="admin-scrollbar flex h-fit min-w-0 gap-2 overflow-x-auto border border-line bg-white p-2 lg:block lg:overflow-visible lg:p-4">
          {["profile", "orders", "wishlist", "addresses"].map((item) => <Link key={item} href={`/account/${item === "profile" ? "" : item}`} className="shrink-0 border border-line px-3 py-2 text-sm font-semibold capitalize lg:block lg:border-x-0 lg:border-t-0 lg:px-0 lg:py-3 lg:last:border-0">{item}</Link>)}
        </nav>
        {children}
      </div>
    </main>
  );
};

export const AccountDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(() => {
    if (typeof window === "undefined") return { name: "", email: "", phone: "" };
    const saved = localStorage.getItem(profileKey);
    return saved ? JSON.parse(saved) as { name: string; email: string; phone: string } : { name: user?.name ?? "", email: user?.email ?? "", phone: "" };
  });
  const [notice, setNotice] = useState("");
  const save = (event: FormEvent) => {
    event.preventDefault();
    localStorage.setItem(profileKey, JSON.stringify(profile));
    setNotice("Profile saved.");
  };
  return (
    <section className="grid gap-6">
      <form className="grid gap-4 border border-line bg-white p-5" onSubmit={save}>
        <h2 className="font-display text-2xl font-semibold">Profile</h2>
        {notice ? <p className="text-sm font-semibold text-palm">{notice}</p> : null}
        <Input label="Full name" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
        <Input label="Email" type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} />
        <Input label="Phone" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
        <Button className="w-fit">Save profile</Button>
      </form>
      <AccountOrders />
    </section>
  );
};

export const AccountOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    adminApi.orders().then((items) => setOrders(items.filter((order) => !user?.email || order.customerEmail.toLowerCase() === user.email.toLowerCase() || order.customerId === user.id)));
  }, [user]);
  return (
    <section className="grid gap-4">
      <h2 className="font-display text-2xl font-semibold">Orders</h2>
      {orders.length ? orders.map((order) => (
        <article key={order.id} className="border border-line bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h3 className="font-display text-xl font-semibold">{order.orderNumber}</h3><p className="text-sm text-muted">{formatDate(order.createdAt)} · {order.address.state}</p></div>
            <p className="font-semibold">{formatNaira(order.totals.total)}</p>
          </div>
          <div className="mt-5 grid gap-6 md:grid-cols-[1fr_280px]">
            <div className="grid gap-3">{order.items.map((item) => <div key={item.sku} className="flex gap-3"><img src={item.image} alt={item.productName} className="h-20 w-16 object-cover" /><div><p className="font-semibold">{item.productName}</p><p className="text-sm text-muted">{item.color} / {item.size} · Qty {item.quantity}</p></div></div>)}</div>
            <OrderStatus status={order.status} />
          </div>
        </article>
      )) : <div className="border border-line bg-white p-8 text-muted">No orders yet.</div>}
    </section>
  );
};

export const WishlistPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    const ids = JSON.parse(typeof window !== "undefined" ? (localStorage.getItem(wishlistKey) ?? "[]") : "[]") as string[];
    catalogApi.listProducts().then((items) => setProducts(items.filter((product) => ids.includes(product.id))));
  }, []);
  return <section><h2 className="mb-5 font-display text-2xl font-semibold">Wishlist</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.length ? products.map((product) => <Link className="border border-line bg-white p-3" key={product.id} href={`/product/${product.slug}`}><img src={product.images[0]} alt={product.name} className="aspect-[4/5] object-cover" /><p className="mt-3 font-semibold">{product.name}</p></Link>) : <div className="border border-line bg-white p-8 text-muted">Your wishlist is empty.</div>}</div></section>;
};

export const AddressesPage = () => {
  const [addresses, setAddresses] = useState<Address[]>(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem(addressKey) ?? "[]") as Address[];
  });
  const [form, setForm] = useState<Address>(() => newAddress());
  const save = (event: FormEvent) => {
    event.preventDefault();
    const next = [form, ...addresses.filter((address) => address.id !== form.id)];
    setAddresses(next);
    localStorage.setItem(addressKey, JSON.stringify(next));
    setForm(newAddress());
  };
  return (
    <section className="grid gap-6">
      <form className="grid gap-4 border border-line bg-white p-5 md:grid-cols-2" onSubmit={save}>
        <h2 className="font-display text-2xl font-semibold md:col-span-2">Saved addresses</h2>
        <Input label="Full name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
        <Input label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
        <Select label="State" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} options={NIGERIAN_STATES.map((state) => ({ label: state, value: state }))} />
        <Input label="City" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} required />
        <Input label="Street" value={form.street} onChange={(event) => setForm({ ...form, street: event.target.value })} required />
        <Input label="Apartment" value={form.apartment} onChange={(event) => setForm({ ...form, apartment: event.target.value })} />
        <Button className="w-fit md:col-span-2">Save address</Button>
      </form>
      <div className="grid gap-3">
        {addresses.map((address) => <article key={address.id} className="border border-line bg-white p-4"><p className="font-semibold">{address.fullName}</p><p className="mt-1 text-sm text-muted">{address.street}, {address.city}, {address.state}</p><button className="mt-3 text-sm font-semibold underline" onClick={() => setForm(address)}>Edit</button></article>)}
      </div>
    </section>
  );
};
