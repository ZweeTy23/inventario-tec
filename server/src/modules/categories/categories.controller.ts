import type { Request, Response } from "express";
import { categoryService } from "./categories.service.js";
import type {
  CreateCategoryInput,
  ListCategoriesQuery,
  UpdateCategoryInput,
} from "./categories.schemas.js";

export const categoryController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await categoryService.list(req.query as unknown as ListCategoriesQuery);
    res.json(result);
  },

  async tree(_req: Request, res: Response): Promise<void> {
    const data = await categoryService.tree();
    res.json({ data });
  },

  async get(req: Request, res: Response): Promise<void> {
    const data = await categoryService.getById(req.params.id as string);
    res.json({ data });
  },

  async create(req: Request, res: Response): Promise<void> {
    const data = await categoryService.create(req.body as CreateCategoryInput);
    res.status(201).json({ data });
  },

  async update(req: Request, res: Response): Promise<void> {
    const data = await categoryService.update(
      req.params.id as string,
      req.body as UpdateCategoryInput
    );
    res.json({ data });
  },

  async delete(req: Request, res: Response): Promise<void> {
    await categoryService.delete(req.params.id as string);
    res.status(204).send();
  },
};
