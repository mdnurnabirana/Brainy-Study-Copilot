// Multer is used because Express cannot handle file uploads by itself.
// When a browser uploads a file, it sends it as multipart/form-data, and Multer is the middleware that:
// Parses that form data
// Extracts the file
// Saves it (to disk or memory)
// Makes file info available in req.file or req.files

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../uploads/documents");
if (!fs.existsSync(uploadDir)) {
  //checks whether a directory or file already exists at the path stored in uploadDir.
  fs.mkdirSync(uploadDir, { recursive: true }); //creates a directory synchronously(the program waits until it is created).
  //uploadDir is the path where the directory should be created.
  //{ recursive: true } means: Create parent directories too if they don’t exist.
}

//Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //file → metadata about the uploaded file (name, mimetype, etc.)
    cb(null, uploadDir); //cb → callback function Multer uses to continue or stop
    //null → no error              // uploadDir → directory where the file should be saved
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`); //Calls the callback to set the filename:
  },
});

// File filter-only PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true); //true → allow this file to be saved
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

//Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
  },
});

export default upload;