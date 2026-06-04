import { ShieldCheck, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const Login = () => {
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: ''
  });
  const { login, register, sendPhoneOtp, verifyPhoneOtp, phoneVerification } = useAuth();
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setMessage('');
    setOtp('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      if (mode === 'login') await login({ phone: form.phone });
      else await register(form);
      navigate(redirectTo);
    } catch (err) {
      setError(err.message);
    }
  };

  const sendOtp = async () => {
    setError('');
    setMessage('');
    try {
      await sendPhoneOtp(form.phone);
      setMessage('OTP sent to your mobile number.');
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmOtp = async () => {
    setError('');
    setMessage('');
    try {
      await verifyPhoneOtp(otp);
      setMessage('Mobile number verified.');
    } catch (err) {
      setError(err.message);
    }
  };

  const verified = phoneVerification?.verified && phoneVerification.phone === form.phone;

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <p className="eyebrow">Mobile Access</p>
        <h1>{mode === 'login' ? 'Login with mobile' : 'Create mobile account'}</h1>
        <div className="segmented-control">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>
            Login
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => switchMode('register')}
          >
            Register
          </button>
        </div>
        <form className="form-grid" onSubmit={submit}>
          <div id="phone-recaptcha-container" className="recaptcha-container" />
          {mode === 'register' && (
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
          )}
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
          <div className="otp-row full-span">
            <button type="button" className="secondary-button" onClick={sendOtp}>
              <Smartphone size={18} />
              Send OTP
            </button>
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="Enter OTP"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
            <button type="button" className="secondary-button" onClick={confirmOtp}>
              Verify OTP
            </button>
          </div>
          {verified && <p className="form-success full-span">Mobile verification complete.</p>}
          {error && <p className="form-error">{error}</p>}
          {message && <p className="form-success">{message}</p>}
          <button type="submit" className="primary-button full-width" disabled={!verified}>
            <ShieldCheck size={18} />
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
      </div>
    </section>
  );
};
