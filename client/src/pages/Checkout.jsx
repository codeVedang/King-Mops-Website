import { CreditCard, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OrderSummary } from '../components/OrderSummary.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { apiFetch, loadRazorpayCheckout } from '../lib/api.js';
import { trackAnalyticsEvent } from '../lib/firebase.js';
import { validatePhone } from '../lib/format.js';

const initialAddress = {
  fullName: '',
  phone: '',
  flat: '',
  street: '',
  area: '',
  city: '',
  state: '',
  pinCode: ''
};

export const Checkout = () => {
  const { items, clearCart, summary } = useCart();
  const { user, profile, refreshProfile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    ...initialAddress,
    fullName: !isAdmin ? profile?.name || '' : '',
    phone: !isAdmin ? profile?.phone || '' : ''
  });
  const [saveAddress, setSaveAddress] = useState(true);
  const [coupon, setCoupon] = useState('');
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [serverSummary, setServerSummary] = useState(null);

  const cartPayload = useMemo(
    () => items.map((item) => ({ productId: item.id, quantity: item.quantity })),
    [items]
  );

  const update = (event) => setAddress({ ...address, [event.target.name]: event.target.value });

  useEffect(() => {
    if (isAdmin || !profile) return;
    setAddress((current) => ({
      ...current,
      fullName: current.fullName || profile.name || '',
      phone: current.phone || profile.phone || ''
    }));
  }, [isAdmin, profile]);

  useEffect(() => {
    setServerSummary(null);
  }, [cartPayload]);

  const validate = () => {
    const required = ['fullName', 'phone', 'flat', 'street', 'area', 'city', 'state', 'pinCode'];
    if (items.length === 0) return 'Your cart is empty.';
    if (required.some((field) => !address[field]?.trim())) return 'Complete the delivery address.';
    if (!validatePhone(address.phone)) return 'Enter a valid 10-digit Indian mobile number.';
    if (!/^\d{6}$/.test(address.pinCode)) return 'Enter a valid 6-digit PIN code.';
    return '';
  };

  const verifyAndCreateOrder = async (payment, orderId) => {
    const data = await apiFetch('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpayOrderId: payment.razorpay_order_id || orderId,
        razorpayPaymentId: payment.razorpay_payment_id || `pay_demo_${Date.now()}`,
        razorpaySignature: payment.razorpay_signature || 'demo_signature',
        items: cartPayload,
        address,
        saveAddress
      })
    });
    trackAnalyticsEvent('purchase', {
      transaction_id: data.order.id,
      currency: 'INR',
      value: Number(data.order.totalAmountPaise || 0) / 100,
      tax: Number(data.order.gstPaise || 0) / 100,
      shipping: Number(data.order.deliveryPaise || 0) / 100,
      items: data.order.items.map((item) => ({
        item_id: item.productId,
        item_name: item.name,
        item_category: item.category,
        price: Number(item.pricePaise || 0) / 100,
        quantity: item.quantity
      }))
    });
    clearCart();
    if (user && !isAdmin) {
      await refreshProfile();
    }
    navigate(`/order-confirmation/${data.order.id}`, { state: { order: data.order } });
  };

  const pay = async () => {
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setPaying(true);
    try {
      const orderData = await apiFetch('/payments/create-razorpay-order', {
        method: 'POST',
        body: JSON.stringify({ items: cartPayload, coupon })
      });
      const payableSummary = orderData.summary || null;
      const payableAmountPaise = Math.round(
        Number(payableSummary?.totalPaise ?? orderData.amountPaise ?? summary.totalPaise)
      );
      setServerSummary(payableSummary);
      trackAnalyticsEvent('begin_checkout', {
        currency: 'INR',
        value: payableAmountPaise / 100,
        items: (payableSummary?.items || items).map((item) => ({
          item_id: item.productId || item.id,
          item_name: item.name,
          item_category: item.category,
          price: Number(item.pricePaise || 0) / 100,
          quantity: item.quantity
        }))
      });

      if (orderData.razorpayOrderId.startsWith('order_demo_')) {
        await verifyAndCreateOrder({}, orderData.razorpayOrderId);
        return;
      }

      await loadRazorpayCheckout();
      const checkout = new window.Razorpay({
        key: orderData.keyId,
        amount: payableAmountPaise,
        currency: orderData.currency,
        name: 'King Brand Mops',
        description: `Order total including GST and delivery`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: address.fullName,
          contact: address.phone
        },
        handler: (payment) => verifyAndCreateOrder(payment, orderData.razorpayOrderId),
        modal: {
          ondismiss: () => setError('Payment was cancelled. You can retry anytime.')
        },
        theme: {
          color: '#000000'
        }
      });
      checkout.open();
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <section className="page-wrap two-column-page">
      <div>
        <div className="page-title">
          <p className="eyebrow">Checkout</p>
          <h1>Delivery and payment</h1>
        </div>
        <form className="form-grid address-form">
          <label>
            Full Name
            <input name="fullName" value={address.fullName} onChange={update} required />
          </label>
          <label>
            Phone Number
            <input name="phone" value={address.phone} onChange={update} pattern="[6-9][0-9]{9}" required />
          </label>
          <label>
            Flat / House No.
            <input name="flat" value={address.flat} onChange={update} required />
          </label>
          <label>
            Street
            <input name="street" value={address.street} onChange={update} required />
          </label>
          <label>
            Area / Locality
            <input name="area" value={address.area} onChange={update} required />
          </label>
          <label>
            City
            <input name="city" value={address.city} onChange={update} required />
          </label>
          <label>
            State
            <input name="state" value={address.state} onChange={update} required />
          </label>
          <label>
            PIN Code
            <input name="pinCode" value={address.pinCode} onChange={update} pattern="[0-9]{6}" required />
          </label>
          <label className="full-span">
            Coupon Code
            <input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Optional" />
          </label>
          <label className="checkbox-row full-span">
            <input
              type="checkbox"
              checked={saveAddress}
              onChange={(event) => setSaveAddress(event.target.checked)}
            />
            Save address for future orders
          </label>
        </form>
        {error && <p className="form-error">{error}</p>}
      </div>
      <OrderSummary
        summaryOverride={serverSummary}
        action={
          <>
            <p className="checkout-terms-note">
              By placing this order, you accept our{' '}
              <Link to="/terms" target="_blank" rel="noreferrer">Terms and Conditions</Link>,
              including the no return and no refund policy.
            </p>
            <button
              type="button"
              className="primary-button full-width"
              onClick={pay}
              disabled={paying}
            >
              {paying ? <Save size={18} /> : <CreditCard size={18} />}
              {paying ? 'Processing...' : 'Pay with Razorpay'}
            </button>
          </>
        }
      />
    </section>
  );
};
