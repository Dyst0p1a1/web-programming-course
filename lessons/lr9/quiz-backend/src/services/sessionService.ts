import { PrismaClient, type Answer, type Session } from '@prisma/client';
import { scoringService } from './scoringService';

const prisma = new PrismaClient();

export interface SubmitAnswerInput {
  sessionId: string;
  questionId: string;
  userAnswer: unknown;
}

export interface SubmitSessionResult {
  session: Session;
  answers: Answer[];
}

export class SessionService {
  /**
   * Создание новой сессии для пользователя
   * 
   * @param userId - ID пользователя
   * @param expiresAt - время истечения сессии (по умолчанию 1 час)
   * @returns созданная сессия
   */
  async createSession(userId: string, expiresAt?: Date) {
    const expirationTime = expiresAt || new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    return await prisma.session.create({
      data: {
        userId,
        expiresAt: expirationTime,
        status: 'in_progress',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Отправка ответа на вопрос
   * Использует transaction для безопасности
   * 
   * @param input - данные для отправки ответа
   * @returns созданный ответ с баллом (если автопроверка)
   */
  async submitAnswer(input: SubmitAnswerInput): Promise<Answer> {
    const { sessionId, questionId, userAnswer } = input;

    return await prisma.$transaction(async (tx) => {
      // Проверяем сессию
      const session = await tx.session.findUnique({
        where: { id: sessionId },
        include: { answers: true },
      });

      if (!session) {
        throw new Error('Session not found');
      }

      if (session.status !== 'in_progress') {
        throw new Error('Session is not active');
      }

      if (new Date() > session.expiresAt) {
        // Обновляем статус сессии на expired
        await tx.session.update({
          where: { id: sessionId },
          data: { status: 'expired' },
        });
        throw new Error('Session has expired');
      }

      // Проверяем вопрос
      const question = await tx.question.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        throw new Error('Question not found');
      }

      // Проверяем, не отвечал ли уже на этот вопрос
      const existingAnswer = await tx.answer.findUnique({
        where: {
          sessionId_questionId: {
            sessionId,
            questionId,
          },
        },
      });

      if (existingAnswer) {
        throw new Error('Already answered this question');
      }

      // Вычисляем балл (если вопрос с автопроверкой)
      let score: number | null = null;
      let isCorrect: boolean | null = null;

      if (question.correctAnswer && question.type !== 'essay') {
        // Парсим JSON строку с правильными ответами
        const correctAnswer = JSON.parse(question.correctAnswer) as { answer: string | string[] };
        
        if (question.type === 'single-select') {
          const studentAnswer = userAnswer as string;
          score = scoringService.scoreSingleSelect(correctAnswer.answer as string, studentAnswer);
          isCorrect = score > 0;
        } else if (question.type === 'multiple-select') {
          const studentAnswers = userAnswer as string[];
          score = scoringService.scoreMultipleSelect(
            correctAnswer.answer as string[],
            studentAnswers
          );
          isCorrect = score > 0;
        }
      }

      // Создаём ответ (сериализуем userAnswer в JSON строку)
      return await tx.answer.create({
        data: {
          sessionId,
          questionId,
          userAnswer: JSON.stringify(userAnswer),
          score,
          isCorrect,
        },
      });
    });
  }

  /**
   * Завершение сессии и подсчёт итогового балла
   * 
   * @param sessionId - ID сессии
   * @returns завершённая сессия с итоговым баллом
   */
  async submitSession(sessionId: string): Promise<SubmitSessionResult> {
    return await prisma.$transaction(async (tx) => {
      // Находим сессию со всеми ответами
      const session = await tx.session.findUnique({
        where: { id: sessionId },
        include: {
          answers: {
            include: {
              question: true,
            },
          },
        },
      });

      if (!session) {
        throw new Error('Session not found');
      }

      if (session.status !== 'in_progress') {
        throw new Error('Session is not active');
      }

      if (new Date() > session.expiresAt) {
        await tx.session.update({
          where: { id: sessionId },
          data: { status: 'expired' },
        });
        throw new Error('Session has expired');
      }

      // Подсчитываем общий балл
      const totalScore = session.answers
        .filter((a) => a.score !== null)
        .reduce((sum, a) => sum + (a.score || 0), 0);

      // Обновляем сессию
      const updatedSession = await tx.session.update({
        where: { id: sessionId },
        data: {
          status: 'completed',
          score: totalScore,
          completedAt: new Date(),
        },
      });

      return {
        session: updatedSession,
        answers: session.answers,
      };
    });
  }

  /**
   * Получение сессии с ответами
   * 
   * @param sessionId - ID сессии
   * @param userId - ID пользователя (для проверки прав)
   * @returns сессия с ответами и вопросами
   */
  async getSession(sessionId: string, userId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                type: true,
                points: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.userId !== userId) {
      throw new Error('Not authorized to view this session');
    }

    return session;
  }

  /**
   * Получение списка сессий пользователя с пагинацией
   * 
   * @param userId - ID пользователя
   * @param page - номер страницы (начиная с 1)
   * @param limit - количество записей на странице
   * @returns список сессий и общая количество
   */
  async getUserSessions(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [sessions, total] = await prisma.$transaction([
      prisma.session.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          score: true,
          startedAt: true,
          completedAt: true,
          expiresAt: true,
          _count: {
            select: { answers: true },
          },
        },
      }),
      prisma.session.count({ where: { userId } }),
    ]);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

// Экспорт singleton экземпляра
export const sessionService = new SessionService();