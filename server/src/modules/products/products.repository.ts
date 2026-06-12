import { prisma } from "../../lib/prisma.js";
import { skipTake, type PaginationQuery } from "../../shared/utils/pagination.js";
import type { Prisma } from "../../../generated/prisma/client.js";

const PRODUCT_INCLUDE = {
  category: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
} as const;

export const productRepository = {
  list(filters: {
    q?: string;
    categoryId?: string;
    supplierId?: string;
    minPrice?: number;
    maxPrice?: number;
    pagination: PaginationQuery;
  }) {
    const where: Prisma.ProductWhereInput = {
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.supplierId ? { supplierId: filters.supplierId } : {}),
      ...(filters.q
        ? {
            OR: [
              { name: { contains: filters.q, mode: "insensitive" } },
              { sku: { contains: filters.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
        ? {
            basePrice: {
              ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
              ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
            },
          }
        : {}),
    };
    return Promise.all([
      prisma.product.findMany({
        where,
        ...skipTake(filters.pagination),
        orderBy: { [filters.pagination.sortBy ?? "createdAt"]: filters.pagination.sortDir },
        include: PRODUCT_INCLUDE,
      }),
      prisma.product.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { ...PRODUCT_INCLUDE, stockLevels: true },
    });
  },

  findBySku(sku: string) {
    return prisma.product.findUnique({ where: { sku } });
  },

  create(data: Prisma.ProductUncheckedCreateInput) {
    return prisma.product.create({ data, include: PRODUCT_INCLUDE });
  },

  update(id: string, data: Prisma.ProductUncheckedUpdateInput) {
    return prisma.product.update({ where: { id }, data, include: PRODUCT_INCLUDE });
  },

  softDelete(id: string) {
    return prisma.product.delete({ where: { id } });
  },

  /** Products whose total stock is below the configured `minStockAlert`. */
  async belowMinStock() {
    const products = await prisma.product.findMany({
      include: { stockLevels: { select: { quantity: true } }, ...PRODUCT_INCLUDE },
    });
    return products
      .map((p) => ({
        ...p,
        totalStock: p.stockLevels.reduce((acc, s) => acc + s.quantity, 0),
      }))
      .filter((p) => p.totalStock < p.minStockAlert);
  },
};
