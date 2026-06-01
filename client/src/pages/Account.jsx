import { MapPin, PackageCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../lib/api.js';
import { compactAddress, formatDate, formatINR, validatePhone } from '../lib/format.js';

const emptyAddress = {
  fullName: '',
  phone: '',
  flat: '',
  street: '',
  area: '',
  city: '',
  state: '',
  pinCode: ''
};

export const Account = () => {
  const { profile, refreshProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [address, setAddress] = useState(emptyAddress);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/orders/my').then((data) => setOrders(data.orders));
  }, []);

  const update = (event) => setAddress({ ...address, [event.target.name]: event.target.value });

  const saveAddress = async (event) => {
    event.preventDefault();
    setError('');
    if (!validatePhone(address.phone)) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    await apiFetch('/auth/addresses', { method: 'POST', body: JSON.stringify(address) });
    await refreshProfile();
    setAddress(emptyAddress);
  };

  return (
    <section className="page-wrap">
      <div className="page-title">
        <p className="eyebrow">My Account</p>
        <h1>{profile?.name || 'Customer'}</h1>
      </div>

      <div className="account-grid">
        <div className="account-panel">
          <h2>
            <PackageCheck size={20} />
            Order History
          </h2>
          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            orders.map((order) => (
              <Link className="order-row" to={`/account/orders/${order.id}`} key={order.id}>
                <span>
                  <strong>{order.id}</strong>
                  <small>{formatDate(order.createdAt)}</small>
                </span>
                <span>{order.orderStatus}</span>
                <strong>{formatINR(order.totalAmountPaise)}</strong>
              </Link>
            ))
          )}
        </div>

        <div className="account-panel">
          <h2>
            <MapPin size={20} />
            Saved Addresses
          </h2>
          {(profile?.addresses || []).length === 0 ? (
            <p>No saved addresses.</p>
          ) : (
            profile.addresses.map((item) => (
              <div className="address-row" key={item.id}>
                <strong>{item.fullName}</strong>
                <p>{compactAddress(item)}</p>
                <small>{item.phone}</small>
              </div>
            ))
          )}
          <form className="form-grid compact-form" onSubmit={saveAddress}>
            {Object.keys(emptyAddress).map((field) => (
              <label key={field}>
                {field === 'pinCode' ? 'PIN Code' : field.replace(/([A-Z])/g, ' $1')}
                <input name={field} value={address[field]} onChange={update} required />
              </label>
            ))}
            {error && <p className="form-error full-span">{error}</p>}
            <button className="primary-button full-span" type="submit">
              Save Address
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export const AccountOrderDetail = () => {
  const [order, setOrder] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    apiFetch(`/orders/${id}`).then((data) => setOrder(data.order));
  }, [id]);

  if (!order) return <div className="page-loading">Loading order...</div>;

  return (
    <section className="page-wrap">
      <div className="page-title">
        <p className="eyebrow">Order Details</p>
        <h1>{order.id}</h1>
      </div>
      <div className="order-detail-grid">
        <div>
          <h2>Items</h2>
          {order.items.map((item) => (
            <div className="mini-line" key={item.productId}>
              <span>
                {item.name} x {item.quantity}
              </span>
              <strong>{formatINR(item.pricePaise * item.quantity)}</strong>
            </div>
          ))}
        </div>
        <div>
          <h2>Status</h2>
          <p>{order.orderStatus}</p>
          <p>{order.paymentStatus}</p>
          <p>{order.paymentMethod}</p>
          <strong>{formatINR(order.totalAmountPaise)}</strong>
          <h2>Address</h2>
          <p>{compactAddress(order.address)}</p>
        </div>
      </div>
    </section>
  );
};
