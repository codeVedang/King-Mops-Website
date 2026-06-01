import { ArrowRight, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard.jsx';
import { apiFetch } from '../lib/api.js';
import { categories } from '../lib/format.js';

export const Home = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    apiFetch('/products?featured=true&pageSize=4')
      .then((data) => setFeatured(data.products))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <>
      <section className="hero-section">
        <div className="hero-overlay">
          <p className="eyebrow">Sri Tirumala Products</p>
          <h1>King Brand Mops</h1>
          <p>
            Durable mops, wipers, and cleaning essentials for Indian homes, apartments, shops,
            and everyday heavy-use cleaning.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/shop">
              Shop Products
              <ArrowRight size={18} />
            </Link>
            <Link className="secondary-button" to="/shop?category=Mops">
              View Mops
            </Link>
          </div>
        </div>
      </section>

      <section className="feature-strip">
        <div>
          <Truck size={22} />
          <span>Fast Hyderabad dispatch</span>
        </div>
        <div>
          <ShieldCheck size={22} />
          <span>Secure Razorpay checkout</span>
        </div>
        <div>
          <Sparkles size={22} />
          <span>Quality microfiber cleaning</span>
        </div>
      </section>

      <section className="section-wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Featured Products</p>
            <h2>Best-selling cleaning essentials</h2>
          </div>
          <Link to="/shop" className="inline-link">
            View all
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section-wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Categories</p>
            <h2>Quick shop by need</h2>
          </div>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <Link
              key={category}
              to={`/shop?category=${encodeURIComponent(category)}`}
              className="category-tile"
            >
              <span>{category}</span>
              <ArrowRight size={18} />
            </Link>
          ))}
        </div>
      </section>

      <section className="promo-band">
        <div>
          <p className="eyebrow">Combo Offer</p>
          <h2>Save more on complete home cleaning kits</h2>
          <p>Bundle mops, wipers, refills, and microfiber cloths in one order.</p>
        </div>
        <Link className="secondary-button" to="/shop?category=Cleaning%20Products">
          Explore Offers
        </Link>
      </section>
    </>
  );
};
