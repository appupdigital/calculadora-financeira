export default function HP12CIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="hp12c-icon-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#hp12c-icon-bg)" />
      <rect x="14" y="10" width="36" height="16" rx="4" fill="#1f2937" />
      <text x="32" y="22" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="bold" fill="#f59e0b">
        12C
      </text>
      <g fill="#fde68a">
        <rect x="14" y="30" width="7" height="7" rx="1.6" />
        <rect x="23.5" y="30" width="7" height="7" rx="1.6" />
        <rect x="33" y="30" width="7" height="7" rx="1.6" />
        <rect x="42.5" y="30" width="7" height="7" rx="1.6" />
        <rect x="14" y="39.5" width="7" height="7" rx="1.6" />
        <rect x="23.5" y="39.5" width="7" height="7" rx="1.6" />
        <rect x="33" y="39.5" width="7" height="7" rx="1.6" />
        <rect x="42.5" y="39.5" width="7" height="7" rx="1.6" />
        <rect x="14" y="49" width="7" height="7" rx="1.6" />
        <rect x="23.5" y="49" width="7" height="7" rx="1.6" />
        <rect x="33" y="49" width="7" height="7" rx="1.6" />
        <rect x="42.5" y="49" width="7" height="7" rx="1.6" fill="#22c55e" />
      </g>
    </svg>
  );
}
