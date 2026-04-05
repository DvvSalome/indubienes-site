'use client';

export default function Logo({ className = '', height = 56 }: { className?: string; height?: number }) {
  // SVG vector logo — scales infinitely without quality loss
  const aspectRatio = 580 / 110; // matches SVG viewBox
  const width = Math.round(height * aspectRatio);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="Inmobiliaria Indubienes"
      width={width}
      height={height}
      className={`drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)] ${className}`}
      style={{
        height: `${height}px`,
        width: 'auto',
      }}
    />
  );
}
