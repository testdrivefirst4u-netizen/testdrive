import { NextRequest, NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";
import { auth } from "@/lib/auth";

async function ikDelete(fileId: string) {
  const key = process.env.IMAGEKIT_PRIVATE_KEY!;
  const token = Buffer.from(`${key}:`).toString("base64");

  const res = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
    method: "DELETE",
    headers: { Authorization: `Basic ${token}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || body?.error || `ImageKit ${res.status}`);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const folder  = searchParams.get("folder")  || "/walley";
    const search  = searchParams.get("search")  || "";
    const type    = searchParams.get("type")    || "image";
    const page    = Math.max(1, Number(searchParams.get("page") || 1));
    const limit   = Math.min(50, Number(searchParams.get("limit") || 48));
    const skip    = (page - 1) * limit;

    const listOptions: Record<string, any> = {
      path: folder,
      sort: "DESC_CREATED",
      limit: limit + 1,
      skip,
      includeFolder: false,
    };

    if (type !== "all") listOptions.fileType = type;
    if (search) listOptions.searchQuery = `name : "${search}"`;

    const files = await imagekit.listFiles(listOptions as any);

    const hasMore = files.length > limit;
    const items = hasMore ? files.slice(0, limit) : files;

    const folders = await imagekit.listFiles({
      path: folder,
      includeFolder: true,
      limit: 50,
    } as any).then((res) => res.filter((f: any) => f.type === "folder")).catch(() => []);

    return NextResponse.json({ files: items, folders, hasMore, page, folder });
  } catch (e: any) {
    const msg = e?.message || "Failed to load media";
    console.error("[media GET]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const fileIds: string[] = body?.fileIds ?? [];
    if (!fileIds.length) return NextResponse.json({ error: "fileIds required" }, { status: 400 });

    const errors: string[] = [];

    await Promise.all(
      fileIds.map(async (id) => {
        try {
          await ikDelete(id);
        } catch (e: any) {
          const msg = e?.message || "Delete failed";
          console.error(`[media DELETE bulk] ${id}:`, msg);
          errors.push(`${id}: ${msg}`);
        }
      })
    );

    if (errors.length === fileIds.length) {
      return NextResponse.json({ error: errors[0] }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      deleted: fileIds.length - errors.length,
      ...(errors.length ? { errors } : {}),
    });
  } catch (e: any) {
    const msg = e?.message || "Delete failed";
    console.error("[media DELETE]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
