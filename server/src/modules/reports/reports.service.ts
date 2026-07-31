import { reportsRepository } from "./reports.repository.js";

export const reportsService = {
  async getValuationReport() {
    return reportsRepository.getValuationReport();
  },

  async getMovementsSummaryReport(filters: { startDate?: string; endDate?: string; movementType?: string }) {
    return reportsRepository.getMovementsSummaryReport(filters);
  },

  async getLowStockReport() {
    return reportsRepository.getLowStockReport();
  },

  async getSupplierPerformanceReport() {
    return reportsRepository.getSupplierPerformanceReport();
  },
};
