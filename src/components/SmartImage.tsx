'use client';

import { useState, useCallback } from 'react';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

/**
 * SmartImage: detects image orientation on load.
 * - Landscape/square images → normal object-cover fill.
 * - Portrait images → centered image with blurred background fill.
 */
export default function SmartImage({ src, alt, className = '', containerClassName = '' }: SmartImageProps) {
  const [isPortrait, setIsPortrait] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const ratio = img.naturalHeight / img.naturalWidth;
    // Consider portrait if height is > 1.15x the width
    setIsPortrait(ratio > 1.15);
    setLoaded(true);
  }, []);

  if (isPortrait && loaded) {
    return (
      <div className={`relative w-full h-full overflow-hidden ${containerClassName}`}>
        {/* Blurred background fill */}
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50"
        />
        {/* Sharp centered image */}
        <img
          src={src}
          alt={alt}
          className={`relative z-10 h-full w-auto mx-auto object-contain ${className}`}
          onLoad={handleLoad}
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      onLoad={handleLoad}
    />
  );
}
