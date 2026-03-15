import bcrypt from "bcrypt";
import User, { type IUser } from "../models/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token";
import { ApiError } from "../utils/apiError";
import crypto from "crypto";
import jwt from "jsonwebtoken";

type SafeUser = Omit<IUser, "password" | "refreshToken">;

export class AuthService {
  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toSafeUser(user: IUser): SafeUser {
    const {
      password: _pass,
      refreshToken: _rt,
      ...userWithoutSensitive
    } = user.toObject();
    return userWithoutSensitive as SafeUser;
  }

  private issueTokens(user: IUser) {
    const accessToken = generateAccessToken({
      id: user._id.toString(),
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
    });

    return { accessToken, refreshToken };
  }

  private async persistRefreshToken(user: IUser, refreshToken: string) {
    user.refreshToken = refreshToken;
    await user.save();
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async createUserWithRole(
    name: string,
    email: string,
    password: string,
    role: "user" | "admin" = "user",
  ) {
    const normalizedEmail = this.normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail });
    console.log("Checking email:", normalizedEmail);
    console.log("Existing user:", existingUser);
    if (existingUser) {
      throw ApiError.conflict("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    const { accessToken, refreshToken } = this.issueTokens(user);
    await this.persistRefreshToken(user, refreshToken);

    return {
      accessToken,
      refreshTokenCookie: refreshToken,
      user: this.toSafeUser(user),
    };
  }

  async registerUser(name: string, email: string, password: string) {
    return this.createUserWithRole(name, email, password, "user");
  }

  async registerAdminUser(name: string, email: string, password: string) {
    return this.createUserWithRole(name, email, password, "admin");
  }

  async verifyEmail(token: string) {
    if (!token) {
      throw ApiError.badRequest("Verification token is required");
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpireAt: { $gt: new Date() },
    });

    if (!user) {
      throw ApiError.badRequest("Invalid or expired verification token");
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpireAt = undefined;

    await user.save();

    const {
      password: _pass,
      refreshToken: _rt,
      ...userWithoutSensitive
    } = user.toObject();

    return {
      message: "Email verified successfully",
      user: userWithoutSensitive,
    };
  }

  async resendVerificationEmail(email: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return {
        message: "If this email exists, a verification email has been sent",
      };
    }

    if (user.isVerified) {
      return { message: "Email is already verified" };
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpireAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    return { verificationToken };
  }

  async loginUser(email: string, password: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized("Invalid credentials");
    }

    const { accessToken, refreshToken } = this.issueTokens(user);
    await this.persistRefreshToken(user, refreshToken);

    return {
      accessToken,
      refreshTokenCookie: refreshToken,
      user: this.toSafeUser(user),
    };
  }

  async loginWithGoogle(user: IUser) {
    const { accessToken, refreshToken } = this.issueTokens(user);
    await this.persistRefreshToken(user, refreshToken);

    return {
      accessToken,
      refreshTokenCookie: refreshToken,
      user: this.toSafeUser(user),
    };
  }

  async refreshAccessToken(refreshToken?: string) {
    if (!refreshToken) {
      throw ApiError.unauthorized("Missing refresh token");
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload || typeof payload !== "object" || !payload.id) {
      throw ApiError.unauthorized("Invalid refresh token");
    }

    const user = await User.findById(payload.id.toString());
    if (!user || user.refreshToken !== refreshToken) {
      throw ApiError.unauthorized("Invalid refresh token");
    }

    // Refresh-token rotation to reduce replay risk if an old token is leaked.
    const { accessToken, refreshToken: newRefreshToken } =
      this.issueTokens(user);
    await this.persistRefreshToken(user, newRefreshToken);

    return {
      accessToken,
      refreshTokenCookie: newRefreshToken,
      user: this.toSafeUser(user),
    };
  }

  async forgotPassword(email: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const otp = this.generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    user.resetOtp = hashedOtp;
    user.resetOtpExpireAt = new Date(Date.now() + 5 * 60 * 1000);
    user.resetOtpLastSentAt = new Date();

    await user.save();

    return otp;
  }

  async resendOtp(email: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return { message: "If this email exists, an OTP has been sent" };
    }

    if (
      user.resetOtpLastSentAt &&
      Date.now() - user.resetOtpLastSentAt.getTime() < 30 * 1000
    ) {
      throw ApiError.badRequest("Please wait before requesting another OTP");
    }

    const otp = this.generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.resetOtp = hashedOtp;
    user.resetOtpExpireAt = new Date(Date.now() + 5 * 60 * 1000);
    user.resetOtpLastSentAt = new Date();

    await user.save();

    return otp;
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (
      !user.resetOtp ||
      !user.resetOtpExpireAt ||
      user.resetOtpExpireAt < new Date()
    ) {
      throw ApiError.badRequest("Invalid or expired OTP");
    }

    const isOtpMatch = await bcrypt.compare(otp, user.resetOtp);
    if (!isOtpMatch) {
      throw ApiError.badRequest("Invalid or expired OTP");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = undefined;
    user.resetOtpExpireAt = undefined;

    await user.save();

    return { message: "Password reset successful" };
  }

  async logoutUser(refreshToken: string) {
    const decoded = jwt.decode(refreshToken) as { id?: string } | null;

    if (!decoded?.id) {
      return { message: "Logged out" };
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return { message: "Logged out" };
    }

    if (user.refreshToken === refreshToken) {
      user.refreshToken = undefined;
      await user.save();
    }

    return { message: "Logged out successfully" };
  }
}
