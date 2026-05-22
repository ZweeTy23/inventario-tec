import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../config/constants.js";
import { supplierController } from "./suppliers.controller.js";
import {
  CreateSupplierSchema,
  ListSuppliersQuerySchema,
  SupplierIdSchema,
  UpdateSupplierSchema,
} from "./suppliers.schemas.js";

export const supplierRoutes = Router();
supplierRoutes.use(authMiddleware);

supplierRoutes.get(
  "/",
  requirePermissions(PERMISSIONS.PRODUCTS_VIEW),
  validate(ListSuppliersQuerySchema, "query"),
  supplierController.list
);
supplierRoutes.get(
  "/:id",
  requirePermissions(PERMISSIONS.PRODUCTS_VIEW),
  validate(SupplierIdSchema, "params"),
  supplierController.get
);
supplierRoutes.post(
  "/",
  requirePermissions(PERMISSIONS.PRODUCTS_CREATE),
  validate(CreateSupplierSchema),
  supplierController.create
);
supplierRoutes.patch(
  "/:id",
  requirePermissions(PERMISSIONS.PRODUCTS_UPDATE),
  validate(SupplierIdSchema, "params"),
  validate(UpdateSupplierSchema),
  supplierController.update
);
supplierRoutes.delete(
  "/:id",
  requirePermissions(PERMISSIONS.PRODUCTS_DELETE),
  validate(SupplierIdSchema, "params"),
  supplierController.delete
);
