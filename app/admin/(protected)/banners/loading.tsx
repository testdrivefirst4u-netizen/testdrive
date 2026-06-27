const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-xl ${c}`} />;

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <S c="h-7 w-28" />
          <S c="h-4 w-64" />
        </div>
        <S c="h-9 w-32 rounded-xl" />
      </div>

      {/* Group tabs */}
      <div className="flex gap-2 border-b border-gray-100 pb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <S key={i} c={`h-9 ${i === 0 ? "w-32" : "w-28"} rounded-t-xl`} />
        ))}
      </div>

      {/* Position sub-tabs */}
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <S key={i} c="h-8 w-36 rounded-full" />
        ))}
      </div>

      {/* Position info card */}
      <div className="bg-blue-50 rounded-2xl p-4 flex items-center gap-4">
        <S c="h-10 w-10 rounded-xl" />
        <div className="space-y-1.5">
          <S c="h-4 w-40" />
          <S c="h-3.5 w-56" />
        </div>
        <S c="h-5 w-28 ml-auto rounded-full" />
      </div>

      {/* Banner cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group">
            <S c="h-48 w-full rounded-none" />
            <div className="p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1.5 flex-1">
                  <S c="h-4 w-3/4" />
                  <S c="h-3.5 w-1/2" />
                </div>
                <S c="h-5 w-10 rounded-full" />
              </div>
              <div className="flex gap-1.5 pt-1">
                <S c="h-7 w-7 rounded-lg" />
                <S c="h-7 w-7 rounded-lg" />
                <S c="h-7 w-7 rounded-lg" />
                <S c="h-7 w-7 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
