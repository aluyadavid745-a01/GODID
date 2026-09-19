import type { Order } from "../types/domain";
import { formatNaira } from "./format";

export const WHATSAPP_DISPLAY_NUMBER = "+234 705 541 9856";
export const WHATSAPP_NUMBER = "2347055419856";

export const buildWhatsAppUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const buildOrderWhatsAppUrl = (order: Order) => {
  const items = order.items
    .map((item, index) => [
      `${index + 1}. ${item.productName}`,
      `Variant: ${item.color} / ${item.size}`,
      `Quantity: ${item.quantity}`,
      `Unit price: ${formatNaira(item.unitPrice)}`,
      `Image URL: ${item.image}`,
    ].join("\n"))
    .join("\n\n");
  const message = [
    `Hello GODID, I want to complete this order on WhatsApp.`,
    `Order: ${order.orderNumber}`,
    `Name: ${order.customerName}`,
    `Email: ${order.customerEmail}`,
    `Phone: ${order.customerPhone}`,
    "",
    "Items:",
    items,
    "",
    `Delivery: ${order.address.street}, ${order.address.city}, ${order.address.state}`,
    order.address.apartment ? `Apartment: ${order.address.apartment}` : "",
    order.address.instructions ? `Delivery notes: ${order.address.instructions}` : "",
    `${order.pricingStatus === "unverified" ? "Estimated total (please confirm with GODID)" : "Total"}: ${formatNaira(order.totals.total)}`,
  ].filter(Boolean).join("\n");

  return buildWhatsAppUrl(message);
};
