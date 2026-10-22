import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  FileText,
  Boxes,
  Truck,
  IndianRupee,
  ShoppingCart,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { ReorderRecommendation } from '../types';
import { useLanguage } from '../services/LanguageContext';

interface ReplenishmentViewProps {
  onNavigate: (view: string) => void;
}

export const ReplenishmentView: React.FC<ReplenishmentViewProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const [recommendations, setRecommendations] = useState<ReorderRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

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

  const handleCreateDraftPO = async (rec: ReorderRecommendation) => {
    try {
      const qty = Number(rec.suggested_quantity) || 1;
      const cost = Number(rec.estimated_cost) || 0;
      await ApiClient.post('/procurement/purchase-orders/', {
        supplier_id: rec.preferred_supplier || null,
        items: [
          {
            product_id: rec.product,
            quantity: qty,
            unit_cost: cost / qty
          }
        ],
        notes: `Auto-generated from DemandIQ Reorder Suggestion for ${rec.product_name}`
      });
      alert(`Purchase Order draft created for ${rec.product_name}!`);
      onNavigate('procurement');
    } catch (e: any) {
      alert(`Could not create PO: ${e.message}`);
    }
  };

  const toggleRowExpand = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
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
        paddingBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 className="editorial-title" style={{ fontSize: '28px', color: 'var(--text-charcoal)' }}>
            {t('replenishment')}
          </h1>
          <p style={{ color: 'var(--text-warm-gray)', fontSize: '14px', marginTop: '4px' }}>
            Lead-Time Demand, Safety Buffer (95% Service Level), MOQs, and Order Multiples
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
            Based on store sales velocity
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Critical Stockout Warnings</div>
          <div className="metric-value" style={{ color: criticalCount > 0 ? 'var(--status-error)' : 'var(--text-charcoal)' }}>
            {criticalCount} Items
          </div>
          <div className="metric-sub" style={{ color: 'var(--status-error)' }}>
            Stockout risk within supplier lead time
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
                <th>Supplier & Lead</th>
                <th>Current Stock</th>
                <th>Reorder Level</th>
                <th>Suggested Order</th>
                <th>Est. Cost</th>
                <th>Urgency</th>
                <th>Reason / Explain</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-warm-gray)' }}>
                    No items in this category need reordering right now. All inventory positions healthy.
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => {
                  const isExpanded = expandedRowId === rec.id;
                  const ltd = (Number(rec.avg_daily_demand || 1) * rec.lead_time_days).toFixed(1);

                  return (
                    <React.Fragment key={rec.id}>
                      <tr style={{ backgroundColor: isExpanded ? 'var(--primary-forest-soft)' : undefined }}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{rec.product_name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)' }}>SKU: {rec.product_sku}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{rec.supplier_name || 'Direct Wholesale'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)' }}>{rec.lead_time_days} days delivery</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, color: rec.urgency === 'CRITICAL' ? 'var(--status-error)' : 'var(--text-charcoal)' }}>
                            {rec.current_stock} {rec.product_unit}
                          </span>
                          <div style={{ fontSize: '10.5px', color: 'var(--text-warm-gray)' }}>
                            {rec.estimated_stockout_days ? `Stockout in ~${rec.estimated_stockout_days}d` : ''}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '13px' }}>{rec.reorder_point} {rec.product_unit}</div>
                          <div style={{ fontSize: '10.5px', color: 'var(--text-warm-gray)' }}>LTD: {ltd} + Safety: {rec.safety_stock}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--primary-forest)', fontSize: '15px' }}>
                            {rec.suggested_quantity} {rec.product_unit}
                          </div>
                          <div style={{ fontSize: '10.5px', color: 'var(--text-warm-gray)' }}>MOQ & pack rounded</div>
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
                          <button
                            onClick={() => toggleRowExpand(rec.id)}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--border-beige)',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '11.5px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer',
                              color: 'var(--primary-forest)',
                              fontWeight: 600
                            }}
                          >
                            <Info size={13} />
                            <span>{isExpanded ? 'Hide' : 'Explain'}</span>
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {rec.status === 'ACCEPTED' ? (
                              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle size={12} /> Accepted
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAccept(rec.id)}
                                className="btn btn-secondary btn-sm"
                                title="Accept recommendation"
                              >
                                Accept
                              </button>
                            )}
                            <button
                              onClick={() => handleCreateDraftPO(rec)}
                              className="btn btn-primary btn-sm"
                              title="Create draft purchase order for this item"
                            >
                              Create PO
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Explanation Breakdown */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={9} style={{ backgroundColor: 'var(--surface-cream)', padding: '16px 20px', borderBottom: '2px solid var(--border-beige)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-forest)' }}>
                                <HelpCircle size={16} />
                                <span style={{ fontWeight: 700, fontSize: '13px' }}>
                                  Mathematical Explanation for {rec.product_name}:
                                </span>
                              </div>

                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '12px',
                                fontSize: '12px',
                                backgroundColor: '#FFFDF8',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-subtle)'
                              }}>
                                <div>
                                  <span style={{ color: 'var(--text-warm-gray)' }}>Average Daily Demand (d):</span>
                                  <div style={{ fontWeight: 700, color: 'var(--text-charcoal)' }}>{Number(rec.avg_daily_demand).toFixed(2)} units / day</div>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--text-warm-gray)' }}>Supplier Delivery Lead (L):</span>
                                  <div style={{ fontWeight: 700, color: 'var(--text-charcoal)' }}>{rec.lead_time_days} days</div>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--text-warm-gray)' }}>Lead-Time Demand (d × L):</span>
                                  <div style={{ fontWeight: 700, color: 'var(--text-charcoal)' }}>{ltd} units</div>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--text-warm-gray)' }}>Safety Buffer (Z × σ × √L):</span>
                                  <div style={{ fontWeight: 700, color: 'var(--primary-forest)' }}>+{rec.safety_stock} units</div>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--text-warm-gray)' }}>Reorder Point (ROP):</span>
                                  <div style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>{rec.reorder_point} units (Current: {rec.current_stock})</div>
                                </div>
                              </div>

                              <p style={{ fontSize: '12.5px', color: 'var(--text-charcoal-subtle)', margin: 0 }}>
                                <strong>Logic:</strong> Current stock ({rec.current_stock}) has dropped below the reorder threshold ({rec.reorder_point}). To prevent running out before the supplier can deliver in {rec.lead_time_days} days, an order of {rec.suggested_quantity} units is suggested (rounded to supplier MOQ & packaging bundle constraints).
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
