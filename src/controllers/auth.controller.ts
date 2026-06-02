import { Request, Response } from "express";
import authService from "../services/auth.service";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { AuthRequest } from "../types";

class AuthController {

  // POST /api/v1/auth/register
  register = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await authService.register(req.body);
      ApiResponse.created(res, result.message);
    }
  );

  // POST /api/v1/auth/verify-otp
  verifyOtp = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await authService.verifyOtp(req.body);

      if (!result.requiresApproval && result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }

      ApiResponse.success(res, result.message, {
        requiresApproval: result.requiresApproval,
        accessToken: result.accessToken,
        user: result.user,
      });
    }
  );

  // POST /api/v1/auth/login
  login = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await authService.login(req.body);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(res, "Login successful", {
        accessToken: result.accessToken,
        user: result.user,
      });
    }
  );

  // POST /api/v1/auth/forgot-password
  forgotPassword = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await authService.forgotPassword(req.body);
      ApiResponse.success(res, result.message);
    }
  );

  // POST /api/v1/auth/reset-password
  resetPassword = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await authService.resetPassword(req.body);
      ApiResponse.success(res, result.message);
    }
  );

  // POST /api/v1/auth/resend-otp
  resendOtp = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await authService.resendOtp(
        req.body.email
      );
      ApiResponse.success(res, result.message);
    }
  );

  // POST /api/v1/auth/logout
  logout = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      res.clearCookie("refreshToken");
      if (req.user) {
        await authService.logout(req.user.id);
      }
      ApiResponse.success(res, "Logged out successfully");
    }
  );

  // GET /api/v1/auth/me
  getMe = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const user = await authService.getMe(req.user!.id);
      ApiResponse.success(res, "Profile fetched", user);
    }
  );
}

export default new AuthController();