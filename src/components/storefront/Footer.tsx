'use client'
import { Camera, Mail, MessageCircle, Music2 } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "../brand/BrandLogo";
import { buildWhatsAppUrl } from "../../utils/whatsapp";

const groups = {
  Shop: [{ label: "All products", to: "/shop" }, { label: "T-shirts", to: "/shop/t-shirts" }, { label: "Hoodies", to: "/shop/hoodies" }, { label: "Cart", to: "/cart" }],
  Company: [{ label: "Our story", to: "/about" }, { label: "Contact", to: "/contact" }, { label: "FAQs", to: "/faq" }],
  Support: [{ label: "Track order", to: "/track-order" }, { label: "Nationwide delivery", to: "/shipping" }, { label: "Returns", to: "/returns" }, { label: "Privacy", to: "/privacy-policy" }, { label: "Terms", to: "/terms" }],
};

const socialLinks = [
  { icon: Camera, href: process.env.NEXT_PUBLIC_INSTAGRAM_URL, label: "Instagram" },
  { icon: MessageCircle, href: buildWhatsAppUrl("Hello GODID, I want to make an enquiry."), label: "WhatsApp" },
  { icon: Music2, href: process.env.NEXT_PUBLIC_TIKTOK_URL, label: "TikTok" },
  { icon: Mail, href: "mailto:hello@godid.studio", label: "Email" },
];

export const Footer = () => (
  <footer className="border-t-4 border-accent bg-ink text-white">
    <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-[1.3fr_2fr] lg:px-8 lg:py-20">
      <div>
        <BrandLogo size="lg" />
        <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">God in Every Design. Purposeful clothing from an independent fashion studio, delivered nationwide across Nigeria.</p>
        <div className="mt-6 flex gap-3">
          {socialLinks.filter((link) => Boolean(link.href)).map(({ icon: Icon, href, label }) => <a key={label} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noreferrer" : undefined} className="grid h-10 w-10 place-items-center border border-white/20 transition hover:border-accent hover:bg-accent hover:text-white" href={href} aria-label={label}><Icon size={18} /></a>)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
        {Object.entries(groups).map(([label, links]) => (
          <div key={label}>
            <h3 className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">{label}</h3>
            <div className="grid gap-3.5">
              {links.map(({ label: linkLabel, to }) => <Link key={to} href={to} className="text-sm text-white/75 transition hover:text-white">{linkLabel}</Link>)}
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="border-t border-white/15">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-[11px] uppercase tracking-[0.14em] text-white/45 sm:flex-row sm:justify-between lg:px-8">
        <span>© {new Date().getFullYear()} GODID</span>
        <span>God in Every Design · Delivery nationwide</span>
      </div>
    </div>
  </footer>
);
