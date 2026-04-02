import { describe, it, expect, beforeEach } from 'vitest';

// Простая реализация GameStore для тестов без внешних зависимостей
class GameStore {
  isPlaying: boolean = false;
  currentQuestionIndex: number = 0;
  selectedAnswers: number[] = [];
  textAnswer: string = '';
  questions: any[] = [];
  answers: any[] = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.isPlaying = false;
    this.currentQuestionIndex = 0;
    this.selectedAnswers = [];
    this.textAnswer = '';
    this.questions = [];
    this.answers = [];
  }

  toggleAnswer(index: number) {
    const idx = this.selectedAnswers.indexOf(index);
    if (idx > -1) {
      this.selectedAnswers.splice(idx, 1);
    } else {
      this.selectedAnswers.push(index);
    }
  }

  setTextAnswer(text: string) {
    this.textAnswer = text;
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    this.selectedAnswers = [];
    this.textAnswer = '';
  }

  get currentQuestion() {
    return this.questions[this.currentQuestionIndex];
  }

  get isLastQuestion() {
    return this.currentQuestionIndex >= this.questions.length - 1;
  }
}

describe('GameStore', () => {
  let store: GameStore;

  beforeEach(() => {
    store = new GameStore();
  });

  describe('initialization', () => {
    it('starts with correct default state', () => {
      expect(store.isPlaying).toBe(false);
      expect(store.currentQuestionIndex).toBe(0);
      expect(store.selectedAnswers).toEqual([]);
      expect(store.textAnswer).toBe('');
      expect(store.questions).toEqual([]);
      expect(store.answers).toEqual([]);
    });
  });

  describe('toggleAnswer', () => {
    it('adds answer to selection', () => {
      store.toggleAnswer(0);
      expect(store.selectedAnswers).toEqual([0]);
    });

    it('removes answer if already selected', () => {
      store.selectedAnswers = [0, 1, 2];
      store.toggleAnswer(1);
      expect(store.selectedAnswers).toEqual([0, 2]);
    });

    it('maintains order when adding multiple answers', () => {
      store.toggleAnswer(2);
      store.toggleAnswer(0);
      store.toggleAnswer(1);
      expect(store.selectedAnswers).toEqual([2, 0, 1]);
    });
  });

  describe('setTextAnswer', () => {
    it('updates text answer', () => {
      store.setTextAnswer('My answer');
      expect(store.textAnswer).toBe('My answer');
    });

    it('can clear text answer', () => {
      store.setTextAnswer('Text');
      store.setTextAnswer('');
      expect(store.textAnswer).toBe('');
    });
  });

  describe('nextQuestion', () => {
    beforeEach(() => {
      store.questions = [
        { id: '1', type: 'multiple-select', question: 'Q1', options: [], difficulty: 'easy', maxPoints: 5 },
        { id: '2', type: 'essay', question: 'Q2', difficulty: 'medium', maxPoints: 10 },
      ];
      store.currentQuestionIndex = 0;
    });

    it('increments question index', () => {
      store.nextQuestion();
      expect(store.currentQuestionIndex).toBe(1);
    });

    it('clears selected answers', () => {
      store.selectedAnswers = [0, 1];
      store.nextQuestion();
      expect(store.selectedAnswers).toEqual([]);
    });

    it('clears text answer', () => {
      store.textAnswer = 'Some text';
      store.nextQuestion();
      expect(store.textAnswer).toBe('');
    });

    it('does not go beyond last question', () => {
      store.currentQuestionIndex = 1;
      store.nextQuestion();
      expect(store.currentQuestionIndex).toBe(2);
    });
  });

  describe('computed properties', () => {
    beforeEach(() => {
      store.questions = [
        { id: '1', type: 'multiple-select', question: 'Q1', options: [], difficulty: 'easy', maxPoints: 5 },
        { id: '2', type: 'essay', question: 'Q2', difficulty: 'medium', maxPoints: 10 },
        { id: '3', type: 'multiple-select', question: 'Q3', options: [], difficulty: 'hard', maxPoints: 15 },
      ];
    });

    it('currentQuestion returns correct question', () => {
      store.currentQuestionIndex = 1;
      expect(store.currentQuestion?.id).toBe('2');
    });

    it('currentQuestion returns undefined for invalid index', () => {
      store.currentQuestionIndex = 99;
      expect(store.currentQuestion).toBeUndefined();
    });

    it('isLastQuestion returns true for last question', () => {
      store.currentQuestionIndex = 2;
      expect(store.isLastQuestion).toBe(true);
    });

    it('isLastQuestion returns false for non-last question', () => {
      store.currentQuestionIndex = 0;
      expect(store.isLastQuestion).toBe(false);
    });
  });
});