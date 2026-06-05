import { Award, CheckCircle2, PackageCheck, ShieldCheck, Star, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const strengths = [
  'Practical cleaning products for homes, shops, offices, and apartments',
  'Focused catalog covering mops, wipers, refills, and daily cleaning needs',
  'Secure online checkout with order records for every customer',
  'Admin-managed products, orders, customers, and analytics'
];

const proofPoints = [
  { value: '3+', label: 'Cleaning categories' },
  { value: '24/7', label: 'Online ordering' },
  { value: '100%', label: 'Catalog control' }
];

export const About = () => (
  <section className="about-page">
    <div className="about-hero premium-subhero">
      <div>
        <p className="eyebrow">About King Brand Mops</p>
        <h1>Everyday cleaning products, presented with confidence and ordered without confusion.</h1>
        <p>
          King Brand Mops is the online store for Sri Tirumala Products, built to help customers
          choose reliable mops, wipers, and cleaning products for homes, shops, and workspaces.
        </p>
        <Link className="primary-button" to="/shop">
          Shop Products
        </Link>
      </div>
    </div>

    <div className="section-wrap about-story-grid reveal-on-scroll">
      <div>
        <p className="eyebrow">Brand Mission</p>
        <h2>Make repeat cleaning purchases feel simple, polished, and trustworthy</h2>
        <p>
          Customers should not need to scroll through a confusing wholesale catalogue to find useful
          cleaning essentials. King Brand Mops groups products around real routines: floor care, wet
          areas, and finishing products that complete the cleaning kit.
        </p>
        <p>
          The website keeps the path direct: browse by need, compare price clearly, buy instantly,
          and track orders through a secure customer account.
        </p>
      </div>
      <div className="about-strength-card premium-card">
        <Award size={30} />
        <h3>Built for daily reliability</h3>
        <p>
          Every product can be managed from the admin panel, so stock, pricing, images, and order
          updates stay current as the business grows.
        </p>
      </div>
    </div>

    <section className="section-wrap reveal-on-scroll">
      <div className="home-stats-grid">
        {proofPoints.map((item) => (
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
          <p className="eyebrow">Why Customers Choose Us</p>
          <h2>A cleaner buying journey from category to checkout</h2>
        </div>
      </div>
      <div className="about-value-grid">
        {strengths.map((item) => (
          <div key={item}>
            <CheckCircle2 size={20} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>

    <section className="about-process-band premium-process reveal-on-scroll">
      <div>
        <PackageCheck size={24} />
        <strong>Choose</strong>
        <span>Browse by product type, routine, or cleaning need.</span>
      </div>
      <div>
        <ShieldCheck size={24} />
        <strong>Pay</strong>
        <span>Checkout through Razorpay with order details saved.</span>
      </div>
      <div>
        <Truck size={24} />
        <strong>Track</strong>
        <span>Customers and admin can follow order status updates.</span>
      </div>
    </section>

    <section className="section-wrap reveal-on-scroll">
      <div className="testimonial-grid">
        <article className="testimonial-card feature-testimonial">
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={15} fill="currentColor" />
            ))}
          </div>
          <p>
            “The website keeps cleaning product shopping direct and clear. It feels easier to pick
            the right mop, wiper, or cleaner for daily work.”
          </p>
          <strong>King Mops customer</strong>
        </article>
      </div>
    </section>
  </section>
);
