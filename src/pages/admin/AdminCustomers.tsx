import { useEffect, useState } from "react";
import { DataTable } from "../../components/ui/DataTable";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { adminApi } from "../../services/api";
import type { Customer, Order } from "../../types/domain";
import { formatDate, formatNaira, titleCase } from "../../utils/format";
import { useMeta } from "../../hooks/useMeta";

export const AdminCustomers = () => {
  const [rows, setRows] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  useMeta("Customer Management | GODID", "View GODID customers and their order history.");
  const refresh = () => {
    adminApi.customers().then(setRows);
    adminApi.orders().then(setOrders);
  };
  useEffect(() => { refresh(); }, []);
  const filteredRows = rows.filter((customer) => `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase().includes(query.toLowerCase()));
  const saveStatus = async (customer: Customer, status: Customer["status"]) => {
    await adminApi.updateCustomerStatus(customer.id, status);
    setNotice(`${customer.name} updated.`);
    refresh();
  };
  return (
    <div className="grid gap-6">
      <div><h2 className="font-display text-3xl font-semibold">Customers</h2><p className="text-muted">Profiles, order history, total spend and account status.</p></div>
      {notice ? <div className="border border-palm bg-white p-3 text-sm font-semibold text-palm">{notice}</div> : null}
      <section className="border border-line bg-white p-5"><Input label="Search customers" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, email or phone" /></section>
      <DataTable<Customer> rows={filteredRows} columns={[
        { key: "name", header: "Customer", render: (row) => <div><p className="font-semibold">{row.name}</p><p className="text-xs text-muted">{row.email}</p></div> },
        { key: "phone", header: "Phone", render: (row) => row.phone },
        { key: "orders", header: "Total Orders", render: (row) => orders.filter((order) => order.customerId === row.id).length },
        { key: "spent", header: "Total Spent", render: (row) => formatNaira(orders.filter((order) => order.customerId === row.id).reduce((sum, order) => sum + order.totals.total, 0)) },
        { key: "registered", header: "Registration Date", render: (row) => formatDate(row.registrationDate) },
        { key: "last", header: "Last Order", render: (row) => orders.find((order) => order.customerId === row.id)?.orderNumber ?? "None" },
        { key: "status", header: "Status", render: (row) => <Select label="" value={row.status} onChange={(event) => saveStatus(row, event.target.value as Customer["status"])} className="py-2" options={["active", "disabled"].map((value) => ({ label: titleCase(value), value }))} /> },
      ]} />
    </div>
  );
};
