'use client';

import { useState, useEffect, useCallback } from 'react';

interface RotatingTextProps {
  words: string[];
  interval?: number;
  className?: string;
}

export default function RotatingText({
  words,
  interval = 3000,
  className = '',
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
    }, 400); // halfway through animation swap the word
  }, [words.length]);

  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(rotate, interval);
    return () => clearInterval(timer);
  }, [mounted, rotate, interval]);

  return (
    <span className={`rotating-text-wrapper inline-block relative`}>
      <span
        className={`inline-block transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${className} ${
          isAnimating
            ? 'opacity-0 translate-y-[30%] blur-[4px]'
            : 'opacity-100 translate-y-0 blur-0'
        }`}
      >
        {words[currentIndex]}
      </span>
    </span>
  );
}
