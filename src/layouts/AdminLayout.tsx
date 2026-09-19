'use client'
import { BarChart3, Boxes, Gift, Home, LayoutDashboard, LogOut, Menu, Package, Settings, ShoppingCart, Tags, Truck, Users, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { BrandLogo } from "../components/brand/BrandLogo";
import { useAuth } from "../state/AuthContext";

const nav = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Inventory", to: "/admin/inventory", icon: Boxes },
  { label: "Orders", to: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Collections", to: "/admin/collections", icon: Gift },
  { label: "Categories", to: "/admin/categories", icon: Tags },
  { label: "Discounts", to: "/admin/discounts", icon: BarChart3 },
  { label: "Content", to: "/admin/content", icon: Home },
  { label: "Shipping", to: "/admin/shipping", icon: Truck },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

interface NavLinkProps {
  to: string;
  end?: boolean;
  onClick?: () => void;
  className: (opts: { isActive: boolean }) => string;
  children: React.ReactNode;
}

const NavLinkItem = ({ to, end, onClick, className, children }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = end ? pathname === to : pathname.startsWith(to);
  return (
    <Link href={to} onClick={onClick} className={className({ isActive })}>
      {children}
    </Link>
  );
};

interface Props { children: React.ReactNode }

export const AdminLayout = ({ children }: Props) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const signOut = () => {
    setMenuOpen(false);
    logout();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#f6f7f8] text-ink lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden border-r border-line bg-white lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="border-b border-line p-5">
            <BrandLogo to="/" size="md" variant="admin" />
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Admin Console</p>
          </div>
          <nav className="admin-scrollbar flex-1 overflow-y-auto p-3">
            {nav.map(({ label, to, icon: Icon }) => (
              <NavLinkItem key={to} end={to === "/admin"} to={to} className={({ isActive }) => `mb-1 flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-ink text-white" : "text-muted hover:bg-bone hover:text-ink"}`}>
                <Icon size={18} /> {label}
              </NavLinkItem>
            ))}
          </nav>
          <div className="border-t border-line p-4">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-muted">{user?.email}</p>
            <button className="mt-4 flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink" onClick={signOut}><LogOut size={16} /> Logout</button>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5">
            <BrandLogo to="/" size="sm" variant="admin" />
            <button type="button" className="focus-ring grid h-11 w-11 shrink-0 place-items-center border border-line" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close admin menu" : "Open admin menu"} aria-expanded={menuOpen} aria-controls="admin-mobile-nav">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
          </div>
          {menuOpen ? <div id="admin-mobile-nav" className="admin-scrollbar max-h-[calc(100dvh-70px)] overflow-y-auto border-t border-line px-4 py-4">
            <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {nav.map(({ label, to, icon: Icon }) => (
                <NavLinkItem key={to} end={to === "/admin"} to={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex min-h-11 min-w-0 items-center gap-2 border px-3 py-2 text-sm font-semibold transition ${isActive ? "border-ink bg-ink text-white" : "border-line bg-porcelain text-ink hover:border-ink"}`}>
                  <Icon size={17} className="shrink-0" /> <span className="truncate">{label}</span>
                </NavLinkItem>
              ))}
            </nav>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
              <Link href="/" onClick={() => setMenuOpen(false)} className="inline-flex min-h-11 items-center gap-2 border border-line px-4 text-sm font-semibold"><Home size={16} /> View store</Link>
              <button type="button" className="inline-flex min-h-11 items-center gap-2 border border-line px-4 text-sm font-semibold" onClick={signOut}><LogOut size={16} /> Logout</button>
            </div>
          </div> : null}
        </div>
        <header className="border-b border-line bg-[#f6f7f8]/90 px-4 py-4 backdrop-blur lg:sticky lg:top-0 lg:z-30 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted sm:text-xs sm:tracking-[0.14em]">Nigeria commerce operations</p><h1 className="font-display text-xl font-semibold sm:text-2xl">Admin Dashboard</h1></div>
            <a href="/" className="hidden border border-line bg-white px-4 py-2 text-sm font-semibold sm:inline-flex">View Store</a>
          </div>
        </header>
        <main className="min-w-0 p-4 sm:p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
