import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "visual-stories.json");

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

// GET — public (no auth), returns all stories sorted by sortOrder
export async function GET() {
  try {
    const stories = readStories();
    const sorted = [...stories].sort((a, b) => a.sortOrder - b.sortOrder);
    return NextResponse.json(sorted);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}

// POST — admin only, create new story
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, imageUrl, category, link, isActive = true, sortOrder = 0 } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: "title and imageUrl are required" }, { status: 400 });
    }

    const stories = readStories();

    const newStory: Story = {
      id: Date.now().toString(),
      title,
      imageUrl,
      category: category || "General",
      link: link || undefined,
      isActive,
      sortOrder,
      createdAt: new Date().toISOString(),
    };

    stories.push(newStory);
    writeStories(stories);

    return NextResponse.json(newStory, { status: 201 });
  } catch (e: any) {
    console.error("[visual-stories POST]", e?.message);
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
