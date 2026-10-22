import React from 'react';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  badge?: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

const plans: PricingPlan[] = [
  {
    name: 'Kirana Starter',
    price: '₹0',
    period: 'forever free',
    description: 'Perfect for single-counter neighbourhood shops getting started with sales tracking.',
    features: [
      'Up to 250 active products',
      'Daily sales analytics & trends',
      'Basic moving average forecasts',
      'Low stock warning alerts',
      'CSV file import & export',
      'Single user access',
    ],
  },
  {
    name: 'Supermarket Growth',
    price: '₹799',
    period: 'per month',
    badge: 'MOST POPULAR',
    isPopular: true,
    description: 'Ideal for established retail stores wanting automated ML forecasts & PO management.',
    features: [
      'Unlimited products & categories',
      'Multi-model ML forecasting (RF & GBDT)',
      'Automated reorder point calculation',
      'Dead stock & capital at risk analytics',
      'Supplier purchase order workflows',
      'Weekly stock review digests',
      'Up to 5 staff user logins',
    ],
  },
  {
    name: 'Distributor & Multi-Branch',
    price: '₹1,999',
    period: 'per month',
    description: 'Engineered for regional distributors and multi-outlet retail chains.',
    features: [
      'Multiple branches & warehouses',
      'Inter-branch stock transfer planning',
      'What-if scenario business simulator',
      'Role-based access controls (RBAC)',
      'Comprehensive audit trails',
      'Priority phone & WhatsApp support',
      'Dedicated migration assistance',
    ],
  },
];

interface PricingSectionProps {
  onSelectPlan: (planName: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  return (
    <section id="pricing" style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
      <motion.div
        style={{ textAlign: 'center', marginBottom: '48px' }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <span className="section-label">FAIR & TRANSPARENT</span>
        <h2 className="section-heading" style={{ marginTop: '8px' }}>
          Simple Plans for Indian Businesses
        </h2>
        <p className="section-desc" style={{ maxWidth: '600px', margin: '10px auto 0 auto' }}>
          No hidden charges. No paid API surcharges. Start free and upgrade only when your store expands.
        </p>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        alignItems: 'stretch'
      }}>
        {plans.map((p, idx) => (
          <motion.div
            key={p.name}
            style={{
              backgroundColor: p.isPopular ? 'var(--lp-ivory-surface)' : 'var(--lp-ivory-surface)',
              borderRadius: '24px',
              padding: '32px 28px',
              border: p.isPopular ? '2px solid var(--lp-forest-primary)' : '1px solid var(--lp-beige-border)',
              boxShadow: p.isPopular
                ? '0 16px 36px rgba(18, 61, 46, 0.12)'
                : '0 4px 14px rgba(18, 61, 46, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              transition: 'transform 0.25s ease',
            }}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            {p.badge && (
              <div style={{
                position: 'absolute',
                top: '-12px',
                right: '24px',
                backgroundColor: 'var(--lp-orange)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '9999px',
                letterSpacing: '0.04em',
                boxShadow: '0 2px 8px rgba(217, 121, 61, 0.3)'
              }}>
                {p.badge}
              </div>
            )}

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--lp-forest-dark)', margin: 0 }}>
                {p.name}
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--lp-secondary)', margin: '8px 0 20px 0', minHeight: '40px' }}>
                {p.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '24px' }}>
                <span style={{ fontSize: '38px', fontWeight: 800, color: 'var(--lp-forest-dark)' }}>
                  {p.price}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--lp-secondary)', fontWeight: 500 }}>
                  /{p.period}
                </span>
              </div>

              <div style={{ borderTop: '1px solid var(--lp-beige-border)', paddingTop: '20px', marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--lp-charcoal)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.04em' }}>
                  What is included:
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: 'var(--lp-charcoal)' }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--lp-sage-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Check size={12} color="var(--lp-forest-primary)" strokeWidth={3} />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => onSelectPlan(p.name)}
              className={p.isPopular ? 'btn-hero-primary' : 'btn-hero-secondary'}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>{p.price === '₹0' ? 'Start Free Today' : 'Choose ' + p.name}</span>
              <ArrowRight size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
