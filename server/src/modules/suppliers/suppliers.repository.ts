import { prisma } from "../../lib/prisma.js";
import { skipTake, type PaginationQuery } from "../../shared/utils/pagination.js";

export const supplierRepository = {
  list(filters: { q?: string; minReliability?: number; pagination: PaginationQuery }) {
    const where = {
      ...(filters.q
        ? { name: { contains: filters.q, mode: "insensitive" as const } }
        : {}),
      ...(filters.minReliability !== undefined
        ? { reliabilityScore: { gte: filters.minReliability } }
        : {}),
    };
    return Promise.all([
      prisma.supplier.findMany({
        where,
        ...skipTake(filters.pagination),
        orderBy: { [filters.pagination.sortBy ?? "name"]: filters.pagination.sortDir },
      }),
      prisma.supplier.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.supplier.findUnique({ where: { id } });
  },

  create(data: { name: string; contactInfo: object; reliabilityScore: number }) {
    return prisma.supplier.create({ data });
  },

  update(
    id: string,
    data: Partial<{ name: string; contactInfo: object; reliabilityScore: number }>
  ) {
    return prisma.supplier.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.supplier.delete({ where: { id } });
  },

  countProducts(id: string) {
    return prisma.product.count({ where: { supplierId: id } });
  },
};
