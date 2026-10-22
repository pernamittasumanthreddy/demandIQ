import React, { useEffect, useState } from 'react';
import {
  Boxes,
  RefreshCw,
  AlertTriangle,
  IndianRupee,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { DeadStockAnalysis } from '../types';

export const DeadStockView: React.FC = () => {
  const [items, setItems] = useState<DeadStockAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadDeadStock();
  }, []);

  const loadDeadStock = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.get<any>('/replenishment/dead-stock/');
      setItems(res.results || (Array.isArray(res) ? res : []));
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      await ApiClient.post('/replenishment/dead-stock/scan/');
      await loadDeadStock();
    } finally {
      setScanning(false);
    }
  };

  const flaggedItems = items.filter((i) => i.classification !== 'HEALTHY');
  const totalLockedCapital = flaggedItems.reduce((acc, i) => acc + Number(i.capital_at_risk || 0), 0);
  const confirmedDeadCount = items.filter((i) => i.classification === 'DEAD_STOCK').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-beige)',
        paddingBottom: '16px'
      }}>
        <div>
          <h1 className="editorial-title" style={{ fontSize: '28px', color: 'var(--text-charcoal)' }}>
            Dead-Stock & Excess Inventory Detection
          </h1>
          <p style={{ color: 'var(--text-warm-gray)', fontSize: '14px', marginTop: '4px' }}>
            Identify idle capital, non-moving shelf items, and actionable clearance strategies
          </p>
        </div>
        <div>
          <button onClick={handleScan} disabled={scanning} className="btn btn-secondary">
            <RefreshCw size={15} className={scanning ? 'spin' : ''} color="var(--primary-forest)" />
            <span>{scanning ? 'Scanning Catalog...' : 'Scan Inventory Velocity'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="metric-card">
          <div className="metric-label">Total Idle Capital Tied Up</div>
          <div className="metric-value" style={{ color: 'var(--accent-orange)' }}>
            ₹{totalLockedCapital.toLocaleString('en-IN')}
          </div>
          <div className="metric-sub" style={{ color: 'var(--text-warm-gray)' }}>
            Locked across {flaggedItems.length} sluggish products
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Confirmed Dead Stock (&gt;60 Days)</div>
          <div className="metric-value" style={{ color: confirmedDeadCount > 0 ? 'var(--status-error)' : 'var(--text-charcoal)' }}>
            {confirmedDeadCount} Products
          </div>
          <div className="metric-sub" style={{ color: 'var(--status-error)' }}>
            Zero retail sales in over 2 months
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Recovery Action Recommended</div>
          <div className="metric-value" style={{ color: 'var(--primary-forest)' }}>
            Bundle / Clear
          </div>
          <div className="metric-sub">
            Protect working capital turnover
          </div>
        </div>
      </div>

      {/* Dead Stock Table */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Slow-Moving & Dead Stock Register</h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-warm-gray)' }}>
            Ranked by total cost capital tied up in physical shelf space
          </p>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product / SKU</th>
                <th>Classification</th>
                <th>Days Idle (No Sales)</th>
                <th>Units on Shelf</th>
                <th>Capital Locked (₹)</th>
                <th>Turnover Ratio</th>
                <th>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {flaggedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-warm-gray)' }}>
                    No dead stock detected! All active products are turning over within healthy velocity bands.
                  </td>
                </tr>
              ) : (
                flaggedItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.product_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)' }}>
                        SKU: {item.product_sku} • {item.category_name || 'General'}
                      </div>
                    </td>
                    <td>
                      <span className={
                        item.classification === 'DEAD_STOCK' ? 'badge badge-error' :
                        item.classification === 'SLOW_MOVING' ? 'badge badge-warning' :
                        'badge badge-neutral'
                      }>
                        {item.classification.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: item.days_without_sale >= 60 ? 'var(--status-error)' : 'var(--text-charcoal)' }}>
                        {item.days_without_sale} days
                      </span>
                    </td>
                    <td>{item.units_in_stock}</td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--accent-orange)' }}>
                        ₹{Number(item.capital_at_risk).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>{item.turnover_ratio}x</td>
                    <td style={{ maxWidth: '320px', fontSize: '12.5px', color: 'var(--text-charcoal-subtle)', lineHeight: 1.35 }}>
                      {item.recommended_action}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
