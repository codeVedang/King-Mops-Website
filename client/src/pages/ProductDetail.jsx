import { ShoppingCart, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard.jsx';
import { useCart } from '../context/CartContext.jsx';
import { apiFetch } from '../lib/api.js';
import { formatINR } from '../lib/format.js';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    apiFetch(`/products/${id}`).then((data) => {
      setProduct(data.product);
      setRelated(data.related);
      setActiveImage(data.product.images?.[0] || '');
    });
  }, [id]);

  if (!product) return <div className="page-loading">Loading product...</div>;

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/checkout');
  };

  return (
    <section className="page-wrap">
      <div className="product-detail">
        <div className="product-gallery">
          <img className="main-product-image" src={activeImage} alt={product.name} />
          <div className="thumb-row">
            {product.images?.map((image) => (
              <button key={image} type="button" onClick={() => setActiveImage(image)}>
                <img src={image} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="product-info-panel">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="price-row detail-price">
            <strong>{formatINR(product.pricePaise)}</strong>
            {product.mrpPaise > product.pricePaise && <s>{formatINR(product.mrpPaise)}</s>}
          </div>
          <label className="quantity-control">
            Quantity
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
            />
          </label>
          <div className="button-row">
            <button type="button" className="primary-button" onClick={() => addItem(product, quantity)}>
              <ShoppingCart size={18} />
              Add to Cart
            </button>
            <button type="button" className="secondary-button" onClick={handleBuyNow}>
              <Zap size={18} />
              Buy Now
            </button>
          </div>
          <div className="spec-panel">
            <h2>Key Features</h2>
            <ul>
              {(product.specs || []).map((spec) => (
                <li key={spec}>{spec}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <p className="eyebrow">Related</p>
          <h2>More from {product.category}</h2>
        </div>
        <Link className="inline-link" to={`/shop?category=${encodeURIComponent(product.category)}`}>
          View category
        </Link>
      </div>
      <div className="product-grid">
        {related.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
};
