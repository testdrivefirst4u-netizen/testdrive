import { ContentForm } from "@/components/admin/content-form";

export default function NewNewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add News</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new news article</p>
      </div>
      <ContentForm
        apiPath="/api/admin/news"
        listPath="/admin/news"
        contentType="news"
        typeOptions={["news", "ev-news", "brand-news", "launch", "review"]}
      />
    </div>
  );
}
