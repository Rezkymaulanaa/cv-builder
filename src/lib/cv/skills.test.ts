import { describe, expect, it } from "vitest";
import { convertSkillDetails } from "./skills";

describe("convertSkillDetails", () => {
  it("splits commas into points, keeping commas inside parentheses", () => {
    expect(convertSkillDetails("Microsoft Office (Excel, Word), SQL,  Figma ,", "list")).toBe(
      "Microsoft Office (Excel, Word)\nSQL\nFigma",
    );
  });

  it("joins points back into one comma-separated line, skipping blanks", () => {
    expect(convertSkillDetails("Excel\n\n SQL \nFigma", "text")).toBe("Excel, SQL, Figma");
  });
});
