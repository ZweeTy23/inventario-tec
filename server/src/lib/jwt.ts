import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../shared/errors/AppError.js";

export interface JwtPayload {
  sub: string;
  email: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}

export function signJwt(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyJwt(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === "string") {
      throw new UnauthorizedError("Invalid token payload");
    }
    return decoded as unknown as JwtPayload;
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    throw new UnauthorizedError("Invalid or expired token");
  }
}
