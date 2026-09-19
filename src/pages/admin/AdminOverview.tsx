'use client'
import { AlertTriangle, Banknote, Bell, Package, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Chart } from "../../components/ui/Chart";
import { DataTable } from "../../components/ui/DataTable";
import { StatCard } from "../../components/ui/StatCard";
import { adminApi } from "../../services/api";
import type { NotificationRecord, Order, Product } from "../../types/domain";
import { formatDate, formatNaira, titleCase } from "../../utils/format";
import { useMeta } from "../../hooks/useMeta";

type Overview = Awaited<ReturnType<typeof adminApi.overview>>;

export const AdminOverview = () => {
  const [data, setData] = useState<Overview | null>(null);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  useMeta("Admin Overview | GODID", "GODID sales and operations dashboard.");
  useEffect(() => {
    adminApi.overview().then(setData);
    adminApi.notifications().then(setNotifications);
  }, []);
  if (!data) return <div className="min-h-screen" />;
  const paidOrders = data.recentOrders.filter((order) => order.paymentStatus === "paid");
  const conversionProxy = data.totalCustomers ? Math.round((data.totalOrders / data.totalCustomers) * 100) : 0;
  const unitsSold = paidOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard tone="dark" label="Total Revenue" value={formatNaira(data.totalRevenue)} icon={<Banknote />} />
        <StatCard label="Today's Sales" value={formatNaira(data.todayRevenue)} icon={<Banknote />} />
        <StatCard label="Average Order Value" value={formatNaira(data.averageOrderValue)} icon={<ShoppingBag />} />
        <StatCard label="Low Stock Products" value={data.lowStockProducts} icon={<AlertTriangle />} />
        <StatCard label="Total Orders" value={data.totalOrders} icon={<ShoppingBag />} />
        <StatCard label="Pending Orders" value={data.pendingOrders} icon={<AlertTriangle />} />
        <StatCard label="Total Customers" value={data.totalCustomers} icon={<Users />} />
        <StatCard label="Products" value={data.products} icon={<Package />} />
        <StatCard label="Units Sold" value={unitsSold} icon={<TrendingUp />} />
        <StatCard label="Order / Customer Rate" value={`${conversionProxy}%`} icon={<TrendingUp />} />
      </section>
      <Chart data={data.chart} />
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div>
          <h2 className="mb-4 font-display text-xl font-semibold">Recent Orders</h2>
          <DataTable<Order> rows={data.recentOrders} columns={[
            { key: "id", header: "Order ID", render: (row) => row.orderNumber },
            { key: "customer", header: "Customer", render: (row) => row.customerName },
            { key: "date", header: "Date", render: (row) => formatDate(row.createdAt) },
            { key: "items", header: "Items", render: (row) => row.items.length },
            { key: "amount", header: "Amount", render: (row) => formatNaira(row.totals.total) },
            { key: "payment", header: "Payment", render: (row) => titleCase(row.paymentStatus) },
            { key: "status", header: "Status", render: (row) => titleCase(row.status) },
          ]} />
        </div>
        <div>
          <h2 className="mb-4 font-display text-xl font-semibold">Top Products</h2>
          <div className="grid gap-3">{data.topProducts.map((product: Product) => <div key={product.id} className="flex gap-3 border border-line bg-white p-3"><img src={product.images[0]} alt={product.name} className="h-16 w-12 object-cover" /><div><p className="font-semibold">{product.name}</p><p className="text-sm text-muted">{formatNaira(product.salePrice ?? product.price)}</p></div></div>)}</div>
        </div>
      </section>
      <section>
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold"><Bell size={20} /> Notifications</h2>
        <DataTable<NotificationRecord> rows={notifications.slice(0, 8)} empty="No notification events yet." columns={[
          { key: "type", header: "Type", render: (row) => titleCase(row.type) },
          { key: "recipient", header: "Recipient", render: (row) => row.recipient },
          { key: "subject", header: "Subject", render: (row) => row.subject },
          { key: "date", header: "Date", render: (row) => formatDate(row.createdAt) },
        ]} />
      </section>
    </div>
  );
};
