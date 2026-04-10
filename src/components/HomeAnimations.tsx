'use client';

import { useEffect, useRef } from 'react';

export default function HomeAnimations() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    let scrollTriggerInstances: unknown[] = [];

    // — GSAP: Hero + scroll animations —
    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);

      // === HERO TIMELINE ===
      const heroTl = gsap.timeline({ delay: 0.3 });

      // Background Ken Burns zoom — only if fallback image is present
      // (when videos are active, <video> elements are used instead)
      const heroBgEl = document.querySelector('.hero-bg-image');
      if (heroBgEl) {
        heroTl.fromTo('.hero-bg-image', {
          scale: 1.15,
        }, {
          scale: 1,
          duration: 2.5,
          ease: 'power2.out',
        }, 0);
      }

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

      // Scroll indicator with pulse
      heroTl.to('.scroll-indicator', {
        opacity: 0.5, duration: 0.6,
      }, 1.6);

      // === PARALLAX on hero bg === (only when fallback image is visible)
      if (heroBgEl) {
        const parallax = gsap.to('.hero-bg-image', {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
        scrollTriggerInstances.push(parallax);
      }

      // === SCROLL-REVEAL sections with GSAP ScrollTrigger ===
      // Featured Properties section
      const featuredCards = document.querySelectorAll('.featured-section .property-card');
      if (featuredCards.length) {
        gsap.fromTo(featuredCards, {
          y: 80,
          opacity: 0,
        }, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.featured-section',
            start: 'top 80%',
            once: true,
          },
        });
      }

      // About section
      const aboutSection = document.querySelector('.about-section');
      if (aboutSection) {
        gsap.fromTo(aboutSection.querySelectorAll('.about-animate'), {
          y: 60,
          opacity: 0,
        }, {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.about-section',
            start: 'top 75%',
            once: true,
          },
        });
      }

      // CTA section
      const ctaSection = document.querySelector('.cta-section');
      if (ctaSection) {
        gsap.fromTo(ctaSection.querySelectorAll('.cta-animate'), {
          y: 50,
          opacity: 0,
        }, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.cta-section',
            start: 'top 80%',
            once: true,
          },
        });
      }

      // Section headings — elegant line reveal
      document.querySelectorAll('.section-heading').forEach((heading) => {
        gsap.fromTo(heading, {
          y: 40,
          opacity: 0,
        }, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 85%',
            once: true,
          },
        });
      });

      // Gold decorative lines
      document.querySelectorAll('.gold-line-animate').forEach((line) => {
        gsap.fromTo(line, {
          scaleX: 0,
        }, {
          scaleX: 1,
          duration: 0.8,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: line,
            start: 'top 90%',
            once: true,
          },
        });
      });

      // Stat counters
      document.querySelectorAll('.stat-animate').forEach((stat) => {
        gsap.fromTo(stat, {
          y: 30,
          opacity: 0,
          scale: 0.9,
        }, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: stat,
            start: 'top 85%',
            once: true,
          },
        });
      });
    }).catch(() => {
      // GSAP failed to load — use fallback
    });

    // — IntersectionObserver fallback for scroll reveal elements —
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
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

    // Hard JS fallback: force-reveal after 4 seconds
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
      scrollTriggerInstances = [];
    };
  }, []);

  return null;
}

