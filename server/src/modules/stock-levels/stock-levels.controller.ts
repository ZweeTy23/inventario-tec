import type { Request, Response } from "express";
import { stockLevelService } from "./stock-levels.service.js";
import type { AdjustStockInput, ListStockLevelsQuery } from "./stock-levels.schemas.js";

export const stockLevelController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await stockLevelService.list(
      req.query as unknown as ListStockLevelsQuery
    );
    res.json(result);
  },
  async get(req: Request, res: Response): Promise<void> {
    const data = await stockLevelService.getById(req.params.id as string);
    res.json({ data });
  },
  async adjust(req: Request, res: Response): Promise<void> {
    const data = await stockLevelService.adjust(
      req.params.id as string,
      req.body as AdjustStockInput
    );
    res.json({ data });
  },
};
