import { useEffect, useState } from 'react';
import { Product, productApi } from '../api/client';
import AdminPanel from '../components/AdminPanel';
import CartSidebar from '../components/CartSidebar';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const { itemCount } = useCart();

  useEffect(() => {
    productApi.list().then(setProducts);
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-logo">
          <div className="navbar-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <span className="navbar-logo-text">UniBlox</span>
        </div>

        <div className="navbar-actions">
          <button className="btn-outline" onClick={() => setAdminOpen(true)} style={{ fontSize: '13px', padding: '8px 16px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93A10 10 0 003.52 19.07M4.93 4.93a10 10 0 0114.14 14.14"/>
            </svg>
            Admin
          </button>

          <button className="btn-primary cart-btn" onClick={() => setCartOpen(true)} style={{ padding: '9px 18px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.56l1.54-7.44H6"/>
            </svg>
            Cart
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-pill">
            <span className="hero-pill-dot" />
            Free shipping on orders over $50
          </div>
          <h1>Premium <span>Tech Gear</span><br />for Modern Creators</h1>
          <p className="hero-sub">
            Discover top-tier accessories built for performance. Every 5th order unlocks an exclusive discount.
          </p>
          <div className="hero-stats">
            <div className="hero-stat"><strong>6</strong>Products</div>
            <div className="hero-stat"><strong>10%</strong>Discount reward</div>
            <div className="hero-stat"><strong>Every 5th</strong>Order wins</div>
            <div className="hero-stat"><strong>Free</strong>Returns</div>
          </div>
        </div>
      </section>

      {/* ── Products ── */}
      <main className="shop-main">
        <div className="shop-header">
          <h2>All Products</h2>
          {products.length > 0 && (
            <span className="shop-count">{products.length} items</span>
          )}
        </div>

        <div className="products-grid">
          {products.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="product-card-skeleton" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="skeleton-block" style={{ height: 200 }} />
                  <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="skeleton-block" style={{ height: 16, width: '60%' }} />
                    <div className="skeleton-block" style={{ height: 12 }} />
                    <div className="skeleton-block" style={{ height: 12, width: '80%' }} />
                    <div className="skeleton-block" style={{ height: 36, marginTop: 8 }} />
                  </div>
                </div>
              ))
            : products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))
          }
        </div>
      </main>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
    </div>
  );
}
