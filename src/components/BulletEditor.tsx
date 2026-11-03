"use client";

import { useEffect, useLayoutEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { useController, type Control, type Path } from "react-hook-form";
import { X } from "./icons";
import type { CvContent } from "@/lib/cv/schema";

// Bullet marks people paste from an older CV, e.g. "• ", "- " or "* ".
const PASTED_BULLET = /^\s*[•\-*–·]\s*/;

function autosize(input: HTMLTextAreaElement | null) {
  if (!input) return;
  input.style.height = "auto";
  input.style.height = `${input.scrollHeight}px`;
}

type Props = {
  control: Control<CvContent>;
  name: Path<CvContent>;
  id: string;
  label: string;
  removeLabel: string;
};

// Edits a newline-separated string as a list of bullet points: one line per point.
export function BulletEditor({ control, name, id, label, removeLabel }: Props) {
  const { field } = useController({ control, name });
  const items = String(field.value ?? "").split("\n");
  const inputs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const pendingFocus = useRef<{ index: number; caret: number } | null>(null);

  const commit = (next: string[], focus: { index: number; caret: number } | null) => {
    pendingFocus.current = focus;
    field.onChange((next.length ? next : [""]).join("\n"));
  };

  useLayoutEffect(() => {
    inputs.current.forEach(autosize);
    const focus = pendingFocus.current;
    if (focus) {
      pendingFocus.current = null;
      const input = inputs.current[focus.index];
      input?.focus();
      input?.setSelectionRange(focus.caret, focus.caret);
    }
  });

  useEffect(() => {
    const onResize = () => inputs.current.forEach(autosize);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // A typed newline (Enter, including on mobile keyboards) splits the point at the caret.
  const change = (index: number, value: string) => {
    const lines = value.split(/\r?\n/);
    const next = [...items];
    next.splice(index, 1, ...lines);
    commit(next, lines.length > 1 ? { index: index + lines.length - 1, caret: 0 } : null);
  };

  const paste = (index: number, event: ClipboardEvent<HTMLTextAreaElement>) => {
    const text = event.clipboardData.getData("text");
    if (!/\r?\n/.test(text)) return;
    event.preventDefault();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.replace(PASTED_BULLET, "").trim())
      .filter(Boolean);
    if (!lines.length) return;
    const { selectionStart, selectionEnd, value } = event.currentTarget;
    const last = lines.length - 1;
    lines[0] = value.slice(0, selectionStart) + lines[0];
    const caret = lines[last].length;
    lines[last] += value.slice(selectionEnd);
    const next = [...items];
    next.splice(index, 1, ...lines);
    commit(next, { index: index + last, caret });
  };

  const keyDown = (index: number, event: KeyboardEvent<HTMLTextAreaElement>) => {
    const { selectionStart, selectionEnd, value } = event.currentTarget;
    if (selectionStart !== selectionEnd) return;

    if (event.key === "Backspace" && selectionStart === 0 && index > 0) {
      event.preventDefault();
      const previous = items[index - 1];
      const next = [...items];
      next.splice(index - 1, 2, previous + value);
      commit(next, { index: index - 1, caret: previous.length });
    } else if (event.key === "Delete" && selectionStart === value.length && index < items.length - 1) {
      event.preventDefault();
      const next = [...items];
      next.splice(index, 2, value + items[index + 1]);
      commit(next, { index, caret: value.length });
    }
  };

  const remove = (index: number) => {
    const next = items.filter((_, position) => position !== index);
    const target = Math.min(index, Math.max(next.length - 1, 0));
    commit(next, { index: target, caret: (next[target] ?? "").length });
  };

  return (
    <ul className="rounded-xl border border-field bg-surface py-1.5 transition-colors hover:border-muted focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
      {items.map((item, index) => (
        <li key={index} className="group flex items-start gap-2.5 pl-3.5 pr-1.5">
          <span aria-hidden="true" className="mt-3.25 size-1.5 shrink-0 select-none rounded-full bg-primary" />
          <textarea
            ref={(input) => {
              inputs.current[index] = input;
            }}
            id={index === 0 ? id : undefined}
            aria-label={index === 0 ? undefined : `${label} ${index + 1}`}
            rows={1}
            value={item}
            onChange={(event) => change(index, event.target.value)}
            onPaste={(event) => paste(index, event)}
            onKeyDown={(event) => keyDown(index, event)}
            onBlur={field.onBlur}
            className="block w-full resize-none overflow-hidden bg-transparent py-1.5 text-sm leading-5 text-ink focus:outline-none"
          />
          {items.length > 1 ? (
            <button
              type="button"
              aria-label={`${removeLabel} ${index + 1}`}
              onClick={() => remove(index)}
              className="grid size-8 shrink-0 place-items-center rounded-lg text-subtle transition-colors hover:bg-danger-soft hover:text-danger"
            >
              <X className="size-3.5" strokeWidth={2.25} />
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
