export type Pool = "rock" | "scissors" | "paper";
export type Scoring = "fixed" | "nameLen";

export type Food = {
  id: string;
  name: string;
  enabled: boolean;
  points?: number; // fixed時のみ使用（未指定ならrule.fixedPointValue）
};

export type Rule = {
  pointTarget: number; // 例: 50
  scoring: Scoring; // fixed or nameLen
  fixedPointValue?: number; // scoring=fixed時
};

export type Players = { p1Name: string; p2Name: string };

export type Config = {
  players: Players;
  rule: Rule;
  foods: Food[]; // ← 全手共通の候補
};

export type PlayerScore = { name: string; points: number };
