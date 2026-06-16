import { Prisma } from "../../../generated/prisma/client.js";
import type { MovementType } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";
import { logger } from "../../lib/logger.js";
import { BadRequestError } from "../../shared/errors/AppError.js";

/**
 * Transactional stock engine.
 *
 * Centralises every mutation that can affect real stock so the rules live in
 * exactly one place and run inside a single serializable transaction:
 *
 *   - Atomic, race-safe decrements (conditional `updateMany` guarded by
 *     `quantity >= needed`, so concurrent approvals can never drive stock
 *     negative — the DB CHECK constraint is the final backstop).
 *   - FIFO consumption across batches (earliest expiration first) when no
 *     explicit batch is supplied — ideal for perishables / `EXPIRED_EXIT`.
 *   - Weighted moving-average cost ("Costo Promedio") recomputed on every
 *     purchase entry, with an immutable `stock_cost_history` ledger row.
 *   - Automatic LOW_STOCK notifications when on-hand crosses the reorder point.
 *
 * Serialization conflicts are retried with jittered backoff (`runStockTransaction`).
 */

/** Transaction-scoped client (model delegates only). */
export type StockTx = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends" | "$use"
>;

/** Minimal shape the engine needs to apply a movement to stock. */
export interface StockMovementContext {
  id: string;
  productId: string;
  quantity: number;
  movementType: MovementType;
  sourceLocationId: string | null;
  destinationLocationId: string | null;
  unitCost: Prisma.Decimal | number | string;
  batchNumber: string | null;
  expirationDate: Date | null;
}

interface ConsumedSegment {
  batchNumber: string;
  quantity: number;
  expirationDate: Date | null;
}

export const DEFAULT_BATCH = "DEFAULT";
const ENTRY_TYPES: MovementType[] = ["PURCHASE_ENTRY", "RETURN_ENTRY"];
const EXIT_TYPES: MovementType[] = ["SALE_EXIT", "LOSS_EXIT", "EXPIRED_EXIT"];

/** Signals a recoverable concurrent-modification conflict (worth retrying). */
export class StockConflictError extends Error {
  constructor(message = "Concurrent stock modification, please retry") {
    super(message);
    this.name = "StockConflictError";
  }
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Decrements stock at a location. When `batchNumber` is provided, only that
 * batch is touched; otherwise stock is drawn FIFO across batches (earliest
 * expiration, then oldest row, first). Returns the consumed segments so the
 * caller (e.g. a TRANSFER) can mirror batch identity to the destination.
 */
async function consumeStock(
  tx: StockTx,
  productId: string,
  locationId: string,
  quantity: number,
  batchNumber?: string
): Promise<ConsumedSegment[]> {
  if (batchNumber) {
    const res = await tx.stockLevel.updateMany({
      where: { productId, locationId, batchNumber, quantity: { gte: quantity } },
      data: { quantity: { decrement: quantity } },
    });
    if (res.count !== 1) {
      const row = await tx.stockLevel.findUnique({
        where: {
          productId_locationId_batchNumber: { productId, locationId, batchNumber },
        },
        select: { quantity: true, expirationDate: true },
      });
      if (!row || row.quantity < quantity) {
        throw new BadRequestError(
          `Insufficient stock for batch "${batchNumber}": have ${row?.quantity ?? 0}, need ${quantity}`
        );
      }
      throw new StockConflictError();
    }
    const row = await tx.stockLevel.findUnique({
      where: { productId_locationId_batchNumber: { productId, locationId, batchNumber } },
      select: { expirationDate: true },
    });
    return [{ batchNumber, quantity, expirationDate: row?.expirationDate ?? null }];
  }

  // FIFO: earliest expiration first (NULLs last in Postgres ASC), then oldest.
  const rows = await tx.stockLevel.findMany({
    where: { productId, locationId, quantity: { gt: 0 } },
    orderBy: [{ expirationDate: "asc" }, { createdAt: "asc" }],
    select: { id: true, batchNumber: true, quantity: true, expirationDate: true },
  });
  const available = rows.reduce((sum, r) => sum + r.quantity, 0);
  if (available < quantity) {
    throw new BadRequestError(
      `Insufficient stock at source location: have ${available}, need ${quantity}`
    );
  }

  const consumed: ConsumedSegment[] = [];
  let remaining = quantity;
  for (const row of rows) {
    if (remaining <= 0) break;
    const take = Math.min(row.quantity, remaining);
    const res = await tx.stockLevel.updateMany({
      where: { id: row.id, quantity: { gte: take } },
      data: { quantity: { decrement: take } },
    });
    if (res.count !== 1) throw new StockConflictError();
    consumed.push({
      batchNumber: row.batchNumber,
      quantity: take,
      expirationDate: row.expirationDate,
    });
    remaining -= take;
  }
  if (remaining > 0) throw new StockConflictError();
  return consumed;
}

/** Increments (or creates) stock for a product/location/batch. */
async function addStock(
  tx: StockTx,
  productId: string,
  locationId: string,
  quantity: number,
  batchNumber: string,
  expirationDate: Date | null
): Promise<void> {
  await tx.stockLevel.upsert({
    where: {
      productId_locationId_batchNumber: { productId, locationId, batchNumber },
    },
    update: { quantity: { increment: quantity }, expirationDate },
    create: { productId, locationId, batchNumber, quantity, expirationDate },
  });
}

/**
 * Recomputes the product's weighted moving-average cost for an incoming
 * purchase and records an immutable ledger row. MUST be called *before* the
 * matching `addStock`, so the pre-entry on-hand quantity is captured.
 */
async function applyPurchaseCost(
  tx: StockTx,
  productId: string,
  quantityIn: number,
  unitCost: number,
  movementId: string | null
): Promise<number> {
  const product = await tx.product.findUnique({
    where: { id: productId },
    select: { averageCost: true },
  });
  const agg = await tx.stockLevel.aggregate({
    _sum: { quantity: true },
    where: { productId },
  });
  const previousQuantity = agg._sum.quantity ?? 0;
  const previousAvgCost = product ? Number(product.averageCost) : 0;
  const newQuantity = previousQuantity + quantityIn;
  const newAvgCost =
    newQuantity > 0
      ? round2((previousQuantity * previousAvgCost + quantityIn * unitCost) / newQuantity)
      : round2(unitCost);

  await tx.product.update({
    where: { id: productId },
    data: { averageCost: newAvgCost },
  });
  await tx.stockCostHistory.create({
    data: {
      productId,
      movementId,
      quantityIn,
      unitCost,
      previousQuantity,
      previousAvgCost,
      newQuantity,
      newAvgCost,
    },
  });
  return newAvgCost;
}

/** Emits a LOW_STOCK notification when on-hand falls to/below the reorder point. */
async function maybeLowStockAlert(tx: StockTx, productId: string): Promise<void> {
  const product = await tx.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, sku: true, minStockAlert: true },
  });
  if (!product || product.minStockAlert <= 0) return;

  const agg = await tx.stockLevel.aggregate({
    _sum: { quantity: true },
    where: { productId },
  });
  const onHand = agg._sum.quantity ?? 0;
  if (onHand > product.minStockAlert) return;

  // Dedupe: don't pile up identical unread alerts for the same product.
  const existing = await tx.notification.findFirst({
    where: { type: "LOW_STOCK", entityId: productId, isRead: false },
    select: { id: true },
  });
  if (existing) return;

  await tx.notification.create({
    data: {
      userId: null,
      type: "LOW_STOCK",
      message: `Stock bajo: "${product.name}" (SKU ${product.sku}) tiene ${onHand} uds (mínimo ${product.minStockAlert}). Considera reabastecer.`,
      entityId: productId,
      entityType: "catalog.products",
    },
  });
}

/**
 * Applies a movement's effect on stock inside an already-open transaction.
 * Pure stock mechanics: the caller owns status changes, audit and approval.
 */
export async function applyMovementStock(
  tx: StockTx,
  movement: StockMovementContext
): Promise<void> {
  const unitCost = Number(movement.unitCost);
  const batch = movement.batchNumber ?? DEFAULT_BATCH;

  if (ENTRY_TYPES.includes(movement.movementType)) {
    if (!movement.destinationLocationId) {
      throw new BadRequestError(`${movement.movementType} requires a destination location`);
    }
    // Only true purchases move the weighted-average cost. Customer returns
    // re-enter at the current average, leaving valuation undisturbed.
    if (movement.movementType === "PURCHASE_ENTRY") {
      await applyPurchaseCost(tx, movement.productId, movement.quantity, unitCost, movement.id);
    }
    await addStock(
      tx,
      movement.productId,
      movement.destinationLocationId,
      movement.quantity,
      batch,
      movement.expirationDate ?? null
    );
  } else if (EXIT_TYPES.includes(movement.movementType)) {
    if (!movement.sourceLocationId) {
      throw new BadRequestError(`${movement.movementType} requires a source location`);
    }
    await consumeStock(
      tx,
      movement.productId,
      movement.sourceLocationId,
      movement.quantity,
      movement.batchNumber ?? undefined
    );
  } else if (movement.movementType === "TRANSFER") {
    if (!movement.sourceLocationId || !movement.destinationLocationId) {
      throw new BadRequestError("TRANSFER requires both source and destination locations");
    }
    if (movement.sourceLocationId === movement.destinationLocationId) {
      throw new BadRequestError("TRANSFER source and destination must be different");
    }
    const consumed = await consumeStock(
      tx,
      movement.productId,
      movement.sourceLocationId,
      movement.quantity,
      movement.batchNumber ?? undefined
    );
    // Preserve batch identity and expiration when relocating stock.
    for (const segment of consumed) {
      await addStock(
        tx,
        movement.productId,
        movement.destinationLocationId,
        segment.quantity,
        segment.batchNumber,
        segment.expirationDate
      );
    }
  }

  await maybeLowStockAlert(tx, movement.productId);
}

function isRetryable(err: unknown): boolean {
  if (err instanceof StockConflictError) return true;
  // P2034: transaction conflict / deadlock; P2002: unique violation (upsert race).
  const code = (err as { code?: string } | null)?.code;
  return code === "P2034" || code === "P2002";
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Runs `fn` inside a SERIALIZABLE transaction, retrying on serialization
 * conflicts with jittered backoff. This is the scalability primitive: many
 * concurrent stock operations stay correct without coarse-grained locking.
 */
export async function runStockTransaction<T>(fn: (tx: StockTx) => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= env.STOCK_TX_MAX_RETRIES; attempt++) {
    try {
      return await prisma.$transaction((tx) => fn(tx as unknown as StockTx), {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (err) {
      lastError = err;
      if (isRetryable(err) && attempt < env.STOCK_TX_MAX_RETRIES) {
        const backoff = 20 * attempt + Math.floor(Math.random() * 25);
        logger.warn({ attempt, backoff }, "stock transaction conflict, retrying");
        await sleep(backoff);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
