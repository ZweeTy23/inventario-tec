import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  JWT_EXPIRES_IN: z.string().default("1d"),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
  CORS_ORIGIN: z.string().default("*"),

  // Transactional stock engine.
  // Movements at or above either threshold (or any LOSS_EXIT) require explicit
  // managerial approval before affecting real stock; everything else is applied
  // atomically the moment it is created.
  MOVEMENT_AUTO_APPROVE_MAX_QTY: z.coerce.number().int().positive().default(100),
  MOVEMENT_AUTO_APPROVE_MAX_VALUE: z.coerce.number().positive().default(50000),
  // Number of times a serialization conflict is retried before failing.
  STOCK_TX_MAX_RETRIES: z.coerce.number().int().min(1).max(10).default(3),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment configuration:",
    JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)
  );
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
