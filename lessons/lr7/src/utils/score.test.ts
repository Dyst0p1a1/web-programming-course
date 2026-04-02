import { describe, it, expect } from 'vitest';
import { calculateTotalScore, getCorrectAnswersCount, calculateAccuracy } from './score';

describe('score utils', () => {
  describe('calculateTotalScore', () => {
    it('calculates total score from answers', () => {
      const answers = [
        { questionId: '1', pointsEarned: 5, isCorrect: true },
        { questionId: '2', pointsEarned: 3, isCorrect: true },
      ];
      expect(calculateTotalScore(answers)).toBe(8);
    });

    it('returns 0 for empty array', () => {
      expect(calculateTotalScore([])).toBe(0);
    });

    it('handles answers without pointsEarned', () => {
      const answers = [
        { questionId: '1', isCorrect: false },
      ];
      expect(calculateTotalScore(answers)).toBe(0);
    });

    it('ignores negative points', () => {
      const answers = [
        { questionId: '1', pointsEarned: -2, isCorrect: false },
        { questionId: '2', pointsEarned: 5, isCorrect: true },
      ];
      expect(calculateTotalScore(answers)).toBe(3);
    });
  });

  describe('getCorrectAnswersCount', () => {
    it('counts correct answers', () => {
      const answers = [
        { questionId: '1', isCorrect: true },
        { questionId: '2', isCorrect: false },
        { questionId: '3', isCorrect: true },
      ];
      expect(getCorrectAnswersCount(answers)).toBe(2);
    });

    it('returns 0 for empty array', () => {
      expect(getCorrectAnswersCount([])).toBe(0);
    });

    it('returns 0 when all answers are wrong', () => {
      const answers = [
        { questionId: '1', isCorrect: false },
        { questionId: '2', isCorrect: false },
      ];
      expect(getCorrectAnswersCount(answers)).toBe(0);
    });
  });

  describe('calculateAccuracy', () => {
    it('calculates percentage of correct answers', () => {
      const answers = [
        { questionId: '1', isCorrect: true },
        { questionId: '2', isCorrect: true },
        { questionId: '3', isCorrect: false },
        { questionId: '4', isCorrect: true },
      ];
      expect(calculateAccuracy(answers)).toBe(75);
    });

    it('returns 0 for empty array', () => {
      expect(calculateAccuracy([])).toBe(0);
    });

    it('returns 100 when all correct', () => {
      const answers = [
        { questionId: '1', isCorrect: true },
        { questionId: '2', isCorrect: true },
      ];
      expect(calculateAccuracy(answers)).toBe(100);
    });
  });
});