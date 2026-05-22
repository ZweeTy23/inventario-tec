import { prisma } from "../../lib/prisma.js";

export const permissionService = {
  async listGroupedByModule() {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { name: "asc" }],
    });
    const groups: Record<string, typeof permissions> = {};
    for (const p of permissions) {
      (groups[p.module] ??= []).push(p);
    }
    return groups;
  },
};
