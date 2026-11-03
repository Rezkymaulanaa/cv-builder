"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, Palette } from "./icons";
import type { Dictionary } from "@/lib/cv/i18n";
import { summaryInHeader } from "@/lib/cv/layout";
import { FONTS, HEADER_ALIGNS, HEADING_STYLES, SPACINGS, type CvData, type CvStyle, type SectionId } from "@/lib/cv/schema";
import { useCvStore } from "@/lib/cv/store";
import { ACCENT_COLORS, TEMPLATE_IDS } from "@/lib/cv/templates";

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label}>
      <p className="label" aria-hidden="true">
        {label}
      </p>
      {children}
    </div>
  );
}

function Options<T extends string>({
  label,
  options,
  value,
  labels,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  labels: Record<T, string>;
  onChange: (value: T) => void;
}) {
  return (
    <Group label={label}>
      <div className="inline-flex flex-wrap gap-1 rounded-xl bg-canvas p-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={`min-h-9 rounded-lg px-3.5 text-sm font-medium transition-colors ${
              value === option ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink"
            }`}
          >
            {labels[option]}
          </button>
        ))}
      </div>
    </Group>
  );
}

export function DesignPanel({ cv, t }: { cv: CvData; t: Dictionary }) {
  const { useTemplate: applyTemplate, setStyle } = useCvStore.getState();
  const { style } = cv;
  const set = (patch: Partial<CvStyle>) => setStyle(patch);

  const moveSection = (index: number, offset: number) => {
    const order: SectionId[] = [...style.sectionOrder];
    const [item] = order.splice(index, 1);
    order.splice(index + offset, 0, item);
    set({ sectionOrder: order });
  };

  return (
    <div className="space-y-10">
      <section aria-labelledby="design-template">
        <h2 id="design-template" className="text-lg font-semibold tracking-tight text-ink">
          {t.design.template}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {TEMPLATE_IDS.map((id) => {
            const selected = cv.mode === "template" && cv.templateId === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => applyTemplate(id)}
                className={`relative flex min-h-20 flex-col items-start rounded-2xl border p-4 text-left transition-[border-color,box-shadow,background-color] ${
                  selected
                    ? "border-primary bg-primary-soft shadow-[0_0_0_1px_var(--color-primary)]"
                    : "border-line bg-surface shadow-card hover:border-field"
                }`}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ink">{t.templates[id].name}</span>
                  {selected ? (
                    <span aria-hidden="true" className="grid size-5 place-items-center rounded-full bg-primary text-white">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 text-xs leading-relaxed text-muted">{t.templates[id].description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="design-customize" className="card p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <Palette className="size-5" />
          </span>
          <div>
            <h2 id="design-customize" className="text-lg font-semibold tracking-tight text-ink">
              {t.design.customize}
            </h2>
            <p className="mt-1 text-sm text-muted">{t.design.atsNote}</p>
          </div>
        </div>

        {cv.mode !== "custom" ? (
          <button type="button" className="btn-primary mt-5" onClick={() => set({})}>
            {t.design.useCustom}
          </button>
        ) : (
          <div className="mt-6 space-y-6">
            <Options label={t.design.font} options={FONTS} value={style.font} labels={t.design.fonts} onChange={(font) => set({ font })} />
            <Group label={t.design.accent}>
              <div className="flex flex-wrap gap-3">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={t.design.accentNames[color] ?? color}
                    title={t.design.accentNames[color] ?? color}
                    aria-pressed={style.accent === color}
                    onClick={() => set({ accent: color })}
                    className={`grid size-10 place-items-center rounded-full text-white transition-transform hover:scale-105 ${
                      style.accent === color ? "ring-2 ring-ink ring-offset-2 ring-offset-surface" : ""
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {style.accent === color ? <Check className="size-4" strokeWidth={3} /> : null}
                  </button>
                ))}
              </div>
            </Group>
            <Options
              label={t.design.spacing}
              options={SPACINGS}
              value={style.spacing}
              labels={t.design.spacings}
              onChange={(spacing) => set({ spacing })}
            />
            <Options
              label={t.design.headingStyle}
              options={HEADING_STYLES}
              value={style.headingStyle}
              labels={t.design.headingStyles}
              onChange={(headingStyle) => set({ headingStyle })}
            />
            <Options
              label={t.design.headerAlign}
              options={HEADER_ALIGNS}
              value={style.headerAlign}
              labels={t.design.headerAligns}
              onChange={(headerAlign) => set({ headerAlign })}
            />
            <div>
              <h3 className="label">{t.design.order}</h3>
              <ol className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                {style.sectionOrder.map((id, index) => (
                  <li key={id} className="flex items-center justify-between gap-2 bg-surface py-1.5 pl-4 pr-1.5 text-sm">
                    <span className="flex min-w-0 items-center gap-3">
                      <span aria-hidden="true" className="w-4 text-xs font-medium tabular-nums text-subtle">
                        {index + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="text-ink">{t.sections[id]}</span>
                        {id === "summary" && summaryInHeader(cv) ? (
                          <span className="block text-xs text-subtle">{t.design.summaryInHeader}</span>
                        ) : null}
                      </span>
                    </span>
                    <span className="flex shrink-0">
                      <button
                        type="button"
                        className="btn-icon"
                        aria-label={`${t.builder.moveUp}: ${t.sections[id]}`}
                        disabled={index === 0}
                        onClick={() => moveSection(index, -1)}
                      >
                        <ArrowUp />
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        aria-label={`${t.builder.moveDown}: ${t.sections[id]}`}
                        disabled={index === style.sectionOrder.length - 1}
                        onClick={() => moveSection(index, 1)}
                      >
                        <ArrowDown />
                      </button>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
