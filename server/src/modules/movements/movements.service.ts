import { prisma } from "../../lib/prisma.js";
import { auditLog } from "../../lib/prisma.audit.js";
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

const DEFAULT_BATCH = "DEFAULT";

export const movementService = {
  async list(query: ListMovementsQuery) {
    const [data, total] = await movementRepository.list({
      productId: query.productId,
      userId: query.userId,
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
   * Creates a movement in `PENDING` status and emits an approval-required
   * notification. Stock is *not* moved here; that happens on `approve`.
   * We do, however, validate that the referenced product/locations exist.
   */
  async create(userId: string, input: CreateMovementInput) {
    // Persist the batch/expiration metadata on the movement payload? The schema
    // stores those on stock_levels, so we keep them as transient args used when
    // approving the movement. For traceability we encode them in unitCost+notes
    // free form via a JSONB column would be ideal, but the spec doesn't include
    // one, so we keep batch/expiration as args of approve() in non-TRANSFER
    // flows. To keep them with the pending movement we round-trip through the
    // batchNumber/expirationDate on the resulting stock_level row at approval.
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

    const created = await movementRepository.create({
      productId: input.productId,
      userId,
      sourceLocationId: input.sourceLocationId ?? null,
      destinationLocationId: input.destinationLocationId ?? null,
      quantity: input.quantity,
      movementType: input.movementType,
      unitCost: input.unitCost,
      status: "PENDING",
    });

    await prisma.notification.create({
      data: {
        userId: null,
        type: "APPROVAL_REQUIRED",
        message: `New ${input.movementType} movement requires approval (qty ${input.quantity})`,
        entityId: created.id,
        entityType: "operations.movements",
      },
    });

    return created;
  },

  /**
   * Approves a PENDING movement and atomically adjusts stock levels.
   * Optional `batchNumber` / `expirationDate` are written to the destination
   * stock level row on entries and transfers.
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
    const batch = extras.batchNumber ?? DEFAULT_BATCH;

    const result = await prisma.$transaction(async (tx) => {
      // Outgoing leg: decrement source stock (sale/loss/expired/transfer).
      if (movement.sourceLocationId) {
        const source = await tx.stockLevel.findUnique({
          where: {
            productId_locationId_batchNumber: {
              productId: movement.productId,
              locationId: movement.sourceLocationId,
              batchNumber: batch,
            },
          },
        });
        if (!source) {
          throw new BadRequestError(
            `Source stock for batch "${batch}" not found at source location`
          );
        }
        if (source.quantity < movement.quantity) {
          throw new BadRequestError(
            `Insufficient stock: have ${source.quantity}, need ${movement.quantity}`
          );
        }
        await tx.stockLevel.update({
          where: { id: source.id },
          data: { quantity: { decrement: movement.quantity } },
        });
      }

      // Incoming leg: increment destination stock (purchase/return/transfer).
      if (movement.destinationLocationId) {
        await tx.stockLevel.upsert({
          where: {
            productId_locationId_batchNumber: {
              productId: movement.productId,
              locationId: movement.destinationLocationId,
              batchNumber: batch,
            },
          },
          update: {
            quantity: { increment: movement.quantity },
            ...(extras.expirationDate !== undefined
              ? { expirationDate: extras.expirationDate }
              : {}),
          },
          create: {
            productId: movement.productId,
            locationId: movement.destinationLocationId,
            batchNumber: batch,
            quantity: movement.quantity,
            expirationDate: extras.expirationDate ?? null,
          },
        });
      }

      return tx.movement.update({
        where: { id: movementId },
        data: { status: "APPROVED" },
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

    return result;
  },

  async reject(approverId: string, movementId: string, reason?: string) {
    const movement = await movementRepository.findById(movementId);
    if (!movement) throw new NotFoundError("Movement");
    if (movement.status !== "PENDING") {
      throw new ConflictError(`Movement is already ${movement.status}`);
    }
    const updated = await movementRepository.updateStatus(movementId, "REJECTED");
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
};
