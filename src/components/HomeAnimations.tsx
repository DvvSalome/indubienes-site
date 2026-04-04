'use client';

import { useEffect, useRef } from 'react';

export default function HomeAnimations() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // Dynamic import GSAP to avoid SSR issues
    import('gsap').then(({ default: gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
          // — HERO SECTION —
          const heroTl = gsap.timeline({ delay: 0.3 });

          // Background Ken Burns zoom
          heroTl.fromTo('.hero-bg-image', {
            scale: 1.15,
          }, {
            scale: 1,
            duration: 2.5,
            ease: 'power2.out',
          }, 0);

          // Tagline
          heroTl.to('.hero-tagline', {
            y: 0,
            opacity: 1,
            letterSpacing: '0.3em',
            duration: 1,
            ease: 'power3.out',
          }, 0.3);

          // Title words
          heroTl.to('.hero-title .hero-word', {
            y: '0%',
            opacity: 1,
            duration: 0.9,
            stagger: 0.06,
            ease: 'power3.out',
          }, 0.5);

          // Subtitle
          heroTl.to('.hero-subtitle', {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
          }, 1.0);

          // Search bar
          heroTl.to('.hero-search', {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
          }, 1.2);

          // Scroll indicator
          heroTl.to('.scroll-indicator', {
            opacity: 0.5,
            duration: 0.6,
          }, 1.6);

          // Parallax on hero bg
          gsap.to('.hero-bg-image', {
            yPercent: 20,
            ease: 'none',
            scrollTrigger: {
              trigger: '.hero-section',
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });

          // — FEATURED PROPERTIES SECTION —
          gsap.fromTo('.featured-tagline', {
            y: 30, opacity: 0,
          }, {
            y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: '.featured-section', start: 'top 80%' },
          });

          gsap.fromTo('.featured-title', {
            y: 40, opacity: 0,
          }, {
            y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: '.featured-section', start: 'top 80%' },
            delay: 0.1,
          });

          gsap.fromTo('.featured-desc', {
            y: 30, opacity: 0,
          }, {
            y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: '.featured-section', start: 'top 80%' },
            delay: 0.2,
          });

          gsap.fromTo('.section-line', {
            scaleX: 0,
          }, {
            scaleX: 1, duration: 1, ease: 'power2.inOut',
            scrollTrigger: { trigger: '.section-line', start: 'top 85%' },
          });

          // Property cards staggered
          gsap.fromTo('.property-card-wrapper', {
            y: 80, opacity: 0,
          }, {
            y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: '.properties-grid', start: 'top 85%' },
          });

          gsap.fromTo('.featured-cta', {
            y: 30, opacity: 0,
          }, {
            y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: '.featured-cta', start: 'top 90%' },
          });

          // — ABOUT SECTION —
          gsap.fromTo('.about-image', {
            x: -60, opacity: 0,
          }, {
            x: 0, opacity: 1, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: '.about-section', start: 'top 75%' },
          });

          gsap.fromTo('.about-stat-card', {
            scale: 0.8, opacity: 0,
          }, {
            scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.5)',
            scrollTrigger: { trigger: '.about-section', start: 'top 65%' },
          });

          gsap.fromTo('.about-content > *', {
            y: 40, opacity: 0,
          }, {
            y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: '.about-content', start: 'top 80%' },
          });

          gsap.fromTo('.about-feature', {
            x: -20, opacity: 0,
          }, {
            x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out',
            scrollTrigger: { trigger: '.about-features-grid', start: 'top 85%' },
          });

          // — CTA SECTION —
          gsap.fromTo('.cta-section .cta-content > *', {
            y: 40, opacity: 0,
          }, {
            y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: '.cta-section', start: 'top 75%' },
          });

          // — FOOTER —
          gsap.fromTo('.footer-col', {
            y: 40, opacity: 0,
          }, {
            y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: 'footer', start: 'top 90%' },
          });
        });

        // Cleanup
        return () => ctx.revert();
      });
    });
  }, []);

  return null;
}
