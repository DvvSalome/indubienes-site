'use client';

export default function Logo({ className = '', size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Indubienes"
      className={className}
    >
      {/* Outer frame */}
      <rect x="2" y="2" width="56" height="56" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* I letter */}
      <path
        d="M18 16V44"
        stroke="var(--gold, #C9A962)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* B letter */}
      <path
        d="M30 16H38C41.3137 16 44 18.6863 44 22V22C44 25.3137 41.3137 28 38 28H30V16Z"
        stroke="var(--gold, #C9A962)"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M30 28H39C42.866 28 46 31.134 46 35V35C46 38.866 42.866 42 39 42H30V28Z"
        stroke="var(--gold, #C9A962)"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M30 16V44"
        stroke="var(--gold, #C9A962)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Decorative dot */}
      <circle cx="18" cy="48" r="2" fill="var(--gold, #C9A962)" />
    </svg>
  );
}
