const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-xl ${c}`} />;

export default function Loading() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-3 text-center max-w-xl mx-auto">
        <S c="h-10 w-64 mx-auto" />
        <S c="h-4 w-80 mx-auto" />
      </div>
      <div className="flex gap-2 justify-center flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => <S key={i} c="h-9 w-24 rounded-full" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <S c="h-52 w-full rounded-none" />
            <div className="p-5 space-y-3">
              <S c="h-5 w-16 rounded-full" />
              <S c="h-5 w-full" />
              <S c="h-5 w-3/4" />
              <S c="h-3.5 w-full" />
              <S c="h-3.5 w-4/5" />
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <S c="h-7 w-7 rounded-full" />
                  <S c="h-3.5 w-24" />
                </div>
                <S c="h-3.5 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
