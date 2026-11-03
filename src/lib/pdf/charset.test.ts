import { describe, expect, it } from "vitest";
import { findUnsupportedChars } from "./charset";

describe("findUnsupportedChars", () => {
  it("accepts Indonesian text, accented Latin, and common punctuation", () => {
    expect(findUnsupportedChars({ a: "Budi Santoso, S.Kom. — José “Müller” • 100%\nbaris", b: ["€5"] })).toEqual([]);
  });

  it("reports each unsupported character once, including nested and emoji", () => {
    expect(findUnsupportedChars({ a: ["→ 日本 →"], b: { c: "🙂" } })).toEqual(["→", "日", "本", "🙂"]);
  });
});
