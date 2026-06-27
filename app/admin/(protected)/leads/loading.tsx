const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-lg ${c}`} />;

export default function Loading() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <S c="h-7 w-28" />
          <S c="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <S c="h-9 w-24 rounded-xl" />
          <S c="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3">
          <S c="h-9 w-56 rounded-xl" />
          <S c="h-9 w-36 rounded-xl" />
          <S c="h-9 w-36 rounded-xl" />
          <S c="h-9 w-36 rounded-xl" />
          <S c="h-9 w-36 rounded-xl" />
        </div>
      </div>

      {/* Stat chips */}
      <div className="flex gap-3 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <S key={i} c="h-8 w-28 rounded-full" />
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Table head */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100">
          <S c="h-4 w-4 rounded" />
          {["w-40","w-28","w-48","w-24","w-28","w-24","w-20"].map((w, i) => (
            <S key={i} c={`h-3.5 ${w}`} />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`flex items-center gap-4 px-4 py-3.5 border-b border-gray-50 ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}>
            <S c="h-4 w-4 rounded" />
            <div className="w-40 space-y-1.5">
              <S c="h-3.5 w-28" />
              <S c="h-3 w-20" />
            </div>
            <S c="h-3.5 w-28" />
            <div className="w-48 space-y-1.5">
              <S c="h-3.5 w-36" />
              <S c="h-3 w-24" />
            </div>
            <S c="h-5 w-20 rounded-full" />
            <S c="h-5 w-24 rounded-full" />
            <S c="h-3.5 w-20" />
            <S c="h-7 w-16 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <S c="h-4 w-40" />
        <div className="flex gap-2">
          <S c="h-9 w-24 rounded-xl" />
          <S c="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
