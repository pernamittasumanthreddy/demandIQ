import React, { useState } from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { FeatureSection } from '../components/landing/FeatureSection';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Testimonials } from '../components/landing/Testimonials';
import { PricingSection } from '../components/landing/PricingSection';
import { CallToAction } from '../components/landing/CallToAction';
import { LandingFooter } from '../components/landing/LandingFooter';
import { DemoModal } from '../components/landing/DemoModal';
import '../styles/landing-page.css';
import '../styles/leaf-animations.css';

interface LandingPageViewProps {
  onEnterApp: (view?: string) => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onEnterApp }) => {
  const [demoModalOpen, setDemoModalOpen] = useState<boolean>(false);

  const handleGetStarted = () => {
    onEnterApp('dashboard');
  };

  const handleLogin = () => {
    onEnterApp('dashboard');
  };

  const handleWatchDemo = () => {
    setDemoModalOpen(true);
  };

  const handleExploreFeatures = () => {
    const el = document.getElementById('features');
    if (el) {
      const navOffset = 76;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="landing-wrapper">
      {/* 1. Header / Navigation with Sticky Scroll & 2-Leaf Motif */}
      <LandingNavbar
        onLoginClick={handleLogin}
        onGetStartedClick={handleGetStarted}
      />

      {/* 2. Hero Section with Photograph, Overlapping Dashboard, and Moving Leaves */}
      <HeroSection
        onGetStarted={handleGetStarted}
        onWatchDemo={handleWatchDemo}
      />

      {/* 3. Features Section (6 Balanced Cards Grid) */}
      <FeatureSection
        onExploreFeatures={handleExploreFeatures}
      />

      {/* 4. How It Works Section (4 Steps) */}
      <HowItWorks />

      {/* 5. Demonstration Case Studies / Testimonials */}
      <Testimonials />

      {/* 6. Pricing Plans for Indian Retailers */}
      <PricingSection
        onSelectPlan={(plan) => handleGetStarted()}
      />

      {/* 7. Deep Forest Green Final Call To Action */}
      <CallToAction
        onGetStarted={handleGetStarted}
      />

      {/* 8. Deep Green Footer */}
      <LandingFooter
        onEnterApp={onEnterApp}
      />

      {/* 9. Interactive Demonstration Walkthrough Modal */}
      <DemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onEnterApp={handleGetStarted}
      />
    </div>
  );
};
