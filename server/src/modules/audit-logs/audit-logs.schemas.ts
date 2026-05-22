import { z } from "zod";
import { PaginationQuerySchema } from "../../shared/utils/pagination.js";

export const ListAuditLogsQuerySchema = PaginationQuerySchema.extend({
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  tableAffected: z.string().optional(),
  recordId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export type ListAuditLogsQuery = z.infer<typeof ListAuditLogsQuerySchema>;
