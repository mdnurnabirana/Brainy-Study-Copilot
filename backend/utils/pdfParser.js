import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import { createRequire } from "module";
import { PDFParse } from "pdf-parse";

const require = createRequire(import.meta.url);
const pdfjsDistPath = path.dirname(require.resolve("pdfjs-dist/package.json"));

const toFileUrlDir = (dirName) => {
  const dir = path.join(pdfjsDistPath, dirName) + path.sep;
  return pathToFileURL(dir).href;
};

const buildParserOptions = (dataBuffer) => ({
  data: new Uint8Array(dataBuffer),
  standardFontDataUrl: toFileUrlDir("standard_fonts"),
  cMapUrl: toFileUrlDir("cmaps"),
  cMapPacked: true,
  disableFontFace: true,
});

/**
 * Extract text from PDF file or buffer
 * @param {string|Buffer} source - Path to PDF file or PDF buffer
 * @returns {Promise<{text:string,numPages:number}>}
 */
export const extractTextFromPDF = async (source) => {
  let parser;

  try {
    const dataBuffer = Buffer.isBuffer(source)
      ? source
      : await fs.readFile(source);

    parser = new PDFParse(buildParserOptions(dataBuffer));
    const data = await parser.getText();

    return {
      text: data.text,
      numPages: data.numPages,
      info: data.info,
    };
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to extract text from PDF");
  } finally {
    if (parser) {
      await parser.destroy().catch(() => {});
    }
  }
};
