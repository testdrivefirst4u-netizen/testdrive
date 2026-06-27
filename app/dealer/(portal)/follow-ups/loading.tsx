const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-xl ${c}`} />;

export default function Loading() {
  return (
    <div className="p-6 space-y-5">
      <div className="space-y-1.5">
        <S c="h-7 w-36" />
        <S c="h-4 w-60" />
      </div>

      {/* Follow-up cards */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <S c="h-5 w-36" />
                  <S c="h-5 w-20 rounded-full" />
                </div>
                <div className="flex items-center gap-4">
                  <S c="h-3.5 w-28" />
                  <S c="h-3.5 w-24" />
                  <S c="h-3.5 w-20" />
                </div>
                <S c="h-3.5 w-48" />
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <S c="h-8 w-28 rounded-xl" />
                <S c="h-8 w-28 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
