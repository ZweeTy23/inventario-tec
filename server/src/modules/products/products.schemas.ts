import { z } from "zod";
import { PaginationQuerySchema } from "../../shared/utils/pagination.js";

const AttributesSchema = z.record(z.string(), z.unknown());

export const CreateProductSchema = z.object({
  categoryId: z.string().uuid(),
  supplierId: z.string().uuid(),
  sku: z.string().min(1).max(80).trim(),
  name: z.string().min(1).max(200),
  basePrice: z.coerce.number().min(0),
  attributes: AttributesSchema.optional().default({}),
  minStockAlert: z.coerce.number().int().min(0).optional().default(0),
});

export const UpdateProductSchema = z.object({
  categoryId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  sku: z.string().min(1).max(80).trim().optional(),
  name: z.string().min(1).max(200).optional(),
  basePrice: z.coerce.number().min(0).optional(),
  attributes: AttributesSchema.optional(),
  minStockAlert: z.coerce.number().int().min(0).optional(),
});

export const ProductIdSchema = z.object({ id: z.string().uuid() });

export const ListProductsQuerySchema = PaginationQuerySchema.extend({
  q: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  belowMinStock: z.coerce.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ListProductsQuery = z.infer<typeof ListProductsQuerySchema>;
