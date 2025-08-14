import { create } from "zustand";
import { Config, Food, Players, Rule, Scoring } from "../types";
import { storage } from "../lib/storage";

const KEY_LAST = "cfg:last";
const KEY_TMPL = "cfg:templates";

const defaultFoods: Food[] = [
  { id: "f-1", name: "おにぎり", enabled: true, points: 3 },
  { id: "f-2", name: "からあげ", enabled: true, points: 4 },
  { id: "f-3", name: "フライドポテト", enabled: true, points: 5 },
  { id: "f-4", name: "サラダ", enabled: true, points: 3 },
  { id: "f-5", name: "冷奴", enabled: true, points: 2 },
  { id: "f-6", name: "枝豆", enabled: true, points: 2 },
  { id: "f-7", name: "ラーメン", enabled: true, points: 5 },
  { id: "f-8", name: "アイス", enabled: true, points: 2 },
  { id: "f-9", name: "うどん", enabled: true, points: 3 },
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

  foods: () => Food[];
  addFood: () => void;
  updateFood: (id: string, patch: Partial<Food>) => void;
  deleteFood: (id: string) => void;
  toggleFood: (id: string, on: boolean) => void;

  templateSummary: (slot: 0 | 1 | 2) => string; // UX向上の説明文
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

  foods: () => {
    const st = get();
    if (!st.config) return [];
    return st.config.foods;
  },

  addFood: () => {
    const st = get();
    if (!st.config) return;
    const id = `f-${Date.now()}`;
    const next: Food = { id, name: "新メニュー", enabled: true, points: 3 };
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
    set({
      config: {
        ...st.config,
        foods: st.config.foods.filter((f) => f.id !== id),
      },
    });
  },

  toggleFood: (id, on) => {
    const st = get();
    if (!st.config) return;
    const foods = st.config.foods.map((f) =>
      f.id === id ? { ...f, enabled: on } : f
    );
    set({ config: { ...st.config, foods } });
  },

  templateSummary: (slot) => {
    const st = get();
    const tpl = st.templates[slot];
    if (!tpl) return "未保存";
    const enabled = tpl.foods.filter((f) => f.enabled).length;
    const mode =
      tpl.rule.scoring === "fixed"
        ? `固定${tpl.rule.fixedPointValue ?? 3}点`
        : "名前の文字数";
    return `候補 ${enabled} 件・${mode}・目標 ${tpl.rule.pointTarget} 点`;
  },
}));
