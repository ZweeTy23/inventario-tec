import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../config/constants.js";
import { categoryController } from "./categories.controller.js";
import {
  CategoryIdSchema,
  CreateCategorySchema,
  ListCategoriesQuerySchema,
  UpdateCategorySchema,
} from "./categories.schemas.js";

export const categoryRoutes = Router();
categoryRoutes.use(authMiddleware);

categoryRoutes.get(
  "/",
  requirePermissions(PERMISSIONS.PRODUCTS_VIEW),
  validate(ListCategoriesQuerySchema, "query"),
  categoryController.list
);
categoryRoutes.get(
  "/tree",
  requirePermissions(PERMISSIONS.PRODUCTS_VIEW),
  categoryController.tree
);
categoryRoutes.get(
  "/:id",
  requirePermissions(PERMISSIONS.PRODUCTS_VIEW),
  validate(CategoryIdSchema, "params"),
  categoryController.get
);
categoryRoutes.post(
  "/",
  requirePermissions(PERMISSIONS.PRODUCTS_CREATE),
  validate(CreateCategorySchema),
  categoryController.create
);
categoryRoutes.patch(
  "/:id",
  requirePermissions(PERMISSIONS.PRODUCTS_UPDATE),
  validate(CategoryIdSchema, "params"),
  validate(UpdateCategorySchema),
  categoryController.update
);
categoryRoutes.delete(
  "/:id",
  requirePermissions(PERMISSIONS.PRODUCTS_DELETE),
  validate(CategoryIdSchema, "params"),
  categoryController.delete
);
