import { prisma } from "../../lib/prisma.js";
import { skipTake, type PaginationQuery } from "../../shared/utils/pagination.js";

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  role: { select: { id: true, name: true } },
} as const;

export const userRepository = {
  list(filters: {
    q?: string;
    roleId?: string;
    isActive?: boolean;
    pagination: PaginationQuery;
  }) {
    const where = {
      ...(filters.roleId ? { roleId: filters.roleId } : {}),
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
      ...(filters.q
        ? {
            OR: [
              { name: { contains: filters.q, mode: "insensitive" as const } },
              { email: { contains: filters.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    return Promise.all([
      prisma.user.findMany({
        where,
        ...skipTake(filters.pagination),
        orderBy: { [filters.pagination.sortBy ?? "createdAt"]: filters.pagination.sortDir },
        select: SAFE_USER_SELECT,
      }),
      prisma.user.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: SAFE_USER_SELECT });
  },

  findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email } });
  },

  create(data: {
    name: string;
    email: string;
    passwordHash: string;
    roleId: string;
    isActive: boolean;
  }) {
    return prisma.user.create({ data, select: SAFE_USER_SELECT });
  },

  update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      passwordHash: string;
      roleId: string;
      isActive: boolean;
    }>
  ) {
    return prisma.user.update({ where: { id }, data, select: SAFE_USER_SELECT });
  },

  softDelete(id: string) {
    return prisma.user.delete({ where: { id } });
  },
};
