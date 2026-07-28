import { prisma } from "../../lib/prisma.js";

export const dashboardRepository = {
  /**
   * Retrieves all active products with their current stock levels and categories.
   * This is used to compute total units, total valuation, low stock warnings,
   * category distribution, and ABC analysis in the service.
   */
  async getProductsWithStock() {
    return prisma.product.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        sku: true,
        name: true,
        averageCost: true,
        minStockAlert: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        stockLevels: {
          select: {
            quantity: true,
            expirationDate: true,
            batchNumber: true,
          },
        },
      },
    });
  },

  /**
   * Retrieves the most recent movements for the activity feed.
   */
  async getRecentMovements(limit = 6) {
    return prisma.movement.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sourceLocation: {
          select: {
            id: true,
            name: true,
            locationType: true,
          },
        },
        destinationLocation: {
          select: {
            id: true,
            name: true,
            locationType: true,
          },
        },
      },
    });
  },

  /**
   * Gets the total number of movements.
   */
  async getMovementsCount() {
    return prisma.movement.count();
  },

  /**
   * Retrieves movements grouped by day for the last 30 days to build the trend chart.
   */
  async getMovementsTrend(since: Date) {
    return prisma.movement.findMany({
      where: {
        createdAt: { gte: since },
        status: "APPROVED", // Count only approved/completed movements
      },
      select: {
        id: true,
        movementType: true,
        quantity: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
  },

  /**
   * Retrieves stock levels that are either already expired or expiring within a given date.
   */
  async getExpiringStock(expiringBefore: Date) {
    return prisma.stockLevel.findMany({
      where: {
        quantity: { gt: 0 },
        expirationDate: {
          lte: expiringBefore,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { expirationDate: "asc" },
    });
  },
};
