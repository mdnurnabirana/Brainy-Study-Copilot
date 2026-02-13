import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.log(
    "FATAL ERROR: GEMINI_API_KEY is not set in the environment variables.",
  );
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 🔐 Helper to prevent substring crashes
const safeText = (value, limit = 10000) => {
  if (!value || typeof value !== "string") return "";
  return value.substring(0, limit);
};

const getGeminiText = (response) => {
  const text = response?.response?.text?.();
  if (!text || typeof text !== "string") {
    throw new Error("Gemini returned empty response");
  }
  return text;
};

/**
 * Generate flashcards from text
 */
export const generateFlashcards = async (text, count = 10) => {
  const prompt = `Generate exactly ${count} educational flashcards from the following text.
Format each flashcard as:
Q: [Clear,specific question]
A: [Concise,accurate answer]
D: [Difficulty level: easy,medium, or hard]

Separate each flashcard with "---"

Text:
${safeText(text, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = getGeminiText(response);

    const flashcards = [];
    const cards = generatedText.split("---").filter((c) => c.trim());

    for (const card of cards) {
      const lines = card.trim().split("\n");
      let question = "",
        answer = "",
        difficulty = "medium";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("Q:")) question = trimmed.substring(2).trim();
        else if (trimmed.startsWith("A:")) answer = trimmed.substring(2).trim();
        else if (trimmed.startsWith("D:")) {
          const diff = trimmed.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) difficulty = diff;
        }
      }

      if (question && answer) flashcards.push({ question, answer, difficulty });
    }

    return flashcards.slice(0, count);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate flashcards");
  }
};

/**
 * Generate quiz
 */
export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
Format each question as:
Q: [Question]
O1: [Option 1]
O2: [Option 2]
O3: [Option 3]
O4: [Option 4]
C: [Correct option]
E: [Brief explanation]
D: [Difficulty: easy, medium or hard]

Separate questions with "---"

Text:
${safeText(text, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = getGeminiText(response);

    const questions = [];
    const blocks = generatedText.split("---").filter(Boolean);

    for (const block of blocks) {
      const lines = block.trim().split("\n");
      let question = "",
        options = [],
        correctAnswer = "",
        explanation = "",
        difficulty = "medium";

      for (const line of lines) {
        const t = line.trim();
        if (t.startsWith("Q:")) question = t.substring(2).trim();
        else if (/^O\d:/.test(t)) options.push(t.substring(3).trim());
        else if (t.startsWith("C:")) correctAnswer = t.substring(2).trim();
        else if (t.startsWith("E:")) explanation = t.substring(2).trim();
        else if (t.startsWith("D:")) {
          const diff = t.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) difficulty = diff;
        }
      }

      if (question && options.length === 4 && correctAnswer) {
        questions.push({
          question,
          options,
          correctAnswer,
          explanation,
          difficulty,
        });
      }
    }

    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate quiz");
  }
};

/**
 * Generate summary
 */
export const generateSummary = async (text) => {
  const prompt = `Provide a concise summary of the following text.
Highlight key ideas clearly.

Text:
${safeText(text, 20000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    return getGeminiText(response);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate summary");
  }
};

/**
 * Chat with document
 */
export const chatWithContext = async (question, chunks) => {
  const context = Array.isArray(chunks)
    ? chunks.map((c, i) => `[Chunk ${i + 1}]\n${c?.content || ""}`).join("\n\n")
    : "";

  const prompt = `Answer the user's question based on the context below.
If not found, say so.

Context:
${safeText(context, 12000)}

Question: ${question}
Answer:`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    return getGeminiText(response);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to chat with context");
  }
};

/**
 * Explain concept
 */
export const explainConcept = async (concept, context) => {
  const prompt = `Explain "${concept}" clearly with examples if needed.

Context:
${safeText(context, 10000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    return getGeminiText(response);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to explain concept");
  }
};