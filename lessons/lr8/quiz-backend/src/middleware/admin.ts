import type { MiddlewareHandler } from "hono";

import type { AppBindings } from "./auth.js";

export const requireAdmin: MiddlewareHandler<AppBindings> = async (c, next) => {
  const authUser = c.get("authUser");

  if (!authUser || authUser.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  await next();
};