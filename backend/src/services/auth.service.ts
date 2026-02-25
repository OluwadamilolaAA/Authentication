import bcrypt from "bcrypt";
import User, { type IUser } from "../models/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token";
import { ApiError } from "../utils/apiError";

export class AuthService {
  private toSafeUser(user: IUser) {
    const { password: _pass, refreshToken: _rt, ...userWithoutSensitive } =
      user.toObject();
    return userWithoutSensitive;
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

  async registerUser(name: string, email: string, password: string) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw ApiError.conflict("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = this.issueTokens(user);
    await this.persistRefreshToken(user, refreshToken);

    return {
      accessToken,
      refreshTokenCookie: refreshToken,
      user: this.toSafeUser(user),
    };
  }

  async registerAdminUser(name: string, email: string, password: string) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw ApiError.conflict("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "admin",
    });

    const { accessToken, refreshToken } = this.issueTokens(user);
    await this.persistRefreshToken(user, refreshToken);

    return {
      accessToken,
      refreshTokenCookie: refreshToken,
      user: this.toSafeUser(user),
    };
  }

  async loginUser(email: string, password: string) {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
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

    const { accessToken, refreshToken: newRefreshToken } = this.issueTokens(user);
    await this.persistRefreshToken(user, newRefreshToken);

    return {
      accessToken,
      refreshTokenCookie: newRefreshToken,
      user: this.toSafeUser(user),
    };
  }

  async logoutUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    user.refreshToken = undefined;
    await user.save();

    return { message: "Logged out successfully" };
  }
}
