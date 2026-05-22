import { prisma } from "../../lib/prisma.js";
import { NotFoundError } from "../../shared/errors/AppError.js";
import { buildPaginationMeta, skipTake } from "../../shared/utils/pagination.js";
import type { ListNotificationsQuery } from "./notifications.schemas.js";

export const notificationService = {
  async list(query: ListNotificationsQuery, currentUserId: string) {
    const where = {
      ...(query.type ? { type: query.type } : {}),
      ...(query.isRead !== undefined ? { isRead: query.isRead } : {}),
      ...(query.onlyMine
        ? { OR: [{ userId: currentUserId }, { userId: null }] }
        : {}),
    };
    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        ...skipTake(query),
        orderBy: { [query.sortBy ?? "createdAt"]: query.sortDir },
      }),
      prisma.notification.count({ where }),
    ]);
    return { data, meta: buildPaginationMeta(total, query.page, query.perPage) };
  },

  async markAsRead(id: string) {
    const n = await prisma.notification.findUnique({ where: { id } });
    if (!n) throw new NotFoundError("Notification");
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  },

  async markAllAsReadForUser(userId: string) {
    return prisma.notification.updateMany({
      where: { OR: [{ userId }, { userId: null }], isRead: false },
      data: { isRead: true },
    });
  },
};
