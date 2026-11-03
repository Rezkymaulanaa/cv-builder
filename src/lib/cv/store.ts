import { create } from "zustand";
import { persist } from "zustand/middleware";
import { emptyContent, emptyCv } from "./defaults";
import { cvSchema, type CvContent, type CvData, type CvStyle, type Language } from "./schema";
import { CUSTOM_BASE_TEMPLATE, TEMPLATES, type TemplateId } from "./templates";

type CvStore = {
  cv: CvData;
  setLanguage: (language: Language) => void;
  setContent: (content: CvContent) => void;
  useTemplate: (templateId: TemplateId) => void;
  startCustom: () => void;
  setStyle: (style: Partial<CvStyle>) => void;
  replace: (cv: CvData) => void;
  clearContent: () => void;
};

export const useCvStore = create<CvStore>()(
  persist(
    (set) => ({
      cv: emptyCv(),
      setLanguage: (language) => set(({ cv }) => ({ cv: { ...cv, language } })),
      setContent: (content) => set(({ cv }) => ({ cv: { ...cv, content } })),
      useTemplate: (templateId) =>
        set(({ cv }) => ({
          cv: { ...cv, mode: "template", templateId, style: structuredClone(TEMPLATES[templateId]) },
        })),
      startCustom: () =>
        set(({ cv }) => ({
          cv: {
            ...cv,
            mode: "custom",
            templateId: CUSTOM_BASE_TEMPLATE,
            style: structuredClone(TEMPLATES[CUSTOM_BASE_TEMPLATE]),
          },
        })),
      setStyle: (style) =>
        set(({ cv }) => ({ cv: { ...cv, mode: "custom", style: { ...cv.style, ...style } } })),
      replace: (cv) => set({ cv }),
      clearContent: () => set(({ cv }) => ({ cv: { ...cv, content: emptyContent() } })),
    }),
    {
      name: "cv-builder-draft",
      // Rehydrated from an effect so the server and first client render match.
      skipHydration: true,
      partialize: ({ cv }) => ({ cv }),
      merge: (persisted, current) => {
        const parsed = cvSchema.safeParse((persisted as { cv?: unknown } | undefined)?.cv);
        return parsed.success ? { ...current, cv: parsed.data } : current;
      },
    },
  ),
);
