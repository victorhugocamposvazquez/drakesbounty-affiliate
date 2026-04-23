/**
 * Editorial step indicator: "Folio I — II — III"
 * Renders Roman numerals with the active step highlighted in oxblood.
 */
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export function StepIndicator({
  current,
  total,
  label = "Folio",
}: {
  current: number; // 1-based
  total: number;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-3 text-ink-faint">
      <span className="font-mono text-[10px] tracking-[0.28em] uppercase">
        {label}
      </span>
      <div className="flex items-center gap-2">
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1;
          const isActive = n === current;
          const isPast = n < current;
          return (
            <span key={n} className="flex items-center gap-2">
              <span
                className={`font-display italic text-base transition-colors duration-300 ${
                  isActive
                    ? "text-oxblood"
                    : isPast
                    ? "text-ink"
                    : "text-ink-faint/60"
                }`}
                style={{ fontVariationSettings: '"opsz" 144' }}
              >
                {ROMAN[i] ?? n}
              </span>
              {n < total && (
                <span className="text-ink-faint/40 text-xs">·</span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
