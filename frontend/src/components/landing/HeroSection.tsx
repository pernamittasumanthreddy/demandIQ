import React from 'react';
import {
  ArrowRight,
  Play,
  TrendingUp,
  Boxes,
  AlertTriangle,
  BarChart2,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardPreview } from './DashboardPreview';
import { HeroLeaves } from './FloatingLeaves';

interface HeroSectionProps {
  onGetStarted: () => void;
  onWatchDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
  onWatchDemo,
}) => {
  return (
    <section id="hero" className="hero-section">
      {/* Floating Animated Leaves Layer */}
      <HeroLeaves />

      <div className="hero-grid">
        {/* Left Column: Headline, CTAs, Highlights */}
        <motion.div
          className="hero-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top Badge */}
          <div className="hero-badge">
            <span style={{ fontSize: '14px' }}>↗</span>
            <span>Smarter Stock. Higher Profits.</span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-headline">
            Smarter Demand Forecasting
            <br />
            for <span className="hero-headline-highlight">Local Businesses</span>
          </h1>

          {/* Subtitle / Description */}
          <p className="hero-description">
            DemandIQ helps small shops predict product demand and plan stock levels using your sales history, so you never run out or overstock again.
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta-group">
            <button
              onClick={onGetStarted}
              className="btn-hero-primary"
              aria-label="Get Started Free with DemandIQ"
            >
              <span>Get Started Free</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={onWatchDemo}
              className="btn-hero-secondary"
              aria-label="Watch interactive demo"
            >
              <div className="play-icon-circle">
                <Play size={12} fill="#123D2E" color="#123D2E" style={{ marginLeft: '1px' }} />
              </div>
              <span>Watch Demo</span>
            </button>
          </div>

          {/* 5 Compact Feature Highlights */}
          <div className="hero-highlights-row">
            <div className="hero-highlight-item">
              <div className="hero-highlight-icon">
                <TrendingUp size={14} />
              </div>
              <span>Accurate Forecasting</span>
            </div>

            <div className="hero-highlight-item">
              <div className="hero-highlight-icon">
                <Boxes size={14} />
              </div>
              <span>Smart Reorder Suggestions</span>
            </div>

            <div className="hero-highlight-item">
              <div className="hero-highlight-icon">
                <AlertTriangle size={14} />
              </div>
              <span>Dead Stock Detection</span>
            </div>

            <div className="hero-highlight-item">
              <div className="hero-highlight-icon">
                <BarChart2 size={14} />
              </div>
              <span>Sales Analytics</span>
            </div>

            <div className="hero-highlight-item">
              <div className="hero-highlight-icon">
                <ShieldCheck size={14} />
              </div>
              <span>Secure & Reliable</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Visual Composition with Photograph & Floating Dashboard */}
        <motion.div
          className="hero-visual-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Shopkeeper Photograph Container */}
          <div className="hero-photo-wrapper">
            <img
              src="/images/shopkeeper.jpg"
              alt="Authentic Indian grocery shop owner wearing green apron standing in local store"
              className="hero-photo-img"
              loading="eager"
            />

            {/* Handwritten-Style Message Badge */}
            <div className="hero-photo-badge">
              <CheckCircle2 size={16} color="#20583D" />
              <span>Better Decisions for Your Business</span>
            </div>
          </div>

          {/* Overlapping Floating Dashboard Preview */}
          <DashboardPreview />
        </motion.div>
      </div>
    </section>
  );
};
