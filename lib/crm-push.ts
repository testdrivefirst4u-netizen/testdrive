import prisma from "@/lib/prisma";

export interface CrmLeadPayload {
  id:           string;
  name:         string;
  mobile:       string;
  email?:       string | null;
  city?:        string | null;
  vehicleName?: string | null;
  vehicleType?: string | null;
  source:       string;
  status:       string;
  buyTime?:     string | null;
  notes?:       string | null;
  createdAt:    string;
  updatedAt:    string;
  // Metadata for the CRM to identify origin
  origin:       "testdrivefirst";
}

/**
 * Fire-and-forget push of a lead to the dealer's configured CRM webhook.
 * Never throws — errors are logged silently so the main request is never blocked.
 */
export async function pushLeadToCrm(dealerId: string | null | undefined, payload: CrmLeadPayload) {
  if (!dealerId) return;

  let dealer: { crmWebhookUrl: string | null; crmApiKey: string | null; crmApiKeyType: string | null } | null = null;

  try {
    dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: { crmWebhookUrl: true, crmApiKey: true, crmApiKeyType: true },
    });
  } catch {
    return;
  }

  if (!dealer?.crmWebhookUrl) return;

  const { crmWebhookUrl, crmApiKey, crmApiKeyType } = dealer;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    let url = crmWebhookUrl;

    if (crmApiKey) {
      const type = crmApiKeyType || "bearer";
      if (type === "bearer") {
        headers["Authorization"] = `Bearer ${crmApiKey}`;
      } else if (type === "x-api-key") {
        headers["X-API-Key"] = crmApiKey;
      } else if (type === "query") {
        const sep = url.includes("?") ? "&" : "?";
        url = `${url}${sep}api_key=${encodeURIComponent(crmApiKey)}`;
      }
    }

    const res = await fetch(url, {
      method:  "POST",
      headers,
      body:    JSON.stringify(payload),
      signal:  AbortSignal.timeout(8000), // 8s max — don't hold up the response
    });

    if (!res.ok) {
      console.warn(`[CRM PUSH] Dealer ${dealerId} webhook returned ${res.status}`);
    }
  } catch (err) {
    // Network error, timeout, etc. — log and move on
    console.warn(`[CRM PUSH] Dealer ${dealerId} push failed:`, (err as Error).message);
  }
}

/** Helper: build the payload from a Prisma lead record */
export function buildCrmPayload(lead: {
  id: string; name: string; mobile: string; email?: string | null;
  city?: string | null; vehicleName?: string | null; vehicleType?: string | null;
  source: string; status: string; buyTime?: string | null; notes?: string | null;
  createdAt: Date; updatedAt: Date;
}): CrmLeadPayload {
  return {
    id:          lead.id,
    name:        lead.name,
    mobile:      lead.mobile,
    email:       lead.email,
    city:        lead.city,
    vehicleName: lead.vehicleName,
    vehicleType: lead.vehicleType,
    source:      lead.source,
    status:      lead.status,
    buyTime:     lead.buyTime,
    notes:       lead.notes,
    createdAt:   lead.createdAt.toISOString(),
    updatedAt:   lead.updatedAt.toISOString(),
    origin:      "testdrivefirst",
  };
}
