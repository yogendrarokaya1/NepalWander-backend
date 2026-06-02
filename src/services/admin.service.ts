import { UserRepository } from "../repositories/user.repository";
import { hashPassword } from "../utils/hash.util";
import { generateOtp } from "../utils/otp.util";
import emailService from "./email.service";
import { UserRole, AccountStatus } from "../types";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../middlewares/error.middleware";

const userRepository = new UserRepository();

class AdminService {

  // ── Create Admin ──────────────────────────────────────
  async createAdmin(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const { firstName, lastName, email, password } = input;

    // Check duplicate
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError("Email is already registered");
    }

    // Hash password
    const hashed = await hashPassword(password);

    // Create admin — no OTP needed, super admin creates directly
    const admin = await userRepository.create({
      firstName,
      lastName,
      email,
      password: hashed,
      role: UserRole.ADMIN,
      isSuperAdmin: false,         // new admins are not super admin
      isVerified: true,            // auto verified
      isActive: true,
      accountStatus: AccountStatus.APPROVED,
    });

    // Send welcome email with credentials
    await emailService.sendAdminWelcomeEmail(
      email,
      firstName,
      password    // send plain password in email (first time only)
    );

    return {
      message: "Admin account created successfully",
      admin: {
        id: admin._id.toString(),
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        isSuperAdmin: admin.isSuperAdmin,
      },
    };
  }

  // ── Get All Admins ────────────────────────────────────
  async getAllAdmins() {
    const admins = await userRepository.findByRole(UserRole.ADMIN);
    return admins;
  }

  // ── Delete Admin ──────────────────────────────────────
  async deleteAdmin(adminId: string, requesterId: string) {
    // Cannot delete yourself
    if (adminId === requesterId) {
      throw new BadRequestError(
        "You cannot delete your own account"
      );
    }

    const admin = await userRepository.findById(adminId);
    if (!admin) throw new NotFoundError("Admin not found");

    // Cannot delete another super admin
    if (admin.isSuperAdmin) {
      throw new BadRequestError(
        "Super Admin account cannot be deleted"
      );
    }

    await userRepository.delete(adminId);
    return { message: "Admin deleted successfully" };
  }

  // ── Toggle Admin Active Status ────────────────────────
  async toggleAdminStatus(adminId: string, requesterId: string) {
    if (adminId === requesterId) {
      throw new BadRequestError(
        "You cannot deactivate your own account"
      );
    }

    const admin = await userRepository.findById(adminId);
    if (!admin) throw new NotFoundError("Admin not found");

    if (admin.isSuperAdmin) {
      throw new BadRequestError(
        "Super Admin status cannot be changed"
      );
    }

    const updated = await userRepository.update(adminId, {
      isActive: !admin.isActive,
    });

    return {
      message: `Admin ${updated?.isActive ? "activated" : "deactivated"} successfully`,
      admin: updated,
    };
  }

  // ── Approve Guide or Operator ─────────────────────────
  async approveAccount(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (
      user.role !== UserRole.GUIDE &&
      user.role !== UserRole.OPERATOR
    ) {
      throw new BadRequestError(
        "Only guide or operator accounts need approval"
      );
    }

    if (user.accountStatus === AccountStatus.APPROVED) {
      throw new BadRequestError("Account is already approved");
    }

    await userRepository.update(userId, {
      accountStatus: AccountStatus.APPROVED,
    });

    await emailService.sendAccountApprovedEmail(
      user.email,
      user.firstName,
      user.role
    );

    return { message: `${user.role} account approved successfully` };
  }

  // ── Reject Guide or Operator ──────────────────────────
  async rejectAccount(userId: string, reason: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    await userRepository.update(userId, {
      accountStatus: AccountStatus.REJECTED,
    });

    await emailService.sendAccountRejectedEmail(
      user.email,
      user.firstName,
      user.role,
      reason
    );

    return { message: "Account rejected" };
  }

  // ── Get All Users ─────────────────────────────────────
  async getAllUsers() {
    return userRepository.findAll();
  }

  // ── Get Pending Accounts ──────────────────────────────
  async getPendingAccounts() {
    return userRepository.findByStatus(AccountStatus.PENDING);
  }
}

export default new AdminService();