import { z } from "zod";
import { PaginationQuerySchema } from "../../shared/utils/pagination.js";

export const NotificationTypeEnum = z.enum([
  "LOW_STOCK",
  "EXPIRATION_WARNING",
  "MOVEMENT_ALERT",
  "SYSTEM_PROCESS",
  "APPROVAL_REQUIRED",
]);

export const NotificationIdSchema = z.object({ id: z.string().uuid() });

export const ListNotificationsQuerySchema = PaginationQuerySchema.extend({
  type: NotificationTypeEnum.optional(),
  isRead: z.coerce.boolean().optional(),
  onlyMine: z.coerce.boolean().optional(),
});

export type ListNotificationsQuery = z.infer<typeof ListNotificationsQuerySchema>;
