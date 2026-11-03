"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { CvForm, type FormStep } from "./CvForm";
import { DesignPanel } from "./DesignPanel";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  Download,
  FileText,
  GraduationCap,
  Layers,
  More,
  Palette,

  Star,
  Trash,
  Upload,
  User,
  X,
} from "./icons";
import { Logo } from "./Logo";
import { PdfCanvas } from "./PdfCanvas";
import { sampleContent } from "@/lib/cv/defaults";
import { dictionaries } from "@/lib/cv/i18n";
import { cvSchema, requiredFieldsSchema, type CvContent } from "@/lib/cv/schema";
import { useCvStore } from "@/lib/cv/store";
import { findUnsupportedChars } from "@/lib/pdf/charset";
import { renderCvPdf } from "@/lib/pdf/client";

const STEPS = ["personal", "experience", "education", "skills", "extras", "design"] as const;
type Step = (typeof STEPS)[number];

const STEP_ICONS = {
  personal: User,
  experience: Briefcase,
  education: GraduationCap,
  skills: Star,
  extras: Layers,
  design: Palette,
} satisfies Record<Step, unknown>;

const PREVIEW_DELAY_MS = 500;
const LONG_CV_PAGES = 2;

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function fileSlug(name: string) {
  return name.trim().replace(/[^\p{L}\p{N}]+/gu, "_") || "draft";
}

export function Builder({ initialStep }: { initialStep?: string }) {
  const cv = useCvStore((state) => state.cv);
  const { setContent, replace, clearContent } = useCvStore.getState();
  const t = dictionaries[cv.language];

  const [step, setStep] = useState<Step>(STEPS.find((item) => item === initialStep) ?? "personal");
  const [tab, setTab] = useState<"form" | "preview">("form");
  const [pages, setPages] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");
  const importInput = useRef<HTMLInputElement>(null);
  const formTop = useRef<HTMLElement>(null);
  const stepHeading = useRef<HTMLHeadingElement>(null);

  const form = useForm<CvContent>({
    defaultValues: cv.content,
    resolver: zodResolver(requiredFieldsSchema) as never,
    mode: "onTouched",
  });

  useEffect(
    () =>
      form.subscribe({
        formState: { values: true },
        callback: ({ values }) => {
          setContent(values);
          setMessage("");
        },
      }),
    [form, setContent],
  );

  const stepIndex = STEPS.indexOf(step);
  // The photo is base64 image data, not text that goes through the PDF font.
  const unsupported = useMemo(() => findUnsupportedChars({ ...cv.content, photo: null }), [cv.content]);

  const loadContent = (content: CvContent) => {
    form.reset(content);
    setContent(content);
    setMessage("");
  };

  const exportPdf = async () => {
    setMessage("");
    if (!(await form.trigger())) {
      setStep("personal");
      setTab("form");
      setMessage(t.builder.fixErrors);
      return;
    }
    setExporting(true);
    try {
      const bytes = await renderCvPdf(useCvStore.getState().cv);
      download(new Blob([bytes], { type: "application/pdf" }), `CV_${fileSlug(cv.content.personal.fullName)}.pdf`);
    } catch (error) {
      console.error(error);
      setMessage(t.builder.renderFailed);
    } finally {
      setExporting(false);
    }
  };

  const exportBackup = () => {
    const json = JSON.stringify(useCvStore.getState().cv, null, 2);
    download(new Blob([json], { type: "application/json" }), `CV_${fileSlug(cv.content.personal.fullName)}.json`);
  };

  const importBackup = async (file: File) => {
    setMessage("");
    try {
      const parsed = cvSchema.parse(JSON.parse(await file.text()));
      replace(parsed);
      form.reset(parsed.content);
    } catch {
      setMessage(t.builder.importFailed);
    }
  };

  const goTo = (next: Step) => {
    setStep(next);
    // Brings the new step into view and gives keyboard users a starting point.
    requestAnimationFrame(() => {
      stepHeading.current?.focus({ preventScroll: true });
      formTop.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  };

  const menuItems = [
    {
      label: t.builder.sample,
      icon: <FileText />,
      onSelect: () => window.confirm(t.builder.confirmSample) && loadContent(sampleContent(cv.language)),
    },
    { label: t.builder.backupExport, icon: <Download />, onSelect: exportBackup },
    { label: t.builder.backupImport, icon: <Upload />, onSelect: () => importInput.current?.click() },
    {
      label: t.builder.clear,
      icon: <Trash />,
      danger: true,
      onSelect: () => {
        if (window.confirm(t.builder.confirmClear)) {
          clearContent();
          form.reset(useCvStore.getState().cv.content);
        }
      },
    },
  ];

  return (
    <div lang={cv.language} className="flex min-h-dvh flex-col">
      <a
        href="#builder-form"
        className="sr-only z-50 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t.builder.skip}
      </a>

      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Logo />
            <span aria-hidden="true" className="hidden h-6 w-px bg-line sm:block" />
            <p className="hidden items-center gap-2 text-xs text-muted sm:flex" title={t.builder.autosaveLong}>
              <span className="grid size-4 place-items-center rounded-full bg-success text-white">
                <Check className="size-2.5" strokeWidth={3.5} />
              </span>
              {t.builder.autosave}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MoreMenu label={t.builder.more} items={menuItems} />
            <input
              ref={importInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              tabIndex={-1}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void importBackup(file);
              }}
            />
            <button type="button" className="btn-primary" disabled={exporting} onClick={exportPdf}>
              <Download />
              {exporting ? t.builder.generating : t.builder.downloadPdf}
            </button>
          </div>
        </div>
        <div className="px-4 pb-3 lg:hidden">
          <div role="group" aria-label={t.builder.previewTab} className="grid grid-cols-2 rounded-xl bg-canvas p-1">
            {(["form", "preview"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={tab === option}
                onClick={() => setTab(option)}
                className={`min-h-9 rounded-lg text-sm font-medium transition-colors ${
                  tab === option ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink"
                }`}
              >
                {option === "form" ? t.builder.formTab : t.builder.previewTab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {message ? (
        <div className="border-b border-danger/20 bg-danger-soft px-4 py-3 sm:px-6" role="alert">
          <p className="flex items-center gap-2 text-sm font-medium text-danger">
            <X className="size-4" />
            {message}
          </p>
        </div>
      ) : null}

      <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <main
          id="builder-form"
          ref={formTop}
          tabIndex={-1}
          className={`min-w-0 scroll-mt-32 px-4 py-6 outline-none sm:px-8 sm:py-8 lg:scroll-mt-20 ${tab === "form" ? "" : "hidden lg:block"}`}
        >
          <div className="mx-auto max-w-2xl">
            <nav aria-label={t.builder.formTab}>
              <p className="mb-3 text-xs font-medium text-subtle">
                <span>{t.builder.stepOf(stepIndex + 1, STEPS.length)}</span>
              </p>
              <div aria-hidden="true" className="mb-4 h-1 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                  style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
                />
              </div>
              <ol className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                {STEPS.map((item, index) => {
                  const StepIcon = STEP_ICONS[item];
                  const current = step === item;
                  return (
                    <li key={item}>
                      <button
                        type="button"
                        aria-current={current ? "step" : undefined}
                        onClick={() => goTo(item)}
                        className={`flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-xl border px-1 text-xs font-medium transition-colors ${
                          current
                            ? "border-ink bg-ink text-white shadow-float"
                            : index < stepIndex
                              ? "border-line bg-surface text-ink hover:border-field"
                              : "border-line bg-surface text-muted hover:border-field hover:text-ink"
                        }`}
                      >
                        <StepIcon className="size-4" />
                        <span className="max-w-full truncate">
                          <span className="sr-only">{index + 1}. </span>
                          {t.builder.steps[item]}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>

            <header className="mt-8">
              <h1 ref={stepHeading} tabIndex={-1} className="font-display text-4xl leading-tight tracking-tight text-ink outline-none sm:text-5xl">
                {t.builder.steps[step]}
              </h1>
              <p className="mt-2 text-muted">{t.builder.stepDescriptions[step]}</p>
            </header>

            <div key={step} className="mt-8 animate-rise">
              {step === "design" ? <DesignPanel cv={cv} t={t} /> : <CvForm form={form} t={t} step={step as FormStep} />}
            </div>

            {unsupported.length ? (
              <p
                className="mt-6 rounded-xl border border-warning-ink/20 bg-warning-soft p-4 text-sm text-warning-ink"
                role="alert"
              >
                {t.builder.unsupportedChars(unsupported.join(" "))}
              </p>
            ) : null}

            <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
              <button
                type="button"
                className="btn-secondary"
                disabled={stepIndex === 0}
                onClick={() => goTo(STEPS[stepIndex - 1])}
              >
                <ArrowLeft />
                {t.builder.previous}
              </button>
              {stepIndex < STEPS.length - 1 ? (
                <button type="button" className="btn-primary" onClick={() => goTo(STEPS[stepIndex + 1])}>
                  {t.builder.nextTo(t.builder.steps[STEPS[stepIndex + 1]])}
                  <ArrowRight />
                </button>
              ) : null}
            </div>
          </div>
        </main>

        <aside
          aria-label={t.builder.previewTab}
          // Scrollable on its own, so keyboard users need to be able to focus it.
          tabIndex={0}
          className={`dotted relative min-w-0 border-line bg-canvas lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:overflow-y-auto lg:border-l ${
            tab === "preview" ? "" : "hidden lg:block"
          }`}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 sm:px-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink shadow-card">

              {t.builder.livePreview}
            </p>
            <p className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted shadow-card" role="status">
              {pages ? t.builder.pages(pages) : t.builder.previewLoading}
            </p>
          </div>
          {pages > LONG_CV_PAGES ? (
            <p className="mx-4 rounded-xl border border-warning-ink/20 bg-warning-soft px-4 py-2.5 text-sm text-warning-ink sm:mx-8">
              {t.builder.pagesHint}
            </p>
          ) : null}
          <div className="mx-auto max-w-170 px-4 pb-10 pt-3 sm:px-8">
            <PdfCanvas
              cv={cv}
              delay={PREVIEW_DELAY_MS}
              loadingLabel={t.builder.previewLoading}
              errorLabel={t.builder.renderFailed}
              onPages={setPages}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

type MenuItem = { label: string; icon: ReactNode; onSelect: () => void; danger?: boolean };

// A disclosure menu: a list of buttons that opens below its trigger.
function MoreMenu({ label, items }: { label: string; items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls="builder-more-menu"
        onClick={() => setOpen((value) => !value)}
        className="btn-secondary"
      >
        <More />
        <span className="hidden sm:inline">{label}</span>
        <span className="sr-only sm:hidden">{label}</span>
      </button>
      <ul
        id="builder-more-menu"
        hidden={!open}
        className="absolute right-0 top-full z-40 mt-2 w-60 animate-rise rounded-2xl border border-line bg-surface p-1.5 shadow-float [animation-duration:0.18s]"
      >
        {items.map((item) => (
          <li key={item.label}>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition-colors ${
                item.danger ? "text-danger hover:bg-danger-soft" : "text-ink hover:bg-canvas"
              }`}
            >
              <span className={item.danger ? "text-danger" : "text-subtle"}>{item.icon}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
