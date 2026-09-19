import { customers, discounts, homepageContent, orders, shippingZones, storeSettings } from "../data/mockData";
import { NIGERIAN_STATES } from "../data/nigeria";
import { firestoreOrdersEnabled, findFirestoreOrder, listFirestoreOrders, saveFirestoreOrder, updateFirestoreOrder } from "./firestoreOrders";
import { getSharedStore, updateSharedStore, sharedStoreEnabled, type SharedStoreState } from "./firestoreStore";
import type { Address, CartItem, Category, Collection, ContentPage, Customer, Discount, HomepageContent, InventoryHistoryEntry, MoneySummary, NotificationRecord, Order, OrderStatus, PaymentStatus, Product, ProductStatus, ShippingZone, StoreSettings } from "../types/domain";

const delay = <T,>(value: T, ms = 120) => new Promise<T>((resolve) => window.setTimeout(() => resolve(value), ms));
const STORAGE_KEY = "godid-admin-store-v1";
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim().replace(/\/$/, "");
export const apiConfigured = Boolean(API_BASE_URL);
export const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const requestApi = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  if (!API_BASE_URL) throw new Error("The GODID API is not configured. Set NEXT_PUBLIC_API_BASE_URL before launch.");
  const token = typeof window !== "undefined" ? window.localStorage.getItem("godid-api-token") : null;
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init?.headers ?? {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? "The GODID API request failed.");
  return body as T;
};

interface StoreState {
  products: Product[];
  categories: Category[];
  collections: Collection[];
  customers: Customer[];
  orders: Order[];
  discounts: Discount[];
  shippingZones: ShippingZone[];
  homepageContent: HomepageContent;
  contentPages: ContentPage[];
  notifications: NotificationRecord[];
  inventoryHistory: InventoryHistoryEntry[];
  storeSettings: StoreSettings;
}

const contentPages: ContentPage[] = [
  { slug: "about", title: "About GODID", intro: "GODID means God in Every Design: original clothing shaped by purpose, Nigerian rhythm, careful fabrics, and controlled production.", sections: [{ heading: "Studio Point Of View", body: "Every piece starts with fit, movement, and intent before it becomes a garment. We focus on premium essentials, statement layers, and refined everyday silhouettes." }, { heading: "Production", body: "Drops are produced in small batches so the team can keep tighter control over material quality, finishing, and inventory." }] },
  { slug: "contact", title: "Contact", intro: "Speak with GODID for orders, sizing, delivery, wholesale, or studio enquiries.", sections: [{ heading: "Customer Care", body: "Complete orders on WhatsApp through +234 705 541 9856 with your order number and the email used at checkout." }, { heading: "Response Window", body: "Support replies are handled Monday to Saturday. Delivery updates are sent as soon as the order status changes." }] },
  { slug: "faq", title: "FAQ", intro: "Answers to common questions about sizing, orders, payments, and care.", sections: [{ heading: "How Do I Choose A Size?", body: "Each product page includes available sizes and variant options. If you are between sizes, choose the fit that matches how you like structured garments to sit." }, { heading: "How Do I Complete Payment?", body: "The website records your order for the admin team, then sends you to WhatsApp with your order details and product image URLs so payment and delivery can be confirmed with GODID directly." }, { heading: "Can I Change My Order?", body: "Contact support quickly with your order number. Changes are easiest before an order moves into processing or shipped status." }] },
  { slug: "shipping", title: "Shipping", intro: "GODID delivers nationwide across Nigeria using delivery zones for each state.", sections: [{ heading: "Delivery Pricing", body: "Shipping is calculated at checkout from the delivery zone for your state. Nationwide coverage includes Lagos, South West, FCT, South South, and an other-state zone." }, { heading: "Order Tracking", body: "Your confirmation page shows the order number and the admin team can update status from confirmed through delivered." }] },
  { slug: "returns", title: "Returns", intro: "Returns are reviewed against garment condition, order status, and delivery timing.", sections: [{ heading: "Eligibility", body: "Items should be unworn, unwashed, and returned with original packaging. Sale or limited-run items may have tighter return rules." }, { heading: "How To Start", body: "Contact support with your order number, item name, size, reason, and clear photos where relevant." }] },
  { slug: "privacy-policy", title: "Privacy Policy", intro: "GODID only asks for the information needed to run customer accounts, carts, checkout, delivery, and order support.", sections: [{ heading: "Customer Data", body: "Checkout collects name, email, phone number, and delivery address so orders can be processed and shipped." }, { heading: "Payments", body: "Payments are completed directly with GODID on WhatsApp. The website stores order references and payment status, not card information." }] },
  { slug: "terms", title: "Terms", intro: "These terms explain how orders, product availability, pricing, and customer accounts work on GODID.", sections: [{ heading: "Product Availability", body: "Products are sold by variant and inventory can change as orders are placed or stock is adjusted by the admin team." }, { heading: "Pricing", body: "Prices are shown in Nigerian Naira. Discounts, shipping, and totals are calculated during cart and checkout flows." }] },
];

const initialState: StoreState = {
  products: [],
  categories: [],
  collections: [],
  customers,
  orders,
  discounts,
  shippingZones,
  homepageContent,
  contentPages,
  notifications: [],
  inventoryHistory: [],
  storeSettings,
};

// Subset of initialState compatible with SharedStoreState (for Firestore fallback)
const sharedInitial: SharedStoreState = {
  products: [],
  categories: [],
  collections: [],
  discounts,
  shippingZones,
  homepageContent,
  contentPages,
  inventoryHistory: [],
  storeSettings,
};

// Firestore-aware read
const fsGet = (): Promise<StoreState> => {
  if (!sharedStoreEnabled) return Promise.resolve(loadStore());
  const local = loadStore();
  return getSharedStore(sharedInitial).then((shared) => ({ ...local, ...shared }));
};

// Firestore-aware write
const fsUpdate = <T>(updater: (state: StoreState) => T): Promise<T> => {
  if (!sharedStoreEnabled) return Promise.resolve(updateStore(updater));
  return updateSharedStore(sharedInitial, (shared) => updater(shared as unknown as StoreState));
};

const clone = <T,>(value: T): T => {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
};

const loadStore = (): StoreState => {
  if (typeof window === "undefined") return clone(initialState);
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return clone(initialState);
  try {
    const state = { ...clone(initialState), ...(JSON.parse(saved) as Partial<StoreState>) };
    state.storeSettings.paymentProviders = ["whatsapp"];
    state.orders = state.orders.map((order) => ({ ...order, paymentProvider: "whatsapp" }));
    return state;
  } catch {
    return clone(initialState);
  }
};

const saveStore = (state: StoreState) => {
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return clone(state);
};

const updateStore = <T,>(updater: (state: StoreState) => T): T => {
  const state = loadStore();
  const result = updater(state);
  saveStore(state);
  return clone(result);
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const addNotification = (state: StoreState, notification: Omit<NotificationRecord, "id" | "createdAt" | "read">) => {
  state.notifications.unshift({ id: `note-${Date.now()}-${state.notifications.length}`, createdAt: new Date().toISOString(), read: false, ...notification });
};

export interface ProductFilters {
  search?: string;
  category?: string;
  collection?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "popular" | "featured";
}

export const catalogApi = {
  listProducts: async (filters: ProductFilters = {}) => {
    const store = await fsGet();
    let list = store.products.filter((product) => product.status === "published");
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((product) => `${product.name} ${product.description}`.toLowerCase().includes(q));
    }
    if (filters.category) list = list.filter((product) => product.categoryId === filters.category);
    if (filters.collection) list = list.filter((product) => product.collectionIds.includes(filters.collection!));
    if (filters.size) list = list.filter((product) => product.sizes.includes(filters.size!));
    if (filters.color) list = list.filter((product) => product.colors.some((color) => color.name === filters.color));
    if (filters.minPrice) list = list.filter((product) => (product.salePrice ?? product.price) >= filters.minPrice!);
    if (filters.maxPrice) list = list.filter((product) => (product.salePrice ?? product.price) <= filters.maxPrice!);
    return [...list].sort((a, b) => {
      if (filters.sort === "price-asc") return (a.salePrice ?? a.price) - (b.salePrice ?? b.price);
      if (filters.sort === "price-desc") return (b.salePrice ?? b.price) - (a.salePrice ?? a.price);
      if (filters.sort === "popular") return Number(b.popular) - Number(a.popular);
      if (filters.sort === "featured") return Number(b.featured) - Number(a.featured);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },
  getProductBySlug: async (slug: string) => (await fsGet()).products.find((p) => p.slug === slug),
  getProductById: async (id: string) => (await fsGet()).products.find((p) => p.id === id),
  listCategories: async () => (await fsGet()).categories.filter((c) => c.published),
  listCollections: async () => (await fsGet()).collections.filter((c) => c.published),
  getCollectionBySlug: async (slug: string) => (await fsGet()).collections.find((c) => c.slug === slug),
  getHomepage: async () => (await fsGet()).homepageContent,
  listContentPages: async () => (await fsGet()).contentPages,
  getContentPage: async (slug: string) => (await fsGet()).contentPages.find((p) => p.slug === slug),
};

export const commerceApi = {
  getShippingZones: async () => (await fsGet()).shippingZones,
  calculateShipping: async (state: string) => {
    const zones = (await fsGet()).shippingZones;
    const zone = zones.find((item) => item.active && item.states.includes(state)) ?? zones.find((item) => item.id === "ship-other")!;
    return zone.price;
  },
  applyDiscount: async (code: string, subtotal: number) => {
    const discount = (await fsGet()).discounts.find((item) => item.code.toUpperCase() === code.toUpperCase() && item.active);
    if (!discount || new Date(discount.expiresAt) < new Date() || subtotal < discount.minimumOrderValue || discount.used >= discount.usageLimit) {
      return undefined as Discount | undefined;
    }
    return discount;
  },
  calculateTotals: async (items: CartItem[], discountCode?: string, state?: string): Promise<MoneySummary> => {
    const store = await fsGet();
    const subtotal = items.reduce((sum, item) => {
      const product = store.products.find((entry) => entry.id === item.productId);
      return sum + (product ? (product.salePrice ?? product.price) * item.quantity : 0);
    }, 0);
    const discount = discountCode ? await commerceApi.applyDiscount(discountCode, subtotal) : undefined;
    const discountValue = discount ? (discount.type === "percentage" ? Math.round(subtotal * (discount.value / 100)) : discount.value) : 0;
    const shipping = state ? await commerceApi.calculateShipping(state) : 0;
    return { subtotal, discount: discountValue, shipping, tax: 0, total: Math.max(0, subtotal - discountValue + shipping) };
  },
  createOrder: async (payload: { customer: { name: string; email: string; phone: string }; address: Address; items: CartItem[]; discountCode?: string }) => {
    const totals = await commerceApi.calculateTotals(payload.items, payload.discountCode, payload.address.state);
    const store = await fsGet();

    for (const item of payload.items) {
      const product = store.products.find((entry) => entry.id === item.productId);
      const variant = product?.variants.find((entry) => entry.id === item.variantId);
      if (!product || !variant || variant.inventory < item.quantity) throw new Error(`${product?.name ?? "Selected item"} is no longer available in that quantity.`);
    }

    const orderItems = payload.items.map((item) => {
      const product = store.products.find((entry) => entry.id === item.productId)!;
      const variant = product.variants.find((entry) => entry.id === item.variantId)!;
      return { ...item, productName: product.name, image: product.images[0], sku: variant.sku, color: variant.color, size: variant.size, unitPrice: product.salePrice ?? product.price };
    });

    const orderDraft: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `#COL-${Math.floor(10000 + Math.random() * 89999)}`,
      customerId: "cust-session",
      customerName: payload.customer.name,
      customerEmail: payload.customer.email,
      customerPhone: payload.customer.phone,
      items: orderItems,
      address: payload.address,
      status: "pending",
      paymentStatus: "pending",
      paymentProvider: "whatsapp",
      deliveryMethod: `${payload.address.state} delivery`,
      totals,
      createdAt: new Date().toISOString(),
    };

    if (firestoreOrdersEnabled) {
      const order = await saveFirestoreOrder(orderDraft);
      await fsUpdate((state) => {
        payload.items.forEach((item) => {
          const product = state.products.find((entry) => entry.id === item.productId);
          const variant = product?.variants.find((entry) => entry.id === item.variantId);
          if (product && variant) {
            const previousStock = variant.inventory;
            variant.inventory = Math.max(0, variant.inventory - item.quantity);
            state.inventoryHistory.unshift({ id: `hist-${Date.now()}-${variant.id}`, productId: product.id, variantId: variant.id, sku: variant.sku, previousStock, nextStock: variant.inventory, reason: `Order ${order.orderNumber}`, createdAt: new Date().toISOString() });
          }
        });
        if (payload.discountCode) {
          const discount = state.discounts.find((d) => d.code.toUpperCase() === payload.discountCode!.toUpperCase());
          if (discount) discount.used += 1;
        }
        return order;
      });
      return order;
    }

    if (!demoMode) throw new Error("Checkout is not configured. Set NEXT_PUBLIC_ORDER_BACKEND=firestore and configure Firebase, or set NEXT_PUBLIC_DEMO_MODE=true for local testing.");

    const order = orderDraft;
    updateStore((state) => {
      state.orders.unshift(order);
      payload.items.forEach((item) => {
        const product = state.products.find((entry) => entry.id === item.productId);
        const variant = product?.variants.find((entry) => entry.id === item.variantId);
        if (product && variant) {
          const previousStock = variant.inventory;
          variant.inventory = Math.max(0, variant.inventory - item.quantity);
          state.inventoryHistory.unshift({ id: `hist-${Date.now()}-${variant.id}`, productId: product.id, variantId: variant.id, sku: variant.sku, previousStock, nextStock: variant.inventory, reason: `Order ${order.orderNumber}`, createdAt: new Date().toISOString() });
        }
      });
      if (payload.discountCode) {
        const discount = state.discounts.find((item) => item.code.toUpperCase() === payload.discountCode!.toUpperCase());
        if (discount) discount.used += 1;
      }
      addNotification(state, { type: "whatsapp", recipient: payload.customer.phone, subject: `Order ${order.orderNumber} awaiting WhatsApp completion`, message: `Customer should complete ${order.orderNumber} through WhatsApp.` });
      addNotification(state, { type: "system", recipient: "admin", subject: "New WhatsApp order received", message: `${order.customerName} placed ${order.orderNumber} for ${order.totals.total}. Awaiting WhatsApp payment confirmation.` });
      return order;
    });
    return delay(order, 300);
  },
};

export const adminApi = {
  overview: async () => {
    const store = await fsGet();
    const allOrders = firestoreOrdersEnabled ? await listFirestoreOrders() : store.orders;
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.totals.total, 0);
    const pendingOrders = allOrders.filter((order) => ["pending", "confirmed", "processing"].includes(order.status)).length;
    const lowStock = store.products.flatMap((product) => product.variants.filter((variant) => variant.inventory <= variant.lowStockThreshold).map((variant) => ({ product, variant })));
    const last7Days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const toYmd = (date: Date) => { const yyyy = date.getFullYear(); const mm = String(date.getMonth() + 1).padStart(2, "0"); const dd = String(date.getDate()).padStart(2, "0"); return `${yyyy}-${mm}-${dd}`; };
    const chart = last7Days.map((d) => { const ymd = toYmd(d); return { label: weekdays[d.getDay()], value: allOrders.filter((o) => o.createdAt.startsWith(ymd)).reduce((sum, o) => sum + o.totals.total, 0) }; });
    const todayYmd = toYmd(new Date());
    const todayRevenue = allOrders.filter((o) => o.createdAt.startsWith(todayYmd)).reduce((sum, o) => sum + o.totals.total, 0);
    return {
      totalRevenue,
      todayRevenue,
      averageOrderValue: allOrders.length ? Math.round(totalRevenue / allOrders.length) : 0,
      totalOrders: allOrders.length,
      pendingOrders,
      totalCustomers: store.customers.length,
      products: store.products.length,
      lowStockProducts: lowStock.length,
      chart,
      recentOrders: allOrders,
      topProducts: store.products.filter((product) => product.popular).slice(0, 4),
      lowStock,
    };
  },
  products: async () => (await fsGet()).products,
  categories: async () => (await fsGet()).categories,
  collections: async () => (await fsGet()).collections,
  customers: () => fsGet().then((s) => s.customers),
  orders: () => firestoreOrdersEnabled ? listFirestoreOrders() : fsGet().then((s) => s.orders),
  orderByNumber: (orderNumber: string, email?: string) => {
    if (firestoreOrdersEnabled) return findFirestoreOrder(orderNumber, email);
    const normalized = `#${orderNumber.trim().replace(/^#+/, "")}`.toUpperCase();
    const normalizedEmail = email?.trim().toLowerCase();
    return fsGet().then((s) => s.orders.find((item) => item.orderNumber.toUpperCase() === normalized && (!normalizedEmail || item.customerEmail.toLowerCase() === normalizedEmail)));
  },
  notifications: () => fsGet().then((s) => s.notifications),
  inventoryHistory: async () => (await fsGet()).inventoryHistory,
  discounts: async () => (await fsGet()).discounts,
  shippingZones: async () => (await fsGet()).shippingZones,
  homepage: async () => (await fsGet()).homepageContent,
  contentPages: async () => (await fsGet()).contentPages,
  settings: async () => (await fsGet()).storeSettings,
  resetDemoStore: () => delay(saveStore(clone(initialState))),
  saveProduct: (payload: Product) => fsUpdate((state) => {
    const product = { ...payload, slug: payload.slug || slugify(payload.name), createdAt: payload.createdAt || new Date().toISOString() };
    const index = state.products.findIndex((item) => item.id === product.id);
    if (index >= 0) state.products[index] = product;
    else state.products.unshift(product);
    return product;
  }),
  deleteProduct: (productId: string) => fsUpdate((state) => {
    state.products = state.products.filter((item) => item.id !== productId);
    state.collections = state.collections.map((collection) => ({ ...collection, productIds: collection.productIds.filter((id) => id !== productId) }));
    return productId;
  }),
  updateProductStatus: (productId: string, status: ProductStatus) => fsUpdate((state) => {
    const product = state.products.find((item) => item.id === productId);
    if (product) product.status = status;
    return product;
  }),
  updateVariantInventory: (variantId: string, inventory: number, lowStockThreshold?: number) => fsUpdate((state) => {
    for (const product of state.products) {
      const variant = product.variants.find((item) => item.id === variantId);
      if (variant) {
        const previousStock = variant.inventory;
        variant.inventory = Math.max(0, inventory);
        if (typeof lowStockThreshold === "number") variant.lowStockThreshold = Math.max(0, lowStockThreshold);
        if (previousStock !== variant.inventory) state.inventoryHistory.unshift({ id: `hist-${Date.now()}-${variant.id}`, productId: product.id, variantId: variant.id, sku: variant.sku, previousStock, nextStock: variant.inventory, reason: "Admin adjustment", createdAt: new Date().toISOString() });
        return variant;
      }
    }
    return undefined;
  }),
  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    if (firestoreOrdersEnabled) return updateFirestoreOrder(orderId, { status });
    return fsUpdate((state) => {
      const order = state.orders.find((item) => item.id === orderId);
      if (order) {
        order.status = status;
        addNotification(state, { type: "email", recipient: order.customerEmail, subject: `Order ${order.orderNumber} is ${status.replace(/_/g, " ")}`, message: `Your GODID order status changed to ${status.replace(/_/g, " ")}.` });
        addNotification(state, { type: "whatsapp", recipient: order.customerPhone, subject: "Order status update", message: `${order.orderNumber}: ${status.replace(/_/g, " ")}.` });
      }
      return order;
    });
  },
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => {
    if (firestoreOrdersEnabled) return updateFirestoreOrder(orderId, { paymentStatus: status });
    return fsUpdate((state) => {
      const order = state.orders.find((item) => item.id === orderId);
      if (order) order.paymentStatus = status;
      return order;
    });
  },
  updateCustomerStatus: (customerId: string, status: Customer["status"]) => fsUpdate((state) => {
    const customer = state.customers.find((item) => item.id === customerId);
    if (customer) customer.status = status;
    return customer;
  }),
  saveCollection: (payload: Collection) => fsUpdate((state) => {
    const collection = { ...payload, slug: payload.slug || slugify(payload.name) };
    const index = state.collections.findIndex((item) => item.id === collection.id);
    if (index >= 0) state.collections[index] = collection;
    else state.collections.unshift(collection);
    return collection;
  }),
  deleteCollection: (id: string) => fsUpdate((state) => {
    state.collections = state.collections.filter((item) => item.id !== id);
    return id;
  }),
  saveCategory: (payload: Category) => fsUpdate((state) => {
    const category = { ...payload, slug: payload.slug || slugify(payload.name) };
    const index = state.categories.findIndex((item) => item.id === category.id);
    if (index >= 0) state.categories[index] = category;
    else state.categories.unshift(category);
    return category;
  }),
  deleteCategory: (id: string) => fsUpdate((state) => {
    state.categories = state.categories.filter((item) => item.id !== id);
    return id;
  }),
  saveDiscount: (payload: Discount) => fsUpdate((state) => {
    const discount = { ...payload, code: payload.code.toUpperCase() };
    const index = state.discounts.findIndex((item) => item.id === discount.id);
    if (index >= 0) state.discounts[index] = discount;
    else state.discounts.unshift(discount);
    return discount;
  }),
  deleteDiscount: (id: string) => fsUpdate((state) => {
    state.discounts = state.discounts.filter((item) => item.id !== id);
    return id;
  }),
  saveShippingZone: (payload: ShippingZone) => fsUpdate((state) => {
    const name = payload.name.trim();
    const states = [...new Set(payload.states)];
    if (!name) throw new Error("Enter a shipping zone name.");
    if (!Number.isFinite(payload.price) || payload.price < 0) throw new Error("Enter a valid shipping price.");
    if (payload.id !== "ship-other" && !states.length) throw new Error("Add at least one state to this zone.");
    if (states.some((item) => !NIGERIAN_STATES.includes(item))) throw new Error("Choose states from the Nigerian state list.");
    const zone = { ...payload, name, states, active: payload.id === "ship-other" ? true : payload.active };
    state.shippingZones = state.shippingZones.map((item) => item.id === zone.id ? zone : { ...item, states: item.states.filter((s) => !states.includes(s)) });
    if (!state.shippingZones.some((item) => item.id === zone.id)) state.shippingZones.unshift(zone);
    return zone;
  }),
  deleteShippingZone: (id: string) => fsUpdate((state) => {
    if (id === "ship-other") throw new Error("The Other States fallback zone cannot be deleted.");
    const zone = state.shippingZones.find((item) => item.id === id);
    if (!zone) throw new Error("Shipping zone not found.");
    state.shippingZones = state.shippingZones.filter((item) => item.id !== id);
    return zone;
  }),
  updateHomepage: (payload: HomepageContent) => fsUpdate((state) => {
    state.homepageContent = payload;
    return state.homepageContent;
  }),
  updateContentPage: (payload: ContentPage) => fsUpdate((state) => {
    const page = { ...payload, slug: payload.slug || slugify(payload.title) };
    const index = state.contentPages.findIndex((item) => item.slug === page.slug);
    if (index >= 0) state.contentPages[index] = page;
    else state.contentPages.push(page);
    return page;
  }),
  updateSettings: (payload: StoreSettings) => fsUpdate((state) => {
    state.storeSettings = payload;
    return state.storeSettings;
  }),
};

export const newsletterApi = {
  subscribe: (email: string) => {
    if (API_BASE_URL && !demoMode) return requestApi<{ ok: true }>("/newsletter", { method: "POST", body: JSON.stringify({ email }) });
    if (!demoMode) throw new Error("Newsletter signup is not configured for launch.");
    const saved = JSON.parse(localStorage.getItem("godid-newsletter") ?? "[]") as string[];
    localStorage.setItem("godid-newsletter", JSON.stringify(Array.from(new Set([...saved, email.toLowerCase()]))));
    return Promise.resolve({ ok: true as const });
  },
};

export const authApi = {
  login: (email: string, password: string) => requestApi<{ token: string; user: { id: string; name: string; email: string; role: "admin" } }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
};

export const inventoryService = {
  isVariantAvailable: (product: Product, variantId: string, quantity = 1) => {
    const variant = product.variants.find((item) => item.id === variantId);
    return Boolean(variant && variant.inventory >= quantity);
  },
  decreaseInventory: (items: CartItem[]) => fsUpdate((state) => {
    items.forEach((item) => {
      const product = state.products.find((entry) => entry.id === item.productId);
      const variant = product?.variants.find((entry) => entry.id === item.variantId);
      if (variant) variant.inventory = Math.max(0, variant.inventory - item.quantity);
    });
    return items.map((item) => ({ ...item, committed: true }));
  }),
};
