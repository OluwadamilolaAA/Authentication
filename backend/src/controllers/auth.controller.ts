import { Request, Response } from "express";

import { registerUser, loginUser, registerAdminUser } from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const user = await registerUser(name, email, password);
    res.status(201).json({
      message: "User created successfully",
      user 
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message }); 
  }
};

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const user = await registerAdminUser(name, email, password);
    res.status(201).json({
      message: "Admin created successfully",
      user
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshTokenCookie, user } = await loginUser(email, password);

    res.cookie("refreshToken", refreshTokenCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.json({
      message: "User logged in successfully",
      accessToken,
      user
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
