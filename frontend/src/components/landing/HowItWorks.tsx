import React from 'react';
import {
  UserPlus,
  FileUp,
  LineChart,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    step: '1',
    icon: <UserPlus size={22} color="var(--lp-forest-primary)" />,
    title: 'Create Your Account',
    description: 'Sign up in 30 seconds and enter your store name, branches, and regional currency settings.',
  },
  {
    step: '2',
    icon: <FileUp size={22} color="var(--lp-orange)" />,
    title: 'Import Sales Data',
    description: 'Upload your sales history via Excel/CSV or connect your manual billing records seamlessly.',
  },
  {
    step: '3',
    icon: <LineChart size={22} color="var(--lp-forest-primary)" />,
    title: 'Get Forecasts & Insights',
    description: 'Review demand predictions, reorder points, dead stock warnings, and seasonal trends.',
  },
  {
    step: '4',
    icon: <TrendingUp size={22} color="var(--lp-orange)" />,
    title: 'Grow Your Business',
    description: 'Make smarter purchasing decisions, eliminate stockouts, and free up working capital.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="how-it-works-section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <span className="section-label">SIMPLE WORKFLOW</span>
        <h2 className="section-heading" style={{ marginTop: '8px' }}>
          Get Started in 4 Simple Steps
        </h2>
        <p className="section-desc" style={{ maxWidth: '600px', margin: '10px auto 0 auto' }}>
          From sign up to smart recommendations — all in a few clicks.
        </p>
      </motion.div>

      <div className="steps-grid">
        {steps.map((item, index) => (
          <motion.div
            key={item.step}
            className="step-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.12 }}
          >
            <div className="step-icon-row">
              <div className="step-number-badge">{item.step}</div>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'var(--lp-cream-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--lp-beige-border)'
              }}>
                {item.icon}
              </div>
            </div>

            <h3 className="step-title">{item.title}</h3>
            <p className="step-desc">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
