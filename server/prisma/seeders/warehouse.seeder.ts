import { prisma } from "../../src/lib/prisma.js";
import { makeLocation } from "../factories/location.factory.js";

const ZONES_PER_WAREHOUSE = 3;
const AISLES_PER_ZONE = 5;
const SHELVES_PER_AISLE = 10;
const LEVELS_PER_SHELF = 5;

/**
 * Builds a single warehouse with a full Zone -> Aisle -> Shelf -> Level tree.
 * Counts: 1 W + 3 Z + 15 A + 150 S + 750 L = 919 locations.
 * Uses batched `createMany` per depth so we stay efficient.
 */
export async function seedWarehouse(): Promise<void> {
  const existing = await prisma.location.findFirst({
    where: { locationType: "WAREHOUSE", parentId: null },
  });
  if (existing) return;

  const warehouse = await prisma.location.create({
    data: makeLocation({ name: "Main Warehouse", locationType: "WAREHOUSE", parentId: null }),
  });

  const zoneRows = Array.from({ length: ZONES_PER_WAREHOUSE }, (_, i) =>
    makeLocation({
      parentId: warehouse.id,
      name: `Zone ${String.fromCharCode(65 + i)}`,
      locationType: "ZONE",
    })
  );
  await prisma.location.createMany({ data: zoneRows });
  const zones = await prisma.location.findMany({
    where: { locationType: "ZONE", parentId: warehouse.id },
  });

  const aisleRows = zones.flatMap((zone) =>
    Array.from({ length: AISLES_PER_ZONE }, (_, j) =>
      makeLocation({
        parentId: zone.id,
        name: `${zone.name} - Aisle ${j + 1}`,
        locationType: "AISLE",
      })
    )
  );
  await prisma.location.createMany({ data: aisleRows });
  const aisles = await prisma.location.findMany({
    where: { locationType: "AISLE", parentId: { in: zones.map((z) => z.id) } },
  });

  const shelfRows = aisles.flatMap((aisle) =>
    Array.from({ length: SHELVES_PER_AISLE }, (_, k) =>
      makeLocation({
        parentId: aisle.id,
        name: `${aisle.name} - Shelf ${k + 1}`,
        locationType: "SHELF",
      })
    )
  );
  await prisma.location.createMany({ data: shelfRows });
  const shelves = await prisma.location.findMany({
    where: { locationType: "SHELF", parentId: { in: aisles.map((a) => a.id) } },
  });

  const levelRows = shelves.flatMap((shelf) =>
    Array.from({ length: LEVELS_PER_SHELF }, (_, m) =>
      makeLocation({
        parentId: shelf.id,
        name: `${shelf.name} - Level ${m + 1}`,
        locationType: "LEVEL",
      })
    )
  );
  // Split into chunks to avoid huge single statements.
  const CHUNK = 250;
  for (let i = 0; i < levelRows.length; i += CHUNK) {
    await prisma.location.createMany({ data: levelRows.slice(i, i + CHUNK) });
  }
}
