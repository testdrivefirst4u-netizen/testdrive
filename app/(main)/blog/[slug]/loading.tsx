const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-xl ${c}`} />;

export default function Loading() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        {["w-10","w-4","w-16","w-4","w-48"].map((w, i) => <S key={i} c={`h-3.5 ${w}`} />)}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-10">
        <article className="space-y-6">
          {/* Category + read time */}
          <div className="flex items-center gap-3">
            <S c="h-6 w-20 rounded-full" />
            <S c="h-4 w-24" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <S c="h-10 w-full" />
            <S c="h-10 w-4/5" />
          </div>

          {/* Author strip */}
          <div className="flex items-center gap-3">
            <S c="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <S c="h-4 w-28" />
              <S c="h-3.5 w-36" />
            </div>
          </div>

          {/* Cover image */}
          <S c="h-72 sm:h-[420px] w-full rounded-3xl" />

          {/* Body */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              {i === 2 && <S c="h-6 w-56 mt-4" />}
              {Array.from({ length: i === 2 ? 3 : 4 }).map((_, j) => (
                <S key={j} c={`h-4 ${j === (i === 2 ? 2 : 3) ? "w-2/3" : "w-full"}`} />
              ))}
            </div>
          ))}

          {/* Share + tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {Array.from({ length: 4 }).map((_, i) => <S key={i} c="h-7 w-20 rounded-full" />)}
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <S c="h-5 w-28" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <S c="h-16 w-20 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <S c="h-4 w-full" /><S c="h-4 w-3/4" /><S c="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <S c="h-5 w-20" />
            {Array.from({ length: 5 }).map((_, i) => <S key={i} c="h-7 w-full rounded-xl" />)}
          </div>
        </aside>
      </div>
    </div>
  );
}
