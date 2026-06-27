const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-lg ${c}`} />;

export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><S c="h-7 w-24" /><S c="h-4 w-48" /></div>
        <S c="h-9 w-28 rounded-xl" />
      </div>
      <S c="h-9 w-56 rounded-xl" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <S c="h-20 w-20 rounded-2xl mx-auto" />
            <S c="h-4 w-20 mx-auto" />
            <S c="h-3 w-16 mx-auto rounded-full" />
            <div className="flex gap-2 justify-center">
              <S c="h-7 w-7 rounded-lg" />
              <S c="h-7 w-7 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
