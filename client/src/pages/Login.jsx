import { ArrowLeft, ShieldCheck, Smartphone, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const Login = () => {
  const [step, setStep] = useState('phone');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: ''
  });
  const { login, completePhoneProfile, sendPhoneOtp, verifyPhoneOtp, phoneVerification } = useAuth();
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const resetFeedback = () => {
    setError('');
    setMessage('');
  };

  const sendOtp = async (event) => {
    event.preventDefault();
    resetFeedback();
    setSubmitting(true);
    try {
      await sendPhoneOtp(form.phone);
      setStep('otp');
      setMessage('OTP sent to your mobile number.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmOtp = async (event) => {
    event.preventDefault();
    resetFeedback();
    setSubmitting(true);
    try {
      await verifyPhoneOtp(otp);
      const result = await login({ phone: form.phone });
      if (result?.needsName) {
        setStep('name');
        setMessage('Almost done. Please add your name to complete signup.');
        return;
      }
      navigate(redirectTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitName = async (event) => {
    event.preventDefault();
    resetFeedback();
    setSubmitting(true);
    try {
      await completePhoneProfile(form);
      navigate(redirectTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const backToPhone = () => {
    setStep('phone');
    setOtp('');
    resetFeedback();
  };

  const verified = phoneVerification?.verified && phoneVerification.phone === form.phone;

  return (
    <section className="auth-page">
      <div className="auth-panel single-auth-panel">
        <p className="eyebrow">Mobile Access</p>
        <h1>{step === 'name' ? 'Complete signup' : 'Continue with mobile'}</h1>
        <p className="auth-helper">
          {step === 'phone'
            ? 'Enter your mobile number. Existing customers will login automatically after OTP.'
            : step === 'otp'
              ? 'Enter the OTP sent to your mobile number.'
              : 'This number is new. Add your name once and continue shopping.'}
        </p>

        {step === 'phone' && (
          <form className="form-grid" onSubmit={sendOtp}>
            <div id="phone-recaptcha-container" className="recaptcha-container" />
            <label>
              Phone Number
              <input
                name="phone"
                value={form.phone}
                onChange={update}
                placeholder="10-digit mobile number"
                pattern="[6-9][0-9]{9}"
                inputMode="numeric"
                autoComplete="tel"
                required
              />
            </label>
            {error && <p className="form-error">{error}</p>}
            {message && <p className="form-success">{message}</p>}
            <button type="submit" className="primary-button full-width" disabled={submitting}>
              <Smartphone size={18} />
              {submitting ? 'Sending OTP...' : 'Continue'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form className="form-grid" onSubmit={confirmOtp}>
            <div id="phone-recaptcha-container" className="recaptcha-container" />
            <label>
              OTP
              <input
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="Enter OTP"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
              />
            </label>
            {verified && <p className="form-success full-span">Mobile verification complete.</p>}
            {error && <p className="form-error">{error}</p>}
            {message && <p className="form-success">{message}</p>}
            <button type="submit" className="primary-button full-width" disabled={submitting}>
              <ShieldCheck size={18} />
              {submitting ? 'Checking...' : 'Verify and Continue'}
            </button>
            <button type="button" className="link-button full-width" onClick={backToPhone}>
              <ArrowLeft size={16} />
              Change mobile number
            </button>
          </form>
        )}

        {step === 'name' && (
          <form className="form-grid" onSubmit={submitName}>
            <label>
              Full Name
              <input
                name="name"
                value={form.name}
                onChange={update}
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </label>
            {error && <p className="form-error">{error}</p>}
            {message && <p className="form-success">{message}</p>}
            <button type="submit" className="primary-button full-width" disabled={submitting}>
              <UserRound size={18} />
              {submitting ? 'Saving...' : 'Complete Signup'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
