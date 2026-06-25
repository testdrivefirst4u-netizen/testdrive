import { NextRequest, NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { file, fileName, folder } = await req.json();
    if (!file || !fileName) return NextResponse.json({ error: "file and fileName required" }, { status: 400 });

    const response = await imagekit.upload({
      file,
      fileName,
      folder: folder ? `/walley/${folder}` : "/walley",
      useUniqueFileName: true,
    });

    return NextResponse.json({
      url: response.url,
      fileId: response.fileId,
      name: response.name,
      width: response.width,
      height: response.height,
      size: response.size,
      mimeType: response.fileType,
    });
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 });
  }
}
