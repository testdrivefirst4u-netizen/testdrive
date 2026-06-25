import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserForm } from "../user-form";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }     = await params;
  const session    = await auth();
  const callerRole = (session?.user as any)?.role ?? "";

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, permissions: true },
  });
  if (!user) notFound();

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/users"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit User</h1>
          <p className="text-sm text-gray-400 mt-0.5">{user.name || user.email}</p>
        </div>
      </div>

      <UserForm
        mode="edit"
        callerRole={callerRole}
        initial={{
          id:          user.id,
          name:        user.name ?? "",
          email:       user.email,
          role:        user.role,
          permissions: user.permissions ?? [],
        }}
      />
    </div>
  );
}
