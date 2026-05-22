import { z } from "zod";
import { PaginationQuerySchema } from "../../shared/utils/pagination.js";

export const StockLevelIdSchema = z.object({ id: z.string().uuid() });

export const AdjustStockSchema = z.object({
  quantity: z.coerce.number().int().min(0),
  expirationDate: z.coerce.date().optional().nullable(),
});

export const ListStockLevelsQuerySchema = PaginationQuerySchema.extend({
  productId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  batchNumber: z.string().optional(),
  expiringBefore: z.coerce.date().optional(),
});

export type AdjustStockInput = z.infer<typeof AdjustStockSchema>;
export type ListStockLevelsQuery = z.infer<typeof ListStockLevelsQuerySchema>;
