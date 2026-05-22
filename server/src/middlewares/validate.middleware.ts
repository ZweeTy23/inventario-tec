import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodType } from "zod";
import { ValidationError } from "../shared/errors/AppError.js";

type Source = "body" | "query" | "params";

/**
 * Validates a request `body`, `query` or `params` object against a Zod schema.
 * The parsed (typed) data replaces the original on the request object so
 * downstream handlers get coerced + sanitized values.
 */
export function validate<S extends ZodType>(schema: S, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const data = req[source];
    const result = schema.safeParse(data);
    if (!result.success) {
      return next(new ValidationError(formatZodError(result.error)));
    }
    // In Express 5, `req.query` and `req.params` are getters with no setters, so
    // direct assignment (`req.query = ...`) throws. We use `defineProperty` to
    // override the descriptor on this request instance only, exposing the
    // parsed/typed values to downstream handlers.
    if (source === "body") {
      req.body = result.data;
    } else {
      Object.defineProperty(req, source, {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }
    return next();
  };
}

function formatZodError(error: ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_root";
    (out[path] ??= []).push(issue.message);
  }
  return out;
}
