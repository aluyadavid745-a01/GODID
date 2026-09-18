import { Camera, Mail, MessageCircle, Music2 } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandLogo } from "../brand/BrandLogo";
import { buildWhatsAppUrl } from "../../utils/whatsapp";

const groups = {
  Shop: ["/shop", "/shop/t-shirts", "/shop/hoodies", "/cart"],
  Company: ["/about", "/contact", "/faq"],
  Support: ["/track-order", "/shipping", "/returns", "/privacy-policy", "/terms"],
};

const socialLinks = [
  { icon: Camera, href: import.meta.env.VITE_INSTAGRAM_URL, label: "Instagram" },
  { icon: MessageCircle, href: buildWhatsAppUrl("Hello GODID, I want to make an enquiry."), label: "WhatsApp" },
  { icon: Music2, href: import.meta.env.VITE_TIKTOK_URL, label: "TikTok" },
  { icon: Mail, href: "mailto:hello@godid.studio", label: "Email" },
];

export const Footer = () => (
  <footer className="border-t border-line bg-ink text-white">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.3fr_2fr] lg:px-8">
      <div>
        <BrandLogo size="lg" invert />
        <p className="mt-4 max-w-sm text-white/70">God in Every Design. Premium clothing designed and manufactured by an independent Nigerian fashion studio.</p>
        <div className="mt-6 flex gap-3">
          {socialLinks.filter((link) => Boolean(link.href)).map(({ icon: Icon, href, label }) => <a key={label} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noreferrer" : undefined} className="grid h-10 w-10 place-items-center rounded-lg border border-white/20 transition hover:bg-white hover:text-ink" href={href} aria-label={label}><Icon size={18} /></a>)}
        </div>
      </div>
      <div className="grid gap-8 sm:grid-cols-3">
        {Object.entries(groups).map(([label, links]) => (
          <div key={label}>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-white/50">{label}</h3>
            <div className="grid gap-3">
              {links.map((to) => <Link key={to} to={to} className="text-sm text-white/80 hover:text-white">{to.split("/").filter(Boolean).join(" ").replace(/-/g, " ") || "Home"}</Link>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  </footer>
);
