import { body } from "express-validator";

export const registerValidator = [
  body("firstName")
    .trim()
    .notEmpty().withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),

  body("lastName")
    .trim()
    .notEmpty().withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must have uppercase, lowercase and a number"
    ),

  body("role")
    .optional()
    .isIn(["tourist", "guide", "operator"])
    .withMessage("Role must be tourist, guide or operator"),

  body("nationality")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Nationality must be valid"),
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email"),

  body("password")
    .notEmpty().withMessage("Password is required"),
];

export const verifyOtpValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Valid email is required"),

  body("otp")
    .notEmpty().withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits")
    .isNumeric().withMessage("OTP must contain only numbers"),
];

export const forgotPasswordValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Valid email is required"),
];

export const resetPasswordValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Valid email is required"),

  body("otp")
    .notEmpty().withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits"),

  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must have uppercase, lowercase and a number"
    ),
];