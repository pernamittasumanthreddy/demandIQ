import React, { useEffect, useState } from 'react';
import {
  CalendarCheck,
  Printer,
  Download,
  AlertOctagon,
  Boxes,
  TrendingUp,
  FileText,
  IndianRupee,
  CheckCircle2
} from 'lucide-react';
import { ApiClient } from '../services/api';

export const WeeklyReviewView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReview();
  }, []);

  const loadReview = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.get<any>('/reporting/weekly-review/');
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '960px', margin: '0 auto' }}>
      {/* Action Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-beige)',
        paddingBottom: '16px'
      }}>
        <div>
          <h1 className="editorial-title" style={{ fontSize: '28px', color: 'var(--text-charcoal)' }}>
            Weekly Stock & Business Review
          </h1>
          <p style={{ color: 'var(--text-warm-gray)', fontSize: '14px', marginTop: '4px' }}>
            Prepared for Sri Lakshmi Supermarket & Kirana • Period: {data?.review_period || 'Last 7 Days'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handlePrint} className="btn btn-secondary">
            <Printer size={15} color="var(--primary-forest)" />
            <span>Print Digest</span>
          </button>
        </div>
      </div>

      {/* Printable Paper Document Container */}
      <div className="card" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '28px', backgroundColor: '#FFFFFF' }}>
        {/* Document Masthead */}
        <div style={{ borderBottom: '2px solid var(--primary-forest)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 800, color: 'var(--primary-forest)' }}>
              DemandIQ Weekly Intelligence Digest
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-charcoal-subtle)', marginTop: '2px' }}>
              Know What Sells. Stock What Matters.
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-warm-gray)' }}>
            <div>Review Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            <div>Store: Indiranagar Flagship, Bengaluru</div>
          </div>
        </div>

        {/* Executive Summary Metrics Box */}
        <div style={{ backgroundColor: 'var(--surface-tint)', borderRadius: 'var(--radius-md)', padding: '20px', border: '1px solid var(--border-beige)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-forest)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
            Weekly Operational Summary
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)', fontWeight: 600 }}>7-DAY REVENUE</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-charcoal)' }}>
                ₹{Number(data?.executive_summary?.weekly_revenue || 64200).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)' }}>{data?.executive_summary?.weekly_orders || 184} customer bills</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)', fontWeight: 600 }}>CRITICAL REORDERS</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--status-error)' }}>
                {data?.executive_summary?.critical_reorder_count || 1} SKUs
              </div>
              <div style={{ fontSize: '11px', color: 'var(--status-error)' }}>Immediate runout risk</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)', fontWeight: 600 }}>REORDER CAPITAL NEEDED</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-orange)' }}>
                ₹{Number(data?.executive_summary?.total_reorder_investment || 24600).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)' }}>Estimated wholesale total</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)', fontWeight: 600 }}>LOCKED DEAD CAPITAL</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-terracotta)' }}>
                ₹{Number(data?.executive_summary?.idle_capital_at_risk || 18400).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)' }}>In zero-demand stock</div>
            </div>
          </div>
        </div>

        {/* Manager Action Items */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
            Critical Stock Action Items for Store Manager
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data?.action_highlights?.map((act: any, i: number) => (
              <div
                key={i}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: act.type === 'CRITICAL_REORDER' ? 'var(--status-error-bg)' : (act.type === 'DEAD_STOCK' ? 'var(--status-warning-bg)' : 'var(--surface-cream)'),
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <div style={{ marginTop: '2px' }}>
                  {act.type === 'CRITICAL_REORDER' ? (
                    <AlertOctagon size={18} color="var(--status-error)" />
                  ) : (
                    <CheckCircle2 size={18} color="var(--primary-forest)" />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-charcoal)' }}>{act.title}</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-charcoal-subtle)', marginTop: '2px', lineHeight: 1.4 }}>
                    {act.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Recommended Reorder Actions */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
            Priority Reorder Schedule
          </h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product SKU</th>
                  <th>Current Stock</th>
                  <th>Recommended Order</th>
                  <th>Wholesale Cost</th>
                  <th>Urgency Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.top_reorders?.map((r: any, idx: number) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.product_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)' }}>{r.sku}</div>
                    </td>
                    <td>{r.current_stock}</td>
                    <td>
                      <strong style={{ color: 'var(--primary-forest)' }}>{r.suggested_quantity}</strong>
                    </td>
                    <td>₹{Number(r.cost).toLocaleString('en-IN')}</td>
                    <td>
                      <span className={r.urgency === 'CRITICAL' ? 'badge badge-error' : 'badge badge-warning'}>
                        {r.urgency}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sign-off footer */}
        <div style={{ borderTop: '1px solid var(--border-beige)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-warm-gray)' }}>
          <div>Store Manager Signature: ______________________</div>
          <div>Inventory Supervisor: ______________________</div>
          <div>Date: ____ / ____ / 2026</div>
        </div>
      </div>
    </div>
  );
};
