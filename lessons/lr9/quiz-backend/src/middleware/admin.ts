import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Расширяем типы Hono для добавления user в контекст
declare module 'hono' {
  interface ContextVariableMap {
    userId?: string;
    userRole?: string;
  }
}

/**
 * Middleware для проверки аутентификации
 * Извлекает userId из JWT токена
 */
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const payload = await verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret',
      'HS256'
    );

    c.set('userId', payload.userId as string);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

/**
 * Middleware для проверки роли admin
 * Должен использоваться после authMiddleware
 */
export const requireAdmin = async (c: Context, next: Next) => {
  const userId = c.get('userId');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  if (user.role !== 'admin') {
    return c.json({ error: 'Forbidden: Admin access required' }, 403);
  }

  c.set('userRole', user.role);
  await next();
};

/**
 * Middleware для проверки что сессия принадлежит пользователю
 */
export const ownSessionMiddleware = async (c: Context, next: Next) => {
  const userId = c.get('userId');
  const sessionId = c.req.param('id');

  if (!userId || !sessionId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { userId: true },
  });

  if (!session) {
    return c.json({ error: 'Session not found' }, 404);
  }

  if (session.userId !== userId) {
    return c.json({ error: 'Forbidden: Not your session' }, 403);
  }

  await next();
};