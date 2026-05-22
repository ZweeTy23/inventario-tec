import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../config/constants.js";
import { productController } from "./products.controller.js";
import {
  CreateProductSchema,
  ListProductsQuerySchema,
  ProductIdSchema,
  UpdateProductSchema,
} from "./products.schemas.js";

export const productRoutes = Router();
productRoutes.use(authMiddleware);

productRoutes.get(
  "/",
  requirePermissions(PERMISSIONS.PRODUCTS_VIEW),
  validate(ListProductsQuerySchema, "query"),
  productController.list
);
productRoutes.get(
  "/:id",
  requirePermissions(PERMISSIONS.PRODUCTS_VIEW),
  validate(ProductIdSchema, "params"),
  productController.get
);
productRoutes.post(
  "/",
  requirePermissions(PERMISSIONS.PRODUCTS_CREATE),
  validate(CreateProductSchema),
  productController.create
);
productRoutes.patch(
  "/:id",
  requirePermissions(PERMISSIONS.PRODUCTS_UPDATE),
  validate(ProductIdSchema, "params"),
  validate(UpdateProductSchema),
  productController.update
);
productRoutes.delete(
  "/:id",
  requirePermissions(PERMISSIONS.PRODUCTS_DELETE),
  validate(ProductIdSchema, "params"),
  productController.delete
);
