import { z } from "zod";
import { PaginationQuerySchema } from "../../shared/utils/pagination.js";

export const LocationTypeEnum = z.enum([
  "WAREHOUSE",
  "ZONE",
  "AISLE",
  "SHELF",
  "LEVEL",
]);

export const CreateLocationSchema = z.object({
  parentId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(150),
  locationType: LocationTypeEnum,
  maxCapacity: z.coerce.number().int().min(0).optional().default(0),
});

export const UpdateLocationSchema = z.object({
  parentId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(150).optional(),
  locationType: LocationTypeEnum.optional(),
  maxCapacity: z.coerce.number().int().min(0).optional(),
});

export const LocationIdSchema = z.object({ id: z.string().uuid() });

export const ListLocationsQuerySchema = PaginationQuerySchema.extend({
  q: z.string().optional(),
  locationType: LocationTypeEnum.optional(),
  parentId: z.string().uuid().optional(),
  rootOnly: z.coerce.boolean().optional(),
});

export type CreateLocationInput = z.infer<typeof CreateLocationSchema>;
export type UpdateLocationInput = z.infer<typeof UpdateLocationSchema>;
export type ListLocationsQuery = z.infer<typeof ListLocationsQuerySchema>;
