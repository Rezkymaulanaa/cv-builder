import { renderToBuffer } from "@react-pdf/renderer";
import { getDocument, OPS } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createElement, type ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { emptyCv, sampleContent } from "../cv/defaults";
import { dictionaries } from "../cv/i18n";
import { cvSchema, type CvData, type Language } from "../cv/schema";
import { TEMPLATE_IDS } from "../cv/templates";
import { CvDocument } from "./CvDocument";

async function parse(cv: CvData) {
  const element = createElement(CvDocument, { cv }) as ReactElement<never>;
  const buffer = await renderToBuffer(element as never);
  const document = await getDocument({ data: new Uint8Array(buffer), verbosity: 0 }).promise;

  let text = "";
  let images = 0;
  for (let number = 1; number <= document.numPages; number++) {
    const page = await document.getPage(number);
    const { items } = await page.getTextContent();
    text += items.map((item) => ("str" in item ? item.str + (item.hasEOL ? "\n" : " ") : "")).join("") + "\n";
    const { fnArray } = await page.getOperatorList();
    images += fnArray.filter((op) => op === OPS.paintImageXObject).length;
  }
  return { text: text.replace(/\s+/g, " "), images, pages: document.numPages };
}

function sampleCv(language: Language, templateId: (typeof TEMPLATE_IDS)[number]): CvData {
  return { ...emptyCv(language, templateId), content: sampleContent(language) };
}

const cases = TEMPLATE_IDS.flatMap((templateId) => (["id", "en"] as const).map((language) => ({ templateId, language })));

describe.each(cases)("$templateId ($language)", ({ templateId, language }) => {
  it("exposes all content as real text, with no images", async () => {
    const cv = sampleCv(language, templateId);
    const { text, images } = await parse(cv);
    const { personal, experience, education, projects } = cv.content;

    expect(images).toBe(0);
    for (const value of [
      personal.fullName,
      personal.email,
      personal.phone,
      personal.linkedin,
      experience[0].role,
      experience[1].company,
      education[0].school,
      projects[0].name,
      ...experience[0].description.split("\n"),
      ...cv.content.skills.flatMap((skill) => skill.description.split(", ")),
      cv.content.organizations[0].organization,
      cv.content.organizations[0].organizationDescription,
    ]) {
      expect(text).toContain(value);
    }
  });

  it("keeps the reading order: contact first, then sections in order", async () => {
    const cv = sampleCv(language, templateId);
    const { text } = await parse(cv);
    const lower = text.toLowerCase();
    const labels = dictionaries[language].sections;

    const positions = [
      text.indexOf(cv.content.personal.fullName),
      text.indexOf(cv.content.personal.email),
      ...cv.style.sectionOrder
        .filter((id) => id !== "custom")
        .map((id) => lower.indexOf(labels[id].toLowerCase())),
    ];

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });
});

// A valid 1x1 PNG.
const PHOTO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

describe.each(TEMPLATE_IDS)("%s with a photo", (templateId) => {
  it("adds exactly one image and keeps all text readable and in order", async () => {
    const cv = sampleCv("id", templateId);
    cv.content.photo = { image: PHOTO, source: PHOTO, area: { x: 0, y: 0, width: 1, height: 1 }, rotation: 0 };
    const { text, images } = await parse(cv);
    const { personal, experience } = cv.content;

    expect(images).toBe(1);
    const positions = [personal.fullName, personal.headline, personal.email, cv.content.summary, experience[0].role].map(
      (value) => text.indexOf(value),
    );
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

});

describe.each([true, false])("summary in the header (photo: %s)", (withPhoto) => {
  it.each(TEMPLATE_IDS)("%s: sits after the contact line, before every section, without its heading", async (templateId) => {
    const cv = sampleCv("id", templateId);
    cv.content.summaryPlacement = "header";
    if (withPhoto) cv.content.photo = { image: PHOTO, source: PHOTO, area: { x: 0, y: 0, width: 1, height: 1 }, rotation: 0 };
    const { text } = await parse(cv);
    const lower = text.toLowerCase();
    const firstSection = Math.min(
      ...cv.style.sectionOrder
        .filter((id) => id !== "summary" && id !== "custom")
        .map((id) => lower.indexOf(dictionaries.id.sections[id].toLowerCase())),
    );

    expect(text.indexOf(cv.content.summary)).toBeGreaterThan(text.indexOf(cv.content.personal.country));
    expect(text.indexOf(cv.content.summary)).toBeLessThan(firstSection);
    expect(lower).not.toContain(dictionaries.id.sections.summary.toLowerCase());
  });
});

describe("experience bullets", () => {
  it("lists a single-line experience as a bullet and skips blank lines", async () => {
    const cv = sampleCv("id", "modern");
    cv.content.experience = [{ ...cv.content.experience[0], description: "Satu-satunya poin\n\n" }];
    cv.content.education[0].description = "";
    cv.content.organizations = [];
    cv.content.skills = [];
    cv.content.projects[0].description = "Bukan poin";
    const { text } = await parse(cv);

    expect(text).toContain("• Satu-satunya poin");
    expect(text).not.toContain("• Bukan poin");
    expect(text.match(/•/g)).toHaveLength(1);
  });
});

describe("organizations and skills", () => {
  it("renders an organization like work experience, with its description in between", async () => {
    const { text } = await parse(sampleCv("id", "modern"));

    expect(text).toContain(
      "HIMATIF - Bandung Agu 2016 - Agu 2017 Ketua Himpunan Mahasiswa Teknik Informatika Institut Teknologi Nusantara • Memimpin 40 pengurus",
    );
  });

  it("lists skills as category: details, with an optional year", async () => {
    const cv = sampleCv("id", "modern");
    cv.content.skills = [
      { category: "Hard Skills", year: "", description: "Excel, SQL", format: "text" },
      { category: "Proyek", year: "2024", description: "Aplikasi kasir", format: "text" },
      { category: "", year: "", description: "Tanpa kategori", format: "text" },
    ];
    const { text } = await parse(cv);

    expect(text).toContain("• Hard Skills: Excel, SQL");
    expect(text).toContain("• Proyek (2024): Aplikasi kasir");
    expect(text).toContain("• Tanpa kategori");
  });

  it("lists skills as sub-bullets under their category in list format", async () => {
    const cv = sampleCv("id", "modern");
    cv.content.skills = [
      { category: "Technical Skills", year: "", description: "Excel\nSQL\n", format: "list" },
      { category: "", year: "", description: "Poin A\nPoin B", format: "list" },
    ];
    const { text } = await parse(cv);

    expect(text).toContain("• Technical Skills: – Excel – SQL • Poin A • Poin B");
  });

  it("loads drafts saved before these sections existed", () => {
    const old = sampleCv("id", "modern") as unknown as Record<string, Record<string, unknown>>;
    old.style.sectionOrder = ["summary", "experience", "skills", "education", "projects", "certifications", "languages", "custom"];
    old.content.skills = "Excel, SQL";
    delete old.content.organizations;

    const parsed = cvSchema.parse(old);

    expect(parsed.style.sectionOrder.slice(0, 3)).toEqual(["summary", "experience", "organizations"]);
    expect(parsed.content.skills).toEqual([{ category: "", year: "", description: "Excel, SQL", format: "text" }]);
    expect(parsed.content.organizations).toEqual([]);
  });
});

describe("entry headers", () => {
  it("leads with the organization, then location, date, and the role or degree", async () => {
    const cv = sampleCv("id", "modern");
    const { text } = await parse(cv);

    expect(text).toContain("PT Niaga Digital - Jakarta Mar 2022 - Sekarang Senior Product Manager");
    expect(text).toContain("Institut Teknologi Nusantara - Bandung Agu 2014 - Jul 2018 Sarjana Teknik Informatika, 3.75/4.00");
  });

  it("falls back to the role or degree when the organization is empty", async () => {
    const cv = sampleCv("en", "modern");
    cv.content.experience = [{ ...cv.content.experience[0], company: "", location: "" }];
    cv.content.education = [{ ...cv.content.education[0], school: "", location: "", gpa: "" }];
    const { text } = await parse(cv);

    expect(text).toContain("Senior Product Manager Mar 2022 - Present");
    expect(text).toContain("Bachelor's Computer Science Aug 2014 - Jul 2018");
  });
});

describe("contact line", () => {
  it("lists email, phone, LinkedIn, portfolio, city, country in that order", async () => {
    const cv = sampleCv("id", "modern");
    const { personal } = cv.content;
    const { text } = await parse(cv);

    expect(text).toContain(
      [personal.email, personal.phone, personal.linkedin, personal.website, personal.location, personal.country].join(" | "),
    );
  });

  it("keeps the summary as its own section when placed there, even with a photo", async () => {
    const cv = sampleCv("id", "modern");
    cv.content.photo = { image: PHOTO, source: PHOTO, area: { x: 0, y: 0, width: 1, height: 1 }, rotation: 0 };
    const { text } = await parse(cv);

    expect(text.toLowerCase()).toContain(dictionaries.id.sections.summary.toLowerCase());
  });
});

describe("content handling", () => {
  it("does not hyphenate long words at line ends", async () => {
    const words = ["internationalization", "responsibilities", "communication", "administration"];
    const cv = emptyCv();
    cv.content.personal.fullName = "Test";
    cv.content.summary = Array(30).fill(words.join(" ")).join(" ");

    const { text } = await parse(cv);

    for (const word of words) {
      expect(text.match(new RegExp(word, "g"))).toHaveLength(30);
    }
  });

  it("omits the headings of empty sections", async () => {
    const cv = emptyCv();
    cv.content.personal.fullName = "Test";

    const { text } = await parse(cv);

    expect(text.trim()).toBe("Test");
  });

  it("flows long content onto more pages without losing text", async () => {
    const cv = sampleCv("en", "modern");
    cv.content.experience = Array.from({ length: 25 }, (_, index) => ({
      ...cv.content.experience[0],
      role: `Role number ${index}`,
    }));

    const { text, pages } = await parse(cv);

    expect(pages).toBeGreaterThan(1);
    expect(text).toContain("Role number 0");
    expect(text).toContain("Role number 24");
  });
});
