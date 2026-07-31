import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { PERMISSIONS } from "../../config/constants.js";
import { reportsController } from "./reports.controller.js";

const router = Router();

router.use(authMiddleware);
router.use(requirePermissions(PERMISSIONS.REPORTS_VIEW));

router.get("/valuation", reportsController.getValuationReport);
router.get("/movements-summary", reportsController.getMovementsSummaryReport);
router.get("/low-stock", reportsController.getLowStockReport);
router.get("/suppliers", reportsController.getSupplierPerformanceReport);

export const reportsRoutes = router;
