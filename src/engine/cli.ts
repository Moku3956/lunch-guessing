import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { DISHES, QUESTIONS } from "../data/dishes.ts";
import { MAX_QUESTIONS, stepGame } from "./akinator.ts";
import type { AnswerHistory, AnswerValue } from "../types/game.ts";

const ANSWER_MAP: Record<string, AnswerValue> = {
  "1": 1.0,
  "2": 0.5,
  "3": 0.0,
  "4": -0.5,
  "5": -1.0,
};

const MEDALS = ["🥇", "🥈", "🥉"];

async function main() {
  const rl = readline.createInterface({ input, output });
  const history: AnswerHistory[] = [];

  console.log("=== 🍛 ごはんアキネーター (CLI テストドライバ) ===");
  console.log("1: はい | 2: たぶんそう | 3: どちらでも | 4: たぶん違う | 5: いいえ | q: 終了\n");

  try {
    while (true) {
      const result = stepGame(DISHES, QUESTIONS, history);

      if (result.isFinished || !result.nextQuestion) {
        console.log("\n=== 🎉 提案結果 ===");
        if (result.isRandomPick) {
          console.log("迷ってしまったため、ランダムでおすすめを3品選びました！");
        }
        result.topDishes.forEach((item, index) => {
          const medal = MEDALS[index] ?? `${index + 1}.`;
          console.log(`${medal} ${item.dish.name} (一致度: ${item.matchRate}%)`);
        });
        console.log(`\n回答数: ${history.length} 問 / 1位確信度: ${Math.round(result.confidence * 100)}%`);
        break;
      }

      const questionNumber = history.length + 1;
      console.log(`質問 ${questionNumber}/${MAX_QUESTIONS}: ${result.nextQuestion.text}`);

      let answer: AnswerValue | undefined;
      while (answer === undefined) {
        const raw = (await rl.question("選択 [1-5 / q]: ")).trim().toLowerCase();
        if (raw === "q") {
          console.log("終了します。");
          return;
        }
        answer = ANSWER_MAP[raw];
        if (answer === undefined) {
          console.log("1〜5 の数字、または q を入力してください。");
        }
      }

      history.push({
        questionId: result.nextQuestion.id,
        answer,
      });
      console.log("");
    }
  } finally {
    rl.close();
  }
}

main();
