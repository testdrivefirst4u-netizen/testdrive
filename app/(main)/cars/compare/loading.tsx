const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-xl ${c}`} />;

export default function Loading() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        {["w-10","w-4","w-12","w-4","w-28"].map((w, i) => <S key={i} c={`h-3.5 ${w}`} />)}
      </div>

      <div className="space-y-1">
        <S c="h-8 w-48" />
        <S c="h-4 w-72" />
      </div>

      {/* Comparison columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_1fr] gap-0 bg-white rounded-3xl border border-gray-100 overflow-hidden">
        {/* Column headers */}
        <div className="hidden lg:block border-r border-gray-100 p-5">
          <S c="h-5 w-20" />
        </div>
        {[1,2].map(i => (
          <div key={i} className="border-b lg:border-b-0 lg:border-r border-gray-100 p-5 space-y-3 last:border-r-0">
            <S c="h-48 w-full rounded-2xl" />
            <S c="h-5 w-16" />
            <S c="h-6 w-3/4" />
            <S c="h-5 w-28" />
            <div className="flex gap-2">
              <S c="h-8 w-24 rounded-xl" />
              <S c="h-8 w-24 rounded-xl" />
            </div>
          </div>
        ))}

        {/* Spec rows */}
        {Array.from({ length: 12 }).map((_, row) => (
          <>
            <div key={`label-${row}`} className="hidden lg:flex items-center px-5 py-3.5 border-t border-gray-50">
              <S c="h-3.5 w-28" />
            </div>
            {[0,1].map(col => (
              <div key={`${row}-${col}`} className="flex items-center justify-between lg:justify-start px-5 py-3.5 border-t border-gray-50 lg:border-l border-gray-100 last:border-r-0">
                <span className="lg:hidden"><S c="h-3.5 w-20" /></span>
                <S c="h-3.5 w-24" />
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  );
}
