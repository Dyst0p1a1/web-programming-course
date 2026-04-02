import { describe, expect, it } from "vitest";

import { ScoringService } from "./scoringService.js";

describe("ScoringService", () => {
  const service = new ScoringService();

  describe("scoreMultipleSelect", () => {
    it("returns full score for all correct answers", () => {
      expect(service.scoreMultipleSelect(["a", "b"], ["a", "b"], 2)).toBe(2);
    });

    it("applies penalty for wrong answer", () => {
      expect(service.scoreMultipleSelect(["a", "b"], ["a", "x"], 2)).toBe(0.5);
    });

    it("never returns a negative score", () => {
      expect(service.scoreMultipleSelect(["a"], ["x", "y"], 1)).toBe(0);
    });

    it("deduplicates student answers", () => {
      expect(service.scoreMultipleSelect(["a"], ["a", "a"], 1)).toBe(1);
    });

    it("normalizes answer case", () => {
      expect(service.scoreMultipleSelect(["HTML"], ["html"], 1)).toBe(1);
    });
  });

  describe("scoreEssay", () => {
    it("sums grades within rubric", () => {
      expect(service.scoreEssay([2, 3], [2, 3])).toBe(5);
    });

    it("caps grade by rubric item", () => {
      expect(service.scoreEssay([4], [3])).toBe(3);
    });

    it("ignores missing rubric items", () => {
      expect(service.scoreEssay([2, 3], [2])).toBe(2);
    });

    it("clamps negative grades to zero", () => {
      expect(service.scoreEssay([-1, 2], [3, 3])).toBe(2);
    });

    it("returns zero for empty input", () => {
      expect(service.scoreEssay([], [])).toBe(0);
    });
  });
});