import type { SkillFormat } from "./schema";

// Splits on commas outside parentheses, so "Office (Excel, Word), SQL" stays two items.
const COMMA_OUTSIDE_PARENS = /,(?![^()]*\))/;

// Rewrites skill details when switching between a comma-separated line and one point per line.
export function convertSkillDetails(value: string, to: SkillFormat): string {
  const items = value
    .split(to === "list" ? COMMA_OUTSIDE_PARENS : "\n")
    .flatMap((part) => (to === "list" ? part.split("\n") : [part]))
    .map((part) => part.trim())
    .filter(Boolean);
  return items.join(to === "list" ? "\n" : ", ");
}
