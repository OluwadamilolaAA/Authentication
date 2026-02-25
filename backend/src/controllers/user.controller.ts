import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ApiError } from "../utils/apiError";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const user = await this.userService.getUserById(userId);
    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  });

  getMe = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    if (!authReq.user || !("id" in authReq.user)) {
      throw ApiError.unauthorized("Unauthorized");
    }
    const user = await this.userService.getUserById(authReq.user.id);
    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  });
}
