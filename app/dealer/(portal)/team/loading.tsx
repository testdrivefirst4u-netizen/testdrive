const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-xl ${c}`} />;

export default function Loading() {
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <S c="h-7 w-28" />
          <S c="h-4 w-52" />
        </div>
        <S c="h-9 w-32 rounded-xl" />
      </div>

      {/* Team member cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <S c="h-12 w-12 rounded-full" />
              <div className="space-y-1.5">
                <S c="h-4 w-32" />
                <S c="h-3.5 w-24 rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <S c="h-4 w-4 rounded-full" />
                <S c="h-3.5 w-36" />
              </div>
              <div className="flex items-center gap-2">
                <S c="h-4 w-4 rounded-full" />
                <S c="h-3.5 w-28" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <S c="h-7 w-7 rounded-lg" />
              <S c="h-7 w-7 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
