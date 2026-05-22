import { pino } from "pino";
import { env } from "../config/env.js";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: "inventario-api" },
  redact: ["req.headers.authorization", "passwordHash", "password"],
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            singleLine: false,
            translateTime: "SYS:HH:MM:ss.l",
            ignore: "pid,hostname,service",
          },
        }
      : undefined,
});

export type Logger = typeof logger;
