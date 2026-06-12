import { prisma } from "../../src/lib/prisma.js";
import { makeMovement } from "../factories/movement.factory.js";
import { faker } from "@faker-js/faker/locale/en";
import type {
  MovementStatus,
  MovementType,
} from "../../generated/prisma/enums.js";

const TARGET_COUNT = 200;

const ENTRY_TYPES: MovementType[] = ["PURCHASE_ENTRY", "RETURN_ENTRY"];
const EXIT_TYPES: MovementType[] = ["SALE_EXIT", "LOSS_EXIT", "EXPIRED_EXIT"];

/**
 * Mix of entries, exits and transfers in PENDING/APPROVED/REJECTED states.
 * NB: we *do not* mutate stock_levels here — only the movement records.
 * The seed represents historical movement records as if approvals already
 * happened in a previous life. If you want stock + movements to be fully
 * consistent, run the approval endpoint on PENDING ones afterwards.
 */
export async function seedMovements(): Promise<void> {
  const existing = await prisma.movement.count();
  if (existing > 0) return;

  const [products, users, levels] = await Promise.all([
    prisma.product.findMany({ select: { id: true } }),
    prisma.user.findMany({ select: { id: true } }),
    prisma.location.findMany({
      where: { locationType: "LEVEL" },
      select: { id: true },
    }),
  ]);

  if (products.length === 0 || users.length === 0 || levels.length === 0) {
    throw new Error("Cannot seed movements without products, users and LEVEL locations");
  }

  const rows: ReturnType<typeof makeMovement>[] = [];
  for (let i = 0; i < TARGET_COUNT; i++) {
    const movementType = faker.helpers.arrayElement<MovementType>([
      ...ENTRY_TYPES,
      ...EXIT_TYPES,
      "TRANSFER",
      "TRANSFER",
    ]);
    const status = faker.helpers.weightedArrayElement<MovementStatus>([
      { value: "APPROVED", weight: 6 },
      { value: "PENDING", weight: 3 },
      { value: "REJECTED", weight: 1 },
    ]);

    let sourceLocationId: string | null = null;
    let destinationLocationId: string | null = null;
    if (movementType === "TRANSFER") {
      const [a, b] = faker.helpers.arrayElements(levels, 2);
      sourceLocationId = a.id;
      destinationLocationId = b.id;
    } else if (ENTRY_TYPES.includes(movementType)) {
      destinationLocationId = faker.helpers.arrayElement(levels).id;
    } else {
      sourceLocationId = faker.helpers.arrayElement(levels).id;
    }

    rows.push(
      makeMovement({
        productId: faker.helpers.arrayElement(products).id,
        userId: faker.helpers.arrayElement(users).id,
        movementType,
        status,
        sourceLocationId,
        destinationLocationId,
      })
    );
  }

  await prisma.movement.createMany({ data: rows });
}
