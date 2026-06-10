import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatINR } from '../lib/format.js';

export const OrderSummary = ({ action, showCheckoutLink = false, summaryOverride = null }) => {
  const { summary: cartSummary } = useCart();
  const summary = summaryOverride || cartSummary;

  return (
    <aside className="summary-panel">
      <h2>Order Summary</h2>
      <dl>
        <div>
          <dt>Subtotal</dt>
          <dd>{formatINR(summary.subtotalPaise)}</dd>
        </div>
        <div>
          <dt>GST</dt>
          <dd>{formatINR(summary.gstPaise)}</dd>
        </div>
        <div>
          <dt>Delivery</dt>
          <dd>{summary.deliveryPaise ? formatINR(summary.deliveryPaise) : 'Free'}</dd>
        </div>
        <div className="grand-total">
          <dt>Total</dt>
          <dd>{formatINR(summary.totalPaise)}</dd>
        </div>
      </dl>
      {action}
      {showCheckoutLink && (
        <Link className="primary-button full-width" to="/checkout">
          Proceed to Checkout
        </Link>
      )}
    </aside>
  );
};
