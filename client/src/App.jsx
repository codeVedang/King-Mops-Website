import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminShell } from './components/AdminShell.jsx';
import { AnalyticsTracker } from './components/AnalyticsTracker.jsx';
import { Layout } from './components/Layout.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { Account, AccountOrderDetail } from './pages/Account.jsx';
import { AdminAnalytics } from './pages/AdminAnalytics.jsx';
import { AdminCustomerDetail, AdminCustomers } from './pages/AdminCustomers.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { AdminLogin } from './pages/AdminLogin.jsx';
import { AdminOrderDetail, AdminOrders } from './pages/AdminOrders.jsx';
import { AdminProducts } from './pages/AdminProducts.jsx';
import { AdminSettings } from './pages/AdminSettings.jsx';
import { Cart } from './pages/Cart.jsx';
import { Checkout } from './pages/Checkout.jsx';
import { About } from './pages/About.jsx';
import { Contact } from './pages/Contact.jsx';
import { Home } from './pages/Home.jsx';
import { Login } from './pages/Login.jsx';
import { OrderConfirmation } from './pages/OrderConfirmation.jsx';
import { ProductDetail } from './pages/ProductDetail.jsx';
import { Shop } from './pages/Shop.jsx';
import { Terms } from './pages/Terms.jsx';

export const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <AnalyticsTracker />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="login" element={<Login />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="terms" element={<Terms />} />
            <Route path="order-confirmation/:id" element={<OrderConfirmation />} />

            <Route element={<ProtectedRoute />}>
              <Route path="account" element={<Account />} />
              <Route path="account/orders/:id" element={<AccountOrderDetail />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

          <Route path="admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute admin />}>
            <Route path="admin" element={<AdminShell />}>
              <Route index element={<AdminDashboard />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="customers/:uid" element={<AdminCustomerDetail />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);
