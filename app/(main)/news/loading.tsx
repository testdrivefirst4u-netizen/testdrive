const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-xl ${c}`} />;

export default function Loading() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-3 text-center max-w-xl mx-auto">
        <S c="h-4 w-20 mx-auto rounded-full" />
        <S c="h-10 w-72 mx-auto" />
        <S c="h-4 w-96 mx-auto" />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 justify-center flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => <S key={i} c="h-9 w-24 rounded-full" />)}
      </div>

      {/* Featured article */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <div className="grid md:grid-cols-2">
          <S c="h-72 md:h-80 rounded-none" />
          <div className="p-8 space-y-4">
            <S c="h-5 w-20 rounded-full" />
            <S c="h-8 w-full" />
            <S c="h-8 w-4/5" />
            <S c="h-4 w-full" />
            <S c="h-4 w-full" />
            <S c="h-4 w-3/4" />
            <div className="flex items-center gap-3 pt-2">
              <S c="h-8 w-8 rounded-full" />
              <S c="h-4 w-28" />
              <S c="h-4 w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Article grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <S c="h-48 w-full rounded-none" />
            <div className="p-5 space-y-3">
              <div className="flex gap-2">
                <S c="h-5 w-16 rounded-full" />
                <S c="h-5 w-20 rounded-full" />
              </div>
              <S c="h-5 w-full" />
              <S c="h-5 w-3/4" />
              <S c="h-3.5 w-full" />
              <S c="h-3.5 w-2/3" />
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <S c="h-6 w-6 rounded-full" />
                  <S c="h-3.5 w-20" />
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
