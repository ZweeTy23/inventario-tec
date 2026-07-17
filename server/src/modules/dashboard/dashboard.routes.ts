import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireAnyPermission } from "../../middlewares/permission.middleware.js";
import { PERMISSIONS } from "../../config/constants.js";
import { dashboardController } from "./dashboard.controller.js";

export const dashboardRoutes = Router();
dashboardRoutes.use(authMiddleware);

dashboardRoutes.get(
  "/stats",
  requireAnyPermission(PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.REPORTS_VIEW),
  dashboardController.getStats
);
