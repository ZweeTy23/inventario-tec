import { prisma } from "../../src/lib/prisma.js";
import { ROLES } from "../../src/config/constants.js";

const ROLE_DEFINITIONS = [
  { name: ROLES.SUPER_ADMIN, description: "Full access to every module and operation" },
  { name: ROLES.MANAGER, description: "Manage catalog, inventory and approvals" },
  {
    name: ROLES.WAREHOUSE_OPERATOR,
    description: "Create movements and view inventory in the warehouse",
  },
  { name: ROLES.AUDITOR, description: "Read-only access to inventory, reports and alerts" },
];

export async function seedRoles(): Promise<void> {
  for (const def of ROLE_DEFINITIONS) {
    await prisma.role.upsert({
      where: { name: def.name },
      update: { description: def.description },
      create: { name: def.name, description: def.description },
    });
  }
}
