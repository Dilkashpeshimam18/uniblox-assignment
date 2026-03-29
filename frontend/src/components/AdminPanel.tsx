import React, { useEffect, useState } from 'react';
import { AdminStats, adminApi } from '../api/client';

interface Props {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: Props) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [nthOrder, setNthOrder] = useState(5);
  const [discountPercent, setDiscountPercent] = useState(10);
  const [configSaved, setConfigSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, cfg] = await Promise.all([adminApi.getStats(), adminApi.getConfig()]);
      setStats(s);
      setNthOrder(cfg.nthOrder);
      setDiscountPercent(cfg.discountPercent);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    setError(''); setMessage(''); setGenerating(true);
    try {
      const result = await adminApi.generateCode();
      setMessage(`Generated: ${result.discountCode.code} (${result.discountCode.discountPercent}% off)`);
      await load();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to generate code');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      await adminApi.updateConfig(nthOrder, discountPercent);
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 2000);
      await load();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to save config');
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--card)', borderRadius: '16px', padding: '32px',
        width: '600px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Admin Panel</h2>
          <button className="btn-secondary" onClick={onClose}>&#x2715;</button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : stats ? (
          <>
            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {[
                { label: 'Total Orders', value: stats.totalOrders },
                { label: 'Items Purchased', value: stats.totalItemsPurchased },
                { label: 'Revenue', value: `$${stats.totalRevenue.toFixed(2)}` },
                { label: 'Total Discounts Given', value: `$${stats.totalDiscountGiven.toFixed(2)}` },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: 'var(--bg)', borderRadius: '8px', padding: '16px',
                  borderLeft: '3px solid var(--primary)',
                }}>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{label}</p>
                  <p style={{ fontSize: '22px', fontWeight: 700 }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Discount generation */}
            <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>Discount Code Generation</h3>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px' }}>
                {stats.pendingDiscountGeneration
                  ? 'Condition met — you can generate a new discount code.'
                  : `Next code available after order #${stats.nextCouponAtOrder}.`}
              </p>
              {message && <p style={{ color: 'var(--success)', fontSize: '13px', marginBottom: '8px' }}>{message}</p>}
              {error && <p style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '8px' }}>{error}</p>}
              <button
                className="btn-primary"
                onClick={handleGenerate}
                disabled={!stats.pendingDiscountGeneration || generating}
              >
                {generating ? 'Generating...' : 'Generate Discount Code'}
              </button>
            </div>

            {/* Discount Codes Table */}
            {stats.discountCodes.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>Discount Codes</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)' }}>
                      <th style={{ padding: '8px', textAlign: 'left', fontWeight: 600 }}>Code</th>
                      <th style={{ padding: '8px', textAlign: 'left', fontWeight: 600 }}>Discount</th>
                      <th style={{ padding: '8px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.discountCodes.map(c => (
                      <tr key={c.code} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px', fontFamily: 'monospace', fontWeight: 600 }}>{c.code}</td>
                        <td style={{ padding: '8px' }}>{c.discountPercent}% off</td>
                        <td style={{ padding: '8px' }}>
                          <span className={`badge ${c.isUsed ? 'badge-red' : 'badge-green'}`}>
                            {c.isUsed ? 'Used' : 'Available'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Config */}
            <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '16px' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '12px' }}>Store Config</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                    Every Nth Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={nthOrder}
                    onChange={e => setNthOrder(parseInt(e.target.value) || 1)}
                    style={{ width: '80px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                    Discount %
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={discountPercent}
                    onChange={e => setDiscountPercent(parseInt(e.target.value) || 10)}
                    style={{ width: '80px' }}
                  />
                </div>
                <button
                  className={configSaved ? 'btn-success' : 'btn-primary'}
                  onClick={handleSaveConfig}
                >
                  {configSaved ? 'Saved!' : 'Save Config'}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
