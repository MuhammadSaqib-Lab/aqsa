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
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: "20kb" }));
  app.use(express.urlencoded({ extended: true, limit: "20kb" }));
  app.use(cookieParser());
  app.use(pinoHttp({ logger, autoLogging: !isProduction }));

  app.use("/api", generalLimiter);

  if (env.ENABLE_API_DOCS || !isProduction) {
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  }

  app.use("/api", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
