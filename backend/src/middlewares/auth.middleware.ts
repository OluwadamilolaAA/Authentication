import type { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiError } from "../utils/apiError";
import type { IUser } from "../models/user.model";
import { env } from "../config/env";

export interface JwtUser {
  id: string;
  role: "user" | "admin";
}

export interface AuthRequest extends Request {
  user?: JwtUser | IUser;
}

export const authenticate: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const [scheme, token] = authHeader?.split(" ") ?? [];

  if (!token || scheme !== "Bearer") {
    return next(ApiError.unauthorized("No token provided"));
  }

  try {
    const decoded = jwt.verify(
      token,
      env.jwtAccessSecret,
    ) as JwtPayload;

    if (!decoded || typeof decoded !== "object" || !decoded.id || !decoded.role) {
      return next(ApiError.unauthorized("Invalid token"));
    }

    (req as AuthRequest).user = {
      id: String(decoded.id),
      role: decoded.role as "user" | "admin",
    };

    next();
  } catch {
    return next(ApiError.unauthorized("Invalid token"));
  }
};
