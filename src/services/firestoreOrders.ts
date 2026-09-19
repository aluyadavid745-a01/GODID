import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where, setDoc } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import type { Order, OrderStatus, PaymentStatus } from "../types/domain";
import { firebaseConfig, firebaseConfigured } from "./firebaseConfig";

export const firestoreOrdersEnabled = process.env.NEXT_PUBLIC_ORDER_BACKEND === "firestore" && process.env.NEXT_PUBLIC_DEMO_MODE !== "true";

const database = () => {
  if (!firebaseConfigured) throw new Error("Firebase is not configured for shared orders.");
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getFirestore(app);
};

const currentUserId = () => getAuth(getApps().length ? getApp() : initializeApp(firebaseConfig)).currentUser?.uid ?? "guest";
const readOrder = (data: DocumentData): Order => ({ ...data, createdAt: data.createdAtServer?.toDate?.().toISOString() ?? data.createdAt }) as Order;

export const saveFirestoreOrder = async (draft: Order): Promise<Order> => {
  const reference = doc(collection(database(), "orders"));
  const order: Order = {
    ...draft,
    id: reference.id,
    orderNumber: `#COL-${reference.id.slice(0, 12).toUpperCase()}`,
    customerId: currentUserId(),
    pricingStatus: "unverified",
  };
  await setDoc(reference, { ...order, createdAtServer: serverTimestamp() });
  localStorage.setItem("godid-last-order-details", JSON.stringify(order));
  return order;
};

export const listFirestoreOrders = async (): Promise<Order[]> => {
  const snapshot = await getDocs(query(collection(database(), "orders"), orderBy("createdAtServer", "desc"), limit(250)));
  return snapshot.docs.map((item) => readOrder(item.data()));
};

export const watchFirestoreOrders = (onOrders: (orders: Order[]) => void, onError: (error: Error) => void) =>
  onSnapshot(query(collection(database(), "orders"), orderBy("createdAtServer", "desc"), limit(250)),
    (snapshot) => onOrders(snapshot.docs.map((item) => readOrder(item.data()))), onError);

export const listOwnFirestoreOrders = async (): Promise<Order[]> => {
  const uid = currentUserId();
  if (uid === "guest") return [];
  const snapshot = await getDocs(query(collection(database(), "orders"), where("customerId", "==", uid), limit(100)));
  return snapshot.docs.map((item) => readOrder(item.data())).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const findFirestoreOrder = async (orderNumber: string, email?: string): Promise<Order | undefined> => {
  const normalized = `#${orderNumber.trim().replace(/^#+/, "")}`.toUpperCase();
  const normalizedEmail = email?.trim().toLowerCase();
  try {
    const saved = localStorage.getItem("godid-last-order-details");
    const cached = saved ? JSON.parse(saved) as Order : undefined;
    if (cached?.orderNumber === normalized && (!normalizedEmail || cached.customerEmail === normalizedEmail)) {
      const uid = currentUserId();
      if (uid !== "guest" && cached.customerId === uid) {
        const snapshot = await getDoc(doc(database(), "orders", cached.id));
        if (snapshot.exists()) return readOrder(snapshot.data());
      }
      return cached;
    }
  } catch { /* A missing or inaccessible cached order is handled below. */ }
  const uid = currentUserId();
  if (uid === "guest") return undefined;
  const own = await listOwnFirestoreOrders();
  return own.find((order) => order.orderNumber === normalized && (!normalizedEmail || order.customerEmail === normalizedEmail));
};

export const updateFirestoreOrder = async (orderId: string, update: { status?: OrderStatus; paymentStatus?: PaymentStatus; pricingStatus?: "verified" }) => {
  await updateDoc(doc(database(), "orders", orderId), { ...update, updatedAt: new Date().toISOString() });
  return { ok: true as const };
};
