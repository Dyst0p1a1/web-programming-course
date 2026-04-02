import type { Answer, Prisma, PrismaClient, Question, Session } from "@prisma/client";

import { AppError } from "../utils/errors.js";
import { scoringService } from "./scoringService.js";

type SessionWithAnswers = Session & {
  answers: Array<Answer & { question: Question }>;
};

export class SessionService {
  constructor(private readonly prisma: PrismaClient) {}

  async submitAnswer(
    sessionId: string,
    questionId: string,
    userAnswer: Prisma.InputJsonValue,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new AppError("Session not found", 404);
      }

      if (session.status !== "in_progress") {
        throw new AppError("Session is not active", 400);
      }

      if (session.expiresAt < new Date()) {
        await tx.session.update({
          where: { id: sessionId },
          data: { status: "expired" },
        });
        throw new AppError("Session expired", 400);
      }

      const question = await tx.question.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        throw new AppError("Question not found", 404);
      }

      const evaluated = this.evaluateAnswer(question, userAnswer);

      return tx.answer.upsert({
        where: {
          sessionId_questionId: {
            sessionId,
            questionId,
          },
        },
        update: {
          userAnswer,
          score: evaluated.score,
          isCorrect: evaluated.isCorrect,
        },
        create: {
          sessionId,
          questionId,
          userAnswer,
          score: evaluated.score,
          isCorrect: evaluated.isCorrect,
        },
        include: {
          question: true,
        },
      });
    });
  }

  async submitSession(sessionId: string) {
    return this.prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: sessionId },
        include: {
          answers: true,
        },
      });

      if (!session) {
        throw new AppError("Session not found", 404);
      }

      if (session.expiresAt < new Date()) {
        await tx.session.update({
          where: { id: sessionId },
          data: { status: "expired" },
        });
        throw new AppError("Session expired", 400);
      }

      const totalScore = session.answers.reduce(
        (sum, answer) => sum + (answer.score ?? 0),
        0,
      );

      return tx.session.update({
        where: { id: sessionId },
        data: {
          status: "completed",
          score: totalScore,
          completedAt: new Date(),
        },
        include: {
          answers: {
            include: {
              question: true,
            },
          },
        },
      });
    });
  }

  async refreshSessionScore(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        answers: true,
      },
    });

    if (!session) {
      throw new AppError("Session not found", 404);
    }

    const hasPendingManualAnswers = session.answers.some((answer) => answer.score === null);
    if (hasPendingManualAnswers) {
      return session;
    }

    const totalScore = session.answers.reduce(
      (sum, answer) => sum + (answer.score ?? 0),
      0,
    );

    return this.prisma.session.update({
      where: { id: sessionId },
      data: { score: totalScore },
      include: {
        answers: true,
      },
    });
  }

  private evaluateAnswer(question: Question, userAnswer: Prisma.InputJsonValue) {
    if (question.type === "essay") {
      return {
        score: null,
        isCorrect: null,
      };
    }

    const correctAnswers = this.parseAnswerArray(question.correctAnswer);
    const studentAnswers = Array.isArray(userAnswer)
      ? userAnswer.map((item) => String(item))
      : [String(userAnswer)];

    const score = scoringService.scoreMultipleSelect(
      correctAnswers,
      studentAnswers,
      question.points,
    );

    return {
      score,
      isCorrect: score === question.points,
    };
  }

  private parseAnswerArray(value: Prisma.JsonValue | null): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((entry) => String(entry));
  }
}

export function getSessionOwnerId(session: SessionWithAnswers) {
  return session.userId;
}