import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OrderSummary } from '../components/OrderSummary.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatINR } from '../lib/format.js';

export const Cart = () => {
  const { items, setQuantity, removeItem } = useCart();

  return (
    <section className="page-wrap two-column-page">
      <div>
        <div className="page-title">
          <p className="eyebrow">Cart</p>
          <h1>Your cleaning kit</h1>
        </div>
        {items.length === 0 ? (
          <div className="empty-state">
            <h2>Your cart is empty</h2>
            <Link className="primary-button" to="/shop">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-list">
            {items.map((item) => (
              <article className="cart-item" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div>
                  <h2>{item.name}</h2>
                  <p>{item.category}</p>
                  <strong>{formatINR(item.pricePaise)}</strong>
                </div>
                <div className="quantity-stepper">
                  <button type="button" onClick={() => setQuantity(item.id, item.quantity - 1)}>
                    <Minus size={16} />
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => setQuantity(item.id, item.quantity + 1)}>
                    <Plus size={16} />
                  </button>
                </div>
                <button type="button" className="icon-button" onClick={() => removeItem(item.id)}>
                  <Trash2 size={18} />
                </button>
              </article>
            ))}
            <Link className="inline-link" to="/shop">
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
      <OrderSummary showCheckoutLink={items.length > 0} />
    </section>
  );
};
