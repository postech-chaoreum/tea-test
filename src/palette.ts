export type ResultPalette = {
  background: string;
  accent: string;
  soft: string;
  dark: string;
};

const palettes: Record<string, [string, string, string, string]> = {
  greenTea: ["#f4f0df", "#83a95c", "#dce8bf", "#4f7039"],
  matcha: ["#f1eedb", "#6d8f35", "#d7e2ab", "#4d6326"],
  hojicha: ["#f5ecdd", "#b17446", "#ead4bd", "#7e4d2e"],
  jasmineTea: ["#f6efe0", "#d5a756", "#f0ddad", "#8a6a28"],
  earlGrey: ["#edf1ed", "#7f9fb1", "#d5e4e8", "#4d6f7d"],
  assamMilkTea: ["#f2e7d9", "#b57453", "#ead0bd", "#78452f"],
  oolongTea: ["#f4ead8", "#9f8a4d", "#e3d39f", "#6f602f"],
  puerhTea: ["#eee4d8", "#7d5f4b", "#d3c0ae", "#503a2c"],
  rooibos: ["#f5e7dc", "#bf7258", "#edc8b7", "#854836"],
  fruitBlend: ["#f8e8e5", "#da6f78", "#f4c6ca", "#9d3f4c"],
  chamomile: ["#f7f0d9", "#cfb34d", "#efe0a4", "#806d22"],
  mintTea: ["#e8f3ed", "#66aa95", "#c3e2d6", "#397766"],
};

export function getResultPalette(resultId: string): ResultPalette {
  const [background, accent, soft, dark] = palettes[resultId] ?? palettes.greenTea;
  return { background, accent, soft, dark };
}
