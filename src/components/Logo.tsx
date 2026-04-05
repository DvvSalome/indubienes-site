'use client';

import Image from 'next/image';

export default function Logo({ className = '', height = 56 }: { className?: string; height?: number }) {
  // HD source is 1000x360 (4x of original 250x90)

  return (
    <Image
      src="/logo-hd.png"
      alt="Inmobiliaria Indubienes"
      width={1000}
      height={360}
      className={`drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)] ${className}`}
      style={{
        maxHeight: `${height}px`,
        width: 'auto',
        height: `${height}px`,
      }}
      priority
      quality={95}
    />
  );
}
