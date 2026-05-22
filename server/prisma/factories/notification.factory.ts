import { faker } from "@faker-js/faker/locale/en";
import type { NotificationType } from "../../generated/prisma/enums.js";

export interface MakeNotificationOverrides {
  userId?: string | null;
  type: NotificationType;
  message?: string;
  entityId?: string | null;
  entityType?: string | null;
  isRead?: boolean;
}

const SAMPLE_MESSAGES: Record<NotificationType, string[]> = {
  LOW_STOCK: [
    "Product is below the minimum stock threshold",
    "Restock recommended for SKU below alert level",
  ],
  EXPIRATION_WARNING: [
    "Batch is approaching its expiration date",
    "Expired stock detected at this location",
  ],
  MOVEMENT_ALERT: [
    "Unusual movement pattern detected",
    "Large quantity movement registered",
  ],
  SYSTEM_PROCESS: ["Background reconciliation job finished", "Daily report generated"],
  APPROVAL_REQUIRED: [
    "A new movement requires approval",
    "Pending movements awaiting review",
  ],
};

export function makeNotification(overrides: MakeNotificationOverrides) {
  return {
    userId: overrides.userId ?? null,
    type: overrides.type,
    message: overrides.message ?? faker.helpers.arrayElement(SAMPLE_MESSAGES[overrides.type]),
    entityId: overrides.entityId ?? null,
    entityType: overrides.entityType ?? null,
    isRead: overrides.isRead ?? false,
  };
}
