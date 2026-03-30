'use client';

import Image from 'next/image';

export default function Logo({ className = '', height = 40 }: { className?: string; height?: number }) {
  // Maintain aspect ratio of original logo (250x90)
  const aspectRatio = 250 / 90;
  const width = Math.round(height * aspectRatio);

  return (
    <Image
      src="/logo.gif"
      alt="Inmobiliaria Indubienes"
      width={width}
      height={height}
      className={`dark:brightness-0 dark:invert ${className}`}
      priority
    />
  );
}
