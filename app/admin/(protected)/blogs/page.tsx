import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { DeleteButton } from "@/components/admin/delete-button";
import { format } from "date-fns";

export default async function BlogsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const where: any = {};
  if (sp.status) where.status = sp.status;

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({ where, orderBy: { createdAt: "desc" }, select: { id: true, title: true, status: true, type: true, author: true, viewCount: true, createdAt: true } }),
    prisma.blog.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blogs</h1>
          <p className="text-sm text-gray-500 mt-1">{total} posts</p>
        </div>
        <Button asChild className="bg-red-600 hover:bg-red-700">
          <Link href="/admin/blogs/new"><Plus className="w-4 h-4 mr-2" />Add Blog</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Author</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {blogs.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No blogs yet.</td></tr>
              )}
              {blogs.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium max-w-xs"><p className="line-clamp-1">{b.title}</p></td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{b.type}</td>
                  <td className="px-4 py-3 text-gray-500">{b.author || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge className={b.status === "PUBLISHED" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"}>{b.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{format(new Date(b.createdAt), "dd MMM yyyy")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm"><Link href={`/admin/blogs/${b.id}`}><Pencil className="w-4 h-4" /></Link></Button>
                      <DeleteButton id={b.id} apiPath="/api/admin/blogs" label="blog post" />
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
