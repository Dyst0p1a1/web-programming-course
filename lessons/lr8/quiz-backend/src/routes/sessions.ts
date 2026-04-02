import { Hono } from "hono";

import type { AppDependencies } from "../lib/types.js";
import type { AppBindings } from "../middleware/auth.js";
import { createAuthMiddleware } from "../middleware/auth.js";
import { AppError } from "../utils/errors.js";
import { SessionService } from "../services/sessionService.js";
import {
  answerSchema,
  createSessionSchema,
  submitSessionSchema,
} from "../utils/validation.js";

export const createSessionRoutes = (dependencies: AppDependencies) => {
  const sessions = new Hono<AppBindings>();
  const authMiddleware = createAuthMiddleware(dependencies);
  const sessionService = new SessionService(dependencies.prisma);

  sessions.use("*", authMiddleware);

  sessions.post("/", async (c) => {
    const payload = createSessionSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!payload.success) {
      return c.json({ error: payload.error.flatten() }, 400);
    }

    const authUser = c.get("authUser");
    const questionCount = await dependencies.prisma.question.count({
      where: payload.data.categoryId ? { categoryId: payload.data.categoryId } : undefined,
    });

    const session = await dependencies.prisma.session.create({
      data: {
        userId: authUser.userId,
        status: "in_progress",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    return c.json(
      {
        session: {
          ...session,
          questionCount,
        },
      },
      201,
    );
  });

  sessions.get("/:id", async (c) => {
    const authUser = c.get("authUser");
    const session = await dependencies.prisma.session.findUnique({
      where: { id: c.req.param("id") },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    if (session.userId !== authUser.userId && authUser.role !== "admin") {
      return c.json({ error: "Forbidden" }, 403);
    }

    return c.json({ session });
  });

  sessions.post("/:id/answers", async (c) => {
    const sessionId = c.req.param("id");
    const authUser = c.get("authUser");
    const payload = answerSchema.safeParse(await c.req.json());
    if (!payload.success) {
      return c.json({ error: payload.error.flatten() }, 400);
    }

    const session = await dependencies.prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        userId: true,
      },
    });

    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    if (session.userId !== authUser.userId && authUser.role !== "admin") {
      return c.json({ error: "Forbidden" }, 403);
    }

    try {
      const answer = await sessionService.submitAnswer(
        sessionId,
        payload.data.questionId,
        payload.data.userAnswer,
      );

      return c.json({ answer });
    } catch (error) {
      if (error instanceof AppError) {
        return c.json(
          { error: error.message },
          error.statusCode as 400 | 401 | 403 | 404 | 500,
        );
      }

      return c.json({ error: "Failed to submit answer" }, 500);
    }
  });

  sessions.post("/:id/submit", async (c) => {
    const authUser = c.get("authUser");
    const payload = submitSessionSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!payload.success) {
      return c.json({ error: payload.error.flatten() }, 400);
    }

    const existingSession = await dependencies.prisma.session.findUnique({
      where: { id: c.req.param("id") },
      select: {
        userId: true,
      },
    });

    if (!existingSession) {
      return c.json({ error: "Session not found" }, 404);
    }

    if (existingSession.userId !== authUser.userId && authUser.role !== "admin") {
      return c.json({ error: "Forbidden" }, 403);
    }

    try {
      const submittedSession = await sessionService.submitSession(c.req.param("id"));
      return c.json({ session: submittedSession });
    } catch (error) {
      if (error instanceof AppError) {
        return c.json(
          { error: error.message },
          error.statusCode as 400 | 401 | 403 | 404 | 500,
        );
      }

      return c.json({ error: "Failed to submit session" }, 500);
    }
  });

  return sessions;
};