import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../config/constants.js";
import { stockLevelController } from "./stock-levels.controller.js";
import {
  AdjustStockSchema,
  AvailabilityQuerySchema,
  ListStockLevelsQuerySchema,
  StockLevelIdSchema,
} from "./stock-levels.schemas.js";

export const stockLevelRoutes = Router();
stockLevelRoutes.use(authMiddleware);

stockLevelRoutes.get(
  "/",
  requirePermissions(PERMISSIONS.INVENTORY_VIEW),
  validate(ListStockLevelsQuerySchema, "query"),
  stockLevelController.list
);
// Inventory valuation KPIs. Registered before "/:id" to avoid the id route.
stockLevelRoutes.get(
  "/valuation",
  requirePermissions(PERMISSIONS.INVENTORY_VIEW),
  stockLevelController.valuation
);
// Real-time availability for a product (optionally at a single location).
stockLevelRoutes.get(
  "/availability",
  requirePermissions(PERMISSIONS.INVENTORY_VIEW),
  validate(AvailabilityQuerySchema, "query"),
  stockLevelController.availability
);
stockLevelRoutes.get(
  "/:id",
  requirePermissions(PERMISSIONS.INVENTORY_VIEW),
  validate(StockLevelIdSchema, "params"),
  stockLevelController.get
);
stockLevelRoutes.patch(
  "/:id",
  requirePermissions(PERMISSIONS.INVENTORY_UPDATE),
  validate(StockLevelIdSchema, "params"),
  validate(AdjustStockSchema),
  stockLevelController.adjust
);
