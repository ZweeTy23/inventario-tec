import { z } from "zod";
import { PaginationQuerySchema } from "../../shared/utils/pagination.js";

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(150),
  parentId: z.string().uuid().nullable().optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export const CategoryIdSchema = z.object({ id: z.string().uuid() });

export const ListCategoriesQuerySchema = PaginationQuerySchema.extend({
  q: z.string().optional(),
  parentId: z.string().uuid().optional(),
  rootOnly: z.coerce.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type ListCategoriesQuery = z.infer<typeof ListCategoriesQuerySchema>;
