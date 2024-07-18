import nouns from "./nouns.ts";
import adjectives from "./adjectives.ts";

function getRandom<T>(arr: Array<T>): T {
  const r = Math.floor(Math.random() * arr.length);
  return arr[r];
}

export function generate() {
  const names = [getRandom(adjectives), getRandom(nouns)];
  return names.join("-");
}
