import type { Request, Response } from "express";
import { productService } from "./products.service.js";
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from "./products.schemas.js";

export const productController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await productService.list(req.query as unknown as ListProductsQuery);
    res.json(result);
  },
  async get(req: Request, res: Response): Promise<void> {
    const data = await productService.getById(req.params.id as string);
    res.json({ data });
  },
  async create(req: Request, res: Response): Promise<void> {
    const data = await productService.create(req.body as CreateProductInput);
    res.status(201).json({ data });
  },
  async update(req: Request, res: Response): Promise<void> {
    const data = await productService.update(
      req.params.id as string,
      req.body as UpdateProductInput
    );
    res.json({ data });
  },
  async delete(req: Request, res: Response): Promise<void> {
    await productService.delete(req.params.id as string);
    res.status(204).send();
  },
};
