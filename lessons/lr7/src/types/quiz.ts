export interface Question {
  id: string;
  type: 'multiple-select' | 'essay' | 'choice';
  question: string;
  options?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  maxPoints?: number;
  minLength?: number;
  maxLength?: number;
  correctAnswer?: number;
}

export interface Answer {
  questionId: string;
  isCorrect: boolean;
  pointsEarned?: number;
  selectedAnswers?: number[];
  points?: number;
}