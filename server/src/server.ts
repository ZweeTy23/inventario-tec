import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { disconnectPrisma } from "./lib/prisma.js";

const app = createApp();

const PORT = process.env.PORT || env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(
    { port: PORT, env: env.NODE_ENV },
    `Inventario API listening on port ${PORT}`
  );
});

const shutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, "shutdown requested");
  server.close(async () => {
    await disconnectPrisma();
    logger.info("shutdown complete");
    process.exit(0);
  });
  setTimeout(() => {
    logger.error("forced exit after 10s timeout");
    process.exit(1);
  }, 10_000).unref();
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "uncaughtException");
  process.exit(1);
});
process.on("unhandledRejection", (err) => {
  logger.fatal({ err }, "unhandledRejection");
  process.exit(1);
});
