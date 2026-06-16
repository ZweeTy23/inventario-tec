import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../config/constants.js";
import { movementController } from "./movements.controller.js";
import {
  CreateMovementSchema,
  ListMovementsQuerySchema,
  MovementIdSchema,
  ProductIdParamSchema,
} from "./movements.schemas.js";

export const movementRoutes = Router();
movementRoutes.use(authMiddleware);

movementRoutes.get(
  "/",
  requirePermissions(PERMISSIONS.MOVEMENTS_VIEW),
  validate(ListMovementsQuerySchema, "query"),
  movementController.list
);

// Weighted-average cost ledger for a product. Registered before "/:id" so the
// literal segment is not swallowed by the id route.
movementRoutes.get(
  "/cost-history/:productId",
  requirePermissions(PERMISSIONS.MOVEMENTS_VIEW),
  validate(ProductIdParamSchema, "params"),
  movementController.costHistory
);

movementRoutes.get(
  "/:id",
  requirePermissions(PERMISSIONS.MOVEMENTS_VIEW),
  validate(MovementIdSchema, "params"),
  movementController.get
);

movementRoutes.post(
  "/",
  requirePermissions(PERMISSIONS.MOVEMENTS_CREATE),
  validate(CreateMovementSchema),
  movementController.create
);

movementRoutes.post(
  "/:id/approve",
  requirePermissions(PERMISSIONS.MOVEMENTS_APPROVE),
  validate(MovementIdSchema, "params"),
  movementController.approve
);

movementRoutes.post(
  "/:id/reject",
  requirePermissions(PERMISSIONS.MOVEMENTS_APPROVE),
  validate(MovementIdSchema, "params"),
  movementController.reject
);
