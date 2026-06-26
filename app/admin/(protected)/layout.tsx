import type React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import prisma from "@/lib/prisma";

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

  const newLeadsCount = await prisma.lead.count({ where: { status: "new" } });

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar
        user={session.user as any}
        permissions={(session.user as any).permissions ?? []}
        newLeadsCount={newLeadsCount}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader user={session.user as any} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
