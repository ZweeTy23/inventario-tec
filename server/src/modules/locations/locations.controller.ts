import type { Request, Response } from "express";
import { locationService } from "./locations.service.js";
import type {
  CreateLocationInput,
  ListLocationsQuery,
  UpdateLocationInput,
} from "./locations.schemas.js";

export const locationController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await locationService.list(req.query as unknown as ListLocationsQuery);
    res.json(result);
  },
  async tree(_req: Request, res: Response): Promise<void> {
    const data = await locationService.tree();
    res.json({ data });
  },
  async get(req: Request, res: Response): Promise<void> {
    const data = await locationService.getById(req.params.id as string);
    res.json({ data });
  },
  async create(req: Request, res: Response): Promise<void> {
    const data = await locationService.create(req.body as CreateLocationInput);
    res.status(201).json({ data });
  },
  async update(req: Request, res: Response): Promise<void> {
    const data = await locationService.update(
      req.params.id as string,
      req.body as UpdateLocationInput
    );
    res.json({ data });
  },
  async delete(req: Request, res: Response): Promise<void> {
    await locationService.delete(req.params.id as string);
    res.status(204).send();
  },
};
