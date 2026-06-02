import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { AuthRequest, UserRole } from "../types";
import {
  UnauthorizedError,
  ForbiddenError,
} from "./error.middleware";
import asyncHandler from "../utils/asyncHandler";

export const protect = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  }
);

export const restrictTo = (...roles: UserRole[]) =>
  asyncHandler(
    async (req: AuthRequest, _res: Response, next: NextFunction) => {
      if (!req.user || !roles.includes(req.user.role)) {
        throw new ForbiddenError("You do not have permission");
      }
      next();
    }
  );