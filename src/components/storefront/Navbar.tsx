import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../../state/CartContext";
import { BrandLogo } from "../brand/BrandLogo";
import { Button } from "../ui/Button";

const links = [
  { label: "Shop", to: "/shop" },
  { label: "Collections", to: "/collections/summer-2026" },
  { label: "Lookbook", to: "/#lookbook" },
  { label: "Story", to: "/#story" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { openCart, count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-porcelain/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <BrandLogo to="/" size="sm" />
        <nav className="hidden items-center gap-8 text-sm font-semibold uppercase tracking-[0.14em] lg:flex">
          {links.map((link) => <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive ? "text-palm" : "text-ink hover:text-palm"}>{link.label}</NavLink>)}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" to="/search" className="hidden h-10 min-h-10 px-3 lg:inline-flex" aria-label="Search"><Search size={18} /></Button>
          <Button variant="ghost" to="/account" className="hidden h-10 min-h-10 px-3 lg:inline-flex" aria-label="Account"><User size={18} /></Button>
          <button className="focus-ring relative grid h-10 w-10 place-items-center" onClick={openCart} aria-label="Open cart">
            <ShoppingBag size={20} />
            {count ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center bg-ink px-1 text-[11px] font-bold text-white">{count}</span> : null}
          </button>
          <button className="focus-ring grid h-10 w-10 place-items-center lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-line bg-porcelain px-4 py-5 lg:hidden">
          <div className="grid gap-4">
            {links.map((link) => <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="font-display text-2xl font-semibold">{link.label}</Link>)}
            <Link to="/account" onClick={() => setOpen(false)} className="font-display text-2xl font-semibold">Account</Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
};
