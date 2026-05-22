import { prisma } from "../../lib/prisma.js";

export const roleService = {
  list() {
    return prisma.role.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { users: true, rolePermissions: true } },
        rolePermissions: {
          include: { permission: { select: { id: true, name: true, module: true } } },
        },
      },
    });
  },
};
