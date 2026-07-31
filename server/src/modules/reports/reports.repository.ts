import { prisma } from "../../lib/prisma.js";

export const reportsRepository = {
  async getValuationReport() {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
        stockLevels: { select: { quantity: true } },
      },
    });

    const categoryMap = new Map<string, { categoryName: string; totalProducts: number; totalQuantity: number; totalBaseValue: number; totalCostValue: number }>();

    let grandTotalProducts = 0;
    let grandTotalQuantity = 0;
    let grandTotalBaseValue = 0;
    let grandTotalCostValue = 0;

    const formattedProducts = products.map((p) => {
      const totalQty = p.stockLevels.reduce((acc, curr) => acc + curr.quantity, 0);
      const basePrice = Number(p.basePrice);
      const avgCost = Number(p.averageCost);
      const baseValue = totalQty * basePrice;
      const costValue = totalQty * avgCost;

      grandTotalProducts += 1;
      grandTotalQuantity += totalQty;
      grandTotalBaseValue += baseValue;
      grandTotalCostValue += costValue;

      const catName = p.category?.name || "Sin Categoría";
      const catKey = p.category?.id || "uncategorized";
      const existingCat = categoryMap.get(catKey) || {
        categoryName: catName,
        totalProducts: 0,
        totalQuantity: 0,
        totalBaseValue: 0,
        totalCostValue: 0,
      };

      existingCat.totalProducts += 1;
      existingCat.totalQuantity += totalQty;
      existingCat.totalBaseValue += baseValue;
      existingCat.totalCostValue += costValue;
      categoryMap.set(catKey, existingCat);

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: catName,
        supplier: p.supplier?.name || "Sin Proveedor",
        basePrice,
        avgCost,
        totalQuantity: totalQty,
        totalBaseValue: baseValue,
        totalCostValue: costValue,
      };
    });

    return {
      summary: {
        totalProducts: grandTotalProducts,
        totalQuantity: grandTotalQuantity,
        totalBaseValue: grandTotalBaseValue,
        totalCostValue: grandTotalCostValue,
      },
      byCategory: Array.from(categoryMap.values()),
      products: formattedProducts,
    };
  },

  async getMovementsSummaryReport(filters: { startDate?: string; endDate?: string; movementType?: string }) {
    const whereClause: any = {};

    if (filters.startDate || filters.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) whereClause.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = end;
      }
    }

    if (filters.movementType) {
      whereClause.movementType = filters.movementType;
    }

    const movements = await prisma.movement.findMany({
      where: whereClause,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        user: { select: { id: true, name: true, email: true } },
        sourceLocation: { select: { id: true, name: true } },
        destinationLocation: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const summaryByType: Record<string, { count: number; totalQuantity: number; totalCost: number }> = {};

    let totalMovements = 0;
    let totalQuantityMoved = 0;
    let totalCostMoved = 0;

    const formattedMovements = movements.map((m) => {
      const unitCost = Number(m.unitCost);
      const totalCost = unitCost * m.quantity;

      totalMovements += 1;
      totalQuantityMoved += m.quantity;
      totalCostMoved += totalCost;

      const typeKey = m.movementType;
      if (!summaryByType[typeKey]) {
        summaryByType[typeKey] = { count: 0, totalQuantity: 0, totalCost: 0 };
      }
      summaryByType[typeKey].count += 1;
      summaryByType[typeKey].totalQuantity += m.quantity;
      summaryByType[typeKey].totalCost += totalCost;

      return {
        id: m.id,
        createdAt: m.createdAt,
        type: m.movementType,
        status: m.status,
        productName: m.product.name,
        sku: m.product.sku,
        userName: m.user.name,
        quantity: m.quantity,
        unitCost,
        totalCost,
        sourceLocation: m.sourceLocation?.name || "N/A",
        destinationLocation: m.destinationLocation?.name || "N/A",
        batchNumber: m.batchNumber,
      };
    });

    return {
      summary: {
        totalMovements,
        totalQuantityMoved,
        totalCostMoved,
        summaryByType,
      },
      movements: formattedMovements,
    };
  },

  async getLowStockReport() {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
        stockLevels: { select: { quantity: true, location: { select: { name: true } } } },
      },
    });

    const lowStockProducts = products
      .map((p) => {
        const totalQty = p.stockLevels.reduce((acc, curr) => acc + curr.quantity, 0);
        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category?.name || "Sin Categoría",
          supplier: p.supplier?.name || "Sin Proveedor",
          minStockAlert: p.minStockAlert,
          currentStock: totalQty,
          deficit: Math.max(0, p.minStockAlert - totalQty),
          isLow: p.minStockAlert > 0 && totalQty <= p.minStockAlert,
          isCritical: totalQty === 0,
        };
      })
      .filter((p) => p.isLow || p.isCritical);

    return {
      totalAlerts: lowStockProducts.length,
      criticalCount: lowStockProducts.filter((p) => p.isCritical).length,
      warningCount: lowStockProducts.filter((p) => !p.isCritical && p.isLow).length,
      items: lowStockProducts,
    };
  },

  async getSupplierPerformanceReport() {
    const suppliers = await prisma.supplier.findMany({
      include: {
        products: {
          where: { deletedAt: null },
          include: {
            stockLevels: { select: { quantity: true } },
          },
        },
      },
    });

    const formattedSuppliers = suppliers.map((s) => {
      let totalProducts = s.products.length;
      let totalStockUnits = 0;
      let totalInventoryValue = 0;

      s.products.forEach((p) => {
        const qty = p.stockLevels.reduce((sum, curr) => sum + curr.quantity, 0);
        totalStockUnits += qty;
        totalInventoryValue += qty * Number(p.basePrice);
      });

      return {
        id: s.id,
        name: s.name,
        reliabilityScore: Number(s.reliabilityScore),
        totalProducts,
        totalStockUnits,
        totalInventoryValue,
      };
    });

    return {
      totalSuppliers: formattedSuppliers.length,
      suppliers: formattedSuppliers,
    };
  },
};
