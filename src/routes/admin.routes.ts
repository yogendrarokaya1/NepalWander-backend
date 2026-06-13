import { Router } from "express";
import adminController from "../controllers/admin.controller";
import validate from "../middlewares/validate.middleware";
import {
  protect,
  restrictTo,
  isSuperAdmin,
} from "../middlewares/auth.middleware";
import {
  createAdminSchema,
  rejectAccountSchema,
} from "../validators/admin.validator";
import { UserRole } from "../types";

const router = Router();

// All admin routes require login + admin role
router.use(protect);
router.use(restrictTo(UserRole.ADMIN));

// ── Super Admin only ──────────────────────────────────
router.post(
  "/create-admin",
  isSuperAdmin,
  validate(createAdminSchema),
  adminController.createAdmin
);
router.get(
  "/admins",
  isSuperAdmin,
  adminController.getAllAdmins
);
router.delete(
  "/admins/:id",
  isSuperAdmin,
  adminController.deleteAdmin
);
router.patch(
  "/admins/:id/toggle-status",
  isSuperAdmin,
  adminController.toggleAdminStatus
);

// ── Any Admin ─────────────────────────────────────────
router.get("/users", adminController.getAllUsers);
router.get("/pending", adminController.getPendingAccounts);
router.patch(
  "/accounts/:id/approve",
  adminController.approveAccount
);
router.patch(
  "/accounts/:id/reject",
  validate(rejectAccountSchema),
  adminController.rejectAccount
);

export default router;