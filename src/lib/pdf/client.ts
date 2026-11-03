import type { CvData } from "../cv/schema";

type Pending = { resolve: (bytes: ArrayBuffer) => void; reject: (error: Error) => void };

let worker: Worker | undefined;
let nextId = 0;
const pending = new Map<number, Pending>();

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("./pdf.worker.ts", import.meta.url));
    worker.onmessage = ({ data }: MessageEvent<{ id: number; bytes?: ArrayBuffer; error?: string }>) => {
      const request = pending.get(data.id);
      pending.delete(data.id);
      if (data.bytes) request?.resolve(data.bytes);
      else request?.reject(new Error(data.error));
    };
  }
  return worker;
}

// Generates the PDF off the main thread so typing in the form never stutters.
export function renderCvPdf(cv: CvData): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ id, cv });
  });
}

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | undefined;

function loadPdfjs() {
  pdfjsPromise ??= import("pdfjs-dist").then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
    return pdfjs;
  });
  return pdfjsPromise;
}

// Draws every page to new canvases; the caller swaps them in once all are ready.
export async function drawPdfPages(bytes: ArrayBuffer): Promise<HTMLCanvasElement[]> {
  const pdfjs = await loadPdfjs();
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(bytes),
    standardFontDataUrl: "/pdfjs/standard_fonts/",
  });
  const document = await loadingTask.promise;

  const canvases: HTMLCanvasElement[] = [];
  for (let number = 1; number <= document.numPages; number++) {
    const page = await document.getPage(number);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = window.document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.className = "block h-auto w-full bg-white";
    await page.render({ canvas, viewport }).promise;
    canvases.push(canvas);
  }
  await loadingTask.destroy();
  return canvases;
}

// The plain text a parser gets out of the first page, one entry per line.
export async function extractPdfLines(bytes: ArrayBuffer): Promise<string[]> {
  const pdfjs = await loadPdfjs();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(bytes) });
  const document = await loadingTask.promise;
  const { items } = await (await document.getPage(1)).getTextContent();
  await loadingTask.destroy();

  const lines = [""];
  for (const item of items) {
    if (!("str" in item)) continue;
    lines[lines.length - 1] += item.str;
    if (item.hasEOL) lines.push("");
  }
  return lines.map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
}
