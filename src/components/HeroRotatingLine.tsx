'use client';

import RotatingText from './RotatingText';

export default function HeroRotatingLine() {
  const goldFilter = { filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.3)) drop-shadow(0 2px 5px rgba(0,0,0,0.22))' };

  return (
    <span className="block overflow-hidden mt-2">
      <span className="hero-word inline-block gold-text" style={goldFilter}>ideal</span>{' '}
      <span className="hero-word inline-block gold-text" style={goldFilter}>para</span>{' '}
      <span className="hero-word inline-block" style={goldFilter}>
        <RotatingText
          words={['vivir', 'invertir', 'disfrutar', 'crecer']}
          interval={3200}
          gradient
        />
      </span>
    </span>
  );
}
