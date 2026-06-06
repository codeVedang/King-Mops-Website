import {
  BarChart3,
  Boxes,
  LogOut,
  LayoutDashboard,
  PackageCheck,
  ReceiptText,
  UsersRound
} from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BrandLogo } from './BrandLogo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: PackageCheck },
  { to: '/admin/products', label: 'Products', icon: Boxes },
  { to: '/admin/customers', label: 'Customers', icon: UsersRound },
  { to: '/admin/settings', label: 'GST / Delivery', icon: ReceiptText },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 }
];

export const AdminShell = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <section className="admin-only-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" to="/admin">
          <BrandLogo admin />
        </Link>
        <nav>
          {adminLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end}>
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="admin-user-panel">
          <div>
            <span>Signed in</span>
            <strong>{profile?.name || 'Admin'}</strong>
          </div>
          <button type="button" className="secondary-button full-width" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </section>
  );
};
