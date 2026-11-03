import type { CvStyle } from "./schema";

export type TemplateId = "klasik" | "modern" | "minimalis" | "eksekutif" | "ringkas";

export const TEMPLATES: Record<TemplateId, CvStyle> = {
  klasik: {
    font: "Times-Roman",
    accent: "#111827",
    spacing: "normal",
    headingStyle: "rule",
    headerAlign: "center",
    sectionOrder: ["summary", "experience", "organizations", "education", "skills", "projects", "certifications", "languages", "custom"],
  },
  modern: {
    font: "Helvetica",
    accent: "#1d4ed8",
    spacing: "normal",
    headingStyle: "rule",
    headerAlign: "left",
    sectionOrder: ["summary", "experience", "organizations", "skills", "education", "projects", "certifications", "languages", "custom"],
  },
  minimalis: {
    font: "Helvetica",
    accent: "#111827",
    spacing: "relaxed",
    headingStyle: "plain",
    headerAlign: "left",
    sectionOrder: ["summary", "experience", "organizations", "education", "skills", "projects", "certifications", "languages", "custom"],
  },
  eksekutif: {
    font: "Times-Roman",
    accent: "#1e3a5f",
    spacing: "normal",
    headingStyle: "caps",
    headerAlign: "left",
    sectionOrder: ["summary", "experience", "organizations", "projects", "education", "certifications", "skills", "languages", "custom"],
  },
  ringkas: {
    font: "Helvetica",
    accent: "#0f766e",
    spacing: "compact",
    headingStyle: "caps",
    headerAlign: "left",
    sectionOrder: ["summary", "skills", "experience", "organizations", "projects", "education", "certifications", "languages", "custom"],
  },
};

export const TEMPLATE_IDS = Object.keys(TEMPLATES) as TemplateId[];

export const CUSTOM_BASE_TEMPLATE: TemplateId = "modern";

// Dark enough to stay readable when printed in grayscale.
export const ACCENT_COLORS = ["#111827", "#1d4ed8", "#1e3a5f", "#0f766e", "#7f1d1d", "#5b21b6"];
