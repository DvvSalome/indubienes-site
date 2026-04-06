'use client';

import RotatingText from './RotatingText';

export default function HeroRotatingLine() {
  const goldFilter = { filter: 'drop-shadow(0 2px 8px rgba(59,111,160,0.4))' };

  return (
    <span className="block overflow-hidden mt-2">
      <span className="hero-word inline-block gold-text" style={goldFilter}>ideal</span>{' '}
      <span className="hero-word inline-block gold-text" style={goldFilter}>para</span>{' '}
      <span className="hero-word inline-block gold-text" style={goldFilter}>
        <RotatingText
          words={['vivir', 'invertir', 'disfrutar', 'crecer']}
          interval={3200}
        />
      </span>
    </span>
  );
}
