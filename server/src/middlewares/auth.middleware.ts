import type { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../lib/jwt.js";
import { UnauthorizedError } from "../shared/errors/AppError.js";

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Missing or invalid Authorization header"));
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return next(new UnauthorizedError("Missing token"));
  }
  try {
    req.user = verifyJwt(token);
    return next();
  } catch (err) {
    return next(err);
  }
}
