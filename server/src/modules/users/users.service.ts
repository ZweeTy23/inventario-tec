import { hashPassword } from "../../lib/hash.js";
import { ConflictError, NotFoundError } from "../../shared/errors/AppError.js";
import { buildPaginationMeta } from "../../shared/utils/pagination.js";
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
} from "./users.schemas.js";
import { userRepository } from "./users.repository.js";

export const userService = {
  async list(query: ListUsersQuery) {
    const [data, total] = await userRepository.list({
      q: query.q,
      roleId: query.roleId,
      isActive: query.isActive,
      pagination: query,
    });
    return {
      data,
      meta: buildPaginationMeta(total, query.page, query.perPage),
    };
  },

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError("User");
    return user;
  },

  async create(input: CreateUserInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw new ConflictError("Email already in use");

    const passwordHash = await hashPassword(input.password);
    return userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      roleId: input.roleId,
      isActive: input.isActive,
    });
  },

  async update(id: string, input: UpdateUserInput) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError("User");

    if (input.email && input.email !== user.email) {
      const dup = await userRepository.findByEmail(input.email);
      if (dup) throw new ConflictError("Email already in use");
    }

    const data: Parameters<typeof userRepository.update>[1] = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.email !== undefined) data.email = input.email;
    if (input.roleId !== undefined) data.roleId = input.roleId;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.password !== undefined) data.passwordHash = await hashPassword(input.password);

    return userRepository.update(id, data);
  },

  async delete(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError("User");
    await userRepository.softDelete(id);
  },
};
