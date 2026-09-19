'use client'
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { OrderStatus } from "../../components/storefront/OrderStatus";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { adminApi } from "../../services/api";
import type { Order } from "../../types/domain";
import { formatDate, formatNaira, titleCase } from "../../utils/format";
import { useMeta } from "../../hooks/useMeta";

export const OrderTrackingPage = () => {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(() => searchParams.get("order") ?? "");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | undefined>();
  const [message, setMessage] = useState("");
  useMeta("Track Order | GODID", "Track your GODID order status and delivery progress.");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found = await adminApi.orderByNumber(orderNumber, email);
    setOrder(found);
    setMessage(found ? "" : "No order matched that number and email.");
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Delivery visibility</p>
      <h1 className="mt-3 font-display text-5xl font-semibold">Track Order</h1>
      <form className="mt-8 grid gap-4 border border-line bg-white p-5 md:grid-cols-[1fr_1fr_auto]" onSubmit={submit}>
        <Input label="Order number" value={orderNumber} onChange={(event) => setOrderNumber(event.target.value.toUpperCase())} placeholder="#COL-10294" required />
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
        <Button className="self-end">Track</Button>
      </form>
      {message ? <p className="mt-5 border border-clay bg-white p-4 text-sm font-semibold text-clay">{message}</p> : null}
      {order ? (
        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="border border-line bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-3xl font-semibold">{order.orderNumber}</h2>
                <p className="text-sm text-muted">{formatDate(order.createdAt)} · {order.address.city}, {order.address.state}</p>
              </div>
              <p className="font-semibold">{formatNaira(order.totals.total)}</p>
            </div>
            <div className="mt-6 grid gap-3">
              {order.items.map((item) => (
                <div key={item.sku} className="flex gap-3 border-t border-line pt-3">
                  <img src={item.image} alt={item.productName} className="h-20 w-16 object-cover" />
                  <div>
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-sm text-muted">{item.color} / {item.size} · Qty {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <aside className="h-fit border border-line bg-porcelain p-5">
            <p className="mb-4 text-sm font-semibold">Payment: {titleCase(order.paymentStatus)}</p>
            <OrderStatus status={order.status} />
          </aside>
        </section>
      ) : null}
    </main>
  );
};
