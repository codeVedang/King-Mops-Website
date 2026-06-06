import { Percent, Save, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api.js';

const toRupees = (paise) => Number(Number(paise || 0) / 100).toFixed(2);

export const AdminSettings = () => {
  const [form, setForm] = useState({
    gstRatePercent: 18,
    deliveryFee: '49.00'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/admin/settings/checkout')
      .then((data) => {
        setForm({
          gstRatePercent: data.settings?.gstRatePercent ?? 18,
          deliveryFee: toRupees(data.settings?.deliveryFeePaise)
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const update = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const deliveryFee = Math.max(0, Number(form.deliveryFee || 0));
      const gstRatePercent = Math.max(0, Number(form.gstRatePercent || 0));
      const data = await apiFetch('/admin/settings/checkout', {
        method: 'PUT',
        body: JSON.stringify({ gstRatePercent, deliveryFee })
      });
      setForm({
        gstRatePercent: data.settings.gstRatePercent,
        deliveryFee: toRupees(data.settings.deliveryFeePaise)
      });
      setMessage('Billing settings updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loading">Loading billing settings...</div>;

  return (
    <div className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Billing Control</p>
          <h1>GST and Delivery</h1>
        </div>
      </div>

      <section className="admin-panel settings-panel">
        <form className="form-grid compact-form" onSubmit={submit}>
          <label>
            <Percent size={18} />
            GST Percentage
            <input
              name="gstRatePercent"
              type="number"
              min="0"
              step="0.01"
              value={form.gstRatePercent}
              onChange={update}
              required
            />
          </label>
          <label>
            <Truck size={18} />
            Delivery Fee
            <input
              name="deliveryFee"
              type="number"
              min="0"
              step="0.01"
              value={form.deliveryFee}
              onChange={update}
              required
            />
          </label>
          {error && <p className="form-error full-span">{error}</p>}
          {message && <p className="form-success full-span">{message}</p>}
          <button type="submit" className="primary-button full-span" disabled={saving}>
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Billing Settings'}
          </button>
        </form>
      </section>
    </div>
  );
};
