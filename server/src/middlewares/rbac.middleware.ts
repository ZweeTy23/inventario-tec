import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../shared/errors/AppError.js";

// Simple RBAC middleware factory. Expects `req.user` to have `role` and `permissions`.
export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return next(new ForbiddenError("Not authenticated"));
    const perms: string[] = user.permissions ?? [];
    if (perms.includes(permission) || perms.includes("*")) return next();
    return next(new ForbiddenError("Permission denied"));
  };
}

export function requireAnyPermission(permissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return next(new ForbiddenError("Not authenticated"));
    const perms: string[] = user.permissions ?? [];
    if (permissions.some((p) => perms.includes(p) || perms.includes("*"))) return next();
    return next(new ForbiddenError("Permission denied"));
  };
}
