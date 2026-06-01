import { IndianRupee, Package, ShoppingBag, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api.js';
import { formatDate, formatINR } from '../lib/format.js';

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    apiFetch('/admin/metrics').then((data) => setMetrics(data.metrics));
  }, []);

  if (!metrics) return <div className="page-loading">Loading dashboard...</div>;

  const statCards = [
    { label: 'Total Orders', value: metrics.totalOrders, detail: `${metrics.totalOrdersToday} today`, icon: ShoppingBag },
    {
      label: 'Revenue',
      value: formatINR(metrics.revenueAllTimePaise),
      detail: `${formatINR(metrics.revenueThisMonthPaise)} this month`,
      icon: IndianRupee
    },
    { label: 'Customers', value: metrics.customers, detail: 'Registered customers', icon: UsersRound },
    { label: 'Products', value: metrics.products, detail: 'Catalog items', icon: Package }
  ];

  return (
    <div className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Admin Overview</p>
          <h1>Dashboard</h1>
        </div>
        <Link className="secondary-button" to="/admin/analytics">
          View Analytics
        </Link>
      </div>

      <div className="metric-grid">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <article className="metric-card" key={card.label}>
              <Icon size={22} />
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.detail}</small>
            </article>
          );
        })}
      </div>

      <section className="admin-panel">
        <h2>Recent Orders</h2>
        <div className="data-table">
          <div className="table-head">
            <span>Order</span>
            <span>Customer</span>
            <span>Status</span>
            <span>Total</span>
          </div>
          {metrics.recentOrders.map((order) => (
            <Link className="table-row" to={`/admin/orders/${order.id}`} key={order.id}>
              <span>
                <strong>{order.id}</strong>
                <small>{formatDate(order.createdAt)}</small>
              </span>
              <span>{order.customerName}</span>
              <span>{order.orderStatus}</span>
              <span>{formatINR(order.totalAmountPaise)}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
