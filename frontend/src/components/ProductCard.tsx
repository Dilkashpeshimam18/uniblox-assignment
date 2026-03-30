import { useState } from 'react';
import { Product } from '../api/client';
import { useCart } from '../context/CartContext';

interface Props {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: Props) {
  const { addItem, loading } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    await addItem(product.id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const isLowStock = product.stock > 0 && product.stock <= 10;

  return (
    <div
      className="product-card"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      {/* Image */}
      <div className="product-img-wrap">
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        <div className="product-img-overlay" />
        <span className={`product-stock-chip${isLowStock ? ' low' : ''}`}>
          {product.stock === 0 ? 'Sold out' : isLowStock ? `Only ${product.stock} left` : `${product.stock} in stock`}
        </span>
      </div>

      {/* Body */}
      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>

        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>

          <button
            className={`add-to-cart-btn ${added ? 'btn-success' : 'btn-accent'}`}
            onClick={handleAdd}
            disabled={loading || product.stock === 0}
          >
            {product.stock === 0 ? (
              'Sold Out'
            ) : added ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Added!
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
