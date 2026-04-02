import { describe, it, expect, beforeEach } from 'vitest';
import { gameStore, GameStore, type QuestionPreview } from './gameStore';

// Создаем новый инстанс для каждого теста
const createTestStore = () => {
  const store = new GameStore();
  return store;
};

describe('GameStore Integration Tests', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('initial state', () => {
    it('starts in idle state', () => {
      expect(store.gameStatus).toBe('idle');
      expect(store.currentQuestionIndex).toBe(0);
      expect(store.score).toBe(0);
      expect(store.selectedAnswers).toEqual([]);
      expect(store.answeredQuestions).toEqual([]);
    });
  });

  describe('startGame', () => {
    it('changes status to playing', () => {
      store.startGame();
      expect(store.gameStatus).toBe('playing');
    });
  });

  describe('toggleAnswer', () => {
    beforeEach(() => {
      store.startGame();
    });

    it('adds answer when not in playing state does nothing', () => {
      store.gameStatus = 'idle';
      store.toggleAnswer(0);
      expect(store.selectedAnswers).toEqual([]);
    });

    it('adds answer to selection', () => {
      store.toggleAnswer(0);
      expect(store.selectedAnswers).toContain(0);
    });

    it('removes answer if already selected', () => {
      store.toggleAnswer(0);
      store.toggleAnswer(1);
      store.toggleAnswer(0);
      expect(store.selectedAnswers).not.toContain(0);
      expect(store.selectedAnswers).toContain(1);
    });

    it('sorts selected answers', () => {
      store.toggleAnswer(2);
      store.toggleAnswer(0);
      store.toggleAnswer(1);
      expect(store.selectedAnswers).toEqual([0, 1, 2]);
    });
  });

  describe('setQuestionsFromAPI', () => {
    const mockQuestions: QuestionPreview[] = [
      { id: '1', options: ['A', 'B'], type: 'choice', question: 'Q1' },
      { id: '2', options: ['C', 'D'], type: 'choice', question: 'Q2' },
    ];

    it('sets questions and resets state', () => {
      store.setQuestionsFromAPI(mockQuestions);
      expect(store.questions).toEqual(mockQuestions);
      expect(store.currentQuestionIndex).toBe(0);
      expect(store.selectedAnswers).toEqual([]);
      expect(store.answeredQuestions).toEqual([]);
      expect(store.score).toBe(0);
    });
  });

  describe('currentQuestion getter', () => {
    const mockQuestions: QuestionPreview[] = [
      { id: '1', options: ['A', 'B'], type: 'choice', question: 'Question 1' },
      { id: '2', options: ['C', 'D'], type: 'essay', question: 'Question 2' },
    ];

    beforeEach(() => {
      store.setQuestionsFromAPI(mockQuestions);
    });

    it('returns first question initially', () => {
      const question = store.currentQuestion;
      expect(question).not.toBeNull();
      expect(question?.id).toBe('1');
    });

    it('returns null when no questions', () => {
      store.questions = [];
      expect(store.currentQuestion).toBeNull();
    });

    it('returns correct question after navigation', () => {
      store.nextQuestion();
      expect(store.currentQuestion?.id).toBe('2');
    });

    it('returns question with default values', () => {
      const question = store.currentQuestion;
      expect(question?.type).toBe('choice');
      expect(question?.difficulty).toBe('easy');
      expect(question?.options).toEqual(['A', 'B']);
    });
  });

  describe('nextQuestion', () => {
    const mockQuestions: QuestionPreview[] = [
      { id: '1', options: [], type: 'choice', question: 'Q1' },
      { id: '2', options: [], type: 'choice', question: 'Q2' },
      { id: '3', options: [], type: 'choice', question: 'Q3' },
    ];

    beforeEach(() => {
      store.setQuestionsFromAPI(mockQuestions);
      store.startGame();
    });

    it('increments question index', () => {
      store.nextQuestion();
      expect(store.currentQuestionIndex).toBe(1);
    });

    it('clears selected answers', () => {
      store.toggleAnswer(0);
      store.nextQuestion();
      expect(store.selectedAnswers).toEqual([]);
    });

    it('calls finishGame on last question', () => {
      store.currentQuestionIndex = 2;
      store.nextQuestion();
      expect(store.gameStatus).toBe('finished');
    });
  });

  describe('isLastQuestion getter', () => {
    const mockQuestions: QuestionPreview[] = [
      { id: '1', options: [], type: 'choice', question: 'Q1' },
      { id: '2', options: [], type: 'choice', question: 'Q2' },
    ];

    beforeEach(() => {
      store.setQuestionsFromAPI(mockQuestions);
    });

    it('returns false for first question', () => {
      expect(store.isLastQuestion).toBe(false);
    });

    it('returns true for last question', () => {
      store.currentQuestionIndex = 1;
      expect(store.isLastQuestion).toBe(true);
    });
  });

  describe('progress getter', () => {
    const mockQuestions: QuestionPreview[] = [
      { id: '1', options: [], type: 'choice', question: 'Q1' },
      { id: '2', options: [], type: 'choice', question: 'Q2' },
      { id: '3', options: [], type: 'choice', question: 'Q3' },
      { id: '4', options: [], type: 'choice', question: 'Q4' },
    ];

    beforeEach(() => {
      store.setQuestionsFromAPI(mockQuestions);
    });

    it('returns 0 for no questions', () => {
      store.questions = [];
      expect(store.progress).toBe(0);
    });

    it('returns correct percentage', () => {
      store.currentQuestionIndex = 0;
      expect(store.progress).toBe(25);

      store.currentQuestionIndex = 1;
      expect(store.progress).toBe(50);

      store.currentQuestionIndex = 2;
      expect(store.progress).toBe(75);

      store.currentQuestionIndex = 3;
      expect(store.progress).toBe(100);
    });
  });

  describe('saveCurrentAnswer', () => {
    const mockQuestions: QuestionPreview[] = [
      { id: '1', options: ['A', 'B'], type: 'choice', question: 'Q1' },
    ];

    beforeEach(() => {
      store.setQuestionsFromAPI(mockQuestions);
      store.startGame();
    });

    it('saves current answer', () => {
      store.toggleAnswer(0);
      store.saveCurrentAnswer();
      expect(store.answeredQuestions).toHaveLength(1);
      expect(store.answeredQuestions[0].questionId).toBe('1');
      expect(store.answeredQuestions[0].selectedAnswers).toContain(0);
      expect(store.answeredQuestions[0].isCorrect).toBe(false);
      expect(store.answeredQuestions[0].points).toBe(0);
    });

    it('does nothing when no current question', () => {
      store.questions = [];
      store.saveCurrentAnswer();
      expect(store.answeredQuestions).toHaveLength(0);
    });
  });

  describe('updateAnswerResult', () => {
    const mockQuestions: QuestionPreview[] = [
      { id: '1', options: [], type: 'choice', question: 'Q1' },
    ];

    beforeEach(() => {
      store.setQuestionsFromAPI(mockQuestions);
      store.startGame();
      store.saveCurrentAnswer();
    });

    it('updates last answer with result', () => {
      store.updateAnswerResult(true, 10);
      expect(store.answeredQuestions[0].isCorrect).toBe(true);
      expect(store.answeredQuestions[0].points).toBe(10);
      expect(store.score).toBe(10);
    });

    it('does nothing when no answered questions', () => {
      store.answeredQuestions = [];
      store.updateAnswerResult(true, 10);
      expect(store.score).toBe(0);
    });
  });

  describe('correctAnswersCount getter', () => {
    it('returns count of correct answers', () => {
      store.answeredQuestions = [
        { questionId: '1', isCorrect: true },
        { questionId: '2', isCorrect: false },
        { questionId: '3', isCorrect: true },
      ];
      expect(store.correctAnswersCount).toBe(2);
    });
  });

  describe('resetGame', () => {
    const mockQuestions: QuestionPreview[] = [
      { id: '1', options: [], type: 'choice', question: 'Q1' },
    ];

    beforeEach(() => {
      store.setQuestionsFromAPI(mockQuestions);
      store.startGame();
      store.toggleAnswer(0);
      store.currentQuestionIndex = 1;
      store.score = 10;
    });

    it('resets all state', () => {
      store.resetGame();
      expect(store.gameStatus).toBe('idle');
      expect(store.currentQuestionIndex).toBe(0);
      expect(store.score).toBe(0);
      expect(store.selectedAnswers).toEqual([]);
      expect(store.answeredQuestions).toEqual([]);
      expect(store.questions).toEqual([]);
    });
  });

  describe('finishGame', () => {
    it('changes status to finished', () => {
      store.finishGame();
      expect(store.gameStatus).toBe('finished');
    });
  });

  describe('resetSelectedAnswers', () => {
    it('clears selected answers', () => {
      store.toggleAnswer(0);
      store.toggleAnswer(1);
      store.resetSelectedAnswers();
      expect(store.selectedAnswers).toEqual([]);
    });
  });
});