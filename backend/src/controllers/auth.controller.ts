import { Request, Response, CookieOptions } from "express";
import passport from "passport";
import { AuthService } from "../services/auth.service";
import { sendEmail } from "../utils/sendEmail";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import type { IUser } from "../models/user.model";
import { env } from "../config/env";

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "strict",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
  }

  private clearRefreshTokenCookie(res: Response) {
    const { maxAge: _maxAge, ...clearOptions } = refreshCookieOptions;
    res.clearCookie("refreshToken", clearOptions);
  }

  private async sendEmailSafely(options: {
    to: string;
    subject: string;
    html: string;
    warningMessage: string;
  }) {
    try {
      await sendEmail(options);
    } catch (error) {
      console.warn(options.warningMessage, error);
    }
  }

  private getOtpEmailTemplate(otp: string): string {
    return `
      <h2>Password Reset Request</h2>
      <p>Your OTP for password reset is:</p>
      <h1 style="color: #6366f1; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
      <p>This OTP will expire in 5 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;
  }

  register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const { accessToken, refreshTokenCookie, user } =
      await this.authService.registerUser(name, email, password);

    this.setRefreshTokenCookie(res, refreshTokenCookie);

    await this.sendEmailSafely({
      to: email,
      subject: "Welcome to Our App",
      html: `<h2>Welcome, ${name}!</h2><p>Your account was created successfully.</p>`,
      warningMessage: "Failed to send welcome email",
    });

    res.status(201).json({
      message: "User created successfully",
      accessToken,
      user,
    });
  });

  registerAdmin = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const { accessToken, refreshTokenCookie, user } =
      await this.authService.registerAdminUser(name, email, password);

    this.setRefreshTokenCookie(res, refreshTokenCookie);

    await this.sendEmailSafely({
      to: email,
      subject: "Admin Account Created",
      html: `<h2>Welcome, ${name}!</h2><p>Your admin account has been created successfully.</p>`,
      warningMessage: "Failed to send admin welcome email",
    });

    res.status(201).json({
      message: "Admin created successfully",
      accessToken,
      user,
    });
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    const result = await this.authService.verifyEmail(token);

    await this.sendEmailSafely({
      to: result.user.email,
      subject: "Email Verified",
      html: `<h2>Welcome ${result.user.name}!</h2><p>Your email has been successfully verified.</p>`,
      warningMessage: "Failed to send verification success email",
    });

    res.status(200).json(result);
  });

  resendVerificationEmail = asyncHandler(
    async (req: Request, res: Response) => {
      const { email } = req.body;

      if (!email) {
        throw ApiError.badRequest("Email is required");
      }
      const result = await this.authService.resendVerificationEmail(email);

      if (!("verificationToken" in result)) {
        return res.status(200).json({ message: result.message });
      }

      const clientUrl = env.frontendUrl;
      const verificationLink = `${clientUrl}/email-verify?token=${result.verificationToken}`;

      await sendEmail({
        to: email,
        subject: "Email Verification",
        html: `<h2>Hello!</h2><p>Please verify your email by clicking the link below:</p><a href="${verificationLink}">Verify Email</a>`,
      });

      return res.status(200).json({
        message: "Verification email sent successfully",
      });
    },
  );

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { accessToken, refreshTokenCookie, user } =
      await this.authService.loginUser(email, password);

    this.setRefreshTokenCookie(res, refreshTokenCookie);

    res.json({
      message: "User logged in successfully",
      accessToken,
      user,
    });
  });

  googleAuth = passport.authenticate("google", {
    scope: ["profile", "email"],
  });

  googleCallback = asyncHandler(async (req: Request, res: Response) => {
    const passportUser = req.user;
    if (!passportUser || !("email" in passportUser)) {
      throw ApiError.unauthorized("Unauthorized");
    }
    const user = passportUser as IUser;
    const {
      accessToken,
      refreshTokenCookie,
      user: safeUser,
    } = await this.authService.loginWithGoogle(user);

    this.setRefreshTokenCookie(res, refreshTokenCookie);

    await this.sendEmailSafely({
      to: safeUser.email,
      subject: "Google Login Successful",
      html: `<h2>Hello, ${safeUser.name}!</h2><p>You logged in using Google successfully.</p>`,
      warningMessage: "Failed to send Google login email",
    });

    res.redirect(`${env.clientUrl}/auth/success?token=${accessToken}`);
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken as string | undefined;
    const { accessToken, refreshTokenCookie, user } =
      await this.authService.refreshAccessToken(refreshToken);

    this.setRefreshTokenCookie(res, refreshTokenCookie);

    res.json({
      message: "Token refreshed",
      accessToken,
      user,
    });
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const otp = await this.authService.forgotPassword(email);

    await this.sendEmailSafely({
      to: email,
      subject: "Password Reset OTP",
      html: this.getOtpEmailTemplate(otp),
      warningMessage: "Failed to send password reset email",
    });

    res.status(200).json({ message: "OTP sent to email" });
  });

  resendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await this.authService.resendOtp(email);

    if (typeof result !== "string") {
      return res.status(200).json({ message: result.message });
    }

    await this.sendEmailSafely({
      to: email,
      subject: "Password Reset OTP",
      html: this.getOtpEmailTemplate(result),
      warningMessage: "Failed to send password reset email",
    });

    res.status(200).json({ message: "OTP sent to email" });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    await this.authService.resetPassword(email, otp, newPassword);
    res.status(200).json({ message: "Password reset successfully" });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken as string | undefined;

    if (!refreshToken) {
      this.clearRefreshTokenCookie(res);
      return res.status(200).json({ message: "Logged out successfully" });
    }

    await this.authService.logoutUser(refreshToken);

    this.clearRefreshTokenCookie(res);

    res.status(200).json({ message: "User logged out successfully" });
  });
}
