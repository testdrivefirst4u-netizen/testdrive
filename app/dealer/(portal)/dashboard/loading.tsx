const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-xl ${c}`} />;

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <S c="h-7 w-48" />
        <S c="h-4 w-64" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <S c="h-4 w-20" />
              <S c="h-9 w-9 rounded-xl" />
            </div>
            <S c="h-8 w-20" />
            <S c="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Recent leads table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <S c="h-5 w-32" />
          <S c="h-8 w-20 rounded-xl" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 ${i % 2 === 1 ? "bg-gray-50/40" : ""}`}>
            <div className="flex-1 space-y-1.5">
              <S c="h-3.5 w-32" />
              <S c="h-3 w-24" />
            </div>
            <S c="h-3.5 w-28" />
            <S c="h-5 w-20 rounded-full" />
            <S c="h-5 w-20 rounded-full" />
            <S c="h-3.5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
