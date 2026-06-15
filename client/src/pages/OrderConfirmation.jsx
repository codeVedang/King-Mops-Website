import { ArrowRight, CalendarDays, CheckCircle2, MapPin, Phone, ReceiptText, ShoppingBag, Truck } from 'lucide-react';
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
      <div className="confirmation-hero">
        <span className="confirmation-icon">
          <CheckCircle2 size={44} />
        </span>
        <p className="eyebrow">Order Confirmed</p>
        <h1>{order.id}</h1>
        <p>
          Thank you, {order.customerName || 'customer'}. Your payment is confirmed and your
          order details have been saved.
        </p>
        <div className="confirmation-meta">
          <span>
            <Truck size={18} />
            Estimated delivery: {getEstimatedDelivery(order.createdAt)}
          </span>
          <span>
            <CalendarDays size={18} />
            Paid on {formatDate(order.createdAt)}
          </span>
        </div>
      </div>

      <div className="order-detail-grid confirmation-grid">
        <div className="confirmation-card">
          <h2>
            <ShoppingBag size={22} />
            Items Ordered
          </h2>
          {order.items.map((item) => (
            <div className="mini-line" key={item.productId}>
              <span>
                {item.name} x {item.quantity}
              </span>
              <strong>{formatINR(item.pricePaise * item.quantity)}</strong>
            </div>
          ))}
          <div className="mini-line">
            <span>Subtotal</span>
            <strong>{formatINR(order.subtotalPaise)}</strong>
          </div>
          <div className="mini-line">
            <span>Taxes</span>
            <strong>{formatINR(order.gstPaise)}</strong>
          </div>
          <div className="mini-line">
            <span>Delivery</span>
            <strong>{order.deliveryPaise ? formatINR(order.deliveryPaise) : 'Free'}</strong>
          </div>
          <div className="mini-line total-line">
            <span>Total Paid</span>
            <strong>{formatINR(order.totalAmountPaise)}</strong>
          </div>
        </div>
        <div className="confirmation-card">
          <h2>
            <MapPin size={22} />
            Delivery Address
          </h2>
          <p>{compactAddress(order.address)}</p>
          <p className="confirmation-contact">
            <Phone size={18} />
            {order.phone}
          </p>
          <div className="confirmation-receipt">
            <ReceiptText size={20} />
            <span>Payment ID</span>
            <strong>{order.razorpayPaymentId || 'Recorded after payment'}</strong>
          </div>
        </div>
      </div>
      <div className="confirmation-actions">
        <Link className="primary-button" to="/shop">
          Continue Shopping
          <ArrowRight size={18} />
        </Link>
        <Link className="secondary-button" to="/account">
          View My Orders
        </Link>
      </div>
    </section>
  );
};
