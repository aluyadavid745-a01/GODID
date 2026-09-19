'use client'
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../../state/CartContext";
import { useSiteConfig } from "../../hooks/useSiteConfig";
import { BrandLogo } from "../brand/BrandLogo";
import { Button } from "../ui/Button";

const links = [
  { label: "Shop", to: "/shop" },
  { label: "Collections", to: "/collections/summer-2026" },
  { label: "Lookbook", to: "/#lookbook" },
  { label: "Story", to: "/#story" },
];

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === to || (to !== "/" && pathname.startsWith(to));
  return (
    <Link href={to} className={`border-b-2 py-2 transition ${isActive ? "border-accent text-ink" : "border-transparent text-ink hover:border-accent"}`}>
      {children}
    </Link>
  );
};

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { openCart, count } = useCart();
  const { navLogo } = useSiteConfig();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="bg-ink text-white">
        <div className="mx-auto flex min-h-8 max-w-7xl items-center justify-center px-4 text-center text-[10px] font-semibold uppercase tracking-[0.18em] sm:justify-between lg:px-8">
          <span>Made For The Culture</span>
          <Link href="/shipping" className="hidden text-white/75 transition hover:text-white sm:inline">Delivery nationwide across Nigeria <span aria-hidden="true" className="ml-1 text-accent">↗</span></Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <BrandLogo to="/" size="sm" navLogoUrl={navLogo} />
        <nav className="hidden items-center gap-8 text-xs font-bold uppercase tracking-[0.15em] lg:flex">
          {links.map((link) => <NavLink key={link.to} to={link.to}>{link.label}</NavLink>)}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" to="/search" className="hidden h-10 min-h-10 px-3 lg:inline-flex" aria-label="Search"><Search size={18} /></Button>
          <Button variant="ghost" to="/account" className="hidden h-10 min-h-10 px-3 lg:inline-flex" aria-label="Account"><User size={18} /></Button>
          <button className="focus-ring relative grid h-10 w-10 place-items-center" onClick={openCart} aria-label="Open cart">
            <ShoppingBag size={20} />
            {count ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center bg-accent px-1 text-[11px] font-bold text-white">{count}</span> : null}
          </button>
          <button className="focus-ring grid h-10 w-10 place-items-center lg:hidden" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-line bg-white px-4 py-4 lg:hidden">
          <div className="mx-auto grid max-w-7xl divide-y divide-line">
            {links.map((link) => <Link key={link.to} href={link.to} onClick={() => setOpen(false)} className="flex items-center justify-between py-3 font-display text-lg font-semibold">{link.label}<span className="text-accent">↗</span></Link>)}
            <Link href="/search" onClick={() => setOpen(false)} className="flex items-center justify-between py-3 font-display text-lg font-semibold">Search<span className="text-accent">↗</span></Link>
            <Link href="/account" onClick={() => setOpen(false)} className="flex items-center justify-between py-3 font-display text-lg font-semibold">Account<span className="text-accent">↗</span></Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
};
