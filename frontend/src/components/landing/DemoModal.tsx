import React, { useState } from 'react';
import { X, TrendingUp, Boxes, AlertTriangle, ArrowRight, CheckCircle2, Play } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterApp: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose, onEnterApp }) => {
  const [activeTab, setActiveTab] = useState<'forecast' | 'reorder' | 'deadstock'>('forecast');
  const [leadTimeDays, setLeadTimeDays] = useState<number>(4);
  const [dailyDemand, setDailyDemand] = useState<number>(18);

  if (!isOpen) return null;

  // Real calculation for reorder demonstration
  const leadTimeDemand = leadTimeDays * dailyDemand;
  const safetyStock = Math.round(1.65 * 4.2 * Math.sqrt(leadTimeDays));
  const reorderPoint = leadTimeDemand + safetyStock;
  const currentStock = 22;
  const targetStock = reorderPoint + (dailyDemand * 7);
  const suggestedOrder = Math.max(0, targetStock - currentStock);
  const estimatedCost = suggestedOrder * 120;

  return (
    <div className="demo-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="demo-modal-card" onClick={e => e.stopPropagation()}>
        <button className="demo-modal-close" onClick={onClose} aria-label="Close interactive demo modal">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'var(--lp-forest-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <Play size={14} fill="#FFFFFF" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--lp-forest-dark)', margin: 0 }}>
            DemandIQ Interactive Preview
          </h2>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--lp-secondary)', marginBottom: '20px' }}>
          Test the intelligence engine with real-time stock parameters below, or enter the live full-stack system.
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--lp-beige-border)', paddingBottom: '12px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('forecast')}
            className={activeTab === 'forecast' ? 'btn-nav-cta' : 'btn-nav-login'}
            style={{ fontSize: '13px', padding: '8px 14px' }}
          >
            <TrendingUp size={14} />
            <span>1. Demand Forecasting</span>
          </button>
          <button
            onClick={() => setActiveTab('reorder')}
            className={activeTab === 'reorder' ? 'btn-nav-cta' : 'btn-nav-login'}
            style={{ fontSize: '13px', padding: '8px 14px' }}
          >
            <Boxes size={14} />
            <span>2. Smart Reorder Engine</span>
          </button>
          <button
            onClick={() => setActiveTab('deadstock')}
            className={activeTab === 'deadstock' ? 'btn-nav-cta' : 'btn-nav-login'}
            style={{ fontSize: '13px', padding: '8px 14px' }}
          >
            <AlertTriangle size={14} />
            <span>3. Dead Capital Detection</span>
          </button>
        </div>

        {/* Tab 1: Forecast Explorer */}
        {activeTab === 'forecast' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: 'var(--lp-cream-bg)', borderRadius: '14px', padding: '16px', border: '1px solid var(--lp-beige-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 700, color: 'var(--lp-forest-dark)', fontSize: '14px' }}>
                  Product: Sona Masoori Rice (25kg Bag)
                </span>
                <span style={{ backgroundColor: 'var(--lp-sage-light)', color: 'var(--lp-forest-dark)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                  Selected: Gradient Boosting (WAPE 6.4%)
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--lp-charcoal)', lineHeight: '1.5' }}>
                The engine resamples POS receipts into a continuous daily series, detects weekly seasonality peaks on Saturdays and Sundays, and evaluates multiple candidate models (Naive, Moving Average, Exponential Smoothing, Random Forest, GBDT).
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div className="dash-metric-box">
                <div className="dash-metric-label">Avg Daily Demand</div>
                <div className="dash-metric-val">18.4 Bags</div>
                <div style={{ fontSize: '11px', color: 'var(--lp-forest-primary)', marginTop: '2px' }}>+12% weekend spike</div>
              </div>
              <div className="dash-metric-box">
                <div className="dash-metric-label">14-Day Predicted Demand</div>
                <div className="dash-metric-val">258 Bags</div>
                <div style={{ fontSize: '11px', color: 'var(--lp-secondary)', marginTop: '2px' }}>±18 bags (80% CI)</div>
              </div>
              <div className="dash-metric-box">
                <div className="dash-metric-label">Estimated Revenue</div>
                <div className="dash-metric-val">₹3,48,300</div>
                <div style={{ fontSize: '11px', color: 'var(--lp-secondary)', marginTop: '2px' }}>@ ₹1,350/bag</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Reorder Engine */}
        {activeTab === 'reorder' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: 'var(--lp-cream-bg)', borderRadius: '14px', padding: '16px', border: '1px solid var(--lp-beige-border)' }}>
              <div style={{ fontWeight: 700, color: 'var(--lp-forest-dark)', fontSize: '14px', marginBottom: '8px' }}>
                Interactive Reorder Point (ROP) Calculator
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--lp-secondary)', marginBottom: '14px' }}>
                Formula: <code style={{ backgroundColor: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--lp-beige-border)' }}>ROP = Lead Time Demand (L × d) + Safety Stock (Z × σ × √L)</code>
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--lp-charcoal)' }}>
                    Supplier Lead Time: <strong>{leadTimeDays} Days</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="14"
                    value={leadTimeDays}
                    onChange={e => setLeadTimeDays(parseInt(e.target.value))}
                    style={{ width: '100%', marginTop: '6px', accentColor: 'var(--lp-forest-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--lp-charcoal)' }}>
                    Daily Demand Rate: <strong>{dailyDemand} Units/Day</strong>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={dailyDemand}
                    onChange={e => setDailyDemand(parseInt(e.target.value))}
                    style={{ width: '100%', marginTop: '6px', accentColor: 'var(--lp-orange)' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <div className="dash-metric-box">
                <div className="dash-metric-label">Lead Time Demand</div>
                <div className="dash-metric-val">{leadTimeDemand} units</div>
              </div>
              <div className="dash-metric-box">
                <div className="dash-metric-label">Safety Buffer</div>
                <div className="dash-metric-val">{safetyStock} units</div>
              </div>
              <div className="dash-metric-box" style={{ borderColor: 'var(--lp-orange)' }}>
                <div className="dash-metric-label" style={{ color: 'var(--lp-orange)' }}>Reorder Point</div>
                <div className="dash-metric-val" style={{ color: 'var(--lp-orange)' }}>{reorderPoint} units</div>
              </div>
              <div className="dash-metric-box">
                <div className="dash-metric-label">Suggested Order</div>
                <div className="dash-metric-val">{suggestedOrder} units</div>
                <div style={{ fontSize: '10px', color: 'var(--lp-forest-primary)' }}>₹{estimatedCost.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Dead Stock */}
        {activeTab === 'deadstock' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ backgroundColor: 'var(--lp-cream-bg)', borderRadius: '14px', padding: '16px', border: '1px solid var(--lp-beige-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--lp-forest-dark)', fontSize: '14px' }}>
                  Dead Capital Flag: Premium Basmati Organic 5kg
                </span>
                <span style={{ backgroundColor: 'var(--lp-orange-light)', color: 'var(--lp-orange)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                  84 Days Without Sale
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--lp-charcoal)', marginTop: '8px', lineHeight: '1.5' }}>
                DemandIQ flagged 18 unsold bags tying up <strong>₹12,420 in working capital</strong>. Shelf life remaining: 45 days.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, backgroundColor: 'var(--lp-ivory-surface)', border: '1px solid var(--lp-beige-border)', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--lp-forest-dark)', marginBottom: '4px' }}>Recommended Action</div>
                <p style={{ fontSize: '12.5px', color: 'var(--lp-secondary)', margin: 0 }}>
                  Create bundle promotion with Sona Masoori Rice @ 10% discount to liquidate capital before expiry.
                </p>
              </div>
              <div style={{ width: '160px', backgroundColor: 'var(--lp-sage-light)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--lp-forest-dark)', fontWeight: 600 }}>Capital Recoverable</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--lp-forest-dark)', marginTop: '4px' }}>₹11,178</div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Bottom CTA */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--lp-beige-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--lp-secondary)' }}>
            <CheckCircle2 size={15} color="var(--lp-forest-primary)" />
            <span>Pre-loaded with Sri Lakshmi Supermarket demonstration dataset</span>
          </div>
          <button
            onClick={() => {
              onClose();
              onEnterApp();
            }}
            className="btn-hero-primary"
            style={{ padding: '10px 20px', fontSize: '14px' }}
          >
            <span>Launch Live App Dashboard</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
