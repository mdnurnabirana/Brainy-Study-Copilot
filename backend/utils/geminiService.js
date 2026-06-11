// Backward-compatible facade — controllers import this module unchanged.
export {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chatWithContext,
  explainConcept,
} from "../services/ai/ai.service.js";
