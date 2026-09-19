'use client'
import { CartDrawer } from "../components/storefront/CartDrawer";
import { Footer } from "../components/storefront/Footer";
import { Navbar } from "../components/storefront/Navbar";

interface Props { children: React.ReactNode }

export const StorefrontLayout = ({ children }: Props) => (
  <div className="min-h-screen bg-bone text-ink">
    <Navbar />
    {children}
    <Footer />
    <CartDrawer />
  </div>
);
