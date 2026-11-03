import { pdf } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import type { CvData } from "../cv/schema";
import { CvDocument } from "./CvDocument";

type Request = { id: number; cv: CvData };

async function render({ id, cv }: Request) {
  try {
    const element = createElement(CvDocument, { cv }) as ReactElement<never>;
    const blob = await pdf(element as never).toBlob();
    const bytes = await blob.arrayBuffer();
    self.postMessage({ id, bytes }, { transfer: [bytes] });
  } catch (error) {
    self.postMessage({ id, error: String(error) });
  }
}

// Renders one document at a time, in the order requested.
let queue = Promise.resolve();

self.onmessage = (event: MessageEvent<Request>) => {
  queue = queue.then(() => render(event.data));
};
