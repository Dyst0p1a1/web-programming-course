import { Hono } from "hono";

import { prisma } from "./lib/prisma.js";
import type { AppDependencies } from "./lib/types.js";
import { createAdminRoutes } from "./routes/admin.js";
import { createAuthRoutes } from "./routes/auth.js";
import { createCatalogRoutes } from "./routes/catalog.js";
import { createSessionRoutes } from "./routes/sessions.js";

export const createApp = (dependencies: Partial<AppDependencies> = {}) => {
  const resolvedDependencies: AppDependencies = {
    prisma: dependencies.prisma ?? prisma,
    jwtSecret: dependencies.jwtSecret ?? process.env.JWT_SECRET ?? "dev-secret",
  };

  const app = new Hono();

  app.get("/health", (c) => c.json({ status: "ok" }));
  app.route("/api/auth", createAuthRoutes(resolvedDependencies));
  app.route("/api", createCatalogRoutes(resolvedDependencies));
  app.route("/api/sessions", createSessionRoutes(resolvedDependencies));
  app.route("/api/admin", createAdminRoutes(resolvedDependencies));

  return app;
};