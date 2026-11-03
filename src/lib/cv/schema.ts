import { z } from "zod";

export const SECTION_IDS = [
  "summary",
  "experience",
  "organizations",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
  "custom",
] as const;

export const FONTS = ["Helvetica", "Times-Roman"] as const;
export const SPACINGS = ["compact", "normal", "relaxed"] as const;
export const HEADING_STYLES = ["rule", "caps", "plain"] as const;
export const HEADER_ALIGNS = ["left", "center"] as const;
export const SUMMARY_PLACEMENTS = ["section", "header"] as const;

const text = z.string().max(5000).default("");

const experienceSchema = z.object({
  role: text,
  company: text,
  location: text,
  startDate: text,
  endDate: text,
  current: z.boolean().default(false),
  description: text,
});

const organizationSchema = z.object({
  organization: text,
  role: text,
  // A short line about the organization, e.g. its full name.
  organizationDescription: text,
  location: text,
  startDate: text,
  endDate: text,
  current: z.boolean().default(false),
  description: text,
});

export const SKILL_FORMATS = ["text", "list"] as const;

// One line in the skills section, e.g. "Hard Skills: Excel, SQL".
const skillSchema = z.object({
  category: text,
  year: text,
  description: text,
  // "text" is one comma-separated line; "list" puts each line in its own sub-bullet.
  format: z.enum(SKILL_FORMATS).default("text"),
});

// Skills used to be one comma-separated string; keep it as a single line.
const skillsField = z.preprocess(
  (value) =>
    typeof value === "string" ? (value.trim() ? [{ category: "", year: "", description: value, format: "text" }] : []) : value,
  z.array(skillSchema).max(30).default([]),
);

export const EDUCATION_LEVELS =["highSchool", "diploma", "appliedBachelor", "bachelor", "master", "doctorate"] as const;

const educationSchema = z.object({
  level: z.enum(["", ...EDUCATION_LEVELS]).default(""),
  // The major or study program, e.g. "Sistem Informasi".
  degree: text,
  gpa: text,
  gpaMax: text,
  school: text,
  location: text,
  startDate: text,
  endDate: text,
  current: z.boolean().default(false),
  description: text,
});

const projectSchema = z.object({
  name: text,
  url: text,
  description: text,
});

const certificationSchema = z.object({
  name: text,
  issuer: text,
  date: text,
});

const languageSchema = z.object({
  name: text,
  level: text,
});

const customSectionSchema = z.object({
  title: text,
  description: text,
});

const imageDataUrl = z
  .string()
  .max(3_000_000)
  .regex(/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/);

const photoSchema = z.object({
  // The cropped 4:5 portrait that goes into the PDF.
  image: imageDataUrl,
  // A downscaled copy of the upload, kept so the crop can be adjusted later.
  source: imageDataUrl,
  area: z.object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() }),
  rotation: z.number().min(-180).max(180),
});

export const contentSchema = z.object({
  photo: photoSchema.nullable().default(null),
  personal: z.object({
    fullName: text,
    headline: text,
    email: text,
    phone: text,
    location: text,
    country: text,
    linkedin: text,
    website: text,
  }),
  summary: text,
  summaryPlacement: z.enum(SUMMARY_PLACEMENTS).default("section"),
  experience: z.array(experienceSchema).max(50).default([]),
  organizations: z.array(organizationSchema).max(50).default([]),
  education: z.array(educationSchema).max(50).default([]),
  skills: skillsField,
  projects: z.array(projectSchema).max(50).default([]),
  certifications: z.array(certificationSchema).max(50).default([]),
  languages: z.array(languageSchema).max(50).default([]),
  customSections: z.array(customSectionSchema).max(20).default([]),
});

// Drafts saved before a section existed get it inserted after the section it
// follows in SECTION_IDS, so adding a section never invalidates a saved draft.
function withAllSections(value: unknown) {
  if (!Array.isArray(value)) return value;
  const known: readonly string[] = SECTION_IDS;
  const order = [...new Set(value.filter((id) => known.includes(id)))];
  SECTION_IDS.forEach((id, index) => {
    if (order.includes(id)) return;
    order.splice(index === 0 ? 0 : order.indexOf(SECTION_IDS[index - 1]) + 1, 0, id);
  });
  return order;
}

export const styleSchema = z.object({
  font: z.enum(FONTS),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  spacing: z.enum(SPACINGS),
  headingStyle: z.enum(HEADING_STYLES),
  headerAlign: z.enum(HEADER_ALIGNS),
  sectionOrder: z.preprocess(withAllSections, z.array(z.enum(SECTION_IDS)).length(SECTION_IDS.length)),
});

// Lenient on purpose: a draft or an imported backup may still be incomplete.
export const cvSchema = z.object({
  version: z.literal(1),
  language: z.enum(["id", "en"]),
  mode: z.enum(["template", "custom"]),
  templateId: z.string(),
  style: styleSchema,
  content: contentSchema,
});

// Messages are keys into the `errors` dictionary in i18n.ts.
export const requiredFieldsSchema = z.object({
  personal: z.looseObject({
    fullName: z.string().trim().min(1, "required"),
    email: z.string().trim().min(1, "required").pipe(z.email("invalidEmail")),
  }),
});

export type CvData = z.infer<typeof cvSchema>;
export type CvContent = z.infer<typeof contentSchema>;
export type CvPhoto = z.infer<typeof photoSchema>;
export type CvSkill = z.infer<typeof skillSchema>;
export type SkillFormat = (typeof SKILL_FORMATS)[number];
export type CvStyle = z.infer<typeof styleSchema>;
export type Language = CvData["language"];
export type SectionId = (typeof SECTION_IDS)[number];
export type SummaryPlacement = (typeof SUMMARY_PLACEMENTS)[number];
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];
