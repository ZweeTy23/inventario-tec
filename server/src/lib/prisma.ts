import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import { env } from "../config/env.js";
import { softDeleteExtension } from "./prisma.soft-delete.js";

/**
 * Singleton Prisma Client wired with the `pg` driver adapter (Prisma 7 requirement)
 * and the soft-delete extension. The audit-log extension is opt-in per-request via
 * `withAudit(userId)` so that seeders and system jobs don't generate noise.
 *
 * Connection pool defaults come from `pg` (idle 10s, no connection timeout).
 * Tune via the connection string params if needed (e.g. `?connection_limit=20`).
 */
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

const basePrisma = new PrismaClient({ adapter });

export const prisma = basePrisma.$extends(softDeleteExtension);

export type AppPrisma = typeof prisma;

export async function disconnectPrisma(): Promise<void> {
  await basePrisma.$disconnect();
}
