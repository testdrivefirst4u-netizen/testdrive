const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-lg ${c}`} />;

function TableSkeleton({ cols, rows = 10 }: { cols: string[]; rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100">
        {cols.map((w, i) => <S key={i} c={`h-3.5 ${w}`} />)}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`flex items-center gap-4 px-4 py-3.5 border-b border-gray-50 ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}>
          <S c="h-9 w-9 rounded-full shrink-0" />
          {cols.slice(1).map((w, j) => <S key={j} c={`h-3.5 ${w}`} />)}
        </div>
      ))}
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><S c="h-7 w-24" /><S c="h-4 w-48" /></div>
        <S c="h-9 w-28 rounded-xl" />
      </div>
      <div className="flex gap-3"><S c="h-9 w-56 rounded-xl" /><S c="h-9 w-36 rounded-xl" /></div>
      <TableSkeleton cols={["w-40","w-48","w-28","w-24","w-20","w-16"]} />
    </div>
  );
}
