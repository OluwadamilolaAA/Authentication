import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateDto } from "../middlewares/dto-validate.middleware";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
  validateDto(RegisterDto),
  authController.register
);

router.post(
  "/register-admin",
  validateDto(RegisterDto),
  authController.registerAdmin
);

router.post(
  "/login",
  validateDto(LoginDto),
  authController.login
);

router.get(
  "/admin",
  authenticate,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({ message: "Welcome Admin" });
  }
);

export default router;
