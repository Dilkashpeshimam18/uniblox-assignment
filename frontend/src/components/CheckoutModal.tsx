import { useState } from 'react';
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
      setError(axiosErr.response?.data?.error || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        {order ? (
          /* ── Success State ── */
          <div className="modal-body order-success">
            <div className="success-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            <h2>Order Placed!</h2>
            <div className="order-number-badge">Order #{order.orderNumber}</div>

            <div className="order-receipt">
              {order.items.map(item => (
                <div key={item.productId} className="receipt-row">
                  <span className="cart-item-name">{item.productName} &times; {item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="receipt-row" style={{ borderTop: '1px solid var(--border)', background: 'var(--slate-50)' }}>
                <span style={{ color: 'var(--muted)' }}>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="receipt-row discount">
                  <span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginRight: 4, verticalAlign: 'middle' }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Discount ({order.discountCode} &mdash; {order.discountPercent}% off)
                  </span>
                  <span style={{ fontWeight: 700 }}>-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="receipt-row total">
                <span>Total Paid</span>
                <span style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>

            {newDiscountEligible && (
              <div className="discount-unlocked">
                <span style={{ fontSize: 20 }}>&#127881;</span>
                <div>
                  <strong>You unlocked a discount code!</strong><br />
                  Your order qualified for a reward. Ask an admin to generate it from the Admin Panel.
                </div>
              </div>
            )}

            <button className="btn-primary" onClick={onClose} style={{ width: '100%', padding: '13px', justifyContent: 'center', borderRadius: 10 }}>
              Continue Shopping
            </button>
          </div>
        ) : (
          /* ── Checkout Form ── */
          <>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Checkout</h2>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: 4 }}>
                  Review your order and apply a discount
                </p>
              </div>
              <button className="btn-ghost modal-close-btn" onClick={onClose}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {/* Order summary */}
              <div className="checkout-summary">
                <div className="checkout-summary-header">Order Summary</div>
                {cart.items.map(item => (
                  <div key={item.productId} className="checkout-item">
                    <span className="checkout-item-name">{item.productName} &times; {item.quantity}</span>
                    <span className="checkout-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="checkout-total-row">
                  <span>Subtotal</span>
                  <span style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Discount code */}
              <div className="discount-input-wrap">
                <label className="discount-label">
                  Discount Code <span style={{ fontWeight: 400, color: 'var(--muted)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                <div className="discount-input-row">
                  <input
                    type="text"
                    placeholder="e.g. SAVE10-A3F9B2"
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && !loading && handleCheckout()}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              {error && (
                <div className="error-banner">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleCheckout}
                disabled={loading}
                style={{ flex: 2, justifyContent: 'center', padding: '12px' }}
              >
                {loading ? (
                  <><div className="spinner" /> Processing...</>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    Place Order &mdash; ${subtotal.toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
