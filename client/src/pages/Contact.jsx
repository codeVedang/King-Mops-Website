import { Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const contactItems = [
  {
    label: 'Email',
    value: 'crowdbuzz.company@gmail.com',
    icon: Mail
  },
  {
    label: 'Phone',
    value: '+91 99498 34578',
    icon: Phone
  },
  {
    label: 'Location',
    value: 'Sri Tirumala Products, Hyderabad, India',
    icon: MapPin
  }
];

export const Contact = () => {
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

      <form className="contact-form" action="https://formsubmit.co/crowdbuzz.company@gmail.com" method="POST">
        <input type="hidden" name="_subject" value="King Brand Mops Enquiry" />
        <input type="hidden" name="_template" value="table" />
        <input type="hidden" name="_captcha" value="false" />
        <label>
          Full Name
          <input name="name" placeholder="Your name" autoComplete="off" required />
        </label>
        <label>
          Phone Number
          <input
            name="phone"
            placeholder="10-digit mobile number"
            pattern="[6-9][0-9]{9}"
            inputMode="numeric"
            autoComplete="off"
            required
          />
        </label>
        <label className="full-span">
          Message
          <textarea name="message" placeholder="Tell us what you need help with" autoComplete="off" required />
        </label>
        <button type="submit" className="primary-button full-span">
          <Send size={18} />
          Send Enquiry
        </button>
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
