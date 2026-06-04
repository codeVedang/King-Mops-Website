import { Edit3, Plus, Search, Trash2, X } from 'lucide-react';
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
  const [draft, setDraft] = useState(emptyProduct);
  const [files, setFiles] = useState([]);
  const [modalMode, setModalMode] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');

  const loadProducts = () =>
    apiFetch('/admin/products').then((data) =>
      setProducts((data.products || []).filter((product) => product.isActive !== false))
    );

  useEffect(() => {
    loadProducts().catch((err) => setError(err.message));
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return products.filter((product) => product.name.toLowerCase().includes(term));
  }, [products, search]);

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setDraft({ ...draft, [name]: type === 'checkbox' ? checked : value });
  };

  const openAddModal = () => {
    setDraft(emptyProduct);
    setFiles([]);
    setError('');
    setModalMode('add');
  };

  const openEditModal = (product) => {
    setDraft(productToForm(product));
    setFiles([]);
    setError('');
    setModalMode('edit');
  };

  const closeModal = () => {
    if (saving) return;
    setModalMode('');
    setDraft(emptyProduct);
    setFiles([]);
    setError('');
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
        draft.id || draft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const uploaded = files.length ? await uploadProductImages(productId, files) : [];
      const imageUrls = [
        ...uploaded,
        ...draft.images
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean)
      ];
      const payload = {
        id: productId,
        name: draft.name,
        category: draft.category,
        description: draft.description,
        mrpPaise: fromInputRupees(draft.mrp),
        pricePaise: fromInputRupees(draft.price),
        stock: Number(draft.stock),
        images: imageUrls,
        specs: draft.specs
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        isFeatured: draft.isFeatured,
        isActive: draft.isActive
      };
      if (draft.id) {
        await apiFetch(`/admin/products/${draft.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/admin/products', { method: 'POST', body: JSON.stringify(payload) });
      }
      await loadProducts();
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const softDelete = async (id) => {
    const confirmed = window.confirm('Delete this product from the admin catalog?');
    if (!confirmed) return;
    setError('');
    setDeletingId(id);
    try {
      await apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
      setProducts((current) => current.filter((product) => product.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Product Management</p>
          <h1>Catalog</h1>
        </div>
        <button type="button" className="primary-button" onClick={openAddModal}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <section className="admin-panel">
        <div className="panel-tools">
          <h2>Products</h2>
          <label className="search-field compact-search">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
            />
          </label>
        </div>
        {!modalMode && error && <p className="form-error full-span">{error}</p>}
        <div className="product-admin-list">
          {filtered.map((product) => (
            <article key={product.id} className="admin-product-row">
              <img src={product.images?.[0]} alt={product.name} />
              <div>
                <h3>{product.name}</h3>
                <p>{product.category}</p>
                <strong>{formatINR(product.pricePaise)}</strong>
              </div>
              <div className="row-actions">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => openEditModal(product)}
                  aria-label={`Edit ${product.name}`}
                >
                  <Edit3 size={18} />
                </button>
                <button
                  type="button"
                  className="icon-button danger"
                  onClick={() => softDelete(product.id)}
                  disabled={deletingId === product.id}
                  aria-label={`Delete ${product.name}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </article>
          ))}
          {filtered.length === 0 && <p>No active products found.</p>}
        </div>
      </section>

      {modalMode && (
        <div className="modal-backdrop" role="presentation">
          <section className="admin-product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
            <div className="modal-header">
              <div>
                <p className="eyebrow">{modalMode === 'edit' ? 'Editing' : 'New Product'}</p>
                <h2 id="product-modal-title">{modalMode === 'edit' ? draft.name : 'Add Product'}</h2>
              </div>
              <button type="button" className="icon-button" onClick={closeModal} aria-label="Close product editor">
                <X size={18} />
              </button>
            </div>
            <form className="form-grid compact-form" onSubmit={submit}>
              <label>
                Product Name
                <input name="name" value={draft.name} onChange={update} required />
              </label>
              <label>
                Category
                <select name="category" value={draft.category} onChange={update}>
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="full-span">
                Description
                <textarea name="description" value={draft.description} onChange={update} required />
              </label>
              <label>
                Price - MRP
                <input name="mrp" type="number" min="1" value={draft.mrp} onChange={update} required />
              </label>
              <label>
                Price - Selling Price
                <input name="price" type="number" min="1" value={draft.price} onChange={update} required />
              </label>
              <label>
                Stock Quantity
                <input name="stock" type="number" min="0" value={draft.stock} onChange={update} />
              </label>
              <label className="full-span">
                Product Image Upload
                <input type="file" accept="image/jpeg,image/png" multiple onChange={chooseFiles} />
              </label>
              <label className="full-span">
                Image URLs
                <textarea name="images" value={draft.images} onChange={update} placeholder="One URL per line" />
              </label>
              <label className="full-span">
                Specifications
                <textarea name="specs" value={draft.specs} onChange={update} placeholder="One feature per line" />
              </label>
              <label className="checkbox-row">
                <input name="isFeatured" type="checkbox" checked={draft.isFeatured} onChange={update} />
                Is Featured
              </label>
              <label className="checkbox-row">
                <input name="isActive" type="checkbox" checked={draft.isActive} onChange={update} />
                Is Active
              </label>
              {error && <p className="form-error full-span">{error}</p>}
              <button className="primary-button full-span" type="submit" disabled={saving}>
                {modalMode === 'edit' ? <Edit3 size={18} /> : <Plus size={18} />}
                {saving ? 'Saving...' : modalMode === 'edit' ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};
