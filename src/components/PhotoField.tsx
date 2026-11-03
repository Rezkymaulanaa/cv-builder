"use client";

import { useRef, useState } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { Upload, User } from "./icons";
import { PhotoCropDialog, type CropResult } from "./PhotoCropDialog";
import type { Dictionary } from "@/lib/cv/i18n";
import type { CvContent } from "@/lib/cv/schema";
import { cropPhoto, MAX_UPLOAD_BYTES, prepareSource } from "@/lib/photo/image";

export function PhotoField({ form, t }: { form: UseFormReturn<CvContent>; t: Dictionary }) {
  const photo = useWatch({ control: form.control, name: "photo" });
  const input = useRef<HTMLInputElement>(null);
  // The photo being cropped. A new upload is only saved once the crop is confirmed.
  const [editing, setEditing] = useState<{ source: string; initial?: CropResult } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const openFile = async (file: File) => {
    setError("");
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(t.photo.tooLarge);
      return;
    }
    setBusy(true);
    try {
      setEditing({ source: await prepareSource(file) });
    } catch {
      setError(t.photo.invalidFile);
    } finally {
      setBusy(false);
    }
  };

  const save = async ({ area, rotation }: CropResult) => {
    if (!editing) return;
    setBusy(true);
    try {
      const image = await cropPhoto(editing.source, area, rotation);
      form.setValue("photo", { image, source: editing.source, area, rotation }, { shouldDirty: true });
      setEditing(null);
    } catch {
      setError(t.photo.invalidFile);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sm:col-span-2">
      <p className="label">{t.photo.label}</p>
      <div className="flex items-center gap-5 rounded-2xl border border-dashed border-field bg-canvas/60 p-4">
        <div className="grid aspect-[4/5] w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-surface text-subtle shadow-card">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- a local data URL, nothing for next/image to optimize
            <img src={photo.image} alt={t.photo.alt} className="size-full object-cover" />
          ) : (
            <User className="size-8" strokeWidth={1.25} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" disabled={busy} onClick={() => input.current?.click()}>
              <Upload />
              {busy && !editing ? t.photo.processing : t.photo.upload}
            </button>
            {photo ? (
              <>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setEditing({ source: photo.source, initial: { area: photo.area, rotation: photo.rotation } })}
                >
                  {t.photo.adjust}
                </button>
                <button
                  type="button"
                  className="btn-ghost text-danger hover:bg-danger-soft hover:text-danger"
                  onClick={() => form.setValue("photo", null, { shouldDirty: true })}
                >
                  {t.photo.remove}
                </button>
              </>
            ) : null}
          </div>
          <p className="hint mt-2.5">{t.photo.hint}</p>
          {error ? (
            <p className="mt-1.5 text-xs font-medium text-danger" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        aria-label={t.photo.upload}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void openFile(file);
        }}
      />
      {editing ? (
        <PhotoCropDialog
          source={editing.source}
          initial={editing.initial}
          busy={busy}
          t={t}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      ) : null}
    </div>
  );
}
