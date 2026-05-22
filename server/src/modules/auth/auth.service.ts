import { comparePassword } from "../../lib/hash.js";
import { signJwt } from "../../lib/jwt.js";
import { UnauthorizedError } from "../../shared/errors/AppError.js";
import { authRepository } from "./auth.repository.js";
import type { LoginInput } from "./auth.schemas.ts";

export const authService = {
  async login(input: LoginInput) {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const permissions = user.role.rolePermissions.map((rp) => rp.permission.name);
    const token = signJwt({
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
      permissions,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: {
          id: user.role.id,
          name: user.role.name,
        },
        permissions,
      },
    };
  },

  async me(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      role: { id: user.role.id, name: user.role.name },
      permissions: user.role.rolePermissions.map((rp) => rp.permission.name),
    };
  },
};
