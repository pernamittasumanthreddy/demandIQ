import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { CtaLeaves } from './FloatingLeaves';

interface CallToActionProps {
  onGetStarted: () => void;
}

export const CallToAction: React.FC<CallToActionProps> = ({ onGetStarted }) => {
  return (
    <section className="cta-section">
      <div className="cta-banner">
        {/* Soft floating botanical leaves in corners */}
        <CtaLeaves />

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          border: '1px solid rgba(168, 185, 154, 0.35)',
          padding: '6px 16px',
          borderRadius: '9999px',
          color: 'var(--lp-sage-light)',
          fontSize: '12.5px',
          fontWeight: 700,
          position: 'relative',
          zIndex: 2,
        }}>
          <Sparkles size={14} color="var(--lp-orange)" />
          <span>ZERO-RISK LOCAL DEPLOYMENT</span>
        </div>

        <motion.h2
          className="cta-heading"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ position: 'relative', zIndex: 2 }}
        >
          Ready to Take Control
          <br />
          of Your Inventory?
        </motion.h2>

        <motion.p
          className="cta-desc"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ position: 'relative', zIndex: 2 }}
        >
          Join local businesses using DemandIQ to plan smarter, reduce dead stock, and grow with confidence.
        </motion.p>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <button
            onClick={onGetStarted}
            className="btn-cta-banner"
            aria-label="Get Started Free with DemandIQ"
          >
            <span>Get Started Free</span>
            <ArrowRight size={18} color="var(--lp-forest-dark)" />
          </button>
        </div>

        <div style={{
          display: 'flex',
          gap: '24px',
          marginTop: '8px',
          fontSize: '12.5px',
          color: 'var(--lp-sage)',
          position: 'relative',
          zIndex: 2,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={15} color="var(--lp-sage-light)" />
            <span>No credit card required</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={15} color="var(--lp-sage-light)" />
            <span>Setup in 3 minutes</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={15} color="var(--lp-sage-light)" />
            <span>Works with Excel & CSV</span>
          </div>
        </div>
      </div>
    </section>
  );
};
