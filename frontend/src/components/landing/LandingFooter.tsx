import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';
import { FooterLeaves } from './FloatingLeaves';

interface LandingFooterProps {
  onNavigateSection?: (sectionId: string) => void;
  onEnterApp?: (view?: string) => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onNavigateSection,
  onEnterApp,
}) => {
  const scrollTo = (id: string) => {
    if (onNavigateSection) {
      onNavigateSection(id);
    }
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 76;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer id="contact" className="landing-footer">
      <FooterLeaves />

      <div className="footer-inner">
        {/* Brand & Purpose Column */}
        <div className="footer-brand-col">
          <div className="footer-logo-row">
            <div className="landing-logo-icon">
              <svg viewBox="0 0 32 32" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4 C8 12 6 22 16 28 C26 22 24 12 16 4 Z" fill="#A8B99A" />
                <path d="M16 12 C10 17 9 24 16 28 C23 24 22 17 16 12 Z" fill="#D9793D" />
                <path d="M16 8 L16 28" stroke="#123D2E" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="footer-brand-title">DemandIQ</span>
          </div>

          <p className="footer-tagline">
            Know What Sells. Stock What Matters. Grow with Confidence.
          </p>

          <div className="footer-india-badge">
            <Heart size={14} color="#D9793D" fill="#D9793D" />
            <span>Built with Pride for Indian Retailers</span>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--lp-sage)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#A8B99A" />
            <span>Strict Tenant Isolation & Data Privacy</span>
          </div>
        </div>

        {/* Product Capabilities */}
        <div>
          <div className="footer-col-title">Platform</div>
          <ul className="footer-links-list">
            <li className="footer-link-item">
              <a onClick={() => scrollTo('features')}>Demand Forecasting</a>
            </li>
            <li className="footer-link-item">
              <a onClick={() => scrollTo('features')}>Reorder Recommendations</a>
            </li>
            <li className="footer-link-item">
              <a onClick={() => scrollTo('features')}>Dead Stock & Expiry</a>
            </li>
            <li className="footer-link-item">
              <a onClick={() => scrollTo('features')}>Sales Ingestion & POS</a>
            </li>
            <li className="footer-link-item">
              <a onClick={() => scrollTo('features')}>What-If Simulator</a>
            </li>
          </ul>
        </div>

        {/* Solutions & Workflows */}
        <div>
          <div className="footer-col-title">Retailers</div>
          <ul className="footer-links-list">
            <li className="footer-link-item">
              <a onClick={() => scrollTo('testimonials')}>Kirana & Supermarkets</a>
            </li>
            <li className="footer-link-item">
              <a onClick={() => scrollTo('testimonials')}>Pharmacies & Chemists</a>
            </li>
            <li className="footer-link-item">
              <a onClick={() => scrollTo('testimonials')}>Stationery & General</a>
            </li>
            <li className="footer-link-item">
              <a onClick={() => scrollTo('pricing')}>Regional Wholesalers</a>
            </li>
            <li className="footer-link-item">
              <a onClick={() => onEnterApp && onEnterApp('dashboard')}>Live Demo Store</a>
            </li>
          </ul>
        </div>

        {/* Resources & Security */}
        <div>
          <div className="footer-col-title">Resources</div>
          <ul className="footer-links-list">
            <li className="footer-link-item">
              <a onClick={() => scrollTo('how-it-works')}>How It Works</a>
            </li>
            <li className="footer-link-item">
              <a onClick={() => scrollTo('pricing')}>Pricing Plans</a>
            </li>
            <li className="footer-link-item">
              <a href="/api/docs/" target="_blank" rel="noopener noreferrer">REST API Docs</a>
            </li>
            <li className="footer-link-item">
              <a onClick={() => scrollTo('hero')}>System Architecture</a>
            </li>
            <li className="footer-link-item">
              <a onClick={() => alert('Support Desk: support@demandiq.local\nPhone: +91 80 4920 1800 (Mon-Sat 9AM-7PM IST)')}>Contact Support</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div>
          © {new Date().getFullYear()} DemandIQ Technologies Private Limited. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>Strict Zero-Blue Palette Compliance</span>
          <span>100% On-Premise & Local Processing</span>
          <span>OpenAPI 3.0 Documented</span>
        </div>
      </div>
    </footer>
  );
};
