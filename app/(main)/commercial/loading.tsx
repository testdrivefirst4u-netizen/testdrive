const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-xl ${c}`} />;

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <S c="h-44 w-full rounded-none" />
      <div className="p-3.5 space-y-2.5">
        <S c="h-4 w-14 rounded-full" />
        <S c="h-5 w-3/4" />
        <S c="h-4 w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <S c="h-5 w-28" /><S c="h-8 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center gap-2">
        <S c="h-3.5 w-12" /><S c="h-3.5 w-3" /><S c="h-3.5 w-28" />
      </div>
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => <S key={i} c="h-8 w-28 rounded-full shrink-0" />)}
      </div>
      <div className="flex gap-6">
        <div className="hidden lg:block w-64 shrink-0 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <S c="h-4 w-24" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <S c="h-4 w-4 rounded" /><S c="h-3.5 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <S c="h-4 w-36" /><S c="h-9 w-40 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
