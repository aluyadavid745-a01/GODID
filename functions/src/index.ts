import { getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";

if (!getApps().length) initializeApp();
const db = getFirestore();
const WHATSAPP_NUMBER = "2347055419856";
const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded"] as const;
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

type OrderStatus = typeof ORDER_STATUSES[number];
type PaymentStatus = typeof PAYMENT_STATUSES[number];

const cors = (response: Parameters<typeof onRequest>[0] extends never ? never : any) => {
  response.set("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN ?? "*");
  response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
};

const json = (response: any, status: number, body: unknown) => response.status(status).json(body);

const parseJson = (value: unknown) => {
  if (!value || typeof value !== "object") throw new Error("Request body is required.");
  return value as Record<string, any>;
};

const requireAdmin = async (request: any) => {
  const token = request.headers.authorization?.startsWith("Bearer ") ? request.headers.authorization.slice(7) : "";
  if (!token) throw new Error("Admin authentication required.");
  const decoded = await (await import("firebase-admin/auth")).getAuth().verifyIdToken(token);
  if (decoded.admin !== true) throw new Error("Admin access required.");
  return decoded;
};

export const api = onRequest(async (request, response) => {
  cors(response);
  if (request.method === "OPTIONS") return response.status(204).send("");

  try {
    if (request.path === "/health" && request.method === "GET") return json(response, 200, { ok: true, service: "godid-api" });

    if (request.path === "/orders" && request.method === "POST") {
      const body = parseJson(request.body);
      const customer = parseJson(body.customer);
      const address = parseJson(body.address);
      if (!customer.name || !customer.email || !customer.phone || !address.state || !address.city || !address.street || !Array.isArray(body.items) || !body.items.length) return json(response, 400, { error: "Customer, delivery address and items are required." });

      const orderRef = db.collection("orders").doc();
      const orderNumber = `#COL-${Math.floor(10000 + Math.random() * 89999)}`;
      const result = await db.runTransaction(async (transaction) => {
        const products = await Promise.all(body.items.map((item: any) => transaction.get(db.collection("products").doc(item.productId))));
        const orderItems: any[] = [];
        let subtotal = 0;
        for (let index = 0; index < body.items.length; index += 1) {
          const item = body.items[index];
          const product = products[index].data();
          const variant = product?.variants?.find((entry: any) => entry.id === item.variantId);
          if (!product || product.status !== "published" || !variant || variant.inventory < item.quantity) throw new Error("One or more items are unavailable.");
          const unitPrice = product.salePrice ?? product.price;
          subtotal += unitPrice * item.quantity;
          orderItems.push({ ...item, productName: product.name, image: product.images?.[0] ?? "", sku: variant.sku, color: variant.color, size: variant.size, unitPrice });
          transaction.update(products[index].ref, { variants: product.variants.map((entry: any) => entry.id === variant.id ? { ...entry, inventory: entry.inventory - item.quantity } : entry) });
        }
        const shipping = Math.max(0, Number(body.shipping ?? 0));
        const discount = Math.min(subtotal, Math.max(0, Number(body.discount ?? 0)));
        const order = { id: orderRef.id, orderNumber, customerId: body.customerId ?? null, customerName: customer.name, customerEmail: String(customer.email).toLowerCase(), customerPhone: customer.phone, items: orderItems, address, status: "pending" as OrderStatus, paymentStatus: "pending" as PaymentStatus, paymentProvider: "whatsapp", deliveryMethod: `${address.state} delivery`, totals: { subtotal, discount, shipping, tax: 0, total: Math.max(0, subtotal - discount + shipping) }, createdAt: new Date().toISOString(), whatsappNumber: WHATSAPP_NUMBER };
        transaction.set(orderRef, order);
        return order;
      });
      return json(response, 201, result);
    }

    if (request.path === "/orders/track" && request.method === "GET") {
      const orderNumber = String(request.query.orderNumber ?? "").trim().replace(/^#?/, "#").toUpperCase();
      const email = String(request.query.email ?? "").trim().toLowerCase();
      if (!orderNumber || !email) return json(response, 400, { error: "Order number and email are required." });
      const snapshot = await db.collection("orders").where("orderNumber", "==", orderNumber).where("customerEmail", "==", email).limit(1).get();
      return json(response, 200, snapshot.empty ? null : snapshot.docs[0].data());
    }

    if (request.path === "/newsletter" && request.method === "POST") {
      const body = parseJson(request.body);
      const email = String(body.email ?? "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(response, 400, { error: "A valid email address is required." });
      await db.collection("newsletterSubscribers").doc(email).set({ email, subscribedAt: new Date().toISOString(), source: "storefront" }, { merge: true });
      return json(response, 200, { ok: true });
    }

    if (request.path.startsWith("/admin/orders/") && request.method === "POST") {
      await requireAdmin(request);
      const orderId = request.path.split("/").pop();
      if (!orderId) return json(response, 400, { error: "Order ID is required." });
      const body = parseJson(request.body);
      const update: Record<string, unknown> = {};
      if (body.status && ORDER_STATUSES.includes(body.status)) update.status = body.status;
      if (body.paymentStatus && PAYMENT_STATUSES.includes(body.paymentStatus)) update.paymentStatus = body.paymentStatus;
      if (!Object.keys(update).length) return json(response, 400, { error: "A valid status is required." });
      update.updatedAt = new Date().toISOString();
      update.statusHistory = FieldValue.arrayUnion({ ...update, createdAt: new Date().toISOString() });
      await db.collection("orders").doc(orderId).update(update);
      return json(response, 200, { ok: true });
    }

    return json(response, 404, { error: "Route not found." });
  } catch (error) {
    console.error(error);
    return json(response, 400, { error: error instanceof Error ? error.message : "Request failed." });
  }
});
