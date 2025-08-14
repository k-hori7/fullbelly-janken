import { create } from "zustand";
import { Config, PlayerScore, Pool } from "../types";
import { RoundPreview, makePreview } from "../logic/preview";
import { calcPoints } from "../logic/scoring";
import { useConfigStore } from "./configStore";

type GameState = {
  isReady: boolean;
  players: [PlayerScore, PlayerScore];
  rule: Config["rule"] | null;
  preview: RoundPreview | null;
  p1: PlayerScore;
  p2: PlayerScore;

  startMatch: (cfg: Config) => void;
  newPreview: () => void;
  confirmTurn: (winnerId: "p1" | "p2", loserHand: Pool) => void;
  undo: () => void;
  resetMatch: () => void;

  _lastAward?: { who: "p1" | "p2"; pts: number } | null;
};

export const useGameStore = create<GameState>((set, get) => ({
  isReady: false,
  players: [
    { name: "P1", points: 0 },
    { name: "P2", points: 0 },
  ],
  rule: null,
  preview: null,
  p1: { name: "P1", points: 0 },
  p2: { name: "P2", points: 0 },
  _lastAward: null,

  startMatch: (cfg) => {
    const p1 = { name: cfg.players.p1Name || "P1", points: 0 };
    const p2 = { name: cfg.players.p2Name || "P2", points: 0 };
    set({
      players: [p1, p2],
      p1,
      p2,
      rule: cfg.rule,
      isReady: true,
      preview: null,
      _lastAward: null,
    });
  },

  newPreview: () => {
    const st = get();
    const cfg = useConfigStore.getState().config!;
    const seed = `${Date.now()}-${Math.random()}`;
    const pv = makePreview(seed, cfg);
    // 対戦画面から長押し非表示 → configStore を更新
    pv.onHide = (foodId: string) => {
      const cs = useConfigStore.getState();
      cs.toggleFood(foodId, false);
      // 再生成（当該ラウンドは固定が理想だが「非表示」は次ラウンドから効く想定でもOK）
    };
    set({ preview: pv });
  },

  confirmTurn: (winnerId, loserHand) => {
    const st = get();
    if (!st.preview || !st.rule) return;
    const item = st.preview.byHand[loserHand];
    const pts = item?.points ?? 0;
    const p1 = { ...st.p1 },
      p2 = { ...st.p2 };
    if (winnerId === "p1") p1.points += pts;
    else p2.points += pts;
    set({ p1, p2, _lastAward: { who: winnerId, pts } });
    get().newPreview();
  },

  undo: () => {
    const st = get();
    const last = st._lastAward;
    if (!last) return;
    const p1 = { ...st.p1 },
      p2 = { ...st.p2 };
    if (last.who === "p1") p1.points = Math.max(0, p1.points - last.pts);
    else p2.points = Math.max(0, p2.points - last.pts);
    set({ p1, p2, _lastAward: null });
  },

  resetMatch: () => {
    const st = get();
    set({
      p1: { name: st.players[0].name, points: 0 },
      p2: { name: st.players[1].name, points: 0 },
      _lastAward: null,
      preview: null,
    });
  },
}));
