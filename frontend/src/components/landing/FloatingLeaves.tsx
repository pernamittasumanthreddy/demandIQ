import React from 'react';
import '../../styles/leaf-animations.css';

export type LeafColor = 'forest-dark' | 'forest-primary' | 'sage' | 'orange';
export type LeafVariant = 'pointed' | 'curved' | 'teardrop' | 'cluster';

interface FloatingLeafProps {
  variant?: LeafVariant;
  color?: LeafColor;
  size?: number;
  opacity?: number;
  top?: string | number;
  bottom?: string | number;
  left?: string | number;
  right?: string | number;
  rotate?: number;
  animClass?: string;
  zIndex?: number;
  className?: string;
}

const colorMap: Record<LeafColor, string> = {
  'forest-dark': '#123D2E',
  'forest-primary': '#20583D',
  'sage': '#A8B99A',
  'orange': '#D9793D',
};

export const FloatingLeaf: React.FC<FloatingLeafProps> = ({
  variant = 'pointed',
  color = 'sage',
  size = 48,
  opacity = 0.65,
  top,
  bottom,
  left,
  right,
  rotate = 0,
  animClass = 'leaf-anim-1',
  zIndex = 1,
  className = '',
}) => {
  const hexColor = colorMap[color] || '#A8B99A';

  const renderSvg = () => {
    switch (variant) {
      case 'curved':
        return (
          <svg viewBox="0 0 80 120" width={size} height={(size * 12) / 8} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 8 C48 24 75 62 58 108 C38 116 14 84 20 8 Z"
              fill={hexColor}
            />
            <path
              d="M22 14 Q44 60 54 105"
              stroke="#FFFDF8"
              strokeOpacity="0.35"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M34 40 Q48 50 56 60"
              stroke="#FFFDF8"
              strokeOpacity="0.25"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        );

      case 'teardrop':
        return (
          <svg viewBox="0 0 70 90" width={size} height={(size * 9) / 7} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M35 6 C15 32 6 62 35 84 C64 62 55 32 35 6 Z"
              fill={hexColor}
            />
            <path
              d="M35 14 L35 82"
              stroke="#FFFDF8"
              strokeOpacity="0.3"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M35 36 Q22 45 16 54"
              stroke="#FFFDF8"
              strokeOpacity="0.25"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M35 52 Q48 60 54 68"
              stroke="#FFFDF8"
              strokeOpacity="0.25"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        );

      case 'cluster':
        return (
          <svg viewBox="0 0 110 130" width={size * 1.2} height={(size * 1.2 * 13) / 11} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Stem */}
            <path d="M55 125 Q52 75 58 20" stroke={hexColor} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            {/* Leaf 1 */}
            <path
              d="M58 20 C35 5 15 25 36 48 C48 42 56 30 58 20 Z"
              fill={hexColor}
              opacity="0.9"
            />
            {/* Leaf 2 (opposite) */}
            <path
              d="M55 58 C78 44 98 62 82 86 C68 80 60 70 55 58 Z"
              fill={color === 'orange' ? '#D9793D' : '#A8B99A'}
              opacity="0.85"
            />
            {/* Leaf 3 (lower left) */}
            <path
              d="M53 82 C30 72 16 94 34 112 C44 105 50 94 53 82 Z"
              fill={color === 'forest-dark' ? '#20583D' : hexColor}
              opacity="0.8"
            />
          </svg>
        );

      case 'pointed':
      default:
        return (
          <svg viewBox="0 0 100 120" width={size} height={(size * 12) / 10} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M50 8 C18 40 8 82 50 112 C92 82 82 40 50 8 Z"
              fill={hexColor}
            />
            {/* Central vein */}
            <path
              d="M50 16 L50 108"
              stroke="#FFFDF8"
              strokeOpacity="0.32"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Side veins */}
            <path
              d="M50 38 Q32 48 24 60"
              stroke="#FFFDF8"
              strokeOpacity="0.22"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M50 54 Q68 64 76 74"
              stroke="#FFFDF8"
              strokeOpacity="0.22"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M50 72 Q34 80 28 88"
              stroke="#FFFDF8"
              strokeOpacity="0.22"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        );
    }
  };

  const style: React.CSSProperties = {
    top,
    bottom,
    left,
    right,
    opacity,
    zIndex,
    transform: `rotate(${rotate}deg)`,
  };

  return (
    <div
      className={`floating-leaf ${animClass} ${className}`}
      style={style}
      aria-hidden="true"
    >
      {renderSvg()}
    </div>
  );
};

/* Pre-composed Hero Leaves Set */
export const HeroLeaves: React.FC = () => {
  return (
    <div className="floating-leaves-container" aria-hidden="true">
      {/* Top right corner large sage leaf drifting partially off-screen */}
      <FloatingLeaf
        variant="pointed"
        color="sage"
        size={95}
        top="-20px"
        right="-25px"
        rotate={140}
        opacity={0.55}
        animClass="leaf-anim-1"
      />

      {/* Top right secondary orange leaf */}
      <FloatingLeaf
        variant="curved"
        color="orange"
        size={50}
        top="90px"
        right="40px"
        rotate={-35}
        opacity={0.7}
        animClass="leaf-anim-2"
      />

      {/* Behind shopkeeper photo - top-left of image */}
      <FloatingLeaf
        variant="cluster"
        color="forest-primary"
        size={58}
        top="60px"
        right="380px"
        rotate={-45}
        opacity={0.65}
        animClass="leaf-anim-6"
      />

      {/* Near the floating dashboard card */}
      <FloatingLeaf
        variant="curved"
        color="orange"
        size={46}
        bottom="40px"
        right="320px"
        rotate={25}
        opacity={0.8}
        animClass="leaf-anim-4"
        zIndex={14}
      />

      {/* Bottom right floating sage leaf */}
      <FloatingLeaf
        variant="pointed"
        color="sage"
        size={68}
        bottom="-15px"
        right="80px"
        rotate={-65}
        opacity={0.6}
        animClass="leaf-anim-3"
      />

      {/* Left hero side edge leaf */}
      <FloatingLeaf
        variant="teardrop"
        color="sage"
        size={56}
        top="180px"
        left="-18px"
        rotate={45}
        opacity={0.45}
        animClass="leaf-anim-5"
      />

      {/* Lower left hero leaf */}
      <FloatingLeaf
        variant="pointed"
        color="forest-primary"
        size={42}
        bottom="120px"
        left="48%"
        rotate={-20}
        opacity={0.35}
        animClass="leaf-anim-7"
      />
    </div>
  );
};

/* Section Leaves (along borders of Features and How It Works) */
export const SectionLeaves: React.FC = () => {
  return (
    <div className="floating-leaves-container" aria-hidden="true">
      {/* Left side between features */}
      <FloatingLeaf
        variant="curved"
        color="sage"
        size={72}
        top="120px"
        left="-30px"
        rotate={30}
        opacity={0.5}
        animClass="leaf-anim-3"
      />

      {/* Right side near feature cards */}
      <FloatingLeaf
        variant="cluster"
        color="orange"
        size={54}
        top="260px"
        right="-20px"
        rotate={-50}
        opacity={0.65}
        animClass="leaf-anim-2"
      />

      {/* Bottom transition leaf */}
      <FloatingLeaf
        variant="pointed"
        color="forest-dark"
        size={48}
        bottom="40px"
        left="60px"
        rotate={75}
        opacity={0.25}
        animClass="leaf-anim-5"
      />
    </div>
  );
};

/* CTA Banner Leaves */
export const CtaLeaves: React.FC = () => {
  return (
    <div className="floating-leaves-container" aria-hidden="true" style={{ borderRadius: '28px' }}>
      {/* Top left corner of banner */}
      <FloatingLeaf
        variant="cluster"
        color="sage"
        size={64}
        top="-15px"
        left="-15px"
        rotate={45}
        opacity={0.4}
        animClass="leaf-anim-1"
      />

      {/* Bottom right corner of banner */}
      <FloatingLeaf
        variant="pointed"
        color="orange"
        size={58}
        bottom="-15px"
        right="-10px"
        rotate={-120}
        opacity={0.5}
        animClass="leaf-anim-4"
      />
    </div>
  );
};

/* Footer Leaves */
export const FooterLeaves: React.FC = () => {
  return (
    <div className="floating-leaves-container" aria-hidden="true">
      <FloatingLeaf
        variant="curved"
        color="sage"
        size={68}
        top="20px"
        right="-20px"
        rotate={-45}
        opacity={0.25}
        animClass="leaf-anim-2"
      />
      <FloatingLeaf
        variant="pointed"
        color="orange"
        size={52}
        bottom="20px"
        left="-15px"
        rotate={70}
        opacity={0.3}
        animClass="leaf-anim-5"
      />
    </div>
  );
};
