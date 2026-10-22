import React, { useEffect, useState } from 'react';
import {
  Boxes,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  Building2,
  CheckCircle,
  X
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { InventoryBalance } from '../types';

export const InventoryView: React.FC = () => {
  const [balances, setBalances] = useState<InventoryBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<InventoryBalance | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<string>('MANUAL_ADJUSTMENT');
  const [adjustNotes, setAdjustNotes] = useState<string>('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    loadBalances();
  }, []);

  const loadBalances = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.get<any>('/inventory/balances/');
      setBalances(res.results || (Array.isArray(res) ? res : []));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdjust = (balance: InventoryBalance) => {
    setSelectedBalance(balance);
    setAdjustQty(0);
    setAdjustNotes('');
    setShowAdjustModal(true);
  };

  const handleSubmitAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBalance || adjustQty === 0) return;
    setAdjusting(true);
    try {
      await ApiClient.post('/inventory/balances/adjust/', {
        product_id: selectedBalance.product,
        branch_id: selectedBalance.branch,
        delta_quantity: adjustQty,
        movement_type: adjustType,
        reason_notes: adjustNotes || 'Physical inventory audit',
      });
      setShowAdjustModal(false);
      await loadBalances();
    } catch (err: any) {
      alert(`Adjustment error: ${err.message}`);
    } finally {
      setAdjusting(false);
    }
  };

  const totalPhysicalUnits = balances.reduce((acc, b) => acc + Number(b.quantity || 0), 0);
  const totalValuation = balances.reduce((acc, b) => acc + (Number(b.quantity || 0) * Number(b.cost_price || 0)), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-beige)',
        paddingBottom: '16px'
      }}>
        <div>
          <h1 className="editorial-title" style={{ fontSize: '28px', color: 'var(--text-charcoal)' }}>
            Branch Inventory Balances
          </h1>
          <p style={{ color: 'var(--text-warm-gray)', fontSize: '14px', marginTop: '4px' }}>
            Atomic real-time tracking of on-hand physical stock, reserved allocations, and pending POs
          </p>
        </div>
        <button onClick={loadBalances} className="btn btn-secondary">
          <RefreshCw size={15} color="var(--primary-forest)" />
          <span>Refresh Balances</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="metric-card">
          <div className="metric-label">Total Physical Stock on Hand</div>
          <div className="metric-value">{totalPhysicalUnits.toFixed(0)} Units</div>
          <div className="metric-sub" style={{ color: 'var(--text-warm-gray)' }}>
            Across all retail branches
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Total Inventory Valuation (Cost)</div>
          <div className="metric-value">₹{totalValuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          <div className="metric-sub" style={{ color: 'var(--primary-forest)' }}>
            Wholesale carrying value
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Monitored SKU Locations</div>
          <div className="metric-value">{balances.length}</div>
          <div className="metric-sub">
            Audited balances
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card" style={{ padding: '20px' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product / SKU</th>
                <th>Branch Location</th>
                <th>Physical On-Hand</th>
                <th>Reserved</th>
                <th>Incoming POs</th>
                <th>Inventory Position</th>
                <th>Unit Cost</th>
                <th>Total Valuation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {balances.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-warm-gray)' }}>
                    No inventory balances recorded. Seed demo data to initialize.
                  </td>
                </tr>
              ) : (
                balances.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.product_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)' }}>SKU: {b.product_sku}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={13} color="var(--text-warm-gray)" />
                        <span>{b.branch_name}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>
                        {b.quantity} {b.product_unit}
                      </span>
                    </td>
                    <td>{b.reserved_quantity}</td>
                    <td>
                      <span style={{ color: Number(b.incoming_quantity) > 0 ? 'var(--primary-forest)' : 'inherit' }}>
                        +{b.incoming_quantity}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary-forest)' }}>
                        {b.inventory_position}
                      </span>
                    </td>
                    <td>₹{Number(b.cost_price).toFixed(2)}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        ₹{(Number(b.quantity) * Number(b.cost_price)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenAdjust(b)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '12px' }}
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedBalance && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(48, 47, 43, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="card" style={{ width: '420px', maxWidth: '90%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Adjust Physical Stock</h2>
              <button onClick={() => setShowAdjustModal(false)} className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--text-charcoal-subtle)' }}>
              <div><strong>Item:</strong> {selectedBalance.product_name}</div>
              <div><strong>Branch:</strong> {selectedBalance.branch_name}</div>
              <div><strong>Current Stock:</strong> {selectedBalance.quantity} {selectedBalance.product_unit}</div>
            </div>

            <form onSubmit={handleSubmitAdjust}>
              <div className="form-group">
                <label className="form-label">Quantity Change (+/-)</label>
                <input
                  type="number"
                  step="any"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. +10 or -5"
                  className="form-input"
                  required
                />
                <span style={{ fontSize: '11px', color: 'var(--text-warm-gray)' }}>
                  Enter positive number for additions, negative for write-offs.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Adjustment Reason</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="form-select"
                >
                  <option value="MANUAL_ADJUSTMENT">Manual Physical Stock Count</option>
                  <option value="DAMAGED_EXPIRY">Damaged or Expired Write-off</option>
                  <option value="RETURN_RESTOCK">Customer Restock / Return</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Notes & Audit Reference</label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Weekly physical count difference"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAdjustModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={adjusting} className="btn btn-primary">
                  {adjusting ? 'Saving Audit...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
