import { useEffect, useState } from 'react';
import { AdminStats, adminApi } from '../api/client';

interface Props {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: Props) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [error, setError] = useState('');
  const [nthOrder, setNthOrder] = useState(5);
  const [discountPercent, setDiscountPercent] = useState(10);
  const [configSaved, setConfigSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

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
    setError(''); setNewCode(''); setGenerating(true);
    try {
      const result = await adminApi.generateCode();
      setNewCode(result.discountCode.code);
      await load();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to generate code');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveConfig = async () => {
    setError('');
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

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 1800);
    });
  };

  const statCards = stats ? [
    { label: 'Total Orders',    value: stats.totalOrders,                      icon: '📦', cls: 'indigo' },
    { label: 'Items Purchased', value: stats.totalItemsPurchased,               icon: '🛍️', cls: 'violet' },
    { label: 'Revenue',         value: `$${stats.totalRevenue.toFixed(2)}`,     icon: '💰', cls: 'emerald' },
    { label: 'Discounts Given', value: `$${stats.totalDiscountGiven.toFixed(2)}`, icon: '🎁', cls: 'amber' },
  ] : [];

  return (
    <div className="modal-backdrop">
      <div className="modal admin-modal">
        {/* Header */}
        <div className="admin-header">
          <h2>
            <div className="admin-header-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            Admin Dashboard
          </h2>
          <button className="btn-ghost modal-close-btn" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="loading-dots">
            <span /><span /><span />
          </div>
        ) : stats ? (
          <div className="admin-body">

            {/* Stats Grid */}
            <div className="stats-grid">
              {statCards.map(({ label, value, icon, cls }) => (
                <div key={label} className="stat-card">
                  <div className={`stat-icon ${cls}`}>{icon}</div>
                  <div className="stat-info">
                    <p className="stat-label">{label}</p>
                    <p className="stat-value">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Discount Generation */}
            <div className="admin-section">
              <div className="admin-section-header">
                <span className="admin-section-title">Discount Code Generation</span>
                <span className="badge badge-blue">{stats.discountCodes.length} codes</span>
              </div>
              <div className="admin-section-body">
                <div className={`generation-status ${stats.pendingDiscountGeneration ? 'ready' : 'waiting'}`}>
                  <span className={`status-dot ${stats.pendingDiscountGeneration ? 'green' : 'gray'}`} />
                  {stats.pendingDiscountGeneration
                    ? 'Milestone reached — ready to generate a new discount code!'
                    : `Next code unlocks after order #${stats.nextCouponAtOrder}`}
                </div>

                {newCode && (
                  <div className="success-msg">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Generated: {newCode}
                    <button
                      className="btn-ghost"
                      style={{ padding: '2px 6px', fontSize: '11px', marginLeft: 'auto' }}
                      onClick={() => copyCode(newCode)}
                    >
                      {copied === newCode ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )}
                {error && (
                  <div className="error-banner" style={{ marginBottom: 12 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  className="btn-primary"
                  onClick={handleGenerate}
                  disabled={!stats.pendingDiscountGeneration || generating}
                  style={{ padding: '10px 20px' }}
                >
                  {generating ? (
                    <><div className="spinner" />Generating...</>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      Generate Discount Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Codes Table */}
            {stats.discountCodes.length > 0 && (
              <div className="admin-section">
                <div className="admin-section-header">
                  <span className="admin-section-title">All Discount Codes</span>
                </div>
                <table className="codes-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Discount</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.discountCodes.map(c => (
                      <tr key={c.code}>
                        <td>
                          <span className="code-text" onClick={() => copyCode(c.code)} title="Click to copy">
                            {c.code}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--indigo-600)' }}>{c.discountPercent}% off</td>
                        <td>
                          <span className={`badge ${c.isUsed ? 'badge-red' : 'badge-green'}`}>
                            {c.isUsed ? '✕ Used' : '✓ Available'}
                          </span>
                        </td>
                        <td>
                          {!c.isUsed && (
                            <button
                              className="btn-ghost"
                              style={{ fontSize: '11px', padding: '3px 8px' }}
                              onClick={() => copyCode(c.code)}
                            >
                              {copied === c.code ? '✓ Copied' : 'Copy'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Config */}
            <div className="admin-section">
              <div className="admin-section-header">
                <span className="admin-section-title">Store Config</span>
              </div>
              <div className="admin-section-body">
                <div className="config-row">
                  <div className="config-field">
                    <label className="config-label">Every Nth Order</label>
                    <input
                      className="config-input"
                      type="number"
                      min={1}
                      value={nthOrder}
                      onChange={e => setNthOrder(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="config-field">
                    <label className="config-label">Discount %</label>
                    <input
                      className="config-input"
                      type="number"
                      min={1}
                      max={100}
                      value={discountPercent}
                      onChange={e => setDiscountPercent(parseInt(e.target.value) || 10)}
                    />
                  </div>
                  <button
                    className={configSaved ? 'btn-success' : 'btn-primary'}
                    onClick={handleSaveConfig}
                    style={{ alignSelf: 'flex-end', padding: '10px 20px' }}
                  >
                    {configSaved ? (
                      <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Saved!</>
                    ) : 'Save Config'}
                  </button>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 10, lineHeight: 1.6 }}>
                  A discount code can be generated after every <strong>{nthOrder}th</strong> order, giving customers <strong>{discountPercent}%</strong> off their next purchase.
                </p>
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
}
