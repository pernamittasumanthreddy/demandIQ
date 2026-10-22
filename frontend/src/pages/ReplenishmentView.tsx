import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  FileText,
  Boxes,
  Truck,
  IndianRupee,
  ShoppingCart
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { ReorderRecommendation } from '../types';

interface ReplenishmentViewProps {
  onNavigate: (view: string) => void;
}

export const ReplenishmentView: React.FC<ReplenishmentViewProps> = ({ onNavigate }) => {
  const [recommendations, setRecommendations] = useState<ReorderRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.get<any>('/replenishment/recommendations/');
      setRecommendations(res.results || (Array.isArray(res) ? res : []));
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await ApiClient.post('/replenishment/recommendations/recalculate/');
      await loadRecommendations();
    } finally {
      setRecalculating(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await ApiClient.post(`/replenishment/recommendations/${id}/accept/`);
      await loadRecommendations();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = recommendations.filter((r) => {
    if (filterUrgency === 'ALL') return true;
    return r.urgency === filterUrgency;
  });

  const totalCost = filtered.reduce((acc, r) => acc + Number(r.estimated_cost || 0), 0);
  const criticalCount = recommendations.filter((r) => r.urgency === 'CRITICAL').length;

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
            Inventory Optimization & Reorder Suggestions
          </h1>
          <p style={{ color: 'var(--text-warm-gray)', fontSize: '14px', marginTop: '4px' }}>
            Lead-Time Demand, Safety Stock, MOQs, and Order Multiples converted to purchase decisions
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="btn btn-secondary"
          >
            <RefreshCw size={15} className={recalculating ? 'spin' : ''} color="var(--primary-forest)" />
            <span>{recalculating ? 'Recalculating...' : 'Recalculate Stock Needs'}</span>
          </button>
          <button onClick={() => onNavigate('procurement')} className="btn btn-primary">
            <ShoppingCart size={15} color="var(--surface-cream)" />
            <span>Open Purchase Orders</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="metric-card">
          <div className="metric-label">Items Requiring Reorder</div>
          <div className="metric-value">{recommendations.length} Products</div>
          <div className="metric-sub" style={{ color: 'var(--text-warm-gray)' }}>
            Based on 60-day velocity
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Critical Stockout Warnings</div>
          <div className="metric-value" style={{ color: criticalCount > 0 ? 'var(--status-error)' : 'var(--text-charcoal)' }}>
            {criticalCount} Items
          </div>
          <div className="metric-sub" style={{ color: 'var(--status-error)' }}>
            Stock &lt; 50% Lead Time Demand
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Total Purchase Capital Needed</div>
          <div className="metric-value">₹{totalCost.toLocaleString('en-IN')}</div>
          <div className="metric-sub" style={{ color: 'var(--primary-forest)' }}>
            Wholesale cost across suggestions
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-beige)', paddingBottom: '8px' }}>
        {['ALL', 'CRITICAL', 'WARNING'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterUrgency(tab)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid',
              borderColor: filterUrgency === tab ? 'var(--primary-forest)' : 'var(--border-beige)',
              backgroundColor: filterUrgency === tab ? 'var(--primary-forest)' : 'var(--surface-cream)',
              color: filterUrgency === tab ? '#fff' : 'var(--text-charcoal)',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {tab === 'ALL' ? `All Items (${recommendations.length})` : tab}
          </button>
        ))}
      </div>

      {/* Reorder Table */}
      <div className="card" style={{ padding: '20px' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product / SKU</th>
                <th>Preferred Supplier</th>
                <th>Current Stock</th>
                <th>Lead Time Demand</th>
                <th>Safety Buffer</th>
                <th>Reorder Level</th>
                <th>Suggested Order</th>
                <th>Est. Cost</th>
                <th>Urgency</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-warm-gray)' }}>
                    No items in this category need reordering right now.
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => (
                  <tr key={rec.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{rec.product_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)' }}>SKU: {rec.product_sku}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px' }}>{rec.supplier_name || 'Direct Wholesale'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)' }}>Lead: {rec.lead_time_days} days</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: rec.urgency === 'CRITICAL' ? 'var(--status-error)' : 'var(--text-charcoal)' }}>
                        {rec.current_stock} {rec.product_unit}
                      </span>
                    </td>
                    <td>{(Number(rec.avg_daily_demand) * rec.lead_time_days).toFixed(1)}</td>
                    <td>{rec.safety_stock}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{rec.reorder_point}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--primary-forest)', fontSize: '14px' }}>
                        {rec.suggested_quantity} {rec.product_unit}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-warm-gray)' }}>MOQ adjusted</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>₹{Number(rec.estimated_cost).toLocaleString('en-IN')}</div>
                    </td>
                    <td>
                      <span className={rec.urgency === 'CRITICAL' ? 'badge badge-error' : 'badge badge-warning'}>
                        {rec.urgency}
                      </span>
                    </td>
                    <td>
                      {rec.status === 'ACCEPTED' ? (
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={12} /> Accepted
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAccept(rec.id)}
                          className="btn btn-primary btn-sm"
                        >
                          Accept
                        </button>
                      )}
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
