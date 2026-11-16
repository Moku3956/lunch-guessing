export type AnswerValue = 1.0 | 0.5 | 0.0 | -0.5 | -1.0;

export interface Question {
  id: string;
  text: string;
}

export interface Dish {
  id: string;
  name: string;
  traits: Record<string, number>;
}

export interface AnswerHistory {
  questionId: string;
  answer: AnswerValue;
}

export interface RankedDish {
  dish: Dish;
  probability: number;
  matchRate: number;
}

export interface EngineResult {
  isFinished: boolean;
  isRandomPick: boolean;
  probabilities: Record<string, number>;
  topDishes: RankedDish[];
  confidence: number;
  nextQuestion?: Question;
}
