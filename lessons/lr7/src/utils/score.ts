import type { Answer } from '../types/quiz';

export function calculateTotalScore(answers: Answer[]): number {
  return answers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
}

export function getCorrectAnswersCount(answers: Answer[]): number {
  return answers.filter(a => a.isCorrect).length;
}

export function calculateAccuracy(answers: Answer[]): number {
  if (answers.length === 0) return 0;
  const correct = getCorrectAnswersCount(answers);
  return Math.round((correct / answers.length) * 100);
}