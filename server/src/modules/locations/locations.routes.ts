import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../config/constants.js";
import { locationController } from "./locations.controller.js";
import {
  CreateLocationSchema,
  ListLocationsQuerySchema,
  LocationIdSchema,
  UpdateLocationSchema,
} from "./locations.schemas.js";

export const locationRoutes = Router();
locationRoutes.use(authMiddleware);

locationRoutes.get(
  "/",
  requirePermissions(PERMISSIONS.INVENTORY_VIEW),
  validate(ListLocationsQuerySchema, "query"),
  locationController.list
);
locationRoutes.get(
  "/tree",
  requirePermissions(PERMISSIONS.INVENTORY_VIEW),
  locationController.tree
);
locationRoutes.get(
  "/:id",
  requirePermissions(PERMISSIONS.INVENTORY_VIEW),
  validate(LocationIdSchema, "params"),
  locationController.get
);
locationRoutes.post(
  "/",
  requirePermissions(PERMISSIONS.INVENTORY_CREATE),
  validate(CreateLocationSchema),
  locationController.create
);
locationRoutes.patch(
  "/:id",
  requirePermissions(PERMISSIONS.INVENTORY_UPDATE),
  validate(LocationIdSchema, "params"),
  validate(UpdateLocationSchema),
  locationController.update
);
locationRoutes.delete(
  "/:id",
  requirePermissions(PERMISSIONS.INVENTORY_DELETE),
  validate(LocationIdSchema, "params"),
  locationController.delete
);
