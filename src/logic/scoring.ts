import { Rule } from "../types";

export const calcPoints = (rule: Rule, name: string, fixed?: number) => {
  if (rule.scoring === "fixed") return fixed ?? rule.fixedPointValue ?? 3;
  return Array.from(name).length; // マルチバイト対応
};
