import { prisma } from "./prisma.js";

export async function createAuditLog(options: {
  userId: string;
  action: string;
  table: string;
  recordId: string;
  oldData?: unknown;
  newData?: unknown;
  ip?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: options.userId,
        action: options.action,
        tableAffected: options.table,
        recordId: options.recordId,
        oldData: options.oldData as any,
        newData: options.newData as any,
      },
    });
  } catch (err) {
    // non-blocking: do not crash main flow if audit fails
    console.error("Audit log failed:", err);
  }
}
