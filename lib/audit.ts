import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface AuditParams {
  userId?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  changes?: Prisma.InputJsonValue;
  ipAddress?: string;
}

export async function createAuditLog(params: AuditParams) {
  try {
    await prisma.auditLog.create({ data: params });
  } catch {
    // Audit logging must never crash the caller
  }
}
