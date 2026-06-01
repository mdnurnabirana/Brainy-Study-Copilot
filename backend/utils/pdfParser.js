import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

/**
 * Extract text from PDF file or buffer
 * @param {string|Buffer} source - Path to PDF file or PDF buffer
 * @returns {Promise<{text:string,numPages:number}>}
 */
export const extractTextFromPDF = async (source) => {
  try {
    const dataBuffer = Buffer.isBuffer(source)
      ? source
      : await fs.readFile(source);
    const parser = new PDFParse(new Uint8Array(dataBuffer));
    const data = await parser.getText();

    return {
      text: data.text,
      numPages: data.numPages,
      info: data.info,
    };
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to extract text from PDF");
  }
};
