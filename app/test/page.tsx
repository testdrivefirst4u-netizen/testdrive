"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

export default function TestPage() {
  const [content, setContent] = useState("<p>Start writing here…</p>");

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">TipTap Editor Test</h1>
      <RichTextEditor value={content} onChange={setContent} placeholder="Write something amazing…" minHeight={400} showCharCount />
      <details className="border rounded-lg p-4 bg-gray-50">
        <summary className="text-sm font-semibold cursor-pointer text-gray-600">View HTML output</summary>
        <pre className="mt-3 text-xs text-gray-500 whitespace-pre-wrap break-all">{content}</pre>
      </details>
    </div>
  );
}
