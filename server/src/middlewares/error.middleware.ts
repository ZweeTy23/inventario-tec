import type { NextFunction, Request, Response } from "express";
import { AppError } from "../shared/errors/AppError.js";
import { logger } from "../lib/logger.js";

interface PrismaKnownError {
  code: string;
  meta?: { target?: string[] | string; modelName?: string };
}

function isPrismaKnownError(err: unknown): err is PrismaKnownError {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as { code: unknown }).code === "string" &&
    ((err as { code: string }).code.startsWith("P2") ||
      (err as { code: string }).code.startsWith("P1"))
  );
}

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  // The 4-arg signature is what marks this as an error middleware in Express.
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  if (isPrismaKnownError(err)) {
    const mapping = mapPrismaError(err);
    res.status(mapping.statusCode).json({
      error: {
        code: mapping.code,
        message: mapping.message,
        details: { prismaCode: err.code, target: err.meta?.target },
      },
    });
    return;
  }

  logger.error(
    { err, path: req.path, method: req.method },
    "unhandled error in request"
  );
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
}

function mapPrismaError(err: PrismaKnownError): {
  statusCode: number;
  code: string;
  message: string;
} {
  switch (err.code) {
    case "P2002":
      return {
        statusCode: 409,
        code: "UNIQUE_CONSTRAINT",
        message: `Unique constraint violated on ${formatTarget(err.meta?.target)}`,
      };
    case "P2003":
      return {
        statusCode: 409,
        code: "FOREIGN_KEY",
        message: "Foreign key constraint failed",
      };
    case "P2025":
      return { statusCode: 404, code: "NOT_FOUND", message: "Record not found" };
    case "P2000":
      return {
        statusCode: 400,
        code: "VALUE_TOO_LONG",
        message: "Value too long for column",
      };
    default:
      return {
        statusCode: 500,
        code: "DATABASE_ERROR",
        message: "Database error",
      };
  }
}

function formatTarget(t: string[] | string | undefined): string {
  if (!t) return "field";
  return Array.isArray(t) ? t.join(", ") : t;
}

/** 404 handler for unmatched routes. Must be mounted after all routers. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}
