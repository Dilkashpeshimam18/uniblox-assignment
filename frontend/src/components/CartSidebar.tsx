import { useState } from 'react';
import { useCart } from '../context/CartContext';
import CheckoutModal from './CheckoutModal';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartSidebar({ open, onClose }: Props) {
  const { cart, subtotal, updateItem, removeItem, loading, itemCount } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (!open) return null;

  const hasItems = cart && cart.items.length > 0;

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />

      <aside className="cart-sidebar">
        {/* Header */}
        <div className="cart-header">
          <h2>
            Your Cart
            {itemCount > 0 && (
              <span className="cart-header-count">{itemCount}</span>
            )}
          </h2>
          <button className="btn-ghost modal-close-btn" onClick={onClose} aria-label="Close cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        {!hasItems ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--slate-400)' }}>
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.56l1.54-7.44H6"/>
              </svg>
            </div>
            <p style={{ fontWeight: 600, color: 'var(--slate-700)', fontSize: '15px' }}>Your cart is empty</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Add some products to get started!</p>
            <button className="btn-primary" onClick={onClose} style={{ marginTop: 8, padding: '9px 20px' }}>
              Browse Products
            </button>
          </div>
        ) : (
          <div className="cart-items">
            {cart.items.map(item => (
              <div key={item.productId} className="cart-item">
                {/* Thumbnail */}
                <div className="cart-item-thumb">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--indigo-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                </div>

                {/* Info */}
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.productName}</p>
                  <p className="cart-item-price">${item.price.toFixed(2)} each</p>
                  <p className="cart-item-subtotal">${(item.price * item.quantity).toFixed(2)}</p>
                </div>

                {/* Controls */}
                <div className="cart-item-controls">
                  <div className="qty-controls">
                    <button
                      className="qty-btn"
                      onClick={() => updateItem(item.productId, item.quantity - 1)}
                      disabled={loading}
                      aria-label="Decrease"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateItem(item.productId, item.quantity + 1)}
                      disabled={loading}
                      aria-label="Increase"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeItem(item.productId)}
                    disabled={loading}
                    aria-label="Remove item"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {hasItems && (
          <div className="cart-footer">
            <div className="cart-subtotal-row">
              <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
              <span>Subtotal</span>
            </div>
            <div className="cart-total-row">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-value">${subtotal.toFixed(2)}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px', textAlign: 'center' }}>
              Taxes and shipping calculated at checkout
            </p>
            <button
              className="btn-primary checkout-btn"
              onClick={() => setCheckoutOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              Proceed to Checkout
            </button>
          </div>
        )}
      </aside>

      {checkoutOpen && (
        <CheckoutModal onClose={() => { setCheckoutOpen(false); onClose(); }} />
      )}
    </>
  );
}
