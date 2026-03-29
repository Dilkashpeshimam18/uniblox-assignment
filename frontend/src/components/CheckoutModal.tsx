import React, { useState } from 'react';
import { checkoutApi, Order } from '../api/client';
import { useCart } from '../context/CartContext';

interface Props {
  onClose: () => void;
}

export default function CheckoutModal({ onClose }: Props) {
  const { cart, subtotal, userId, cartId, resetCart } = useCart();
  const [discountCode, setDiscountCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [newDiscountEligible, setNewDiscountEligible] = useState(false);

  if (!cart || !cartId) return null;

  const handleCheckout = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await checkoutApi.checkout(userId, cartId, discountCode || undefined);
      setOrder(result.order);
      setNewDiscountEligible(result.newDiscountEligible);
      await resetCart();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--card)', borderRadius: '16px', padding: '32px',
        width: '480px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
      }}>
        {order ? (
          // Success state
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#9989;</div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Order Placed!</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
              Order #{order.orderNumber} confirmed
            </p>

            <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '16px', textAlign: 'left', marginBottom: '16px' }}>
              {order.items.map(item => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px' }}>
                  <span>{item.productName} &times; {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--success)' }}>
                  <span>Discount ({order.discountPercent}%)</span>
                  <span>&#8722;${order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, marginTop: '8px' }}>
                <span>Total</span><span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            {newDiscountEligible && (
              <div style={{
                background: '#fef9c3', border: '1px solid #fbbf24',
                borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '13px',
              }}>
                You've unlocked a discount code! Ask an admin to generate it.
              </div>
            )}

            <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>
              Continue Shopping
            </button>
          </div>
        ) : (
          // Checkout form
          <>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Checkout</h2>

            {/* Order summary */}
            <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
              {cart.items.map(item => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px' }}>
                  <span>{item.productName} &times; {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Discount code */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
                Discount Code (optional)
              </label>
              <input
                type="text"
                placeholder="Enter discount code"
                value={discountCode}
                onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                style={{ width: '100%' }}
              />
            </div>

            {error && (
              <div style={{ background: '#fee2e2', color: 'var(--danger)', padding: '10px 12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-primary" onClick={handleCheckout} disabled={loading} style={{ flex: 2 }}>
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
