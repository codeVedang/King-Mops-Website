import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard.jsx';
import { apiFetch } from '../lib/api.js';
import { categories } from '../lib/format.js';

export const Shop = () => {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const category = params.get('category') || 'All';
  const sort = params.get('sort') || 'newest';
  const search = params.get('search') || '';
  const page = Number(params.get('page') || 1);

  const query = useMemo(() => {
    const values = new URLSearchParams();
    if (category !== 'All') values.set('category', category);
    if (sort) values.set('sort', sort);
    if (search) values.set('search', search);
    values.set('page', page);
    values.set('pageSize', 8);
    return values.toString();
  }, [category, sort, search, page]);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/products?${query}`)
      .then((data) => {
        setProducts(data.products);
        setMeta({ page: data.page, totalPages: data.totalPages, total: data.total });
      })
      .finally(() => setLoading(false));
  }, [query]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'All') next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.set('page', '1');
    setParams(next);
  };

  return (
    <section className="page-wrap">
      <div className="page-title">
        <p className="eyebrow">Shop</p>
        <h1>Cleaning products catalog</h1>
      </div>

      <div className="shop-toolbar">
        <label className="search-field">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => updateParam('search', event.target.value)}
            placeholder="Search by product name"
          />
        </label>
        <select value={category} onChange={(event) => updateParam('category', event.target.value)}>
          <option>All</option>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select value={sort} onChange={(event) => updateParam('sort', event.target.value)}>
          <option value="newest">Newest</option>
          <option value="price-low">Price Low-High</option>
          <option value="price-high">Price High-Low</option>
        </select>
      </div>

      {loading ? (
        <div className="page-loading">Loading products...</div>
      ) : (
        <>
          <p className="result-count">{meta.total} product(s) found</p>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="pagination">
            <button
              type="button"
              disabled={meta.page <= 1}
              onClick={() => updateParam('page', String(meta.page - 1))}
            >
              Previous
            </button>
            <span>
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              type="button"
              disabled={meta.page >= meta.totalPages}
              onClick={() => updateParam('page', String(meta.page + 1))}
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
};
