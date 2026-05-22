import { prisma } from "../../src/lib/prisma.js";
import { PERMISSIONS } from "../../src/config/constants.js";

interface PermissionDef {
  name: string;
  module: string;
}

const PERMISSION_DEFINITIONS: PermissionDef[] = [
  { name: PERMISSIONS.INVENTORY_VIEW, module: "inventory" },
  { name: PERMISSIONS.INVENTORY_CREATE, module: "inventory" },
  { name: PERMISSIONS.INVENTORY_UPDATE, module: "inventory" },
  { name: PERMISSIONS.INVENTORY_DELETE, module: "inventory" },

  { name: PERMISSIONS.PRODUCTS_VIEW, module: "products" },
  { name: PERMISSIONS.PRODUCTS_CREATE, module: "products" },
  { name: PERMISSIONS.PRODUCTS_UPDATE, module: "products" },
  { name: PERMISSIONS.PRODUCTS_DELETE, module: "products" },

  { name: PERMISSIONS.MOVEMENTS_VIEW, module: "movements" },
  { name: PERMISSIONS.MOVEMENTS_CREATE, module: "movements" },
  { name: PERMISSIONS.MOVEMENTS_APPROVE, module: "movements" },

  { name: PERMISSIONS.REPORTS_VIEW, module: "reports" },
  { name: PERMISSIONS.ALERTS_VIEW, module: "alerts" },
  { name: PERMISSIONS.USERS_MANAGE, module: "users" },
];

export async function seedPermissions(): Promise<void> {
  for (const def of PERMISSION_DEFINITIONS) {
    await prisma.permission.upsert({
      where: { name: def.name },
      update: { module: def.module },
      create: def,
    });
  }
}
