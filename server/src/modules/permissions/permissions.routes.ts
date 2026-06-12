import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { permissionService } from "./permissions.service.js";

export const permissionRoutes = Router();
permissionRoutes.use(authMiddleware);

permissionRoutes.get("/", async (_req, res) => {
  const data = await permissionService.listGroupedByModule();
  res.json({ data });
});
