import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(role ?? "")) return null;
  return session;
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { webhookUrl, apiKey, apiKeyType } = await req.json();

  if (!webhookUrl) {
    return NextResponse.json({ error: "webhookUrl required" }, { status: 400 });
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  let url: string = webhookUrl;

  if (apiKey) {
    const type = apiKeyType || "bearer";
    if (type === "bearer") {
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else if (type === "x-api-key") {
      headers["X-API-Key"] = apiKey;
    } else if (type === "query") {
      url += (url.includes("?") ? "&" : "?") + `api_key=${encodeURIComponent(apiKey)}`;
    }
  }

  const testPayload = {
    id:          "test_connection",
    name:        "Test Lead",
    mobile:      "0000000000",
    city:        "Hyderabad",
    vehicleName: "Test Vehicle",
    source:      "crm_test",
    status:      "new",
    createdAt:   new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
    origin:      "testdrivefirst",
    _test:       true,
  };

  try {
    const res = await fetch(url, {
      method:  "POST",
      headers,
      body:    JSON.stringify(testPayload),
      signal:  AbortSignal.timeout(8000),
    });
    if (res.ok) return NextResponse.json({ success: true, status: res.status });
    return NextResponse.json({ error: `CRM returned ${res.status}` }, { status: 502 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
