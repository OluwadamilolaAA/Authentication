import type { JwtUser } from "../middlewares/auth.middleware";
import type { IUser } from "../models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser | IUser;
    }
  }
}

export {};
