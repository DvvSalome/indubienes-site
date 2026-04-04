'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Reveal elements on scroll with stagger
export function useScrollReveal(selector: string, options?: {
  y?: number;
  x?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
  start?: string;
}) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const elements = document.querySelectorAll(selector);
      if (!elements.length) return;

      gsap.fromTo(elements, {
        y: options?.y ?? 60,
        x: options?.x ?? 0,
        opacity: 0,
      }, {
        y: 0,
        x: 0,
        opacity: 1,
        duration: options?.duration ?? 0.9,
        stagger: options?.stagger ?? 0.15,
        delay: options?.delay ?? 0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: elements[0],
          start: options?.start ?? 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    return () => ctx.revert();
  }, [selector, options?.y, options?.x, options?.duration, options?.stagger, options?.delay, options?.start]);
}

// Parallax effect for background images
export function useParallax(ref: React.RefObject<HTMLElement | null>, speed: number = 0.3) {
  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        yPercent: -speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [ref, speed]);
}

// Magnetic button effect
export function useMagnetic(ref: React.RefObject<HTMLElement | null>, strength: number = 0.3) {
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    const handleLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.4)',
      });
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);

    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [ref, strength]);
}

// Text split animation — reveal words one by one
export function useSplitText(ref: React.RefObject<HTMLElement | null>, options?: {
  delay?: number;
  stagger?: number;
  scrollTrigger?: boolean;
}) {
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const text = el.textContent || '';
    const words = text.split(' ');

    el.innerHTML = words
      .map((w) => `<span class="inline-block overflow-hidden"><span class="split-word inline-block" style="transform:translateY(100%);opacity:0">${w}</span></span>`)
      .join(' ');

    const spans = el.querySelectorAll('.split-word');

    const ctx = gsap.context(() => {
      const tween = {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: options?.stagger ?? 0.04,
        delay: options?.delay ?? 0,
        ease: 'power3.out',
      };

      if (options?.scrollTrigger !== false) {
        gsap.to(spans, {
          ...tween,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      } else {
        gsap.to(spans, tween);
      }
    });

    return () => ctx.revert();
  }, [ref, options?.delay, options?.stagger, options?.scrollTrigger]);
}

// Counter animation
export function useCounter(ref: React.RefObject<HTMLElement | null>, target: number, duration: number = 2) {
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obj = { val: 0 };

    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: target,
        duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          el.textContent = Math.round(obj.val).toString();
        },
      });
    });

    return () => ctx.revert();
  }, [ref, target, duration]);
}

// Smooth line draw for SVG paths
export function useLineReveal(ref: React.RefObject<SVGPathElement | null>) {
  useEffect(() => {
    if (!ref.current) return;
    const path = ref.current;
    const length = path.getTotalLength();

    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

    const ctx = gsap.context(() => {
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: path,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    return () => ctx.revert();
  }, [ref]);
}

export { gsap, ScrollTrigger };
