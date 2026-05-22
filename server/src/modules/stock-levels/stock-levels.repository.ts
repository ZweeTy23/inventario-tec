import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import { skipTake, type PaginationQuery } from "../../shared/utils/pagination.js";

const STOCK_INCLUDE = {
  product: { select: { id: true, sku: true, name: true } },
  location: { select: { id: true, name: true, locationType: true } },
} as const;

export const stockLevelRepository = {
  list(filters: {
    productId?: string;
    locationId?: string;
    batchNumber?: string;
    expiringBefore?: Date;
    pagination: PaginationQuery;
  }) {
    const where: Prisma.StockLevelWhereInput = {
      ...(filters.productId ? { productId: filters.productId } : {}),
      ...(filters.locationId ? { locationId: filters.locationId } : {}),
      ...(filters.batchNumber
        ? { batchNumber: { contains: filters.batchNumber, mode: "insensitive" } }
        : {}),
      ...(filters.expiringBefore
        ? { expirationDate: { lte: filters.expiringBefore } }
        : {}),
    };
    return Promise.all([
      prisma.stockLevel.findMany({
        where,
        ...skipTake(filters.pagination),
        orderBy: { [filters.pagination.sortBy ?? "createdAt"]: filters.pagination.sortDir },
        include: STOCK_INCLUDE,
      }),
      prisma.stockLevel.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.stockLevel.findUnique({ where: { id }, include: STOCK_INCLUDE });
  },

  update(id: string, data: Prisma.StockLevelUncheckedUpdateInput) {
    return prisma.stockLevel.update({ where: { id }, data, include: STOCK_INCLUDE });
  },
};
