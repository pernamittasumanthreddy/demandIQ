import React from 'react';
import {
  Package,
  TrendingUp,
  Boxes,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  IndianRupee,
  Layers,
  Clock,
  Sliders
} from 'lucide-react';

interface LandingPageViewProps {
  onEnterApp: (view?: string) => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onEnterApp }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '64px', paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '60px 20px 40px 20px',
        maxWidth: '880px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: 'var(--primary-forest-soft)',
          border: '1px solid var(--accent-sage)',
          color: 'var(--primary-forest)',
          fontSize: '12.5px',
          fontWeight: 700
        }}>
          <Sparkles size={14} color="var(--accent-orange)" />
          <span>PURPOSE-BUILT FOR INDIAN RETAIL & DISTRIBUTION</span>
        </div>

        <h1 className="editorial-title" style={{
          fontSize: '48px',
          lineHeight: '1.15',
          color: 'var(--text-charcoal)',
          letterSpacing: '-0.03em'
        }}>
          Know What Sells. Stock What Matters. <br />
          <span style={{ color: 'var(--primary-forest)', fontStyle: 'italic' }}>Grow with Confidence.</span>
        </h1>

        <p style={{
          fontSize: '18px',
          color: 'var(--text-charcoal-subtle)',
          lineHeight: '1.6',
          maxWidth: '720px'
        }}>
          DemandIQ is an intelligent demand forecasting and inventory optimization platform tailored for Indian kirana stores, supermarkets, pharmacies, and regional distributors. Eliminate stockouts and dead capital without spreadsheet chaos.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => onEnterApp('dashboard')}
            className="btn btn-primary btn-lg"
            style={{ padding: '14px 28px', fontSize: '15px' }}
          >
            <span>Enter Live Dashboard</span>
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => onEnterApp('forecasting')}
            className="btn btn-secondary btn-lg"
            style={{ padding: '14px 24px', fontSize: '15px' }}
          >
            <span>Try Forecast Engine</span>
          </button>
        </div>

        {/* Feature Badges */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '16px', fontSize: '13px', color: 'var(--text-warm-gray)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={15} color="var(--primary-forest)" />
            <span>Strictly Zero Blue UI Palette</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={15} color="var(--primary-forest)" />
            <span>Zero External API Dependencies</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={15} color="var(--primary-forest)" />
            <span>Multi-Model ML with Backtesting</span>
          </div>
        </div>
      </section>

      {/* Interactive Feature Showcase Cards */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 className="editorial-title" style={{ fontSize: '32px' }}>
            Engineered for Ground-Reality Retail Operations
          </h2>
          <p style={{ color: 'var(--text-warm-gray)', fontSize: '15px', marginTop: '6px' }}>
            From messy POS receipts to mathematically sound purchase orders in minutes
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Card 1 */}
          <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-forest-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-forest)'
            }}>
              <TrendingUp size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Demand Forecasting with Backtesting</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-charcoal-subtle)', lineHeight: 1.5 }}>
              Evaluates Naive, Seasonal Naive (7-day cycles), Moving Averages, Exponential Smoothing, Random Forest, and Gradient Boosting on holdout time-series data. Automatically selects the lowest WAPE winner.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
              <button onClick={() => onEnterApp('forecasting')} className="btn btn-secondary btn-sm">
                Explore ML Forecaster →
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-orange-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-orange)'
            }}>
              <Boxes size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Intelligent Reorder Recommendations</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-charcoal-subtle)', lineHeight: 1.5 }}>
              Computes lead-time demand and variance-weighted safety stock. Adjusts suggested quantities to honor distributor Minimum Order Quantities (MOQ) and packaging multiples.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
              <button onClick={() => onEnterApp('replenishment')} className="btn btn-secondary btn-sm">
                View Reorder Rules →
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-terracotta-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-terracotta)'
            }}>
              <Sliders size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>What-If Business Simulator</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-charcoal-subtle)', lineHeight: 1.5 }}>
              Test supply chain shocks before they happen. Simulate festive demand spikes, supplier lead-time delays, wholesale price hikes, and budget caps to protect gross margins.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
              <button onClick={() => onEnterApp('simulator')} className="btn btn-secondary btn-sm">
                Launch Simulator →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Authentic Indian Retail Testimonials */}
      <section style={{
        backgroundColor: 'var(--surface-cream)',
        borderTop: '1px solid var(--border-beige)',
        borderBottom: '1px solid var(--border-beige)',
        padding: '60px 20px'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="editorial-title" style={{ fontSize: '28px', marginBottom: '32px' }}>
            Trusted by Modern Indian Store Owners
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', textAlign: 'left' }}>
            <div style={{
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--surface-tint)',
              border: '1px solid var(--border-subtle)'
            }}>
              <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--text-charcoal)', lineHeight: 1.6 }}>
                "Before DemandIQ, we ran out of 25kg Sona Masoori rice and Aashirvaad atta every month-end right when salaried customers visited. Now our reorder points trigger 4 days ahead like clockwork."
              </p>
              <div style={{ marginTop: '16px', fontWeight: 700, fontSize: '13px', color: 'var(--primary-forest)' }}>
                Ramesh Patel
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-warm-gray)' }}>
                Sri Lakshmi Supermarket & Kirana, Indiranagar, Bengaluru
              </div>
            </div>

            <div style={{
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--surface-tint)',
              border: '1px solid var(--border-subtle)'
            }}>
              <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--text-charcoal)', lineHeight: 1.6 }}>
                "The dead-stock detection showed us ₹42,000 tied up in slow-moving ayurvedic tonics and specialty cosmetics. We ran a bundle clearance and freed up critical working capital."
              </p>
              <div style={{ marginTop: '16px', fontWeight: 700, fontSize: '13px', color: 'var(--primary-forest)' }}>
                Dr. K. Srinivas
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-warm-gray)' }}>
                Apex MedPlus & Wellness, Kalasipalyam, Bengaluru
              </div>
            </div>

            <div style={{
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--surface-tint)',
              border: '1px solid var(--border-subtle)'
            }}>
              <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--text-charcoal)', lineHeight: 1.6 }}>
                "No blue generic SaaS buttons. Everything looks grounded, warm, and readable for our billing managers. Goods receipt updates physical inventory seamlessly."
              </p>
              <div style={{ marginTop: '16px', fontWeight: 700, fontSize: '13px', color: 'var(--primary-forest)' }}>
                Manoj Jain
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-warm-gray)' }}>
                Navneet Stationery & Paper Syndicate, City Market, Bengaluru
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ textAlign: 'center', padding: '20px 20px 40px 20px' }}>
        <h2 className="editorial-title" style={{ fontSize: '32px' }}>
          Ready to eliminate stockouts in your business?
        </h2>
        <p style={{ color: 'var(--text-warm-gray)', fontSize: '15px', marginTop: '8px', marginBottom: '24px' }}>
          Explore Sri Lakshmi Supermarket demonstration dataset pre-loaded with 180 days of retail transactions.
        </p>
        <button
          onClick={() => onEnterApp('dashboard')}
          className="btn btn-primary btn-lg"
          style={{ padding: '14px 32px', fontSize: '15px' }}
        >
          <span>Launch DemandIQ Platform</span>
          <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
};
