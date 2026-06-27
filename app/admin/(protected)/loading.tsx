const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-lg ${c}`} />;

/* Generic fallback — shown for any admin page without its own loading.tsx */
export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><S c="h-7 w-40" /><S c="h-4 w-60" /></div>
        <S c="h-9 w-32 rounded-xl" />
      </div>
      <div className="flex gap-3 flex-wrap">
        <S c="h-9 w-56 rounded-xl" />
        <S c="h-9 w-36 rounded-xl" />
        <S c="h-9 w-36 rounded-xl" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100">
          {["w-40","w-28","w-32","w-24","w-20","w-20"].map((w, i) => (
            <S key={i} c={`h-3.5 ${w}`} />
          ))}
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`flex items-center gap-4 px-4 py-4 border-b border-gray-50 ${i % 2 === 1 ? "bg-gray-50/40" : ""}`}>
            {["w-40","w-28","w-32","w-24","w-20","w-20"].map((w, j) => (
              <S key={j} c={`h-3.5 ${w}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
