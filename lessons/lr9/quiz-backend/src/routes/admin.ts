import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireAdmin } from '../middleware/admin';
import { questionSchema, gradeSchema, categorySchema, paginationSchema } from '../utils/validation';
import { scoringService } from '../services/scoringService';

const prisma = new PrismaClient();

export const admin = new Hono();

// Применяем authMiddleware и requireAdmin ко всем admin routes
admin.use('/*', authMiddleware);
admin.use('/*', requireAdmin);

// GET /api/admin/questions - Получить все вопросы с информацией
admin.get('/questions', async (c) => {
  try {
    const questions = await prisma.question.findMany({
      select: {
        id: true,
        text: true,
        type: true,
        points: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: { answers: true },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return c.json({ questions });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: 'Failed to fetch questions' }, 500);
  }
});

// POST /api/admin/questions - Создать новый вопрос
admin.post('/questions', async (c) => {
  try {
    const body = await c.req.json();
    const { success, data, error } = questionSchema.safeParse(body);

    if (!success) {
      return c.json({ error: error.flatten().fieldErrors }, 400);
    }

    const question = await prisma.question.create({
      data: {
        text: data.text,
        type: data.type,
        categoryId: data.categoryId,
        correctAnswer: data.correctAnswer ? JSON.stringify(data.correctAnswer) : null,
        points: data.points,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return c.json({ question }, 201);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: 'Failed to create question' }, 500);
  }
});

// PUT /api/admin/questions/:id - Обновить вопрос
admin.put('/questions/:id', async (c) => {
  const questionId = c.req.param('id');

  try {
    const body = await c.req.json();
    const { success, data, error } = questionSchema.partial().safeParse(body);

    if (!success) {
      return c.json({ error: error.flatten().fieldErrors }, 400);
    }

    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        text: data.text,
        type: data.type as 'single-select' | 'multiple-select' | 'essay',
        categoryId: data.categoryId,
        correctAnswer: data.correctAnswer ? JSON.stringify(data.correctAnswer) : null,
        points: data.points,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return c.json({ question });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: 'Failed to update question' }, 500);
  }
});

// DELETE /api/admin/questions/:id - Удалить вопрос
admin.delete('/questions/:id', async (c) => {
  const questionId = c.req.param('id');

  try {
    await prisma.question.delete({
      where: { id: questionId },
    });

    return c.json({ message: 'Question deleted' });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: 'Failed to delete question' }, 500);
  }
});

// GET /api/admin/answers/pending - Получить essay ответы которые не проверены
admin.get('/answers/pending', async (c) => {
  try {
    const { success, data, error } = paginationSchema.safeParse(c.req.query());
    
    if (!success) {
      return c.json({ error: error.flatten().fieldErrors }, 400);
    }

    const { page, limit } = data;
    const skip = (page - 1) * limit;

    const [answers, total] = await prisma.$transaction([
      prisma.answer.findMany({
        where: {
          score: null,
          question: {
            type: 'essay',
          },
        },
        skip,
        take: limit,
        include: {
          session: {
            select: {
              id: true,
              userId: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
          question: {
            select: {
              id: true,
              text: true,
              type: true,
              points: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.answer.count({
        where: {
          score: null,
          question: {
            type: 'essay',
          },
        },
      }),
    ]);

    return c.json({
      answers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: 'Failed to fetch pending answers' }, 500);
  }
});

// POST /api/admin/answers/:id/grade - Выставить оценку за essay
admin.post('/answers/:id/grade', async (c) => {
  const answerId = c.req.param('id');

  try {
    const body = await c.req.json();
    const { success, data, error } = gradeSchema.safeParse(body);

    if (!success) {
      return c.json({ error: error.flatten().fieldErrors }, 400);
    }

    // Используем transaction для обновления ответа и пересчёта сессии
    const result = await prisma.$transaction(async (tx) => {
      // Обновляем ответ
      const answer = await tx.answer.update({
        where: { id: answerId },
        data: {
          score: data.score,
        },
        include: {
          session: true,
        },
      });

      // Проверяем, все ли ответы в сессии проверены
      const sessionAnswers = await tx.answer.findMany({
        where: { sessionId: answer.sessionId },
        select: { score: true },
      });

      const allAnswered = sessionAnswers.every((a) => a.score !== null);

      let updatedSession = null;

      if (allAnswered) {
        // Подсчитываем общий балл
        const totalScore = sessionAnswers.reduce(
          (sum, a) => sum + (a.score || 0),
          0
        );

        // Обновляем сессию
        updatedSession = await tx.session.update({
          where: { id: answer.sessionId },
          data: {
            status: 'completed',
            score: totalScore,
            completedAt: new Date(),
          },
        });
      }

      return { answer, updatedSession };
    });

    return c.json({
      answer: {
        id: result.answer.id,
        score: result.answer.score,
        updatedAt: result.answer.updatedAt,
      },
      session: result.updatedSession ? {
        id: result.updatedSession.id,
        status: result.updatedSession.status,
        score: result.updatedSession.score,
      } : null,
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: 'Failed to grade answer' }, 500);
  }
});

// GET /api/admin/students/:userId/stats - Получить статистику студента
admin.get('/students/:userId/stats', async (c) => {
  const userId = c.req.param('userId');

  try {
    // Получаем пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Получаем статистику сессий
    const sessions = await prisma.session.findMany({
      where: { userId },
      select: {
        score: true,
        status: true,
        startedAt: true,
        completedAt: true,
      },
    });

    const completedSessions = sessions.filter((s) => s.status === 'completed');
    const totalSessions = sessions.length;
    const completedCount = completedSessions.length;

    const avgScore = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length
      : 0;

    const bestScore = completedSessions.length > 0
      ? Math.max(...completedSessions.map((s) => s.score || 0))
      : 0;

    const worstScore = completedSessions.length > 0
      ? Math.min(...completedSessions.map((s) => s.score || 0))
      : 0;

    return c.json({
      user,
      stats: {
        totalSessions,
        completedSessions: completedCount,
        averageScore: Math.round(avgScore * 100) / 100,
        bestScore,
        worstScore,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: 'Failed to fetch student stats' }, 500);
  }
});

// GET /api/admin/categories - Получить все категории
admin.get('/categories', async (c) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { questions: true },
        },
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return c.json({ categories });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

// POST /api/admin/categories - Создать категорию
admin.post('/categories', async (c) => {
  try {
    const body = await c.req.json();
    const { success, data, error } = categorySchema.safeParse(body);

    if (!success) {
      return c.json({ error: error.flatten().fieldErrors }, 400);
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
      },
    });

    return c.json({ category }, 201);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: 'Failed to create category' }, 500);
  }
});