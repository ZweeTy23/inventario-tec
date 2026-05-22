import { BadRequestError, NotFoundError } from "../../shared/errors/AppError.js";
import { buildPaginationMeta } from "../../shared/utils/pagination.js";
import type { LocationType } from "../../../generated/prisma/enums.js";
import type {
  CreateLocationInput,
  ListLocationsQuery,
  UpdateLocationInput,
} from "./locations.schemas.js";
import { locationRepository } from "./locations.repository.js";

/**
 * Enforces the hierarchy: WAREHOUSE > ZONE > AISLE > SHELF > LEVEL.
 * A child can only be created under a parent one level up.
 */
const ALLOWED_PARENT: Record<LocationType, LocationType | null> = {
  WAREHOUSE: null,
  ZONE: "WAREHOUSE",
  AISLE: "ZONE",
  SHELF: "AISLE",
  LEVEL: "SHELF",
};

export const locationService = {
  async list(query: ListLocationsQuery) {
    const [data, total] = await locationRepository.list({
      q: query.q,
      locationType: query.locationType,
      parentId: query.parentId,
      rootOnly: query.rootOnly,
      pagination: query,
    });
    return { data, meta: buildPaginationMeta(total, query.page, query.perPage) };
  },

  tree() {
    return locationRepository.tree();
  },

  async getById(id: string) {
    const l = await locationRepository.findById(id);
    if (!l) throw new NotFoundError("Location");
    return l;
  },

  async create(input: CreateLocationInput) {
    const expectedParent = ALLOWED_PARENT[input.locationType];
    if (expectedParent === null && input.parentId) {
      throw new BadRequestError("WAREHOUSE locations cannot have a parent");
    }
    if (expectedParent !== null) {
      if (!input.parentId) {
        throw new BadRequestError(`${input.locationType} requires a parent of type ${expectedParent}`);
      }
      const parent = await locationRepository.findById(input.parentId);
      if (!parent) throw new BadRequestError("Parent location does not exist");
      if (parent.locationType !== expectedParent) {
        throw new BadRequestError(
          `${input.locationType} must be a child of ${expectedParent}, not ${parent.locationType}`
        );
      }
    }
    return locationRepository.create({
      name: input.name,
      locationType: input.locationType,
      maxCapacity: input.maxCapacity,
      parentId: input.parentId ?? null,
    });
  },

  async update(id: string, input: UpdateLocationInput) {
    const existing = await locationRepository.findById(id);
    if (!existing) throw new NotFoundError("Location");
    if (input.parentId === id) {
      throw new BadRequestError("A location cannot be its own parent");
    }
    return locationRepository.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.locationType !== undefined ? { locationType: input.locationType } : {}),
      ...(input.maxCapacity !== undefined ? { maxCapacity: input.maxCapacity } : {}),
      ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
    });
  },

  async delete(id: string) {
    const existing = await locationRepository.findById(id);
    if (!existing) throw new NotFoundError("Location");
    if (existing._count.children > 0) {
      throw new BadRequestError("Cannot delete a location that has children");
    }
    if (existing._count.stockLevels > 0) {
      throw new BadRequestError("Cannot delete a location with stock records");
    }
    await locationRepository.softDelete(id);
  },
};
