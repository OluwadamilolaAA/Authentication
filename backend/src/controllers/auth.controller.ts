import { Request, Response, CookieOptions } from "express";
import passport from "passport";
import { AuthService } from "../services/auth.service";
import { sendEmail } from "../utils/sendEmail";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ApiError } from "../utils/apiError";
import type { IUser } from "../models/user.model";

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const { accessToken, refreshTokenCookie, user } =
      await this.authService.registerUser(name, email, password);

    res.cookie("refreshToken", refreshTokenCookie, refreshCookieOptions);

    try {
      await sendEmail({
        to: email,
        subject: "Welcome to Our App",
        html: `<h2>Welcome, ${name}!</h2><p>Your account was created successfully.</p>`,
      });
    } catch (error) {
      console.warn("Failed to send welcome email", error);
    }

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

    res.cookie("refreshToken", refreshTokenCookie, refreshCookieOptions);

    try {
      await sendEmail({
        to: email,
        subject: "Admin Account Created",
        html: `<h2>Welcome, ${name}!</h2><p>Your admin account has been created successfully.</p>`,
      });
    } catch (error) {
      console.warn("Failed to send admin welcome email", error);
    }

    res.status(201).json({
      message: "Admin created successfully",
      accessToken,
      user,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { accessToken, refreshTokenCookie, user } =
      await this.authService.loginUser(email, password);

    res.cookie("refreshToken", refreshTokenCookie, refreshCookieOptions);

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
    const { accessToken, refreshTokenCookie, user: safeUser } =
      await this.authService.loginWithGoogle(user);

    res.cookie("refreshToken", refreshTokenCookie, refreshCookieOptions);

    try {
      await sendEmail({
        to: safeUser.email,
        subject: "Google Login Successful",
        html: `<h2>Hello, ${safeUser.name}!</h2><p>You logged in using Google successfully.</p>`,
      });
    } catch (error) {
      console.warn("Failed to send Google login email", error);
    }

    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${accessToken}`);
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken as string | undefined;
    const { accessToken, refreshTokenCookie, user } =
      await this.authService.refreshAccessToken(refreshToken);

    res.cookie("refreshToken", refreshTokenCookie, refreshCookieOptions);

    res.json({
      message: "Token refreshed",
      accessToken,
      user,
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId =
      authReq.user && "id" in authReq.user ? authReq.user.id : undefined;
    if (!userId) {
      throw ApiError.unauthorized("Unauthorized");
    }

    await this.authService.logoutUser(userId);

    res.clearCookie("refreshToken", refreshCookieOptions);

    res.status(200).json({ message: "User logged out successfully" });
  });
}
