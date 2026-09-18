import { categories, collections, customers, discounts, homepageContent, orders, products, shippingZones, storeSettings } from "../data/mockData";
import { NIGERIAN_STATES } from "../data/nigeria";
import type { Address, CartItem, Category, Collection, ContentPage, Customer, Discount, HomepageContent, InventoryHistoryEntry, MoneySummary, NotificationRecord, Order, OrderStatus, PaymentStatus, Product, ProductStatus, ShippingZone, StoreSettings } from "../types/domain";

const delay = <T,>(value: T, ms = 120) => new Promise<T>((resolve) => window.setTimeout(() => resolve(value), ms));
const STORAGE_KEY = "godid-admin-store-v1";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/$/, "");
export const apiConfigured = Boolean(API_BASE_URL);
export const demoMode = import.meta.env.VITE_DEMO_MODE === "true";

export const requestApi = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  if (!API_BASE_URL) throw new Error("The GODID API is not configured. Set VITE_API_BASE_URL before launch.");
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
  products,
  categories,
  collections,
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
  listProducts: (filters: ProductFilters = {}) => {
    const store = loadStore();
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
    list = [...list].sort((a, b) => {
      if (filters.sort === "price-asc") return (a.salePrice ?? a.price) - (b.salePrice ?? b.price);
      if (filters.sort === "price-desc") return (b.salePrice ?? b.price) - (a.salePrice ?? a.price);
      if (filters.sort === "popular") return Number(b.popular) - Number(a.popular);
      if (filters.sort === "featured") return Number(b.featured) - Number(a.featured);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return delay(list);
  },
  getProductBySlug: (slug: string) => delay(loadStore().products.find((product) => product.slug === slug)),
  getProductById: (id: string) => delay(loadStore().products.find((product) => product.id === id)),
  listCategories: () => delay(loadStore().categories.filter((category) => category.published)),
  listCollections: () => delay(loadStore().collections.filter((collection) => collection.published)),
  getCollectionBySlug: (slug: string) => delay(loadStore().collections.find((collection) => collection.slug === slug)),
  getHomepage: () => delay(loadStore().homepageContent),
  listContentPages: () => delay(loadStore().contentPages),
  getContentPage: (slug: string) => delay(loadStore().contentPages.find((page) => page.slug === slug)),
};

export const commerceApi = {
  getShippingZones: () => delay(loadStore().shippingZones),
  calculateShipping: (state: string) => {
    const zones = loadStore().shippingZones;
    const zone = zones.find((item) => item.active && item.states.includes(state)) ?? zones.find((item) => item.id === "ship-other")!;
    return delay(zone.price);
  },
  applyDiscount: (code: string, subtotal: number) => {
    const discount = loadStore().discounts.find((item) => item.code.toUpperCase() === code.toUpperCase() && item.active);
    if (!discount || new Date(discount.expiresAt) < new Date() || subtotal < discount.minimumOrderValue || discount.used >= discount.usageLimit) {
      return delay<Discount | undefined>(undefined);
    }
    return delay(discount);
  },
  calculateTotals: async (items: CartItem[], discountCode?: string, state?: string): Promise<MoneySummary> => {
    const store = loadStore();
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
    if (API_BASE_URL && !demoMode) {
      const totals = await commerceApi.calculateTotals(payload.items, payload.discountCode, payload.address.state);
      const store = loadStore();
      const items = payload.items.map((item) => {
        const product = store.products.find((entry) => entry.id === item.productId);
        const variant = product?.variants.find((entry) => entry.id === item.variantId);
        return {
          ...item,
          productName: product?.name,
          image: product?.images[0],
          sku: variant?.sku,
          color: variant?.color,
          size: variant?.size,
          unitPrice: product ? product.salePrice ?? product.price : undefined,
        };
      });
      return requestApi<Order>("/orders", { method: "POST", body: JSON.stringify({ ...payload, items, totals, shipping: totals.shipping, discount: totals.discount }) });
    }
    if (!demoMode && !API_BASE_URL) throw new Error("Checkout is not configured for launch. Set VITE_API_BASE_URL to the deployed GODID API.");
    const totals = await commerceApi.calculateTotals(payload.items, payload.discountCode, payload.address.state);
    const store = loadStore();
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
    const order: Order = {
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
  overview: () => {
    if (apiConfigured && !demoMode) return requestApi<{
      totalRevenue: number; todayRevenue: number; averageOrderValue: number; totalOrders: number; pendingOrders: number; totalCustomers: number; products: number; lowStockProducts: number; chart: Array<{ label: string; value: number }>; recentOrders: Order[]; topProducts: Product[]; lowStock: Array<{ product: Product; variant: Product["variants"][number] }>;
    }>("/admin/overview");
    const store = loadStore();
    const totalRevenue = store.orders.reduce((sum, order) => sum + order.totals.total, 0);
    const pendingOrders = store.orders.filter((order) => ["pending", "confirmed", "processing"].includes(order.status)).length;
    const lowStock = store.products.flatMap((product) => product.variants.filter((variant) => variant.inventory <= variant.lowStockThreshold).map((variant) => ({ product, variant })));

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const toYmd = (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    const chart = last7Days.map((d) => {
      const ymd = toYmd(d);
      const dayOrders = store.orders.filter((order) => order.createdAt.startsWith(ymd));
      const value = dayOrders.reduce((sum, order) => sum + order.totals.total, 0);
      return {
        label: weekdays[d.getDay()],
        value,
      };
    });

    const todayYmd = toYmd(new Date());
    const todayOrders = store.orders.filter((order) => order.createdAt.startsWith(todayYmd));
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totals.total, 0);

    return delay({
      totalRevenue,
      todayRevenue,
      averageOrderValue: store.orders.length ? Math.round(totalRevenue / store.orders.length) : 0,
      totalOrders: store.orders.length,
      pendingOrders,
      totalCustomers: store.customers.length,
      products: store.products.length,
      lowStockProducts: lowStock.length,
      chart,
      recentOrders: store.orders,
      topProducts: store.products.filter((product) => product.popular).slice(0, 4),
      lowStock,
    });
  },
  products: () => delay(loadStore().products),
  categories: () => delay(loadStore().categories),
  collections: () => delay(loadStore().collections),
  customers: () => delay(loadStore().customers),
  orders: () => apiConfigured && !demoMode ? requestApi<Order[]>("/admin/orders") : delay(loadStore().orders),
  orderByNumber: (orderNumber: string, email?: string) => {
    if (API_BASE_URL && !demoMode) return requestApi<Order | null>(`/orders/track?${new URLSearchParams({ orderNumber, email: email ?? "" }).toString()}`).then((order) => order ?? undefined);
    const normalized = `#${orderNumber.trim().replace(/^#+/, "")}`.toUpperCase();
    const normalizedEmail = email?.trim().toLowerCase();
    const order = loadStore().orders.find((item) => item.orderNumber.toUpperCase() === normalized && (!normalizedEmail || item.customerEmail.toLowerCase() === normalizedEmail));
    return delay(order);
  },
  notifications: () => apiConfigured && !demoMode ? requestApi<NotificationRecord[]>("/admin/notifications") : delay(loadStore().notifications),
  inventoryHistory: () => delay(loadStore().inventoryHistory),
  discounts: () => delay(loadStore().discounts),
  shippingZones: () => delay(loadStore().shippingZones),
  homepage: () => delay(loadStore().homepageContent),
  contentPages: () => delay(loadStore().contentPages),
  settings: () => delay(loadStore().storeSettings),
  resetDemoStore: () => delay(saveStore(clone(initialState))),
  saveProduct: (payload: Product) => delay(updateStore((state) => {
    const product = { ...payload, slug: payload.slug || slugify(payload.name), createdAt: payload.createdAt || new Date().toISOString() };
    const index = state.products.findIndex((item) => item.id === product.id);
    if (index >= 0) state.products[index] = product;
    else state.products.unshift(product);
    return product;
  })),
  deleteProduct: (productId: string) => delay(updateStore((state) => {
    state.products = state.products.filter((item) => item.id !== productId);
    state.collections = state.collections.map((collection) => ({ ...collection, productIds: collection.productIds.filter((id) => id !== productId) }));
    return productId;
  })),
  updateProductStatus: (productId: string, status: ProductStatus) => delay(updateStore((state) => {
    const product = state.products.find((item) => item.id === productId);
    if (product) product.status = status;
    return product;
  })),
  updateVariantInventory: (variantId: string, inventory: number, lowStockThreshold?: number) => delay(updateStore((state) => {
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
  })),
  updateOrderStatus: (orderId: string, status: OrderStatus) => apiConfigured && !demoMode
    ? requestApi<{ ok: true }>(`/admin/orders/${orderId}`, { method: "POST", body: JSON.stringify({ status }) })
    : delay(updateStore((state) => {
    const order = state.orders.find((item) => item.id === orderId);
    if (order) {
      order.status = status;
      addNotification(state, { type: "email", recipient: order.customerEmail, subject: `Order ${order.orderNumber} is ${status.replace(/_/g, " ")}`, message: `Your GODID order status changed to ${status.replace(/_/g, " ")}.` });
      addNotification(state, { type: "whatsapp", recipient: order.customerPhone, subject: "Order status update", message: `${order.orderNumber}: ${status.replace(/_/g, " ")}.` });
    }
    return order;
  })),
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => apiConfigured && !demoMode
    ? requestApi<{ ok: true }>(`/admin/orders/${orderId}`, { method: "POST", body: JSON.stringify({ paymentStatus: status }) })
    : delay(updateStore((state) => {
    const order = state.orders.find((item) => item.id === orderId);
    if (order) order.paymentStatus = status;
    return order;
  })),
  updateCustomerStatus: (customerId: string, status: Customer["status"]) => delay(updateStore((state) => {
    const customer = state.customers.find((item) => item.id === customerId);
    if (customer) customer.status = status;
    return customer;
  })),
  saveCollection: (payload: Collection) => delay(updateStore((state) => {
    const collection = { ...payload, slug: payload.slug || slugify(payload.name) };
    const index = state.collections.findIndex((item) => item.id === collection.id);
    if (index >= 0) state.collections[index] = collection;
    else state.collections.unshift(collection);
    return collection;
  })),
  deleteCollection: (id: string) => delay(updateStore((state) => {
    state.collections = state.collections.filter((item) => item.id !== id);
    return id;
  })),
  saveCategory: (payload: Category) => delay(updateStore((state) => {
    const category = { ...payload, slug: payload.slug || slugify(payload.name) };
    const index = state.categories.findIndex((item) => item.id === category.id);
    if (index >= 0) state.categories[index] = category;
    else state.categories.unshift(category);
    return category;
  })),
  deleteCategory: (id: string) => delay(updateStore((state) => {
    state.categories = state.categories.filter((item) => item.id !== id);
    return id;
  })),
  saveDiscount: (payload: Discount) => delay(updateStore((state) => {
    const discount = { ...payload, code: payload.code.toUpperCase() };
    const index = state.discounts.findIndex((item) => item.id === discount.id);
    if (index >= 0) state.discounts[index] = discount;
    else state.discounts.unshift(discount);
    return discount;
  })),
  deleteDiscount: (id: string) => delay(updateStore((state) => {
    state.discounts = state.discounts.filter((item) => item.id !== id);
    return id;
  })),
  saveShippingZone: (payload: ShippingZone) => delay(updateStore((state) => {
    const name = payload.name.trim();
    const states = [...new Set(payload.states)];
    if (!name) throw new Error("Enter a shipping zone name.");
    if (!Number.isFinite(payload.price) || payload.price < 0) throw new Error("Enter a valid shipping price.");
    if (payload.id !== "ship-other" && !states.length) throw new Error("Add at least one state to this zone.");
    if (states.some((item) => !NIGERIAN_STATES.includes(item))) throw new Error("Choose states from the Nigerian state list.");
    const zone = { ...payload, name, states, active: payload.id === "ship-other" ? true : payload.active };
    state.shippingZones = state.shippingZones.map((item) => item.id === zone.id ? zone : { ...item, states: item.states.filter((state) => !states.includes(state)) });
    if (!state.shippingZones.some((item) => item.id === zone.id)) state.shippingZones.unshift(zone);
    return zone;
  })),
  deleteShippingZone: (id: string) => delay(updateStore((state) => {
    if (id === "ship-other") throw new Error("The Other States fallback zone cannot be deleted.");
    const zone = state.shippingZones.find((item) => item.id === id);
    if (!zone) throw new Error("Shipping zone not found.");
    state.shippingZones = state.shippingZones.filter((item) => item.id !== id);
    return zone;
  })),
  updateHomepage: (payload: HomepageContent) => delay(updateStore((state) => {
    state.homepageContent = payload;
    return state.homepageContent;
  })),
  updateContentPage: (payload: ContentPage) => delay(updateStore((state) => {
    const page = { ...payload, slug: payload.slug || slugify(payload.title) };
    const index = state.contentPages.findIndex((item) => item.slug === page.slug);
    if (index >= 0) state.contentPages[index] = page;
    else state.contentPages.push(page);
    return page;
  })),
  updateSettings: (payload: StoreSettings) => delay(updateStore((state) => {
    state.storeSettings = payload;
    return state.storeSettings;
  })),
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
  decreaseInventory: (items: CartItem[]) => delay(updateStore((state) => {
    items.forEach((item) => {
      const product = state.products.find((entry) => entry.id === item.productId);
      const variant = product?.variants.find((entry) => entry.id === item.variantId);
      if (variant) variant.inventory = Math.max(0, variant.inventory - item.quantity);
    });
    return items.map((item) => ({ ...item, committed: true }));
  })),
};
