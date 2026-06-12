import { z } from "zod";
import { PAGINATION } from "../../config/constants.js";

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  perPage: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.MAX_PER_PAGE)
    .default(PAGINATION.DEFAULT_PER_PAGE),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  perPage: number
): PaginatedResult<never>["meta"] {
  return {
    page,
    perPage,
    total,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export function skipTake(query: PaginationQuery): { skip: number; take: number } {
  return {
    skip: (query.page - 1) * query.perPage,
    take: query.perPage,
  };
}
