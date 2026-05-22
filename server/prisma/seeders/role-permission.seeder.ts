import { prisma } from "../../src/lib/prisma.js";
import { ALL_PERMISSIONS, PERMISSIONS, ROLES } from "../../src/config/constants.js";

type RoleName = (typeof ROLES)[keyof typeof ROLES];

const ASSIGNMENTS: Record<RoleName, string[]> = {
  SUPER_ADMIN: [...ALL_PERMISSIONS],
  MANAGER: ALL_PERMISSIONS.filter((p) => p !== PERMISSIONS.USERS_MANAGE),
  WAREHOUSE_OPERATOR: [
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.MOVEMENTS_CREATE,
    PERMISSIONS.PRODUCTS_VIEW,
  ],
  AUDITOR: [
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ALERTS_VIEW,
  ],
};

export async function seedRolePermissions(): Promise<void> {
  const [roles, permissions] = await Promise.all([
    prisma.role.findMany(),
    prisma.permission.findMany(),
  ]);
  const roleByName = new Map(roles.map((r) => [r.name, r.id]));
  const permByName = new Map(permissions.map((p) => [p.name, p.id]));

  for (const [roleName, permNames] of Object.entries(ASSIGNMENTS) as [RoleName, string[]][]) {
    const roleId = roleByName.get(roleName);
    if (!roleId) throw new Error(`Role not found: ${roleName}`);

    // Wipe and reapply (idempotent + reflects spec changes).
    await prisma.rolePermission.deleteMany({ where: { roleId } });

    const data = permNames
      .map((name) => permByName.get(name))
      .filter((id): id is string => Boolean(id))
      .map((permissionId) => ({ roleId, permissionId }));

    if (data.length > 0) {
      await prisma.rolePermission.createMany({ data, skipDuplicates: true });
    }
  }
}
