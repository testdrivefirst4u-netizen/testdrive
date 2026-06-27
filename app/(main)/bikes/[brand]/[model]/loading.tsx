const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-xl ${c}`} />;

export default function Loading() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        {["w-10","w-4","w-12","w-4","w-20","w-4","w-32"].map((w, i) => (
          <S key={i} c={`h-3.5 ${w}`} />
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        <div className="space-y-6">
          <div className="relative bg-white rounded-3xl border border-gray-100 overflow-hidden">
            <S c="h-72 sm:h-96 w-full rounded-none" />
            <div className="flex gap-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <S key={i} c="h-16 w-20 rounded-xl shrink-0" />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <S c="h-5 w-16 rounded-full" />
              <S c="h-5 w-20 rounded-full" />
            </div>
            <S c="h-9 w-3/4" />
            <S c="h-5 w-1/2" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <S c="h-5 w-28" />
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 4 }).map((_, i) => <S key={i} c="h-9 w-32 rounded-xl" />)}
            </div>
          </div>

          {Array.from({ length: 3 }).map((_, gi) => (
            <div key={gi} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100"><S c="h-5 w-36" /></div>
              <div className="divide-y divide-gray-50">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5">
                    <S c="h-3.5 w-32" /><S c="h-3.5 w-28" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 sticky top-4">
            <div className="space-y-1">
              <S c="h-3.5 w-24" />
              <S c="h-8 w-40" />
              <S c="h-3.5 w-32" />
            </div>
            <S c="h-px w-full" />
            <S c="h-11 w-full rounded-xl" />
            <S c="h-11 w-full rounded-xl" />
            <S c="h-11 w-full rounded-xl" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <S c="h-4 w-24" />
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 6 }).map((_, i) => <S key={i} c="h-8 w-8 rounded-full" />)}
            </div>
            <S c="h-3.5 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}
