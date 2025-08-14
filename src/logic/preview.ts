import seedrandom from "seedrandom";
import { Config, Pool } from "../types";
import { calcPoints } from "./scoring";

export type PreviewItem = {
  food?: { id: string; name: string };
  points: number; // 表示用（固定点 or 名前文字数）
};

export type RoundPreview = {
  seed: string;
  byHand: Partial<Record<Pool, PreviewItem>>;
  onHide?: (foodId: string) => void; // 対戦画面から長押しで非表示にする
};

export function makePreview(seed: string, cfg: Config): RoundPreview {
  const pick = (pool: Pool) => {
    const cand = cfg.foods.filter((f) => f.pool === pool && f.enabled);
    if (!cand.length) return { food: undefined, points: 0 };
    const r = seedrandom(seed + pool)();
    const i = Math.floor(r * cand.length);
    const food = cand[i];
    return {
      food: { id: food.id, name: food.name },
      points: calcPoints(cfg.rule, food.name, food.points),
    };
  };
  return {
    seed,
    byHand: {
      rock: pick("rock"),
      scissors: pick("scissors"),
      paper: pick("paper"),
    },
  };
}
