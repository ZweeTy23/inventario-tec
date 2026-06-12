import type { Express } from "express";
import { authRoutes } from "./auth/auth.routes.js";
import { userRoutes } from "./users/users.routes.js";
import { roleRoutes } from "./roles/roles.routes.js";
import { permissionRoutes } from "./permissions/permissions.routes.js";
import { categoryRoutes } from "./categories/categories.routes.js";
import { supplierRoutes } from "./suppliers/suppliers.routes.js";
import { productRoutes } from "./products/products.routes.js";
import { locationRoutes } from "./locations/locations.routes.js";
import { stockLevelRoutes } from "./stock-levels/stock-levels.routes.js";
import { movementRoutes } from "./movements/movements.routes.js";
import { auditLogRoutes } from "./audit-logs/audit-logs.routes.js";
import { notificationRoutes } from "./notifications/notifications.routes.js";

export function registerRoutes(app: Express): void {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/roles", roleRoutes);
  app.use("/api/permissions", permissionRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/suppliers", supplierRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/locations", locationRoutes);
  app.use("/api/stock-levels", stockLevelRoutes);
  app.use("/api/movements", movementRoutes);
  app.use("/api/audit-logs", auditLogRoutes);
  app.use("/api/notifications", notificationRoutes);
}
