import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createTestApp } from "../../tests/setup/test-app.js";

async function authenticate(app: Awaited<ReturnType<typeof createTestApp>>["app"], code: string) {
  const response = await app.request("/api/auth/github/callback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  return response.json();
}

describe("session routes", () => {
  let prisma: Awaited<ReturnType<typeof createTestApp>>["prisma"];
  let app: Awaited<ReturnType<typeof createTestApp>>["app"];
  let cleanup: Awaited<ReturnType<typeof createTestApp>>["cleanup"] | undefined;

  beforeEach(async () => {
    const testApp = await createTestApp("sessions-feature");
    prisma = testApp.prisma;
    app = testApp.app;
    cleanup = testApp.cleanup;

    const category = await prisma.category.create({
      data: {
        name: "Testing",
        slug: "testing",
      },
    });

    await prisma.question.createMany({
      data: [
        {
          text: "Pick semantic tags",
          type: "multiple-select",
          categoryId: category.id,
          correctAnswer: ["header", "main"],
          points: 2,
        },
        {
          text: "Explain HTTP status codes",
          type: "essay",
          categoryId: category.id,
          points: 5,
        },
      ],
    });
  });

  afterEach(async () => {
    if (cleanup) {
      await cleanup();
    }
  });

  it("creates session for authenticated user", async () => {
    const auth = await authenticate(app, "test_code");
    const response = await app.request("/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.session.questionCount).toBe(2);
  });

  it("submits answer and then completes session", async () => {
    const auth = await authenticate(app, "test_code");

    const sessionResponse = await app.request("/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({}),
    });
    const sessionBody = await sessionResponse.json();

    const question = await prisma.question.findFirstOrThrow({
      where: { type: "multiple-select" },
    });

    const answerResponse = await app.request(`/api/sessions/${sessionBody.session.id}/answers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({
        questionId: question.id,
        userAnswer: ["header", "main"],
      }),
    });

    expect(answerResponse.status).toBe(200);

    const submitResponse = await app.request(`/api/sessions/${sessionBody.session.id}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({}),
    });

    expect(submitResponse.status).toBe(200);
    const body = await submitResponse.json();
    expect(body.session.status).toBe("completed");
    expect(body.session.score).toBe(2);
  });

  it("forbids student access to admin endpoint", async () => {
    const auth = await authenticate(app, "test_code");

    const response = await app.request("/api/admin/questions", {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });

    expect(response.status).toBe(403);
  });
});