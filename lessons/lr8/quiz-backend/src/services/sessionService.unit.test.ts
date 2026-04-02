import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "../utils/errors.js";
import { SessionService } from "./sessionService.js";

const tx = {
  session: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  question: {
    findUnique: vi.fn(),
  },
  answer: {
    upsert: vi.fn(),
  },
};

function createPrismaMock() {
  return {
    $transaction: vi.fn(async (callback) => callback(tx)),
    session: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    question: {
      findUnique: vi.fn(),
    },
    answer: {
      upsert: vi.fn(),
    },
  };
}

describe("SessionService", () => {
  const prisma = createPrismaMock();
  const service = new SessionService(prisma as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when session is missing", async () => {
    tx.session.findUnique.mockResolvedValue(null);

    await expect(service.submitAnswer("session", "question", ["a"])).rejects.toBeInstanceOf(
      AppError,
    );
  });

  it("throws when session expired", async () => {
    tx.session.findUnique.mockResolvedValue({
      id: "session",
      status: "in_progress",
      expiresAt: new Date(Date.now() - 1000),
    });

    await expect(service.submitAnswer("session", "question", ["a"])).rejects.toMatchObject({
      message: "Session expired",
    });
  });

  it("stores auto-graded answer for multiple-select question", async () => {
    tx.session.findUnique.mockResolvedValue({
      id: "session",
      status: "in_progress",
      expiresAt: new Date(Date.now() + 1000),
    });
    tx.question.findUnique.mockResolvedValue({
      id: "question",
      type: "multiple-select",
      correctAnswer: ["a", "b"],
      points: 2,
    });
    tx.answer.upsert.mockResolvedValue({
      id: "answer",
      score: 2,
      isCorrect: true,
    });

    const answer = await service.submitAnswer("session", "question", ["a", "b"]);

    expect(answer).toMatchObject({ score: 2, isCorrect: true });
  });

  it("submits essay answer without score", async () => {
    tx.session.findUnique.mockResolvedValue({
      id: "session",
      status: "in_progress",
      expiresAt: new Date(Date.now() + 1000),
    });
    tx.question.findUnique.mockResolvedValue({
      id: "question",
      type: "essay",
      correctAnswer: null,
      points: 5,
    });
    tx.answer.upsert.mockResolvedValue({
      id: "answer",
      score: null,
      isCorrect: null,
    });

    const answer = await service.submitAnswer("session", "question", "essay");

    expect(answer).toMatchObject({ score: null, isCorrect: null });
  });

  it("computes total score on submit", async () => {
    prisma.$transaction.mockImplementationOnce(async (callback) =>
      callback({
        session: {
          findUnique: vi.fn().mockResolvedValue({
            id: "session",
            expiresAt: new Date(Date.now() + 1000),
            answers: [{ score: 1 }, { score: 2.5 }],
          }),
          update: vi.fn().mockResolvedValue({
            id: "session",
            status: "completed",
            score: 3.5,
            answers: [],
          }),
        },
      }),
    );

    const result = await service.submitSession("session");

    expect(result).toMatchObject({ score: 3.5, status: "completed" });
  });
});