/**
 * Consistent "under construction" block for side-deck pages.
 * Pass copy from the page after calling getTranslations.
 */
export function LedgerPlaceholder({
  overline,
  title,
  body,
}: {
  overline: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow mb-3 text-oxblood">{overline}</p>
      <h1
        className="font-display text-4xl md:text-5xl leading-tight mb-4"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {title}
      </h1>
      <p className="text-ink-soft text-[17px] leading-relaxed font-display">
        {body}
      </p>
    </div>
  );
}
