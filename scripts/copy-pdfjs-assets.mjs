// pdf.js needs these font files to draw the standard PDF fonts used by the CVs.
import { cpSync } from "node:fs";

cpSync("node_modules/pdfjs-dist/standard_fonts", "public/pdfjs/standard_fonts", { recursive: true });
