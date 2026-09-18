import "dotenv/config";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { Pool } from "pg";

const port = Number(process.env.PORT ?? 8787);
const jwtSecret = process.env.JWT_SECRET ?? "";
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;
if (!process.env.DATABASE_URL || !jwtSecret || !adminEmail || !adminPassword) throw new Error("DATABASE_URL, JWT_SECRET, ADMIN_EMAIL and ADMIN_PASSWORD are required.");

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined });
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",").map((item) => item.trim()) ?? true }));
app.use(express.json({ limit: "1mb" }));

type AuthRequest = Request & { admin?: { email: string; role: "admin" } };
const query = (text: string, values: unknown[] = []) => pool.query(text, values);
const jsonError = (response: Response, status: number, message: string) => response.status(status).json({ error: message });

const requireAdmin = (request: AuthRequest, response: Response, next: NextFunction) => {
  try {
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) return jsonError(response, 401, "Admin authentication required.");
    request.admin = jwt.verify(token, jwtSecret) as { email: string; role: "admin" };
    if (request.admin.role !== "admin") return jsonError(response, 403, "Admin access required.");
    return next();
  } catch {
    return jsonError(response, 401, "Your admin session has expired.");
  }
};

const createOrderNumber = () => `#COL-${Math.floor(10000 + Math.random() * 89999)}`;

app.get("/health", (_request, response) => response.json({ ok: true, service: "godid-api", database: "postgresql" }));

app.post("/auth/login", async (request, response) => {
  const email = String(request.body.email ?? "").trim().toLowerCase();
  const password = String(request.body.password ?? "");
  if (email !== adminEmail || password !== adminPassword) return jsonError(response, 401, "Invalid admin email or password.");
  const user = { id: "admin-server", name: "Store Owner", email: adminEmail, role: "admin" as const };
  return response.json({ user, token: jwt.sign(user, jwtSecret, { expiresIn: "7d" }) });
});

app.post("/orders", async (request, response) => {
  const { customer, address, items } = request.body as { customer?: Record<string, string>; address?: Record<string, string>; items?: unknown[] };
  if (!customer?.name || !customer.email || !customer.phone || !address?.state || !address.city || !address.street || !items?.length) return jsonError(response, 400, "Customer, delivery address and items are required.");
  const orderNumber = createOrderNumber();
  const order = { id: crypto.randomUUID(), orderNumber, customerId: "customer-session", customerName: customer.name, customerEmail: customer.email.toLowerCase(), customerPhone: customer.phone, items, address, status: "pending", paymentStatus: "pending", paymentProvider: "whatsapp", deliveryMethod: `${address.state} delivery`, totals: request.body.totals ?? { subtotal: 0, discount: 0, shipping: Number(request.body.shipping ?? 0), tax: 0, total: 0 }, createdAt: new Date().toISOString() };
  const result = await query("INSERT INTO orders (order_number, customer_email, order_data, status, payment_status) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at", [orderNumber, customer.email.toLowerCase(), order, "pending", "pending"]);
  return response.status(201).json({ ...order, id: result.rows[0].id, createdAt: result.rows[0].created_at });
});

app.get("/orders/track", async (request, response) => {
  const orderNumber = String(request.query.orderNumber ?? "").trim().replace(/^#?/, "#").toUpperCase();
  const email = String(request.query.email ?? "").trim().toLowerCase();
  if (!orderNumber || !email) return jsonError(response, 400, "Order number and email are required.");
  const result = await query("SELECT id, order_data, status, payment_status, created_at FROM orders WHERE order_number = $1 AND customer_email = $2 LIMIT 1", [orderNumber, email]);
  if (!result.rowCount) return response.json(null);
  const row = result.rows[0];
  return response.json({ ...row.order_data, id: row.id, status: row.status, paymentStatus: row.payment_status, createdAt: row.created_at });
});

app.get("/admin/orders", requireAdmin, async (_request, response) => {
  const result = await query("SELECT id, order_data, status, payment_status, created_at FROM orders ORDER BY created_at DESC");
  return response.json(result.rows.map((row) => ({ ...row.order_data, id: row.id, status: row.status, paymentStatus: row.payment_status, createdAt: row.created_at })));
});

app.get("/admin/overview", requireAdmin, async (_request, response) => {
  const result = await query("SELECT id, order_data, status, payment_status, created_at FROM orders ORDER BY created_at DESC");
  const orders = result.rows.map((row) => ({ ...row.order_data, id: row.id, status: row.status, paymentStatus: row.payment_status, createdAt: row.created_at })) as Array<{ totals?: { total?: number }; status?: string; customerEmail?: string; [key: string]: unknown }>;
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totals?.total ?? 0), 0);
  const pendingOrders = orders.filter((order) => ["pending", "confirmed", "processing"].includes(order.status ?? "")).length;
  return response.json({ totalRevenue, todayRevenue: 0, averageOrderValue: orders.length ? Math.round(totalRevenue / orders.length) : 0, totalOrders: orders.length, pendingOrders, totalCustomers: new Set(orders.map((order) => order.customerEmail)).size, products: 0, lowStockProducts: 0, chart: [], recentOrders: orders, topProducts: [], lowStock: [] });
});

app.post("/admin/orders/:id", requireAdmin, async (request, response) => {
  const updates: string[] = [];
  const values: unknown[] = [];
  if (["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded"].includes(request.body.status)) { values.push(request.body.status); updates.push(`status = $${values.length}`); }
  if (["pending", "paid", "failed", "refunded"].includes(request.body.paymentStatus)) { values.push(request.body.paymentStatus); updates.push(`payment_status = $${values.length}`); }
  if (!updates.length) return jsonError(response, 400, "A valid status is required.");
  values.push(request.params.id);
  await query(`UPDATE orders SET ${updates.join(", ")} WHERE id = $${values.length}`, values);
  return response.json({ ok: true });
});

app.post("/newsletter", async (request, response) => {
  const email = String(request.body.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError(response, 400, "A valid email address is required.");
  await query("INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING", [email]);
  return response.json({ ok: true });
});

const start = async () => {
  await query(`CREATE TABLE IF NOT EXISTS orders (id text PRIMARY KEY, order_number text UNIQUE NOT NULL, customer_email text NOT NULL, order_data jsonb NOT NULL, status text NOT NULL, payment_status text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());`);
  await query(`CREATE TABLE IF NOT EXISTS newsletter_subscribers (email text PRIMARY KEY, subscribed_at timestamptz NOT NULL DEFAULT now());`);
  app.listen(port, () => console.log(`GODID API listening on http://localhost:${port}`));
};

start().catch((error) => { console.error(error); process.exit(1); });
