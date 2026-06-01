import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Droplet,
  Layers3,
  PackageCheck,
  ShieldCheck,
  Search,
  ShoppingCart,
  Store,
  Truck
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard.jsx';
import { useCart } from '../context/CartContext.jsx';
import { apiFetch } from '../lib/api.js';
import { categories, formatINR } from '../lib/format.js';

const categoryTone = {
  Mops: 'home-category--mops',
  Wipers: 'home-category--wipers',
  'Cleaning Products': 'home-category--cleaning'
};

const surfaceItems = [
  {
    title: 'Wet floors',
    text: 'Spin mops and refills for daily floor resets.',
    to: '/shop?category=Mops',
    icon: Droplet
  },
  {
    title: 'Bathroom edges',
    text: 'Wipers for tiles, mirrors, corners, and balconies.',
    to: '/shop?category=Wipers',
    icon: Layers3
  },
  {
    title: 'Busy counters',
    text: 'Cleaning products for shops, offices, and kitchens.',
    to: '/shop?category=Cleaning%20Products',
    icon: Store
  }
];

export const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { addItem } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      const featuredData = await apiFetch('/products?featured=true&pageSize=6');
      if (featuredData.products.length > 0) return featuredData.products;
      const latestData = await apiFetch('/products?pageSize=6');
      return latestData.products;
    };

    loadProducts()
      .then((products) => setFeatured(products))
      .catch(() => setFeatured([]));
  }, []);

  const spotlight = featured[0];
  const gridProducts = featured.slice(1, 5);

  const submitSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/shop?search=${encodeURIComponent(query)}` : '/shop');
  };

  return (
    <>
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">Sri Tirumala Products</p>
          <h1>King Brand Mops</h1>
          <p>
            Mops, wipers, refills, and cleaning products arranged for the way Indian homes
            actually get cleaned: floor first, edges next, final wipe last.
          </p>
          <div className="home-hero-actions">
            <Link className="primary-button" to="/shop">
              Start Shopping
              <ArrowRight size={18} />
            </Link>
            <Link className="secondary-button" to="/shop?sort=price-low">
              Value Picks
            </Link>
          </div>
          <div className="home-hero-meta">
            <span>Live Razorpay checkout</span>
            <span>Admin-managed catalog</span>
            <span>Order status tracking</span>
          </div>
        </div>
      </section>

      <section className="home-shop-console" aria-label="Quick shop">
        <form className="home-search-panel" onSubmit={submitSearch}>
          <Search size={20} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search mop, wiper, refill, cleaner..."
          />
          <button type="submit">Search</button>
        </form>
        <div className="home-category-pills">
          {categories.map((category) => (
            <Link key={category} to={`/shop?category=${encodeURIComponent(category)}`}>
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="home-proof-strip">
        <div>
          <Truck size={22} />
          <span>Fast online order processing</span>
        </div>
        <div>
          <ShieldCheck size={22} />
          <span>Secure live payment gateway</span>
        </div>
        <div>
          <Clock3 size={22} />
          <span>Built for everyday cleaning rounds</span>
        </div>
      </section>

      <section className="section-wrap home-spotlight-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Quick Buy</p>
            <h2>Start with the product customers see first</h2>
          </div>
          <Link to="/shop" className="inline-link">
            Full catalog
            <ArrowRight size={16} />
          </Link>
        </div>

        {spotlight ? (
          <div className="home-product-spotlight">
            <Link className="home-product-image" to={`/products/${spotlight.id}`}>
              <img src={spotlight.images?.[0]} alt={spotlight.name} />
            </Link>
            <div className="home-product-copy">
              <p className="eyebrow">{spotlight.category}</p>
              <h3>{spotlight.name}</h3>
              <p>{spotlight.description}</p>
              <div className="price-row detail-price">
                <strong>{formatINR(spotlight.pricePaise)}</strong>
                {spotlight.mrpPaise > spotlight.pricePaise && <s>{formatINR(spotlight.mrpPaise)}</s>}
              </div>
              <div className="button-row">
                <button type="button" className="primary-button" onClick={() => addItem(spotlight)}>
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>
                <Link className="secondary-button" to={`/products/${spotlight.id}`}>
                  View Details
                </Link>
              </div>
              <div className="home-product-notes">
                <span>Stock checked live</span>
                <span>GST calculated at checkout</span>
              </div>
            </div>
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
            <p className="eyebrow">Shop By Surface</p>
            <h2>Pick the mess, then pick the tool</h2>
          </div>
        </div>
        <div className="home-solution-grid">
          {surfaceItems.map((item) => {
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
            <p className="eyebrow">More Store Picks</p>
            <h2>Keep browsing without losing the cart</h2>
          </div>
        </div>
        {gridProducts.length > 0 ? (
          <div className="product-grid">
            {gridProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
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
        )}
      </section>

      <section className="home-care-band">
        <div>
          <p className="eyebrow">Cleaning Flow</p>
          <h2>Floor, edge, wipe: build the whole routine in one cart</h2>
          <p>Move from category to product to checkout without jumping between stores.</p>
        </div>
        <Link className="secondary-button" to="/shop?category=Cleaning%20Products">
          Finish The Kit
        </Link>
      </section>
    </>
  );
};
