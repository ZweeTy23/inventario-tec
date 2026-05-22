import { prisma } from "../../src/lib/prisma.js";

const CATEGORIES = ["Electronics", "Tools", "Spare Parts", "Consumables"];

export async function seedCategories(): Promise<void> {
  for (const name of CATEGORIES) {
    const exists = await prisma.category.findFirst({ where: { name, parentId: null } });
    if (!exists) {
      await prisma.category.create({ data: { name, parentId: null } });
    }
  }
}
