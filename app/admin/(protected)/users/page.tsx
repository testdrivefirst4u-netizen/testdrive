import Link from "next/link";
import { Plus, Pencil, ShieldCheck, ShieldOff, ShieldAlert } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { format } from "date-fns";
import { UserDeleteButton } from "./user-delete-button";

const ROLE_META: Record<string, { label: string; color: string; Icon: any; description: string }> = {
  SUPER_ADMIN: { label: "Super Admin", color: "bg-red-100 text-red-700 border-red-200",       Icon: ShieldAlert, description: "Full access · Cannot be deleted" },
  ADMIN:       { label: "Admin",       color: "bg-purple-100 text-purple-700 border-purple-200", Icon: ShieldCheck, description: "Full access to all sections"        },
  EDITOR:      { label: "Editor",      color: "bg-blue-100 text-blue-700 border-blue-200",     Icon: ShieldOff,   description: "Access limited to selected pages"   },
  USER:        { label: "User",        color: "bg-gray-100 text-gray-600 border-gray-200",     Icon: ShieldOff,   description: "Public user account"                },
};

const ALL_PERMS = [
  "vehicles","brands","categories","variants","spec-groups","colours",
  "news","blogs","faqs","leads","banners","media","users","ai-settings","seo","settings",
];

export default async function UsersPage() {
  const session = await auth();
  const callerRole = (session?.user as any)?.role ?? "";

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, permissions: true, createdAt: true },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">{users.length} users · manage roles and page permissions</p>
        </div>
        <Link href="/admin/users/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl px-4 py-2.5 transition-colors">
          <Plus className="w-4 h-4" /> Add User
        </Link>
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(ROLE_META).filter(([r]) => r !== "USER").map(([role, m]) => (
          <div key={role} className={`flex items-start gap-2.5 bg-white border rounded-2xl px-4 py-3 ${m.color.split(" ").slice(-1)}`}>
            <m.Icon className={`w-4 h-4 mt-0.5 shrink-0 ${m.color.split(" ")[1]}`} />
            <div>
              <p className={`text-xs font-bold ${m.color.split(" ")[1]}`}>{m.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{m.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Page Access</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => {
                const m          = ROLE_META[u.role] ?? ROLE_META.USER;
                const isSuperAdmin = u.role === "SUPER_ADMIN";
                const perms      = u.permissions ?? [];
                const isEditor   = u.role === "EDITOR";

                return (
                  <tr key={u.id} className={`hover:bg-slate-50/50 transition-colors ${isSuperAdmin ? "bg-red-50/20" : ""}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${m.color}`}>
                          {(u.name || u.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-xs flex items-center gap-1.5">
                            {u.name || "—"}
                            {isSuperAdmin && <ShieldAlert className="w-3 h-3 text-red-500" />}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${m.color}`}>{m.label}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      {isSuperAdmin || u.role === "ADMIN" ? (
                        <span className="text-xs text-emerald-600 font-semibold">All pages</span>
                      ) : isEditor ? (
                        perms.length === 0 ? (
                          <span className="text-xs text-red-400 font-semibold">No access granted</span>
                        ) : perms.length === ALL_PERMS.length ? (
                          <span className="text-xs text-emerald-600 font-semibold">All pages</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {perms.slice(0, 4).map(p => (
                              <span key={p} className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded capitalize">
                                {p.replace("-", " ")}
                              </span>
                            ))}
                            {perms.length > 4 && (
                              <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                +{perms.length - 4} more
                              </span>
                            )}
                          </div>
                        )
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-gray-400">{format(new Date(u.createdAt), "dd MMM yyyy")}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <Link href={`/admin/users/${u.id}`}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        {/* SUPER_ADMIN cannot be deleted — show nothing */}
                        {!isSuperAdmin && (
                          <UserDeleteButton
                            id={u.id}
                            name={u.name || u.email}
                            callerRole={callerRole}
                            targetRole={u.role}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
