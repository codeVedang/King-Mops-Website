import { Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const contactItems = [
  {
    label: 'Email',
    value: 'support@kingbrandmops.in',
    icon: Mail
  },
  {
    label: 'Phone',
    value: '+91 98765 43210',
    icon: Phone
  },
  {
    label: 'Location',
    value: 'Sri Tirumala Products, Hyderabad, India',
    icon: MapPin
  }
];

export const Contact = () => {
  const [sent, setSent] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = form.get('name') || '';
    const phone = form.get('phone') || '';
    const message = form.get('message') || '';
    const body = encodeURIComponent(`Name: ${name}\nPhone: ${phone}\n\n${message}`);
    window.location.href = `mailto:support@kingbrandmops.in?subject=King Brand Mops Enquiry&body=${body}`;
    setSent(true);
  };

  return (
    <section className="contact-page">
    <div className="contact-hero">
      <div>
        <p className="eyebrow">Contact Us</p>
        <h1>Need help with products, orders, or bulk cleaning requirements?</h1>
        <p>
          Reach out to King Brand Mops for product questions, order support, business enquiries,
          or help choosing the right cleaning kit.
        </p>
      </div>
    </div>

    <section className="section-wrap contact-grid">
      <div className="contact-info-panel">
        <h2>Get in touch</h2>
        <p>
          Share your requirement and the team will help with product selection, order support, and
          cleaning product information.
        </p>
        <div className="contact-list">
          {contactItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label}>
                <Icon size={20} />
                <span>
                  <strong>{item.label}</strong>
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <form className="contact-form" onSubmit={submit}>
        <label>
          Full Name
          <input name="name" placeholder="Your name" />
        </label>
        <label>
          Phone Number
          <input name="phone" placeholder="10-digit mobile number" />
        </label>
        <label className="full-span">
          Message
          <textarea name="message" placeholder="Tell us what you need help with" />
        </label>
        <button type="submit" className="primary-button full-span">
          <Send size={18} />
          Send Enquiry
        </button>
        {sent && <p className="form-success full-span">Email draft opened with your enquiry.</p>}
      </form>
    </section>

    <section className="contact-action-band">
      <div>
        <MessageCircle size={24} />
        <div>
          <strong>Want to order right now?</strong>
          <span>Browse the catalog and add products directly to cart.</span>
        </div>
      </div>
      <Link className="secondary-button" to="/shop">
        Open Shop
      </Link>
    </section>
    </section>
  );
};
