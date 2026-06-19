import { Link } from 'react-router-dom';

export const Terms = () => (
  <section className="page-wrap terms-page">
    <div className="terms-hero">
      <p className="eyebrow">Legal</p>
      <h1>Terms and Conditions</h1>
      <p>Last Updated: June 2026</p>
    </div>

    <div className="terms-content">
      <p>
        Welcome to King Mops. By accessing or using our website, you agree to be bound by
        these Terms and Conditions. Please read them carefully before making any purchase.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing this website and purchasing products from King Mops, you acknowledge that
        you have read, understood, and agreed to these Terms and Conditions.
      </p>

      <h2>2. Products and Pricing</h2>
      <p>
        We strive to ensure that all product descriptions, images, specifications, and pricing
        displayed on our website are accurate. However, errors may occur, and we reserve the
        right to correct any errors, inaccuracies, or omissions without prior notice.
      </p>
      <p>Prices are subject to change at any time without notice.</p>

      <h2>3. Orders</h2>
      <p>
        All orders placed through our website are subject to acceptance and availability. We
        reserve the right to refuse, cancel, or limit any order at our sole discretion.
      </p>

      <h2>4. Payment</h2>
      <p>
        Payments must be made through the payment methods available on our website. Orders will
        be processed only after successful payment confirmation.
      </p>

      <h2>5. Shipping and Delivery</h2>
      <p>
        We will make reasonable efforts to deliver products within the estimated delivery period.
        Delivery timelines are estimates only and may vary due to factors beyond our control.
      </p>
      <p>
        King Mops shall not be liable for delays caused by courier partners, natural events,
        governmental actions, or other unforeseen circumstances.
      </p>

      <h2>6. No Return, No Refund Policy</h2>
      <p>All sales made through King Mops are final.</p>
      <p>
        Products sold on this website are not eligible for return, exchange, replacement, or
        refund once the order has been placed and dispatched.
      </p>
      <p>
        Customers are advised to carefully review product details, specifications, and quantities
        before placing an order.
      </p>
      <p>Refunds will not be provided for:</p>
      <ul>
        <li>Change of mind</li>
        <li>Incorrect product selection by the customer</li>
        <li>Dissatisfaction based on personal preference</li>
        <li>Delayed deliveries caused by third-party logistics providers</li>
      </ul>
      <p>
        In cases where a product is received in a visibly damaged condition due to shipping,
        customers must notify us within 24 hours of delivery with clear photographic evidence.
        King Mops reserves the sole right to determine the appropriate resolution.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        All content on this website, including logos, trademarks, designs, graphics, images,
        text, and software, is the exclusive property of King Mops and is protected under
        applicable intellectual property laws.
      </p>
      <p>No content may be copied, reproduced, distributed, or used without prior written consent.</p>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, King Mops shall not be liable for any indirect,
        incidental, consequential, special, or punitive damages arising from the use of our
        products or website.
      </p>
      <p>Our maximum liability shall not exceed the amount paid by the customer for the relevant order.</p>

      <h2>9. User Conduct</h2>
      <p>Users agree not to:</p>
      <ul>
        <li>Use the website for unlawful purposes.</li>
        <li>Attempt unauthorized access to website systems.</li>
        <li>Interfere with website operations or security.</li>
        <li>Submit false or misleading information.</li>
      </ul>

      <h2>10. Privacy</h2>
      <p>Use of this website is also governed by our Privacy Policy.</p>

      <h2>11. Governing Law</h2>
      <p>
        These Terms and Conditions shall be governed by and construed in accordance with the
        laws of India. Any disputes arising from these Terms shall be subject to the exclusive
        jurisdiction of the courts located in Hyderabad, Telangana, India.
      </p>

      <h2>12. Modifications</h2>
      <p>
        King Mops reserves the right to modify these Terms and Conditions at any time without
        prior notice. Updated terms will be posted on this website and become effective
        immediately upon publication.
      </p>

      <h2>13. Contact Information</h2>
      <p>For any questions regarding these Terms and Conditions, please contact:</p>
      <p>
        King Mops
        <br />
        Email: <a href="mailto:crowdbuzz.company@gmail.com">crowdbuzz.company@gmail.com</a>
        <br />
        Phone: <a href="tel:+919392478344">+91 93924 78344</a>
      </p>
    </div>

    <div className="terms-actions">
      <Link className="primary-button" to="/shop">Continue Shopping</Link>
      <Link className="secondary-button" to="/contact">Contact Support</Link>
    </div>
  </section>
);
