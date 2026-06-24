import { Mail, MapPin, MessageCircle, Phone, Send, ShieldCheck, Sparkles } from 'lucide-react';
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

export const Contact = () => (
  <section className="contact-page">
    <div className="contact-hero premium-subhero">
      <div>
        <p className="eyebrow">Contact Us</p>
        <h1>Need help choosing a mop, wiper, or complete cleaning kit?</h1>
        <p>
          Send your requirement and the King Mops team will help with product selection, order
          support, business enquiries, and bulk cleaning needs.
        </p>
      </div>
    </div>

    <section className="section-wrap contact-grid reveal-on-scroll">
      <div className="contact-info-panel premium-card">
        <p className="eyebrow">Support Desk</p>
        <h2>Fast answers for product and order questions</h2>
        <p>
          Share your cleaning need, space type, or order question. The team will guide you toward
          the right product or next step.
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

      <form className="contact-form premium-form" action="https://formsubmit.co/crowdbuzz.company@gmail.com" method="POST">
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

    <section className="contact-action-band premium-contact-band reveal-on-scroll">
      <div>
        <MessageCircle size={24} />
        <div>
          <strong>Want to order right now?</strong>
          <span>Browse the catalog and checkout securely through Razorpay.</span>
        </div>
      </div>
      <Link className="secondary-button" to="/shop">
        Open Shop
      </Link>
    </section>

    <section className="section-wrap contact-assurance reveal-on-scroll">
      <div>
        <ShieldCheck size={22} />
        <strong>Secure checkout</strong>
        <span>Online payment handled through Razorpay.</span>
      </div>
      <div>
        <Sparkles size={22} />
        <strong>Clear buying help</strong>
        <span>Ask for product, order, or bulk purchase support.</span>
      </div>
    </section>
  </section>
);
