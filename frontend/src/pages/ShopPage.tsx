import React, { useEffect, useState } from 'react';
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
      {/* Navbar */}
      <nav style={{
        background: 'var(--card)', borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>
          UniBlox Shop
        </span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={() => setAdminOpen(true)} style={{ fontSize: '13px' }}>
            Admin
          </button>
          <button
            className="btn-primary"
            onClick={() => setCartOpen(true)}
            style={{ position: 'relative' }}
          >
            Cart
            {itemCount > 0 && (
              <span style={{
                position: 'absolute', top: '-6px', right: '-6px',
                background: 'var(--danger)', color: '#fff',
                borderRadius: '99px', width: '20px', height: '20px',
                fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700,
              }}>{itemCount}</span>
            )}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', padding: '48px 24px', textAlign: 'center', color: '#fff' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
          Tech Essentials
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>
          Quality products with exclusive discounts every 5th order
        </p>
      </div>

      {/* Products */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Products</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px',
        }}>
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </main>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
    </div>
  );
}
