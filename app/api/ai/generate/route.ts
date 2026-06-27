import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Groq from "groq-sdk";
import prisma from "@/lib/prisma";

async function getGroqClient() {
  const setting = await prisma.setting.findUnique({ where: { key: "groq_api_key" } });
  const apiKey = setting?.value || process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Groq API key not configured. Add it in AI Settings.");
  return new Groq({ apiKey });
}

const SYSTEM_PROMPT =
  "You are an expert automotive content writer for an Indian car marketplace. Write accurate, professional content. Never hallucinate vehicle specifications. When asked for JSON arrays or objects, return only valid JSON with no markdown formatting.";

const prompts: Record<string, (data: any) => string> = {
  description: (d) =>
    `Write a compelling 2-paragraph description for the ${d.brand} ${d.vehicleName} (${d.type}). Focus on performance, design, and value. Be factual and engaging. No hallucinated specs.`,

  overview: (d) =>
    `Write a concise 1-paragraph overview for the ${d.brand} ${d.vehicleName} suitable for a vehicle detail page. Mention body type, target audience, and key strengths.`,

  pros: (d) =>
    `List 5 key advantages of the ${d.brand} ${d.vehicleName}. Return as a JSON array of short strings only. Example: ["Spacious cabin", "Long range"]. No markdown, just the array.`,

  cons: (d) =>
    `List 4 potential drawbacks of the ${d.brand} ${d.vehicleName}. Return as a JSON array of short strings only. No markdown, just the array.`,

  highlights: (d) =>
    `List 6 key highlights/features of the ${d.brand} ${d.vehicleName}. Return as a JSON array of short strings. No markdown, just the array.`,

  seo_title: (d) =>
    `Write an SEO-optimized title tag (under 60 chars) for ${d.brand} ${d.vehicleName}. Include price context if applicable.`,

  seo_description: (d) =>
    `Write an SEO meta description (under 160 chars) for ${d.brand} ${d.vehicleName}. Include price, key features, and call to action.`,

  excerpt: (d) =>
    `Write a 2-sentence article excerpt/summary for an article titled: "${d.title}". Make it engaging and informative.`,

  faqs: (d) =>
    `Generate 5 frequently asked questions and detailed answers about the ${d.brand} ${d.vehicleName}. Return as a JSON array of {question, answer} objects. No markdown, just the array.`,

  comparison_summary: (d) =>
    `Write a 1-paragraph comparison summary between ${d.vehicle1} and ${d.vehicle2}. Highlight key differences in performance, features, and value for money.`,

  autofill: (d) =>
    `You are an expert Indian automotive data analyst. Provide comprehensive, factual data for the ${d.brand} ${d.vehicleName} (type: ${d.type}).

Return ONLY a valid JSON object with this exact structure (use null for unknown fields, never guess specs):
{
  "shortDescription": "one-liner for listing page",
  "description": "2-paragraph engaging description",
  "overview": "1-paragraph overview",
  "priceDisplay": "₹X.XX - ₹X.XX Lakh",
  "priceMin": 0,
  "priceMax": 0,
  "engine": "e.g. 1.2L Turbo",
  "power": "e.g. 120 bhp",
  "torque": "e.g. 170 Nm",
  "mileage": "e.g. 18.4 kmpl",
  "topSpeed": "e.g. 180 km/h",
  "bodyType": "SUV|Sedan|Hatchback|etc",
  "segment": "e.g. Compact SUV",
  "batteryCapacity": null,
  "range": null,
  "chargingTime": null,
  "motorPower": null,
  "motorTorque": null,
  "videoUrl": null,
  "keyHighlights": ["highlight1","highlight2","highlight3","highlight4","highlight5","highlight6"],
  "pros": ["pro1","pro2","pro3","pro4","pro5"],
  "cons": ["con1","con2","con3","con4"],
  "variants": [
    {"name":"Base","priceDisplay":"₹X.XX Lakh","fuelType":"Petrol","transmission":"Manual","mileage":"X kmpl"},
    {"name":"Mid","priceDisplay":"₹X.XX Lakh","fuelType":"Petrol","transmission":"Automatic","mileage":"X kmpl"}
  ],
  "colours": [
    {"name":"Colour Name","hexCode":"#RRGGBB"}
  ],
  "faqs": [
    {"question":"Q1?","answer":"A1"},
    {"question":"Q2?","answer":"A2"},
    {"question":"Q3?","answer":"A3"},
    {"question":"Q4?","answer":"A4"},
    {"question":"Q5?","answer":"A5"}
  ],
  "features": [
    "Feature name (e.g. Sunroof)",
    "Feature name (e.g. Apple CarPlay & Android Auto)",
    "Feature name (e.g. Ventilated Front Seats)",
    "Feature name (e.g. 360-Degree Camera)",
    "Feature name (e.g. Wireless Charging)",
    "Feature name (e.g. Automatic Climate Control)"
  ],
  "safety": [
    "Safety feature (e.g. 6 Airbags)",
    "Safety feature (e.g. ABS with EBD)",
    "Safety feature (e.g. Electronic Stability Control)",
    "Safety feature (e.g. Rear Parking Sensors)",
    "Safety feature (e.g. ISOFIX Child Seat Mounts)"
  ],
  "seo": {
    "metaTitle": "under 60 chars title for Google",
    "metaDescription": "under 160 chars description with CTA",
    "metaKeywords": "keyword1, keyword2, keyword3",
    "ogTitle": "social sharing title",
    "ogDescription": "social sharing description"
  }
}

Return only the JSON, no markdown, no explanation.`,
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { field, ...data } = body;

    if (!field || !prompts[field]) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }

    const client = await getGroqClient();
    const prompt = prompts[field](data);

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: field === "autofill" ? 4000 : 600,
      ...(field === "autofill" ? { response_format: { type: "json_object" } } : {}),
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "";

    const jsonFields = ["pros", "cons", "highlights", "faqs", "autofill"];
    if (jsonFields.includes(field)) {
      try {
        // Strip code fences, then extract outermost JSON container
        const stripped = raw.replace(/```[\w]*\s*/g, "").replace(/```/g, "").trim();
        // For objects find {…}, for arrays find […]
        const isArray = stripped.trimStart().startsWith("[");
        const open = isArray ? "[" : "{";
        const close = isArray ? "]" : "}";
        const start = stripped.indexOf(open);
        const end = stripped.lastIndexOf(close);
        const jsonStr = start !== -1 && end > start ? stripped.slice(start, end + 1) : stripped;
        const parsed = JSON.parse(jsonStr);
        return NextResponse.json({ result: parsed });
      } catch {
        return NextResponse.json({ error: "AI returned invalid JSON. Please try again." }, { status: 422 });
      }
    }

    return NextResponse.json({ result: raw });
  } catch (e: any) {
    console.error("AI error:", e);
    return NextResponse.json({ error: e.message || "AI generation failed" }, { status: 500 });
  }
}
