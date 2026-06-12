import type { LocationType } from "../../generated/prisma/enums.js";

export interface MakeLocationOverrides {
  parentId?: string | null;
  name: string;
  locationType: LocationType;
  maxCapacity?: number;
}

const CAPACITY_BY_TYPE: Record<LocationType, number> = {
  WAREHOUSE: 0,
  ZONE: 0,
  AISLE: 0,
  SHELF: 0,
  LEVEL: 100,
};

export function makeLocation(overrides: MakeLocationOverrides) {
  return {
    parentId: overrides.parentId ?? null,
    name: overrides.name,
    locationType: overrides.locationType,
    maxCapacity: overrides.maxCapacity ?? CAPACITY_BY_TYPE[overrides.locationType],
  };
}
