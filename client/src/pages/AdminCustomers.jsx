import { Search, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api.js';
import { compactAddress, formatDate, formatINR } from '../lib/format.js';

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch('/admin/customers').then((data) => setCustomers(data.customers));
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return customers.filter((customer) =>
      `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase().includes(term)
    );
  }, [customers, search]);

  return (
    <div className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Customer Management</p>
          <h1>Customers</h1>
        </div>
      </div>
      <section className="admin-panel">
        <label className="search-field">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customers" />
        </label>
        <div className="data-table customer-table">
          <div className="table-head">
            <span>Name</span>
            <span>Email</span>
            <span>Phone</span>
            <span>Registered</span>
          </div>
          {filtered.map((customer) => (
            <Link className="table-row" to={`/admin/customers/${customer.uid}`} key={customer.uid}>
              <span>
                <UserRound size={16} />
                {customer.name}
              </span>
              <span>{customer.email}</span>
              <span>{customer.phone}</span>
              <span>{formatDate(customer.createdAt)}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export const AdminCustomerDetail = () => {
  const { uid } = useParams();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    apiFetch(`/admin/customers/${uid}`).then((data) => setCustomer(data.customer));
  }, [uid]);

  if (!customer) return <div className="page-loading">Loading customer...</div>;

  return (
    <div className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Customer Detail</p>
          <h1>{customer.name}</h1>
        </div>
      </div>
      <div className="order-detail-grid">
        <section className="admin-panel">
          <h2>Profile</h2>
          <p>{customer.email}</p>
          <p>{customer.phone}</p>
          <p>Registered {formatDate(customer.createdAt)}</p>
          {(customer.addresses || []).map((address) => (
            <div className="address-row" key={address.id}>
              <strong>{address.fullName}</strong>
              <p>{compactAddress(address)}</p>
              <small>{address.phone}</small>
            </div>
          ))}
        </section>
        <section className="admin-panel">
          <h2>Order History</h2>
          {customer.orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            customer.orders.map((order) => (
              <Link className="order-row" to={`/admin/orders/${order.id}`} key={order.id}>
                <span>
                  <strong>{order.id}</strong>
                  <small>{formatDate(order.createdAt)}</small>
                </span>
                <span>{order.orderStatus}</span>
                <strong>{formatINR(order.totalAmountPaise)}</strong>
              </Link>
            ))
          )}
        </section>
      </div>
    </div>
  );
};
