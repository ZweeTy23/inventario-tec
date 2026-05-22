import { faker } from "@faker-js/faker/locale/en";

export interface MakeStockLevelOverrides {
  productId: string;
  locationId: string;
  quantity?: number;
  batchNumber?: string;
  expirationDate?: Date | null;
}

function randomBatch(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const tail = faker.string.alphanumeric({ length: 4, casing: "upper" });
  return `BATCH-${yyyy}${mm}-${tail}`;
}

function randomExpiration(): Date | null {
  if (faker.number.int({ min: 0, max: 9 }) < 3) return null;
  return faker.date.between({
    from: new Date(),
    to: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 24),
  });
}

export function makeStockLevel(overrides: MakeStockLevelOverrides) {
  return {
    productId: overrides.productId,
    locationId: overrides.locationId,
    quantity: overrides.quantity ?? faker.number.int({ min: 0, max: 500 }),
    batchNumber: overrides.batchNumber ?? randomBatch(),
    expirationDate:
      overrides.expirationDate === undefined ? randomExpiration() : overrides.expirationDate,
  };
}
