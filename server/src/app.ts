import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import swaggerUi from "swagger-ui-express";
import { logger } from "./lib/logger.js";
import { env } from "./config/env.js";
import { swaggerDocument } from "./config/swagger.js";
import { errorMiddleware, notFoundHandler } from "./middlewares/error.middleware.js";
import { registerRoutes } from "./modules/index.js";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet());
  const corsOrigin = process.env.FRONTEND_URL || env.FRONTEND_URL || env.CORS_ORIGIN;
  const allowedOrigins =
    corsOrigin === "*"
      ? true
      : corsOrigin.split(",").map((s) => s.trim());

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    pinoHttp({
      logger,
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      },
      serializers: {
        req: (req) => ({ method: req.method, url: req.url }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
    })
  );

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "inventario-api",
      timestamp: new Date().toISOString(),
      env: env.NODE_ENV,
    });
  });

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  registerRoutes(app);

  app.use(notFoundHandler);
  app.use(errorMiddleware);

  return app;
}
