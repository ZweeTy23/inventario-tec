import type { Request, Response } from "express";
import { userService } from "./users.service.js";
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
} from "./users.schemas.js";

export const userController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await userService.list(req.query as unknown as ListUsersQuery);
    res.json(result);
  },

  async get(req: Request, res: Response): Promise<void> {
    const data = await userService.getById(req.params.id as string);
    res.json({ data });
  },

  async create(req: Request, res: Response): Promise<void> {
    const data = await userService.create(req.body as CreateUserInput);
    res.status(201).json({ data });
  },

  async update(req: Request, res: Response): Promise<void> {
    const data = await userService.update(
      req.params.id as string,
      req.body as UpdateUserInput
    );
    res.json({ data });
  },

  async delete(req: Request, res: Response): Promise<void> {
    await userService.delete(req.params.id as string);
    res.status(204).send();
  },
};
