import type { Request, Response } from "express";
import { movementService } from "./movements.service.js";
import type {
  CreateMovementInput,
  ListMovementsQuery,
} from "./movements.schemas.js";
import { UnauthorizedError } from "../../shared/errors/AppError.js";

export const movementController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await movementService.list(req.query as unknown as ListMovementsQuery);
    res.json(result);
  },

  async get(req: Request, res: Response): Promise<void> {
    const data = await movementService.getById(req.params.id as string);
    res.json({ data });
  },

  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const input = req.body as CreateMovementInput;
    const data = await movementService.create(req.user.sub, input);
    res.status(201).json({ data });
  },

  async approve(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const body = (req.body ?? {}) as {
      batchNumber?: string;
      expirationDate?: string | null;
    };
    const data = await movementService.approve(req.user.sub, req.params.id as string, {
      batchNumber: body.batchNumber,
      expirationDate:
        body.expirationDate === undefined
          ? undefined
          : body.expirationDate === null
            ? null
            : new Date(body.expirationDate),
    });
    res.json({ data });
  },

  async reject(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const body = (req.body ?? {}) as { reason?: string };
    const data = await movementService.reject(req.user.sub, req.params.id as string, body.reason);
    res.json({ data });
  },
};
