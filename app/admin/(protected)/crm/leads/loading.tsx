const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-xl ${c}`} />;

export default function Loading() {
  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <S c="h-7 w-28" />
          <S c="h-4 w-52" />
        </div>
        <div className="flex gap-2">
          <S c="h-9 w-24 rounded-xl" />
          <S c="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3">
        <S c="h-9 w-40 rounded-xl" />
        <S c="h-9 w-36 rounded-xl" />
        <S c="h-9 w-36 rounded-xl" />
        <S c="h-9 w-40 rounded-xl" />
        <S c="h-9 w-9 rounded-xl ml-auto" />
      </div>

      {/* Status pills */}
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 8 }).map((_, i) => (
          <S key={i} c="h-8 w-24 rounded-full" />
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Header row */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
          {["w-4","w-32","w-28","w-40","w-24","w-28","w-20","w-20"].map((w, i) => (
            <S key={i} c={`h-3.5 ${w} shrink-0`} />
          ))}
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`flex items-center gap-4 px-5 py-4 border-b border-gray-50 ${i % 2 === 1 ? "bg-gray-50/30" : ""}`}>
            <S c="h-4 w-4 rounded shrink-0" />
            <div className="w-32 space-y-1.5 shrink-0">
              <S c="h-3.5 w-28" />
              <S c="h-3 w-20" />
            </div>
            <S c="h-3.5 w-28 shrink-0" />
            <S c="h-3.5 w-36 shrink-0" />
            <S c="h-5 w-20 rounded-full shrink-0" />
            <S c="h-3.5 w-24 shrink-0" />
            <S c="h-3.5 w-20 shrink-0" />
            <div className="flex gap-1.5 ml-auto">
              <S c="h-7 w-7 rounded-lg" />
              <S c="h-7 w-7 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <S c="h-4 w-40" />
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => <S key={i} c="h-8 w-8 rounded-lg" />)}
        </div>
      </div>
    </div>
  );
}
