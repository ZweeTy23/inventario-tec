import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../config/constants.js";
import { auditLogService } from "./audit-logs.service.js";
import { ListAuditLogsQuerySchema } from "./audit-logs.schemas.js";
import type { ListAuditLogsQuery } from "./audit-logs.schemas.js";

export const auditLogRoutes = Router();
auditLogRoutes.use(authMiddleware);
auditLogRoutes.use(requirePermissions(PERMISSIONS.REPORTS_VIEW));

auditLogRoutes.get(
  "/",
  validate(ListAuditLogsQuerySchema, "query"),
  async (req, res) => {
    const result = await auditLogService.list(req.query as unknown as ListAuditLogsQuery);
    res.json(result);
  }
);
