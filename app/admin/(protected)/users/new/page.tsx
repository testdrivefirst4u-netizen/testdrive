import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { UserForm } from "../user-form";

export default async function NewUserPage() {
  const session    = await auth();
  const callerRole = (session?.user as any)?.role ?? "";

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/users"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Add New User</h1>
          <p className="text-sm text-gray-400 mt-0.5">Create an account and assign role &amp; permissions</p>
        </div>
      </div>

      <UserForm mode="new" callerRole={callerRole} />
    </div>
  );
}
