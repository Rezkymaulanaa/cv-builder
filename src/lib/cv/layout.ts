import type { CvData } from "./schema";

// The summary can sit in the header under the contact line, without a heading.
export const summaryInHeader = (cv: CvData) => cv.content.summaryPlacement === "header";
