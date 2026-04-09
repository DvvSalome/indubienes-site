'use client';

export default function Logo({ className = '', height = 45 }: { className?: string; height?: number }) {
  // Official 2026 brand asset — full-color SVG (crisp at any size)
  // viewBox 1585.09 x 612 → aspect 2.59
  const aspectRatio = 1585.09 / 612;
  const displayHeight = height;
  const displayWidth = Math.round(displayHeight * aspectRatio);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-color.svg"
      alt="Inmobiliaria Indubienes"
      className={`drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] ${className}`}
      style={{
        height: `${displayHeight}px`,
        width: `${displayWidth}px`,
      }}
    />
  );
}
