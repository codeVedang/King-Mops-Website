import { Shield } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await login({ ...form, admin: true });
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="admin-login-page">
      <div className="auth-panel">
        <BrandLogo admin />
        <h1>Admin Login</h1>
        <form className="form-grid" onSubmit={submit}>
          <label>
            Admin Email
            <input name="email" type="email" value={form.email} onChange={update} required />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={update} required />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="primary-button full-width">
            <Shield size={18} />
            Enter Admin Panel
          </button>
        </form>
      </div>
    </section>
  );
};
