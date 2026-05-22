import { prisma } from "./prisma.js";
import { Prisma } from "../../generated/prisma/client.js";
import { logger } from "./logger.js";

/**
 * Lightweight, opt-in audit logger. Services that want automatic audit trail
 * call `auditLog(...)` after a successful mutation. Keeping this opt-in (instead
 * of a Prisma extension that fires on every mutation) avoids accidentally
 * polluting the table during seeders, background jobs and bulk imports.
 *
 * Usage:
 *   await prisma.product.update({ where: { id }, data });
 *   await auditLog({ userId, action: "UPDATE", table: "catalog.products",
 *                    recordId: id, oldData, newData });
 */
export interface AuditLogInput {
  userId: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT" | string;
  table: string;
  recordId: string;
  oldData?: unknown;
  newData?: unknown;
}

export async function auditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        tableAffected: input.table,
        recordId: input.recordId,
        oldData:
          input.oldData === undefined || input.oldData === null
            ? Prisma.JsonNull
            : (input.oldData as Prisma.InputJsonValue),
        newData:
          input.newData === undefined || input.newData === null
            ? Prisma.JsonNull
            : (input.newData as Prisma.InputJsonValue),
      },
    });
  } catch (err) {
    // Audit failures must never break the originating request.
    logger.error({ err, input }, "audit log write failed");
  }
}
