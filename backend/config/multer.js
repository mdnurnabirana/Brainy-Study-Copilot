// Multer is used because Express cannot handle file uploads by itself.
// When a browser uploads a file, it sends it as multipart/form-data, and Multer is the middleware that:
// Parses that form data
// Extracts the file
// Holds it in memory for upload to Supabase Storage
// Makes file info available in req.file or req.files

import multer from "multer";

const storage = multer.memoryStorage();

// File filter-only PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
  },
});

export default upload;
