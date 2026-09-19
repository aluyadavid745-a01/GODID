import { getApp, getApps, initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore, runTransaction } from "firebase/firestore";
import type { Category, Collection, ContentPage, Discount, HomepageContent, InventoryHistoryEntry, Product, ShippingZone, StoreSettings } from "../types/domain";
import { firebaseConfig, firebaseConfigured } from "./firebaseConfig";

export interface SharedStoreState {
  products: Product[];
  categories: Category[];
  collections: Collection[];
  discounts: Discount[];
  shippingZones: ShippingZone[];
  homepageContent: HomepageContent;
  contentPages: ContentPage[];
  inventoryHistory: InventoryHistoryEntry[];
  storeSettings: StoreSettings;
}

export const sharedStoreEnabled = firebaseConfigured && process.env.NEXT_PUBLIC_DEMO_MODE !== "true";

const app = () => getApps().length ? getApp() : initializeApp(firebaseConfig);
const storeRef = () => doc(getFirestore(app()), "stores", "default");
const storefrontRef = () => doc(getFirestore(app()), "storefront", "catalog");
const clean = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const publicProjection = (state: SharedStoreState): SharedStoreState => ({
  ...clean(state),
  products: state.products.filter((product) => product.status === "published"),
  categories: state.categories.filter((category) => category.published),
  collections: state.collections.filter((collection) => collection.published),
  inventoryHistory: [],
});

export const getSharedStore = async (fallback: SharedStoreState): Promise<SharedStoreState> => {
  if (!sharedStoreEnabled) return clean(fallback);
  const snapshot = await getDoc(storeRef()).catch(() => getDoc(storefrontRef()));
  return snapshot.exists() ? { ...clean(fallback), ...(snapshot.data() as Partial<SharedStoreState>) } : clean(fallback);
};

export const updateSharedStore = async <T,>(fallback: SharedStoreState, updater: (state: SharedStoreState) => T): Promise<T> => {
  if (!sharedStoreEnabled) throw new Error("Firebase shared store is not configured.");
  return runTransaction(getFirestore(app()), async (transaction) => {
    const reference = storeRef();
    const snapshot = await transaction.get(reference);
    const state = snapshot.exists()
      ? { ...clean(fallback), ...(snapshot.data() as Partial<SharedStoreState>) }
      : clean(fallback);
    const result = updater(state);
    transaction.set(reference, clean(state));
    transaction.set(storefrontRef(), publicProjection(state));
    return clean(result);
  });
};

export const uploadImage = async (folder: string, file: File): Promise<string> => {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Images must be 8 MB or smaller.");
  const cloudName = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "").trim();
  const uploadPreset = (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "").trim();
  if (!cloudName || !uploadPreset) throw new Error("Cloudinary is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your .env.local file.");
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);
  form.append("folder", `godid/${folder}`);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, { method: "POST", body: form });
  const body = await response.json().catch(() => ({})) as { secure_url?: string; error?: { message?: string } };
  if (!response.ok || !body.secure_url) throw new Error(body.error?.message ?? "Could not upload the image.");
  return body.secure_url;
};

export const uploadProductImage = (productId: string, file: File) => uploadImage(`products/${productId}`, file);
