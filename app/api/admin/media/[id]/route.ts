import { NextRequest, NextResponse } from "next/server";
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
    const msg = body?.message || body?.error || `ImageKit ${res.status}`;
    throw new Error(msg);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await ikDelete(id);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    const msg = e?.message || "Delete failed";
    console.error("[media DELETE /id]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
