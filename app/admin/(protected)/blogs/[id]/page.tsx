import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ContentForm } from "@/components/admin/content-form";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Blog</h1>
        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{blog.title}</p>
      </div>
      <ContentForm
        data={{ ...blog, tags: (blog.tags as string[]) || [] }}
        apiPath="/api/admin/blogs"
        listPath="/admin/blogs"
        contentType="blog"
        typeOptions={["article", "guide", "review", "comparison", "tips"]}
      />
    </div>
  );
}
