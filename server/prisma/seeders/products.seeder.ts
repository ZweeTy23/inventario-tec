import { prisma } from "../../src/lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { makeProduct } from "../factories/product.factory.js";
import { faker } from "@faker-js/faker/locale/en";

const TARGET_COUNT = 100;
const BATCH_SIZE = 25;

export async function seedProducts(): Promise<void> {
  const current = await prisma.product.count();
  const missing = TARGET_COUNT - current;
  if (missing <= 0) return;

  const [categories, suppliers] = await Promise.all([
    prisma.category.findMany({ select: { id: true } }),
    prisma.supplier.findMany({ select: { id: true } }),
  ]);

  if (categories.length === 0 || suppliers.length === 0) {
    throw new Error("Cannot seed products: categories or suppliers are empty");
  }

  let created = 0;
  while (created < missing) {
    const batch = Math.min(BATCH_SIZE, missing - created);
    const rows: Prisma.ProductCreateManyInput[] = Array.from({ length: batch }, () => {
      const p = makeProduct({
        categoryId: faker.helpers.arrayElement(categories).id,
        supplierId: faker.helpers.arrayElement(suppliers).id,
      });
      return {
        categoryId: p.categoryId,
        supplierId: p.supplierId,
        sku: p.sku,
        name: p.name,
        basePrice: p.basePrice,
        attributes: p.attributes as Prisma.InputJsonValue,
        minStockAlert: p.minStockAlert,
      };
    });
    await prisma.product.createMany({ data: rows, skipDuplicates: true });
    created += batch;
  }
}
