'use client';

import Image from 'next/image';

export default function Logo({ className = '', height = 56 }: { className?: string; height?: number }) {
  const aspectRatio = 250 / 90;
  const width = Math.round(height * aspectRatio);

  return (
    <Image
      src="/logo.gif"
      alt="Inmobiliaria Indubienes"
      width={width}
      height={height}
      className={`drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)] ${className}`}
      style={{
        maxHeight: `${height}px`,
        width: 'auto',
      }}
      priority
      unoptimized
    />
  );
}
