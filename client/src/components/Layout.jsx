import { LogOut, Menu, PackageSearch, ShoppingBag, User, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/shop?category=Mops', label: 'Mops' },
  { to: '/shop?category=Wipers', label: 'Wipers' },
  { to: '/shop?category=Cleaning%20Products', label: 'Cleaning Products' }
];

export const Layout = () => {
  const [open, setOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const { summary } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand-mark" to="/" onClick={() => setOpen(false)}>
          <span>King</span>
          <strong>Brand Mops</strong>
        </Link>

        <nav className={`primary-nav ${open ? 'is-open' : ''}`}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <Link className="icon-button" to="/shop" aria-label="Search products">
            <PackageSearch size={20} />
          </Link>
          <Link className="icon-button cart-button" to="/cart" aria-label="Cart">
            <ShoppingBag size={20} />
            {summary.count > 0 && <span>{summary.count}</span>}
          </Link>
          {user ? (
            <div className="account-chip">
              <Link to="/account" aria-label="My account">
                <User size={18} />
                <span>{profile?.name || user.displayName || 'Account'}</span>
              </Link>
              <button type="button" className="icon-button" onClick={handleLogout} aria-label="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link className="text-button" to="/login">
              Login
            </Link>
          )}
          <button
            type="button"
            className="icon-button menu-toggle"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div>
          <h2>King Brand Mops</h2>
          <p>Sri Tirumala Products, Hyderabad, India.</p>
        </div>
        <div>
          <strong>Contact</strong>
          <p>support@kingbrandmops.in</p>
          <p>+91 98765 43210</p>
        </div>
        <div>
          <strong>Social</strong>
          <p>Instagram / Facebook / WhatsApp</p>
        </div>
      </footer>
    </div>
  );
};
