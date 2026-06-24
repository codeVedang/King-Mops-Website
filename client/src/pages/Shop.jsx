import { Grid2X2, PhoneCall, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
    <section className="page-wrap shop-page shop-reference-layout">
      <div className="page-title premium-page-title shop-hero-title">
        <div>
          <p className="eyebrow">King Mops Storefront</p>
          <h1>Shop cleaning essentials</h1>
          <p>Browse mops, wipers, brushes, combos, and daily-use products with fast checkout and bulk support.</p>
        </div>
        <span className="page-title-icon">
          <Sparkles size={24} />
        </span>
      </div>

      <div className="shop-market-layout">
        <aside className="shop-sidebar" aria-label="Shop filters">
          <div className="shop-sidebar-card shop-sidebar-search">
            <strong>Search</strong>
            <label className="search-field">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => updateParam('search', event.target.value)}
                placeholder="Search products"
              />
            </label>
          </div>

          <div className="shop-sidebar-card">
            <strong>Categories</strong>
            <div className="shop-category-list">
              <button
                type="button"
                className={category === 'All' ? 'is-active' : ''}
                onClick={() => updateParam('category', 'All')}
              >
                All Products
              </button>
              {categories.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={category === item ? 'is-active' : ''}
                  onClick={() => updateParam('category', item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="shop-sidebar-card">
            <strong>Sort By</strong>
            <div className="shop-category-list">
              {[
                ['newest', 'Newest'],
                ['price-low', 'Price Low-High'],
                ['price-high', 'Price High-Low']
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={sort === value ? 'is-active' : ''}
                  onClick={() => updateParam('sort', value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <a className="shop-bulk-panel" href="tel:+919949834578">
            <PhoneCall size={20} />
            <span>
              <strong>Bulk orders</strong>
              <small>Call +91 99498 34578</small>
            </span>
          </a>
        </aside>

        <div className="shop-results-panel">
          <div className="shop-topbar">
            <p className="result-count">
              <SlidersHorizontal size={16} />
              {loading ? 'Loading products' : `${meta.total} product(s) found`}
            </p>
            <div>
              <Grid2X2 size={16} />
              <span>{category === 'All' ? 'All categories' : category}</span>
            </div>
          </div>

          {loading ? (
            <div className="page-loading shop-loading">Loading products...</div>
          ) : (
            <>
              <div className="product-grid shop-product-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {products.length === 0 && (
                <div className="empty-state">
                  <p>No products matched your filters.</p>
                  <button type="button" className="secondary-button" onClick={() => setParams(new URLSearchParams())}>
                    Reset filters
                  </button>
                </div>
              )}
              <div className="pagination shop-pagination">
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
        </div>
      </div>

      <section className="shop-service-strip">
        <Link to="/contact">Bulk supply</Link>
        <Link to="/terms">Terms and conditions</Link>
        <a href="tel:+919949834578">Call support</a>
      </section>
    </section>
  );
};
