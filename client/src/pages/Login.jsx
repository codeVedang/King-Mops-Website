import { Mail, ShieldCheck, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const Login = () => {
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const { login, register, loginWithGoogle, resetPassword, sendPhoneOtp, verifyPhoneOtp, phoneVerification } =
    useAuth();
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setMessage('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      if (mode === 'login') await login(form);
      else await register(form);
      navigate(redirectTo);
    } catch (err) {
      setError(err.message);
    }
  };

  const forgot = async () => {
    setError('');
    setMessage('');
    try {
      await resetPassword(form.email);
      setMessage('Password reset email sent if the account exists.');
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

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <p className="eyebrow">Customer Access</p>
        <h1>{mode === 'login' ? 'Login to checkout' : 'Create your account'}</h1>
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
            <>
              <label>
                Full Name
                <input name="name" value={form.name} onChange={update} required />
              </label>
              <label>
                Phone Number
                <input
                  name="phone"
                  value={form.phone}
                  onChange={update}
                  pattern="[6-9][0-9]{9}"
                  required
                />
              </label>
              <div className="otp-row full-span">
                <button type="button" className="secondary-button" onClick={sendOtp}>
                  <Smartphone size={18} />
                  Send OTP
                </button>
                <input value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="Enter OTP" />
                <button type="button" className="secondary-button" onClick={confirmOtp}>
                  Verify OTP
                </button>
              </div>
              {phoneVerification?.verified && phoneVerification.phone === form.phone && (
                <p className="form-success full-span">Mobile verification complete.</p>
              )}
            </>
          )}
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={update} required />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={update} required />
          </label>
          {mode === 'register' && (
            <label>
              Confirm Password
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={update}
                required
              />
            </label>
          )}
          {error && <p className="form-error">{error}</p>}
          {message && <p className="form-success">{message}</p>}
          <button type="submit" className="primary-button full-width">
            <ShieldCheck size={18} />
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
          <button type="button" className="secondary-button full-width" onClick={loginWithGoogle}>
            <Mail size={18} />
            Continue with Google
          </button>
          {mode === 'login' && (
            <button type="button" className="link-button" onClick={forgot}>
              Forgot Password
            </button>
          )}
        </form>
      </div>
    </section>
  );
};
