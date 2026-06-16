import { z } from "zod";
import { PaginationQuerySchema } from "../../shared/utils/pagination.js";

export const MovementTypeEnum = z.enum([
  "PURCHASE_ENTRY",
  "RETURN_ENTRY",
  "SALE_EXIT",
  "LOSS_EXIT",
  "EXPIRED_EXIT",
  "TRANSFER",
]);

export const MovementStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const CreateMovementSchema = z
  .object({
    productId: z.string().uuid(),
    sourceLocationId: z.string().uuid().nullable().optional(),
    destinationLocationId: z.string().uuid().nullable().optional(),
    quantity: z.coerce.number().int().positive(),
    movementType: MovementTypeEnum,
    unitCost: z.coerce.number().min(0).optional().default(0),
    batchNumber: z.string().min(1).max(80).optional(),
    expirationDate: z.coerce.date().optional().nullable(),
    notes: z.string().max(2000).optional(),
  })
  .superRefine((data, ctx) => {
    const entries = ["PURCHASE_ENTRY", "RETURN_ENTRY"];
    const exits = ["SALE_EXIT", "LOSS_EXIT", "EXPIRED_EXIT"];

    if (data.movementType === "TRANSFER") {
      if (!data.sourceLocationId) {
        ctx.addIssue({
          code: "custom",
          path: ["sourceLocationId"],
          message: "TRANSFER requires a sourceLocationId",
        });
      }
      if (!data.destinationLocationId) {
        ctx.addIssue({
          code: "custom",
          path: ["destinationLocationId"],
          message: "TRANSFER requires a destinationLocationId",
        });
      }
      if (
        data.sourceLocationId &&
        data.destinationLocationId &&
        data.sourceLocationId === data.destinationLocationId
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["destinationLocationId"],
          message: "source and destination must be different",
        });
      }
    } else if (entries.includes(data.movementType)) {
      if (!data.destinationLocationId) {
        ctx.addIssue({
          code: "custom",
          path: ["destinationLocationId"],
          message: `${data.movementType} requires a destinationLocationId`,
        });
      }
      if (data.sourceLocationId) {
        ctx.addIssue({
          code: "custom",
          path: ["sourceLocationId"],
          message: `${data.movementType} must not have a sourceLocationId`,
        });
      }
    } else if (exits.includes(data.movementType)) {
      if (!data.sourceLocationId) {
        ctx.addIssue({
          code: "custom",
          path: ["sourceLocationId"],
          message: `${data.movementType} requires a sourceLocationId`,
        });
      }
      if (data.destinationLocationId) {
        ctx.addIssue({
          code: "custom",
          path: ["destinationLocationId"],
          message: `${data.movementType} must not have a destinationLocationId`,
        });
      }
    }
  });

export const MovementIdSchema = z.object({ id: z.string().uuid() });

export const ProductIdParamSchema = z.object({ productId: z.string().uuid() });

export const ListMovementsQuerySchema = PaginationQuerySchema.extend({
  productId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  movementType: MovementTypeEnum.optional(),
  status: MovementStatusEnum.optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export type CreateMovementInput = z.infer<typeof CreateMovementSchema>;
export type ListMovementsQuery = z.infer<typeof ListMovementsQuerySchema>;
