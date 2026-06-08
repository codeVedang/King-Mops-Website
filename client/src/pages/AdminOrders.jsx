import { Download, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api.js';
import { compactAddress, csvEscape, formatDate, formatINR, orderStatuses } from '../lib/format.js';
import { downloadInvoicePdf } from '../lib/invoice.js';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ status: 'All', search: '', from: '', to: '' });

  const query = useMemo(() => {
    const values = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'All') values.set(key, value);
    });
    return values.toString();
  }, [filters]);

  useEffect(() => {
    apiFetch(`/admin/orders?${query}`).then((data) => setOrders(data.orders));
  }, [query]);

  const exportCsv = () => {
    const header = [
      'Order ID',
      'Date',
      'Customer',
      'Phone',
      'Address',
      'Total',
      'Payment Method',
      'Payment Status',
      'Razorpay Payment ID',
      'Order Status'
    ];
    const lines = orders.map((order) =>
      [
        order.id,
        formatDate(order.createdAt),
        order.customerName,
        order.phone,
        compactAddress(order.address),
        order.totalAmountPaise / 100,
        order.paymentMethod,
        order.paymentStatus,
        order.razorpayPaymentId,
        order.orderStatus
      ]
        .map(csvEscape)
        .join(',')
    );
    const blob = new Blob([[header.map(csvEscape).join(','), ...lines].join('\n')], {
      type: 'text/csv;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kingmops-orders.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Order Management</p>
          <h1>Orders</h1>
        </div>
        <button type="button" className="secondary-button" onClick={exportCsv}>
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="admin-filters">
        <label className="search-field">
          <Search size={18} />
          <input
            value={filters.search}
            placeholder="Order ID or phone"
            onChange={(event) => setFilters({ ...filters, search: event.target.value })}
          />
        </label>
        <select
          value={filters.status}
          onChange={(event) => setFilters({ ...filters, status: event.target.value })}
        >
          <option>All</option>
          {orderStatuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
        <input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
      </div>

      <section className="admin-panel">
        <div className="data-table orders-table">
          <div className="table-head">
            <span>Order</span>
            <span>Customer</span>
            <span>Phone</span>
            <span>Status</span>
            <span>Total</span>
          </div>
          {orders.map((order) => (
            <Link className="table-row" to={`/admin/orders/${order.id}`} key={order.id}>
              <span>
                <strong>{order.id}</strong>
                <small>{formatDate(order.createdAt)}</small>
              </span>
              <span>{order.customerName}</span>
              <span>{order.phone}</span>
              <span>{order.orderStatus}</span>
              <span>{formatINR(order.totalAmountPaise)}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export const AdminOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [invoiceBusy, setInvoiceBusy] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');

  useEffect(() => {
    apiFetch(`/admin/orders/${id}`).then((data) => {
      setOrder(data.order);
      setStatus(data.order.orderStatus);
    });
  }, [id]);

  const saveStatus = async () => {
    const data = await apiFetch(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ orderStatus: status })
    });
    setOrder(data.order);
  };

  const downloadInvoice = async () => {
    setInvoiceError('');
    setInvoiceBusy(true);
    try {
      await downloadInvoicePdf(order);
    } catch (err) {
      setInvoiceError(err.message || 'Unable to download invoice.');
    } finally {
      setInvoiceBusy(false);
    }
  };

  if (!order) return <div className="page-loading">Loading order...</div>;

  return (
    <div className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Order Detail</p>
          <h1>{order.id}</h1>
        </div>
        <div className="admin-detail-actions">
          <button className="secondary-button" type="button" onClick={downloadInvoice} disabled={invoiceBusy}>
            <Download size={18} />
            {invoiceBusy ? 'Preparing...' : 'Download Invoice'}
          </button>
          <div className="status-editor">
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {orderStatuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <button className="primary-button" type="button" onClick={saveStatus}>
              Update Status
            </button>
          </div>
        </div>
      </div>
      {invoiceError && <p className="form-error">{invoiceError}</p>}

      <div className="order-detail-grid">
        <section className="admin-panel">
          <h2>Customer and Payment</h2>
          <div className="detail-list">
            <span>Name</span>
            <strong>{order.customerName}</strong>
            <span>Mobile</span>
            <strong>{order.phone}</strong>
            <span>Flat / House No.</span>
            <strong>{order.address?.flat || '-'}</strong>
            <span>Street</span>
            <strong>{order.address?.street || '-'}</strong>
            <span>Area</span>
            <strong>{order.address?.area || '-'}</strong>
            <span>City</span>
            <strong>{order.address?.city || '-'}</strong>
            <span>State</span>
            <strong>{order.address?.state || '-'}</strong>
            <span>PIN Code</span>
            <strong>{order.address?.pinCode || '-'}</strong>
            <span>Payment Method</span>
            <strong>{order.paymentMethod}</strong>
            <span>Payment Status</span>
            <strong>{order.paymentStatus}</strong>
            <span>Razorpay Payment ID</span>
            <strong>{order.razorpayPaymentId || '-'}</strong>
          </div>
        </section>
        <section className="admin-panel">
          <h2>Products Ordered</h2>
          {order.items.map((item) => (
            <div className="mini-line" key={item.productId}>
              <span>
                {item.name} x {item.quantity}
              </span>
              <strong>{formatINR(item.pricePaise * item.quantity)}</strong>
            </div>
          ))}
          <div className="mini-line total-line">
            <span>Total</span>
            <strong>{formatINR(order.totalAmountPaise)}</strong>
          </div>
        </section>
      </div>
    </div>
  );
};
