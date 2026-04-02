export type QuestionType = 'essay' | 'choice';

export interface Question {
  id: string | number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  type: QuestionType
}

export interface Answer {
  questionId: string | number;
  selectedAnswers: number[];
  isCorrect: boolean;
  points?: number;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished';

export type Theme = 'light' | 'dark';
