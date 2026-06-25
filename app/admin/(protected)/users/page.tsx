import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { DeleteButton } from "@/components/admin/delete-button";
import { format } from "date-fns";

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-700",
  ADMIN: "bg-purple-100 text-purple-700",
  EDITOR: "bg-blue-100 text-blue-700",
  USER: "bg-gray-100 text-gray-700",
};

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} total users</p>
        </div>
        <Button asChild className="bg-red-600 hover:bg-red-700">
          <Link href="/admin/users/new"><Plus className="w-4 h-4 mr-2" />Add User</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.name || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge className={`${roleColors[u.role] || "bg-gray-100"} hover:opacity-80`}>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{format(new Date(u.createdAt), "dd MMM yyyy")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm"><Link href={`/admin/users/${u.id}`}><Pencil className="w-4 h-4" /></Link></Button>
                      <DeleteButton id={u.id} apiPath="/api/admin/users" label="user" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
