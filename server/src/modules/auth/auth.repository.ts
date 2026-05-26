import { prisma } from "../../lib/prisma.js";
import type { RegisterInput } from "./auth.schemas.js";

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

  // NUEVO: Crear usuario en la BD (asume que ya tienes rol por defecto o asignado)
  createUser(data: RegisterInput & { passwordHash: string; roleId: string }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        roleId: data.roleId,
        isActive: true,
      },
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