import {
  ArrowRight,
  CheckCircle2,
  Droplets,
  Home as HomeIcon,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Store,
  Truck
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard.jsx';
import { apiFetch } from '../lib/api.js';
import { categories } from '../lib/format.js';

const categoryTone = {
  Mops: 'home-category--mops',
  Wipers: 'home-category--wipers',
  'Cleaning Products': 'home-category--cleaning'
};

const solutionItems = [
  {
    title: 'Daily Floor Reset',
    text: 'Spin mops and refills for wet floors, dust, and fast everyday cleaning.',
    to: '/shop?category=Mops',
    icon: HomeIcon
  },
  {
    title: 'Glass and Bathroom Edges',
    text: 'Wipers built for tiles, mirrors, balconies, and hard-to-reach corners.',
    to: '/shop?category=Wipers',
    icon: Droplets
  },
  {
    title: 'Shop and Office Cleaning',
    text: 'Durable cleaning products for repeated use through the day.',
    to: '/shop?category=Cleaning%20Products',
    icon: Store
  }
];

export const Home = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      const featuredData = await apiFetch('/products?featured=true&pageSize=4');
      if (featuredData.products.length > 0) return featuredData.products;
      const latestData = await apiFetch('/products?pageSize=4');
      return latestData.products;
    };

    loadProducts()
      .then((products) => setFeatured(products))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <>
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">Sri Tirumala Products</p>
          <h1>Cleaning tools that keep up with real Indian homes</h1>
          <p>
            Shop mops, wipers, and cleaning products made for daily spills, monsoon floors,
            balconies, shops, and fast weekend deep-cleaning.
          </p>
          <div className="home-hero-actions">
            <Link className="primary-button" to="/shop">
              Shop Cleaning Range
              <ArrowRight size={18} />
            </Link>
            <Link className="secondary-button" to="/shop?category=Mops">
              Browse Mops
            </Link>
          </div>
          <div className="home-hero-meta">
            <span>GST-ready billing</span>
            <span>Razorpay secure checkout</span>
            <span>Fast order processing</span>
          </div>
        </div>
      </section>

      <section className="home-proof-strip">
        <div>
          <Truck size={22} />
          <span>Fast dispatch for online orders</span>
        </div>
        <div>
          <ShieldCheck size={22} />
          <span>Live Razorpay payment gateway</span>
        </div>
        <div>
          <Sparkles size={22} />
          <span>Made for repeated daily cleaning</span>
        </div>
      </section>

      <section className="section-wrap home-featured-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Store Picks</p>
            <h2>Cleaning essentials ready to order</h2>
          </div>
          <Link to="/shop" className="inline-link">
            View all
            <ArrowRight size={16} />
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="home-empty-products">
            <PackageCheck size={28} />
            <span>Products added by admin will appear here automatically.</span>
          </div>
        )}
      </section>

      <section className="section-wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Cleaning Moments</p>
            <h2>Choose what you need to clean today</h2>
          </div>
        </div>
        <div className="home-solution-grid">
          {solutionItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link className="home-solution-card" to={item.to} key={item.title}>
                <Icon size={24} />
                <strong>{item.title}</strong>
                <span>{item.text}</span>
                <CheckCircle2 size={18} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section-wrap home-category-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Categories</p>
            <h2>Shop by product type</h2>
          </div>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <Link
              key={category}
              to={`/shop?category=${encodeURIComponent(category)}`}
              className={`category-tile ${categoryTone[category] || ''}`}
            >
              <span>{category}</span>
              <ArrowRight size={18} />
            </Link>
          ))}
        </div>
      </section>

      <section className="home-care-band">
        <div>
          <p className="eyebrow">Complete Kit</p>
          <h2>Build one order for floors, glass, tiles, and corners</h2>
          <p>Mix mops, wipers, refills, and cleaning accessories from the same store.</p>
        </div>
        <Link className="secondary-button" to="/shop?category=Cleaning%20Products">
          Explore Cleaning Products
        </Link>
      </section>
    </>
  );
};
