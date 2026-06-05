import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock3,
  Droplet,
  Layers3,
  PackageCheck,
  PhoneCall,
  Search,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  Truck,
  Zap
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
    title: 'Floor care',
    text: 'Spin mops, flat mops, and refills for daily home cleaning.',
    to: '/shop?category=Mops',
    icon: Droplet
  },
  {
    title: 'Wet area control',
    text: 'Wipers for bathrooms, balconies, glass, tiles, and shop floors.',
    to: '/shop?category=Wipers',
    icon: Layers3
  },
  {
    title: 'Routine finish',
    text: 'Cleaning products that complete the final wipe and shine.',
    to: '/shop?category=Cleaning%20Products',
    icon: Store
  }
];

const trustStats = [
  { value: '3+', label: 'Core categories' },
  { value: '18%', label: 'GST-ready checkout' },
  { value: '24/7', label: 'Online ordering' }
];

const whyItems = [
  {
    title: 'Selected for Indian homes',
    text: 'Products are organized around real cleaning routines: floors, corners, wet areas, and counters.',
    icon: CheckCircle2
  },
  {
    title: 'Fast purchase flow',
    text: 'Add to cart or Buy Now from product cards, then checkout through Razorpay securely.',
    icon: Zap
  },
  {
    title: 'Fresh catalog control',
    text: 'Pricing, stock, product photos, and availability stay updated through the admin panel.',
    icon: PackageCheck
  }
];

const assuranceItems = [
  'Durable cleaning tools for repeat daily use',
  'Clear pricing with MRP and selling price shown',
  'Mobile-first checkout with saved delivery details',
  'Support for home, shop, and bulk cleaning needs'
];

const testimonials = [
  {
    name: 'Home buyer',
    text: 'The product choices are simple, and checkout feels clean. I can quickly pick mops and wipers without confusion.'
  },
  {
    name: 'Apartment helper',
    text: 'The store makes it easy to choose the right cleaning kit for daily floor and bathroom work.'
  },
  {
    name: 'Shop owner',
    text: 'Good for regular-use cleaning products. The cart and order process are straightforward.'
  }
];

const faqs = [
  {
    question: 'Can I buy directly without opening product details?',
    answer: 'Yes. Use Buy Now on product cards or featured products to go straight to checkout.'
  },
  {
    question: 'Do you support online payment?',
    answer: 'Yes. Checkout uses Razorpay for secure online payment.'
  },
  {
    question: 'Can I contact for bulk or business requirements?',
    answer: 'Yes. Use the contact form or call the support number shown on the website.'
  }
];

export const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { addItem } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      const featuredData = await apiFetch('/products?featured=true&pageSize=8');
      if (featuredData.products.length > 0) return featuredData.products;
      const latestData = await apiFetch('/products?pageSize=8');
      return latestData.products;
    };

    loadProducts()
      .then((products) => setFeatured(products))
      .catch(() => setFeatured([]));
  }, []);

  const spotlight = featured[0];
  const gridProducts = featured.slice(0, 4);

  const submitSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/shop?search=${encodeURIComponent(query)}` : '/shop');
  };

  const buyNow = (product) => {
    addItem(product);
    navigate('/checkout');
  };

  return (
    <>
      <section className="home-hero premium-hero">
        <div className="home-hero-copy reveal-on-scroll">
          <p className="eyebrow">Premium cleaning essentials</p>
          <h1>King Brand Mops</h1>
          <p>
            Upgrade everyday cleaning with dependable mops, wipers, and home-care products designed
            for Indian homes, shops, apartments, and busy spaces.
          </p>
          <div className="home-hero-actions">
            <Link className="primary-button" to="/shop">
              Shop Bestsellers
              <ArrowRight size={18} />
            </Link>
            <Link className="secondary-button glass-button" to="/contact">
              Talk To Support
            </Link>
          </div>
          <div className="home-hero-meta">
            <span>
              <ShieldCheck size={16} />
              Secure Razorpay checkout
            </span>
            <span>
              <Truck size={16} />
              Fast order processing
            </span>
            <span>
              <Award size={16} />
              Quality-focused catalog
            </span>
          </div>
        </div>
      </section>

      <section className="home-shop-console premium-console" aria-label="Quick shop">
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

      <section className="home-proof-strip premium-proof reveal-on-scroll">
        <div>
          <Truck size={22} />
          <span>Fast online order processing</span>
        </div>
        <div>
          <ShieldCheck size={22} />
          <span>Secure checkout experience</span>
        </div>
        <div>
          <Clock3 size={22} />
          <span>Built for everyday cleaning rounds</span>
        </div>
      </section>

      <section className="section-wrap home-spotlight-section reveal-on-scroll">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Featured Drop</p>
            <h2>Popular products ready for quick checkout</h2>
          </div>
          <Link to="/shop" className="inline-link">
            Full catalog
            <ArrowRight size={16} />
          </Link>
        </div>

        {spotlight ? (
          <div className="home-product-spotlight premium-spotlight">
            <Link className="home-product-image" to={`/products/${spotlight.id}`}>
              <img src={spotlight.images?.[0]} alt={spotlight.name} />
            </Link>
            <div className="home-product-copy">
              <span className="product-chip">{spotlight.category}</span>
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
                <button type="button" className="secondary-button" onClick={() => buyNow(spotlight)}>
                  <Zap size={18} />
                  Buy Now
                </button>
              </div>
              <div className="home-product-notes">
                <span>Live stock status</span>
                <span>Clear GST billing</span>
                <span>Saved order records</span>
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

      <section className="section-wrap reveal-on-scroll">
        <div className="home-stats-grid">
          {trustStats.map((item) => (
            <div key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section-wrap reveal-on-scroll">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Shop By Cleaning Need</p>
            <h2>Build a complete cleaning routine in one cart</h2>
          </div>
        </div>
        <div className="home-solution-grid">
          {surfaceItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link className="home-solution-card premium-solution-card" to={item.to} key={item.title}>
                <Icon size={24} />
                <strong>{item.title}</strong>
                <span>{item.text}</span>
                <CheckCircle2 size={18} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section-wrap home-category-section reveal-on-scroll">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Best Picks</p>
            <h2>Premium essentials customers can buy fast</h2>
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

      <section className="section-wrap reveal-on-scroll">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Why Choose Us</p>
            <h2>A cleaner buying experience for cleaning products</h2>
          </div>
        </div>
        <div className="why-grid">
          {whyItems.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="why-card">
                <Icon size={24} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="quality-band reveal-on-scroll">
        <div>
          <p className="eyebrow">Quality Assurance</p>
          <h2>Designed for frequent cleaning, simple ordering, and confident purchase decisions.</h2>
          <div className="quality-list">
            {assuranceItems.map((item) => (
              <span key={item}>
                <CheckCircle2 size={18} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap reveal-on-scroll">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Customer Confidence</p>
            <h2>Trusted for simple, repeat cleaning purchases</h2>
          </div>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <article key={item.name} className="testimonial-card">
              <div className="stars" aria-label="Five star rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={15} fill="currentColor" />
                ))}
              </div>
              <p>{item.text}</p>
              <strong>{item.name}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="section-wrap faq-section reveal-on-scroll">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FAQs</p>
            <h2>Questions before you order?</h2>
          </div>
        </div>
        <div className="faq-list">
          {faqs.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="home-care-band premium-care-band reveal-on-scroll">
        <div>
          <p className="eyebrow">Need help choosing?</p>
          <h2>Tell us your space and cleaning need. We’ll help you pick the right kit.</h2>
          <p>For product questions, order support, and bulk enquiries, reach the King Mops team directly.</p>
        </div>
        <div className="care-band-actions">
          <Link className="primary-button" to="/contact">
            <PhoneCall size={18} />
            Contact Support
          </Link>
          <Link className="secondary-button glass-button" to="/shop">
            Shop Now
          </Link>
        </div>
      </section>
    </>
  );
};
