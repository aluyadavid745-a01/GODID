export type ID = string;

export type Role = "customer" | "admin";
export type ProductStatus = "draft" | "published";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

export type DiscountType = "percentage" | "fixed";

export interface MoneySummary {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface Category {
  id: ID;
  name: string;
  slug: string;
  description: string;
  image: string;
  published: boolean;
}

export interface Collection {
  id: ID;
  name: string;
  slug: string;
  description: string;
  image: string;
  published: boolean;
  productIds: ID[];
}

export interface ProductVariant {
  id: ID;
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  inventory: number;
  lowStockThreshold: number;
}

export interface Product {
  id: ID;
  slug: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  categoryId: ID;
  collectionIds: ID[];
  images: string[];
  hoverImage: string;
  colors: Array<{ name: string; hex: string }>;
  sizes: string[];
  variants: ProductVariant[];
  materials: string;
  care: string;
  details: string[];
  featured: boolean;
  popular: boolean;
  status: ProductStatus;
  createdAt: string;
}

export interface Customer {
  id: ID;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  status: "active" | "disabled";
  addresses: Address[];
}

export interface Address {
  id: ID;
  fullName: string;
  phone: string;
  state: string;
  city: string;
  street: string;
  apartment?: string;
  instructions?: string;
}

export interface CartItem {
  productId: ID;
  variantId: ID;
  quantity: number;
}

export interface OrderItem extends CartItem {
  productName: string;
  image: string;
  sku: string;
  color: string;
  size: string;
  unitPrice: number;
}

export interface Order {
  id: ID;
  orderNumber: string;
  customerId: ID;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  address: Address;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentProvider: "whatsapp";
  deliveryMethod: string;
  totals: MoneySummary;
  createdAt: string;
  pricingStatus?: "unverified" | "verified";
}

export interface Discount {
  id: ID;
  code: string;
  type: DiscountType;
  value: number;
  minimumOrderValue: number;
  expiresAt: string;
  usageLimit: number;
  used: number;
  active: boolean;
}

export interface ShippingZone {
  id: ID;
  name: string;
  states: string[];
  price: number;
  active: boolean;
}

export interface HomepageContent {
  heroHeadline: string;
  heroDescription: string;
  heroImage: string;
  heroLogo?: string;
  primaryCta: string;
  secondaryCta: string;
  featuredProductIds: ID[];
  featuredCollectionIds: ID[];
  brandStory: string;
  newsletterTitle: string;
  newsletterText: string;
  lookbookImages: string[];
}

export interface ContentPage {
  slug: string;
  title: string;
  intro: string;
  sections: Array<{ heading: string; body: string }>;
}

export interface NotificationRecord {
  id: ID;
  type: "email" | "whatsapp" | "system";
  recipient: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface InventoryHistoryEntry {
  id: ID;
  productId: ID;
  variantId: ID;
  sku: string;
  previousStock: number;
  nextStock: number;
  reason: string;
  createdAt: string;
}

export interface AdminUser {
  id: ID;
  name: string;
  email: string;
  role: "owner" | "manager" | "support";
  active: boolean;
}

export interface StoreSettings {
  storeName: string;
  currency: "NGN";
  taxRate: number;
  paymentProviders: Array<"whatsapp">;
  social: Record<string, string>;
  emailFrom: string;
  navLogo?: string;
}
