import { Router } from "express";
import { authController } from "./auth.controller.js";
import { LoginSchema, RegisterSchema } from "./auth.schemas.js"; // Cambiado a .js
import { validate } from "../../middlewares/validate.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

export const authRoutes = Router();

authRoutes.post("/login", validate(LoginSchema), authController.login);
authRoutes.post("/register", validate(RegisterSchema), authController.register); // NUEVA
authRoutes.get("/me", authMiddleware, authController.me);