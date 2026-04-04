'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomeAnimations() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const ctx = gsap.context(() => {
      // — HERO SECTION —
      const heroTl = gsap.timeline({ delay: 0.2 });

      // Background Ken Burns zoom
      heroTl.fromTo('.hero-bg-image', {
        scale: 1.15,
      }, {
        scale: 1,
        duration: 2.5,
        ease: 'power2.out',
      }, 0);

      // Tagline fade in from below
      heroTl.fromTo('.hero-tagline', {
        y: 30,
        opacity: 0,
        letterSpacing: '0.1em',
      }, {
        y: 0,
        opacity: 1,
        letterSpacing: '0.3em',
        duration: 1,
        ease: 'power3.out',
      }, 0.3);

      // Title - word by word reveal
      heroTl.fromTo('.hero-title .hero-word', {
        y: '110%',
        rotateX: -40,
      }, {
        y: '0%',
        rotateX: 0,
        duration: 0.9,
        stagger: 0.06,
        ease: 'power3.out',
      }, 0.5);

      // Subtitle
      heroTl.fromTo('.hero-subtitle', {
        y: 20,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
      }, 1.0);

      // Search bar slide up
      heroTl.fromTo('.hero-search', {
        y: 40,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
      }, 1.2);

      // Scroll indicator
      heroTl.fromTo('.scroll-indicator', {
        opacity: 0,
      }, {
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
        y: 30,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.featured-section',
          start: 'top 80%',
        },
      });

      gsap.fromTo('.featured-title', {
        y: 40,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.featured-section',
          start: 'top 80%',
        },
        delay: 0.1,
      });

      gsap.fromTo('.featured-desc', {
        y: 30,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.featured-section',
          start: 'top 80%',
        },
        delay: 0.2,
      });

      // Decorative gold line
      gsap.fromTo('.section-line', {
        scaleX: 0,
      }, {
        scaleX: 1,
        duration: 1,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: '.section-line',
          start: 'top 85%',
        },
      });

      // Property cards staggered reveal
      gsap.fromTo('.property-card-wrapper', {
        y: 80,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.properties-grid',
          start: 'top 85%',
        },
      });

      // CTA button
      gsap.fromTo('.featured-cta', {
        y: 30,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.featured-cta',
          start: 'top 90%',
        },
      });

      // — ABOUT SECTION —
      gsap.fromTo('.about-image', {
        x: -60,
        opacity: 0,
      }, {
        x: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.about-section',
          start: 'top 75%',
        },
      });

      gsap.fromTo('.about-stat-card', {
        scale: 0.8,
        opacity: 0,
      }, {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: '.about-section',
          start: 'top 65%',
        },
      });

      gsap.fromTo('.about-content > *', {
        y: 40,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.about-content',
          start: 'top 80%',
        },
      });

      // About features
      gsap.fromTo('.about-feature', {
        x: -20,
        opacity: 0,
      }, {
        x: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.about-features-grid',
          start: 'top 85%',
        },
      });

      // — CTA SECTION —
      gsap.fromTo('.cta-section .cta-content > *', {
        y: 40,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 75%',
        },
      });

      // — FOOTER —
      gsap.fromTo('.footer-col', {
        y: 40,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: 'footer',
          start: 'top 90%',
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
