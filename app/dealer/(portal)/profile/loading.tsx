const S = ({ c }: { c: string }) => <div className={`animate-pulse bg-gray-200 rounded-xl ${c}`} />;

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1.5">
        <S c="h-7 w-36" />
        <S c="h-4 w-56" />
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Profile form */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <S c="h-5 w-32" />
            <div className="grid grid-cols-2 gap-4">
              {["Dealership Name","Code","Email","Phone","City","State"].map(f => (
                <div key={f} className="space-y-1.5">
                  <S c="h-3.5 w-24" />
                  <S c="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <S c="h-3.5 w-20" />
              <S c="h-20 w-full rounded-xl" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <S c="h-5 w-36" />
            <div className="grid grid-cols-2 gap-4">
              {["Manager Name","Manager Phone"].map(f => (
                <div key={f} className="space-y-1.5">
                  <S c="h-3.5 w-28" />
                  <S c="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <S c="h-10 w-28 rounded-xl" />
          </div>
        </div>

        {/* Business hours */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <S c="h-5 w-32" />
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => (
            <div key={day} className="flex items-center gap-3">
              <S c="h-4 w-4 rounded" />
              <S c="h-4 w-10" />
              <S c="h-9 w-24 rounded-xl" />
              <S c="h-3.5 w-4" />
              <S c="h-9 w-24 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
