const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-xl ${c}`} />;

export default function Loading() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        {["w-10","w-4","w-16","w-4","w-48"].map((w, i) => <S key={i} c={`h-3.5 ${w}`} />)}
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-10">
        {/* Article body */}
        <article className="space-y-6">
          {/* Cover image */}
          <S c="h-72 sm:h-96 w-full rounded-3xl" />

          {/* Meta badges */}
          <div className="flex flex-wrap gap-2">
            <S c="h-6 w-20 rounded-full" />
            <S c="h-6 w-24 rounded-full" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <S c="h-9 w-full" />
            <S c="h-9 w-4/5" />
          </div>

          {/* Author / date strip */}
          <div className="flex items-center gap-4 py-4 border-y border-gray-100">
            <S c="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <S c="h-4 w-28" />
              <S c="h-3.5 w-40" />
            </div>
            <div className="ml-auto flex gap-3">
              <S c="h-3.5 w-20" />
              <S c="h-3.5 w-16" />
            </div>
          </div>

          {/* Body paragraphs */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              {Array.from({ length: i === 1 ? 2 : 4 }).map((_, j) => (
                <S key={j} c={`h-4 ${j === 3 ? "w-3/4" : "w-full"}`} />
              ))}
            </div>
          ))}

          {/* Inline image */}
          <S c="h-56 w-full rounded-2xl" />

          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <S key={j} c={`h-4 ${j === 2 ? "w-2/3" : "w-full"}`} />
              ))}
            </div>
          ))}

          {/* Tags */}
          <div className="flex gap-2 pt-2">
            {Array.from({ length: 4 }).map((_, i) => <S key={i} c="h-7 w-20 rounded-full" />)}
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <S c="h-5 w-32" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <S c="h-16 w-20 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <S c="h-4 w-full" />
                  <S c="h-4 w-3/4" />
                  <S c="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <S c="h-5 w-24" />
            {Array.from({ length: 6 }).map((_, i) => <S key={i} c="h-7 w-full rounded-xl" />)}
          </div>
        </aside>
      </div>
    </div>
  );
}
