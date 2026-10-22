import React from 'react';
import {
  TrendingUp,
  Boxes,
  AlertTriangle,
  BarChart3,
  Truck,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionLeaves } from './FloatingLeaves';

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  theme: 'sage' | 'orange';
}

const features: FeatureItem[] = [
  {
    icon: <TrendingUp size={22} />,
    title: 'Demand Forecasting',
    description: 'Predict future demand using historical sales and backtested forecasting models with automated model selection.',
    theme: 'sage',
  },
  {
    icon: <Boxes size={22} />,
    title: 'Reorder Recommendations',
    description: 'Get intelligent suggestions for optimal stock levels calculated with supplier lead times and safety buffer.',
    theme: 'orange',
  },
  {
    icon: <AlertTriangle size={22} />,
    title: 'Dead Stock Detection',
    description: 'Identify slow-moving and nearly expired products to liberate locked working capital before goods spoil.',
    theme: 'sage',
  },
  {
    icon: <BarChart3 size={22} />,
    title: 'Sales Analytics',
    description: 'Understand your best sellers, daily revenue trends, gross margins, and weekend shopping patterns clearly.',
    theme: 'orange',
  },
  {
    icon: <Truck size={22} />,
    title: 'Supplier Management',
    description: 'Manage regional distributors, generate official purchase orders, and track supplier delivery performance.',
    theme: 'sage',
  },
  {
    icon: <FileSpreadsheet size={22} />,
    title: 'Detailed Reports',
    description: 'Export understandable weekly summaries, valuation sheets, and forecast accuracy reports in Excel or CSV.',
    theme: 'orange',
  },
];

interface FeatureSectionProps {
  onExploreFeatures: () => void;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({ onExploreFeatures }) => {
  return (
    <section id="features" className="features-section">
      <SectionLeaves />

      <div className="features-layout">
        {/* Left Column: Title, Subtitle, CTA */}
        <motion.div
          className="features-left"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">FEATURES</span>
          <h2 className="section-heading">
            Everything You Need to
            <br />
            Run a Smarter Store
          </h2>
          <p className="section-desc">
            From sales data to stock planning, DemandIQ gives you real insights and simple tools to grow your business with confidence.
          </p>

          <div>
            <button
              onClick={onExploreFeatures}
              className="btn-hero-secondary"
              style={{ marginTop: '12px' }}
            >
              <span>Explore All Features</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>

        {/* Right Column: 6 Feature Cards Grid */}
        <div className="features-grid">
          {features.map((feat, index) => (
            <motion.div
              key={feat.title}
              className="feature-card"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <div className={`feature-icon-wrapper ${feat.theme === 'orange' ? 'orange-theme' : ''}`}>
                {feat.icon}
              </div>
              <h3 className="feature-title">{feat.title}</h3>
              <p className="feature-description">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
