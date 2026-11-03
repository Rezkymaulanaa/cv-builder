"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { ArrowRight, Check, ChevronDown, FileText, Plus } from "./icons";
import { Logo } from "./Logo";
import { PdfCanvas } from "./PdfCanvas";
import { emptyCv, sampleContent } from "@/lib/cv/defaults";
import { dictionaries, type Dictionary } from "@/lib/cv/i18n";
import type { CvData, Language } from "@/lib/cv/schema";
import { useCvStore } from "@/lib/cv/store";
import { TEMPLATE_IDS, type TemplateId } from "@/lib/cv/templates";
import { useHydrated } from "@/lib/cv/useHydrated";
import { extractPdfLines, renderCvPdf } from "@/lib/pdf/client";

const DEMO_DELAY_MS = 300;

function sampleCv(language: Language, templateId: TemplateId): CvData {
  return { ...emptyCv(language, templateId), content: sampleContent(language) };
}

function LanguageSwitch({ language, t, onChange }: { language: Language; t: Dictionary; onChange: (value: Language) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span id="cv-language-label" className="text-sm font-medium text-muted">
        {t.home.languageLabel}
      </span>
      <div role="group" aria-labelledby="cv-language-label" className="inline-flex rounded-xl border border-line bg-surface p-1 shadow-card">
        {(["id", "en"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={language === option}
            onClick={() => onChange(option)}
            className={`min-h-9 rounded-lg px-3.5 text-sm font-medium transition-colors ${
              language === option ? "bg-ink text-white" : "text-muted hover:bg-ink/5 hover:text-ink"
            }`}
          >
            <span lang={option}>{option === "id" ? "Bahasa Indonesia" : "English"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// A working slice of the editor: type a name and watch the real PDF and its ATS text change.
function HeroDemo({ language, t }: { language: Language; t: Dictionary }) {
  const [name, setName] = useState("Budi Santoso");
  const [headline, setHeadline] = useState("Product Manager");
  const [view, setView] = useState<"pdf" | "ats">("pdf");
  const [lines, setLines] = useState<string[]>([]);
  const id = useId();

  const cv = useMemo(() => {
    const base = sampleCv(language, "modern");
    return { ...base, content: { ...base.content, personal: { ...base.content.personal, fullName: name, headline } } };
  }, [language, name, headline]);

  useEffect(() => {
    if (view !== "ats") return;
    let active = true;
    const timer = setTimeout(() => {
      renderCvPdf(cv)
        .then(extractPdfLines)
        .then((extracted) => active && setLines(extracted))
        .catch((error) => console.error(error));
    }, DEMO_DELAY_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [cv, view]);

  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-surface shadow-page">
      <figcaption className="sr-only">{t.home.visual.caption}</figcaption>
      <div className="border-b border-line p-4 sm:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{t.home.demo.label}</p>
          <p className="text-xs text-subtle">{t.home.demo.hint}</p>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-name`} className="mb-1 block text-xs font-medium text-muted">
              {t.home.demo.name}
            </label>
            <input id={`${id}-name`} value={name} onChange={(event) => setName(event.target.value)} className="input py-2" />
          </div>
          <div>
            <label htmlFor={`${id}-headline`} className="mb-1 block text-xs font-medium text-muted">
              {t.home.demo.headline}
            </label>
            <input id={`${id}-headline`} value={headline} onChange={(event) => setHeadline(event.target.value)} className="input py-2" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 bg-canvas px-4 pt-3 sm:px-5">
        <div role="group" aria-label={t.home.demo.views} className="inline-flex rounded-lg bg-ink/5 p-0.5">
          {(["pdf", "ats"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => setView(option)}
              className={`min-h-8 rounded-md px-3 text-xs font-medium transition-colors ${
                view === option ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink"
              }`}
            >
              {option === "pdf" ? t.home.demo.viewPdf : t.home.demo.viewAts}
            </button>
          ))}
        </div>
        <span className="hidden items-center gap-1.5 text-xs text-muted sm:inline-flex">
          <span className="grid size-4 place-items-center rounded-full bg-success text-white" aria-hidden="true">
            <Check className="size-2.5" strokeWidth={3.5} />
          </span>
          A4 · PDF
        </span>
      </div>

      <div className="relative h-96 overflow-hidden bg-canvas px-4 pt-3 sm:h-[26rem] sm:px-8">
        {view === "pdf" ? (
          <>
            <PdfCanvas cv={cv} delay={DEMO_DELAY_MS} firstPageOnly loadingLabel={t.builder.previewLoading} errorLabel={t.builder.renderFailed} />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-canvas to-transparent" />
          </>
        ) : (
          <div
            role="region"
            aria-label={t.home.demo.atsRegion}
            tabIndex={0}
            className="h-full overflow-y-auto rounded-t-lg border border-b-0 border-line bg-surface p-4"
          >
            <ol className="font-mono text-xs leading-relaxed text-ink">
              {lines.map((line, index) => (
                <li key={index} className="flex gap-3">
                  <span aria-hidden="true" className="w-5 shrink-0 text-right text-subtle tabular-nums">
                    {index + 1}
                  </span>
                  <span className="min-w-0 break-words">{line}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </figure>
  );
}

function Facts({ t }: { t: Dictionary }) {
  return (
    <dl className="grid grid-cols-2 border-t border-line lg:grid-cols-4">
      {t.home.facts.map((fact, index) => (
        <div
          key={fact.label}
          className={`flex flex-col-reverse gap-2 px-6 py-8 lg:px-10 ${index % 2 === 1 ? "border-l border-line" : ""} ${
            index >= 2 ? "border-t border-line lg:border-t-0" : ""
          } ${index === 2 ? "lg:border-l" : ""}`}
        >
          <dt className="text-sm text-muted">{fact.label}</dt>
          <dd className="font-display text-5xl leading-none text-ink">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ShowcaseCard({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <li className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-2">
      <div aria-hidden="true" className="grid h-52 place-items-center overflow-hidden rounded-xl bg-white/[0.04] p-5 ring-1 ring-white/5">
        {children}
      </div>
      <div className="p-4 pt-5">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/70">{body}</p>
      </div>
    </li>
  );
}

function Showcase({ t }: { t: Dictionary }) {
  const { showcase } = t.home;
  return (
    <section id="cara-kerja" aria-labelledby="showcase-title" className="scroll-mt-16 bg-ink px-6 py-20 text-white sm:py-24 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
        <h2 id="showcase-title" className="max-w-md font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl">
          {showcase.title}
        </h2>
        <p className="max-w-md text-base leading-relaxed text-white/70 lg:justify-self-end">{showcase.subtitle}</p>
      </div>

      <ul className="mt-14 grid gap-4 md:grid-cols-3">
        <ShowcaseCard title={showcase.bullets.title} body={showcase.bullets.body}>
          <div className="w-full rounded-xl bg-surface p-3 shadow-float">
            <p className="mb-2 text-[11px] font-medium text-muted">{t.fields.responsibilities}</p>
            <ul className="space-y-1.5 rounded-lg border border-primary px-3 py-2.5 ring-4 ring-primary/15">
              {showcase.bullets.demo.map((line, index) => (
                <li key={line} className="flex items-center gap-2 text-[11px] text-ink">
                  <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="truncate">{line}</span>
                  {index === showcase.bullets.demo.length - 1 ? <span className="h-3.5 w-px shrink-0 bg-ink" /> : null}
                </li>
              ))}
            </ul>
          </div>
        </ShowcaseCard>

        <ShowcaseCard title={showcase.photo.title} body={showcase.photo.body}>
          <div className="relative grid h-full w-full place-items-center rounded-lg bg-[#1c1c22]">
            <div className="relative aspect-[4/5] h-[85%] overflow-hidden rounded-sm bg-linear-to-b from-[#6b6b74] to-[#3f3f46] outline outline-2 outline-white">
              <div className="absolute left-1/2 top-[22%] size-[36%] -translate-x-1/2 rounded-full bg-[#d4d4d8]" />
              <div className="absolute -bottom-[18%] left-1/2 h-[48%] w-[82%] -translate-x-1/2 rounded-t-full bg-[#d4d4d8]" />
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                {Array.from({ length: 9 }, (_, index) => (
                  <span key={index} className="border-[0.5px] border-white/40" />
                ))}
              </div>
            </div>
            <span className="absolute bottom-2 right-2 rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/80">4:5</span>
          </div>
        </ShowcaseCard>

        <ShowcaseCard title={showcase.language.title} body={showcase.language.body}>
          <ul className="w-full space-y-2">
            {showcase.language.demo.map(([from, to]) => (
              <li key={from} className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-[11px] shadow-float">
                <span className="min-w-0 flex-1 truncate font-medium text-ink">{from}</span>
                <ArrowRight className="size-3 shrink-0 text-subtle" />
                <span className="min-w-0 flex-1 truncate text-right font-medium text-primary">{to}</span>
              </li>
            ))}
          </ul>
        </ShowcaseCard>
      </ul>
    </section>
  );
}

function TemplatePicker({ language, t, onUse, onCustom }: { language: Language; t: Dictionary; onUse: (id: TemplateId) => void; onCustom: () => void }) {
  const [selected, setSelected] = useState<TemplateId>("modern");
  const cv = useMemo(() => sampleCv(language, selected), [language, selected]);
  const name = t.templates[selected].name;

  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div>
        <ul aria-label={t.home.picker.label} className="space-y-2">
          {TEMPLATE_IDS.map((id) => {
            const current = id === selected;
            return (
              <li key={id}>
                <button
                  type="button"
                  aria-pressed={current}
                  aria-controls="template-preview"
                  onClick={() => setSelected(id)}
                  className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-[border-color,background-color,box-shadow] ${
                    current ? "border-ink bg-surface shadow-float" : "border-transparent hover:border-line hover:bg-surface/60"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-colors ${
                      current ? "border-ink bg-ink text-white" : "border-field"
                    }`}
                  >
                    {current ? <Check className="size-3" strokeWidth={3} /> : null}
                  </span>
                  <span>
                    <span className="block text-base font-semibold text-ink">{t.templates[id].name}</span>
                    <span className="mt-0.5 block text-sm text-muted">{t.templates[id].description}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={onCustom}
          className="mt-4 flex w-full items-center gap-4 rounded-2xl border border-dashed border-field p-4 text-left transition-colors hover:border-primary hover:bg-primary-soft"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-white">
            <Plus />
          </span>
          <span>
            <span className="block text-base font-semibold text-ink">{t.home.templates.newCvTitle}</span>
            <span className="mt-0.5 block text-sm text-muted">{t.home.templates.newCvBody}</span>
          </span>
        </button>
      </div>

      <div
        id="template-preview"
        role="region"
        aria-label={t.home.picker.preview(name)}
        className="overflow-hidden rounded-2xl border border-line bg-canvas"
      >
        <div className="relative h-[30rem] overflow-hidden px-6 pt-8 sm:h-[34rem] sm:px-14">
          <PdfCanvas cv={cv} firstPageOnly loadingLabel={t.builder.previewLoading} errorLabel={t.builder.renderFailed} />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-canvas to-transparent" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface px-5 py-4">
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink">{name}</span> · {t.templates[selected].description}
          </p>
          <button type="button" onClick={() => onUse(selected)} className="btn-primary">
            {t.home.templates.useTemplate}
            <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ id, title, subtitle }: { id: string; title: string; subtitle?: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-end">
      <h2 id={id} className="max-w-md font-display text-4xl leading-[1.05] tracking-tight text-balance text-ink sm:text-5xl">
        {title}
      </h2>
      {subtitle ? <p className="max-w-md text-base leading-relaxed text-muted lg:justify-self-end">{subtitle}</p> : null}
    </div>
  );
}

export function Home() {
  const router = useRouter();
  const hydrated = useHydrated();
  const storedLanguage = useCvStore((state) => state.cv.language);
  const fullName = useCvStore((state) => state.cv.content.personal.fullName);
  const hasDraft = useCvStore((state) => JSON.stringify(state.cv.content) !== JSON.stringify(emptyCv().content));
  const { setLanguage, useTemplate: applyTemplate, startCustom } = useCvStore.getState();

  const language = hydrated ? storedLanguage : "id";
  const t = dictionaries[language];
  const draft = hydrated && hasDraft;
  const start = () => router.push("/builder");

  const navLinks = [
    { href: "#cara-kerja", label: t.home.nav.features },
    { href: "#template", label: t.home.nav.templates },
    { href: "#faq", label: t.home.nav.faq },
  ];

  return (
    <div lang={language} className="relative overflow-x-clip">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t.home.skip}
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 border-x border-line px-6 lg:px-10">
          <Logo />
          <nav aria-label={t.home.nav.label} className="hidden md:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-ink">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            {draft ? (
              <button type="button" onClick={start} className="btn-ghost hidden sm:inline-flex">
                {t.home.resume}
              </button>
            ) : null}
            <button type="button" onClick={start} className="btn-primary">
              {t.home.start}
            </button>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto max-w-6xl border-x border-line outline-none">
        <section aria-labelledby="hero-title" className="grid items-center gap-12 px-6 py-14 sm:py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:px-10">
          <div>
            <p className="text-sm font-medium text-subtle">{t.home.badge}</p>
            <h1 id="hero-title" className="mt-5 font-display text-[44px] leading-[1.02] tracking-tight sm:text-6xl xl:text-[64px]">
              <span className="block text-balance text-subtle">{t.home.titleLead}</span>
              <span className="block text-balance text-ink">{t.home.titleMain}</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">{t.home.subtitle}</p>

            <div className="mt-8">
              <LanguageSwitch language={language} t={t} onChange={setLanguage} />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button type="button" onClick={start} className="btn-primary min-h-12 px-6 text-base">
                {t.home.primaryCta}
                <ArrowRight />
              </button>
              <a href="#template" className="btn-secondary min-h-12 px-6 text-base">
                <FileText />
                {t.home.secondaryCta}
              </a>
            </div>

            {draft ? (
              <div className="mt-8 flex max-w-lg flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
                <p className="text-sm text-muted">
                  {t.home.resumeHint} <strong className="font-semibold text-ink">{fullName || t.home.untitled}</strong>
                  <span className="block text-xs text-subtle">{t.home.keepsData}</span>
                </p>
                <button type="button" onClick={start} className="btn-secondary">
                  {t.home.resume}
                  <ArrowRight />
                </button>
              </div>
            ) : null}
          </div>

          <HeroDemo language={language} t={t} />
        </section>

        <Facts t={t} />

        <Showcase t={t} />

        <section id="template" aria-labelledby="templates-title" className="scroll-mt-16 px-6 py-20 sm:py-24 lg:px-10">
          <SectionHeading id="templates-title" title={t.home.templates.title} subtitle={t.home.templates.subtitle} />
          <TemplatePicker
            language={language}
            t={t}
            onUse={(id) => {
              applyTemplate(id);
              start();
            }}
            onCustom={() => {
              startCustom();
              router.push("/builder?step=design");
            }}
          />
        </section>

        <section id="faq" aria-labelledby="faq-title" className="scroll-mt-16 border-t border-line bg-surface px-6 py-20 sm:py-24 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
            <h2 id="faq-title" className="max-w-sm font-display text-4xl leading-[1.05] tracking-tight text-balance text-ink sm:text-5xl">
              {t.home.faq.title}
            </h2>
            <div className="divide-y divide-line border-y border-line">
              {t.home.faq.items.map((item) => (
                <details key={item.q} className="group">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-medium text-ink [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line transition-colors group-open:border-ink group-open:bg-ink group-open:text-white">
                      <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                    </span>
                  </summary>
                  <p className="pb-6 pr-12 text-sm leading-relaxed text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="cta-title" className="grid gap-8 border-t border-line px-6 py-16 sm:py-20 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:px-10">
          <div>
            <h2 id="cta-title" className="max-w-xl font-display text-4xl leading-[1.05] tracking-tight text-balance text-ink sm:text-5xl">
              {t.home.cta.title}
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">{t.home.cta.body}</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <button type="button" onClick={start} className="btn-primary min-h-12 px-6 text-base">
              {t.home.primaryCta}
              <ArrowRight />
            </button>
            <a href="#template" className="btn-secondary min-h-12 px-6 text-base">
              {t.home.secondaryCta}
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 border-x border-line px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div className="flex flex-col gap-2">
            <Logo />
            <p className="text-sm text-subtle">{t.home.footer}</p>
          </div>
          <nav aria-label={t.home.nav.footerLabel}>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-muted transition-colors hover:text-ink">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
