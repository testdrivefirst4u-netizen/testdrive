import { NextRequest, NextResponse } from "next/server";
import { dealerAuth } from "@/lib/auth-dealer";

export async function POST(req: NextRequest) {
  const session = await dealerAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { webhookUrl, apiKey, apiKeyType } = await req.json();

  if (!webhookUrl) {
    return NextResponse.json({ error: "webhookUrl required" }, { status: 400 });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  let url: string = webhookUrl;

  if (apiKey) {
    const type = apiKeyType || "bearer";
    if (type === "bearer") {
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else if (type === "x-api-key") {
      headers["X-API-Key"] = apiKey;
    } else if (type === "query") {
      const sep = url.includes("?") ? "&" : "?";
      url = `${url}${sep}api_key=${encodeURIComponent(apiKey)}`;
    }
  }

  // Send a test ping payload
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

    if (res.ok) {
      return NextResponse.json({ success: true, status: res.status });
    }
    return NextResponse.json(
      { error: `CRM returned ${res.status}` },
      { status: 502 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 }
    );
  }
}
