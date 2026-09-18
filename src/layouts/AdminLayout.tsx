import { BarChart3, Boxes, Gift, Home, LayoutDashboard, LogOut, Package, Settings, ShoppingCart, Tags, Truck, Users } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
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

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#f6f7f8] text-ink lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden border-r border-line bg-white lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="border-b border-line p-5">
            <BrandLogo to="/" size="md" />
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Admin Console</p>
          </div>
          <nav className="admin-scrollbar flex-1 overflow-y-auto p-3">
            {nav.map(({ label, to, icon: Icon }) => (
              <NavLink key={to} end={to === "/admin"} to={to} className={({ isActive }) => `mb-1 flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-ink text-white" : "text-muted hover:bg-bone hover:text-ink"}`}>
                <Icon size={18} /> {label}
              </NavLink>
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
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <BrandLogo to="/" size="sm" />
            <div className="flex items-center gap-2">
              <a href="/" className="border border-line px-3 py-2 text-xs font-bold uppercase tracking-[0.08em]">Store</a>
              <button className="border border-line px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-muted" onClick={signOut}>Logout</button>
            </div>
          </div>
          <nav className="admin-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
            {nav.map(({ label, to, icon: Icon }) => (
              <NavLink key={to} end={to === "/admin"} to={to} className={({ isActive }) => `flex shrink-0 items-center gap-2 border px-3 py-2 text-xs font-bold transition ${isActive ? "border-ink bg-ink text-white" : "border-line bg-porcelain text-muted"}`}>
                <Icon size={15} /> {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <header className="border-b border-line bg-[#f6f7f8]/90 px-4 py-4 backdrop-blur lg:sticky lg:top-0 lg:z-30 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted sm:text-xs sm:tracking-[0.14em]">Nigeria commerce operations</p><h1 className="font-display text-xl font-semibold sm:text-2xl">Admin Dashboard</h1></div>
            <a href="/" className="hidden border border-line bg-white px-4 py-2 text-sm font-semibold sm:inline-flex">View Store</a>
          </div>
        </header>
        <main className="min-w-0 p-4 sm:p-5 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
};
