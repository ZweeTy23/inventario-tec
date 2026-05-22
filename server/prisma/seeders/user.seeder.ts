import { prisma } from "../../src/lib/prisma.js";
import { hashPassword } from "../../src/lib/hash.js";
import { ROLES } from "../../src/config/constants.js";

const ADMIN_EMAIL = "admin@inventory.com";
const ADMIN_PASSWORD = "Admin123*";

export async function seedUsers(): Promise<void> {
  const role = await prisma.role.findUnique({ where: { name: ROLES.SUPER_ADMIN } });
  if (!role) throw new Error("SUPER_ADMIN role not seeded yet");

  const existing = await prisma.user.findFirst({ where: { email: ADMIN_EMAIL } });
  if (existing) return;

  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  await prisma.user.create({
    data: {
      name: "Super Admin",
      email: ADMIN_EMAIL,
      passwordHash,
      roleId: role.id,
      isActive: true,
    },
  });
}
