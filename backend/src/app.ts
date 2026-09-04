import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import { env, isProduction, allowedOrigins } from "./config/env";
import { logger } from "./config/logger";
import { generalLimiter } from "./middleware/rateLimiters";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { ApiError } from "./utils/ApiError";
import { openApiDocument } from "./docs/openapi";
import apiRoutes from "./routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Same-origin/non-browser requests (no Origin header) are allowed through.
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(ApiError.forbidden(`Origin "${origin}" is not allowed by CORS`));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: "20kb" }));
  app.use(express.urlencoded({ extended: true, limit: "20kb" }));
  app.use(cookieParser());
  // autoLogging was previously disabled in production to reduce noise, but
  // that meant a fully successful request left zero trace in Render's logs —
  // making "is the frontend even reaching the backend?" impossible to answer
  // from logs alone. Every request is now logged in every environment.
  app.use(pinoHttp({ logger }));

  app.use("/api", generalLimiter);

  if (env.ENABLE_API_DOCS || !isProduction) {
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  }

  app.use("/api", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
