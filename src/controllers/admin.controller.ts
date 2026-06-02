import { Response } from "express";
import adminService from "../services/admin.service";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { AuthRequest } from "../types";

class AdminController {

  // POST /api/v1/admin/create-admin
  createAdmin = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const result = await adminService.createAdmin(req.body);
      ApiResponse.created(res, result.message, result.admin);
    }
  );

  // GET /api/v1/admin/admins
  getAllAdmins = asyncHandler(
    async (_req: AuthRequest, res: Response) => {
      const admins = await adminService.getAllAdmins();
      ApiResponse.success(res, "Admins fetched", admins);
    }
  );

  // DELETE /api/v1/admin/admins/:id
  deleteAdmin = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await adminService.deleteAdmin(
        id,
        req.user!.id
      );
      ApiResponse.success(res, result.message);
    }
  );

  // PATCH /api/v1/admin/admins/:id/toggle-status
  toggleAdminStatus = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await adminService.toggleAdminStatus(
        id,
        req.user!.id
      );
      ApiResponse.success(res, result.message, result.admin);
    }
  );

  // PATCH /api/v1/admin/accounts/:id/approve
  approveAccount = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await adminService.approveAccount(
        id
      );
      ApiResponse.success(res, result.message);
    }
  );

  // PATCH /api/v1/admin/accounts/:id/reject
  rejectAccount = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await adminService.rejectAccount(
        id,
        req.body.reason || "Does not meet requirements"
      );
      ApiResponse.success(res, result.message);
    }
  );

  // GET /api/v1/admin/users
  getAllUsers = asyncHandler(
    async (_req: AuthRequest, res: Response) => {
      const users = await adminService.getAllUsers();
      ApiResponse.success(res, "Users fetched", users);
    }
  );

  // GET /api/v1/admin/pending
  getPendingAccounts = asyncHandler(
    async (_req: AuthRequest, res: Response) => {
      const accounts = await adminService.getPendingAccounts();
      ApiResponse.success(
        res,
        "Pending accounts fetched",
        accounts
      );
    }
  );
}

export default new AdminController();