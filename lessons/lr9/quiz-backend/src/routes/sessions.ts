import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { sign, verify } from 'hono/jwt';
import { sessionService } from '../services/sessionService';
import { answerSchema, paginationSchema } from '../utils/validation';
import { authMiddleware } from '../middleware/admin';

const prisma = new PrismaClient();

export const sessions = new Hono();

// POST /api/sessions - Создать новую сессию
sessions.post('/', authMiddleware, async (c) => {
  const userId = c.get('userId');

  try {
    const session = await sessionService.createSession(userId);

    return c.json({
      session: {
        id: session.id,
        status: session.status,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
        user: session.user,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: 'Failed to create session' }, 500);
  }
});

// GET /api/sessions - Получить список сессий пользователя с пагинацией
sessions.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId');
  
  try {
    const { success, data, error } = paginationSchema.safeParse(c.req.query());
    
    if (!success) {
      return c.json({ error: error.flatten().fieldErrors }, 400);
    }

    const { page, limit } = data;
    const result = await sessionService.getUserSessions(userId, page, limit);

    return c.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: 'Failed to fetch sessions' }, 500);
  }
});

// GET /api/sessions/:id - Получить сессию с ответами
sessions.get('/:id', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const sessionId = c.req.param('id');

  try {
    const session = await sessionService.getSession(sessionId, userId);

    return c.json({
      session: {
        id: session.id,
        status: session.status,
        score: session.score,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        expiresAt: session.expiresAt,
        answers: session.answers.map((a) => ({
          id: a.id,
          question: a.question,
          userAnswer: a.userAnswer,
          score: a.score,
          isCorrect: a.isCorrect,
          createdAt: a.createdAt,
        })),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message === 'Session not found' ? 404 : 
                     error.message === 'Not authorized to view this session' ? 403 : 400;
      return c.json({ error: error.message }, status);
    }
    return c.json({ error: 'Failed to fetch session' }, 500);
  }
});

// POST /api/sessions/:id/answers - Отправить ответ на вопрос
sessions.post('/:id/answers', authMiddleware, async (c) => {
  const sessionId = c.req.param('id');

  try {
    const body = await c.req.json();
    const { success, data, error } = answerSchema.safeParse(body);

    if (!success) {
      return c.json({ error: error.flatten().fieldErrors }, 400);
    }

    const answer = await sessionService.submitAnswer({
      sessionId,
      questionId: data.questionId,
      userAnswer: data.userAnswer,
    });

    return c.json({
      answer: {
        id: answer.id,
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        score: answer.score,
        isCorrect: answer.isCorrect,
        createdAt: answer.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message === 'Session not found' ? 404 :
                     error.message === 'Question not found' ? 404 :
                     error.message === 'Already answered this question' ? 409 :
                     error.message === 'Session has expired' ? 400 : 400;
      return c.json({ error: error.message }, status);
    }
    return c.json({ error: 'Failed to submit answer' }, 500);
  }
});

// POST /api/sessions/:id/submit - Завершить сессию
sessions.post('/:id/submit', authMiddleware, async (c) => {
  const sessionId = c.req.param('id');

  try {
    const result = await sessionService.submitSession(sessionId);

    return c.json({
      session: {
        id: result.session.id,
        status: result.session.status,
        score: result.session.score,
        startedAt: result.session.startedAt,
        completedAt: result.session.completedAt,
      },
      answers: result.answers.map((a) => ({
        id: a.id,
        questionId: a.questionId,
        score: a.score,
        isCorrect: a.isCorrect,
      })),
    });
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message === 'Session not found' ? 404 :
                     error.message === 'Session is not active' ? 400 :
                     error.message === 'Session has expired' ? 400 : 400;
      return c.json({ error: error.message }, status);
    }
    return c.json({ error: 'Failed to submit session' }, 500);
  }
});