import { prisma } from "../../lib/prisma.js";
import { buildPaginationMeta, skipTake } from "../../shared/utils/pagination.js";
import type { ListAuditLogsQuery } from "./audit-logs.schemas.js";

export const auditLogService = {
  async list(query: ListAuditLogsQuery) {
    const where = {
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.action ? { action: query.action } : {}),
      ...(query.tableAffected ? { tableAffected: query.tableAffected } : {}),
      ...(query.recordId ? { recordId: query.recordId } : {}),
      ...(query.fromDate || query.toDate
        ? {
            createdAt: {
              ...(query.fromDate ? { gte: query.fromDate } : {}),
              ...(query.toDate ? { lte: query.toDate } : {}),
            },
          }
        : {}),
    };
    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        ...skipTake(query),
        orderBy: { [query.sortBy ?? "createdAt"]: query.sortDir },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { data, meta: buildPaginationMeta(total, query.page, query.perPage) };
  },
};
