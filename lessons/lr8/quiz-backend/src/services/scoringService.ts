export class ScoringService {
  scoreMultipleSelect(
    correctAnswers: string[],
    studentAnswers: string[],
    maxPoints = correctAnswers.length,
  ): number {
    const normalizedCorrect = new Set(correctAnswers.map((value) => value.trim().toLowerCase()));
    const normalizedStudent = new Set(studentAnswers.map((value) => value.trim().toLowerCase()));

    let score = 0;
    for (const answer of normalizedStudent) {
      score += normalizedCorrect.has(answer) ? 1 : -0.5;
    }

    return Math.max(0, Math.min(maxPoints, score));
  }

  scoreEssay(grades: number[], rubric: number[]): number {
    return grades.reduce((sum, grade, index) => {
      const max = rubric[index] ?? 0;
      const normalized = Math.min(Math.max(grade, 0), max);
      return sum + normalized;
    }, 0);
  }
}

export const scoringService = new ScoringService();