import { dashboardRepository } from "./dashboard.repository.js";

export interface DashboardKPIs {
  totalValue: number;
  totalProducts: number;
  totalUnits: number;
  lowStockCount: number;
  totalMovements: number;
}

export interface ABCGroupStats {
  count: number;
  totalValue: number;
  percentage: number;
}

export interface ABCAnalysis {
  A: ABCGroupStats;
  B: ABCGroupStats;
  C: ABCGroupStats;
}

export interface CategoryDistribution {
  categoryId: string;
  categoryName: string;
  productCount: number;
  totalUnits: number;
  totalValue: number;
}

export interface ExpirationSummary {
  expiredCount: number;
  expiredValue: number;
  expiringSoonCount: number;
  expiringSoonValue: number;
  criticalItems: any[];
}

export interface MovementTrendDay {
  date: string; // YYYY-MM-DD
  entries: number;
  exits: number;
  transfers: number;
}

export const dashboardService = {
  async getDashboardStats() {
    const products = await dashboardRepository.getProductsWithStock();
    const movementsCount = await dashboardRepository.getMovementsCount();
    const recentMovements = await dashboardRepository.getRecentMovements(6);

    // 1. General KPIs and basic aggregations
    let totalUnits = 0;
    let totalValue = 0;
    let lowStockCount = 0;
    const lowStockProductsList: any[] = [];
    const productValues: { id: string; name: string; sku: string; value: number }[] = [];

    // Category distribution helper map
    const categoryMap = new Map<string, CategoryDistribution>();

    for (const p of products) {
      const onHand = p.stockLevels.reduce((sum, s) => sum + s.quantity, 0);
      const avgCost = Number(p.averageCost);
      const val = Math.round(onHand * avgCost * 100) / 100;

      totalUnits += onHand;
      totalValue += val;

      const isLow = p.minStockAlert > 0 && onHand <= p.minStockAlert;
      if (isLow) {
        lowStockCount += 1;
        lowStockProductsList.push({
          id: p.id,
          sku: p.sku,
          name: p.name,
          onHand,
          minStockAlert: p.minStockAlert,
        });
      }

      productValues.push({ id: p.id, name: p.name, sku: p.sku, value: val });

      // Aggregate Category Distribution
      if (p.category) {
        const catId = p.category.id;
        const catName = p.category.name;
        const existing = categoryMap.get(catId);
        if (existing) {
          existing.productCount += 1;
          existing.totalUnits += onHand;
          existing.totalValue = Math.round((existing.totalValue + val) * 100) / 100;
        } else {
          categoryMap.set(catId, {
            categoryId: catId,
            categoryName: catName,
            productCount: 1,
            totalUnits: onHand,
            totalValue: val,
          });
        }
      }
    }

    const categoryDistribution = Array.from(categoryMap.values()).sort(
      (a, b) => b.totalValue - a.totalValue
    );

    // 2. ABC Analysis
    // Sort products by value descending
    productValues.sort((a, b) => b.value - a.value);

    let cumulativeSum = 0;
    const abc: ABCAnalysis = {
      A: { count: 0, totalValue: 0, percentage: 0 },
      B: { count: 0, totalValue: 0, percentage: 0 },
      C: { count: 0, totalValue: 0, percentage: 0 },
    };

    for (const pv of productValues) {
      cumulativeSum += pv.value;
      const cumulativePercentage = totalValue > 0 ? (cumulativeSum / totalValue) * 100 : 0;

      if (cumulativePercentage <= 80) {
        abc.A.count += 1;
        abc.A.totalValue = Math.round((abc.A.totalValue + pv.value) * 100) / 100;
      } else if (cumulativePercentage <= 95) {
        abc.B.count += 1;
        abc.B.totalValue = Math.round((abc.B.totalValue + pv.value) * 100) / 100;
      } else {
        abc.C.count += 1;
        abc.C.totalValue = Math.round((abc.C.totalValue + pv.value) * 100) / 100;
      }
    }

    if (totalValue > 0) {
      abc.A.percentage = Math.round((abc.A.totalValue / totalValue) * 10000) / 100;
      abc.B.percentage = Math.round((abc.B.totalValue / totalValue) * 10000) / 100;
      abc.C.percentage = Math.round((abc.C.totalValue / totalValue) * 10000) / 100;
    }

    // 3. Expiration Alerts
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const expiringStock = await dashboardRepository.getExpiringStock(thirtyDaysFromNow);

    let expiredCount = 0;
    let expiredValue = 0;
    let expiringSoonCount = 0;
    let expiringSoonValue = 0;
    const criticalExpirationItems: any[] = [];

    const activeProductsMap = new Map(products.map((p) => [p.id, p]));

    for (const item of expiringStock) {
      const expirationDate = item.expirationDate ? new Date(item.expirationDate) : null;
      const product = activeProductsMap.get(item.productId);
      const avgCost = product ? Number(product.averageCost) : 0;
      const val = Math.round(item.quantity * avgCost * 100) / 100;

      if (expirationDate) {
        if (expirationDate < now) {
          expiredCount += item.quantity;
          expiredValue = Math.round((expiredValue + val) * 100) / 100;
        } else {
          expiringSoonCount += item.quantity;
          expiringSoonValue = Math.round((expiringSoonValue + val) * 100) / 100;
        }

        criticalExpirationItems.push({
          productId: item.productId,
          productName: item.product.name,
          sku: item.product.sku,
          locationName: item.location.name,
          batchNumber: item.batchNumber,
          quantity: item.quantity,
          expirationDate: item.expirationDate,
          value: val,
          status: expirationDate < now ? "EXPIRED" : "EXPIRING_SOON",
        });
      }
    }

    const expirationSummary: ExpirationSummary = {
      expiredCount,
      expiredValue,
      expiringSoonCount,
      expiringSoonValue,
      criticalItems: criticalExpirationItems.slice(0, 10), // Limit to top 10 expiring/expired items
    };

    // 4. Movement Trends (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const rawTrends = await dashboardRepository.getMovementsTrend(thirtyDaysAgo);

    // Initialize 30 days trend map
    const trendsMap = new Map<string, MovementTrendDay>();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split("T")[0];
      trendsMap.set(dateString, { date: dateString, entries: 0, exits: 0, transfers: 0 });
    }

    for (const m of rawTrends) {
      const dateString = new Date(m.createdAt).toISOString().split("T")[0];
      const dayData = trendsMap.get(dateString);
      if (dayData) {
        if (m.movementType === "PURCHASE_ENTRY" || m.movementType === "RETURN_ENTRY") {
          dayData.entries += m.quantity;
        } else if (
          m.movementType === "SALE_EXIT" ||
          m.movementType === "LOSS_EXIT" ||
          m.movementType === "EXPIRED_EXIT"
        ) {
          dayData.exits += m.quantity;
        } else if (m.movementType === "TRANSFER") {
          dayData.transfers += m.quantity;
        }
      }
    }

    const movementTrends = Array.from(trendsMap.values()).reverse(); // Order from oldest to newest

    return {
      kpis: {
        totalValue: Math.round(totalValue * 100) / 100,
        totalProducts: products.length,
        totalUnits,
        lowStockCount,
        totalMovements: movementsCount,
      } as DashboardKPIs,
      recentMovements,
      lowStockProducts: lowStockProductsList.slice(0, 10),
      categoryDistribution,
      abcAnalysis: abc,
      expirationSummary,
      movementTrends,
    };
  },
};
