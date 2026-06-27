const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-xl ${c}`} />;

/* Generic fallback for dealer portal pages without their own loading.tsx */
export default function Loading() {
  return (
    <div className="p-6 space-y-5">
      <div className="space-y-1.5"><S c="h-7 w-40" /><S c="h-4 w-60" /></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <S c="h-4 w-20" /><S c="h-8 w-20" /><S c="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`flex items-center gap-4 px-4 py-4 border-b border-gray-50 ${i % 2 === 1 ? "bg-gray-50/40" : ""}`}>
            {["w-36","w-28","w-40","w-24","w-20"].map((w, j) => <S key={j} c={`h-3.5 ${w}`} />)}
          </div>
        ))}
      </div>
    </div>
  );
}
