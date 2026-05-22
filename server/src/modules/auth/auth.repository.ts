import { prisma } from "../../lib/prisma.js";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email, isActive: true },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
      },
    });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
      },
    });
  },
};
