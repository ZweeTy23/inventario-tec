import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../config/constants.js";
import { notificationService } from "./notifications.service.js";
import {
  ListNotificationsQuerySchema,
  NotificationIdSchema,
} from "./notifications.schemas.js";
import type { ListNotificationsQuery } from "./notifications.schemas.js";
import { UnauthorizedError } from "../../shared/errors/AppError.js";

export const notificationRoutes = Router();
notificationRoutes.use(authMiddleware);
notificationRoutes.use(requirePermissions(PERMISSIONS.ALERTS_VIEW));

notificationRoutes.get(
  "/",
  validate(ListNotificationsQuerySchema, "query"),
  async (req, res) => {
    if (!req.user) throw new UnauthorizedError();
    const result = await notificationService.list(
      req.query as unknown as ListNotificationsQuery,
      req.user.sub
    );
    res.json(result);
  }
);

notificationRoutes.post(
  "/:id/read",
  validate(NotificationIdSchema, "params"),
  async (req, res) => {
    const data = await notificationService.markAsRead(req.params.id as string);
    res.json({ data });
  }
);

notificationRoutes.post("/read-all", async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const data = await notificationService.markAllAsReadForUser(req.user.sub);
  res.json({ data });
});
