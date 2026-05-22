import { z } from "zod";
import { PaginationQuerySchema } from "../../shared/utils/pagination.js";

const ContactInfoSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    contactPerson: z.string().optional(),
    website: z.string().url().optional(),
  })
  .catchall(z.unknown());

export const CreateSupplierSchema = z.object({
  name: z.string().min(1).max(180),
  contactInfo: ContactInfoSchema.optional().default({}),
  reliabilityScore: z.coerce.number().min(0).max(100).optional().default(0),
});

export const UpdateSupplierSchema = z.object({
  name: z.string().min(1).max(180).optional(),
  contactInfo: ContactInfoSchema.optional(),
  reliabilityScore: z.coerce.number().min(0).max(100).optional(),
});

export const SupplierIdSchema = z.object({ id: z.string().uuid() });

export const ListSuppliersQuerySchema = PaginationQuerySchema.extend({
  q: z.string().optional(),
  minReliability: z.coerce.number().min(0).max(100).optional(),
});

export type CreateSupplierInput = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof UpdateSupplierSchema>;
export type ListSuppliersQuery = z.infer<typeof ListSuppliersQuerySchema>;
