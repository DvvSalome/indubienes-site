'use client';

export default function Logo({ className = '', height = 45 }: { className?: string; height?: number }) {
  // SVG logo — vector, scales perfectly at any size, no pixelation
  // Aspect ratio from SVG viewBox: 580x110 ≈ 5.27:1
  const aspectRatio = 580 / 110;
  const displayHeight = height;
  const displayWidth = Math.round(displayHeight * aspectRatio);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="Inmobiliaria Indubienes"
      width={displayWidth}
      height={displayHeight}
      className={`drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] ${className}`}
      style={{
        height: `${displayHeight}px`,
        width: `${displayWidth}px`,
      }}
    />
  );
}
