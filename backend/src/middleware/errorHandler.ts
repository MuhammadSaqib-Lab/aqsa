import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { logger } from "../config/logger";
import { isProduction } from "../config/env";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`No route ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const apiError =
    err instanceof ApiError ? err : new ApiError(500, isProduction ? "Something went wrong" : String((err as Error)?.message ?? err));

  if (apiError.statusCode >= 500) {
    logger.error({ err, path: req.originalUrl, method: req.method }, "Unhandled error");
  } else {
    logger.warn({ path: req.originalUrl, method: req.method, statusCode: apiError.statusCode }, apiError.message);
  }

  res.status(apiError.statusCode).json({
    success: false,
    message: apiError.message,
    ...(apiError.errors ? { errors: apiError.errors } : {}),
  });
}
