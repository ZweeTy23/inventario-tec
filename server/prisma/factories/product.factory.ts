import { faker } from "@faker-js/faker/locale/en";

export interface MakeProductOverrides {
  categoryId: string;
  supplierId: string;
  sku?: string;
  name?: string;
  basePrice?: number;
  attributes?: Record<string, unknown>;
  minStockAlert?: number;
}

function randomSku(): string {
  return `SKU-${faker.string.alphanumeric({ length: 8, casing: "upper" })}`;
}

function randomAttributes(): Record<string, unknown> {
  return {
    color: faker.color.human(),
    weightKg: Number(faker.number.float({ min: 0.1, max: 50, fractionDigits: 2 }).toFixed(2)),
    dimensionsCm: {
      width: faker.number.int({ min: 5, max: 200 }),
      height: faker.number.int({ min: 5, max: 200 }),
      depth: faker.number.int({ min: 5, max: 200 }),
    },
    brand: faker.company.name(),
    material: faker.commerce.productMaterial(),
    countryOfOrigin: faker.location.country(),
  };
}

export function makeProduct(overrides: MakeProductOverrides) {
  return {
    categoryId: overrides.categoryId,
    supplierId: overrides.supplierId,
    sku: overrides.sku ?? randomSku(),
    name: overrides.name ?? `${faker.commerce.productAdjective()} ${faker.commerce.product()}`,
    basePrice:
      overrides.basePrice ??
      Number(faker.number.float({ min: 10, max: 5000, fractionDigits: 2 }).toFixed(2)),
    attributes: overrides.attributes ?? randomAttributes(),
    minStockAlert: overrides.minStockAlert ?? faker.number.int({ min: 5, max: 50 }),
  };
}
