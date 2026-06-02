import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { AuthRequest, UserRole } from "../types";
import { UnauthorizedError, ForbiddenError } from "./error.middleware";
import asyncHandler from "../utils/asyncHandler";

// Protect route — must be logged in
export const protect = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Access denied. No token provided.");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  }
);

// Restrict to specific roles
export const restrictTo = (...roles: UserRole[]) =>
  asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenError(
        "You do not have permission to perform this action"
      );
    }
    next();
  });