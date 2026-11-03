"use client";

import { useWatch, type Path, type UseFormReturn } from "react-hook-form";
import { BulletEditor } from "./BulletEditor";
import type { Dictionary } from "@/lib/cv/i18n";
import { SKILL_FORMATS, type CvContent, type SkillFormat } from "@/lib/cv/schema";
import { convertSkillDetails } from "@/lib/cv/skills";

type Props = {
  form: UseFormReturn<CvContent>;
  // The `skills.N.description` path; its format lives next to it.
  name: string;
  id: string;
  t: Dictionary;
};

export function SkillDetails({ form, name, id, t }: Props) {
  const path = name as Path<CvContent>;
  const formatPath = name.replace(/description$/, "format") as Path<CvContent>;
  const format = (useWatch({ control: form.control, name: formatPath }) as SkillFormat | undefined) ?? "text";

  const changeFormat = (next: SkillFormat) => {
    if (next === format) return;
    const value = String(form.getValues(path) ?? "");
    form.setValue(path, convertSkillDetails(value, next), { shouldDirty: true });
    form.setValue(formatPath, next, { shouldDirty: true });
  };

  return (
    <div className="sm:col-span-2">
      <label htmlFor={id} className="label">
        {t.fields.skillDescription}
      </label>
      {format === "list" ? (
        <BulletEditor
          control={form.control}
          name={path}
          id={id}
          label={t.fields.skillDescription}
          removeLabel={t.builder.removeBullet}
        />
      ) : (
        <textarea id={id} rows={3} aria-describedby={`${id}-hint`} className="input resize-y" {...form.register(path)} />
      )}
      <p id={`${id}-hint`} className="hint">
        {format === "list" ? t.fields.skillListHint : t.fields.skillDescriptionHint}
      </p>
      <fieldset className="mt-4">
        <legend className="label">{t.fields.skillFormat}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {SKILL_FORMATS.map((option) => (
            <label key={option} className="radio-card">
              <input
                type="radio"
                name={formatPath}
                value={option}
                checked={format === option}
                onChange={() => changeFormat(option)}
                className="size-4 accent-primary"
              />
              {t.skillFormats[option]}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
