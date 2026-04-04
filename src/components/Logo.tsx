'use client';

import Image from 'next/image';

export default function Logo({ className = '', height = 40 }: { className?: string; height?: number }) {
  const aspectRatio = 250 / 90;
  const width = Math.round(height * aspectRatio);

  return (
    <Image
      src="/logo.gif"
      alt="Inmobiliaria Indubienes"
      width={width}
      height={height}
      className={`${className}`}
      style={{
        filter: 'brightness(1.15) contrast(1.1)',
        imageRendering: 'auto',
        maxHeight: `${height}px`,
        width: 'auto',
      }}
      priority
      unoptimized
    />
  );
}
