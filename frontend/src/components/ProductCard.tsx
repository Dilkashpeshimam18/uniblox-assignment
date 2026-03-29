import React, { useState } from 'react';
import { Product } from '../api/client';
import { useCart } from '../context/CartContext';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem, loading } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    await addItem(product.id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <img
        src={product.imageUrl}
        alt={product.name}
        style={{ width: '100%', height: '160px', objectFit: 'cover' }}
      />
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600 }}>{product.name}</h3>
        <p style={{ fontSize: '13px', color: 'var(--muted)', flex: 1 }}>{product.description}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>
            ${product.price.toFixed(2)}
          </span>
          <button
            className={added ? 'btn-success' : 'btn-primary'}
            onClick={handleAdd}
            disabled={loading || product.stock === 0}
            style={{ fontSize: '13px' }}
          >
            {product.stock === 0 ? 'Out of Stock' : added ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{product.stock} in stock</span>
      </div>
    </div>
  );
}
