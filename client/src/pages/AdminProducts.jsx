import { Edit3, ImagePlus, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api.js';
import { categories, formatINR, fromInputRupees, toInputRupees } from '../lib/format.js';
import { uploadProductImages, validateImageFile } from '../lib/storage.js';

const emptyProduct = {
  id: '',
  name: '',
  category: 'Mops',
  description: '',
  mrp: '',
  price: '',
  stock: 0,
  images: '',
  specs: '',
  isFeatured: false,
  isActive: true
};

const productToForm = (product) => ({
  id: product.id,
  name: product.name,
  category: product.category,
  description: product.description,
  mrp: toInputRupees(product.mrpPaise),
  price: toInputRupees(product.pricePaise),
  stock: product.stock,
  images: (product.images || []).join('\n'),
  specs: (product.specs || []).join('\n'),
  isFeatured: Boolean(product.isFeatured),
  isActive: product.isActive !== false
});

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyProduct);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadProducts = () =>
    apiFetch('/admin/products').then((data) => setProducts(data.products || []));

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return products.filter((product) => product.name.toLowerCase().includes(term));
  }, [products, search]);

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const chooseFiles = (event) => {
    const selected = Array.from(event.target.files || []);
    const firstError = selected.map(validateImageFile).find(Boolean);
    if (firstError) {
      setError(firstError);
      event.target.value = '';
      return;
    }
    if (selected.length > 5) {
      setError('Upload one main image and up to four additional images.');
      event.target.value = '';
      return;
    }
    setFiles(selected);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const productId =
        form.id || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const uploaded = files.length ? await uploadProductImages(productId, files) : [];
      const imageUrls = [
        ...uploaded,
        ...form.images
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean)
      ];
      const payload = {
        id: productId,
        name: form.name,
        category: form.category,
        description: form.description,
        mrpPaise: fromInputRupees(form.mrp),
        pricePaise: fromInputRupees(form.price),
        stock: Number(form.stock),
        images: imageUrls,
        specs: form.specs.split('\n').map((item) => item.trim()).filter(Boolean),
        isFeatured: form.isFeatured,
        isActive: form.isActive
      };
      if (form.id) {
        await apiFetch(`/admin/products/${form.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/admin/products', { method: 'POST', body: JSON.stringify(payload) });
      }
      setForm(emptyProduct);
      setFiles([]);
      await loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const softDelete = async (id) => {
    await apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
    await loadProducts();
  };

  return (
    <div className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Product Management</p>
          <h1>Catalog</h1>
        </div>
      </div>

      <div className="admin-grid product-admin-grid">
        <section className="admin-panel">
          <h2>{form.id ? 'Edit Product' : 'Add New Product'}</h2>
          <form className="form-grid compact-form" onSubmit={submit}>
            <label>
              Product Name
              <input name="name" value={form.name} onChange={update} required />
            </label>
            <label>
              Category
              <select name="category" value={form.category} onChange={update}>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="full-span">
              Description
              <textarea name="description" value={form.description} onChange={update} required />
            </label>
            <label>
              Price - MRP
              <input name="mrp" type="number" min="1" value={form.mrp} onChange={update} required />
            </label>
            <label>
              Price - Selling Price
              <input name="price" type="number" min="1" value={form.price} onChange={update} required />
            </label>
            <label>
              Stock Quantity
              <input name="stock" type="number" min="0" value={form.stock} onChange={update} />
            </label>
            <label className="full-span">
              Product Image Upload
              <input type="file" accept="image/jpeg,image/png" multiple onChange={chooseFiles} />
            </label>
            <label className="full-span">
              Image URLs
              <textarea name="images" value={form.images} onChange={update} placeholder="One URL per line" />
            </label>
            <label className="full-span">
              Specifications
              <textarea name="specs" value={form.specs} onChange={update} placeholder="One feature per line" />
            </label>
            <label className="checkbox-row">
              <input name="isFeatured" type="checkbox" checked={form.isFeatured} onChange={update} />
              Is Featured
            </label>
            <label className="checkbox-row">
              <input name="isActive" type="checkbox" checked={form.isActive} onChange={update} />
              Is Active
            </label>
            {error && <p className="form-error full-span">{error}</p>}
            <button className="primary-button full-span" type="submit" disabled={saving}>
              {form.id ? <Edit3 size={18} /> : <Plus size={18} />}
              {saving ? 'Saving...' : form.id ? 'Update Product' : 'Add Product'}
            </button>
          </form>
        </section>

        <section className="admin-panel">
          <div className="panel-tools">
            <h2>Products</h2>
            <label className="search-field compact-search">
              <Search size={16} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
          </div>
          <div className="product-admin-list">
            {filtered.map((product) => (
              <article key={product.id} className="admin-product-row">
                <img src={product.images?.[0]} alt={product.name} />
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.category}</p>
                  <strong>{formatINR(product.pricePaise)}</strong>
                  {!product.isActive && <span className="badge muted">Inactive</span>}
                </div>
                <div className="row-actions">
                  <button type="button" className="icon-button" onClick={() => setForm(productToForm(product))}>
                    <Edit3 size={18} />
                  </button>
                  <button type="button" className="icon-button danger" onClick={() => softDelete(product.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
