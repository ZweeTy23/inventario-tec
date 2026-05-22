import { Router } from "express";
import { authController } from "./auth.controller.js";
import { LoginSchema } from "./auth.schemas.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

export const authRoutes = Router();

authRoutes.post("/login", validate(LoginSchema), authController.login);
authRoutes.get("/me", authMiddleware, authController.me);
