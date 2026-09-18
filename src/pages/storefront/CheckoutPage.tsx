import { ArrowRight, CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { NIGERIAN_STATES, isValidNigerianPhone } from "../../data/nigeria";
import { commerceApi } from "../../services/api";
import { useCart } from "../../state/CartContext";
import type { Address, MoneySummary } from "../../types/domain";
import { formatNaira } from "../../utils/format";
import { useMeta } from "../../hooks/useMeta";
import { buildOrderWhatsAppUrl, WHATSAPP_DISPLAY_NUMBER } from "../../utils/whatsapp";

const LAST_ORDER_KEY = "godid-last-order";

export const CheckoutPage = () => {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [discountCode, setDiscountCode] = useState(() => searchParams.get("discount") ?? "");
  const [totals, setTotals] = useState<MoneySummary>({ subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0 });
  const [form, setForm] = useState<Address & { email: string }>({ id: "checkout-address", fullName: "", email: "", phone: "", state: "Lagos", city: "", street: "", apartment: "", instructions: "" });
  useMeta("Checkout | GODID", "Place your GODID order for nationwide delivery and complete payment through WhatsApp.");

  useEffect(() => {
    commerceApi.calculateTotals(items, discountCode, form.state).then(setTotals);
  }, [discountCode, form.state, items]);

  if (!items.length) return <Navigate to="/cart" replace />;

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const next = async () => {
    setError("");
    if (step === 0 && (!form.fullName || !form.email || !isValidNigerianPhone(form.phone))) return setError("Enter your name, email and a valid Nigerian phone number.");
    if (step === 1 && (!form.state || !form.city || !form.street)) return setError("Enter your Nigerian delivery address.");
    if (step < 3) return setStep(step + 1);
    const whatsappWindow = window.open("", "_blank");
    try {
      const order = await commerceApi.createOrder({ customer: { name: form.fullName, email: form.email, phone: form.phone }, address: form, items, discountCode });
      localStorage.setItem(LAST_ORDER_KEY, JSON.stringify({ orderNumber: order.orderNumber, email: order.customerEmail }));
      clearCart();
      if (whatsappWindow) whatsappWindow.location.href = buildOrderWhatsAppUrl(order);
      navigate(`/order-confirmation/${order.orderNumber.replace("#", "")}`, { state: { order } });
    } catch (error) {
      whatsappWindow?.close();
      setError(error instanceof Error ? error.message : "Could not confirm this order. Please review your cart.");
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">WhatsApp order completion</p>
          <h1 className="mt-2 font-display text-5xl font-semibold">Checkout</h1>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold shadow-soft">
          <MessageCircle size={18} className="text-accent" />
          <span>{WHATSAPP_DISPLAY_NUMBER}</span>
        </div>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-line bg-porcelain p-5 shadow-soft">
          <div className="mb-8 grid grid-cols-4 gap-1 sm:gap-2">
            {["Customer", "Address", "Delivery", "WhatsApp"].map((label, index) => (
              <div key={label} className={`min-w-0 rounded-md border px-1 py-2 text-center text-[10px] font-semibold leading-tight transition sm:px-3 sm:text-sm ${index <= step ? "border-ink bg-ink text-white" : "border-line bg-white text-muted"}`}>
                {label}
              </div>
            ))}
          </div>
          {step === 0 ? (
            <div className="grid gap-4">
              <Input label="Full name" value={form.fullName} onChange={(event) => update("fullName", event.target.value)} />
              <Input label="Email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
              <Input label="Nigerian phone number" value={form.phone} onChange={(event) => update("phone", event.target.value)} hint="Examples: 08012345678 or +2348012345678" />
            </div>
          ) : null}
          {step === 1 ? (
            <div className="grid gap-4">
              <Select label="State" value={form.state} onChange={(event) => update("state", event.target.value)} options={NIGERIAN_STATES.map((state) => ({ label: state, value: state }))} />
              <Input label="City" value={form.city} onChange={(event) => update("city", event.target.value)} />
              <Input label="Delivery address" value={form.street} onChange={(event) => update("street", event.target.value)} />
              <Input label="Apartment / unit (optional)" value={form.apartment} onChange={(event) => update("apartment", event.target.value)} />
              <Input label="Delivery instructions (optional)" value={form.instructions} onChange={(event) => update("instructions", event.target.value)} />
            </div>
          ) : null}
          {step === 2 ? (
            <div className="grid gap-4">
              <div className="border border-line bg-white p-4">
                <h2 className="font-semibold">Nationwide delivery</h2>
                <p className="mt-2 text-sm text-muted">Shipping is calculated from the admin-managed zone for {form.state}.</p>
                <p className="mt-4 font-display text-2xl font-semibold">{formatNaira(totals.shipping)}</p>
              </div>
              <Input label="Coupon code" value={discountCode} onChange={(event) => setDiscountCode(event.target.value.toUpperCase())} placeholder="WELCOME10" />
            </div>
          ) : null}
          {step === 3 ? (
            <div className="grid gap-4">
              <div className="overflow-hidden rounded-lg border border-line bg-white">
                <div className="flex items-start gap-4 bg-ink p-5 text-white">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white text-accent">
                    <MessageCircle size={22} />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-semibold">Complete on WhatsApp</h2>
                    <p className="mt-2 text-sm text-white/75">Tap the button below and your order details, including product image URLs, will open in a ready-to-send WhatsApp message.</p>
                  </div>
                </div>
                <div className="grid gap-3 p-5 text-sm text-muted sm:grid-cols-2">
                  <div className="flex gap-3">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-accent" />
                    <span>Your order is saved for the GODID team before WhatsApp opens.</span>
                  </div>
                  <div className="flex gap-3">
                    <ShieldCheck size={18} className="mt-0.5 shrink-0 text-accent" />
                    <span>No payment gateway is used here. Payment and delivery are confirmed directly at {WHATSAPP_DISPLAY_NUMBER}.</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {error ? <p className="mt-5 text-sm font-semibold text-clay">{error}</p> : null}
          <div className="mt-8 flex justify-between">
            <Button variant="secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
            <Button onClick={next}>{step === 3 ? <><MessageCircle size={18} /> Send To WhatsApp</> : <>Continue <ArrowRight size={18} /></>}</Button>
          </div>
        </section>
        <aside className="h-fit rounded-lg border border-line bg-white p-5 shadow-soft">
          <h2 className="font-display text-2xl font-semibold">Summary</h2>
          <div className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatNaira(totals.subtotal)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>-{formatNaira(totals.discount)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{formatNaira(totals.shipping)}</span></div>
            <div className="border-t border-line pt-4 flex justify-between text-base font-semibold"><span>Total</span><span>{formatNaira(totals.total)}</span></div>
          </div>
        </aside>
      </div>
    </main>
  );
};
