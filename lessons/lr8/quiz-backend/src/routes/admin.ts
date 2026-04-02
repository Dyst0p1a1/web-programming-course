import { Hono } from "hono";
import { Prisma } from "@prisma/client";

import type { AppDependencies } from "../lib/types.js";
import type { AppBindings } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import { createAuthMiddleware } from "../middleware/auth.js";
import { SessionService } from "../services/sessionService.js";
import { scoringService } from "../services/scoringService.js";
import {
  gradeSchema,
  paginationSchema,
  questionSchema,
} from "../utils/validation.js";

export const createAdminRoutes = (dependencies: AppDependencies) => {
  const admin = new Hono<AppBindings>();
  const authMiddleware = createAuthMiddleware(dependencies);
  const sessionService = new SessionService(dependencies.prisma);

  admin.use("*", authMiddleware, requireAdmin);

  const toQuestionCreateInput = (payload: {
    text: string;
    type: "multiple-select" | "essay";
    categoryId: string;
    correctAnswer?: string[] | null;
    points: number;
  }): Prisma.QuestionUncheckedCreateInput => ({
    text: payload.text,
    type: payload.type,
    categoryId: payload.categoryId,
    correctAnswer:
      payload.correctAnswer === null ? Prisma.JsonNull : (payload.correctAnswer ?? undefined),
    points: payload.points,
  });

  const toQuestionUpdateInput = (payload: Partial<{
    text: string;
    type: "multiple-select" | "essay";
    categoryId: string;
    correctAnswer: string[] | null;
    points: number;
  }>): Prisma.QuestionUncheckedUpdateInput => ({
    ...(payload.text !== undefined ? { text: payload.text } : {}),
    ...(payload.type !== undefined ? { type: payload.type } : {}),
    ...(payload.categoryId !== undefined ? { categoryId: payload.categoryId } : {}),
    ...(payload.correctAnswer !== undefined
      ? {
          correctAnswer:
            payload.correctAnswer === null ? Prisma.JsonNull : payload.correctAnswer,
        }
      : {}),
    ...(payload.points !== undefined ? { points: payload.points } : {}),
  });

  admin.get("/questions", async (c) => {
    const questions = await dependencies.prisma.question.findMany({
      select: {
        id: true,
        text: true,
        type: true,
        points: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            answers: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json({ questions });
  });

  admin.post("/questions", async (c) => {
    const payload = questionSchema.safeParse(await c.req.json());
    if (!payload.success) {
      return c.json({ error: payload.error.flatten() }, 400);
    }

    const question = await dependencies.prisma.question.create({
      data: toQuestionCreateInput(payload.data),
    });

    return c.json({ question }, 201);
  });

  admin.put("/questions/:id", async (c) => {
    const payload = questionSchema.partial().safeParse(await c.req.json());
    if (!payload.success) {
      return c.json({ error: payload.error.flatten() }, 400);
    }

    const question = await dependencies.prisma.question.update({
      where: { id: c.req.param("id") },
      data: toQuestionUpdateInput(payload.data),
    });

    return c.json({ question });
  });

  admin.get("/answers/pending", async (c) => {
    const parsedQuery = paginationSchema.safeParse({
      page: c.req.query("page"),
      pageSize: c.req.query("pageSize"),
    });

    if (!parsedQuery.success) {
      return c.json({ error: parsedQuery.error.flatten() }, 400);
    }

    const { page, pageSize } = parsedQuery.data;

    const [items, total] = await Promise.all([
      dependencies.prisma.answer.findMany({
        where: {
          score: null,
          question: {
            type: "essay",
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          userAnswer: true,
          createdAt: true,
          question: {
            select: {
              id: true,
              text: true,
              points: true,
            },
          },
          session: {
            select: {
              id: true,
              status: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      dependencies.prisma.answer.count({
        where: {
          score: null,
          question: {
            type: "essay",
          },
        },
      }),
    ]);

    return c.json({
      answers: items,
      pagination: {
        page,
        pageSize,
        total,
      },
    });
  });

  admin.post("/answers/:id/grade", async (c) => {
    const payload = gradeSchema.safeParse(await c.req.json());
    if (!payload.success) {
      return c.json({ error: payload.error.flatten() }, 400);
    }

    const answer = await dependencies.prisma.answer.findUnique({
      where: { id: c.req.param("id") },
      include: {
        question: true,
      },
    });

    if (!answer) {
      return c.json({ error: "Answer not found" }, 404);
    }

    const score = scoringService.scoreEssay(payload.data.grades, payload.data.rubric);
    const normalizedScore = Math.min(score, answer.question.points);

    const gradedAnswer = await dependencies.prisma.answer.update({
      where: { id: answer.id },
      data: {
        score: normalizedScore,
        isCorrect: normalizedScore >= answer.question.points,
      },
    });

    await sessionService.refreshSessionScore(answer.sessionId);

    return c.json({ answer: gradedAnswer });
  });

  admin.get("/students/:userId/stats", async (c) => {
    const userId = c.req.param("userId");
    const [student, sessions] = await Promise.all([
      dependencies.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      }),
      dependencies.prisma.session.findMany({
        where: { userId },
        select: {
          id: true,
          status: true,
          score: true,
          completedAt: true,
        },
      }),
    ]);

    if (!student) {
      return c.json({ error: "User not found" }, 404);
    }

    const finishedSessions = sessions.filter((session) => session.score !== null);
    const averageScore =
      finishedSessions.length === 0
        ? 0
        : finishedSessions.reduce((sum, session) => sum + (session.score ?? 0), 0) /
          finishedSessions.length;

    return c.json({
      student,
      stats: {
        sessionsCount: sessions.length,
        averageScore,
      },
    });
  });

  return admin;
};