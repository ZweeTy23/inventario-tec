import { prisma } from "../../src/lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { makeSupplier } from "../factories/supplier.factory.js";

const TARGET_COUNT = 10;

export async function seedSuppliers(): Promise<void> {
  const current = await prisma.supplier.count();
  const missing = TARGET_COUNT - current;
  if (missing <= 0) return;

  const data: Prisma.SupplierCreateManyInput[] = Array.from(
    { length: missing },
    () => {
      const s = makeSupplier();
      return {
        name: s.name,
        contactInfo: s.contactInfo as Prisma.InputJsonValue,
        reliabilityScore: s.reliabilityScore,
      };
    }
  );
  await prisma.supplier.createMany({ data, skipDuplicates: true });
}
