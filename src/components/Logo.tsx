'use client';

import Image from 'next/image';

export default function Logo({ className = '', height = 45 }: { className?: string; height?: number }) {
  // HD logo with transparent background — ImageMagick flood-fill removal
  const nativeW = 881;
  const nativeH = 268;
  const aspectRatio = nativeW / nativeH;
  const displayHeight = height;
  const displayWidth = Math.round(displayHeight * aspectRatio);

  return (
    <Image
      src="/logo-hd-transparent.png"
      alt="Inmobiliaria Indubienes"
      width={nativeW}
      height={nativeH}
      className={`drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] ${className}`}
      style={{
        height: `${displayHeight}px`,
        width: `${displayWidth}px`,
      }}
      priority
    />
  );
}
