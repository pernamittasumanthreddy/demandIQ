import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage, Language } from '../../services/LanguageContext';

interface LandingNavbarProps {
  onLoginClick: () => void;
  onGetStartedClick: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  onLoginClick,
  onGetStartedClick,
  onNavigateSection,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Determine active section
      const sections = ['hero', 'features', 'how-it-works', 'testimonials', 'pricing', 'contact'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 140) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
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

  const getNavLabel = (key: string) => {
    switch (key) {
      case 'home':
        return language === 'hi' ? 'होम' : language === 'te' ? 'హోమ్' : 'Home';
      case 'features':
        return language === 'hi' ? 'सुविधाएं' : language === 'te' ? 'ఫీచర్లు' : 'Features';
      case 'how-it-works':
        return language === 'hi' ? 'कार्यविधि' : language === 'te' ? 'ఎలా పనిచేస్తుంది' : 'How It Works';
      case 'testimonials':
        return language === 'hi' ? 'समीक्षाएं' : language === 'te' ? 'అనుభవాలు' : 'Testimonials';
      case 'pricing':
        return language === 'hi' ? 'योजनाएं' : language === 'te' ? 'ధరలు' : 'Pricing';
      case 'contact':
        return language === 'hi' ? 'संपर्क' : language === 'te' ? 'సంప్రదించండి' : 'Contact';
      default:
        return key;
    }
  };

  return (
    <header className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="landing-nav-inner">
        {/* Brand Logo with 2-Leaf Motif */}
        <div className="landing-logo-group" onClick={() => scrollTo('hero')}>
          <div className="landing-logo-icon">
            {/* Custom 2-Leaf Brand SVG Motif */}
            <svg viewBox="0 0 32 32" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16 4 C8 12 6 22 16 28 C26 22 24 12 16 4 Z"
                fill="#A8B99A"
              />
              <path
                d="M16 12 C10 17 9 24 16 28 C23 24 22 17 16 12 Z"
                fill="#D9793D"
              />
              <path
                d="M16 8 L16 28"
                stroke="#123D2E"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="landing-logo-text">
            <span className="landing-brand-name">DemandIQ</span>
            <span className="landing-brand-tagline">
              {language === 'hi' ? 'मांग का पूर्वानुमान • सटीक स्टॉक' : language === 'te' ? 'డిమాండ్ అంచనా • సరైన స్టాక్' : 'Know What Sells. Stock What Matters.'}
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav>
          <ul className="landing-nav-links">
            <li>
              <span
                className={`landing-nav-link ${activeSection === 'hero' ? 'active' : ''}`}
                onClick={() => scrollTo('hero')}
              >
                {getNavLabel('home')}
              </span>
            </li>
            <li>
              <span
                className={`landing-nav-link ${activeSection === 'features' ? 'active' : ''}`}
                onClick={() => scrollTo('features')}
              >
                {getNavLabel('features')}
              </span>
            </li>
            <li>
              <span
                className={`landing-nav-link ${activeSection === 'how-it-works' ? 'active' : ''}`}
                onClick={() => scrollTo('how-it-works')}
              >
                {getNavLabel('how-it-works')}
              </span>
            </li>
            <li>
              <span
                className={`landing-nav-link ${activeSection === 'testimonials' ? 'active' : ''}`}
                onClick={() => scrollTo('testimonials')}
              >
                {getNavLabel('testimonials')}
              </span>
            </li>
            <li>
              <span
                className={`landing-nav-link ${activeSection === 'pricing' ? 'active' : ''}`}
                onClick={() => scrollTo('pricing')}
              >
                {getNavLabel('pricing')}
              </span>
            </li>
            <li>
              <span
                className={`landing-nav-link ${activeSection === 'contact' ? 'active' : ''}`}
                onClick={() => scrollTo('contact')}
              >
                {getNavLabel('contact')}
              </span>
            </li>
          </ul>
        </nav>

        {/* Action Buttons & Language Switcher */}
        <div className="landing-nav-actions">
          {/* Language Selector */}
          <div style={{
            display: 'flex',
            backgroundColor: 'rgba(18, 61, 46, 0.06)',
            borderRadius: '8px',
            padding: '2px',
            border: '1px solid var(--lp-beige-border)'
          }}>
            {(['en', 'hi', 'te'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: language === l ? 700 : 500,
                  backgroundColor: language === l ? 'var(--lp-forest-dark)' : 'transparent',
                  color: language === l ? '#FFFFFF' : 'var(--lp-charcoal)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={l === 'en' ? 'English' : l === 'hi' ? 'हिंदी (Hindi)' : 'తెలుగు (Telugu)'}
              >
                {l === 'en' ? 'EN' : l === 'hi' ? 'हिन्दी' : 'తెలుగు'}
              </button>
            ))}
          </div>

          <button
            onClick={onLoginClick}
            className="btn-nav-login"
            aria-label="Log in to DemandIQ"
          >
            {t('login')}
          </button>
          <button
            onClick={onGetStartedClick}
            className="btn-nav-cta"
            aria-label="Get Started Free"
          >
            <span>{t('getStarted')}</span>
            <ArrowRight size={15} />
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <span className="landing-nav-link" onClick={() => scrollTo('hero')}>{getNavLabel('home')}</span>
          <span className="landing-nav-link" onClick={() => scrollTo('features')}>{getNavLabel('features')}</span>
          <span className="landing-nav-link" onClick={() => scrollTo('how-it-works')}>{getNavLabel('how-it-works')}</span>
          <span className="landing-nav-link" onClick={() => scrollTo('testimonials')}>{getNavLabel('testimonials')}</span>
          <span className="landing-nav-link" onClick={() => scrollTo('pricing')}>{getNavLabel('pricing')}</span>
          <span className="landing-nav-link" onClick={() => scrollTo('contact')}>{getNavLabel('contact')}</span>
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--lp-beige-border)' }}>
            <button onClick={onLoginClick} className="btn-nav-login" style={{ flex: 1 }}>
              {t('login')}
            </button>
            <button onClick={onGetStartedClick} className="btn-nav-cta" style={{ flex: 1, justifyContent: 'center' }}>
              <span>{t('getStarted')}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
