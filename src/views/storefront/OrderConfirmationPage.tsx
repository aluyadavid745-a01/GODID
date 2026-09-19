'use client'
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "../../components/ui/Button";
import type { Order } from "../../types/domain";
import { formatNaira, titleCase } from "../../utils/format";
import { useMeta } from "../../hooks/useMeta";
import { buildOrderWhatsAppUrl, WHATSAPP_DISPLAY_NUMBER } from "../../utils/whatsapp";
import { adminApi } from "../../services/api";

const LAST_ORDER_KEY = "godid-last-order";

const readLastOrder = () => {
  try {
    if (typeof window === "undefined") return undefined;
    const saved = localStorage.getItem(LAST_ORDER_KEY);
    return saved ? JSON.parse(saved) as { orderNumber: string; email: string } : undefined;
  } catch {
    return undefined;
  }
};

export const OrderConfirmationPage = () => {
  const params = useParams();
  const orderNumber = params?.orderNumber as string | undefined;
  const lastOrder = readLastOrder();
  const lastOrderNumber = lastOrder?.orderNumber;
  const lastOrderEmail = lastOrder?.email;
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [loading, setLoading] = useState(() => Boolean(orderNumber && lastOrder?.email));
  useMeta("Order Confirmed | GODID", "Your GODID order confirmation.");

  useEffect(() => {
    if (order) return;
    const number = orderNumber ? `#${orderNumber.replace(/^#+/, "")}` : lastOrderNumber;
    if (number && lastOrderEmail) adminApi.orderByNumber(number, lastOrderEmail).then(setOrder).finally(() => setLoading(false));
  }, [lastOrderEmail, lastOrderNumber, order, orderNumber]);

  useEffect(() => {
    if (order) localStorage.setItem(LAST_ORDER_KEY, JSON.stringify({ orderNumber: order.orderNumber, email: order.customerEmail }));
  }, [order]);
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center lg:px-8">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-palm text-white shadow-soft">
        <MessageCircle size={26} />
      </div>
      <h1 className="mt-5 font-display text-5xl font-semibold">Order Saved</h1>
      <p className="mt-4 text-lg text-muted">Your order is ready. Complete payment and delivery with GODID on WhatsApp at {WHATSAPP_DISPLAY_NUMBER}; the message includes your order details and product image URLs.</p>
      <div className="mt-10 rounded-lg border border-line bg-white p-6 text-left shadow-soft">
        <div className="grid gap-4 sm:grid-cols-2">
          <Summary label="Order Number" value={loading ? "Loading..." : order?.orderNumber ?? "Order unavailable"} />
          <Summary label="Total" value={order ? formatNaira(order.totals.total) : "—"} />
          <Summary label="Payment" value={order ? titleCase(order.paymentStatus) : "Pending"} />
          <Summary label="Delivery" value={order?.address.state ?? "Lagos"} />
        </div>
      </div>
      <div className="mt-8 flex justify-center gap-3">
        {order ? <Button href={buildOrderWhatsAppUrl(order)}><MessageCircle size={18} /> Complete on WhatsApp</Button> : null}
        {order ? <Button to={`/track-order?order=${encodeURIComponent(order.orderNumber)}`} variant="secondary">Track order</Button> : null}
        <Button to="/account/orders">View orders</Button>
        <Button to="/shop" variant="secondary">Continue shopping</Button>
      </div>
    </main>
  );
};

const Summary = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-line p-4">
    <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{label}</p>
    <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
  </div>
);
