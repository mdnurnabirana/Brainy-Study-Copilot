import { GoogleGenAI } from "@google/genai";

export const name = "gemini";

let client;

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
};

export const isConfigured = () => Boolean(process.env.GEMINI_API_KEY);

const extractText = (response) => {
  if (!response) return "";
  if (typeof response === "string") return response;
  if (response.text) return response.text;
  if (response?.candidates?.[0]?.content?.text) {
    return response.candidates[0].content.text;
  }
  if (response?.output?.[0]?.content?.text) {
    return response.output[0].content.text;
  }
  return "";
};

export const generate = async (prompt) => {
  const ai = getClient();
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  const text = extractText(response);

  if (!text) {
    throw new Error("Gemini API returned empty response");
  }

  return text;
};
