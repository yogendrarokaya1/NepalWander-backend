import { Router } from "express";
import authController from "../controllers/auth.controller";
import validate from "../middlewares/validate.middleware";
import { protect } from "../middlewares/auth.middleware";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOtpSchema,
  updateProfileSchema,
} from "../validators/auth.validator";

const router = Router();

// Public routes
router.post(
  "/register",
  validate(registerSchema),
  authController.register
);
router.post(
  "/verify-otp",
  validate(verifyOtpSchema),
  authController.verifyOtp
);
router.post(
  "/login",
  validate(loginSchema),
  authController.login
);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword
);
router.post(
  "/resend-otp",
  validate(resendOtpSchema),
  authController.resendOtp
);

// Protected routes
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getMe);

// Add this to auth.routes.ts (after the getMe route)

router.put(
  "/profile",
  protect,
  validate(updateProfileSchema),
  authController.updateProfile
);
export default router;