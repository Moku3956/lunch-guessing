import { describe, expect, it, vi } from "vitest";
import { DISHES, QUESTIONS } from "../data/dishes.ts";
import {
  calculateProbabilities,
  INDECISIVE_THRESHOLD,
  MAX_QUESTIONS,
  selectNextQuestion,
  SINGLE_THRESHOLD,
  stepGame,
  TOP3_SUM_THRESHOLD,
} from "./akinator.ts";
import type { AnswerHistory, Dish, Question } from "../types/game.ts";

describe("calculateProbabilities", () => {
  it("returns uniform probabilities (1/30) when history is empty", () => {
    const probs = calculateProbabilities(DISHES, []);
    const values = Object.values(probs);
    expect(values).toHaveLength(DISHES.length);
    for (const value of values) {
      expect(value).toBeCloseTo(1 / DISHES.length, 6);
    }
    const sum = values.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 6);
  });

  it("updates probabilities sensibly so spicy + chinese + rice ranks 麻婆豆腐 at the top", () => {
    const history: AnswerHistory[] = [
      { questionId: "q_spicy", answer: 1.0 },
      { questionId: "q_chinese", answer: 1.0 },
      { questionId: "q_rice", answer: 1.0 },
    ];
    const probs = calculateProbabilities(DISHES, history);
    const ranked = Object.entries(probs).sort((a, b) => b[1] - a[1]);
    expect(ranked[0][0]).toBe("mabo_tofu");
    expect(probs["mabo_tofu"]).toBeGreaterThan(1 / DISHES.length);
  });
});

describe("selectNextQuestion", () => {
  it("skips already asked questions", () => {
    const probs = calculateProbabilities(DISHES, []);
    const asked = QUESTIONS.slice(0, QUESTIONS.length - 1).map((q) => q.id);
    const next = selectNextQuestion(QUESTIONS, DISHES, probs, asked);
    expect(next).toEqual(QUESTIONS[QUESTIONS.length - 1]);
  });

  it("returns undefined when all questions have been asked", () => {
    const probs = calculateProbabilities(DISHES, []);
    const asked = QUESTIONS.map((q) => q.id);
    const next = selectNextQuestion(QUESTIONS, DISHES, probs, asked);
    expect(next).toBeUndefined();
  });

  it("picks from top 3 informative questions on the first turn", () => {
    const probs = calculateProbabilities(DISHES, []);
    const pickedIds = new Set<string>();
    const randomSpy = vi.spyOn(Math, "random");

    try {
      randomSpy.mockReturnValue(0.0);
      const first = selectNextQuestion(QUESTIONS, DISHES, probs, []);
      randomSpy.mockReturnValue(0.4);
      const second = selectNextQuestion(QUESTIONS, DISHES, probs, []);
      randomSpy.mockReturnValue(0.99);
      const third = selectNextQuestion(QUESTIONS, DISHES, probs, []);

      expect(first).toBeDefined();
      expect(second).toBeDefined();
      expect(third).toBeDefined();
      pickedIds.add(first!.id);
      pickedIds.add(second!.id);
      pickedIds.add(third!.id);
      expect(pickedIds.size).toBe(3);

      // 2問目以降も上位3問からランダムに選ばれる
      const laterPickedIds = new Set<string>();
      randomSpy.mockReturnValue(0.0);
      laterPickedIds.add(selectNextQuestion(QUESTIONS, DISHES, probs, ["q_rice"])!.id);
      randomSpy.mockReturnValue(0.4);
      laterPickedIds.add(selectNextQuestion(QUESTIONS, DISHES, probs, ["q_rice"])!.id);
      randomSpy.mockReturnValue(0.99);
      laterPickedIds.add(selectNextQuestion(QUESTIONS, DISHES, probs, ["q_rice"])!.id);
      expect(laterPickedIds.size).toBe(3);
    } finally {
      randomSpy.mockRestore();
    }
  });
});

describe("stepGame", () => {
  it("terminates when SINGLE_THRESHOLD is reached", () => {
    const syntheticDishes: Dish[] = [
      { id: "target", name: "Target", traits: { q1: 1.0, q2: 1.0, q3: 1.0 } },
      { id: "other1", name: "Other1", traits: { q1: -1.0, q2: -1.0, q3: -1.0 } },
      { id: "other2", name: "Other2", traits: { q1: -1.0, q2: -1.0, q3: 1.0 } },
      { id: "other3", name: "Other3", traits: { q1: -1.0, q2: 1.0, q3: -1.0 } },
    ];
    const syntheticQuestions: Question[] = [
      { id: "q1", text: "Q1" },
      { id: "q2", text: "Q2" },
      { id: "q3", text: "Q3" },
      { id: "q4", text: "Q4" },
    ];
    const history: AnswerHistory[] = [
      { questionId: "q1", answer: 1.0 },
      { questionId: "q2", answer: 1.0 },
      { questionId: "q3", answer: 1.0 },
    ];

    const result = stepGame(syntheticDishes, syntheticQuestions, history);
    expect(result.topDishes[0].probability).toBeGreaterThanOrEqual(SINGLE_THRESHOLD);
    expect(result.isFinished).toBe(true);
    expect(result.isRandomPick).toBe(false);
    expect(result.nextQuestion).toBeUndefined();
  });

  it("terminates when TOP3_SUM_THRESHOLD is reached even if top1 < SINGLE_THRESHOLD", () => {
    const syntheticDishes: Dish[] = [
      { id: "a", name: "A", traits: { q1: 1.0 } },
      { id: "b", name: "B", traits: { q1: 1.0 } },
      { id: "c", name: "C", traits: { q1: 1.0 } },
      { id: "d", name: "D", traits: { q1: -1.0 } },
    ];
    const syntheticQuestions: Question[] = [
      { id: "q1", text: "Q1" },
      { id: "q2", text: "Q2" },
    ];
    const history: AnswerHistory[] = [{ questionId: "q1", answer: 1.0 }];

    const result = stepGame(syntheticDishes, syntheticQuestions, history);
    const top3Sum = result.topDishes.reduce((sum, item) => sum + item.probability, 0);
    expect(result.topDishes[0].probability).toBeLessThan(SINGLE_THRESHOLD);
    expect(top3Sum).toBeGreaterThanOrEqual(TOP3_SUM_THRESHOLD);
    expect(result.isFinished).toBe(true);
    expect(result.nextQuestion).toBeUndefined();
  });

  it("terminates when MAX_QUESTIONS is reached", () => {
    const history: AnswerHistory[] = QUESTIONS.slice(0, MAX_QUESTIONS).map(
      (q) => ({
        questionId: q.id,
        answer: 0.0,
      }),
    );
    const result = stepGame(DISHES, QUESTIONS, history);
    expect(result.isFinished).toBe(true);
    expect(result.nextQuestion).toBeUndefined();
  });

  it("triggers isRandomPick: true when all answers are neutral (0.0) and top1Prob <= INDECISIVE_THRESHOLD", () => {
    const history: AnswerHistory[] = QUESTIONS.slice(0, MAX_QUESTIONS).map(
      (q) => ({
        questionId: q.id,
        answer: 0.0,
      }),
    );
    const result = stepGame(DISHES, QUESTIONS, history);
    expect(result.confidence).toBeLessThanOrEqual(INDECISIVE_THRESHOLD);
    expect(result.isFinished).toBe(true);
    expect(result.isRandomPick).toBe(true);
    expect(result.topDishes).toHaveLength(3);
  });

  it("computes matchRate monotonically with ranking order (1st >= 2nd >= 3rd)", () => {
    const history: AnswerHistory[] = [
      { questionId: "q_spicy", answer: 1.0 },
      { questionId: "q_rice", answer: 1.0 },
      { questionId: "q_chinese", answer: 1.0 },
    ];
    const result = stepGame(DISHES, QUESTIONS, history);
    expect(result.topDishes[0].dish.id).toBe("mabo_tofu");
    expect(result.topDishes[0].matchRate).toBeGreaterThanOrEqual(result.topDishes[1].matchRate);
    expect(result.topDishes[1].matchRate).toBeGreaterThanOrEqual(result.topDishes[2].matchRate);
    expect(result.topDishes[1].matchRate).toBeGreaterThan(50);
  });
});
