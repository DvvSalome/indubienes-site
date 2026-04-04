'use client';

import { useEffect, useRef } from 'react';

export default function HomeAnimations() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // — GSAP: Hero timeline only (above the fold, no scroll needed) —
    import('gsap').then(({ default: gsap }) => {
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
        y: 0, opacity: 1, letterSpacing: '0.3em',
        duration: 1, ease: 'power3.out',
      }, 0.3);

      // Title words
      heroTl.to('.hero-title .hero-word', {
        y: '0%', opacity: 1,
        duration: 0.9, stagger: 0.06, ease: 'power3.out',
      }, 0.5);

      // Subtitle
      heroTl.to('.hero-subtitle', {
        y: 0, opacity: 1,
        duration: 0.8, ease: 'power2.out',
      }, 1.0);

      // Search bar
      heroTl.to('.hero-search', {
        y: 0, opacity: 1,
        duration: 0.8, ease: 'power2.out',
      }, 1.2);

      // Scroll indicator
      heroTl.to('.scroll-indicator', {
        opacity: 0.5, duration: 0.6,
      }, 1.6);

      // Parallax on hero bg (safe — just moves bg, doesn't hide anything)
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
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
      });
    });

    // — IntersectionObserver: scroll reveal for all below-the-fold content —
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            // Apply stagger delay if data-delay is set
            const delay = el.dataset.delay || '0';
            el.style.transitionDelay = `${delay}ms`;
            el.classList.add('revealed');
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.05, rootMargin: '50px 0px 0px 0px' }
    );

    revealElements.forEach((el) => observer.observe(el));

    // Hard JS fallback: if CSS animation fallback also fails (e.g. background
    // tab throttling), force-reveal everything after 4 seconds.
    const fallbackTimer = setTimeout(() => {
      revealElements.forEach((el) => {
        if (!el.classList.contains('revealed')) {
          el.classList.add('revealed');
        }
      });
    }, 4000);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, []);

  return null;
}
