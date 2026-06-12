import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requirePermissions } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../config/constants.js";
import { userController } from "./users.controller.js";
import {
  CreateUserSchema,
  ListUsersQuerySchema,
  UpdateUserSchema,
  UserIdSchema,
} from "./users.schemas.js";

export const userRoutes = Router();

userRoutes.use(authMiddleware);
userRoutes.use(requirePermissions(PERMISSIONS.USERS_MANAGE));

userRoutes.get("/", validate(ListUsersQuerySchema, "query"), userController.list);
userRoutes.get("/:id", validate(UserIdSchema, "params"), userController.get);
userRoutes.post("/", validate(CreateUserSchema), userController.create);
userRoutes.patch(
  "/:id",
  validate(UserIdSchema, "params"),
  validate(UpdateUserSchema),
  userController.update
);
userRoutes.delete("/:id", validate(UserIdSchema, "params"), userController.delete);
