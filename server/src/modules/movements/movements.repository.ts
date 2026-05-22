import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import type { MovementStatus, MovementType } from "../../../generated/prisma/enums.js";
import { skipTake, type PaginationQuery } from "../../shared/utils/pagination.js";

const MOVEMENT_INCLUDE = {
  product: { select: { id: true, sku: true, name: true } },
  user: { select: { id: true, name: true, email: true } },
  sourceLocation: { select: { id: true, name: true, locationType: true } },
  destinationLocation: { select: { id: true, name: true, locationType: true } },
} as const;

export const movementRepository = {
  list(filters: {
    productId?: string;
    userId?: string;
    movementType?: MovementType;
    status?: MovementStatus;
    fromDate?: Date;
    toDate?: Date;
    pagination: PaginationQuery;
  }) {
    const where: Prisma.MovementWhereInput = {
      ...(filters.productId ? { productId: filters.productId } : {}),
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.movementType ? { movementType: filters.movementType } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.fromDate || filters.toDate
        ? {
            createdAt: {
              ...(filters.fromDate ? { gte: filters.fromDate } : {}),
              ...(filters.toDate ? { lte: filters.toDate } : {}),
            },
          }
        : {}),
    };
    return Promise.all([
      prisma.movement.findMany({
        where,
        ...skipTake(filters.pagination),
        orderBy: { [filters.pagination.sortBy ?? "createdAt"]: filters.pagination.sortDir },
        include: MOVEMENT_INCLUDE,
      }),
      prisma.movement.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.movement.findUnique({ where: { id }, include: MOVEMENT_INCLUDE });
  },

  create(data: Prisma.MovementUncheckedCreateInput) {
    return prisma.movement.create({ data, include: MOVEMENT_INCLUDE });
  },

  updateStatus(id: string, status: MovementStatus) {
    return prisma.movement.update({
      where: { id },
      data: { status },
      include: MOVEMENT_INCLUDE,
    });
  },
};
