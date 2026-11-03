"use client";

import { useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import type { Dictionary } from "@/lib/cv/i18n";
import { PHOTO_ASPECT } from "@/lib/photo/image";
import { RotateLeft, RotateRight } from "./icons";

export type CropResult = { area: Area; rotation: number };

type Props = {
  source: string;
  initial?: CropResult;
  busy: boolean;
  t: Dictionary;
  onCancel: () => void;
  onSave: (result: CropResult) => void;
};

const normalizeRotation = (degrees: number) => ((((degrees + 180) % 360) + 360) % 360) - 180;

export function PhotoCropDialog({ source, initial, busy, t, onCancel, onSave }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(initial?.rotation ?? 0);
  const [initialArea, setInitialArea] = useState(initial?.area);
  // Remounting the cropper is how it re-applies `initialCroppedAreaPixels`.
  const [cropperKey, setCropperKey] = useState(0);
  const area = useRef<Area | null>(initial?.area ?? null);
  // The cropper measures its container on mount. Inside a closed dialog that is
  // 0x0, which turns the restored zoom into NaN and loops forever, so it only
  // mounts once the dialog is open.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    dialog.current?.showModal();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- must follow showModal(), which needs the mounted DOM node
    setOpen(true);
  }, []);

  const reset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setInitialArea(undefined);
    setCropperKey((key) => key + 1);
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby="photo-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
      className="m-auto max-h-[calc(100dvh-1.5rem)] w-[min(34rem,calc(100vw-2rem))] overflow-y-auto rounded-3xl border border-line bg-surface p-0 shadow-page backdrop:bg-ink/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-4 sm:p-6">
        <h2 id="photo-dialog-title" className="font-display text-3xl leading-tight text-ink">
          {t.photo.dialogTitle}
        </h2>
        <p className="mt-1 text-sm text-muted">{t.photo.dialogHint}</p>

        <div className="relative mt-4 h-[min(42dvh,24rem)] overflow-hidden rounded-2xl bg-ink sm:mt-5">
          {open ? (
          <Cropper
            key={cropperKey}
            image={source}
            aspect={PHOTO_ASPECT}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            minZoom={1}
            maxZoom={4}
            showGrid
            initialCroppedAreaPixels={initialArea}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={(_, pixels) => {
              area.current = pixels;
            }}
          />
          ) : null}
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3 text-sm font-medium text-ink">
            <span className="w-16 shrink-0">{t.photo.zoom}</span>
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full accent-primary"
            />
          </label>
          <label className="flex items-center gap-3 text-sm font-medium text-ink">
            <span className="w-16 shrink-0">{t.photo.rotation}</span>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotation}
              onChange={(event) => setRotation(Number(event.target.value))}
              className="w-full accent-primary"
            />
            <span aria-hidden="true" className="w-11 shrink-0 text-right text-muted tabular-nums">{rotation}°</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-ghost" onClick={() => setRotation((value) => normalizeRotation(value - 90))}>
              <RotateLeft /> {t.photo.rotateLeft}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setRotation((value) => normalizeRotation(value + 90))}>
              <RotateRight /> {t.photo.rotateRight}
            </button>
            <button type="button" className="btn-ghost" onClick={reset}>
              {t.photo.reset}
            </button>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4 sm:mt-6 sm:pt-5">
          <button type="button" className="btn-secondary" disabled={busy} onClick={onCancel}>
            {t.photo.cancel}
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={busy}
            onClick={() => area.current && onSave({ area: area.current, rotation })}
          >
            {busy ? t.photo.processing : t.photo.save}
          </button>
        </div>
      </div>
    </dialog>
  );
}
