import type { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../shared/errors/AppError.js";

/**
 * Returns a middleware that verifies the authenticated user has *all* required
 * permissions. The user (and their permissions) must be populated by
 * `authMiddleware` first.
 */
export function requirePermissions(...required: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    const granted = new Set(req.user.permissions ?? []);
    const missing = required.filter((p) => !granted.has(p));
    if (missing.length > 0) {
      return next(
        new ForbiddenError(`Missing required permission(s): ${missing.join(", ")}`)
      );
    }
    return next();
  };
}

/**
 * Returns a middleware that verifies the authenticated user has *any* of the
 * provided permissions.
 */
export function requireAnyPermission(...options: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    const granted = new Set(req.user.permissions ?? []);
    const ok = options.some((p) => granted.has(p));
    if (!ok) {
      return next(
        new ForbiddenError(
          `One of these permissions is required: ${options.join(", ")}`
        )
      );
    }
    return next();
  };
}
