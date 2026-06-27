const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-xl ${c}`} />;

export default function Loading() {
  return (
    <div className="space-y-0">
      {/* Hero skeleton */}
      <div className="relative h-[420px] sm:h-[520px] bg-gray-900 overflow-hidden">
        <S c="absolute inset-0 rounded-none opacity-30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-4">
          <S c="h-4 w-32 rounded-full" />
          <S c="h-12 w-80 sm:w-[480px]" />
          <S c="h-12 w-64 sm:w-96" />
          <S c="h-5 w-72 sm:w-[420px] mt-1" />
          <div className="flex gap-3 mt-2">
            <S c="h-12 w-36 rounded-full" />
            <S c="h-12 w-36 rounded-full" />
          </div>
        </div>
        {/* Slide dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {[1,2,3,4].map(i => <S key={i} c={`h-2 ${i === 1 ? "w-6" : "w-2"} rounded-full`} />)}
        </div>
      </div>

      {/* Promo strip */}
      <div className="bg-gray-100 py-3 px-4 flex gap-6 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <S c="h-4 w-4 rounded-full" />
            <S c="h-3.5 w-32" />
          </div>
        ))}
      </div>

      {/* Popular brands */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 space-y-5">
        <div className="flex items-center justify-between">
          <S c="h-7 w-40" />
          <S c="h-5 w-20" />
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-gray-100">
              <S c="h-12 w-12 rounded-full" />
              <S c="h-3 w-14" />
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle section (Cars) */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-10 space-y-5">
        <div className="flex items-center justify-between">
          <S c="h-7 w-36" />
          <div className="flex gap-2">
            {[1,2,3].map(i => <S key={i} c="h-8 w-20 rounded-full" />)}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <S c="h-44 w-full rounded-none" />
              <div className="p-4 space-y-2">
                <S c="h-4 w-20" />
                <S c="h-5 w-36" />
                <S c="h-3.5 w-28" />
                <div className="flex items-center justify-between pt-1">
                  <S c="h-5 w-24" />
                  <S c="h-7 w-7 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats + News strip */}
      <div className="bg-gray-50 py-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <S c="h-9 w-20 mx-auto" />
                <S c="h-4 w-28 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
