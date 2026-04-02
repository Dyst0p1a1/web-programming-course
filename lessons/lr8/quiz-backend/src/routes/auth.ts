import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { sign, verify } from 'hono/jwt';
import { callbackSchema } from '../utils/validation';
import { getGitHubUserByCode } from '../services/github';

const prisma = new PrismaClient();

export const auth = new Hono();

// POST /api/auth/github/callback - GitHub OAuth callback
auth.post('/github/callback', async (c) => {
  try {
    const body = await c.req.json();
    const { code } = callbackSchema.parse(body);

    // Get GitHub user data
    const githubUser = await getGitHubUserByCode(code);

    // Create or update user in database
    const user = await prisma.user.upsert({
      where: { githubId: githubUser.id },
      update: {
        email: githubUser.email || `user${githubUser.id}@github.local`,
        name: githubUser.name,
      },
      create: {
        email: githubUser.email || `user${githubUser.id}@github.local`,
        name: githubUser.name,
        githubId: githubUser.id,
      },
    });

    // Generate JWT token
    const token = await sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      'HS256'
    );

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        githubId: user.githubId,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: 'Invalid request' }, 400);
  }
});

// GET /api/auth/me - Get current user (protected)
auth.get('/me', async (c) => {
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

    const userId = payload.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        githubId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user });
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
});