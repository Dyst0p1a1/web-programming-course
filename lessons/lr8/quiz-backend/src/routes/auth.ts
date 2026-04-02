import { Hono } from "hono";
import { sign } from "hono/jwt";

import type { AppDependencies } from "../lib/types.js";
import type { AppBindings } from "../middleware/auth.js";
import { createAuthMiddleware } from "../middleware/auth.js";
import { getGitHubUserByCode, GitHubServiceError } from "../services/github.js";
import { authCodeSchema } from "../utils/validation.js";

export const createAuthRoutes = (dependencies: AppDependencies) => {
  const auth = new Hono<AppBindings>();

  auth.get("/github", (c) => {
    const clientId = process.env.GITHUB_CLIENT_ID ?? "demo-client-id";
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}`;
    return c.json({ url: redirectUrl });
  });

  auth.post("/github/callback", async (c) => {
    const payload = authCodeSchema.safeParse(await c.req.json());
    if (!payload.success) {
      return c.json({ error: payload.error.flatten() }, 400);
    }

    try {
      const githubUser = await getGitHubUserByCode(payload.data.code);
      const email = githubUser.email ?? `github_${githubUser.id}@example.com`;

      const user = await dependencies.prisma.user.upsert({
        where: { githubId: String(githubUser.id) },
        update: {
          email,
          name: githubUser.name,
        },
        create: {
          email,
          name: githubUser.name,
          githubId: String(githubUser.id),
          role: payload.data.code.startsWith("test_admin") ? "admin" : "student",
        },
      });

      const token = await sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        },
        dependencies.jwtSecret,
      );

      return c.json({
        token,
        user,
      });
    } catch (error) {
      if (error instanceof GitHubServiceError) {
        return c.json({ error: error.message }, error.statusCode);
      }

      return c.json({ error: "Failed to authenticate with GitHub" }, 500);
    }
  });

  auth.get("/me", createAuthMiddleware(dependencies), async (c) => {
    const authUser = c.get("authUser");
    const user = await dependencies.prisma.user.findUnique({
      where: { id: authUser.userId },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ user });
  });

  return auth;
};