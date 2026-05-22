import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleService } from "./roles.service.js";

export const roleRoutes = Router();
roleRoutes.use(authMiddleware);

roleRoutes.get("/", async (_req, res) => {
  const data = await roleService.list();
  res.json({ data });
});
