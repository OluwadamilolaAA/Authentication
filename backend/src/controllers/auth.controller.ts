import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      const user = await this.authService.registerUser(
        name,
        email,
        password
      );

      res.status(201).json({
        message: "User created successfully",
        user,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  registerAdmin = async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      const user = await this.authService.registerAdminUser(
        name,
        email,
        password
      );

      res.status(201).json({
        message: "Admin created successfully",
        user,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getAllUsers = async (req: Request, res: Response) => {
    try{
      const users = await this.authService.getAllUsers();
      res.status(200).json({
        message: "User fetched successfully",
        users
      })
    } catch(error: any){
      res.status(400).json({message: error.message});
    }
  }

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshTokenCookie, user } =
        await this.authService.loginUser(email, password);

      res.cookie("refreshToken", refreshTokenCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        message: "User logged in successfully",
        accessToken,
        user,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}
