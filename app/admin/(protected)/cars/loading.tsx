const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-xl ${c}`} />;

export default function Loading() {
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <S c="h-7 w-20" />
          <S c="h-4 w-40" />
        </div>
        <S c="h-9 w-28 rounded-xl" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`flex items-center justify-between px-5 py-4 border-b border-gray-50 ${i % 2 === 1 ? "bg-gray-50/40" : ""}`}>
            <S c="h-4 w-48" />
            <div className="flex gap-2">
              <S c="h-7 w-12 rounded-lg" />
              <S c="h-7 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
