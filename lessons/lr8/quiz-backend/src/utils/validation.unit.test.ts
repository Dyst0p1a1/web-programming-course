import { describe, expect, it } from "vitest";

import {
  answerSchema,
  authCodeSchema,
  gradeSchema,
  questionSchema,
} from "./validation.js";

describe("validation schemas", () => {
  it("accepts valid auth code payload", () => {
    expect(authCodeSchema.safeParse({ code: "test_code" }).success).toBe(true);
  });

  it("rejects empty auth code", () => {
    expect(authCodeSchema.safeParse({ code: "" }).success).toBe(false);
  });

  it("accepts multiple-select answer payload", () => {
    expect(
      answerSchema.safeParse({
        questionId: "ck1234567890123456789012",
        userAnswer: ["a", "b"],
      }).success,
    ).toBe(true);
  });

  it("rejects invalid grade payload", () => {
    expect(gradeSchema.safeParse({ grades: [], rubric: [1] }).success).toBe(false);
  });

  it("accepts valid question payload", () => {
    expect(
      questionSchema.safeParse({
        text: "What is semantic HTML?",
        type: "essay",
        categoryId: "ck1234567890123456789012",
        points: 5,
      }).success,
    ).toBe(true);
  });
});