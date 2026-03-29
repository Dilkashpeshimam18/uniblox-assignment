import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import CheckoutModal from './CheckoutModal';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartSidebar({ open, onClose }: Props) {
  const { cart, subtotal, updateItem, removeItem, loading } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40,
        }}
      />

      {/* Sidebar */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '380px',
        background: 'var(--card)', zIndex: 50,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Your Cart</h2>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '6px 12px' }}>&#x2715;</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!cart || cart.items.length === 0 ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', marginTop: '40px' }}>Your cart is empty</p>
          ) : (
            cart.items.map(item => (
              <div key={item.productId} style={{
                display: 'flex', gap: '12px', padding: '12px',
                background: 'var(--bg)', borderRadius: '8px',
                alignItems: 'center',
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '14px' }}>{item.productName}</p>
                  <p style={{ color: 'var(--muted)', fontSize: '13px' }}>${item.price.toFixed(2)} each</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '16px' }}
                    onClick={() => updateItem(item.productId, item.quantity - 1)}
                    disabled={loading}
                  >&#8722;</button>
                  <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                  <button
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '16px' }}
                    onClick={() => updateItem(item.productId, item.quantity + 1)}
                    disabled={loading}
                  >&#43;</button>
                </div>
                <button
                  className="btn-danger"
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={() => removeItem(item.productId)}
                  disabled={loading}
                >Remove</button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontWeight: 600, fontSize: '16px' }}>Subtotal</span>
              <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--primary)' }}>
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <button
              className="btn-primary"
              style={{ width: '100%', padding: '12px' }}
              onClick={() => setCheckoutOpen(true)}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      {checkoutOpen && (
        <CheckoutModal
          onClose={() => { setCheckoutOpen(false); onClose(); }}
        />
      )}
    </>
  );
}
