const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-lg ${c}`} />;

export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><S c="h-7 w-20" /><S c="h-4 w-52" /></div>
        <div className="flex gap-2">
          <S c="h-9 w-28 rounded-xl" />
          <S c="h-9 w-32 rounded-xl" />
        </div>
      </div>
      <div className="flex gap-3 flex-wrap">
        <S c="h-9 w-56 rounded-xl" />
        <S c="h-9 w-36 rounded-xl" />
        <S c="h-9 w-36 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <S c="h-44 w-full rounded-none" />
            <div className="p-4 space-y-2.5">
              <S c="h-5 w-full" />
              <S c="h-5 w-2/3" />
              <S c="h-3.5 w-full" />
              <S c="h-3.5 w-4/5" />
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <S c="h-6 w-6 rounded-full" />
                  <S c="h-3.5 w-20" />
                </div>
                <div className="flex gap-1.5">
                  <S c="h-7 w-7 rounded-lg" />
                  <S c="h-7 w-7 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
