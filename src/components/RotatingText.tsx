'use client';

import { useState, useEffect, useCallback } from 'react';

interface RotatingTextProps {
  words: string[];
  interval?: number;
  className?: string;
  gradient?: boolean;
}

export default function RotatingText({
  words,
  interval = 3000,
  className = '',
  gradient = false,
}: RotatingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay mount to let GSAP hero animation finish first
    const mountTimer = setTimeout(() => setMounted(true), 2500);
    return () => clearTimeout(mountTimer);
  }, []);

  const rotate = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
      setIsAnimating(false);
    }, 400);
  }, [words.length]);

  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(rotate, interval);
    return () => clearInterval(timer);
  }, [mounted, rotate, interval]);

  const gradientStyle = gradient
    ? {
        background:
          'linear-gradient(135deg, #4A8BC2 0%, #7AB8E8 40%, #5A9BD4 60%, #3B6FA0 100%)',
        WebkitBackgroundClip: 'text' as const,
        backgroundClip: 'text' as const,
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
      }
    : {};

  return (
    <span className={`rotating-text-wrapper inline-block relative ${className}`}>
      <span
        className={`inline-block ${
          isAnimating
            ? 'opacity-0 translate-y-[30%] blur-[4px]'
            : 'opacity-100 translate-y-0 blur-0'
        }`}
        style={{
          transitionProperty: 'opacity, transform, filter',
          transitionDuration: '600ms',
          transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
          ...gradientStyle,
        }}
      >
        {words[currentIndex]}
      </span>
    </span>
  );
}
