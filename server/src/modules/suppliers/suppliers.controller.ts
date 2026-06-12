import type { Request, Response } from "express";
import { supplierService } from "./suppliers.service.js";
import type {
  CreateSupplierInput,
  ListSuppliersQuery,
  UpdateSupplierInput,
} from "./suppliers.schemas.js";

export const supplierController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await supplierService.list(req.query as unknown as ListSuppliersQuery);
    res.json(result);
  },
  async get(req: Request, res: Response): Promise<void> {
    const data = await supplierService.getById(req.params.id as string);
    res.json({ data });
  },
  async create(req: Request, res: Response): Promise<void> {
    const data = await supplierService.create(req.body as CreateSupplierInput);
    res.status(201).json({ data });
  },
  async update(req: Request, res: Response): Promise<void> {
    const data = await supplierService.update(
      req.params.id as string,
      req.body as UpdateSupplierInput
    );
    res.json({ data });
  },
  async delete(req: Request, res: Response): Promise<void> {
    await supplierService.delete(req.params.id as string);
    res.status(204).send();
  },
};
