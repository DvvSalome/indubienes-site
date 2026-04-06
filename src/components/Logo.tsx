'use client';

import Image from 'next/image';

export default function Logo({ className = '', height = 45 }: { className?: string; height?: number }) {
  // Logo PNG — will be replaced with HD version from client
  const nativeW = 250;
  const nativeH = 90;
  const aspectRatio = nativeW / nativeH;
  const displayHeight = Math.min(height, nativeH);
  const displayWidth = Math.round(displayHeight * aspectRatio);

  return (
    <Image
      src="/logo.gif"
      alt="Inmobiliaria Indubienes"
      width={nativeW}
      height={nativeH}
      className={`drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] ${className}`}
      style={{
        height: `${displayHeight}px`,
        width: `${displayWidth}px`,
      }}
      priority
      unoptimized
    />
  );
}
