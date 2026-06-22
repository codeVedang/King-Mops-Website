import {
  ArrowRight,
  Award,
  Building2,
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

const collections = [
  {
    title: 'Mops',
    text: 'Daily floor-care essentials designed for homes, offices, and institutions.',
    to: '/shop?category=Mops',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=82',
    icon: Droplet
  },
  {
    title: 'Wipers',
    text: 'Clean finishes for bathrooms, balconies, glass, and wet surfaces.',
    to: '/shop?category=Wipers',
    image: 'https://images.unsplash.com/photo-1603712725038-e9334ae8f39f?auto=format&fit=crop&w=1200&q=82',
    icon: Layers3
  },
  {
    title: 'Brushes',
    text: 'Detail tools for corners, grout, fixtures, and tough everyday cleaning.',
    to: '/shop?search=brush',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1200&q=82',
    icon: Store
  },
  {
    title: 'Combo Packs',
    text: 'Ready sets for complete cleaning coverage in one efficient purchase.',
    to: '/shop?search=combo',
    image: '/images/king-mops-home-hero.png',
    icon: PackageCheck
  }
];

const trustStats = [
  { value: '10+', label: 'Years manufacturing experience' },
  { value: '1000+', label: 'Happy customers' },
  { value: '50000+', label: 'Products delivered' },
  { value: '100+', label: 'Institutional clients' }
];

const whyItems = [
  {
    title: 'Factory Direct Pricing',
    text: 'Premium daily-use products with practical pricing for regular buyers.',
    icon: Store
  },
  {
    title: 'Long Lasting Products',
    text: 'Built for repeat cleaning rounds across homes, shops, and busy properties.',
    icon: Clock3
  },
  {
    title: 'Trusted By Institutions',
    text: 'Designed for teams that need reliable cleaning stock without confusion.',
    icon: Building2
  },
  {
    title: 'Premium Quality Materials',
    text: 'Strong fibers, reliable handles, and clean finishing across the catalog.',
    icon: Award
  },
  {
    title: 'Fast Delivery',
    text: 'Razorpay checkout and admin order flow keep fulfillment clear and quick.',
    icon: Truck
  },
  {
    title: 'Bulk Supply Available',
    text: 'Support for schools, offices, hotels, apartments, and recurring orders.',
    icon: PackageCheck
  }
];

const testimonials = [
  {
    name: 'Facility Manager',
    text: 'King Mops makes repeat cleaning purchases feel simple, professional, and dependable.'
  },
  {
    name: 'Apartment Buyer',
    text: 'The products are easy to choose, the checkout is quick, and the brand feels trustworthy.'
  },
  {
    name: 'Retail Customer',
    text: 'Clear pricing, useful bundles, and fast ordering make this an easy cleaning store to return to.'
  }
];

const institutions = ['Schools', 'Hospitals', 'Offices', 'Apartments', 'Hotels'];

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
    answer: 'Yes. Use the contact page or call +91 93924 78344 for support and bulk enquiries.'
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
          <p className="eyebrow">King Mops Premium</p>
          <h1>CLEANING REDEFINED.</h1>
          <p>Premium cleaning essentials crafted for homes, offices and institutions.</p>
          <div className="home-hero-actions">
            <Link className="primary-button magnetic-button" to="/shop">
              Shop Collection
              <ArrowRight size={18} />
            </Link>
            <Link className="secondary-button glass-button" to="/contact">
              Bulk Orders
            </Link>
          </div>
          <div className="home-hero-meta">
            <span>
              <ShieldCheck size={16} />
              Secure checkout
            </span>
            <span>
              <Truck size={16} />
              Fast processing
            </span>
            <span>
              <Award size={16} />
              Premium quality
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
            placeholder="Search mops, wipers, brushes, combo packs..."
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

      <section className="section-wrap home-collection-section reveal-on-scroll">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Featured Collections</p>
            <h2>Essential tools, presented like a premium home-care line.</h2>
          </div>
        </div>
        <div className="premium-collection-grid">
          {collections.map((item) => {
            const Icon = item.icon;
            return (
              <Link className="premium-collection-card" to={item.to} key={item.title}>
                <img src={item.image} alt={item.title} loading="lazy" />
                <span>
                  <Icon size={18} />
                  {item.title}
                </span>
                <p>{item.text}</p>
              </Link>
            );
          })}
        </div>
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
            <p className="eyebrow">Why King Mops</p>
            <h2>Built for buyers who want quality without noise.</h2>
          </div>
        </div>
        <div className="why-grid why-grid-six">
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

      <section className="premium-video-section reveal-on-scroll">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/king-mops-home-hero.png"
        >
          <source
            src="https://videos.pexels.com/video-files/4109938/4109938-uhd_2560_1440_25fps.mp4"
            type="video/mp4"
          />
        </video>
        <div>
          <p className="eyebrow">Cinematic Care</p>
          <h2>Built For Everyday Excellence.</h2>
        </div>
      </section>

      <section className="section-wrap home-spotlight-section reveal-on-scroll">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Best Sellers</p>
            <h2>High-confidence products for quick purchase.</h2>
          </div>
          <Link to="/shop" className="inline-link">
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        {spotlight ? (
          <div className="home-product-spotlight premium-spotlight">
            <Link className="home-product-image" to={`/products/${spotlight.id}`}>
              <img src={spotlight.images?.[0]} alt={spotlight.name} loading="lazy" />
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
                  Quick Add
                </button>
                <button type="button" className="secondary-button" onClick={() => buyNow(spotlight)}>
                  <Zap size={18} />
                  Buy Now
                </button>
              </div>
              <div className="home-product-notes">
                <span>Live catalog</span>
                <span>Secure payment</span>
                <span>GST billing</span>
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

      {gridProducts.length > 0 && (
        <section className="section-wrap reveal-on-scroll">
          <div className="product-grid">
            {gridProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="section-wrap reveal-on-scroll">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Customer Testimonials</p>
            <h2>Trusted by people who clean serious spaces.</h2>
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

      <section className="section-wrap institutional-section reveal-on-scroll">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Institutional Buyers</p>
            <h2>One catalog for every professional cleaning need.</h2>
          </div>
        </div>
        <div className="institution-grid">
          {institutions.map((item) => (
            <div key={item}>
              <Building2 size={22} />
              <span>{item}</span>
            </div>
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
          <p className="eyebrow">Premium CTA</p>
          <h2>Experience Premium Cleaning Products.</h2>
          <p>Shop refined cleaning essentials for homes, offices, and bulk requirements.</p>
        </div>
        <div className="care-band-actions">
          <Link className="primary-button" to="/shop">
            Shop Now
            <ArrowRight size={18} />
          </Link>
          <Link className="secondary-button glass-button" to="/contact">
            <PhoneCall size={18} />
            Contact
          </Link>
        </div>
      </section>
    </>
  );
};
