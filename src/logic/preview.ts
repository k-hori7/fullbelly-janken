import seedrandom from "seedrandom";
import { Config, Pool } from "../types";
import { calcPoints } from "./scoring";

export type PreviewItem = {
  food?: { id: string; name: string };
  points: number;
};

export type RoundPreview = {
  seed: string;
  byHand: Partial<Record<Pool, PreviewItem>>;
  onHide?: (foodId: string) => void; // 長押しで非表示 → 次ラウンドから反映
};

function pickDistinct3(
  seed: string,
  names: { id: string; name: string; points: number }[]
) {
  // フィッシャー–イェーツ的にseedでシャッフル → 先頭3つ
  const rng = seedrandom(seed);
  const arr = names.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 3);
}

export function makePreview(seed: string, cfg: Config): RoundPreview {
  const enabled = cfg.foods.filter((f) => f.enabled);
  const enriched = enabled.map((f) => ({
    id: f.id,
    name: f.name,
    points: calcPoints(cfg.rule, f.name, f.points),
  }));

  let picked: { id: string; name: string; points: number }[] = [];

  if (enriched.length === 0) {
    picked = [];
  } else if (enriched.length >= 3) {
    picked = pickDistinct3(seed, enriched);
  } else {
    // 3つ未満 → 重複可で3枠埋める
    picked = Array.from({ length: 3 }, (_, i) => {
      const r = seedrandom(`${seed}:${i}`)();
      return enriched[Math.floor(r * enriched.length)];
    });
  }

  const [a, b, c] = [
    picked[0] ?? undefined,
    picked[1] ?? undefined,
    picked[2] ?? undefined,
  ];

  return {
    seed,
    byHand: {
      rock: a
        ? { food: { id: a.id, name: a.name }, points: a.points }
        : { food: undefined, points: 0 },
      scissors: b
        ? { food: { id: b.id, name: b.name }, points: b.points }
        : { food: undefined, points: 0 },
      paper: c
        ? { food: { id: c.id, name: c.name }, points: c.points }
        : { food: undefined, points: 0 },
    },
  };
}
