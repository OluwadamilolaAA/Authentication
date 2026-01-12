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



export default router;