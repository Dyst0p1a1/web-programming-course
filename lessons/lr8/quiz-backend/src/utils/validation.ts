import { z } from "zod";

export const authCodeSchema = z.object({
  code: z.string().min(1, "code is required"),
});

export const createSessionSchema = z.object({
  categoryId: z.string().min(1).optional(),
});

export const answerSchema = z.object({
  questionId: z.string().min(1),
  userAnswer: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
});

export const submitSessionSchema = z.object({});

export const gradeSchema = z.object({
  grades: z.array(z.number().min(0)).min(1),
  rubric: z.array(z.number().min(0)).min(1),
});

export const questionSchema = z.object({
  text: z.string().min(5),
  type: z.enum(["multiple-select", "essay"]),
  categoryId: z.string().min(1),
  correctAnswer: z.union([z.array(z.string().min(1)).min(1), z.null()]).optional(),
  points: z.number().int().positive().max(100).default(1),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export type AuthCodeInput = z.infer<typeof authCodeSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type AnswerInput = z.infer<typeof answerSchema>;
export type GradeInput = z.infer<typeof gradeSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;