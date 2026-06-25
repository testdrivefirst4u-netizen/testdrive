import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ContentForm } from "@/components/admin/content-form";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const news = await prisma.news.findUnique({ where: { id } });
  if (!news) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit News</h1>
        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{news.title}</p>
      </div>
      <ContentForm
        data={{ ...news, tags: (news.tags as string[]) || [] }}
        apiPath="/api/admin/news"
        listPath="/admin/news"
        contentType="news"
        typeOptions={["news", "ev-news", "brand-news", "launch", "review"]}
      />
    </div>
  );
}
