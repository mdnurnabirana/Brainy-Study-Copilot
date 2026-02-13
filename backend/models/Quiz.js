import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    userId: {
      //relationship between two MongoDB collections using Mongoose
      type: mongoose.Schema.Types.ObjectId, //This says the value must be a MongoDB ObjectId.
      ref: "User", //This ObjectId refers to a document in the User collection
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    questions: [
      {
        //Each document will have a field called questions which is an array.
        question: {
          type: String,
          required: true,
        },
        options: {
          type: [String], //array of string
          required: true,
          validate: [
            (array) => array.length === 4,
            "Must have exactly 4 options",
          ],
        },
        correctAnswer: {
          type: String,
          required: true,
        },
        explanation: {
          type: String,
          default: "",
        },
        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"], //Limits the field to only these values:
          default: "medium",
        },
      },
    ],
    userAnswers: [
      {
        questionIndex: {
          type: Number,
          required: true,
        },
        selectedAnswer: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
        answeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
quizSchema.index({ userId: 1, documentId: 1 }); //quickly locate documents without scanning the entire collection.

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;