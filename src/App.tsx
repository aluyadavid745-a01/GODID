import { AnimatePresence, motion } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";
import { StorefrontLayout } from "./layouts/StorefrontLayout";
import { AccountDashboard, AccountLayout, AccountOrders, AddressesPage, WishlistPage } from "./pages/storefront/AccountPage";
import { LoginPage, RegisterPage } from "./pages/storefront/AuthPages";
import { CartPage } from "./pages/storefront/CartPage";
import { CheckoutPage } from "./pages/storefront/CheckoutPage";
import { CollectionPage } from "./pages/storefront/CollectionPage";
import { HomePage } from "./pages/storefront/HomePage";
import { OrderConfirmationPage } from "./pages/storefront/OrderConfirmationPage";
import { OrderTrackingPage } from "./pages/storefront/OrderTrackingPage";
import { ProductPage } from "./pages/storefront/ProductPage";
import { SearchPage } from "./pages/storefront/SearchPage";
import { ShopPage } from "./pages/storefront/ShopPage";
import { StaticPage } from "./pages/storefront/StaticPage";
import { AdminCategories, AdminCollections } from "./pages/admin/AdminCollectionsCategories";
import { AdminContent, AdminDiscounts, AdminSettings, AdminShipping } from "./pages/admin/AdminDiscountsContentSettings";
import { AdminCustomers } from "./pages/admin/AdminCustomers";
import { AdminInventory } from "./pages/admin/AdminInventory";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminOverview } from "./pages/admin/AdminOverview";
import { AdminProducts } from "./pages/admin/AdminProducts";

export const App = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
        <Routes location={location}>
          <Route element={<StorefrontLayout />}>
            <Route index element={<HomePage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="shop/:categorySlug" element={<ShopPage />} />
            <Route path="product/:slug" element={<ProductPage />} />
            <Route path="collection/:slug" element={<CollectionPage />} />
            <Route path="collections/:slug" element={<CollectionPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="track-order" element={<OrderTrackingPage />} />
            <Route path="order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute role="customer" />}>
              <Route path="account" element={<AccountLayout />}>
                <Route index element={<AccountDashboard />} />
                <Route path="orders" element={<AccountOrders />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="addresses" element={<AddressesPage />} />
              </Route>
            </Route>
            <Route path=":page" element={<StaticPage />} />
          </Route>

          <Route path="admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="collections" element={<AdminCollections />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="discounts" element={<AdminDiscounts />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="shipping" element={<AdminShipping />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};
