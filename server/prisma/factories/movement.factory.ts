import { faker } from "@faker-js/faker/locale/en";
import type { MovementStatus, MovementType } from "../../generated/prisma/enums.js";

export interface MakeMovementOverrides {
  productId: string;
  userId: string;
  movementType: MovementType;
  status?: MovementStatus;
  sourceLocationId?: string | null;
  destinationLocationId?: string | null;
  quantity?: number;
  unitCost?: number;
}

export function makeMovement(overrides: MakeMovementOverrides) {
  return {
    productId: overrides.productId,
    userId: overrides.userId,
    movementType: overrides.movementType,
    status: overrides.status ?? "PENDING",
    sourceLocationId: overrides.sourceLocationId ?? null,
    destinationLocationId: overrides.destinationLocationId ?? null,
    quantity: overrides.quantity ?? faker.number.int({ min: 1, max: 50 }),
    unitCost:
      overrides.unitCost ??
      Number(faker.number.float({ min: 5, max: 1000, fractionDigits: 2 }).toFixed(2)),
  };
}
