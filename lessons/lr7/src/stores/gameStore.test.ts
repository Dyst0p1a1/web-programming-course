import { describe, it, expect, beforeEach } from 'vitest';
import { GameStore } from './gameStore';

describe('GameStore', () => {
  let store: GameStore;

  beforeEach(() => {
    store = new GameStore();
  });

  describe('initialization', () => {
    it('starts with correct default state', () => {
      expect(store.gameStatus).toBe('idle');
      expect(store.currentQuestionIndex).toBe(0);
      expect(store.selectedAnswers).toEqual([]);
      expect(store.questions).toEqual([]);
      expect(store.answeredQuestions).toEqual([]);
      expect(store.score).toBe(0);
    });
  });

  describe('toggleAnswer', () => {
    it('adds answer to selection', () => {
      store.gameStatus = 'playing';
      store.toggleAnswer(0);
      expect(store.selectedAnswers).toEqual([0]);
    });

    it('removes answer if already selected', () => {
      store.gameStatus = 'playing';
      store.selectedAnswers = [0, 1, 2];
      store.toggleAnswer(1);
      expect(store.selectedAnswers).toEqual([0, 2]);
    });

    it('does nothing when game is not playing', () => {
      store.gameStatus = 'idle';
      store.toggleAnswer(0);
      expect(store.selectedAnswers).toEqual([]);
    });

    it('maintains sorted order when adding multiple answers', () => {
      store.gameStatus = 'playing';
      store.toggleAnswer(2);
      store.toggleAnswer(0);
      store.toggleAnswer(1);
      expect(store.selectedAnswers).toEqual([0, 1, 2]);
    });
  });

  describe('saveCurrentAnswer', () => {
    it('saves current answer to answeredQuestions', () => {
      store.gameStatus = 'playing';
      store.questions = [
        { id: '1', type: 'choice', question: 'Q1', options: [], difficulty: 'easy', maxPoints: 5 },
      ];
      store.selectedAnswers = [0, 2];
      store.saveCurrentAnswer();
      expect(store.answeredQuestions).toHaveLength(1);
      expect(store.answeredQuestions[0].questionId).toBe('1');
      expect(store.answeredQuestions[0].selectedAnswers).toEqual([0, 2]);
      expect(store.answeredQuestions[0].isCorrect).toBe(false);
      expect(store.answeredQuestions[0].points).toBe(0);
    });

    it('does nothing when no current question', () => {
      store.saveCurrentAnswer();
      expect(store.answeredQuestions).toHaveLength(0);
    });
  });

  describe('resetSelectedAnswers', () => {
    it('clears selected answers', () => {
      store.selectedAnswers = [0, 1, 2];
      store.resetSelectedAnswers();
      expect(store.selectedAnswers).toEqual([]);
    });
  });

  describe('setQuestionsFromAPI', () => {
    it('sets questions and resets state', () => {
      store.selectedAnswers = [0, 1];
      store.answeredQuestions = [{ questionId: '0', selectedAnswers: [], isCorrect: true, points: 5 }];
      store.score = 10;

      store.setQuestionsFromAPI([
        { id: '1', type: 'choice', question: 'Q1', options: [], difficulty: 'easy', maxPoints: 5 },
        { id: '2', type: 'choice', question: 'Q2', options: [], difficulty: 'medium', maxPoints: 10 },
      ]);

      expect(store.questions).toHaveLength(2);
      expect(store.currentQuestionIndex).toBe(0);
      expect(store.selectedAnswers).toEqual([]);
      expect(store.answeredQuestions).toEqual([]);
      expect(store.score).toBe(0);
    });
  });

  describe('updateAnswerResult', () => {
    it('updates last answer with result', () => {
      store.answeredQuestions.push({ questionId: '1', selectedAnswers: [], isCorrect: false, points: 0 });
      store.updateAnswerResult(true, 5);
      expect(store.answeredQuestions[0].isCorrect).toBe(true);
      expect(store.answeredQuestions[0].points).toBe(5);
      expect(store.score).toBe(5);
    });

    it('does nothing when no answered questions', () => {
      store.updateAnswerResult(true, 5);
      expect(store.score).toBe(0);
    });
  });

  describe('startGame', () => {
    it('sets game status to playing', () => {
      store.startGame();
      expect(store.gameStatus).toBe('playing');
    });
  });

  describe('nextQuestion', () => {
    beforeEach(() => {
      store.questions = [
        { id: '1', type: 'choice', question: 'Q1', options: [], difficulty: 'easy', maxPoints: 5 },
        { id: '2', type: 'choice', question: 'Q2', options: [], difficulty: 'medium', maxPoints: 10 },
        { id: '3', type: 'choice', question: 'Q3', options: [], difficulty: 'hard', maxPoints: 15 },
      ];
    });

    it('increments question index', () => {
      store.currentQuestionIndex = 0;
      store.nextQuestion();
      expect(store.currentQuestionIndex).toBe(1);
    });

    it('clears selected answers when moving to next', () => {
      store.currentQuestionIndex = 0;
      store.selectedAnswers = [0, 1];
      store.nextQuestion();
      expect(store.selectedAnswers).toEqual([]);
    });

    it('finishes game when on last question', () => {
      store.currentQuestionIndex = 2;
      store.nextQuestion();
      expect(store.gameStatus).toBe('finished');
    });
  });

  describe('finishGame', () => {
    it('sets game status to finished', () => {
      store.finishGame();
      expect(store.gameStatus).toBe('finished');
    });
  });

  describe('resetGame', () => {
    it('resets all state to initial values', () => {
      store.gameStatus = 'finished';
      store.currentQuestionIndex = 2;
      store.score = 25;
      store.selectedAnswers = [0, 1];
      store.answeredQuestions = [{ questionId: '1', selectedAnswers: [], isCorrect: true, points: 5 }];
      store.questions = [
        { id: '1', type: 'choice', question: 'Q1', options: [], difficulty: 'easy', maxPoints: 5 },
      ];

      store.resetGame();

      expect(store.gameStatus).toBe('idle');
      expect(store.currentQuestionIndex).toBe(0);
      expect(store.score).toBe(0);
      expect(store.selectedAnswers).toEqual([]);
      expect(store.answeredQuestions).toEqual([]);
      expect(store.questions).toEqual([]);
    });
  });

  describe('computed properties', () => {
    beforeEach(() => {
      store.questions = [
        { id: '1', type: 'choice', question: 'Q1', options: ['A', 'B'], difficulty: 'easy', maxPoints: 5 },
        { id: '2', type: 'choice', question: 'Q2', options: ['C', 'D'], difficulty: 'medium', maxPoints: 10 },
        { id: '3', type: 'choice', question: 'Q3', options: ['E', 'F'], difficulty: 'hard', maxPoints: 15 },
      ];
    });

    it('currentQuestion returns correct question', () => {
      store.currentQuestionIndex = 1;
      expect(store.currentQuestion?.id).toBe('2');
    });

    it('currentQuestion returns null for invalid index', () => {
      store.currentQuestionIndex = 99;
      expect(store.currentQuestion).toBeNull();
    });

    it('currentQuestion returns null when questions is empty', () => {
      store.questions = [];
      expect(store.currentQuestion).toBeNull();
    });

    it('isLastQuestion returns true for last question', () => {
      store.currentQuestionIndex = 2;
      expect(store.isLastQuestion).toBe(true);
    });

    it('isLastQuestion returns false for non-last question', () => {
      store.currentQuestionIndex = 0;
      expect(store.isLastQuestion).toBe(false);
    });

    it('progress calculates correct percentage', () => {
      store.currentQuestionIndex = 1;
      expect(store.progress).toBe(67);
    });

    it('progress returns 0 when no questions', () => {
      store.questions = [];
      expect(store.progress).toBe(0);
    });

    it('correctAnswersCount returns correct count', () => {
      store.answeredQuestions = [
        { questionId: '1', selectedAnswers: [], isCorrect: true, points: 5 },
        { questionId: '2', selectedAnswers: [], isCorrect: false, points: 0 },
        { questionId: '3', selectedAnswers: [], isCorrect: true, points: 10 },
      ];
      expect(store.correctAnswersCount).toBe(2);
    });
  });
});