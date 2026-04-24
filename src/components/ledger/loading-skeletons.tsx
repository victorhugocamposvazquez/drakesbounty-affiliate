function Block({ className }: { className: string }) {
  return <div className={`animate-pulse bg-ink/[0.08] ${className}`} />;
}

export function LedgerOverviewSkeleton() {
  return (
    <div className="max-w-[1000px]">
      <Block className="h-3 w-44 mb-3" />
      <Block className="h-10 sm:h-12 w-2/3 mb-3" />
      <Block className="h-5 w-full max-w-2xl mb-2" />
      <Block className="h-5 w-4/5 max-w-xl mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="border-t border-rule pt-4">
          <Block className="h-3 w-24 mb-3" />
          <Block className="h-8 w-28" />
        </div>
        <div className="border-t border-rule pt-4">
          <Block className="h-3 w-24 mb-3" />
          <Block className="h-8 w-28" />
        </div>
        <div className="border-t border-rule pt-4">
          <Block className="h-3 w-24 mb-3" />
          <Block className="h-8 w-28" />
        </div>
      </div>

      <div className="border border-rule p-4 sm:p-6 md:p-8 mb-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Block className="h-7 w-48" />
          <Block className="h-3 w-24" />
        </div>
        <Block className="h-32 w-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="border border-rule p-4 sm:p-6">
          <Block className="h-3 w-24 mb-3" />
          <Block className="h-8 w-40 mb-4" />
          <Block className="h-4 w-full mb-2" />
          <Block className="h-4 w-3/4" />
        </div>
        <div className="border border-rule p-4 sm:p-6">
          <Block className="h-3 w-24 mb-3" />
          <Block className="h-8 w-40 mb-4" />
          <Block className="h-4 w-full mb-2" />
          <Block className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

export function LedgerTableSkeleton() {
  return (
    <div className="max-w-4xl">
      <Block className="h-3 w-40 mb-3" />
      <Block className="h-10 sm:h-12 w-2/3 mb-3" />
      <Block className="h-5 w-full max-w-2xl mb-8" />

      <div className="border border-rule overflow-x-auto">
        <div className="min-w-[620px] p-4 sm:p-5">
          <div className="grid grid-cols-4 gap-3 mb-4">
            <Block className="h-3 w-16" />
            <Block className="h-3 w-16" />
            <Block className="h-3 w-16" />
            <Block className="h-3 w-16" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-3 py-3 border-t border-rule/60">
              <Block className="h-4 w-14" />
              <Block className="h-4 w-40" />
              <Block className="h-4 w-24" />
              <Block className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LedgerEditorSkeleton() {
  return (
    <div className="max-w-3xl">
      <Block className="h-3 w-32 mb-3" />
      <Block className="h-10 sm:h-12 w-2/3 mb-3" />
      <Block className="h-5 w-full max-w-2xl mb-8" />

      <div className="max-w-2xl space-y-6 sm:space-y-8">
        <div className="border border-rule p-4 sm:p-5">
          <Block className="h-3 w-28 mb-3" />
          <Block className="h-5 w-full mb-2" />
          <Block className="h-4 w-3/4" />
        </div>
        <div>
          <Block className="h-3 w-24 mb-2" />
          <Block className="h-10 w-full" />
        </div>
        <div>
          <Block className="h-3 w-24 mb-2" />
          <Block className="h-10 w-full" />
        </div>
        <Block className="h-10 w-44" />
      </div>
    </div>
  );
}
