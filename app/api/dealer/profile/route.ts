import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { dealerAuth } from "@/lib/auth-dealer";

async function getDealer(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      adminDealer: true,
      dealer:      true,
    },
  });
  return user?.adminDealer ?? user?.dealer ?? null;
}

export async function GET() {
  const session = await dealerAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;
  const dealer = await getDealer(userId);
  if (!dealer) return NextResponse.json({ error: "No dealer profile" }, { status: 404 });
  return NextResponse.json(dealer);
}

export async function PUT(req: NextRequest) {
  const session = await dealerAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;
  const dealer = await getDealer(userId);
  if (!dealer) return NextResponse.json({ error: "No dealer profile" }, { status: 404 });

  const body = await req.json();
  const { phone, managerName, managerPhone, address, businessHours,
          crmWebhookUrl, crmApiKey, crmApiKeyType } = body;

  const updated = await prisma.dealer.update({
    where: { id: dealer.id },
    data: {
      ...(phone          !== undefined ? { phone }          : {}),
      ...(managerName    !== undefined ? { managerName }    : {}),
      ...(managerPhone   !== undefined ? { managerPhone }   : {}),
      ...(address        !== undefined ? { address }        : {}),
      ...(businessHours  !== undefined ? { businessHours }  : {}),
      // CRM integration fields
      ...(crmWebhookUrl  !== undefined ? { crmWebhookUrl: crmWebhookUrl || null }  : {}),
      ...(crmApiKey      !== undefined ? { crmApiKey:     crmApiKey     || null }  : {}),
      ...(crmApiKeyType  !== undefined ? { crmApiKeyType: crmApiKeyType || null }  : {}),
    },
  });

  return NextResponse.json(updated);
}
