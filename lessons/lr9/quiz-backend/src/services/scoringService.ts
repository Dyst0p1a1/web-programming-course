/**
 * ScoringService - Сервис для подсчёта баллов
 * Реализует алгоритмы оценивания для разных типов вопросов
 */

export interface MultipleSelectScoringConfig {
  correctAnswers: string[];
  studentAnswers: string[];
}

export interface EssayScoringConfig {
  grades: number[];
  maxScore: number;
}

export class ScoringService {
  /**
   * Подсчёт баллов для multiple-select вопросов
   * Правила:
   * - +1 за каждый правильный ответ
   * - -0.5 за каждый неправильный ответ (выбранный но не верный)
   * - -0.5 за каждый пропущенный правильный ответ
   * - Минимальный балл: 0
   * 
   * @param correctAnswers - массив правильных ответов
   * @param studentAnswers - массив ответов студента
   * @returns балл от 0 до количества правильных ответов
   */
  scoreMultipleSelect(correctAnswers: string[], studentAnswers: string[]): number {
    const correctSet = new Set(correctAnswers);
    const studentSet = new Set(studentAnswers);

    let score = 0;

    // Подсчитываем правильные ответы
    for (const answer of studentSet) {
      if (correctSet.has(answer)) {
        score += 1;
      } else {
        // Штраф за неправильный ответ
        score -= 0.5;
      }
    }

    // Штраф за пропущенные правильные ответы
    for (const correct of correctSet) {
      if (!studentSet.has(correct)) {
        score -= 0.5;
      }
    }

    // Минимальный балл - 0
    return Math.max(0, score);
  }

  /**
   * Подсчёт баллов для essay (эссе) вопросов
   * Использует среднее значение оценок и масштабирование к максимальному баллу
   * 
   * @param grades - массив оценок от проверяющих
   * @param rubric - объект с максимальными баллами
   * @returns средний балл, масштабированный к maxScore
   */
  scoreEssay(grades: number[], rubric: { maxScore: number }): number {
    if (grades.length === 0) {
      return 0;
    }

    const maxScore = rubric.maxScore || 100;
    const maxGrade = 10; // предполагаем что оценки от 0 до 10

    const averageGrade = grades.reduce((sum, g) => sum + g, 0) / grades.length;
    const normalizedScore = (averageGrade / maxGrade) * maxScore;

    return Math.round(normalizedScore * 100) / 100; // округляем to 2 decimal places
  }

  /**
   * Подсчёт баллов для single-select вопросов
   * Простая бинарная оценка: 1 за правильный, 0 за неправильный
   * 
   * @param correctAnswer - правильный ответ
   * @param studentAnswer - ответ студента
   * @returns 1 или 0
   */
  scoreSingleSelect(correctAnswer: string, studentAnswer: string): number {
    return correctAnswer === studentAnswer ? 1 : 0;
  }

  /**
   * Общий метод для подсчёта баллов на основе типа вопроса
   * 
   * @param questionType - тип вопроса
   * @param correctAnswer - правильный ответ (или массив)
   * @param studentAnswer - ответ студента (или массив)
   * @param rubric - опционально, для essay
   * @returns балл
   */
  score(
    questionType: string,
    correctAnswer: string | string[],
    studentAnswer: string | string[],
    rubric?: { maxScore: number }
  ): number {
    switch (questionType) {
      case 'single-select':
        return this.scoreSingleSelect(
          correctAnswer as string,
          studentAnswer as string
        );
      case 'multiple-select':
        return this.scoreMultipleSelect(
          correctAnswer as string[],
          studentAnswer as string[]
        );
      case 'essay':
        return this.scoreEssay(
          studentAnswer as number[],
          rubric || { maxScore: 100 }
        );
      default:
        return 0;
    }
  }
}

// Экспорт singleton экземпляра
export const scoringService = new ScoringService();