/**
 * Drake's Bounty signature mark — small wax-seal style "D" inside a thin ring.
 * Used in the top bar and any compact branding spot.
 */
export function BrandMark({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <circle
        cx="18"
        cy="18"
        r="16.5"
        stroke="currentColor"
        strokeWidth="0.6"
        fill="none"
        opacity="0.45"
      />
      <circle
        cx="18"
        cy="18"
        r="14"
        stroke="currentColor"
        strokeWidth="0.4"
        fill="none"
        opacity="0.25"
      />
      <circle cx="18" cy="18" r="12.5" fill="#762525" />
      <circle
        cx="18"
        cy="18"
        r="12.5"
        fill="url(#seal-grain)"
        opacity="0.35"
      />
      <text
        x="18"
        y="23"
        textAnchor="middle"
        fontFamily="Fraunces, Georgia, serif"
        fontSize="15"
        fontStyle="italic"
        fontWeight="500"
        fill="#E8DCC0"
      >
        D
      </text>
      <defs>
        <radialGradient id="seal-grain" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.4" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.35" />
        </radialGradient>
      </defs>
    </svg>
  );
}
