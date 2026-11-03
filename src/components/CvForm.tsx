"use client";

import { useState, type ReactNode } from "react";
import { useFieldArray, useWatch, type Path, type UseFormReturn } from "react-hook-form";
import { BulletEditor } from "./BulletEditor";
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash, X } from "./icons";
import { PhotoField } from "./PhotoField";
import { SkillDetails } from "./SkillDetails";
import type { Dictionary } from "@/lib/cv/i18n";
import { SUMMARY_PLACEMENTS, type CvContent } from "@/lib/cv/schema";

type Form = UseFormReturn<CvContent>;
type FieldKey = keyof Dictionary["fields"];

type FieldConfig = {
  name: string;
  label: FieldKey;
  type?: "text" | "month" | "textarea" | "checkbox" | "bullets" | "select" | "combo" | "skillDetails";
  hint?: FieldKey;
  // "select": value -> label, after an empty placeholder option.
  // "combo": suggestions for a free-text input.
  options?: Record<string, string>;
  placeholder?: FieldKey;
  // Spans both grid columns.
  wide?: boolean;
};

function getError(form: Form, name: string): string | undefined {
  const error = name.split(".").reduce<unknown>(
    (node, key) => (node as Record<string, unknown> | undefined)?.[key],
    form.formState.errors,
  ) as { message?: string } | undefined;
  return error?.message;
}

function Field({
  form,
  t,
  name,
  label,
  type = "text",
  hint,
  options,
  placeholder,
  wide = false,
}: FieldConfig & { form: Form; t: Dictionary }) {
  const path = name as Path<CvContent>;
  const message = getError(form, name);
  const id = `field-${name}`;

  if (type === "skillDetails") {
    return <SkillDetails form={form} name={name} id={id} t={t} />;
  }

  if (type === "checkbox") {
    return (
      <label className="flex min-h-6 w-fit cursor-pointer items-center gap-2.5 text-sm text-ink sm:col-span-2">
        <input type="checkbox" className="size-4.5 cursor-pointer rounded accent-primary" {...form.register(path)} />
        {t.fields[label]}
      </label>
    );
  }

  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = message ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const control = { id, "aria-describedby": describedBy, "aria-invalid": Boolean(message) || undefined };

  return (
    <div className={wide || type === "textarea" || type === "bullets" ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="label">
        {t.fields[label]}
      </label>
      {type === "bullets" ? (
        <BulletEditor control={form.control} name={path} id={id} label={t.fields[label]} removeLabel={t.builder.removeBullet} />
      ) : type === "textarea" ? (
        <textarea rows={4} className="input resize-y" {...control} {...form.register(path)} />
      ) : type === "combo" ? (
        <>
          <input list={`${id}-options`} className="input" autoComplete="off" {...control} {...form.register(path)} />
          <datalist id={`${id}-options`}>
            {Object.keys(options ?? {}).map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>
        </>
      ) : type === "select" ? (
        <select className="input appearance-auto" {...control} {...form.register(path)}>
          <option value="">{placeholder ? t.fields[placeholder] : ""}</option>
          {Object.entries(options ?? {}).map(([value, optionLabel]) => (
            <option key={value} value={value}>
              {optionLabel}
            </option>
          ))}
        </select>
      ) : (
        <input type={type} className="input" {...control} {...form.register(path)} />
      )}
      {hint ? (
        <p id={hintId} className="hint">
          {t.fields[hint]}
        </p>
      ) : null}
      {message ? (
        <p id={errorId} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-danger" role="alert">
          <X className="size-3.5" strokeWidth={2.5} />
          {t.errors[message] ?? message}
        </p>
      ) : null}
    </div>
  );
}

// One repeatable entry, e.g. a job. Collapsible, titled by its first field.
function EntryCard({
  form,
  t,
  name,
  index,
  count,
  fields,
  itemLabel,
  onMove,
  onRemove,
}: {
  form: Form;
  t: Dictionary;
  name: ArrayName;
  index: number;
  count: number;
  fields: FieldConfig[];
  itemLabel: FieldKey;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);
  const value = useWatch({ control: form.control, name: `${name}.${index}.${fields[0].name}` as Path<CvContent> });
  const fallback = `${t.fields[itemLabel]} ${index + 1}`;
  const title = typeof value === "string" && value.trim() ? value.trim() : fallback;
  const bodyId = `${name}-${index}-body`;

  return (
    <fieldset className="card overflow-hidden transition-shadow focus-within:shadow-float">
      <legend className="sr-only">{fallback}</legend>
      <div className="flex items-center gap-2 py-2 pl-2 pr-2 sm:pl-3">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((current) => !current)}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-xl px-2 text-left transition-colors hover:bg-canvas"
        >
          <span
            aria-hidden="true"
            className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary-soft text-xs font-semibold text-primary"
          >
            {index + 1}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{title}</span>
          <span className="sr-only">{open ? t.builder.collapse : t.builder.expand}</span>
          <ChevronDown className={`size-4 text-subtle transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            className="btn-icon"
            aria-label={`${t.builder.moveUp}: ${fallback}`}
            disabled={index === 0}
            onClick={() => onMove(index - 1)}
          >
            <ArrowUp />
          </button>
          <button
            type="button"
            className="btn-icon"
            aria-label={`${t.builder.moveDown}: ${fallback}`}
            disabled={index === count - 1}
            onClick={() => onMove(index + 1)}
          >
            <ArrowDown />
          </button>
          <button
            type="button"
            className="btn-icon hover:bg-danger-soft hover:text-danger"
            aria-label={`${t.builder.remove}: ${fallback}`}
            onClick={onRemove}
          >
            <Trash />
          </button>
        </div>
      </div>
      <div id={bodyId} hidden={!open} className="border-t border-line p-4 sm:p-5">
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          {fields.map((field) => (
            <Field key={field.name} form={form} t={t} {...field} name={`${name}.${index}.${field.name}`} />
          ))}
        </div>
      </div>
    </fieldset>
  );
}

type ArrayName =
  | "experience"
  | "organizations"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "customSections";

function EntryList({
  form,
  t,
  name,
  title,
  fields,
  blank,
  itemLabel,
}: {
  form: Form;
  t: Dictionary;
  name: ArrayName;
  title: string;
  fields: FieldConfig[];
  blank: object;
  itemLabel: FieldKey;
}) {
  const { fields: items, append, remove, move } = useFieldArray({ control: form.control, name });
  const headingId = `${name}-heading`;

  return (
    <section aria-labelledby={headingId}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={headingId} className="text-lg font-semibold tracking-tight text-ink">
          {title}
        </h2>
        {items.length ? <span className="text-xs font-medium text-subtle">{items.length}</span> : null}
      </div>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <EntryCard
            key={item.id}
            form={form}
            t={t}
            name={name}
            index={index}
            count={items.length}
            fields={fields}
            itemLabel={itemLabel}
            onMove={(to) => move(index, to)}
            onRemove={() => remove(index)}
          />
        ))}
      </div>
      <button
        type="button"
        className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-field bg-surface/60 text-sm font-medium text-muted transition-colors hover:border-primary hover:bg-primary-soft hover:text-primary"
        onClick={() => append(blank as never)}
      >
        <Plus />
        {t.builder.add}: {title}
      </button>
    </section>
  );
}

const Grid = ({ children }: { children: ReactNode }) => (
  <div className="card grid gap-x-4 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">{children}</div>
);

export type FormStep = "personal" | "experience" | "education" | "skills" | "extras";

export function CvForm({ form, t, step }: { form: Form; t: Dictionary; step: FormStep }) {
  switch (step) {
    case "personal":
      return (
        <section aria-label={t.builder.steps.personal}>
          <Grid>
            <PhotoField form={form} t={t} />
            <Field form={form} t={t} name="personal.fullName" label="fullName" />
            <Field form={form} t={t} name="personal.headline" label="headline" />
            <Field form={form} t={t} name="personal.email" label="email" />
            <Field form={form} t={t} name="personal.phone" label="phone" />
            <Field form={form} t={t} name="personal.linkedin" label="linkedin" />
            <Field form={form} t={t} name="personal.website" label="website" />
            <Field form={form} t={t} name="personal.location" label="city" />
            <Field form={form} t={t} name="personal.country" label="country" />
            <Field form={form} t={t} name="summary" label="summary" type="textarea" hint="summaryHint" />
            <fieldset className="sm:col-span-2">
              <legend className="label">{t.fields.summaryPlacement}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {SUMMARY_PLACEMENTS.map((option) => (
                  <label key={option} className="radio-card">
                    <input type="radio" value={option} className="size-4 accent-primary" {...form.register("summaryPlacement")} />
                    {t.summaryPlacements[option]}
                  </label>
                ))}
              </div>
            </fieldset>
          </Grid>
        </section>
      );
    case "experience":
      return (
        <div className="space-y-8">
          <EntryList
            form={form}
            t={t}
            name="experience"
            title={t.sections.experience}
            itemLabel="company"
            blank={{ role: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" }}
            fields={[
              { name: "company", label: "company" },
              { name: "location", label: "location" },
              { name: "role", label: "role", wide: true },
              { name: "startDate", label: "startDate", type: "month" },
              { name: "endDate", label: "endDate", type: "month" },
              { name: "current", label: "current", type: "checkbox" },
              { name: "description", label: "responsibilities", type: "bullets", hint: "responsibilitiesHint" },
            ]}
          />
          <EntryList
            form={form}
            t={t}
            name="organizations"
            title={t.sections.organizations}
            itemLabel="organization"
            blank={{
              organization: "",
              role: "",
              organizationDescription: "",
              location: "",
              startDate: "",
              endDate: "",
              current: false,
              description: "",
            }}
            fields={[
              { name: "organization", label: "organization" },
              { name: "role", label: "organizationRole" },
              {
                name: "organizationDescription",
                label: "organizationDescription",
                hint: "organizationDescriptionHint",
                wide: true,
              },
              { name: "location", label: "organizationLocation", wide: true },
              { name: "startDate", label: "startDate", type: "month" },
              { name: "endDate", label: "endDate", type: "month" },
              { name: "current", label: "current", type: "checkbox" },
              { name: "description", label: "responsibilities", type: "bullets", hint: "organizationHint" },
            ]}
          />
        </div>
      );
    case "education":
      return (
        <EntryList
          form={form}
          t={t}
          name="education"
          title={t.sections.education}
          itemLabel="school"
          blank={{
            school: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            level: "",
            degree: "",
            gpa: "",
            gpaMax: "",
            description: "",
          }}
          fields={[
            { name: "school", label: "school" },
            { name: "location", label: "location" },
            { name: "startDate", label: "startDate", type: "month" },
            { name: "endDate", label: "endDate", type: "month" },
            { name: "current", label: "current", type: "checkbox" },
            { name: "level", label: "educationLevel", type: "select", options: t.educationLevels, placeholder: "levelPlaceholder" },
            { name: "degree", label: "degree" },
            { name: "gpa", label: "gpa" },
            { name: "gpaMax", label: "gpaMax" },
            { name: "description", label: "activities", type: "bullets", hint: "activitiesHint" },
          ]}
        />
      );
    case "skills":
      return (
        <EntryList
          form={form}
          t={t}
          name="skills"
          title={t.sections.skills}
          itemLabel="skillCategory"
          blank={{ category: "", year: "", description: "", format: "text" }}
          fields={[
            {
              name: "category",
              label: "skillCategory",
              type: "combo",
              hint: "skillCategoryHint",
              options: Object.fromEntries(t.skillCategories.map((category) => [category, category])),
            },
            { name: "year", label: "skillYear", hint: "skillYearHint" },
            { name: "description", label: "skillDescription", type: "skillDetails" },
          ]}
        />
      );
    case "extras":
      return (
        <div className="space-y-8">
          <EntryList
            form={form}
            t={t}
            name="projects"
            title={t.sections.projects}
            itemLabel="projectName"
            blank={{ name: "", url: "", description: "" }}
            fields={[
              { name: "name", label: "projectName" },
              { name: "url", label: "url" },
              { name: "description", label: "description", type: "textarea", hint: "bulletsHint" },
            ]}
          />
          <EntryList
            form={form}
            t={t}
            name="certifications"
            title={t.sections.certifications}
            itemLabel="certName"
            blank={{ name: "", issuer: "", date: "" }}
            fields={[
              { name: "name", label: "certName" },
              { name: "issuer", label: "issuer" },
              { name: "date", label: "date", type: "month" },
            ]}
          />
          <EntryList
            form={form}
            t={t}
            name="languages"
            title={t.sections.languages}
            itemLabel="languageName"
            blank={{ name: "", level: "" }}
            fields={[
              { name: "name", label: "languageName" },
              { name: "level", label: "level" },
            ]}
          />
          <EntryList
            form={form}
            t={t}
            name="customSections"
            title={t.sections.custom}
            itemLabel="customTitle"
            blank={{ title: "", description: "" }}
            fields={[
              { name: "title", label: "customTitle" },
              { name: "description", label: "description", type: "textarea", hint: "bulletsHint" },
            ]}
          />
        </div>
      );
  }
}
