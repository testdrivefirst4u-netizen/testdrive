const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-xl ${c}`} />;

export default function Loading() {
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5"><S c="h-7 w-24" /><S c="h-4 w-52" /></div>
        <S c="h-9 w-28 rounded-xl" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <S c="h-9 w-48 rounded-xl" />
        <S c="h-9 w-32 rounded-xl" />
        <S c="h-9 w-32 rounded-xl" />
      </div>

      {/* Status tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => <S key={i} c="h-8 w-24 rounded-full" />)}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100">
          {["w-36","w-28","w-40","w-24","w-24","w-20"].map((w, i) => <S key={i} c={`h-3.5 ${w}`} />)}
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`flex items-center gap-4 px-4 py-4 border-b border-gray-50 ${i % 2 === 1 ? "bg-gray-50/40" : ""}`}>
            <div className="w-36 space-y-1.5"><S c="h-3.5 w-28" /><S c="h-3 w-20" /></div>
            <S c="h-3.5 w-28" />
            <S c="h-3.5 w-36" />
            <S c="h-5 w-20 rounded-full" />
            <S c="h-5 w-20 rounded-full" />
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
