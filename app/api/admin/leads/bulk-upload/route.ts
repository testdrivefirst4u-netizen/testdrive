import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(role ?? "")) return null;
  return session;
}

// Compute staggered releaseAt dates respecting daily limit
async function computeReleaseDates(
  dealerId: string,
  count: number,
  maxPerDay: number
): Promise<Date[]> {
  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);

  // Count how many leads are already scheduled per future day (including today)
  const scheduled = await prisma.lead.findMany({
    where: { dealerId, releaseAt: { gte: todayStart } },
    select: { releaseAt: true },
  });

  // Build a map: dateKey -> count
  const dayMap = new Map<string, number>();
  for (const l of scheduled) {
    const key = new Date(l.releaseAt ?? new Date()).toDateString();
    dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
  }

  const dates: Date[] = [];
  let dayOffset = 0;

  for (let i = 0; i < count; i++) {
    // Find the next day that has capacity
    while (true) {
      const candidate = new Date(todayStart);
      candidate.setDate(candidate.getDate() + dayOffset);
      const key = candidate.toDateString();
      const used = dayMap.get(key) ?? 0;
      if (used < maxPerDay) {
        dayMap.set(key, used + 1);
        // Set release time to 8am on that day
        const releaseDate = new Date(candidate);
        releaseDate.setHours(8, 0, 0, 0);
        dates.push(releaseDate);
        break;
      }
      dayOffset++;
    }
  }

  return dates;
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const dealerId = formData.get("dealerId") as string | null;
  const brandId  = formData.get("brandId")  as string | null;

  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (rows.length === 0) return NextResponse.json({ error: "File is empty" }, { status: 400 });
  if (rows.length > 5000) return NextResponse.json({ error: "Max 5000 rows per upload" }, { status: 400 });

  // Validate required columns
  const required = ["name", "mobile"];
  const cols = Object.keys(rows[0]).map(k => k.toLowerCase().trim());
  for (const r of required) {
    if (!cols.some(c => c === r)) {
      return NextResponse.json({ error: `Missing required column: "${r}"` }, { status: 400 });
    }
  }

  // Normalise keys to lowercase
  const normalised = rows.map(row => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      out[k.toLowerCase().trim()] = String(v ?? "").trim();
    }
    return out;
  });

  // If dealerId given, compute drip dates
  let releaseDates: Date[] | null = null;
  if (dealerId) {
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: { maxLeadsPerDay: true },
    });
    const maxPerDay = dealer?.maxLeadsPerDay ?? 50;
    releaseDates = await computeReleaseDates(dealerId, normalised.length, maxPerDay);
  }

  // Resolve brandId from dealer if not explicitly provided
  let resolvedBrandId = brandId;
  if (!resolvedBrandId && dealerId) {
    const d = await prisma.dealer.findUnique({ where: { id: dealerId }, select: { brandId: true } });
    resolvedBrandId = d?.brandId ?? null;
  }

  const created: string[] = [];
  const errors:  { row: number; error: string }[] = [];

  for (let i = 0; i < normalised.length; i++) {
    const row = normalised[i];
    const name   = row["name"]   || row["customer name"] || row["full name"];
    const mobile = row["mobile"] || row["phone"]         || row["contact"];

    if (!name || !mobile) {
      errors.push({ row: i + 2, error: "Missing name or mobile" });
      continue;
    }

    try {
      const lead = await prisma.lead.create({
        data: {
          name,
          mobile,
          email:       row["email"]        || null,
          city:        row["city"]          || null,
          vehicleName: row["vehicle"]       || row["vehiclename"] || row["vehicle name"] || null,
          vehicleType: row["vehicletype"]   || row["vehicle type"] || null,
          source:      "bulk_upload",
          status:      "new",
          brandId:     resolvedBrandId || null,
          dealerId:    dealerId        || null,
          releaseAt:   releaseDates ? releaseDates[i] : new Date(),
        },
        select: { id: true },
      });
      created.push(lead.id);
    } catch {
      errors.push({ row: i + 2, error: "Database error" });
    }
  }

  let message = `${created.length} leads uploaded.`;
  if (releaseDates && dealerId) {
    const d = await prisma.dealer.findUnique({ where: { id: dealerId }, select: { maxLeadsPerDay: true } });
    const maxPerDay = d?.maxLeadsPerDay ?? 50;
    const days = Math.ceil(created.length / maxPerDay);
    message = `${created.length} leads uploaded. Dripped across ${days} day${days > 1 ? "s" : ""} (${maxPerDay}/day limit).`;
  }

  return NextResponse.json({
    success: true,
    created: created.length,
    errors:  errors.length,
    errorDetails: errors.slice(0, 20),
    message,
  });
}
