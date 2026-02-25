import User from "../models/user.model";
import { ApiError } from "../utils/apiError";

export class UserService {
  async getUserById(userId: string) {
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return user;
  }
}
