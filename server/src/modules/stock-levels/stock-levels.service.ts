import { prisma } from "../../lib/prisma.js";
import { NotFoundError } from "../../shared/errors/AppError.js";
import { buildPaginationMeta } from "../../shared/utils/pagination.js";
import type {
  AdjustStockInput,
  ListStockLevelsQuery,
} from "./stock-levels.schemas.js";
import { stockLevelRepository } from "./stock-levels.repository.js";

export const stockLevelService = {
  async list(query: ListStockLevelsQuery) {
    const [data, total] = await stockLevelRepository.list({
      productId: query.productId,
      locationId: query.locationId,
      batchNumber: query.batchNumber,
      expiringBefore: query.expiringBefore,
      pagination: query,
    });
    return { data, meta: buildPaginationMeta(total, query.page, query.perPage) };
  },

  async getById(id: string) {
    const sl = await stockLevelRepository.findById(id);
    if (!sl) throw new NotFoundError("StockLevel");
    return sl;
  },

  /**
   * Real-time available stock for a product, optionally scoped to a single
   * location. Returns the total on-hand plus the per-batch breakdown in FIFO
   * order (earliest expiration first) so the UI can validate exits/transfers
   * against what can actually be consumed.
   */
  async availability(productId: string, locationId?: string) {
    const rows = await prisma.stockLevel.findMany({
      where: {
        productId,
        ...(locationId ? { locationId } : {}),
        quantity: { gt: 0 },
      },
      select: {
        batchNumber: true,
        quantity: true,
        expirationDate: true,
        locationId: true,
      },
      orderBy: [{ expirationDate: "asc" }, { createdAt: "asc" }],
    });
    const available = rows.reduce((sum, r) => sum + r.quantity, 0);
    return { productId, locationId: locationId ?? null, available, batches: rows };
  },

  async adjust(id: string, input: AdjustStockInput) {
    const sl = await stockLevelRepository.findById(id);
    if (!sl) throw new NotFoundError("StockLevel");
    return stockLevelRepository.update(id, {
      quantity: input.quantity,
      ...(input.expirationDate !== undefined ? { expirationDate: input.expirationDate } : {}),
    });
  },

  /**
   * Real-time inventory valuation using the weighted moving-average cost
   * ("Costo Promedio"). Returns headline KPIs plus the highest-value products.
   */
  async valuation(topN = 10) {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        sku: true,
        name: true,
        averageCost: true,
        minStockAlert: true,
        stockLevels: { select: { quantity: true } },
      },
    });

    let totalUnits = 0;
    let totalValue = 0;
    let lowStockCount = 0;
    const perProduct = products.map((p) => {
      const onHand = p.stockLevels.reduce((sum, s) => sum + s.quantity, 0);
      const avgCost = Number(p.averageCost);
      const value = Math.round(onHand * avgCost * 100) / 100;
      const minStockAlert = p.minStockAlert;
      const isLow = minStockAlert > 0 && onHand <= minStockAlert;
      totalUnits += onHand;
      totalValue += value;
      if (isLow) lowStockCount += 1;
      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        onHand,
        averageCost: avgCost,
        value,
        minStockAlert,
        isLow,
      };
    });

    const topProducts = [...perProduct].sort((a, b) => b.value - a.value).slice(0, topN);

    const lowStockProducts = perProduct
      .filter((p) => p.isLow)
      .sort((a, b) => {
        const ra = a.minStockAlert > 0 ? a.onHand / a.minStockAlert : 0;
        const rb = b.minStockAlert > 0 ? b.onHand / b.minStockAlert : 0;
        return ra - rb;
      })
      .slice(0, topN);

    return {
      totalProducts: products.length,
      totalUnits,
      totalValue: Math.round(totalValue * 100) / 100,
      lowStockCount,
      topProducts,
      lowStockProducts,
    };
  },
};
