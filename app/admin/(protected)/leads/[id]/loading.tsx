const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-xl ${c}`} />;

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <S c="h-8 w-8 rounded-lg" />
        <div className="space-y-1">
          <S c="h-6 w-40" />
          <S c="h-3.5 w-28" />
        </div>
        <div className="ml-auto flex gap-2">
          <S c="h-8 w-24 rounded-xl" />
          <S c="h-8 w-8 rounded-xl" />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Left: lead details */}
        <div className="space-y-5">
          {/* Contact card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-4">
              <S c="h-14 w-14 rounded-2xl" />
              <div className="space-y-2">
                <S c="h-5 w-36" />
                <S c="h-3.5 w-28" />
              </div>
              <S c="h-6 w-20 ml-auto rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              {["Phone","Email","City","Source"].map(f => (
                <div key={f} className="space-y-1.5">
                  <S c="h-3 w-12" />
                  <S c="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle interest */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <S c="h-5 w-36" />
            <div className="flex items-center gap-3">
              <S c="h-16 w-24 rounded-xl" />
              <div className="space-y-2">
                <S c="h-4 w-40" />
                <S c="h-3.5 w-28" />
                <S c="h-3.5 w-20" />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <S c="h-5 w-24" />
              <S c="h-8 w-28 rounded-xl" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <S c="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5 pt-1">
                  <S c="h-4 w-3/4" />
                  <S c="h-3.5 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: status + assign */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <S c="h-5 w-20" />
            <S c="h-9 w-full rounded-xl" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <S c="h-5 w-28" />
            <S c="h-9 w-full rounded-xl" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <S c="h-5 w-24" />
            <S c="h-24 w-full rounded-xl" />
            <S c="h-9 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
