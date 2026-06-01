import { BarChart3, IndianRupee, PackageCheck, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { apiFetch } from '../lib/api.js';
import { formatINR } from '../lib/format.js';

const statusColors = ['#0f766e', '#2563eb', '#f59e0b', '#16a34a', '#dc2626'];
const categoryColors = ['#0f766e', '#f6b73c', '#2563eb', '#16a34a', '#dc2626'];

const currencyTooltip = (value) => formatINR(Number(value || 0) * 100);

export const AdminAnalytics = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    apiFetch('/admin/metrics').then((data) => setMetrics(data.metrics));
  }, []);

  if (!metrics) return <div className="page-loading">Loading analytics...</div>;

  const revenueSeries = metrics.revenueSeries || [];
  const statusBreakdown = metrics.statusBreakdown || [];
  const categorySales = metrics.categorySales || [];
  const topProducts = metrics.topProducts || [];

  const analyticsCards = [
    {
      label: 'Monthly Revenue',
      value: formatINR(metrics.revenueThisMonthPaise),
      detail: 'Paid orders this month',
      icon: IndianRupee
    },
    {
      label: 'Average Order Value',
      value: formatINR(metrics.averageOrderValuePaise),
      detail: 'Across paid orders',
      icon: BarChart3
    },
    {
      label: 'Paid Orders',
      value: metrics.paidOrders,
      detail: `${metrics.totalOrders} total orders`,
      icon: ShoppingBag
    },
    {
      label: 'Pending Orders',
      value: metrics.pendingOrders,
      detail: 'Needs admin action',
      icon: PackageCheck
    }
  ];

  return (
    <div className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>Analytics</h1>
        </div>
      </div>

      <div className="metric-grid">
        {analyticsCards.map((card) => {
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

      <div className="admin-grid">
        <section className="admin-panel">
          <h2>Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip formatter={currencyTooltip} />
              <Bar dataKey="revenue" fill="#0f766e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="admin-panel">
          <h2>Order Status Split</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusBreakdown} dataKey="count" nameKey="status" outerRadius={90} label>
                {statusBreakdown.map((entry, index) => (
                  <Cell key={entry.status} fill={statusColors[index % statusColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>

      <div className="admin-grid">
        <section className="admin-panel">
          <h2>Category Sales</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categorySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip formatter={currencyTooltip} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {categorySales.map((entry, index) => (
                  <Cell key={entry.category} fill={categoryColors[index % categoryColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="admin-panel">
          <h2>Top Products</h2>
          <div className="data-table analytics-table">
            <div className="table-head">
              <span>Product</span>
              <span>Qty</span>
              <span>Revenue</span>
            </div>
            {topProducts.length === 0 ? (
              <p>No paid product sales yet.</p>
            ) : (
              topProducts.map((product) => (
                <div className="table-row" key={product.name}>
                  <span>{product.name}</span>
                  <span>{product.quantity}</span>
                  <span>{formatINR(product.revenuePaise)}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
