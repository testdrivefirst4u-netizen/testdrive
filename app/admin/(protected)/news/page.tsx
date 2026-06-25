import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { DeleteButton } from "@/components/admin/delete-button";
import { format } from "date-fns";

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = parseInt(sp.page || "1");
  const limit = 20;
  const where: any = {};
  if (sp.status) where.status = sp.status;

  const [news, total] = await Promise.all([
    prisma.news.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, status: true, author: true, type: true, viewCount: true, createdAt: true },
    }),
    prisma.news.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">News</h1>
          <p className="text-sm text-gray-500 mt-1">{total} articles</p>
        </div>
        <Button asChild className="bg-red-600 hover:bg-red-700">
          <Link href="/admin/news/new"><Plus className="w-4 h-4 mr-2" />Add News</Link>
        </Button>
      </div>

      <div className="flex gap-2">
        {[{ label: "All", status: "" }, { label: "Published", status: "PUBLISHED" }, { label: "Draft", status: "DRAFT" }].map((f) => (
          <Link key={f.label} href={`/admin/news${f.status ? `?status=${f.status}` : ""}`}>
            <Button variant={sp.status === f.status || (!sp.status && !f.status) ? "default" : "outline"} size="sm" className={sp.status === f.status || (!sp.status && !f.status) ? "bg-red-600 hover:bg-red-700" : ""}>{f.label}</Button>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Author</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Views</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {news.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No news yet. <Link href="/admin/news/new" className="text-red-600 hover:underline">Add the first article</Link></td></tr>
              )}
              {news.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium max-w-xs">
                    <p className="line-clamp-1">{n.title}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{n.type}</td>
                  <td className="px-4 py-3 text-gray-500">{n.author || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{n.viewCount}</td>
                  <td className="px-4 py-3">
                    <Badge className={n.status === "PUBLISHED" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"}>{n.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{format(new Date(n.createdAt), "dd MMM yyyy")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm"><Link href={`/admin/news/${n.id}`}><Pencil className="w-4 h-4" /></Link></Button>
                      <DeleteButton id={n.id} apiPath="/api/admin/news" label="news article" />
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
