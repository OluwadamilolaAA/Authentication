import { Router } from "express";
import rateLimiter from "express-rate-limit";
import { AuthController } from "../controllers/auth.controller";
import { validateDto } from "../middlewares/dto-validate.middleware";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import passport from "passport";

const router = Router();
const authController = new AuthController();

const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many auth requests. Please try again later.",
  },
});

router.post(
  "/register",
  authLimiter,
  validateDto(RegisterDto),
  authController.register
);

router.post(
  "/register-admin",
  authLimiter,
  validateDto(RegisterDto),
  authController.registerAdmin
);

router.post(
  "/login",
  authLimiter,
  validateDto(LoginDto),
  authController.login
);

router.post("/refresh", authLimiter, authController.refresh);

router.get(
  "/admin",
  authenticate,
  authorizeRoles("admin"),
  (_req, res) => {
    res.json({ message: "Welcome Admin" });
  }
);

router.post("/verify-email", authLimiter, authController.verifyEmail);

router.post(
  "/resend-verification",
  authLimiter,
  authController.resendVerificationEmail
);

router.get("/google", authController.googleAuth);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  authController.googleCallback
);

router.post("/forgot-password", authLimiter, authController.forgotPassword);

router.post("/resend-otp", authLimiter, authController.resendOtp);

router.post("/reset-password", authLimiter, authController.resetPassword);

router.post("/logout", authController.logout);

export default router;
