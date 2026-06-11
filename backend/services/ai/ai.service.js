import { generateText } from "./providerManager.js";
import { parseFlashcards, parseQuiz } from "./responseParser.js";

/**
 * Generate flashcards from text
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 */
export const generateFlashcards = async (text, count = 10) => {
  const prompt = `Generate exactly ${count} educational flashcards from the following text.
Format each flashcard as:
Q: [Clear, specific question]
A: [Concise, accurate answer]
D: [Difficulty level: easy, medium, or hard]

Separate each flashcard with "---"

Text:
${text.substring(0, 15000)}`;

  try {
    const generatedText = await generateText(prompt);
    return parseFlashcards(generatedText, count);
  } catch (error) {
    console.error("AI flashcard generation error:", error);
    throw new Error("Failed to generate flashcards");
  }
};

/**
 * Generate quiz questions from text
 * @param {string} text - Document text
 * @param {number} numQuestions - Number of questions
 */
export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
Format each question as:
Q: [Question]
O1: [Option 1]
O2: [Option 2]
O3: [Option 3]
O4: [Option 4]
C: [Correct option - exactly as written above]
E: [Brief explanation]
D: [Difficulty: easy, medium or hard]

Separate questions with "---"

Text:
${text.substring(0, 15000)}`;

  try {
    const generatedText = await generateText(prompt);
    return parseQuiz(generatedText, numQuestions);
  } catch (error) {
    console.error("AI quiz generation error:", error);
    throw new Error("Failed to generate quiz");
  }
};

/**
 * Generate document summary
 * @param {string} text - Document text
 */
export const generateSummary = async (text) => {
  const prompt = `Provide a concise summary of the following text, highlighting the key concepts, main ideas, and important points. Keep the summary clear and structured.

Text:
${text.substring(0, 20000)}`;

  try {
    return await generateText(prompt);
  } catch (error) {
    console.error("AI summary generation error:", error);
    throw new Error("Failed to generate summary");
  }
};

/**
 * Chat with document context
 * @param {string} question - User question
 * @param {Array<Object>} chunks - Relevant document chunks
 */
export const chatWithContext = async (question, chunks) => {
  const context = chunks
    .map((c, i) => `[Chunk ${i + 1}]\n${c.content}`)
    .join("\n\n");

  const prompt = `Based on the following context from a document, analyse the context and answer the user's question.
If the answer is not in the context, say so.

Context:
${context}

Question: ${question}

Answer:`;

  try {
    return await generateText(prompt);
  } catch (error) {
    console.error("AI chat error:", error);
    throw new Error("Failed to process chat request");
  }
};

/**
 * Explain a specific concept
 * @param {string} concept - Concept to explain
 * @param {string} context - Relevant context
 */
export const explainConcept = async (concept, context) => {
  const prompt = `Explain the concept of "${concept}" based on the following context. Provide a clear, educational explanation that's easy to understand.
Include examples if relevant.

Context:
${context.substring(0, 10000)}`;

  try {
    return await generateText(prompt);
  } catch (error) {
    console.error("AI explain concept error:", error);
    throw new Error("Failed to explain concept");
  }
};
