const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-lg ${c}`} />;

export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><S c="h-7 w-32" /><S c="h-4 w-52" /></div>
        <div className="flex gap-2">
          <S c="h-9 w-32 rounded-xl" />
          <S c="h-9 w-36 rounded-xl" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <S c="h-9 w-56 rounded-xl" />
        <S c="h-9 w-36 rounded-xl" />
        <S c="h-9 w-36 rounded-xl" />
        <S c="h-9 w-36 rounded-xl" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100">
          {["w-48","w-24","w-28","w-24","w-20","w-24","w-16"].map((w, i) => (
            <S key={i} c={`h-3.5 ${w}`} />
          ))}
        </div>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={`flex items-center gap-4 px-4 py-3 border-b border-gray-50 ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}>
            <div className="flex items-center gap-3 w-48">
              <S c="h-12 w-16 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <S c="h-3.5 w-28" />
                <S c="h-3 w-20" />
              </div>
            </div>
            <S c="h-3.5 w-20" />
            <S c="h-5 w-24 rounded-full" />
            <S c="h-3.5 w-20" />
            <S c="h-5 w-16 rounded-full" />
            <S c="h-3.5 w-20" />
            <div className="flex gap-1.5">
              <S c="h-7 w-7 rounded-lg" />
              <S c="h-7 w-7 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
