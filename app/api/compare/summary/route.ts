import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";

async function getClient() {
  const setting = await prisma.setting.findUnique({ where: { key: "openai_api_key" } }).catch(() => null);
  const apiKey = setting?.value || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("no key");
  return new OpenAI({ apiKey });
}

export async function POST(req: NextRequest) {
  try {
    const { vehicle1, vehicle2 } = await req.json();
    if (!vehicle1 || !vehicle2) return NextResponse.json({ error: "missing" }, { status: 400 });

    const client = await getClient();
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert Indian automotive journalist. Write short, factual, balanced comparison verdicts. Never hallucinate specs.",
        },
        {
          role: "user",
          content: `Write a 2-sentence comparison verdict between ${vehicle1} and ${vehicle2} for Indian buyers. Mention which is better for value, features, or a specific use case. Be direct and helpful.`,
        },
      ],
      temperature: 0.6,
      max_tokens: 160,
    });

    const result = completion.choices[0]?.message?.content?.trim() || "";
    return NextResponse.json({ result }, { headers: { "Cache-Control": "public, s-maxage=3600" } });
  } catch {
    return NextResponse.json({ result: null });
  }
}
