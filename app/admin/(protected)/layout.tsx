import type React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/admin/login");

  const role = (session.user as any).role;
  if (!["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(role)) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar user={session.user as any} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader user={session.user as any} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
