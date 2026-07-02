import { driverAuth } from "@/lib/auth-driver";
import { redirect } from "next/navigation";
import { driverSignOutAction } from "@/app/driver/actions";
import { Navigation, LogOut } from "lucide-react";
import DriverBottomNav from "@/components/driver/driver-bottom-nav";

export default async function DriverPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await driverAuth();
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || role !== "DRIVER") {
    redirect("/driver/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <Navigation className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">{(session.user as any)?.name ?? "Driver"}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Driver Portal</p>
          </div>
        </div>
        <form action={driverSignOutAction}>
          <button type="submit" className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 px-2.5 py-2 rounded-xl hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </form>
      </header>
      <main className="flex-1 overflow-y-auto pb-6">{children}</main>
      <DriverBottomNav />
    </div>
  );
}
