import { Outlet } from "react-router-dom";
import { CartDrawer } from "../components/storefront/CartDrawer";
import { Footer } from "../components/storefront/Footer";
import { Navbar } from "../components/storefront/Navbar";

export const StorefrontLayout = () => (
  <div className="min-h-screen bg-bone text-ink">
    <Navbar />
    <Outlet />
    <Footer />
    <CartDrawer />
  </div>
);
