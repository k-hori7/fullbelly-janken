import { create } from "zustand";
import { Config, Food, Players, Rule, Pool, Scoring } from "../types";
import { storage } from "../lib/storage";

const KEY_LAST = "cfg:last";
const KEY_TMPL = "cfg:templates";

const defaultFoods: Food[] = [
  // 初回の簡易プリセット（各手3件）
  { id: "r-1", name: "おにぎり", pool: "rock", enabled: true, points: 3 },
  { id: "r-2", name: "からあげ", pool: "rock", enabled: true, points: 4 },
  { id: "r-3", name: "フライドポテト", pool: "rock", enabled: true, points: 5 },
  { id: "s-1", name: "サラダ", pool: "scissors", enabled: true, points: 3 },
  { id: "s-2", name: "冷奴", pool: "scissors", enabled: true, points: 2 },
  { id: "s-3", name: "枝豆", pool: "scissors", enabled: true, points: 2 },
  { id: "p-1", name: "ラーメン", pool: "paper", enabled: true, points: 5 },
  { id: "p-2", name: "アイス", pool: "paper", enabled: true, points: 2 },
  { id: "p-3", name: "うどん", pool: "paper", enabled: true, points: 3 },
];

const defaultConfig: Config = {
  players: { p1Name: "P1", p2Name: "P2" },
  rule: { pointTarget: 50, scoring: "fixed", fixedPointValue: 3 },
  foods: defaultFoods,
};

type Templates = Array<Config | null>;

type ConfigState = {
  config: Config | null;
  templates: Templates;
  hasAnyConfig: boolean;
  hydrate: (withDefault?: boolean) => Promise<void>;
  useLastConfig: () => void;
  loadTemplate: (slot: 0 | 1 | 2) => void;
  saveTemplate: (slot: 0 | 1 | 2) => Promise<void>;
  saveAsLast: () => Promise<void>;

  setPlayerName: (who: "p1" | "p2", name: string) => void;
  setPointTarget: (pt: number) => void;
  setScoring: (s: Scoring) => void;
  setFixedPoint: (n: number) => void;

  foodsByPool: (pool: Pool) => Food[];
  addFood: (pool: Pool) => void;
  updateFood: (id: string, patch: Partial<Food>) => void;
  deleteFood: (id: string) => void;
  toggleFood: (id: string, on: boolean) => void;
};

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: null,
  templates: [null, null, null],
  hasAnyConfig: false,

  hydrate: async (withDefault = false) => {
    const last = await storage.get<Config | null>(KEY_LAST, null);
    const tmpls = await storage.get<Templates>(KEY_TMPL, [null, null, null]);
    set({
      config: last ?? (withDefault ? defaultConfig : null),
      templates: tmpls,
      hasAnyConfig: !!(last ?? withDefault),
    });
  },

  useLastConfig: () => {
    const st = get();
    if (!st.config) set({ config: defaultConfig, hasAnyConfig: true });
  },

  loadTemplate: (slot) => {
    const st = get();
    const tpl = st.templates[slot];
    if (tpl) set({ config: tpl, hasAnyConfig: true });
  },

  saveTemplate: async (slot) => {
    const st = get();
    if (!st.config) return;
    const next = [...st.templates] as Templates;
    next[slot] = st.config;
    set({ templates: next });
    await storage.set(KEY_TMPL, next);
  },

  saveAsLast: async () => {
    const st = get();
    if (!st.config) return;
    await storage.set(KEY_LAST, st.config);
    set({ hasAnyConfig: true });
  },

  setPlayerName: (who, name) => {
    const st = get();
    if (!st.config) return;
    const players = {
      ...st.config.players,
      [who === "p1" ? "p1Name" : "p2Name"]: name,
    };
    set({ config: { ...st.config, players } });
  },

  setPointTarget: (pt) => {
    const st = get();
    if (!st.config) return;
    set({
      config: {
        ...st.config,
        rule: { ...st.config.rule, pointTarget: Math.max(1, pt || 50) },
      },
    });
  },

  setScoring: (s) => {
    const st = get();
    if (!st.config) return;
    set({ config: { ...st.config, rule: { ...st.config.rule, scoring: s } } });
  },

  setFixedPoint: (n) => {
    const st = get();
    if (!st.config) return;
    set({
      config: {
        ...st.config,
        rule: { ...st.config.rule, fixedPointValue: Math.max(0, n || 0) },
      },
    });
  },

  foodsByPool: (pool) => {
    const st = get();
    if (!st.config) return [];
    return st.config.foods.filter((f) => f.pool === pool);
  },

  addFood: (pool) => {
    const st = get();
    if (!st.config) return;
    const id = `${pool}-${Date.now()}`;
    const next: Food = {
      id,
      name: "新メニュー",
      pool,
      enabled: true,
      points: 3,
    };
    set({ config: { ...st.config, foods: [...st.config.foods, next] } });
  },

  updateFood: (id, patch) => {
    const st = get();
    if (!st.config) return;
    const foods = st.config.foods.map((f) =>
      f.id === id ? { ...f, ...patch } : f
    );
    set({ config: { ...st.config, foods } });
  },

  deleteFood: (id) => {
    const st = get();
    if (!st.config) return;
    const foods = st.config.foods.filter((f) => f.id !== id);
    set({ config: { ...st.config, foods } });
  },

  toggleFood: (id, on) => {
    const st = get();
    if (!st.config) return;
    const foods = st.config.foods.map((f) =>
      f.id === id ? { ...f, enabled: on } : f
    );
    set({ config: { ...st.config, foods } });
  },
}));
