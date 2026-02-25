import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateDto } from "../middlewares/dto-validate.middleware";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import passport from "passport";

const router = Router();
const authController = new AuthController();

router.post("/register", validateDto(RegisterDto), authController.register);

router.post(
  "/register-admin",
  validateDto(RegisterDto),
  authController.registerAdmin
);

router.post("/login", validateDto(LoginDto), authController.login);

router.post("/refresh", authController.refresh);

router.get("/admin", authenticate, authorizeRoles("admin"), (_req, res) => {
  res.json({ message: "Welcome Admin" });
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  authController.googleCallback
);

router.post("/logout", authenticate, authController.logout);

export default router;
