import bcrypt from "bcrypt";
import User from "../models/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token";

export class AuthService {
  async registerUser(name: string, email: string, password: string) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const { password: _pass, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async registerAdminUser(name: string, email: string, password: string) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "admin",
    });

    const { password: _pass, refreshToken: _rt, ...userWithoutSensitive } =
      user.toObject();

    return userWithoutSensitive;
  }

  async loginUser(email: string, password: string) {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
    if (!user) {
      throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
    });

    user.refreshToken = refreshToken;
    await user.save();

    const { password: _pass, refreshToken: _rt, ...userWithoutSensitive } =
      user.toObject();

    return {
      accessToken,
      refreshTokenCookie: refreshToken,
      user: userWithoutSensitive,
    };
  }
}
