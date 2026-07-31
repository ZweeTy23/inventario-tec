import type { Request, Response } from "express";
import { reportsService } from "./reports.service.js";

export const reportsController = {
  async getValuationReport(_req: Request, res: Response): Promise<void> {
    const data = await reportsService.getValuationReport();
    res.json(data);
  },

  async getMovementsSummaryReport(req: Request, res: Response): Promise<void> {
    const { startDate, endDate, movementType } = req.query;
    const data = await reportsService.getMovementsSummaryReport({
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      movementType: movementType ? String(movementType) : undefined,
    });
    res.json(data);
  },

  async getLowStockReport(_req: Request, res: Response): Promise<void> {
    const data = await reportsService.getLowStockReport();
    res.json(data);
  },

  async getSupplierPerformanceReport(_req: Request, res: Response): Promise<void> {
    const data = await reportsService.getSupplierPerformanceReport();
    res.json(data);
  },
};
