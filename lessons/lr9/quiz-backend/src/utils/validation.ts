import { z } from 'zod';

// Auth validation schemas (from LR8)
export const callbackSchema = z.object({
  code: z.string().min(1, 'Code is required'),
});

export type CallbackInput = z.infer<typeof callbackSchema>;

// Answer validation schemas
export const answerSchema = z.object({
  questionId: z.string().cuid('Invalid question ID'),
  userAnswer: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.array(z.number()),
    z.object({}).passthrough(), // for essay text
  ]),
});

export type AnswerInput = z.infer<typeof answerSchema>;

// Grade validation schema (for essay grading)
export const gradeSchema = z.object({
  score: z.number().min(0, 'Score must be non-negative'),
  comment: z.string().optional(),
});

export type GradeInput = z.infer<typeof gradeSchema>;

// Question validation schema
export const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.enum(['single-select', 'multiple-select', 'essay']),
  categoryId: z.string().cuid('Invalid category ID'),
  correctAnswer: z.union([
    z.string(),
    z.array(z.string()),
    z.object({}).passthrough(),
  ]).optional(),
  points: z.number().int().positive('Points must be positive').default(1),
});

export type QuestionInput = z.infer<typeof questionSchema>;

// Category validation schema
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Category slug is required').regex(
    /^[a-z0-9-]+$/,
    'Slug must contain only lowercase letters, numbers, and hyphens'
  ),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// Session validation schema
export const createSessionSchema = z.object({
  userId: z.string().cuid('Invalid user ID').optional(),
  expiresAt: z.string().datetime().optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

// Pagination schema
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive().default(1)),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100).default(10)),
});

export type PaginationInput = z.infer<typeof paginationSchema>;