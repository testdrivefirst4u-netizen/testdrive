const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-xl ${c}`} />;

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <S c="h-7 w-36" />
          <S c="h-4 w-52" />
        </div>
        <div className="flex gap-2">
          <S c="h-9 w-28 rounded-xl" />
          <S c="h-9 w-24 rounded-xl" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <S c="h-4 w-24" />
              <S c="h-9 w-9 rounded-xl" />
            </div>
            <S c="h-8 w-20" />
            <S c="h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        {/* Pipeline funnel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <S c="h-5 w-32" />
            <S c="h-8 w-24 rounded-xl" />
          </div>
          <div className="space-y-2 py-2">
            {["w-full","w-4/5","w-2/3","w-1/2","w-2/5","w-1/4","w-[12%]"].map((tw, i) => (
              <div key={i} className="flex items-center gap-3">
                <S c="h-3.5 w-28 shrink-0" />
                <div className="flex-1 flex items-center gap-2">
                  <S c={`h-8 rounded-lg ${tw}`} />
                  <S c="h-3.5 w-10 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <S c="h-5 w-32" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3 py-1">
              <S c="h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <S c="h-3.5 w-full" />
                <S c="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dealer performance table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <S c="h-5 w-44" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 ${i % 2 === 1 ? "bg-gray-50/40" : ""}`}>
            <S c="h-3.5 w-36" />
            <S c="h-3.5 w-20" />
            <S c="h-3.5 w-16" />
            <S c="h-5 w-20 rounded-full ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
