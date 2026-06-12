import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js"; // Cambiado a .js
import { UnauthorizedError } from "../../shared/errors/AppError.js";

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body as LoginInput);
    res.json({ data: result });
  },

  async register(req: Request, res: Response): Promise<void> {
    const result = await authService.register(req.body as RegisterInput);
    res.status(201).json({ data: result });
  },

  async me(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const result = await authService.me(req.user.sub);
    res.json({ data: result });
  },
};