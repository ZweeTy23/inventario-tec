import { faker } from "@faker-js/faker/locale/en";
import { hashPassword } from "../../src/lib/hash.js";

export interface MakeUserOverrides {
  name?: string;
  email?: string;
  password?: string;
  roleId: string;
  isActive?: boolean;
}

export async function makeUser(overrides: MakeUserOverrides) {
  const name = overrides.name ?? faker.person.fullName();
  const email = overrides.email ?? faker.internet.email({ firstName: name.split(" ")[0] }).toLowerCase();
  const password = overrides.password ?? "Password123*";
  const passwordHash = await hashPassword(password);
  return {
    name,
    email,
    passwordHash,
    roleId: overrides.roleId,
    isActive: overrides.isActive ?? true,
  };
}
