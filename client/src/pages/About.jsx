import { Award, CheckCircle2, PackageCheck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const strengths = [
  'Practical cleaning products for homes, shops, offices, and apartments',
  'A focused catalog covering mops, wipers, refills, and daily cleaning needs',
  'Secure online checkout with order records for every customer',
  'Admin-managed products, orders, customers, and analytics'
];

export const About = () => (
  <section className="about-page">
    <div className="about-hero">
      <div>
        <p className="eyebrow">About Us</p>
        <h1>King Brand Mops keeps everyday cleaning simple, reliable, and ready to order.</h1>
        <p>
          King Brand Mops is the online store for Sri Tirumala Products, built to help customers
          find dependable cleaning tools without confusion. The store focuses on products people
          use again and again: mops for floors, wipers for wet areas, and cleaning products for
          homes, shops, and workspaces.
        </p>
        <Link className="primary-button" to="/shop">
          Shop Products
        </Link>
      </div>
    </div>

    <div className="section-wrap about-story-grid">
      <div>
        <p className="eyebrow">Our Approach</p>
        <h2>Cleaning products selected for real daily use</h2>
        <p>
          The goal is not to make customers scroll through hundreds of confusing options. King Brand
          Mops keeps the buying journey direct: choose the surface, pick the right product, add it
          to cart, and checkout securely.
        </p>
        <p>
          Every product can be managed from the admin panel, so stock, pricing, images, and order
          updates stay current as the business grows.
        </p>
      </div>
      <div className="about-strength-card">
        <Award size={30} />
        <h3>Built for trust</h3>
        <p>
          The website supports secure customer access, mobile verification during registration,
          Razorpay payments, order tracking, and a dedicated admin panel for operations.
        </p>
      </div>
    </div>

    <section className="section-wrap">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Why Customers Choose Us</p>
          <h2>Simple store, useful products, clear checkout</h2>
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

    <section className="about-process-band">
      <div>
        <PackageCheck size={24} />
        <strong>Choose</strong>
        <span>Browse by product type or cleaning need.</span>
      </div>
      <div>
        <ShieldCheck size={24} />
        <strong>Pay</strong>
        <span>Checkout through Razorpay with order details saved.</span>
      </div>
      <div>
        <CheckCircle2 size={24} />
        <strong>Track</strong>
        <span>Customers and admin can follow order status updates.</span>
      </div>
    </section>
  </section>
);
