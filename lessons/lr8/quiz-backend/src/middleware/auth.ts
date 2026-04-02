import type { Context, MiddlewareHandler } from "hono";
import { verify } from "hono/jwt";

import type { AppDependencies, JwtPayload } from "../lib/types.js";

type Variables = {
  authUser: JwtPayload;
};

export type AppBindings = {
  Variables: Variables;
};

function getBearerToken(c: Context) {
  const header = c.req.header("Authorization");
  if (!header) {
    return null;
  }

  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export const createAuthMiddleware = (
  dependencies: AppDependencies,
): MiddlewareHandler<AppBindings> => {
  return async (c, next) => {
    const token = getBearerToken(c);

    if (!token) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const payload = (await verify(
        token,
        dependencies.jwtSecret,
        "HS256",
      )) as JwtPayload;

      c.set("authUser", payload);
      await next();
    } catch {
      return c.json({ error: "Invalid token" }, 401);
    }
  };
};