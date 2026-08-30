import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { ApiError } from "../utils/ApiError";

type Target = "body" | "query" | "params";

/** Validates req[target] against a Zod schema, replacing it with the parsed value. */
export function validate(schema: ZodTypeAny, target: Target = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join(".") || target,
        message: issue.message,
      }));
      return next(ApiError.badRequest("Validation failed", errors));
    }
    req[target] = result.data;
    next();
  };
}
