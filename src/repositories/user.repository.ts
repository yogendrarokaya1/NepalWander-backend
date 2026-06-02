import { UserModel, UserDocument } from "../models/User.model";
import { IUser } from "../types";

export class UserRepository {

  async create(data: Partial<IUser>): Promise<UserDocument> {
    return UserModel.create(data);
  }

  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email });
  }

  async findByEmailWithPassword(
    email: string
  ): Promise<UserDocument | null> {
    return UserModel.findOne({ email }).select(
      "+password +refreshToken"
    );
  }

  async findByEmailWithOtp(
    email: string
  ): Promise<UserDocument | null> {
    return UserModel.findOne({ email }).select(
      "+otp +otpExpires +password"
    );
  }

  async update(
    id: string,
    data: Partial<IUser>
  ): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(id, data, { new: true });
  }

  async saveOtp(
    email: string,
    otp: string,
    otpExpires: Date
  ): Promise<void> {
    await UserModel.findOneAndUpdate(
      { email },
      { otp, otpExpires }
    );
  }

  async saveRefreshToken(
    id: string,
    token: string
  ): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { refreshToken: token });
  }

  async clearRefreshToken(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, {
      refreshToken: undefined,
    });
  }

  async findAll(): Promise<UserDocument[]> {
    return UserModel.find().sort({ createdAt: -1 });
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }
}