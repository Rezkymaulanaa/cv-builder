"use client";

import { useEffect, useRef, useState } from "react";
import { drawPdfPages, renderCvPdf } from "@/lib/pdf/client";
import type { CvData } from "@/lib/cv/schema";

type Props = {
  cv: CvData;
  delay?: number;
  firstPageOnly?: boolean;
  loadingLabel: string;
  errorLabel: string;
  onPages?: (count: number) => void;
};

export function PdfCanvas({ cv, delay = 0, firstPageOnly = false, loadingLabel, errorLabel, onPages }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  // Only one render runs at a time. Edits made meanwhile collapse into the
  // newest one, so slow machines skip stale versions instead of queueing them.
  const latest = useRef(cv);
  const running = useRef(false);
  const dirty = useRef(false);
  const mounted = useRef(false);
  const onPagesRef = useRef(onPages);

  useEffect(() => {
    onPagesRef.current = onPages;
  }, [onPages]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const run = async () => {
      if (running.current) {
        dirty.current = true;
        return;
      }
      running.current = true;
      do {
        dirty.current = false;
        try {
          const canvases = await drawPdfPages(await renderCvPdf(latest.current));
          // The old pages stay on screen until the new ones are fully drawn.
          if (mounted.current && !dirty.current) {
            container.current?.replaceChildren(...(firstPageOnly ? canvases.slice(0, 1) : canvases));
            onPagesRef.current?.(canvases.length);
            setStatus("ready");
          }
        } catch (error) {
          console.error(error);
          if (mounted.current) setStatus("error");
        }
      } while (dirty.current && mounted.current);
      running.current = false;
    };

    latest.current = cv;
    const timer = setTimeout(run, delay);
    return () => clearTimeout(timer);
  }, [cv, delay, firstPageOnly]);

  return (
    <div className="relative">
      <div ref={container} className="flex flex-col gap-6 [&>canvas]:rounded-sm [&>canvas]:shadow-page" />
      {status === "loading" ? (
        <div className="aspect-[1/1.414] rounded-sm bg-surface p-[8%] shadow-page" role="status">
          <span className="sr-only">{loadingLabel}</span>
          <div aria-hidden="true" className="animate-pulse space-y-3">
            <div className="h-5 w-1/2 rounded bg-canvas" />
            <div className="h-2.5 w-3/4 rounded bg-canvas" />
            <div className="h-2.5 w-2/3 rounded bg-canvas" />
            <div className="h-3 w-1/3 rounded bg-canvas pt-4" />
            {Array.from({ length: 7 }, (_, index) => (
              <div key={index} className="h-2.5 rounded bg-canvas" style={{ width: `${92 - (index % 3) * 14}%` }} />
            ))}
          </div>
        </div>
      ) : status === "error" ? (
        <p className="aspect-[1/1.414] rounded-sm bg-surface p-6 text-center text-sm text-danger shadow-page" role="alert">
          {errorLabel}
        </p>
      ) : null}
    </div>
  );
}
