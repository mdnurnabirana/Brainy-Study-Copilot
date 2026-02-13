import express from "express";
import { body } from "express-validator"; //body function, which is used to validate fields that come from req.body.
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";
import protect from "../middleware/auth.js";

const router = express.Router(); //Instead of putting all routes inside app.js, you split them into separate files.

//*Validate Middleware
const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

//* Public Routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

//* Protected Routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/change-password", protect, changePassword);

export default router;