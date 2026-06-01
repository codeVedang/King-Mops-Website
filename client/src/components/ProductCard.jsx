import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatINR } from '../lib/format.js';

export const ProductCard = ({ product }) => {
  const { addItem } = useCart();

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-image-link">
        <img src={product.images?.[0]} alt={product.name} loading="lazy" />
        {product.isFeatured && <span className="badge">Best seller</span>}
      </Link>
      <div className="product-card-body">
        <span className="eyebrow">{product.category}</span>
        <Link to={`/products/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>
        <p>{product.description}</p>
        <div className="price-row">
          <strong>{formatINR(product.pricePaise)}</strong>
          {product.mrpPaise > product.pricePaise && <s>{formatINR(product.mrpPaise)}</s>}
        </div>
        <button type="button" className="primary-button full-width" onClick={() => addItem(product)}>
          <ShoppingCart size={18} />
          Add to Cart
        </button>
      </div>
    </article>
  );
};
