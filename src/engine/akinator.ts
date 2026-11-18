import type { Dish, Question, AnswerHistory, EngineResult, RankedDish } from "../types/game.ts";

// エンジン定数設定
export const SINGLE_THRESHOLD = 0.70;      // 1位が70%以上で即終了
export const TOP3_SUM_THRESHOLD = 0.80;    // 上位3つの合計確率が80%以上で終了
export const MAX_QUESTIONS = 8;            // 最大質問数
export const INDECISIVE_THRESHOLD = 0.08;  // 1位が8%以下なら「定まっていない」と判定

/**
 * 特性値 (-1.0〜1.0) と回答値 (-1.0〜1.0) の一致度 (0.0〜1.0) を計算する
 */
function calcMatchScore(trait: number, answer: number): number {
  return 1.0 - Math.abs(trait - answer) / 2.0;
}

/**
 * 回答履歴に対する料理の尤度積（幾何平均ベース）から一致度 (0〜100%) を計算する
 * ベイズ推定の順位と単調一致するため、1位 >= 2位 >= 3位が必ず保たれる
 */
function calculateMatchRate(dish: Dish, history: AnswerHistory[]): number {
  if (history.length === 0) return 0;
  let score = 1.0;
  for (const step of history) {
    const trait = dish.traits[step.questionId] ?? 0.0;
    const matchScore = calcMatchScore(trait, step.answer);
    score *= 0.05 + matchScore * 0.9;
  }
  const geoMean = Math.pow(score, 1 / history.length);
  const rate = ((geoMean - 0.05) / 0.9) * 100;
  return Math.max(0, Math.min(100, Math.round(rate)));
}

/**
 * 1. ベイズ推定による事後確率の計算
 */
export function calculateProbabilities(
  dishes: Dish[],
  history: AnswerHistory[]
): Record<string, number> {
  const scores: Record<string, number> = {};

  // 事前確率を均等に初期化
  for (const dish of dishes) {
    scores[dish.id] = 1.0;
  }

  // 回答履歴をもとに各料理の尤度を乗算
  for (const step of history) {
    for (const dish of dishes) {
      const trait = dish.traits[step.questionId] ?? 0.0;
      const matchScore = calcMatchScore(trait, step.answer);
      const likelihood = 0.05 + matchScore * 0.9; // 0除算・復活不能を防ぐ下限値 0.05
      scores[dish.id] *= likelihood;
    }
  }

  // 合計を 1.0 に正規化
  const totalScore = Object.values(scores).reduce((sum, val) => sum + val, 0);
  const probabilities: Record<string, number> = {};
  for (const dish of dishes) {
    probabilities[dish.id] = totalScore > 0 ? scores[dish.id] / totalScore : 1.0 / dishes.length;
  }

  return probabilities;
}

/**
 * 2. 候補群を最も2分できる質問の選択
 * ※ 全ターンで評価値上位3問からランダム選出
 */
export function selectNextQuestion(
  questions: Question[],
  dishes: Dish[],
  probabilities: Record<string, number>,
  askedQuestionIds: string[]
): Question | undefined {
  // まだ聞いていない質問を抽出
  const unaskedQuestions = questions.filter((q) => !askedQuestionIds.includes(q.id));
  if (unaskedQuestions.length === 0) return undefined;

  // 全未出質問の「0.5（50:50）からのズレ」を計算
  const evaluated = unaskedQuestions.map((q) => {
    let expectedYesProb = 0;

    for (const dish of dishes) {
      const pDish = probabilities[dish.id] || 0;
      const trait = dish.traits[q.id] ?? 0; // -1.0 〜 1.0
      const pYesGivenDish = (trait + 1.0) / 2.0; // 0.0 〜 1.0 に変換

      expectedYesProb += pDish * pYesGivenDish;
    }

    return {
      question: q,
      diffFromHalf: Math.abs(expectedYesProb - 0.5),
    };
  });

  // 0.5 に近い順（ズレが小さい順）にソート
  evaluated.sort((a, b) => a.diffFromHalf - b.diffFromHalf);

  // 評価が高い上位3問からランダムに1問選ぶ
  const topCandidates = evaluated.slice(0, Math.min(3, evaluated.length));
  const randomIndex = Math.floor(Math.random() * topCandidates.length);
  return topCandidates[randomIndex].question;
}

/**
 * 優柔不断時（確率が動かなかった場合）のランダム3品選出ヘルパー
 */
function getRandomDishes(dishes: Dish[], count: number): RankedDish[] {
  const shuffled = [...dishes].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((dish) => ({
    dish,
    probability: 1 / count,
    matchRate: Math.round(100 / count),
  }));
}

/**
 * 3. ゲームを1ステップ進めるメインエントリポイント
 */
export function stepGame(
  dishes: Dish[],
  questions: Question[],
  history: AnswerHistory[]
): EngineResult {
  // 確率更新
  const probabilities = calculateProbabilities(dishes, history);

  // 全料理を確率降順でソートしてランキング化
  const rankedAll: RankedDish[] = dishes
    .map((dish) => {
      const prob = probabilities[dish.id] || 0;
      return {
        dish,
        probability: prob,
        matchRate: calculateMatchRate(dish, history),
      };
    })
    .sort((a, b) => b.probability - a.probability);

  const top1Prob = rankedAll[0]?.probability ?? 0;
  const top3Sum = rankedAll.slice(0, 3).reduce((sum, item) => sum + item.probability, 0);

  // 次の質問を選出
  const askedQuestionIds = history.map((h) => h.questionId);
  const nextQuestion = selectNextQuestion(questions, dishes, probabilities, askedQuestionIds);

  // 終了判定
  const isFinished =
    top1Prob >= SINGLE_THRESHOLD ||
    top3Sum >= TOP3_SUM_THRESHOLD ||
    history.length >= MAX_QUESTIONS ||
    !nextQuestion;

  // 定まらない（優柔不断）判定と上位3品の確定
  const isRandomPick = isFinished && top1Prob <= INDECISIVE_THRESHOLD;
  const topDishes = isRandomPick
    ? getRandomDishes(dishes, 3)
    : rankedAll.slice(0, 3);

  return {
    isFinished,
    isRandomPick,
    probabilities,
    topDishes,
    confidence: top1Prob,
    nextQuestion: isFinished ? undefined : nextQuestion,
  };
}
