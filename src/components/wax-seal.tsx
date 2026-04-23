"use client";

import { useEffect, useState } from "react";

/**
 * Large oxblood wax seal with text rotating around it.
 * Animates on mount: the inner disc "drips" into shape, then the text
 * traces along the ring. Used at the end of the Oath flow.
 */
export function WaxSeal({
  size = 220,
  text = "DRAKE'S BOUNTY · GUILD MEMBER · MMXXVI · ",
  initial = "D",
  sealed = false,
}: {
  size?: number;
  text?: string;
  initial?: string;
  sealed?: boolean;
}) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const ringRadius = size / 2 - 18;

  return (
    <div
      className="relative inline-block"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* Outer hairline ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 4}
          fill="none"
          stroke="#1A130C"
          strokeWidth="0.5"
          opacity="0.3"
        />

        {/* Wax disc — scales in on mount */}
        <g
          style={{
            transformOrigin: "50% 50%",
            transform: animateIn ? "scale(1)" : "scale(0.4)",
            opacity: animateIn ? 1 : 0,
            transition: "transform 800ms var(--ease-drake), opacity 600ms ease",
          }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 22}
            fill="#762525"
          />
          {/* Wax highlights */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 22}
            fill="url(#wax-shine)"
            opacity="0.6"
          />
          {/* Inner ring etched in wax */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 38}
            fill="none"
            stroke="#4F1818"
            strokeWidth="1"
            opacity="0.6"
          />
          {/* Initial */}
          <text
            x={size / 2}
            y={size / 2 + size * 0.07}
            textAnchor="middle"
            fontFamily="Fraunces, Georgia, serif"
            fontSize={size * 0.42}
            fontStyle="italic"
            fontWeight="500"
            fill="#E8DCC0"
            style={{
              opacity: sealed ? 1 : 0.0,
              transition: "opacity 600ms ease 500ms",
            }}
          >
            {initial}
          </text>
        </g>

        {/* Text on circle */}
        <defs>
          <path
            id="seal-text-path"
            d={`M ${size / 2 - ringRadius},${size / 2}
                a ${ringRadius},${ringRadius} 0 1,1 ${ringRadius * 2},0
                a ${ringRadius},${ringRadius} 0 1,1 ${-ringRadius * 2},0`}
            fill="none"
          />
          <radialGradient id="wax-shine" cx="0.3" cy="0.25" r="0.9">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="1" stopColor="#000000" stopOpacity="0.4" />
          </radialGradient>
        </defs>

        <text
          fill="#1A130C"
          fontFamily="JetBrains Mono, monospace"
          fontSize={size * 0.05}
          letterSpacing="2"
          opacity={animateIn ? 0.55 : 0}
          style={{ transition: "opacity 800ms ease 300ms" }}
        >
          <textPath href="#seal-text-path" startOffset="0">
            {text}
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
