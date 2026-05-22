import { prisma } from "../../src/lib/prisma.js";
import { makeStockLevel } from "../factories/stock-level.factory.js";
import { faker } from "@faker-js/faker/locale/en";

const STOCK_PER_PRODUCT_MIN = 1;
const STOCK_PER_PRODUCT_MAX = 4;
const CHUNK = 500;

/**
 * For each product we drop 1-4 stock rows on random LEVEL locations,
 * with unique (product, location, batch) triples — matching the @@unique constraint.
 */
export async function seedStock(): Promise<void> {
  const existing = await prisma.stockLevel.count();
  if (existing > 0) return;

  const [products, levels] = await Promise.all([
    prisma.product.findMany({ select: { id: true } }),
    prisma.location.findMany({
      where: { locationType: "LEVEL" },
      select: { id: true },
    }),
  ]);

  if (products.length === 0 || levels.length === 0) {
    throw new Error("Cannot seed stock without products and LEVEL locations");
  }

  const rows: ReturnType<typeof makeStockLevel>[] = [];
  const seen = new Set<string>();

  for (const product of products) {
    const count = faker.number.int({ min: STOCK_PER_PRODUCT_MIN, max: STOCK_PER_PRODUCT_MAX });
    const chosenLevels = faker.helpers.arrayElements(levels, count);
    for (const level of chosenLevels) {
      const row = makeStockLevel({ productId: product.id, locationId: level.id });
      const key = `${row.productId}|${row.locationId}|${row.batchNumber}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push(row);
    }
  }

  for (let i = 0; i < rows.length; i += CHUNK) {
    await prisma.stockLevel.createMany({
      data: rows.slice(i, i + CHUNK),
      skipDuplicates: true,
    });
  }
}
