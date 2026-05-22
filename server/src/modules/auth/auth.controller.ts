import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import type { LoginInput } from "./auth.schemas.ts";
import { UnauthorizedError } from "../../shared/errors/AppError.js";

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body as LoginInput);
    res.json({ data: result });
  },

  async me(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const result = await authService.me(req.user.sub);
    res.json({ data: result });
  },
};
