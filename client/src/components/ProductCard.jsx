import { ShoppingCart, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatINR } from '../lib/format.js';

export const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const discount =
    product.mrpPaise > product.pricePaise
      ? Math.round(((product.mrpPaise - product.pricePaise) / product.mrpPaise) * 100)
      : 0;

  const buyNow = () => {
    addItem(product);
    navigate('/checkout');
  };

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-image-link">
        <img src={product.images?.[0]} alt={product.name} loading="lazy" />
        <div className="product-card-badges">
          {product.isFeatured && <span className="badge">Best seller</span>}
          {discount > 0 && <span className="badge discount-badge">{discount}% off</span>}
        </div>
      </Link>
      <div className="product-card-body">
        <div className="product-card-kicker">
          <span>{product.category}</span>
          <small>Ready to ship</small>
        </div>
        <Link to={`/products/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>
        <p>{product.description}</p>
        <div className="price-row">
          <strong>{formatINR(product.pricePaise)}</strong>
          {product.mrpPaise > product.pricePaise && <s>{formatINR(product.mrpPaise)}</s>}
        </div>
        <div className="product-card-meta">
          <span>Easy checkout</span>
          <span>Quality pick</span>
        </div>
        <div className="product-card-actions">
          <button type="button" className="primary-button" onClick={() => addItem(product)}>
            <ShoppingCart size={18} />
            Add to Cart
          </button>
          <button type="button" className="secondary-button" onClick={buyNow}>
            <Zap size={18} />
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
};
