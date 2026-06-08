import { CreditCard, Save, ShieldCheck, Smartphone } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OrderSummary } from '../components/OrderSummary.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { apiFetch, loadRazorpayCheckout } from '../lib/api.js';
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
  const { items, clearCart } = useCart();
  const { profile, refreshProfile, sendPhoneOtp, verifyPhoneOtp, login, phoneVerification } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    ...initialAddress,
    fullName: profile?.name || '',
    phone: profile?.phone || ''
  });
  const [saveAddress, setSaveAddress] = useState(true);
  const [coupon, setCoupon] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpChecking, setOtpChecking] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [paying, setPaying] = useState(false);

  const cartPayload = useMemo(
    () => items.map((item) => ({ productId: item.id, quantity: item.quantity })),
    [items]
  );

  const update = (event) => setAddress({ ...address, [event.target.name]: event.target.value });

  useEffect(() => {
    if (verifiedPhone && verifiedPhone !== address.phone) {
      setVerifiedPhone('');
      setOtp('');
      setMessage('');
    }
  }, [address.phone, verifiedPhone]);

  const validate = () => {
    const required = ['fullName', 'phone', 'flat', 'street', 'area', 'city', 'state', 'pinCode'];
    if (items.length === 0) return 'Your cart is empty.';
    if (required.some((field) => !address[field]?.trim())) return 'Complete the delivery address.';
    if (!validatePhone(address.phone)) return 'Enter a valid 10-digit Indian mobile number.';
    if (!verifiedPhone || verifiedPhone !== address.phone) {
      return 'Verify your mobile number with OTP before payment.';
    }
    if (!/^\d{6}$/.test(address.pinCode)) return 'Enter a valid 6-digit PIN code.';
    return '';
  };

  const sendCheckoutOtp = async () => {
    setError('');
    setMessage('');
    if (!validatePhone(address.phone)) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setOtpSending(true);
    try {
      await sendPhoneOtp(address.phone);
      setMessage('OTP sent. Enter it below before payment.');
    } catch (err) {
      setError(err.message);
    } finally {
      setOtpSending(false);
    }
  };

  const verifyCheckoutOtp = async () => {
    setError('');
    setMessage('');
    if (!address.fullName.trim()) {
      setError('Enter your full name before OTP verification.');
      return;
    }
    setOtpChecking(true);
    try {
      await verifyPhoneOtp(otp);
      await login({ phone: address.phone, name: address.fullName });
      setVerifiedPhone(address.phone);
      setMessage('Mobile number verified for this order.');
    } catch (err) {
      setError(err.message);
    } finally {
      setOtpChecking(false);
    }
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
    clearCart();
    await refreshProfile();
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

      if (orderData.razorpayOrderId.startsWith('order_demo_')) {
        await verifyAndCreateOrder({}, orderData.razorpayOrderId);
        return;
      }

      await loadRazorpayCheckout();
      const checkout = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amountPaise,
        currency: orderData.currency,
        name: 'King Brand Mops',
        description: 'Cleaning products order',
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
          color: '#f97316'
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
          <div id="phone-recaptcha-container" className="recaptcha-container" />
          <label>
            Full Name
            <input name="fullName" value={address.fullName} onChange={update} required />
          </label>
          <label>
            Phone Number
            <input name="phone" value={address.phone} onChange={update} pattern="[6-9][0-9]{9}" required />
          </label>
          <div className="otp-row checkout-otp-row full-span">
            <button type="button" className="secondary-button" onClick={sendCheckoutOtp} disabled={otpSending}>
              <Smartphone size={18} />
              {otpSending ? 'Sending...' : 'Send OTP'}
            </button>
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="Enter OTP"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
            <button type="button" className="secondary-button" onClick={verifyCheckoutOtp} disabled={otpChecking}>
              <ShieldCheck size={18} />
              {otpChecking ? 'Checking...' : 'Verify OTP'}
            </button>
          </div>
          {verifiedPhone && verifiedPhone === address.phone && (
            <p className="form-success full-span">Mobile number verified for payment.</p>
          )}
          {phoneVerification?.phone === address.phone && !phoneVerification.verified && (
            <p className="form-success full-span">OTP sent to {address.phone}.</p>
          )}
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
        {message && <p className="form-success">{message}</p>}
      </div>
      <OrderSummary
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
              disabled={paying || !verifiedPhone || verifiedPhone !== address.phone}
            >
              {paying ? <Save size={18} /> : <CreditCard size={18} />}
              {paying ? 'Processing...' : verifiedPhone && verifiedPhone === address.phone ? 'Pay with Razorpay' : 'Verify Mobile First'}
            </button>
          </>
        }
      />
    </section>
  );
};
