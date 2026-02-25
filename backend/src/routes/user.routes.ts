import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const userController = new UserController();

router.get("/me", authenticate, userController.getMe);
router.get("/:id", authenticate, userController.getUserById);

export default router;


