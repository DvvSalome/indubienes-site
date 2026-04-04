'use client';

import Image from 'next/image';

export default function Logo({ className = '', height = 48 }: { className?: string; height?: number }) {
  const aspectRatio = 250 / 90;
  const width = Math.round(height * aspectRatio);

  return (
    <Image
      src="/logo.gif"
      alt="Inmobiliaria Indubienes"
      width={width}
      height={height}
      className={`drop-shadow-sm ${className}`}
      style={{ filter: 'brightness(1.1) contrast(1.05)' }}
      priority
    />
  );
}
