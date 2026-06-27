const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-lg ${c}`} />;

export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><S c="h-7 w-28" /><S c="h-4 w-52" /></div>
        <S c="h-9 w-32 rounded-xl" />
      </div>
      <div className="flex gap-3 flex-wrap">
        <S c="h-9 w-56 rounded-xl" />
        <S c="h-9 w-36 rounded-xl" />
        <S c="h-9 w-36 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <S c="h-12 w-12 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <S c="h-4 w-36" />
                <S c="h-3 w-24" />
              </div>
              <S c="h-6 w-16 rounded-full shrink-0" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((j) => (
                <div key={j} className="bg-gray-50 rounded-xl p-2.5 space-y-1">
                  <S c="h-5 w-8" />
                  <S c="h-3 w-12" />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <S c="h-8 flex-1 rounded-xl" />
              <S c="h-8 flex-1 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
