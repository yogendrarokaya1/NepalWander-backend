import nodemailer from "nodemailer";
import { ENV } from "../config/env";

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: ENV.EMAIL_HOST,
      port: ENV.EMAIL_PORT,
      secure: false,
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASS,
      },
    });
  }

  async sendVerificationEmail(
    to: string,
    firstName: string,
    otp: string
  ): Promise<void> {
    await this.transporter.sendMail({
      from: `"NepalWander" <${ENV.EMAIL_USER}>`,
      to,
      subject: "Verify Your NepalWander Account",
      html: `
        <div style="font-family:sans-serif;max-width:520px;
                    margin:auto;padding:24px">
          <h2 style="color:#1D9E75">
            Welcome to NepalWander, ${firstName}!
          </h2>
          <p>Use the OTP below to verify your email:</p>
          <div style="background:#f5f5f5;padding:32px;
                      border-radius:8px;text-align:center;
                      margin:24px 0">
            <h1 style="color:#0D1B2A;letter-spacing:16px;
                       font-size:36px;margin:0">
              ${otp}
            </h1>
          </div>
          <p style="color:#888;font-size:12px">
            Valid for <strong>10 minutes</strong>.
            Do not share with anyone.
          </p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    otp: string
  ): Promise<void> {
    await this.transporter.sendMail({
      from: `"NepalWander" <${ENV.EMAIL_USER}>`,
      to,
      subject: "Reset Your NepalWander Password",
      html: `
        <div style="font-family:sans-serif;max-width:520px;
                    margin:auto;padding:24px">
          <h2 style="color:#1D9E75">Password Reset</h2>
          <p>Hi ${firstName}, use this OTP to reset your password:</p>
          <div style="background:#f5f5f5;padding:32px;
                      border-radius:8px;text-align:center;
                      margin:24px 0">
            <h1 style="color:#0D1B2A;letter-spacing:16px;
                       font-size:36px;margin:0">
              ${otp}
            </h1>
          </div>
          <p style="color:#888;font-size:12px">
            Expires in <strong>10 minutes</strong>.
          </p>
        </div>
      `,
    });
  }
}

export default new EmailService();