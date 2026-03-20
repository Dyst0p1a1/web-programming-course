import { makeAutoObservable } from 'mobx';
import { Question, Answer } from '../types/quiz';
import { mockQuestions } from '../data/questions';

/**
 * GameStore - MobX Store для управления игровой логикой
 *
 * Используется в Task2 и Task4
 */
class GameStore {
  // Observable состояние
  gameStatus: 'idle' | 'playing' | 'finished' = 'idle';

  // TODO: Добавьте другие поля состояния:
  questions: Question[] = [];
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswer: number | null = null;
  answeredQuestions: Answer[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  // Actions - методы для изменения состояния

  startGame() {
    this.gameStatus = 'playing';
    // TODO: Добавьте остальную логику:
    // - Загрузите вопросы из mockQuestions
    // - Сбросьте счётчики и индексы
    this.questions = [...mockQuestions];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
  }

  selectAnswer(answerIndex: number) {
    console.log('Selected answer:', answerIndex);
    // TODO: Реализуйте логику выбора ответа:
    // 1. Проверьте, что ответ еще не был выбран
    // 2. Сохраните выбранный ответ
    // 3. Проверьте правильность (сравните с correctAnswer)
    // 4. Увеличьте счёт если правильно
    // 5. Сохраните в историю ответов
    if (this.selectedAnswer !== null || this.gameStatus !== 'playing') {
      return;
  }
  this.selectedAnswer = answerIndex;

    const currentQuestion = this.currentQuestion;
    if (!currentQuestion) return;

    // Проверяем правильность ответа
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      this.score += this.getPointsForDifficulty(currentQuestion.difficulty);
    }

    // Сохраняем в историю ответов
    this.answeredQuestions.push({
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      isCorrect: isCorrect
    });
  }
  // TODO: Добавьте другие методы:
  // nextQuestion() - переход к следующему вопросу
  // finishGame() - завершение игры
  // resetGame() - сброс к начальным значениям
  nextQuestion() {
    if (this.isLastQuestion) {
      this.finishGame();
      return;
    }

    this.currentQuestionIndex++;
    this.selectedAnswer = null;
  }

  finishGame() {
    this.gameStatus = 'finished';
  }

  resetGame() {
    this.gameStatus = 'idle';
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswer = null;
    this.answeredQuestions = [];
  }

  // Вспомогательный метод для получения очков за сложность
  private getPointsForDifficulty(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return 10;
      case 'medium': return 20;
      case 'hard': return 30;
      default: return 10;
    }
  }

  // Computed values - вычисляемые значения

  get currentQuestion(): Question | null {
    // TODO: Верните текущий вопрос из массива questions
    return this.questions[this.currentQuestionIndex] || null;
  }

  get progress(): number {
    // TODO: Вычислите прогресс в процентах (0-100)
    if (this.questions.length === 0) return 0;
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  // TODO: Добавьте другие computed values:
  // get isLastQuestion(): boolean
  // get correctAnswersCount(): number

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get correctAnswersCount(): number {
    return this.answeredQuestions.filter(answer => answer.isCorrect).length;
  }
}

export const gameStore = new GameStore();