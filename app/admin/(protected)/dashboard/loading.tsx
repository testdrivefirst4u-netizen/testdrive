const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-lg ${c}`} />;

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <S c="h-8 w-52" />
          <S c="h-4 w-80" />
        </div>
        <S c="h-9 w-28 rounded-xl" />
      </div>

      {/* Top stat cards — 4 col */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <S c="h-4 w-20" />
              <S c="h-8 w-8 rounded-xl" />
            </div>
            <S c="h-8 w-24" />
            <S c="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Two-column: recent leads + dealer performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((t) => (
          <div key={t} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <S c="h-5 w-36" />
              <S c="h-4 w-16 rounded-full" />
            </div>
            <div className="space-y-2.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <S c="h-9 w-9 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <S c="h-3.5 w-3/4" />
                    <S c="h-3 w-1/2" />
                  </div>
                  <S c="h-5 w-16 rounded-full shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[0, 1, 2].map((t) => (
          <div key={t} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <S c="h-5 w-28" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <S c="h-3.5 w-24" />
                <S c="h-4 w-12 rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
