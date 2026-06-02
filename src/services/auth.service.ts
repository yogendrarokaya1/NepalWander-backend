import { UserRepository } from "../repositories/user.repository";
import { hashPassword, comparePassword } from "../utils/hash.util";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.util";
import { generateOtp } from "../utils/otp.util";
import emailService from "./email.service";
import {
  RegisterInput,
  LoginInput,
  VerifyOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UserRole,
  AccountStatus,
} from "../types";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from "../middlewares/error.middleware";

const userRepository = new UserRepository();

class AuthService {

  // ── REGISTER ─────────────────────────────────────────
  async register(input: RegisterInput) {
    const {
      firstName,
      lastName,
      email,
      password,
      nationality,
    } = input;

    const role = (input.role as UserRole) || UserRole.TOURIST;

    if (role === UserRole.ADMIN) {
      throw new BadRequestError("Invalid role");
    }

    const allowed = [
      UserRole.TOURIST,
      UserRole.GUIDE,
      UserRole.OPERATOR,
    ];
    if (!allowed.includes(role)) {
      throw new BadRequestError("Invalid role selected");
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError("Email is already registered");
    }

    const hashed = await hashPassword(password);
    const { otp, otpExpires } = generateOtp();

    const accountStatus =
      role === UserRole.TOURIST
        ? AccountStatus.APPROVED
        : AccountStatus.PENDING;

    await userRepository.create({
      firstName,
      lastName,
      email,
      password: hashed,
      role,
      nationality,
      accountStatus,
      isVerified: false,
      isActive: true,
      otp,
      otpExpires,
    });

    await emailService.sendVerificationEmail(
      email,
      firstName,
      otp
    );

    const message =
      role === UserRole.TOURIST
        ? "Registered successfully. Please check your email for OTP."
        : `Registered successfully. Verify your email. Your ${role} account needs admin approval.`;

    return { message };
  }

  // ── VERIFY OTP ────────────────────────────────────────
  async verifyOtp(input: VerifyOtpInput) {
    const { email, otp } = input;

    const user = await userRepository.findByEmailWithOtp(email);
    if (!user) throw new NotFoundError("User not found");

    if (user.isVerified) {
      throw new BadRequestError("Email already verified");
    }

    if (user.otp !== otp) {
      throw new BadRequestError("Invalid OTP");
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      throw new BadRequestError(
        "OTP expired. Please request a new one."
      );
    }

    // ✅ use .toString() not as string
    await userRepository.update(user._id.toString(), {
      isVerified: true,
      otp: undefined,
      otpExpires: undefined,
    });

    if (
      user.role === UserRole.GUIDE ||
      user.role === UserRole.OPERATOR
    ) {
      return {
        requiresApproval: true,
        accessToken: null,
        refreshToken: null,
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isVerified: true,
          accountStatus: user.accountStatus,
        },
        message:
          "Email verified. Your account is pending admin approval.",
      };
    }

    // ✅ use .toString() not as string
    const accessToken = generateAccessToken({
      id: user._id.toString(),
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
      role: user.role,
    });

    await userRepository.saveRefreshToken(
      user._id.toString(),
      refreshToken
    );

    return {
      requiresApproval: false,
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: true,
        accountStatus: user.accountStatus,
      },
      message: "Email verified successfully.",
    };
  }

  // ── LOGIN ─────────────────────────────────────────────
  async login(input: LoginInput) {
    const { email, password } = input;

    const user =
      await userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isMatch = await comparePassword(
      password,
      user.password
    );
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isVerified) {
      throw new BadRequestError(
        "Please verify your email first. Check your inbox."
      );
    }

    if (
      (user.role === UserRole.GUIDE ||
        user.role === UserRole.OPERATOR) &&
      user.accountStatus === AccountStatus.PENDING
    ) {
      throw new ForbiddenError(
        "Your account is pending admin approval."
      );
    }

    if (user.accountStatus === AccountStatus.REJECTED) {
      throw new ForbiddenError(
        "Your account was rejected. Contact support."
      );
    }

    if (
      !user.isActive ||
      user.accountStatus === AccountStatus.SUSPENDED
    ) {
      throw new ForbiddenError(
        "Your account is suspended. Contact support."
      );
    }

    // ✅ use .toString() not as string
    const accessToken = generateAccessToken({
      id: user._id.toString(),
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
      role: user.role,
    });

    await userRepository.saveRefreshToken(
      user._id.toString(),
      refreshToken
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        accountStatus: user.accountStatus,
        profileImage: user.profileImage,
      },
    };
  }

  // ── FORGOT PASSWORD ───────────────────────────────────
  async forgotPassword(input: ForgotPasswordInput) {
    const user = await userRepository.findByEmail(input.email);

    if (!user) {
      return {
        message:
          "If this email exists, a reset OTP has been sent.",
      };
    }

    const { otp, otpExpires } = generateOtp();
    await userRepository.saveOtp(input.email, otp, otpExpires);
    await emailService.sendPasswordResetEmail(
      input.email,
      user.firstName,
      otp
    );

    return { message: "Password reset OTP sent to your email." };
  }

  // ── RESET PASSWORD ────────────────────────────────────
  async resetPassword(input: ResetPasswordInput) {
    const { email, otp, newPassword } = input;

    const user = await userRepository.findByEmailWithOtp(email);
    if (!user) throw new NotFoundError("User not found");

    if (user.otp !== otp) {
      throw new BadRequestError("Invalid OTP");
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      throw new BadRequestError(
        "OTP expired. Please request a new one."
      );
    }

    const hashed = await hashPassword(newPassword);

    // ✅ use .toString() not as string
    await userRepository.update(user._id.toString(), {
      password: hashed,
      otp: undefined,
      otpExpires: undefined,
    });

    return { message: "Password reset successfully." };
  }

  // ── RESEND OTP ────────────────────────────────────────
  async resendOtp(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new NotFoundError("User not found");

    if (user.isVerified) {
      throw new BadRequestError("Email is already verified");
    }

    const { otp, otpExpires } = generateOtp();
    await userRepository.saveOtp(email, otp, otpExpires);
    await emailService.sendVerificationEmail(
      email,
      user.firstName,
      otp
    );

    return { message: "New OTP sent to your email." };
  }

  // ── LOGOUT ────────────────────────────────────────────
  async logout(userId: string) {
    await userRepository.clearRefreshToken(userId);
    return { message: "Logged out successfully." };
  }

  // ── GET ME ────────────────────────────────────────────
  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }
}

export default new AuthService();