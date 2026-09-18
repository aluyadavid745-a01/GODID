import { useEffect, useState } from "react";
import { DataTable } from "../../components/ui/DataTable";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { adminApi } from "../../services/api";
import type { Order, OrderStatus, PaymentStatus } from "../../types/domain";
import { formatDate, formatNaira, titleCase } from "../../utils/format";
import { useMeta } from "../../hooks/useMeta";

export const AdminOrders = () => {
  const [rows, setRows] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [notice, setNotice] = useState("");
  useMeta("Order Management | GODID", "Manage GODID WhatsApp orders, statuses, payment confirmation and shipping.");
  const refresh = () => adminApi.orders().then(setRows);
  useEffect(() => { refresh(); }, []);

  const filteredRows = rows.filter((order) => {
    const haystack = `${order.orderNumber} ${order.customerName} ${order.customerEmail} ${order.customerPhone}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (!orderStatus || order.status === orderStatus) && (!paymentStatus || order.paymentStatus === paymentStatus);
  });

  const saveOrderStatus = async (orderId: string, status: OrderStatus) => {
    await adminApi.updateOrderStatus(orderId, status);
    setNotice("Order status updated.");
    refresh();
  };

  const savePaymentStatus = async (orderId: string, status: PaymentStatus) => {
    await adminApi.updatePaymentStatus(orderId, status);
    setNotice("Payment status updated.");
    refresh();
  };

  return (
    <div className="grid gap-6">
      <div><h2 className="font-display text-3xl font-semibold">Orders</h2><p className="text-muted">Search WhatsApp orders, confirm payment, update fulfilment and track customer handoff.</p></div>
      {notice ? <div className="border border-palm bg-white p-3 text-sm font-semibold text-palm">{notice}</div> : null}
      <div className="grid gap-4 border border-line bg-white p-5 md:grid-cols-3"><Input label="Search orders" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="#COL-10294 or customer" /><Select label="Order status" value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)} options={[{ label: "All", value: "" }, ..."Pending Confirmed Processing Shipped Out_for_delivery Delivered Cancelled Refunded".split(" ").map((v) => ({ label: titleCase(v), value: v.toLowerCase() }))]} /><Select label="Payment" value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)} options={[{ label: "All", value: "" }, { label: "Paid", value: "paid" }, { label: "Pending", value: "pending" }, { label: "Failed", value: "failed" }, { label: "Refunded", value: "refunded" }]} /></div>
      <DataTable<Order> rows={filteredRows} columns={[
        { key: "id", header: "Order ID", render: (row) => row.orderNumber },
        { key: "customer", header: "Customer", render: (row) => <div><p className="font-semibold">{row.customerName}</p><p className="text-xs text-muted">{row.customerEmail}</p></div> },
        { key: "shipping", header: "Shipping", render: (row) => `${row.address.city}, ${row.address.state}` },
        { key: "date", header: "Date", render: (row) => formatDate(row.createdAt) },
        { key: "amount", header: "Amount", render: (row) => formatNaira(row.totals.total) },
        { key: "payment", header: "Payment", render: (row) => <div className="grid gap-2"><Select label="" value={row.paymentStatus} onChange={(event) => savePaymentStatus(row.id, event.target.value as PaymentStatus)} className="py-2" options={["pending", "paid", "failed", "refunded"].map((value) => ({ label: titleCase(value), value }))} /><span className="text-xs font-semibold text-muted">{row.paymentProvider === "whatsapp" ? "WhatsApp completion" : titleCase(row.paymentProvider)}</span></div> },
        { key: "status", header: "Order Status", render: (row) => <Select label="" value={row.status} onChange={(event) => saveOrderStatus(row.id, event.target.value as OrderStatus)} className="py-2" options={["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded"].map((value) => ({ label: titleCase(value), value }))} /> },
      ]} />
    </div>
  );
};
