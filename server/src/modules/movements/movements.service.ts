import { prisma } from "../../lib/prisma.js";
import { auditLog } from "../../lib/prisma.audit.js";
import { env } from "../../config/env.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../shared/errors/AppError.js";
import { buildPaginationMeta } from "../../shared/utils/pagination.js";
import type {
  CreateMovementInput,
  ListMovementsQuery,
} from "./movements.schemas.js";
import { movementRepository } from "./movements.repository.js";
import {
  applyMovementStock,
  runStockTransaction,
  type StockMovementContext,
} from "./stock.engine.js";

function toContext(m: {
  id: string;
  productId: string;
  quantity: number;
  movementType: StockMovementContext["movementType"];
  sourceLocationId: string | null;
  destinationLocationId: string | null;
  unitCost: StockMovementContext["unitCost"];
  batchNumber: string | null;
  expirationDate: Date | null;
}): StockMovementContext {
  return {
    id: m.id,
    productId: m.productId,
    quantity: m.quantity,
    movementType: m.movementType,
    sourceLocationId: m.sourceLocationId,
    destinationLocationId: m.destinationLocationId,
    unitCost: m.unitCost,
    batchNumber: m.batchNumber,
    expirationDate: m.expirationDate,
  };
}

/**
 * A movement needs explicit managerial approval when it is a loss adjustment
 * or when its size/value crosses the configured thresholds. Everything else is
 * applied to real stock the instant it is created.
 */
function requiresApproval(input: CreateMovementInput): boolean {
  if (input.movementType === "LOSS_EXIT") return true;
  if (input.quantity >= env.MOVEMENT_AUTO_APPROVE_MAX_QTY) return true;
  const value = input.quantity * (input.unitCost ?? 0);
  if (value >= env.MOVEMENT_AUTO_APPROVE_MAX_VALUE) return true;
  return false;
}

export const movementService = {
  async list(query: ListMovementsQuery) {
    const [data, total] = await movementRepository.list({
      productId: query.productId,
      userId: query.userId,
      locationId: query.locationId,
      movementType: query.movementType,
      status: query.status,
      fromDate: query.fromDate,
      toDate: query.toDate,
      pagination: query,
    });
    return { data, meta: buildPaginationMeta(total, query.page, query.perPage) };
  },

  async getById(id: string) {
    const m = await movementRepository.findById(id);
    if (!m) throw new NotFoundError("Movement");
    return m;
  },

  /**
   * Validates references, then either:
   *   - auto-applies the movement to stock atomically (normal movements), or
   *   - records it as PENDING and raises an approval-required alert (loss
   *     adjustments and unusually large/valuable movements).
   */
  async create(userId: string, input: CreateMovementInput) {
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
      select: { id: true },
    });
    if (!product) throw new BadRequestError("Product not found");

    if (input.sourceLocationId) {
      const src = await prisma.location.findUnique({
        where: { id: input.sourceLocationId },
        select: { id: true },
      });
      if (!src) throw new BadRequestError("sourceLocation not found");
    }
    if (input.destinationLocationId) {
      const dst = await prisma.location.findUnique({
        where: { id: input.destinationLocationId },
        select: { id: true },
      });
      if (!dst) throw new BadRequestError("destinationLocation not found");
    }

    // Fail fast on exits/transfers that can't be fulfilled, even when the
    // movement would otherwise be parked as PENDING. The engine still performs
    // the authoritative atomic check at apply/approval time.
    const drawsFromSource =
      input.movementType === "TRANSFER" ||
      ["SALE_EXIT", "LOSS_EXIT", "EXPIRED_EXIT"].includes(input.movementType);
    if (drawsFromSource && input.sourceLocationId) {
      const agg = await prisma.stockLevel.aggregate({
        _sum: { quantity: true },
        where: {
          productId: input.productId,
          locationId: input.sourceLocationId,
          ...(input.batchNumber ? { batchNumber: input.batchNumber } : {}),
        },
      });
      const available = agg._sum.quantity ?? 0;
      if (input.quantity > available) {
        throw new BadRequestError(
          `Stock insuficiente en la ubicación de origen: disponible ${available}, solicitado ${input.quantity}`
        );
      }
    }

    const baseData = {
      productId: input.productId,
      userId,
      sourceLocationId: input.sourceLocationId ?? null,
      destinationLocationId: input.destinationLocationId ?? null,
      quantity: input.quantity,
      movementType: input.movementType,
      unitCost: input.unitCost,
      batchNumber: input.batchNumber ?? null,
      expirationDate: input.expirationDate ?? null,
      notes: input.notes ?? null,
    };

    if (requiresApproval(input)) {
      const created = await movementRepository.create({ ...baseData, status: "PENDING" });
      await prisma.notification.create({
        data: {
          userId: null,
          type: "APPROVAL_REQUIRED",
          message: `Movimiento ${input.movementType} de ${input.quantity} uds requiere aprobación gerencial.`,
          entityId: created.id,
          entityType: "operations.movements",
        },
      });
      return created;
    }

    // Auto-apply: create + affect stock atomically in one serializable tx.
    const movementId = await runStockTransaction(async (tx) => {
      const m = await tx.movement.create({ data: { ...baseData, status: "APPROVED" } });
      await applyMovementStock(tx, toContext(m));
      return m.id;
    });

    await auditLog({
      userId,
      action: "AUTO_APPROVE",
      table: "operations.movements",
      recordId: movementId,
      newData: { status: "APPROVED", auto: true, movementType: input.movementType },
    });
    await prisma.notification.create({
      data: {
        userId: null,
        type: "MOVEMENT_ALERT",
        message: `Movimiento ${input.movementType} de ${input.quantity} uds aplicado automáticamente.`,
        entityId: movementId,
        entityType: "operations.movements",
      },
    });

    return this.getById(movementId);
  },

  /**
   * Approves a PENDING movement and atomically applies its stock effect.
   * Optional `batchNumber` / `expirationDate` override what was captured at
   * creation (handy for entries whose batch is only known on receipt).
   */
  async approve(
    approverId: string,
    movementId: string,
    extras: { batchNumber?: string; expirationDate?: Date | null } = {}
  ) {
    const movement = await movementRepository.findById(movementId);
    if (!movement) throw new NotFoundError("Movement");
    if (movement.status !== "PENDING") {
      throw new ConflictError(`Movement is already ${movement.status}`);
    }

    const effectiveBatch = extras.batchNumber ?? movement.batchNumber ?? null;
    const effectiveExpiration =
      extras.expirationDate !== undefined ? extras.expirationDate : movement.expirationDate;

    await runStockTransaction(async (tx) => {
      await applyMovementStock(
        tx,
        toContext({ ...movement, batchNumber: effectiveBatch, expirationDate: effectiveExpiration })
      );
      await tx.movement.update({
        where: { id: movementId },
        data: {
          status: "APPROVED",
          batchNumber: effectiveBatch,
          expirationDate: effectiveExpiration,
        },
      });
    });

    await auditLog({
      userId: approverId,
      action: "APPROVE",
      table: "operations.movements",
      recordId: movementId,
      oldData: { status: "PENDING" },
      newData: { status: "APPROVED" },
    });

    return this.getById(movementId);
  },

  async reject(approverId: string, movementId: string, reason?: string) {
    const movement = await movementRepository.findById(movementId);
    if (!movement) throw new NotFoundError("Movement");
    if (movement.status !== "PENDING") {
      throw new ConflictError(`Movement is already ${movement.status}`);
    }
    const updated = await movementRepository.updateStatus(movementId, "REJECTED", reason);
    await auditLog({
      userId: approverId,
      action: "REJECT",
      table: "operations.movements",
      recordId: movementId,
      oldData: { status: "PENDING" },
      newData: { status: "REJECTED", reason: reason ?? null },
    });
    return updated;
  },

  /** Weighted-average cost ledger for a product ("Historial de Costos"). */
  async costHistory(productId: string, limit = 50) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, sku: true, averageCost: true },
    });
    if (!product) throw new NotFoundError("Product");
    const history = await movementRepository.costHistory(productId, limit);
    return { product, history };
  },
};
