import { Router } from "express";
import authController from "../controllers/auth.controller";
import validate from "../middlewares/validate.middleware";
import { protect } from "../middlewares/auth.middleware";
import {
  registerValidator,
  loginValidator,
  verifyOtpValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../validators/auth.validator";

const router = Router();
console.log("✅ Auth routes loaded"); 

// Public
router.post(
  "/register",
  registerValidator,
  validate,
  authController.register
);
router.post(
  "/verify-otp",
  verifyOtpValidator,
  validate,
  authController.verifyOtp
);
router.post(
  "/login",
  loginValidator,
  validate,
  authController.login
);
router.post(
  "/forgot-password",
  forgotPasswordValidator,
  validate,
  authController.forgotPassword
);
router.post(
  "/reset-password",
  resetPasswordValidator,
  validate,
  authController.resetPassword
);
router.post("/resend-otp", authController.resendOtp);

// Protected
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getMe);

export default router;