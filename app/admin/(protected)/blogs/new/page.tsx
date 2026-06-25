import { ContentForm } from "@/components/admin/content-form";

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Blog Post</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new blog article</p>
      </div>
      <ContentForm
        apiPath="/api/admin/blogs"
        listPath="/admin/blogs"
        contentType="blog"
        typeOptions={["article", "guide", "review", "comparison", "tips"]}
      />
    </div>
  );
}
