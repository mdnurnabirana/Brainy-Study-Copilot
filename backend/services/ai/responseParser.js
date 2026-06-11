export const parseFlashcards = (generatedText, count) => {
  const flashcards = [];
  const cards = generatedText.split("---").filter((c) => c.trim());

  for (const card of cards) {
    const lines = card.trim().split("\n");
    let question = "";
    let answer = "";
    let difficulty = "medium";

    for (const line of lines) {
      if (line.startsWith("Q:")) {
        question = line.substring(2).trim();
      } else if (line.startsWith("A:")) {
        answer = line.substring(2).trim();
      } else if (line.startsWith("D:")) {
        const diff = line.substring(2).trim().toLowerCase();
        if (["easy", "medium", "hard"].includes(diff)) {
          difficulty = diff;
        }
      }
    }

    if (question && answer) {
      flashcards.push({ question, answer, difficulty });
    }
  }

  return flashcards.slice(0, count);
};

export const parseQuiz = (generatedText, numQuestions) => {
  const questions = [];
  const questionBlocks = generatedText.split("---").filter((q) => q.trim());

  for (const block of questionBlocks) {
    const lines = block.trim().split("\n");
    let question = "";
    let options = [];
    let correctAnswer = "";
    let explanation = "";
    let difficulty = "medium";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("Q:")) {
        question = trimmed.substring(2).trim();
      } else if (/^O\d:/.test(trimmed)) {
        options.push(trimmed.substring(3).trim());
      } else if (trimmed.startsWith("C:")) {
        correctAnswer = trimmed.substring(2).trim();
      } else if (trimmed.startsWith("E:")) {
        explanation = trimmed.substring(2).trim();
      } else if (trimmed.startsWith("D:")) {
        const diff = trimmed.substring(2).trim().toLowerCase();
        if (["easy", "medium", "hard"].includes(diff)) {
          difficulty = diff;
        }
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
};
