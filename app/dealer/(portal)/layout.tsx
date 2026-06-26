import { dealerAuth } from "@/lib/auth-dealer";
import { redirect } from "next/navigation";
import DealerSidebar from "@/components/dealer/dealer-sidebar";

export default async function DealerPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await dealerAuth();
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !["DEALER_ADMIN", "SALES_EXECUTIVE"].includes(role ?? "")) {
    redirect("/dealer/login");
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <DealerSidebar role={role!} userName={(session.user as any)?.name ?? ""} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
