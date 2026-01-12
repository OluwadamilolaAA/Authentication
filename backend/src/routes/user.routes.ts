import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import router from "./auth.routes";

const authController = new AuthController();

router.get(
  "/users",
  authenticate,
  authorizeRoles("admin"),
  authController.getAllUsers  
);

router.get(
  "/users/:id",
  authenticate,
  authorizeRoles("admin"),
  authController.getUserById
)



export default router;