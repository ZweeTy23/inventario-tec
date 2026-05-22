import { z } from "zod";
import { PaginationQuerySchema } from "../../shared/utils/pagination.js";

export const CreateUserSchema = z.object({
  name: z.string().min(1).max(150),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(72),
  roleId: z.string().uuid(),
  isActive: z.boolean().optional().default(true),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  password: z.string().min(8).max(72).optional(),
  roleId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export const UserIdSchema = z.object({ id: z.string().uuid() });

export const ListUsersQuerySchema = PaginationQuerySchema.extend({
  q: z.string().optional(),
  roleId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type ListUsersQuery = z.infer<typeof ListUsersQuerySchema>;
