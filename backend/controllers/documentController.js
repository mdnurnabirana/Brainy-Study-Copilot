import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import supabase from "../config/supabase.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import mongoose from "mongoose";

const PDF_BUCKET = "pdfs";

const buildStoragePath = (userId, originalName) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `documents/${userId}/${uniqueSuffix}-${safeName}`;
};

const uploadPdfToSupabase = async (buffer, storagePath) => {
  const { error } = await supabase.storage
    .from(PDF_BUCKET)
    .upload(storagePath, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload PDF: ${error.message}`);
  }
};

const getPublicUrl = (storagePath) => {
  const { data } = supabase.storage.from(PDF_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
};

const deletePdfFromSupabase = async (storagePath) => {
  if (!storagePath) return;
  await supabase.storage.from(PDF_BUCKET).remove([storagePath]);
};

// @desc    Upload PDF document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
  let storagePath;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a PDF file",
        statusCode: 400,
      });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Please provide a document title",
        statusCode: 400,
      });
    }

    storagePath = buildStoragePath(req.user._id, req.file.originalname);
    await uploadPdfToSupabase(req.file.buffer, storagePath);
    const fileUrl = getPublicUrl(storagePath);

    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.originalname,
      filePath: fileUrl,
      storagePath,
      fileSize: req.file.size,
      status: "processing",
    });

    processPDF(document._id, req.file.buffer).catch((err) => {
      console.error("PDF processing error:", err);
    });

    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully. Processing in progress...",
    });
  } catch (error) {
    if (storagePath) {
      await deletePdfFromSupabase(storagePath).catch(() => {});
    }
    next(error);
  }
};

// Helper function to process PDF
const processPDF = async (documentId, pdfBuffer) => {
  try {
    const { text } = await extractTextFromPDF(pdfBuffer);

    const chunks = chunkText(text, 500, 50);

    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: "ready",
    });
    console.log(`Document ${documentId} processed successfully`);
  } catch (error) {
    console.log(`Error processing document ${documentId}:`, error);
    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
    });
  }
};

// @desc   Get all user documents
// @route  GET /api/documents
// @access Private
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.user._id) },
      },
      {
        $lookup: {
          from: "flashcards",
          localField: "_id",
          foreignField: "documentId",
          as: "flashcardSets",
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "documentId",
          as: "quizzes",
        },
      },
      {
        $addFields: {
          flashcardCount: { $size: "$flashcardSets" },
          quizCount: { $size: "$quizzes" },
        },
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcardSets: 0,
          quizzes: 0,
        },
      },
      {
        $sort: { uploadDate: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single document with chunks
// @route  GET /api/documents/:id
// @access private
export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    const flashcardCount = await Flashcard.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });
    const quizCount = await Quiz.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });

    document.lastAccessed = Date.now();
    await document.save();

    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;

    res.status(200).json({
      success: true,
      data: documentData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete document
// @route  DELETE /api/documents/:id
// @access Private
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    await deletePdfFromSupabase(document.storagePath);

    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
