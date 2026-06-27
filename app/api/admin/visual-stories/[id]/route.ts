import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "visual-stories.json");

interface Story {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  link?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

function readStories(): Story[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Story[];
  } catch {
    return [];
  }
}

function writeStories(stories: Story[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(stories, null, 2), "utf-8");
}

// PUT — update story by id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const stories = readStories();
    const idx = stories.findIndex((s) => s.id === id);

    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated: Story = {
      ...stories[idx],
      title:     body.title     ?? stories[idx].title,
      imageUrl:  body.imageUrl  ?? stories[idx].imageUrl,
      category:  body.category  ?? stories[idx].category,
      link:      body.link      !== undefined ? body.link : stories[idx].link,
      isActive:  body.isActive  !== undefined ? body.isActive : stories[idx].isActive,
      sortOrder: body.sortOrder !== undefined ? body.sortOrder : stories[idx].sortOrder,
    };

    stories[idx] = updated;
    writeStories(stories);

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("[visual-stories PUT]", e?.message);
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}

// DELETE — remove story by id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const stories = readStories();
    const filtered = stories.filter((s) => s.id !== id);

    if (filtered.length === stories.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    writeStories(filtered);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("[visual-stories DELETE]", e?.message);
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
