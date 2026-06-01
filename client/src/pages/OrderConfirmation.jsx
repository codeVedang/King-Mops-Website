import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api.js';
import { compactAddress, formatDate, formatINR, getEstimatedDelivery } from '../lib/format.js';

export const OrderConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);

  useEffect(() => {
    if (!order) {
      apiFetch(`/orders/${id}`).then((data) => setOrder(data.order));
    }
  }, [id, order]);

  if (!order) return <div className="page-loading">Loading order...</div>;

  return (
    <section className="page-wrap confirmation-page">
      <CheckCircle2 size={56} />
      <p className="eyebrow">Order Confirmed</p>
      <h1>{order.id}</h1>
      <p>Estimated delivery: {getEstimatedDelivery(order.createdAt)}</p>
      <div className="order-detail-grid">
        <div>
          <h2>Items Ordered</h2>
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
          <h2>Delivery Address</h2>
          <p>{compactAddress(order.address)}</p>
          <p>{order.phone}</p>
          <p>Paid on {formatDate(order.createdAt)}</p>
          <strong>{formatINR(order.totalAmountPaise)}</strong>
        </div>
      </div>
      <Link className="primary-button" to="/shop">
        Continue Shopping
        <ArrowRight size={18} />
      </Link>
    </section>
  );
};
